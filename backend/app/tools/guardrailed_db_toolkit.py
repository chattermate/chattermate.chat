"""
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Guardrailed database tools for the ticket investigation agent. One toolkit
instance covers all of an organization's enabled DB connectors — each tool
takes the connector name as its first argument.

Layered guarantees (all enforced outside the model):
1. sql_guardrails AST validation (SELECT-only, table allowlist, masked-column
   references blocked, forced LIMIT, canonical re-render)
2. read-only database session + statement timeout (db_connector_service)
3. result-side column masking
4. every attempt — allowed, blocked or errored — lands in
   db_connector_audit_logs (never the result rows)
"""

import asyncio
import time
from typing import List, Optional
from uuid import UUID

from agno.tools import Toolkit

from app.core.logger import get_logger
from app.database import SessionLocal
from app.models.ticket_db_connector import DBConnectorAuditLog, DBConnectorAuditOutcome
from app.services import db_connector_service
from app.services.db_connector_service import DBConnectorConfig
from app.services.sql_guardrails import mask_rows, validate_sql

logger = get_logger(__name__)

MAX_RESULT_CHARS = 4000


class GuardrailedDBTools(Toolkit):
    """Read-only, allowlisted SQL access for AI investigations."""

    def __init__(
        self,
        configs: List[DBConnectorConfig],
        ticket_id: Optional[UUID] = None,
        run_id: Optional[UUID] = None,
    ):
        super().__init__(name="guardrailed_database")
        self.configs = {c.name: c for c in configs}
        self.ticket_id = ticket_id
        self.run_id = run_id
        # Evidence attribution for the investigation glass box.
        self._connector_name = "Database"
        self.register(self.list_database_tables)
        self.register(self.describe_database_table)
        self.register(self.query_database)

    def _config(self, connector: str) -> Optional[DBConnectorConfig]:
        if connector in self.configs:
            return self.configs[connector]
        # Tolerate case/whitespace slips from the model.
        wanted = (connector or "").strip().lower()
        for name, config in self.configs.items():
            if name.strip().lower() == wanted:
                return config
        return None

    def _unknown(self, connector: str) -> str:
        return (
            f"Unknown database connector '{connector}'. "
            f"Available: {', '.join(self.configs) or 'none'}"
        )

    def _audit(
        self,
        config: DBConnectorConfig,
        raw_sql: str,
        outcome: str,
        validated_sql: Optional[str] = None,
        block_reason: Optional[str] = None,
        row_count: Optional[int] = None,
        duration_ms: Optional[int] = None,
    ) -> None:
        try:
            with SessionLocal() as db:
                db.add(
                    DBConnectorAuditLog(
                        connector_id=config.id,
                        organization_id=config.organization_id,
                        ticket_id=self.ticket_id,
                        run_id=self.run_id,
                        raw_sql=raw_sql[:10000],
                        validated_sql=validated_sql,
                        outcome=outcome,
                        block_reason=block_reason,
                        row_count=row_count,
                        duration_ms=duration_ms,
                    )
                )
                db.commit()
        except Exception as e:
            logger.error(f"DB connector audit write failed: {e}")

    async def list_database_tables(self) -> str:
        """List the database connectors you may query and the tables each one
        allows. Access is read-only; only these tables are queryable."""
        if not self.configs:
            return "No database connectors are configured."
        lines = []
        for config in self.configs.values():
            tables = ", ".join(config.allowed_tables or []) or "(no tables allowlisted)"
            lines.append(f"{config.name} [{config.engine}]: {tables}")
        return "\n".join(lines)

    async def describe_database_table(self, connector: str, table: str) -> str:
        """Get the columns and types of an allowlisted table.

        Args:
            connector: The connector name from list_database_tables.
            table: Table name, optionally schema-qualified (schema.table).
        """
        config = self._config(connector)
        if config is None:
            return self._unknown(connector)
        allowed = {t.strip().lower() for t in config.allowed_tables or []}
        wanted = (table or "").strip().lower()
        match = next(
            (t for t in allowed if t == wanted or t.endswith(f".{wanted}")), None
        )
        if match is None:
            return f"Table '{table}' is not on this connector's allowlist."
        schema, _, name = match.rpartition(".")
        schema = schema or ("public" if config.engine != "mysql" else config.database)
        try:
            columns = await asyncio.to_thread(
                db_connector_service.describe_columns, config, schema, name
            )
        except Exception as e:
            return f"Failed to describe table: {e}"
        masked = {c.strip().lower() for c in config.masked_columns or []}
        lines = [
            f"- {col['name']} ({col['type']})"
            + (" [MASKED — cannot be queried]" if col["name"].lower() in masked else "")
            for col in columns
        ]
        return f"Columns of {match}:\n" + "\n".join(lines)

    async def query_database(self, connector: str, sql: str) -> str:
        """Run a read-only SQL SELECT against an allowlisted database.

        Only single SELECT statements over allowlisted tables are permitted —
        writes are impossible. Results are row-limited and masked columns are
        redacted. Prefer precise WHERE clauses over broad scans.

        Args:
            connector: The connector name from list_database_tables.
            sql: One SELECT statement.
        """
        config = self._config(connector)
        if config is None:
            return self._unknown(connector)

        verdict = validate_sql(
            sql,
            config.allowed_tables,
            config.max_rows,
            engine=config.engine,
            masked_columns=config.masked_columns,
        )
        if not verdict.ok:
            self._audit(
                config, sql, DBConnectorAuditOutcome.BLOCKED.value,
                block_reason=verdict.reason,
            )
            return f"Query blocked by guardrails: {verdict.reason}"

        started = time.monotonic()
        try:
            columns, rows = await asyncio.to_thread(
                db_connector_service.run_readonly_query, config, verdict.sql
            )
        except Exception as e:
            duration_ms = int((time.monotonic() - started) * 1000)
            self._audit(
                config, sql, DBConnectorAuditOutcome.ERROR.value,
                validated_sql=verdict.sql, block_reason=str(e)[:2000],
                duration_ms=duration_ms,
            )
            return f"Query failed: {e}"

        duration_ms = int((time.monotonic() - started) * 1000)
        rows = mask_rows(columns, rows, config.masked_columns)
        self._audit(
            config, sql, DBConnectorAuditOutcome.ALLOWED.value,
            validated_sql=verdict.sql, row_count=len(rows), duration_ms=duration_ms,
        )
        return db_connector_service.format_result_table(
            columns, rows, config.max_rows
        )[:MAX_RESULT_CHARS]

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

Execution layer for guardrailed ticket DB connectors. All functions here are
synchronous (drivers are sync) — callers run them via asyncio.to_thread.

The read-only guarantee is enforced at the SESSION level, independently of
the SQL guardrails: default_transaction_read_only for Postgres, SESSION
TRANSACTION READ ONLY for MySQL, plus statement timeouts on both.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from uuid import UUID

from app.core.logger import get_logger
from app.core.security import decrypt_api_key

logger = get_logger(__name__)

CONNECT_TIMEOUT_SECONDS = 8
# Schemas that are never discovered or queried.
SYSTEM_SCHEMAS = (
    "pg_catalog", "information_schema", "pg_toast",
    "mysql", "performance_schema", "sys",
)


@dataclass
class DBConnectorConfig:
    """Plain snapshot of a TicketDBConnector row (password decrypted) so the
    executor never holds ORM objects across sessions/threads."""
    id: Optional[UUID]
    organization_id: Optional[UUID]
    name: str
    engine: str
    host: str
    port: int
    database: str
    username: str
    password: str
    allowed_tables: List[str] = field(default_factory=list)
    masked_columns: List[str] = field(default_factory=list)
    max_rows: int = 100
    statement_timeout_ms: int = 5000

    @classmethod
    def from_model(cls, connector) -> "DBConnectorConfig":
        return cls(
            id=connector.id,
            organization_id=connector.organization_id,
            name=connector.name,
            engine=str(connector.engine),
            host=connector.host,
            port=connector.port,
            database=connector.database,
            username=connector.username,
            password=decrypt_api_key(connector.encrypted_password),
            allowed_tables=list(connector.allowed_tables or []),
            masked_columns=list(connector.masked_columns or []),
            max_rows=connector.max_rows or 100,
            statement_timeout_ms=connector.statement_timeout_ms or 5000,
        )


def _connect(config: DBConnectorConfig):
    """Open a read-only session with a statement timeout."""
    if config.engine == "mysql":
        import pymysql
        conn = pymysql.connect(
            host=config.host,
            port=config.port,
            user=config.username,
            password=config.password,
            database=config.database,
            connect_timeout=CONNECT_TIMEOUT_SECONDS,
            read_timeout=max(1, config.statement_timeout_ms // 1000 + 1),
        )
        with conn.cursor() as cursor:
            cursor.execute("SET SESSION TRANSACTION READ ONLY")
            # max_execution_time bounds SELECTs server-side (milliseconds).
            cursor.execute(f"SET SESSION max_execution_time = {int(config.statement_timeout_ms)}")
        return conn
    import psycopg
    return psycopg.connect(
        host=config.host,
        port=config.port,
        dbname=config.database,
        user=config.username,
        password=config.password,
        connect_timeout=CONNECT_TIMEOUT_SECONDS,
        options=(
            f"-c statement_timeout={int(config.statement_timeout_ms)} "
            "-c default_transaction_read_only=on"
        ),
    )


def run_readonly_query(
    config: DBConnectorConfig, sql: str
) -> Tuple[List[str], List[tuple]]:
    """Execute validated SQL in a read-only session; fetches at most
    max_rows + 1 (the validator already forced a LIMIT — this is belt and
    braces)."""
    conn = _connect(config)
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql)
            columns = [d[0] for d in (cursor.description or [])]
            rows = cursor.fetchmany(config.max_rows + 1)
        return columns, list(rows)
    finally:
        try:
            conn.close()
        except Exception:
            pass


def test_connection(config: DBConnectorConfig) -> Dict:
    """Connect and discover user tables + columns (for the allowlist picker).
    Returns {"tables": [{"schema", "table", "columns": [{"name", "type"}]}]}."""
    placeholders = ", ".join(["%s"] * len(SYSTEM_SCHEMAS))
    sql = (
        "SELECT table_schema, table_name, column_name, data_type "
        "FROM information_schema.columns "
        f"WHERE table_schema NOT IN ({placeholders}) "
        "ORDER BY table_schema, table_name, ordinal_position"
    )
    conn = _connect(config)
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql, SYSTEM_SCHEMAS)
            rows = cursor.fetchall()
    finally:
        try:
            conn.close()
        except Exception:
            pass

    tables: Dict[Tuple[str, str], List[Dict]] = {}
    for schema, table, column, data_type in rows:
        tables.setdefault((schema, table), []).append({"name": column, "type": data_type})
    return {
        "tables": [
            {"schema": schema, "table": table, "columns": columns}
            for (schema, table), columns in tables.items()
        ]
    }


def describe_columns(config: DBConnectorConfig, schema: str, table: str) -> List[Dict]:
    """Column names/types of one table via information_schema."""
    conn = _connect(config)
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT column_name, data_type FROM information_schema.columns "
                "WHERE table_schema = %s AND table_name = %s ORDER BY ordinal_position",
                (schema, table),
            )
            return [{"name": name, "type": data_type} for name, data_type in cursor.fetchall()]
    finally:
        try:
            conn.close()
        except Exception:
            pass


def format_result_table(
    columns: List[str], rows: List[tuple], max_rows: int, max_value_chars: int = 200
) -> str:
    """Compact text rendering of a result set for the model."""
    if not columns:
        return "(no result)"
    shown = rows[:max_rows]
    lines = [" | ".join(columns)]
    for row in shown:
        lines.append(
            " | ".join(
                (str(value)[:max_value_chars] if value is not None else "NULL")
                for value in row
            )
        )
    suffix = f"({len(shown)} row{'s' if len(shown) != 1 else ''}"
    if len(rows) > max_rows:
        suffix += ", truncated"
    suffix += ")"
    lines.append(suffix)
    return "\n".join(lines)

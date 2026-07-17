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
"""

import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import expression, func

from app.database import Base
from app.models.ticket import _ValueStrEnum


class DBConnectorEngine(_ValueStrEnum):
    POSTGRESQL = "postgresql"
    MYSQL = "mysql"


class TicketDBConnector(Base):
    """A guardrailed, read-only database connection the ticket investigation
    agent may query. Guardrails are structural, enforced outside the model:
    SELECT-only AST validation against allowed_tables, forced row limits,
    column masking, read-only transaction + statement timeout, full audit.
    """
    __tablename__ = "ticket_db_connectors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(200), nullable=False)
    engine = Column(String, nullable=False, default=DBConnectorEngine.POSTGRESQL)
    host = Column(String(500), nullable=False)
    port = Column(Integer, nullable=False, default=5432)
    database = Column(String(200), nullable=False)
    username = Column(String(200), nullable=False)
    # Encrypted with app.core.security.encrypt_api_key — never stored plain.
    encrypted_password = Column(Text, nullable=False)

    enabled = Column(Boolean, nullable=False, default=True, server_default=expression.true())
    # ["schema.table", ...] — nothing is queryable unless listed here.
    allowed_tables = Column(JSON, nullable=True)
    # ["email", "phone", ...] — masked before the AI ever sees them; the AST
    # validator also rejects any query referencing them.
    masked_columns = Column(JSON, nullable=True)
    max_rows = Column(Integer, nullable=False, default=100, server_default="100")
    statement_timeout_ms = Column(Integer, nullable=False, default=5000, server_default="5000")

    last_test_at = Column(DateTime(timezone=True), nullable=True)
    last_test_ok = Column(Boolean, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    organization = relationship("Organization")


class DBConnectorAuditOutcome(_ValueStrEnum):
    ALLOWED = "allowed"
    BLOCKED = "blocked"
    ERROR = "error"


class DBConnectorAuditLog(Base):
    """Append-only audit of every query the AI attempted against a
    connector: the raw model SQL, what actually executed (canonical form),
    and the outcome. Result rows are never stored."""
    __tablename__ = "db_connector_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    connector_id = Column(
        UUID(as_uuid=True),
        ForeignKey("ticket_db_connectors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    ticket_id = Column(
        UUID(as_uuid=True), ForeignKey("tickets.id", ondelete="SET NULL"), nullable=True
    )
    run_id = Column(
        UUID(as_uuid=True),
        ForeignKey("investigation_runs.id", ondelete="SET NULL"),
        nullable=True,
    )
    raw_sql = Column(Text, nullable=False)
    validated_sql = Column(Text, nullable=True)
    outcome = Column(String, nullable=False)
    block_reason = Column(Text, nullable=True)
    row_count = Column(Integer, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_db_connector_audit_logs_created", "organization_id", "created_at"),
    )

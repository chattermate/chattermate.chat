"""Row-level scoping for the ticket DB connector

Revision ID: add_tkt_row_scope_001
Revises: a1dbf557bbb0
Create Date: 2026-07-20

Adds the per-table customer-column map that restricts a connector's queries to
the ticket customer's own rows, and which customer value fills the predicate.
Existing connectors get NULL/'email' — no scoping until an org configures it,
so behaviour is unchanged on upgrade.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON

revision = "add_tkt_row_scope_001"
down_revision = "a1dbf557bbb0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "ticket_db_connectors",
        sa.Column("row_scope", JSON(), nullable=True),
    )
    op.add_column(
        "ticket_db_connectors",
        sa.Column(
            "row_scope_key",
            sa.String(length=20),
            nullable=False,
            server_default="email",
        ),
    )


def downgrade() -> None:
    op.drop_column("ticket_db_connectors", "row_scope_key")
    op.drop_column("ticket_db_connectors", "row_scope")

"""CSAT score linkage on tickets

Revision ID: add_tkt_csat_001
Revises: add_tkt_row_scope_001
Create Date: 2026-07-22

The CSAT ask already goes out on close; nothing carried the answer back. These
columns close the loop: when the customer rates the conversation linked to a
ticket, the score lands on the ticket itself, so AI-resolved vs human-resolved
CSAT is a plain query instead of a join through ratings/sessions.
"""
from alembic import op
import sqlalchemy as sa

revision = "add_tkt_csat_001"
down_revision = "add_tkt_row_scope_001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("tickets", sa.Column("csat_requested_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("tickets", sa.Column("csat_score", sa.Integer(), nullable=True))
    op.add_column("tickets", sa.Column("csat_rating_id", sa.UUID(), nullable=True))
    op.add_column("tickets", sa.Column("csat_responded_at", sa.DateTime(timezone=True), nullable=True))
    op.create_foreign_key(
        "fk_tickets_csat_rating_id",
        "tickets",
        "ratings",
        ["csat_rating_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index("ix_tickets_org_csat", "tickets", ["organization_id", "csat_responded_at"])


def downgrade() -> None:
    op.drop_index("ix_tickets_org_csat", table_name="tickets")
    op.drop_constraint("fk_tickets_csat_rating_id", "tickets", type_="foreignkey")
    op.drop_column("tickets", "csat_responded_at")
    op.drop_column("tickets", "csat_rating_id")
    op.drop_column("tickets", "csat_score")
    op.drop_column("tickets", "csat_requested_at")

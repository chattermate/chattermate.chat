"""Add metered flag to investigation_runs

Revision ID: add_tkt_metered_001
Revises: add_tkt_row_scope_001
Create Date: 2026-07-21

Marks whether an investigation run's LLM usage counts against the org's message
budget (hosted model only). Existing rows default to false — nothing is
retroactively metered on upgrade.
"""
from alembic import op
import sqlalchemy as sa

revision = "add_tkt_metered_001"
down_revision = "add_tkt_row_scope_001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "investigation_runs",
        sa.Column(
            "metered",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    # The enterprise message-limit check sums llm_calls of metered runs per
    # billing window — an index on (org, metered, created_at) keeps that cheap.
    op.create_index(
        "ix_investigation_runs_metered_period",
        "investigation_runs",
        ["organization_id", "metered", "created_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_investigation_runs_metered_period", table_name="investigation_runs")
    op.drop_column("investigation_runs", "metered")

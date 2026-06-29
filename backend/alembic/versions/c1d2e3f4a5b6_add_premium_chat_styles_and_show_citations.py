"""add premium chat styles and show_citations to agent_customizations

Adds the new GLASS/TERMINAL/PLAYFUL/CALM_MINT values to the `chatstyle` enum and a
`show_citations` boolean column.

Revision ID: c1d2e3f4a5b6
Revises: add_sentiment_analysis_001
Create Date: 2026-06-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1d2e3f4a5b6'
down_revision: Union[str, None] = 'add_sentiment_analysis_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


NEW_CHAT_STYLES = ("GLASS", "TERMINAL", "PLAYFUL", "CALM_MINT")


def upgrade() -> None:
    bind = op.get_bind()

    # Add new values to the native Postgres `chatstyle` enum. ALTER TYPE ... ADD VALUE
    # cannot run inside a transaction block, so use an autocommit block.
    if bind.dialect.name == "postgresql":
        with op.get_context().autocommit_block():
            for value in NEW_CHAT_STYLES:
                op.execute(f"ALTER TYPE chatstyle ADD VALUE IF NOT EXISTS '{value}'")

    # Add show_citations column (default on). Use IF NOT EXISTS on Postgres so the
    # migration is safe to run on a DB where the column was already added out-of-band.
    if bind.dialect.name == "postgresql":
        op.execute(
            "ALTER TABLE agent_customizations "
            "ADD COLUMN IF NOT EXISTS show_citations boolean NOT NULL DEFAULT true"
        )
    else:
        op.add_column(
            'agent_customizations',
            sa.Column('show_citations', sa.Boolean(), server_default=sa.true(), nullable=False),
        )


def downgrade() -> None:
    op.drop_column('agent_customizations', 'show_citations')
    # Postgres cannot cleanly drop individual enum values; the added chatstyle
    # values are intentionally left in place.

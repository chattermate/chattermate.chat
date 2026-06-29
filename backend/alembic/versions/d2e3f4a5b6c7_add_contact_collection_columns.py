"""add contact-collection columns (collect_email + handoff_collect_email/name)

Adds:
  - agent_customizations.collect_email (default false)  -> optional pre-chat email gate
  - agents.handoff_collect_email (default true)         -> ask email on human handoff
  - agents.handoff_collect_name (default true)          -> ask name on human handoff

Revision ID: d2e3f4a5b6c7
Revises: c1d2e3f4a5b6
Create Date: 2026-06-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd2e3f4a5b6c7'
down_revision: Union[str, None] = 'c1d2e3f4a5b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        # IF NOT EXISTS so the migration is safe on a DB where columns were added out-of-band
        op.execute(
            "ALTER TABLE agent_customizations "
            "ADD COLUMN IF NOT EXISTS collect_email boolean NOT NULL DEFAULT false"
        )
        op.execute(
            "ALTER TABLE agents "
            "ADD COLUMN IF NOT EXISTS handoff_collect_email boolean NOT NULL DEFAULT true"
        )
        op.execute(
            "ALTER TABLE agents "
            "ADD COLUMN IF NOT EXISTS handoff_collect_name boolean NOT NULL DEFAULT true"
        )
    else:
        op.add_column('agent_customizations', sa.Column('collect_email', sa.Boolean(), server_default=sa.false(), nullable=False))
        op.add_column('agents', sa.Column('handoff_collect_email', sa.Boolean(), server_default=sa.true(), nullable=False))
        op.add_column('agents', sa.Column('handoff_collect_name', sa.Boolean(), server_default=sa.true(), nullable=False))


def downgrade() -> None:
    op.drop_column('agents', 'handoff_collect_name')
    op.drop_column('agents', 'handoff_collect_email')
    op.drop_column('agent_customizations', 'collect_email')

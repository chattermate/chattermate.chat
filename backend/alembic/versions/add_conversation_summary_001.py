"""add conversation summary fields to session_to_agents

Revision ID: add_conversation_summary_001
Revises: 2381319791e8
Create Date: 2026-03-17 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_conversation_summary_001'
down_revision: Union[str, None] = '2381319791e8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('session_to_agents', sa.Column('summary', sa.Text(), nullable=True))
    op.add_column('session_to_agents', sa.Column('summary_updated_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('session_to_agents', sa.Column('summary_message_count', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('session_to_agents', 'summary_message_count')
    op.drop_column('session_to_agents', 'summary_updated_at')
    op.drop_column('session_to_agents', 'summary')

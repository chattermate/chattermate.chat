"""A note can be written by the AI agent

conversation_notes.agent_id: the agent that wrote the note, about something it
did that the customer approved (an installed extension's action). Shown as the
agent's name in the inbox, where a note with no author read as "A teammate".

Revision ID: note_agent_author_001
Revises: order_permissions_001
Create Date: 2026-11-16
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = 'note_agent_author_001'
down_revision: Union[str, None] = 'order_permissions_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('conversation_notes', sa.Column(
        'agent_id', postgresql.UUID(as_uuid=True),
        sa.ForeignKey('agents.id', ondelete='SET NULL', name='fk_conversation_notes_agent_id'), nullable=True))


def downgrade() -> None:
    op.drop_constraint('fk_conversation_notes_agent_id', 'conversation_notes', type_='foreignkey')
    op.drop_column('conversation_notes', 'agent_id')

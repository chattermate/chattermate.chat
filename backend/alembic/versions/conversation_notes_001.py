"""Team notes on a conversation, @-mentions in them, and snooze

- conversation_notes: what the team writes about a conversation. A table of
  its own rather than chat_history rows, so no path that reads the
  conversation for the customer or the model can pick a note up.
- conversation_note_mentions: who a note mentions (their Mentions view).
- session_to_agents.snoozed_until: hidden from the inbox's views until then,
  or until the customer writes again.

Revision ID: conversation_notes_001
Revises: inbox_handover_times_001
Create Date: 2026-11-13
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# Keep revision ids under 32 characters: alembic_version.version_num is varchar(32).
revision: str = 'conversation_notes_001'
down_revision: Union[str, None] = 'inbox_handover_times_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'conversation_notes',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('session_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('session_to_agents.session_id', ondelete='CASCADE'), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_conversation_notes_session_id', 'conversation_notes', ['session_id'])
    op.create_table(
        'conversation_note_mentions',
        sa.Column('note_id', sa.Integer(), sa.ForeignKey('conversation_notes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.PrimaryKeyConstraint('note_id', 'user_id'),
    )
    op.create_index('ix_conversation_note_mentions_user_id', 'conversation_note_mentions', ['user_id'])
    op.add_column('session_to_agents', sa.Column('snoozed_until', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('session_to_agents', 'snoozed_until')
    op.drop_index('ix_conversation_note_mentions_user_id', table_name='conversation_note_mentions')
    op.drop_table('conversation_note_mentions')
    op.drop_index('ix_conversation_notes_session_id', table_name='conversation_notes')
    op.drop_table('conversation_notes')

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

OPEN_INDEX = 'ix_session_to_agents_org_not_closed'


def _is_invalid(name: str) -> bool:
    """A concurrent build that failed leaves an invalid index behind (see org_lookup_indexes_001)."""
    return bool(op.get_bind().execute(
        sa.text("SELECT NOT indisvalid FROM pg_index WHERE indexrelid = to_regclass(:name)"),
        {'name': name},
    ).scalar())


def upgrade() -> None:
    # session_to_agents is written on every message: give up rather than queue them
    # all behind this ALTER if a long transaction holds the table (re-run the deploy)
    op.execute("SET LOCAL lock_timeout = '5s'")
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
    # The inbox counts (polled) read an org's not-closed sessions: widget page
    # loads that never close pile up there, so find them without the closed ones
    with op.get_context().autocommit_block():
        if _is_invalid(OPEN_INDEX):
            op.drop_index(OPEN_INDEX, table_name='session_to_agents', postgresql_concurrently=True, if_exists=True)
        op.create_index(OPEN_INDEX, 'session_to_agents', ['organization_id'], unique=False,
                        postgresql_concurrently=True, if_not_exists=True,
                        postgresql_where=sa.text("status <> 'CLOSED'"))


def downgrade() -> None:
    with op.get_context().autocommit_block():
        op.drop_index(OPEN_INDEX, table_name='session_to_agents', postgresql_concurrently=True, if_exists=True)
    op.drop_column('session_to_agents', 'snoozed_until')
    op.drop_index('ix_conversation_note_mentions_user_id', table_name='conversation_note_mentions')
    op.drop_table('conversation_note_mentions')
    op.drop_index('ix_conversation_notes_session_id', table_name='conversation_notes')
    op.drop_table('conversation_notes')

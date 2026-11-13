"""Conversation titles for the widget's history

Each widget conversation can get a short AI-written title once it closes
(app/services/conversation_titles.py). The title is encrypted at rest like the
messages it is written from. titled_at records that a conversation was looked
at, titled or not, so the titling worker never takes it twice.

The worker looks for untitled conversations by updated_at every few minutes;
a partial index keeps that from reading the whole table. Built CONCURRENTLY so
the table keeps taking writes (see org_lookup_indexes_001).

Revision ID: conversation_titles_001
Revises: org_lookup_indexes_001
Create Date: 2026-11-12
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# Keep revision ids under 32 characters: alembic_version.version_num is varchar(32).
revision: str = 'conversation_titles_001'
down_revision: Union[str, None] = 'org_lookup_indexes_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


INDEX = 'ix_session_to_agents_untitled'


def _is_invalid(name: str) -> bool:
    return bool(op.get_bind().execute(
        sa.text("SELECT NOT indisvalid FROM pg_index WHERE indexrelid = to_regclass(:name)"),
        {'name': name},
    ).scalar())


def upgrade() -> None:
    op.add_column('session_to_agents', sa.Column('title', sa.Text(), nullable=True))
    op.add_column('session_to_agents', sa.Column('titled_at', sa.DateTime(timezone=True), nullable=True))
    with op.get_context().autocommit_block():
        if _is_invalid(INDEX):
            op.drop_index(INDEX, table_name='session_to_agents', postgresql_concurrently=True, if_exists=True)
        op.create_index(INDEX, 'session_to_agents', ['updated_at'], unique=False, postgresql_concurrently=True,
                        if_not_exists=True, postgresql_where=sa.text('titled_at IS NULL'))


def downgrade() -> None:
    with op.get_context().autocommit_block():
        op.drop_index(INDEX, table_name='session_to_agents', postgresql_concurrently=True, if_exists=True)
    op.drop_column('session_to_agents', 'titled_at')
    op.drop_column('session_to_agents', 'title')

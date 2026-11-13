"""Find a visitor's conversations by an email they proved

A widget visitor who confirms their email with a code (email_check.py) sees
their conversations from every browser where they confirmed it. Each such
conversation records a keyed hash of the email (never the email itself), and
the history looks them up by it.

Only rows with a hash are indexed. Built CONCURRENTLY so the table keeps taking
writes while the backend starts; see org_lookup_indexes_001 for why an invalid
index is dropped first.

Revision ID: verified_email_key_001
Revises: conversation_titles_001
Create Date: 2026-11-12
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# Keep revision ids under 32 characters: alembic_version.version_num is varchar(32).
revision: str = 'verified_email_key_001'
down_revision: Union[str, None] = 'conversation_titles_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TABLE = 'session_to_agents'
COLUMN = 'verified_email_key'
INDEX = 'ix_session_to_agents_verified_email_key'


def _is_invalid(name: str) -> bool:
    return bool(op.get_bind().execute(
        sa.text("SELECT NOT indisvalid FROM pg_index WHERE indexrelid = to_regclass(:name)"),
        {'name': name},
    ).scalar())


def upgrade() -> None:
    op.add_column(TABLE, sa.Column(COLUMN, sa.String(64), nullable=True))
    with op.get_context().autocommit_block():
        if _is_invalid(INDEX):
            op.drop_index(INDEX, table_name=TABLE, postgresql_concurrently=True, if_exists=True)
        op.create_index(INDEX, TABLE, [COLUMN], unique=False, postgresql_concurrently=True,
                        if_not_exists=True, postgresql_where=sa.text(f'{COLUMN} IS NOT NULL'))


def downgrade() -> None:
    with op.get_context().autocommit_block():
        op.drop_index(INDEX, table_name=TABLE, postgresql_concurrently=True, if_exists=True)
    op.drop_column(TABLE, COLUMN)

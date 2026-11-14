"""When a conversation was handed to the team, and when it closed

The inbox sorts its waiting queue by how long each conversation has waited
for a person, and counts the conversations the AI resolved today. Neither was
stored: a session kept no time for either change.

- handed_over_at: the latest move into TRANSFERRED (queued for a human)
- closed_at: the latest move into CLOSED

Both are set by the model (app/models/session_to_agent.py) whenever the status
changes, so every path that hands over or closes records them. Existing rows
stay empty: there is no honest value to backfill.

closed_at is indexed per organization, only where set, for "resolved today".
Built CONCURRENTLY so the table keeps taking writes while the backend starts;
see org_lookup_indexes_001 for why an invalid index is dropped first.

Revision ID: inbox_handover_times_001
Revises: verified_email_key_001
Create Date: 2026-11-13
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# Keep revision ids under 32 characters: alembic_version.version_num is varchar(32).
revision: str = 'inbox_handover_times_001'
down_revision: Union[str, None] = 'verified_email_key_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TABLE = 'session_to_agents'
INDEX = 'ix_session_to_agents_org_closed_at'


def _is_invalid(name: str) -> bool:
    return bool(op.get_bind().execute(
        sa.text("SELECT NOT indisvalid FROM pg_index WHERE indexrelid = to_regclass(:name)"),
        {'name': name},
    ).scalar())


def upgrade() -> None:
    op.add_column(TABLE, sa.Column('handed_over_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column(TABLE, sa.Column('closed_at', sa.DateTime(timezone=True), nullable=True))
    with op.get_context().autocommit_block():
        if _is_invalid(INDEX):
            op.drop_index(INDEX, table_name=TABLE, postgresql_concurrently=True, if_exists=True)
        op.create_index(INDEX, TABLE, ['organization_id', 'closed_at'], unique=False,
                        postgresql_concurrently=True, if_not_exists=True,
                        postgresql_where=sa.text('closed_at IS NOT NULL'))


def downgrade() -> None:
    with op.get_context().autocommit_block():
        op.drop_index(INDEX, table_name=TABLE, postgresql_concurrently=True, if_exists=True)
    op.drop_column(TABLE, 'closed_at')
    op.drop_column(TABLE, 'handed_over_at')

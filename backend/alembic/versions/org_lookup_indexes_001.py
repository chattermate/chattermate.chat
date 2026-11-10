"""Index customers and session_to_agents by organization

Neither table had an index starting with organization_id, so listing one
organization's customers or conversations read the whole table (or walked the
whole email/org unique index) whatever the organization's size. On a server
with a small cache that meant seconds per query for an org with two rows.

Built CONCURRENTLY so the tables keep taking writes while the backend starts.
That can't run in a transaction, hence the autocommit block. A build that dies
part-way leaves an INVALID index that IF NOT EXISTS would then skip, so each one
is dropped first when it is invalid: running this again finishes the job.

Revision ID: org_lookup_indexes_001
Revises: erasure_fk_indexes_001
Create Date: 2026-11-10
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
# Keep revision ids under 32 characters: alembic_version.version_num is
# varchar(32).
revision: str = 'org_lookup_indexes_001'
down_revision: Union[str, None] = 'erasure_fk_indexes_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# (table, column): each is also index=True on its model, under the same name
ORGANIZATION_COLUMNS = (
    ('customers', 'organization_id'),
    ('session_to_agents', 'organization_id'),
)


def index_name(table: str, column: str) -> str:
    """SQLAlchemy's name for a column's index=True, so the models match."""
    return f'ix_{table}_{column}'


def _is_invalid(name: str) -> bool:
    return bool(op.get_bind().execute(
        sa.text("SELECT NOT indisvalid FROM pg_index WHERE indexrelid = to_regclass(:name)"),
        {'name': name},
    ).scalar())


def upgrade() -> None:
    with op.get_context().autocommit_block():
        for table, column in ORGANIZATION_COLUMNS:
            name = index_name(table, column)
            if _is_invalid(name):
                op.drop_index(name, table_name=table, postgresql_concurrently=True, if_exists=True)
            op.create_index(name, table, [column], unique=False,
                            postgresql_concurrently=True, if_not_exists=True)


def downgrade() -> None:
    with op.get_context().autocommit_block():
        for table, column in ORGANIZATION_COLUMNS:
            op.drop_index(index_name(table, column), table_name=table,
                          postgresql_concurrently=True, if_exists=True)

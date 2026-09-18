"""Index knowledge_queue by organization and status

The plan's source limit now counts the crawls still queued or running, so
every file upload and URL add reads this table. It had no index beyond the
primary key and priority, and nothing purges completed rows, so that read
was a sequential scan of every tenant's history.

Revision ID: idx_kq_org_status_001
Revises: add_mcp_usage_guidance_001
Create Date: 2026-09-18
"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
# Keep revision ids under 32 characters: alembic_version.version_num is
# varchar(32), and a longer id upgrades the schema then fails to record
# itself, so every later start retries and crashes.
revision: str = 'idx_kq_org_status_001'
down_revision: Union[str, None] = 'add_mcp_usage_guidance_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

INDEX_NAME = 'ix_knowledge_queue_org_status'


def upgrade() -> None:
    op.create_index(
        INDEX_NAME, 'knowledge_queue', ['organization_id', 'status'], unique=False
    )


def downgrade() -> None:
    op.drop_index(INDEX_NAME, table_name='knowledge_queue')

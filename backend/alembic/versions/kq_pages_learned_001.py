"""Track the pages a website has stored so far, and the source it writes into

A website used to be stored all at once when its crawl ended. Pages are now
stored one at a time, so the queue row counts them and points at the source
they land in.

Revision ID: kq_pages_learned_001
Revises: org_lookup_indexes_001
Create Date: 2026-11-11
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# Keep revision ids under 32 characters (alembic_version.version_num is varchar(32)).
revision: str = 'kq_pages_learned_001'
down_revision: Union[str, None] = 'org_lookup_indexes_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

FK_NAME = 'fk_knowledge_queue_knowledge_id'


def upgrade() -> None:
    op.add_column(
        'knowledge_queue',
        sa.Column('pages_learned', sa.Integer(), nullable=False, server_default='0'),
    )
    op.add_column('knowledge_queue', sa.Column('knowledge_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        FK_NAME, 'knowledge_queue', 'knowledge', ['knowledge_id'], ['id'], ondelete='SET NULL'
    )


def downgrade() -> None:
    op.drop_constraint(FK_NAME, 'knowledge_queue', type_='foreignkey')
    op.drop_column('knowledge_queue', 'knowledge_id')
    op.drop_column('knowledge_queue', 'pages_learned')

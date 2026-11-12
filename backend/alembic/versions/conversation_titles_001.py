"""Conversation titles for the widget's history

Each widget conversation can get a short AI-written title once it closes
(app/services/conversation_titles.py). The title is encrypted at rest like the
messages it is written from. titled_at records that a conversation was looked
at, titled or not, so the titling worker never takes it twice.

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


def upgrade() -> None:
    op.add_column('session_to_agents', sa.Column('title', sa.Text(), nullable=True))
    op.add_column('session_to_agents', sa.Column('titled_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('session_to_agents', 'titled_at')
    op.drop_column('session_to_agents', 'title')

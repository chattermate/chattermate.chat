"""Saved replies: replies the team writes once and sends many times

Revision ID: saved_replies_001
Revises: conversation_notes_001
Create Date: 2026-11-13
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# Keep revision ids under 32 characters: alembic_version.version_num is varchar(32).
revision: str = 'saved_replies_001'
down_revision: Union[str, None] = 'conversation_notes_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'saved_replies',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(100), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('shortcut', sa.String(40), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint('organization_id', 'shortcut', name='uq_saved_replies_org_shortcut'),
    )
    op.create_index('ix_saved_replies_organization_id', 'saved_replies', ['organization_id'])


def downgrade() -> None:
    op.drop_index('ix_saved_replies_organization_id', table_name='saved_replies')
    op.drop_table('saved_replies')

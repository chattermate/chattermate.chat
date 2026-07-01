"""
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

"""Add widget_apps table

Revision ID: add_widget_apps_001
Revises: 2381319791e8
Create Date: 2026-01-13 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision: str = 'add_widget_apps_001'
down_revision: Union[str, Sequence[str]] = '2381319791e8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create widget_apps table
    op.create_table(
        'widget_apps',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('organization_id', UUID(as_uuid=True), nullable=False),
        sa.Column('api_key_hash', sa.String(), nullable=False),
        sa.Column('created_by', UUID(as_uuid=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id']),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
    )

    # Create indexes
    op.create_index('ix_widget_apps_id', 'widget_apps', ['id'])
    op.create_index('ix_widget_apps_organization_id', 'widget_apps', ['organization_id'])
    op.create_index('ix_widget_apps_is_active', 'widget_apps', ['is_active'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_widget_apps_is_active', table_name='widget_apps')
    op.drop_index('ix_widget_apps_organization_id', table_name='widget_apps')
    op.drop_index('ix_widget_apps_id', table_name='widget_apps')

    # Drop table
    op.drop_table('widget_apps')

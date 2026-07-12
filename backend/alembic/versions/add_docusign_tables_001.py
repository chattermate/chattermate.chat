"""add docusign tables

Revision ID: add_docusign_tables_001
Revises: drop_slack_tables_001
Create Date: 2026-07-12

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
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'add_docusign_tables_001'
down_revision: Union[str, None] = 'drop_slack_tables_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'docusign_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('access_token', sa.String(), nullable=False),
        sa.Column('refresh_token', sa.String(), nullable=False),
        sa.Column('token_type', sa.String(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('account_id', sa.String(), nullable=False),
        sa.Column('base_uri', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_docusign_tokens_id'), 'docusign_tokens', ['id'], unique=False)

    op.create_table(
        'agent_docusign_configs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('agent_id', sa.String(), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('default_template_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_agent_docusign_configs_id'), 'agent_docusign_configs', ['id'], unique=False)
    op.create_index(op.f('ix_agent_docusign_configs_agent_id'), 'agent_docusign_configs', ['agent_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_agent_docusign_configs_agent_id'), table_name='agent_docusign_configs')
    op.drop_index(op.f('ix_agent_docusign_configs_id'), table_name='agent_docusign_configs')
    op.drop_table('agent_docusign_configs')
    op.drop_index(op.f('ix_docusign_tokens_id'), table_name='docusign_tokens')
    op.drop_table('docusign_tokens')

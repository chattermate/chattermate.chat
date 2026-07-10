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

"""Add omni-channel tables and session channel column

Revision ID: add_channel_tables_001
Revises: e5f6a7b8c9d0
Create Date: 2026-07-10 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_channel_tables_001'
down_revision: Union[str, None] = 'e5f6a7b8c9d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'channel_accounts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('channel_type', sa.String(), nullable=False),
        sa.Column('external_account_id', sa.String(), nullable=False),
        sa.Column('display_name', sa.String(), nullable=True),
        sa.Column('encrypted_credentials', sa.Text(), nullable=False),
        sa.Column('webhook_secret', sa.String(), nullable=False),
        sa.Column('settings', sa.JSON(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('channel_type', 'external_account_id', name='uq_channel_account_external'),
    )
    op.create_index('ix_channel_accounts_organization_id', 'channel_accounts', ['organization_id'])
    op.create_index('ix_channel_accounts_channel_type', 'channel_accounts', ['channel_type'])

    op.create_table(
        'channel_conversations',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('channel_account_id', sa.UUID(), nullable=False),
        sa.Column('channel_type', sa.String(), nullable=False),
        sa.Column('external_conversation_id', sa.String(), nullable=False),
        sa.Column('external_user_id', sa.String(), nullable=False),
        sa.Column('session_id', sa.UUID(), nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('agent_id', sa.UUID(), nullable=True),
        sa.Column('customer_id', sa.UUID(), nullable=True),
        sa.Column('last_inbound_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('extra', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['channel_account_id'], ['channel_accounts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['session_id'], ['session_to_agents.session_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint(
            'channel_account_id', 'external_conversation_id', 'session_id',
            name='uq_channel_conversation_session'
        ),
    )
    op.create_index('ix_channel_conversations_channel_account_id', 'channel_conversations', ['channel_account_id'])
    op.create_index('ix_channel_conversations_external_conversation_id', 'channel_conversations', ['external_conversation_id'])
    op.create_index('ix_channel_conversations_session_id', 'channel_conversations', ['session_id'])

    op.create_table(
        'agent_channel_configs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('agent_id', sa.UUID(), nullable=False),
        sa.Column('channel_account_id', sa.UUID(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['channel_account_id'], ['channel_accounts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('channel_account_id', name='uq_agent_channel_config_account'),
    )
    op.create_index('ix_agent_channel_configs_agent_id', 'agent_channel_configs', ['agent_id'])
    op.create_index('ix_agent_channel_configs_channel_account_id', 'agent_channel_configs', ['channel_account_id'])

    op.add_column(
        'session_to_agents',
        sa.Column('channel', sa.String(), nullable=False, server_default='web')
    )
    op.create_index('ix_session_to_agents_channel', 'session_to_agents', ['channel'])


def downgrade() -> None:
    op.drop_index('ix_session_to_agents_channel', table_name='session_to_agents')
    op.drop_column('session_to_agents', 'channel')

    op.drop_index('ix_agent_channel_configs_channel_account_id', table_name='agent_channel_configs')
    op.drop_index('ix_agent_channel_configs_agent_id', table_name='agent_channel_configs')
    op.drop_table('agent_channel_configs')

    op.drop_index('ix_channel_conversations_session_id', table_name='channel_conversations')
    op.drop_index('ix_channel_conversations_external_conversation_id', table_name='channel_conversations')
    op.drop_index('ix_channel_conversations_channel_account_id', table_name='channel_conversations')
    op.drop_table('channel_conversations')

    op.drop_index('ix_channel_accounts_channel_type', table_name='channel_accounts')
    op.drop_index('ix_channel_accounts_organization_id', table_name='channel_accounts')
    op.drop_table('channel_accounts')

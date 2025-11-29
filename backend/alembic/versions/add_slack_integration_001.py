"""Add Slack integration tables

Revision ID: add_slack_integration_001
Revises: add_allow_attachments_001
Create Date: 2025-11-25 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'add_slack_integration_001'
down_revision: Union[str, None] = 'add_allow_attachments_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create StorageMode enum type if it doesn't exist
    connection = op.get_bind()
    result = connection.execute(sa.text(
        "SELECT 1 FROM pg_type WHERE typname = 'storagemode'"
    ))
    if not result.fetchone():
        op.execute("CREATE TYPE storagemode AS ENUM ('FULL_CONTENT', 'METADATA_ONLY', 'EMBEDDINGS_ONLY')")

    # Create slack_tokens table
    op.create_table('slack_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('access_token', sa.String(), nullable=False),
        sa.Column('bot_user_id', sa.String(), nullable=False),
        sa.Column('team_id', sa.String(), nullable=False),
        sa.Column('team_name', sa.String(), nullable=False),
        sa.Column('authed_user_id', sa.String(), nullable=True),
        sa.Column('scope', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_slack_tokens_id'), 'slack_tokens', ['id'], unique=False)
    op.create_index(op.f('ix_slack_tokens_organization_id'), 'slack_tokens', ['organization_id'], unique=False)
    op.create_index(op.f('ix_slack_tokens_team_id'), 'slack_tokens', ['team_id'], unique=False)

    # Create slack_workspace_configs table
    op.create_table('slack_workspace_configs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('team_id', sa.String(), nullable=False),
        sa.Column('allowed_channel_ids', sa.JSON(), nullable=True),
        sa.Column('storage_mode', postgresql.ENUM('FULL_CONTENT', 'METADATA_ONLY', 'EMBEDDINGS_ONLY', name='storagemode', create_type=False), nullable=False),
        sa.Column('default_agent_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['default_agent_id'], ['agents.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_slack_workspace_configs_id'), 'slack_workspace_configs', ['id'], unique=False)
    op.create_index(op.f('ix_slack_workspace_configs_organization_id'), 'slack_workspace_configs', ['organization_id'], unique=False)
    op.create_index(op.f('ix_slack_workspace_configs_team_id'), 'slack_workspace_configs', ['team_id'], unique=False)

    # Create agent_slack_configs table
    op.create_table('agent_slack_configs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('team_id', sa.String(), nullable=False),
        sa.Column('agent_id', sa.UUID(), nullable=False),
        sa.Column('channel_id', sa.String(), nullable=False),
        sa.Column('channel_name', sa.String(), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('respond_to_mentions', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('respond_to_reactions', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('respond_to_commands', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('reaction_emoji', sa.String(), nullable=False, server_default='robot_face'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'channel_id', name='uq_agent_slack_config_org_channel')
    )
    op.create_index(op.f('ix_agent_slack_configs_id'), 'agent_slack_configs', ['id'], unique=False)
    op.create_index(op.f('ix_agent_slack_configs_organization_id'), 'agent_slack_configs', ['organization_id'], unique=False)
    op.create_index(op.f('ix_agent_slack_configs_team_id'), 'agent_slack_configs', ['team_id'], unique=False)
    op.create_index(op.f('ix_agent_slack_configs_agent_id'), 'agent_slack_configs', ['agent_id'], unique=False)
    op.create_index(op.f('ix_agent_slack_configs_channel_id'), 'agent_slack_configs', ['channel_id'], unique=False)

    # Create slack_conversations table
    op.create_table('slack_conversations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('team_id', sa.String(), nullable=False),
        sa.Column('channel_id', sa.String(), nullable=False),
        sa.Column('thread_ts', sa.String(), nullable=False),
        sa.Column('session_id', sa.UUID(), nullable=False),
        sa.Column('agent_id', sa.UUID(), nullable=True),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('slack_user_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['session_to_agents.session_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('team_id', 'channel_id', 'thread_ts', name='uq_slack_conversation_thread')
    )
    op.create_index(op.f('ix_slack_conversations_id'), 'slack_conversations', ['id'], unique=False)
    op.create_index(op.f('ix_slack_conversations_team_id'), 'slack_conversations', ['team_id'], unique=False)
    op.create_index(op.f('ix_slack_conversations_channel_id'), 'slack_conversations', ['channel_id'], unique=False)
    op.create_index(op.f('ix_slack_conversations_thread_ts'), 'slack_conversations', ['thread_ts'], unique=False)
    op.create_index(op.f('ix_slack_conversations_session_id'), 'slack_conversations', ['session_id'], unique=False)


def downgrade() -> None:
    # Drop slack_conversations table
    op.drop_index(op.f('ix_slack_conversations_session_id'), table_name='slack_conversations')
    op.drop_index(op.f('ix_slack_conversations_thread_ts'), table_name='slack_conversations')
    op.drop_index(op.f('ix_slack_conversations_channel_id'), table_name='slack_conversations')
    op.drop_index(op.f('ix_slack_conversations_team_id'), table_name='slack_conversations')
    op.drop_index(op.f('ix_slack_conversations_id'), table_name='slack_conversations')
    op.drop_table('slack_conversations')

    # Drop agent_slack_configs table
    op.drop_index(op.f('ix_agent_slack_configs_channel_id'), table_name='agent_slack_configs')
    op.drop_index(op.f('ix_agent_slack_configs_agent_id'), table_name='agent_slack_configs')
    op.drop_index(op.f('ix_agent_slack_configs_team_id'), table_name='agent_slack_configs')
    op.drop_index(op.f('ix_agent_slack_configs_organization_id'), table_name='agent_slack_configs')
    op.drop_index(op.f('ix_agent_slack_configs_id'), table_name='agent_slack_configs')
    op.drop_table('agent_slack_configs')

    # Drop slack_workspace_configs table
    op.drop_index(op.f('ix_slack_workspace_configs_team_id'), table_name='slack_workspace_configs')
    op.drop_index(op.f('ix_slack_workspace_configs_organization_id'), table_name='slack_workspace_configs')
    op.drop_index(op.f('ix_slack_workspace_configs_id'), table_name='slack_workspace_configs')
    op.drop_table('slack_workspace_configs')

    # Drop slack_tokens table
    op.drop_index(op.f('ix_slack_tokens_team_id'), table_name='slack_tokens')
    op.drop_index(op.f('ix_slack_tokens_organization_id'), table_name='slack_tokens')
    op.drop_index(op.f('ix_slack_tokens_id'), table_name='slack_tokens')
    op.drop_table('slack_tokens')

    # Drop StorageMode enum type
    sa.Enum('FULL_CONTENT', 'METADATA_ONLY', 'EMBEDDINGS_ONLY', name='storagemode').drop(op.get_bind(), checkfirst=True)

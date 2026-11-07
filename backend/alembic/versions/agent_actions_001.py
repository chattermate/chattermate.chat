"""agent_actions and agent_action_calls, for in-app actions

Revision ID: agent_actions_001
Revises: auth_session_method_001
Create Date: 2026-11-02

Both tables start empty. agent_actions holds what a customer lets an agent ask
their web app to do; agent_action_calls records each call the model makes, so
a paused run can resume on any worker.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'agent_actions_001'
down_revision: Union[str, None] = 'auth_session_method_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'agent_actions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('agent_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(64), nullable=False),
        sa.Column('label', sa.String(80), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('parameters', sa.JSON(), nullable=False),
        sa.Column('confirm', sa.String(24), nullable=False, server_default='never'),
        sa.Column('timeout_s', sa.Integer(), nullable=False),
        sa.Column('sensitive_form', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('last_registered_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('agent_id', 'name', name='uq_agent_actions_agent_name'),
    )
    op.create_index('ix_agent_actions_organization_id', 'agent_actions', ['organization_id'])
    op.create_index('ix_agent_actions_agent_id', 'agent_actions', ['agent_id'])

    op.create_table(
        'agent_action_calls',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('agent_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('action_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('action_name', sa.String(64), nullable=False),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('run_id', sa.String(64), nullable=False),
        sa.Column('tool_call_id', sa.String(128), nullable=False),
        sa.Column('seq', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(16), nullable=False, server_default='pending'),
        sa.Column('confirmed', sa.Boolean(), nullable=True),
        sa.Column('args_hash', sa.String(64), nullable=False),
        sa.Column('args_ciphertext', sa.Text(), nullable=True),
        sa.Column('result_ciphertext', sa.Text(), nullable=True),
        sa.Column('error_code', sa.String(48), nullable=True),
        sa.Column('latency_ms', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['action_id'], ['agent_actions.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('run_id', 'tool_call_id', name='uq_agent_action_calls_run_tool_call'),
    )
    op.create_index('ix_agent_action_calls_organization_id', 'agent_action_calls', ['organization_id'])
    op.create_index('ix_agent_action_calls_session_status', 'agent_action_calls', ['session_id', 'status'])
    op.create_index('ix_agent_action_calls_run', 'agent_action_calls', ['run_id'])


def downgrade() -> None:
    op.drop_table('agent_action_calls')
    op.drop_table('agent_actions')

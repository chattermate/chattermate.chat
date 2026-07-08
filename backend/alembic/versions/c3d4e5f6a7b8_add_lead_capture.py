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

"""add lead capture (configs, responses, customer lead stage)

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-07-07 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Enum member NAMES are what SQLAlchemy stores (matches agenttype/sessionstatus convention).
# create_type=False + an explicit .create(checkfirst=True) so create_table/add_column
# reference the type without emitting a second (empty) CREATE TYPE.
assign_col = postgresql.ENUM('NONE', 'SALES_TEAM', 'SPECIFIC_PERSON', 'ROUND_ROBIN', name='leadassignmentmode', create_type=False)
crm_col = postgresql.ENUM('NONE', 'HUBSPOT', 'SALESFORCE', name='crmsynctarget', create_type=False)
stage_col = postgresql.ENUM('VISITOR', 'LEAD', 'CUSTOMER', name='leadstage', create_type=False)


def upgrade() -> None:
    bind = op.get_bind()

    # Create enum types up front (idempotent) so create_table / add_column can reference
    # them without re-emitting CREATE TYPE.
    assign_col.create(bind, checkfirst=True)
    crm_col.create(bind, checkfirst=True)
    stage_col.create(bind, checkfirst=True)

    # ---- lead_capture_configs (1:1 with agents) ----
    op.create_table(
        'lead_capture_configs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('agent_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('require_consent', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('guidance', sa.Text(), nullable=True),
        sa.Column('fields', sa.JSON(), nullable=True),
        sa.Column('assignment_mode', assign_col, nullable=False, server_default='NONE'),
        sa.Column('assignment_target_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('crm_sync_target', crm_col, nullable=False, server_default='NONE'),
        sa.Column('slack_notify_enabled', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['assignment_target_user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('agent_id', name='uix_lead_capture_config_agent'),
    )
    op.create_index(op.f('ix_lead_capture_configs_id'), 'lead_capture_configs', ['id'], unique=False)

    # ---- lead_capture_responses (one row per capture attempt) ----
    op.create_table(
        'lead_capture_responses',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('agent_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('customer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('field_values', sa.JSON(), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('consent', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('qualified', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id']),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['session_id'], ['session_to_agents.session_id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_lead_capture_responses_customer_id'), 'lead_capture_responses', ['customer_id'], unique=False)
    op.create_index(op.f('ix_lead_capture_responses_agent_id'), 'lead_capture_responses', ['agent_id'], unique=False)

    # ---- customers: lead lifecycle columns ----
    # Add lead_stage nullable first, backfill, then enforce NOT NULL (template pattern).
    op.add_column('customers', sa.Column('lead_stage', stage_col, nullable=True))
    op.add_column('customers', sa.Column('lead_source', sa.JSON(), nullable=True))
    op.add_column('customers', sa.Column('lead_qualified_at', sa.DateTime(timezone=True), nullable=True))
    op.execute("UPDATE customers SET lead_stage = 'VISITOR' WHERE lead_stage IS NULL")
    op.alter_column('customers', 'lead_stage', nullable=False, server_default='VISITOR')


def downgrade() -> None:
    op.drop_column('customers', 'lead_qualified_at')
    op.drop_column('customers', 'lead_source')
    op.drop_column('customers', 'lead_stage')

    op.drop_index(op.f('ix_lead_capture_responses_agent_id'), table_name='lead_capture_responses')
    op.drop_index(op.f('ix_lead_capture_responses_customer_id'), table_name='lead_capture_responses')
    op.drop_table('lead_capture_responses')

    op.drop_index(op.f('ix_lead_capture_configs_id'), table_name='lead_capture_configs')
    op.drop_table('lead_capture_configs')

    bind = op.get_bind()
    stage_col.drop(bind, checkfirst=True)
    crm_col.drop(bind, checkfirst=True)
    assign_col.drop(bind, checkfirst=True)

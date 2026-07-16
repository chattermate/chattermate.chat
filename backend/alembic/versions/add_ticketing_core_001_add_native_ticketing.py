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

"""add native AI-first ticketing core tables

Revision ID: add_ticketing_core_001
Revises: add_hc_faq_feedback_001
Create Date: 2026-07-16

New feature: native AI-first ticketing (replaces the Jira-only flow). Tickets
are first-class aggregates decoupled from chat sessions; the legacy
session_to_agents.ticket_* columns remain as a denormalized mirror.

Tables:
- tickets: the aggregate root (per-org TKT-{n} numbers, triage fields,
  pgvector embedding for dedup, SLA timestamps, external escalation ref)
- ticket_sequences: per-org display-number allocator (SELECT ... FOR UPDATE)
- ticket_sessions: ticket <-> chat-session link table
- ticket_activities: append-only comments + audit trail
- organization_ticket_settings: autonomy level, SLA targets, comms templates,
  investigation budgets

Status/priority/source columns are plain strings (mirroring
faq_generation_jobs) so new values never need an ALTER TYPE migration.

Also seeds view_tickets/manage_tickets permissions and attaches them to
existing roles that already hold manage_all_chats (new orgs get them from
Permission.default_permissions()).
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_ticketing_core_001'
down_revision = 'add_hc_faq_feedback_001'
branch_labels = None
depends_on = None

TICKET_EMBEDDING_DIM = 384


def upgrade() -> None:
    # pgvector for the dedup embedding (idempotent; also created by
    # scripts/init-vector.sql on fresh databases).
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        'tickets',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('ticket_number', sa.Integer(), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('customer_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('original_title', sa.String(length=500), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('priority', sa.String(), nullable=False),
        sa.Column('severity', sa.Integer(), nullable=True),
        sa.Column('source', sa.String(), nullable=False),
        sa.Column('intent', sa.String(), nullable=True),
        sa.Column('triage_confidence', sa.Float(), nullable=True),
        sa.Column('ai_summary', sa.Text(), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('assignee_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('group_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('agent_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('duplicate_of_ticket_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('resolution_outcome', sa.String(), nullable=True),
        sa.Column('resolution_summary', sa.Text(), nullable=True),
        sa.Column('customer_resolution_message', sa.Text(), nullable=True),
        sa.Column('resolved_by_actor', sa.String(), nullable=True),
        sa.Column('first_response_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('closed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('confirmation_requested_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reopened_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('external_ref_type', sa.String(), nullable=True),
        sa.Column('external_ref_id', sa.String(), nullable=True),
        sa.Column('external_ref_url', sa.String(), nullable=True),
        sa.Column('created_by_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['assignee_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['group_id'], ['groups.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['duplicate_of_ticket_id'], ['tickets.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['created_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'ticket_number', name='uq_tickets_org_number'),
    )
    # The vector column via raw SQL so the sqlalchemy migration stays free of
    # the pgvector python type.
    op.execute(f"ALTER TABLE tickets ADD COLUMN embedding vector({TICKET_EMBEDDING_DIM})")
    op.create_index(op.f('ix_tickets_organization_id'), 'tickets', ['organization_id'])
    op.create_index(op.f('ix_tickets_status'), 'tickets', ['status'])
    op.create_index('ix_tickets_org_status', 'tickets', ['organization_id', 'status'])
    op.create_index('ix_tickets_org_assignee', 'tickets', ['organization_id', 'assignee_user_id'])
    op.create_index('ix_tickets_org_created', 'tickets', ['organization_id', 'created_at'])
    # Approximate-NN index for dedup/similar-ticket recall (cosine).
    op.execute(
        "CREATE INDEX ix_tickets_embedding_hnsw ON tickets "
        "USING hnsw (embedding vector_cosine_ops)"
    )

    op.create_table(
        'ticket_sequences',
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('next_number', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('organization_id'),
    )

    op.create_table(
        'ticket_sessions',
        sa.Column('ticket_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('linked_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['ticket_id'], ['tickets.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['session_id'], ['session_to_agents.session_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('ticket_id', 'session_id'),
    )
    op.create_index(op.f('ix_ticket_sessions_session_id'), 'ticket_sessions', ['session_id'])

    op.create_table(
        'ticket_activities',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('ticket_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('activity_type', sa.String(), nullable=False),
        sa.Column('actor_type', sa.String(), nullable=False),
        sa.Column('actor_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('body', sa.Text(), nullable=True),
        sa.Column('is_internal', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('activity_metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['ticket_id'], ['tickets.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['actor_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_ticket_activities_ticket_id'), 'ticket_activities', ['ticket_id'])
    op.create_index('ix_ticket_activities_ticket_created', 'ticket_activities', ['ticket_id', 'created_at'])

    op.create_table(
        'organization_ticket_settings',
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('autonomy_level', sa.Integer(), server_default='1', nullable=False),
        sa.Column('auto_investigate_on_create', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('min_confidence_to_auto_resolve', sa.Float(), server_default='0.85', nullable=False),
        sa.Column('confirmation_timeout_hours', sa.Integer(), server_default='72', nullable=False),
        sa.Column('csat_enabled', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('sla_targets', sa.JSON(), nullable=True),
        sa.Column('created_template', sa.Text(), nullable=True),
        sa.Column('resolved_template', sa.Text(), nullable=True),
        sa.Column('jira_escalation_enabled', sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column('jira_escalation_priority', sa.String(), nullable=True),
        sa.Column('investigation_mcp_tool_ids', sa.JSON(), nullable=True),
        sa.Column('alert_webhook_enabled', sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column('max_tool_calls_per_run', sa.Integer(), server_default='25', nullable=False),
        sa.Column('max_runs_per_ticket', sa.Integer(), server_default='3', nullable=False),
        sa.Column('monthly_investigation_cap', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('organization_id'),
    )

    # Seed the new permissions and attach them to existing roles that already
    # manage chats (new orgs seed via Permission.default_permissions()).
    op.execute("""
        INSERT INTO permissions (name, description)
        SELECT 'view_tickets', 'Can view tickets'
        WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'view_tickets')
    """)
    op.execute("""
        INSERT INTO permissions (name, description)
        SELECT 'manage_tickets', 'Can manage tickets'
        WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'manage_tickets')
    """)
    op.execute("""
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT rp.role_id, p_new.id
        FROM role_permissions rp
        JOIN permissions p_old ON p_old.id = rp.permission_id AND p_old.name = 'manage_all_chats'
        CROSS JOIN permissions p_new
        WHERE p_new.name IN ('view_tickets', 'manage_tickets')
          AND NOT EXISTS (
              SELECT 1 FROM role_permissions rp2
              WHERE rp2.role_id = rp.role_id AND rp2.permission_id = p_new.id
          )
    """)


def downgrade() -> None:
    op.execute("""
        DELETE FROM role_permissions
        WHERE permission_id IN (
            SELECT id FROM permissions WHERE name IN ('view_tickets', 'manage_tickets')
        )
    """)
    op.execute("DELETE FROM permissions WHERE name IN ('view_tickets', 'manage_tickets')")
    op.drop_table('organization_ticket_settings')
    op.drop_index('ix_ticket_activities_ticket_created', table_name='ticket_activities')
    op.drop_index(op.f('ix_ticket_activities_ticket_id'), table_name='ticket_activities')
    op.drop_table('ticket_activities')
    op.drop_index(op.f('ix_ticket_sessions_session_id'), table_name='ticket_sessions')
    op.drop_table('ticket_sessions')
    op.drop_table('ticket_sequences')
    op.execute("DROP INDEX IF EXISTS ix_tickets_embedding_hnsw")
    op.drop_index('ix_tickets_org_created', table_name='tickets')
    op.drop_index('ix_tickets_org_assignee', table_name='tickets')
    op.drop_index('ix_tickets_org_status', table_name='tickets')
    op.drop_index(op.f('ix_tickets_status'), table_name='tickets')
    op.drop_index(op.f('ix_tickets_organization_id'), table_name='tickets')
    op.drop_table('tickets')

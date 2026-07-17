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

"""add ticketing Phase 4: guardrailed DB connectors, proposals, webhook secret

Revision ID: add_tkt_phase4_001
Revises: add_invest_glassbox_001
Create Date: 2026-07-17

- ticket_db_connectors: read-only, allowlisted, masked DB access for the
  investigation agent (creds encrypted at rest)
- db_connector_audit_logs: every attempted query (raw + canonical SQL,
  outcome) — result rows are never stored
- ticket_proposals: autonomy L2 propose/approve records
- organization_ticket_settings.alert_webhook_secret for the alert intake
- seeds approve_ticket_actions (roles with manage_tickets) and
  manage_ticket_connectors (roles with manage_organization)
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_tkt_phase4_001'
down_revision = 'add_invest_glassbox_001'
branch_labels = None
depends_on = None

NEW_PERMISSIONS = {
    'approve_ticket_actions': ('Can approve AI-proposed ticket resolutions', 'manage_tickets'),
    'manage_ticket_connectors': ('Can manage ticket investigation connectors', 'manage_organization'),
}


def upgrade() -> None:
    op.create_table(
        'ticket_db_connectors',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('engine', sa.String(), nullable=False),
        sa.Column('host', sa.String(length=500), nullable=False),
        sa.Column('port', sa.Integer(), nullable=False),
        sa.Column('database', sa.String(length=200), nullable=False),
        sa.Column('username', sa.String(length=200), nullable=False),
        sa.Column('encrypted_password', sa.Text(), nullable=False),
        sa.Column('enabled', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('allowed_tables', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('masked_columns', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('max_rows', sa.Integer(), server_default='100', nullable=False),
        sa.Column('statement_timeout_ms', sa.Integer(), server_default='5000', nullable=False),
        sa.Column('last_test_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_test_ok', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_ticket_db_connectors_organization_id'), 'ticket_db_connectors', ['organization_id'])

    op.create_table(
        'db_connector_audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('connector_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('ticket_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('run_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('raw_sql', sa.Text(), nullable=False),
        sa.Column('validated_sql', sa.Text(), nullable=True),
        sa.Column('outcome', sa.String(), nullable=False),
        sa.Column('block_reason', sa.Text(), nullable=True),
        sa.Column('row_count', sa.Integer(), nullable=True),
        sa.Column('duration_ms', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['connector_id'], ['ticket_db_connectors.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['ticket_id'], ['tickets.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['run_id'], ['investigation_runs.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_db_connector_audit_logs_connector_id'), 'db_connector_audit_logs', ['connector_id'])
    op.create_index(op.f('ix_db_connector_audit_logs_organization_id'), 'db_connector_audit_logs', ['organization_id'])
    op.create_index('ix_db_connector_audit_logs_created', 'db_connector_audit_logs', ['organization_id', 'created_at'])

    op.create_table(
        'ticket_proposals',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('ticket_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('run_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('customer_message', sa.Text(), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('decided_by_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('decided_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reject_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['ticket_id'], ['tickets.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['run_id'], ['investigation_runs.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['decided_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_ticket_proposals_ticket_id'), 'ticket_proposals', ['ticket_id'])
    op.create_index(op.f('ix_ticket_proposals_organization_id'), 'ticket_proposals', ['organization_id'])

    op.add_column(
        'organization_ticket_settings',
        sa.Column('alert_webhook_secret', sa.String(length=64), nullable=True),
    )

    # Seed the new permissions onto roles holding the anchor permission
    # (new orgs seed via Permission.default_permissions()).
    for name, (description, anchor) in NEW_PERMISSIONS.items():
        op.execute(f"""
            INSERT INTO permissions (name, description)
            SELECT '{name}', '{description}'
            WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = '{name}')
        """)
        op.execute(f"""
            INSERT INTO role_permissions (role_id, permission_id)
            SELECT rp.role_id, p_new.id
            FROM role_permissions rp
            JOIN permissions p_old ON p_old.id = rp.permission_id AND p_old.name = '{anchor}'
            CROSS JOIN permissions p_new
            WHERE p_new.name = '{name}'
              AND NOT EXISTS (
                  SELECT 1 FROM role_permissions rp2
                  WHERE rp2.role_id = rp.role_id AND rp2.permission_id = p_new.id
              )
        """)


def downgrade() -> None:
    names = "', '".join(NEW_PERMISSIONS)
    op.execute(f"""
        DELETE FROM role_permissions
        WHERE permission_id IN (SELECT id FROM permissions WHERE name IN ('{names}'))
    """)
    op.execute(f"DELETE FROM permissions WHERE name IN ('{names}')")
    op.drop_column('organization_ticket_settings', 'alert_webhook_secret')
    op.drop_index(op.f('ix_ticket_proposals_organization_id'), table_name='ticket_proposals')
    op.drop_index(op.f('ix_ticket_proposals_ticket_id'), table_name='ticket_proposals')
    op.drop_table('ticket_proposals')
    op.drop_index('ix_db_connector_audit_logs_created', table_name='db_connector_audit_logs')
    op.drop_index(op.f('ix_db_connector_audit_logs_organization_id'), table_name='db_connector_audit_logs')
    op.drop_index(op.f('ix_db_connector_audit_logs_connector_id'), table_name='db_connector_audit_logs')
    op.drop_table('db_connector_audit_logs')
    op.drop_index(op.f('ix_ticket_db_connectors_organization_id'), table_name='ticket_db_connectors')
    op.drop_table('ticket_db_connectors')

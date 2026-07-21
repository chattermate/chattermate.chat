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

"""add investigation glass-box tables (hypotheses, events, RCA documents)

Revision ID: add_invest_glassbox_001
Revises: merge_tkt_phone_001
Create Date: 2026-07-17

Phase 3 of AI-first ticketing: hypothesis-driven investigation with evidence
captured as first-class rows (investigation_events) and structured, versioned
RCA documents.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_invest_glassbox_001'
down_revision = 'merge_tkt_phone_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'investigation_hypotheses',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('run_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('ticket_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('idx', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=300), nullable=False),
        sa.Column('rationale', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('conclusion', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['run_id'], ['investigation_runs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['ticket_id'], ['tickets.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_investigation_hypotheses_run_id'), 'investigation_hypotheses', ['run_id'])
    op.create_index(op.f('ix_investigation_hypotheses_ticket_id'), 'investigation_hypotheses', ['ticket_id'])

    op.create_table(
        'investigation_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('run_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('ticket_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('hypothesis_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('seq', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('label', sa.String(length=300), nullable=True),
        sa.Column('tool_name', sa.String(length=200), nullable=True),
        sa.Column('connector_name', sa.String(length=200), nullable=True),
        sa.Column('tool_input', sa.Text(), nullable=True),
        sa.Column('tool_result', sa.Text(), nullable=True),
        sa.Column('duration_ms', sa.Integer(), nullable=True),
        sa.Column('error', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['run_id'], ['investigation_runs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['ticket_id'], ['tickets.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['hypothesis_id'], ['investigation_hypotheses.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_investigation_events_run_id'), 'investigation_events', ['run_id'])
    op.create_index(op.f('ix_investigation_events_ticket_id'), 'investigation_events', ['ticket_id'])
    op.create_index('ix_investigation_events_run_seq', 'investigation_events', ['run_id', 'seq'])

    op.create_table(
        'rca_documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('ticket_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('run_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('impact', sa.Text(), nullable=True),
        sa.Column('timeline', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('investigation_log', sa.Text(), nullable=True),
        sa.Column('contributing_factors', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('conclusion', sa.Text(), nullable=True),
        sa.Column('remediation', sa.Text(), nullable=True),
        sa.Column('prevention', sa.Text(), nullable=True),
        sa.Column('customer_summary', sa.Text(), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('is_partial', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('generated_by', sa.String(), server_default='ai', nullable=False),
        sa.Column('reviewed_by_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['ticket_id'], ['tickets.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['run_id'], ['investigation_runs.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['reviewed_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('ticket_id', 'version', name='uq_rca_documents_ticket_version'),
    )
    op.create_index(op.f('ix_rca_documents_ticket_id'), 'rca_documents', ['ticket_id'])


def downgrade() -> None:
    op.drop_index(op.f('ix_rca_documents_ticket_id'), table_name='rca_documents')
    op.drop_table('rca_documents')
    op.drop_index('ix_investigation_events_run_seq', table_name='investigation_events')
    op.drop_index(op.f('ix_investigation_events_ticket_id'), table_name='investigation_events')
    op.drop_index(op.f('ix_investigation_events_run_id'), table_name='investigation_events')
    op.drop_table('investigation_events')
    op.drop_index(op.f('ix_investigation_hypotheses_ticket_id'), table_name='investigation_hypotheses')
    op.drop_index(op.f('ix_investigation_hypotheses_run_id'), table_name='investigation_hypotheses')
    op.drop_table('investigation_hypotheses')

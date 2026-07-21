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

"""add investigation_runs (AI triage/investigation queue)

Revision ID: add_investigation_runs_001
Revises: add_ticketing_core_001
Create Date: 2026-07-16

Phase 2 of AI-first ticketing: the run table doubles as the worker queue
(ticket_investigator polls status='pending', mirroring faq_generation_jobs).
Budgets and token actuals live on the row for cost tracking.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_investigation_runs_001'
down_revision = 'add_ticketing_core_001'
branch_labels = None
depends_on = None

ACTIVE_RUN_STATUSES = ('pending', 'running')


def upgrade() -> None:
    op.create_table(
        'investigation_runs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('ticket_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('run_type', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('trigger', sa.String(), nullable=False),
        sa.Column('requested_by_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('context_note', sa.Text(), nullable=True),
        sa.Column('max_tool_calls', sa.Integer(), server_default='25', nullable=False),
        sa.Column('max_wall_seconds', sa.Integer(), server_default='600', nullable=False),
        sa.Column('tool_calls_used', sa.Integer(), server_default='0', nullable=False),
        sa.Column('llm_calls', sa.Integer(), server_default='0', nullable=False),
        sa.Column('input_tokens', sa.BigInteger(), server_default='0', nullable=False),
        sa.Column('output_tokens', sa.BigInteger(), server_default='0', nullable=False),
        sa.Column('model_name', sa.String(), nullable=True),
        sa.Column('error', sa.Text(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('finished_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['ticket_id'], ['tickets.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['requested_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_investigation_runs_ticket_id'), 'investigation_runs', ['ticket_id'])
    op.create_index(op.f('ix_investigation_runs_organization_id'), 'investigation_runs', ['organization_id'])
    # Keeps the worker's poll O(active rows) as terminal rows accumulate.
    op.create_index(
        'ix_investigation_runs_active',
        'investigation_runs',
        ['status'],
        postgresql_where=sa.text(
            "status IN ({})".format(", ".join(f"'{s}'" for s in ACTIVE_RUN_STATUSES))
        ),
    )
    # Closes the enqueue check-then-insert race: at most one active run per
    # ticket. Lives only in the migration (sqlite tests can't compile the
    # partial WHERE).
    op.execute(
        "CREATE UNIQUE INDEX uq_investigation_runs_one_active ON investigation_runs "
        "(ticket_id) WHERE status IN ('pending', 'running')"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS uq_investigation_runs_one_active")
    op.drop_index('ix_investigation_runs_active', table_name='investigation_runs')
    op.drop_index(op.f('ix_investigation_runs_organization_id'), table_name='investigation_runs')
    op.drop_index(op.f('ix_investigation_runs_ticket_id'), table_name='investigation_runs')
    op.drop_table('investigation_runs')

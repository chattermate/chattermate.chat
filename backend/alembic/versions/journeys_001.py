"""journeys, journey progress and agent context keys

Revision ID: journeys_001
Revises: agent_actions_001
Create Date: 2026-11-02

All start empty. journeys holds the step-by-step guides an agent runs on the
customer's site; journey_progress / journey_step_progress record each user's
way through one (what the funnel counts); agent_context_keys lists the fields
pages have sent, for the editor.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'journeys_001'
down_revision: Union[str, None] = 'agent_actions_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'journeys',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('agent_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('key', sa.String(64), nullable=False),
        sa.Column('name', sa.String(120), nullable=False),
        sa.Column('status', sa.String(16), nullable=False, server_default='draft'),
        sa.Column('priority', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('auto_open', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('goal_event', sa.String(64), nullable=True),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('template_key', sa.String(64), nullable=True),
        sa.Column('definition', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('agent_id', 'key', name='uq_journeys_agent_key'),
    )
    op.create_index('ix_journeys_organization_id', 'journeys', ['organization_id'])
    op.create_index('ix_journeys_agent_id', 'journeys', ['agent_id'])

    op.create_table(
        'journey_progress',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('journey_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('agent_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('customer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('journey_version', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(16), nullable=False, server_default='active'),
        sa.Column('current_step_id', sa.String(64), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('finished_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('goal_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_seen_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['journey_id'], ['journeys.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('journey_id', 'customer_id', name='uq_journey_progress_journey_customer'),
    )
    op.create_index('ix_journey_progress_journey_id', 'journey_progress', ['journey_id'])
    op.create_index('ix_journey_progress_customer_id', 'journey_progress', ['customer_id'])
    op.create_index('uq_journey_progress_one_active', 'journey_progress', ['agent_id', 'customer_id'],
                    unique=True, postgresql_where=sa.text("status = 'active'"))

    op.create_table(
        'journey_step_progress',
        sa.Column('progress_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('step_id', sa.String(64), nullable=False),
        sa.Column('reached_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('done_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('skipped_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('done_by', sa.String(80), nullable=True),
        sa.Column('shown_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['progress_id'], ['journey_progress.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('progress_id', 'step_id'),
    )

    op.create_table(
        'agent_context_keys',
        sa.Column('agent_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('key', sa.String(48), nullable=False),
        sa.Column('source', sa.String(16), nullable=False),
        sa.Column('last_seen_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('agent_id', 'key'),
    )


def downgrade() -> None:
    op.drop_table('agent_context_keys')
    op.drop_table('journey_step_progress')
    op.drop_index('uq_journey_progress_one_active', table_name='journey_progress')
    op.drop_table('journey_progress')
    op.drop_table('journeys')

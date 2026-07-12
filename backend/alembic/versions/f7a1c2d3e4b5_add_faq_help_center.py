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

"""add FAQ + public help center tables

Revision ID: f7a1c2d3e4b5
Revises: drop_slack_tables_001
Create Date: 2026-07-12

New feature: AI-generated FAQs reviewed/published by the org and served as a
public help center on {slug}.chattermate.help or a verified custom domain.

Tables:
- faq_generation_jobs: async generate/import jobs (worker + UI polling)
- help_center_settings: per-org branding, slug, agent mapping, custom domain
- faqs: the question/answer pairs (draft -> published workflow)
- help_center_queries: public "Ask AI" log for metering/analytics

Status/stage columns are plain strings (mirroring knowledge_queue) so new
values never need an ALTER TYPE migration.

Also extends the notificationtype enum with FAQ job outcomes. Labels are the
uppercase member names, matching how the enum was created in
b365b8447598_initial_version. ALTER TYPE ... ADD VALUE requires PostgreSQL 12+
to run inside a transaction; added values cannot be removed on downgrade.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'f7a1c2d3e4b5'
down_revision = 'drop_slack_tables_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'faq_generation_jobs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('job_type', sa.String(), nullable=False),
        sa.Column('knowledge_id', sa.Integer(), nullable=True),
        sa.Column('source_url', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('stage', sa.String(), nullable=False),
        sa.Column('progress_percentage', sa.Float(), nullable=False),
        sa.Column('faqs_created', sa.Integer(), nullable=False),
        sa.Column('error', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['knowledge_id'], ['knowledge.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_faq_generation_jobs_id'), 'faq_generation_jobs', ['id'])
    op.create_index(op.f('ix_faq_generation_jobs_organization_id'), 'faq_generation_jobs', ['organization_id'])
    op.create_index(op.f('ix_faq_generation_jobs_knowledge_id'), 'faq_generation_jobs', ['knowledge_id'])
    # The worker polls for pending/processing rows forever; keep that lookup
    # O(active) as terminal rows accumulate.
    op.create_index(
        'ix_faq_generation_jobs_active',
        'faq_generation_jobs',
        ['status'],
        postgresql_where=sa.text("status IN ('pending', 'processing')"),
    )

    op.create_table(
        'help_center_settings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=False),
        sa.Column('slug', sa.String(length=63), nullable=True),
        sa.Column('title', sa.String(length=120), nullable=True),
        sa.Column('description', sa.String(length=300), nullable=True),
        sa.Column('logo_url', sa.String(), nullable=True),
        sa.Column('brand_color', sa.String(length=9), nullable=False),
        sa.Column('header_links', sa.JSON(), nullable=False),
        sa.Column('cta_text', sa.String(length=40), nullable=True),
        sa.Column('cta_url', sa.String(), nullable=True),
        sa.Column('auto_generate', sa.Boolean(), nullable=False),
        sa.Column('agent_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('ai_search_enabled', sa.Boolean(), nullable=False),
        sa.Column('custom_domain', sa.String(length=255), nullable=True),
        sa.Column('domain_verification_token', sa.String(length=64), nullable=True),
        sa.Column('txt_record_verified', sa.Boolean(), nullable=False),
        sa.Column('cname_record_verified', sa.Boolean(), nullable=False),
        sa.Column('ssl_status', sa.String(), nullable=False),
        sa.Column('domain_verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id'),
        sa.UniqueConstraint('slug'),
        sa.UniqueConstraint('custom_domain'),
        sa.CheckConstraint('slug = lower(slug)', name='ck_help_center_slug_lowercase'),
    )
    op.create_index(op.f('ix_help_center_settings_slug'), 'help_center_settings', ['slug'])
    op.create_index(op.f('ix_help_center_settings_custom_domain'), 'help_center_settings', ['custom_domain'])

    op.create_table(
        'faqs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('question', sa.Text(), nullable=False),
        sa.Column('answer', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('knowledge_id', sa.Integer(), nullable=True),
        sa.Column('source_label', sa.String(length=255), nullable=True),
        sa.Column('generation_job_id', sa.Integer(), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['knowledge_id'], ['knowledge.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['generation_job_id'], ['faq_generation_jobs.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    # Composite indexes lead with organization_id, so no single-column org index.
    op.create_index('ix_faqs_org_status', 'faqs', ['organization_id', 'status'])
    op.create_index('ix_faqs_org_category', 'faqs', ['organization_id', 'category'])
    # FK indexes so knowledge/job deletions don't scan faqs to enforce SET NULL.
    op.create_index(op.f('ix_faqs_knowledge_id'), 'faqs', ['knowledge_id'])
    op.create_index(op.f('ix_faqs_generation_job_id'), 'faqs', ['generation_job_id'])

    op.create_table(
        'help_center_queries',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('query', sa.Text(), nullable=False),
        sa.Column('answered', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_help_center_queries_organization_id'), 'help_center_queries', ['organization_id'])
    op.create_index(op.f('ix_help_center_queries_created_at'), 'help_center_queries', ['created_at'])

    op.execute("ALTER TYPE notificationtype ADD VALUE IF NOT EXISTS 'FAQ_GENERATED'")
    op.execute("ALTER TYPE notificationtype ADD VALUE IF NOT EXISTS 'FAQ_GENERATION_FAILED'")


def downgrade() -> None:
    # The enum values added in upgrade() cannot be removed; delete the rows
    # that reference them so the reverted application enum can still load
    # every remaining notification.
    op.execute("DELETE FROM notifications WHERE type IN ('FAQ_GENERATED', 'FAQ_GENERATION_FAILED')")
    op.drop_table('help_center_queries')
    op.drop_table('faqs')
    op.drop_table('help_center_settings')
    op.drop_table('faq_generation_jobs')

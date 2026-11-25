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

"""add channel_opt_outs

Revision ID: channel_opt_outs_001
Revises: add_agent_offline_ask_email_001
Create Date: 2026-11-25

Contacts who told a business number STOP. Every business-initiated send
checks it (order updates, alerts, inbox templates, app integrations).
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'channel_opt_outs_001'
down_revision = 'add_agent_offline_ask_email_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'channel_opt_outs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('channel_account_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('channel_accounts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('contact', sa.String(64), nullable=False),
        sa.Column('source', sa.String(16), nullable=False),
        sa.Column('opted_out_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint('channel_account_id', 'contact', name='uq_channel_opt_out_contact'),
    )
    op.create_index('ix_channel_opt_outs_organization_id', 'channel_opt_outs', ['organization_id'])


def downgrade() -> None:
    op.drop_index('ix_channel_opt_outs_organization_id', table_name='channel_opt_outs')
    op.drop_table('channel_opt_outs')

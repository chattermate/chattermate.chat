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

"""add agents.offline_ask_email

Revision ID: add_agent_offline_ask_email_001
Revises: add_agent_offline_message_001
Create Date: 2026-11-25

After the offline message, the website asks visitors for an email we don't
have. On by default, so every agent asks unless switched off.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_agent_offline_ask_email_001'
down_revision = 'add_agent_offline_message_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('agents', sa.Column('offline_ask_email', sa.Boolean(),
                                      server_default=sa.text('true'), nullable=False))


def downgrade() -> None:
    op.drop_column('agents', 'offline_ask_email')

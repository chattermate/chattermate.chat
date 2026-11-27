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

"""add agents.handover_notice_enabled + agents.handover_message

Revision ID: add_agent_handover_message_001
Revises: channel_opt_outs_001
Create Date: 2026-11-27

What a messaging-channel customer is told when a teammate joins the chat: on
by default with the built-in text (NULL), as before.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_agent_handover_message_001'
down_revision = 'channel_opt_outs_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('agents', sa.Column('handover_notice_enabled', sa.Boolean(),
                                      server_default=sa.text('true'), nullable=False))
    op.add_column('agents', sa.Column('handover_message', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('agents', 'handover_message')
    op.drop_column('agents', 'handover_notice_enabled')

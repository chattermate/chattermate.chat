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

"""add agents.ticketing_enabled (per-agent native ticketing toggle)

Revision ID: add_agent_tkt_toggle_001
Revises: add_tkt_db_ssh_001
Create Date: 2026-07-17

Per-agent switch for native AI ticketing. Defaults on so paid orgs get
ticketing on every agent out of the box; the org's plan gate still applies on
top of it.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_agent_tkt_toggle_001'
down_revision = 'add_tkt_db_ssh_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'agents',
        sa.Column('ticketing_enabled', sa.Boolean(), server_default=sa.text('true'), nullable=False),
    )


def downgrade() -> None:
    op.drop_column('agents', 'ticketing_enabled')

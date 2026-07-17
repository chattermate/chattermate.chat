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

"""add SSH tunnel fields to ticket_db_connectors

Revision ID: add_tkt_db_ssh_001
Revises: add_tkt_phase4_001
Create Date: 2026-07-17

Production databases are usually reached through a bastion / jump host rather
than directly — this adds optional SSH-tunnel config to the guardrailed DB
connector (key/password encrypted at rest).
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_tkt_db_ssh_001'
down_revision = 'add_tkt_phase4_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('ticket_db_connectors', sa.Column('ssh_enabled', sa.Boolean(), server_default=sa.text('false'), nullable=False))
    op.add_column('ticket_db_connectors', sa.Column('ssh_host', sa.String(length=500), nullable=True))
    op.add_column('ticket_db_connectors', sa.Column('ssh_port', sa.Integer(), server_default='22', nullable=False))
    op.add_column('ticket_db_connectors', sa.Column('ssh_username', sa.String(length=200), nullable=True))
    op.add_column('ticket_db_connectors', sa.Column('encrypted_ssh_password', sa.Text(), nullable=True))
    op.add_column('ticket_db_connectors', sa.Column('encrypted_ssh_private_key', sa.Text(), nullable=True))
    op.add_column('ticket_db_connectors', sa.Column('encrypted_ssh_key_passphrase', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('ticket_db_connectors', 'encrypted_ssh_key_passphrase')
    op.drop_column('ticket_db_connectors', 'encrypted_ssh_private_key')
    op.drop_column('ticket_db_connectors', 'encrypted_ssh_password')
    op.drop_column('ticket_db_connectors', 'ssh_username')
    op.drop_column('ticket_db_connectors', 'ssh_port')
    op.drop_column('ticket_db_connectors', 'ssh_host')
    op.drop_column('ticket_db_connectors', 'ssh_enabled')

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

"""Drop legacy Slack tables — Slack now runs on the unified channel stack

Revision ID: drop_slack_tables_001
Revises: add_channel_tables_001
Create Date: 2026-07-10 22:00:00.000000

The old integration (slack_tokens with plaintext tokens, per-thread
slack_conversations, per-channel agent_slack_configs, workspace storage modes)
is replaced by channel_accounts / channel_conversations / agent_channel_configs.
The old integration had no production users, so no data is migrated. Downgrade
recreates empty tables via the original add_slack_integration_001 shapes.

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'drop_slack_tables_001'
down_revision: Union[str, None] = 'add_channel_tables_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_TABLES = ('slack_conversations', 'agent_slack_configs', 'slack_workspace_configs', 'slack_tokens')


def upgrade() -> None:
    for table in _TABLES:
        op.execute(f'DROP TABLE IF EXISTS {table} CASCADE')
    op.execute('DROP TYPE IF EXISTS storagemode')


def downgrade() -> None:
    # Recreate empty legacy tables by re-running the original migration's DDL.
    from alembic.runtime import migration  # noqa: F401 — keep import local
    import importlib
    legacy = importlib.import_module('add_slack_integration_001')
    legacy.upgrade()

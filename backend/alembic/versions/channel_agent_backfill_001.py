"""Route already-connected channel accounts to their org's only agent

A connected account with no agent config drops every inbound message.
Connecting now assigns the org's agent when it has exactly one
(services/channel_agent_defaults.py); this does the same once for accounts
connected before that. Accounts with any config, even a paused one, and orgs
with several agents are left alone, so no choice a customer made is changed.

Data only: downgrade leaves the configs in place, since they can't be told
apart from ones the customer chose since.

Revision ID: channel_agent_backfill_001
Revises: note_agent_author_001
Create Date: 2026-11-23
"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'channel_agent_backfill_001'
down_revision: Union[str, None] = 'note_agent_author_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        INSERT INTO agent_channel_configs (id, channel_account_id, agent_id, is_active, created_at, updated_at)
        SELECT gen_random_uuid(), ca.id, sole.agent_id, true, now(), now()
        FROM channel_accounts ca
        JOIN (
            SELECT organization_id, (array_agg(id))[1] AS agent_id
            FROM agents
            GROUP BY organization_id
            HAVING count(*) = 1
        ) sole ON sole.organization_id = ca.organization_id
        WHERE ca.is_active
          AND NOT EXISTS (
              SELECT 1 FROM agent_channel_configs c WHERE c.channel_account_id = ca.id
          )
        ON CONFLICT (channel_account_id) DO NOTHING
    """)


def downgrade() -> None:
    pass

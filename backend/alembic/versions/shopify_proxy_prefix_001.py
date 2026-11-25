"""Where each store has the app's App Proxy on its storefront

A merchant can move the proxy from /apps/chattermate (for example to
/a/chattermate) in their Shopify admin. Shopify sends the path with every
signed proxy request; it's kept here so links the app puts in emails (a
back-in-stock email's unsubscribe link) point at the store's own path.
NULL = the default, /apps/chattermate.

Revision ID: shopify_proxy_prefix_001
Revises: channel_agent_backfill_001
Create Date: 2026-11-25
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'shopify_proxy_prefix_001'
down_revision: Union[str, None] = 'channel_agent_backfill_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('shopify_shops', sa.Column('storefront_proxy_prefix', sa.String(length=80), nullable=True))


def downgrade() -> None:
    op.drop_column('shopify_shops', 'storefront_proxy_prefix')

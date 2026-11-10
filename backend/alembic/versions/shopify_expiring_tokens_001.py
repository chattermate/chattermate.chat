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

"""Shopify expiring offline access tokens: refresh token and expiries

Revision ID: shopify_expiring_tokens_001
Revises: integration_secrets_001

Existing rows keep their non-expiring token with no refresh token; the app
exchanges each one for an expiring token the next time it uses it (see
app.services.shopify_tokens). refresh_token is encrypted by the model like
access_token, so it is Text.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'shopify_expiring_tokens_001'
down_revision: Union[str, None] = 'integration_secrets_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('shopify_shops', sa.Column('refresh_token', sa.Text(), nullable=True))
    op.add_column('shopify_shops', sa.Column('access_token_expires_at', sa.DateTime(), nullable=True))
    op.add_column('shopify_shops', sa.Column('refresh_token_expires_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # A migrated token keeps working after downgrade only until it expires;
    # the older code has no way to refresh it.
    op.drop_column('shopify_shops', 'refresh_token_expires_at')
    op.drop_column('shopify_shops', 'access_token_expires_at')
    op.drop_column('shopify_shops', 'refresh_token')

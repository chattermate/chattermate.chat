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

"""Add oauth_state fields to shopify_shops

Revision ID: 7af9828611e7
Revises: d9a4b9902f80
Create Date: 2025-10-28 20:28:32.936719

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7af9828611e7'
down_revision: Union[str, None] = 'd9a4b9902f80'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add oauth_state and oauth_state_expiry columns to shopify_shops table
    op.add_column('shopify_shops', sa.Column('oauth_state', sa.String(), nullable=True))
    op.add_column('shopify_shops', sa.Column('oauth_state_expiry', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # Remove oauth_state and oauth_state_expiry columns from shopify_shops table
    op.drop_column('shopify_shops', 'oauth_state_expiry')
    op.drop_column('shopify_shops', 'oauth_state')

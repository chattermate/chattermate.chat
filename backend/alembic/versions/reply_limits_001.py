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

"""Per-customer limits on messages an agent's AI answers

Revision ID: reply_limits_001
Revises: journeys_001
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'reply_limits_001'
down_revision: Union[str, None] = 'journeys_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Nullable with no default: every existing agent stays unlimited.
    op.add_column('agents', sa.Column('messages_per_customer_per_minute', sa.Integer(), nullable=True))
    op.add_column('agents', sa.Column('replies_per_customer_per_day', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('agents', 'replies_per_customer_per_day')
    op.drop_column('agents', 'messages_per_customer_per_minute')

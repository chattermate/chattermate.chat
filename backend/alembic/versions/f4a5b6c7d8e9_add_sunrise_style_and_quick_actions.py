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

"""add SUNRISE chat style + welcome_message and quick_actions columns

Adds:
- SUNRISE value to the `chatstyle` enum (a light theme).
- `welcome_message` (Text): first in-conversation agent bubble shown on open.
- `quick_actions` (JSON): predefined quick-action button labels.

Revision ID: f4a5b6c7d8e9
Revises: e3f4a5b6c7d8
Create Date: 2026-06-30 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'f4a5b6c7d8e9'
down_revision: Union[str, None] = 'e3f4a5b6c7d8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    # Add the new value to the native Postgres `chatstyle` enum. ALTER TYPE ...
    # ADD VALUE cannot run inside a transaction block, so use an autocommit block.
    if bind.dialect.name == "postgresql":
        with op.get_context().autocommit_block():
            op.execute("ALTER TYPE chatstyle ADD VALUE IF NOT EXISTS 'SUNRISE'")

    op.add_column(
        'agent_customizations',
        sa.Column('welcome_message', sa.Text(), nullable=True)
    )
    op.add_column(
        'agent_customizations',
        sa.Column('quick_actions', sa.JSON(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('agent_customizations', 'quick_actions')
    op.drop_column('agent_customizations', 'welcome_message')
    # Postgres cannot cleanly drop individual enum values; the added chatstyle
    # value is intentionally left in place.

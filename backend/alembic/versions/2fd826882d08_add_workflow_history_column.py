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

"""add_workflow_history_column

Revision ID: 2fd826882d08
Revises: 0ee9dbc73d9e
Create Date: 2025-07-24 21:10:23.798939

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2fd826882d08'
down_revision: Union[str, None] = '0ee9dbc73d9e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add workflow_history column to store form submissions and workflow interactions
    op.add_column('session_to_agents', sa.Column('workflow_history', sa.JSON(), nullable=True))


def downgrade() -> None:
    # Remove workflow_history column
    op.drop_column('session_to_agents', 'workflow_history')

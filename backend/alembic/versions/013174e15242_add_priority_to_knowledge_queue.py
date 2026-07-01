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

"""add_priority_to_knowledge_queue

Revision ID: 013174e15242
Revises: dc827ab30bd4
Create Date: 2025-10-06 14:35:40.640506

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '013174e15242'
down_revision: Union[str, None] = 'dc827ab30bd4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add priority column with default value 0 and create index
    op.add_column('knowledge_queue', sa.Column('priority', sa.Integer(), nullable=False, server_default='0'))
    op.create_index(op.f('ix_knowledge_queue_priority'), 'knowledge_queue', ['priority'], unique=False)


def downgrade() -> None:
    # Remove index and column
    op.drop_index(op.f('ix_knowledge_queue_priority'), table_name='knowledge_queue')
    op.drop_column('knowledge_queue', 'priority')

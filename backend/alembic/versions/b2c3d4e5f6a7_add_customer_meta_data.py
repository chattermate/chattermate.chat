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

"""add meta_data column to customers

Adds:
- `meta_data` (JSON): arbitrary integrator-supplied fields (e.g. student_name,
  center_name) passed via POST /generate-token's `custom_data`, surfaced to agents
  in the chat inbox.

Revision ID: b2c3d4e5f6a7
Revises: f4a5b6c7d8e9
Create Date: 2026-07-06 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'f4a5b6c7d8e9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'customers',
        sa.Column('meta_data', sa.JSON(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('customers', 'meta_data')

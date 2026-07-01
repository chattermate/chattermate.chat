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

"""make user org and role nullable

Revision ID: 52e6ca829bb8
Revises: b365b8447598
Create Date: 2024-02-04 18:54:47.823

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '52e6ca829bb8'
down_revision: Union[str, None] = 'b365b8447598'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Make organization_id nullable
    op.alter_column('users', 'organization_id',
               existing_type=sa.UUID(),
               nullable=True)
    
    # Make role_id nullable
    op.alter_column('users', 'role_id',
               existing_type=sa.INTEGER(),
               nullable=True)


def downgrade() -> None:
    # Revert organization_id to non-nullable
    op.alter_column('users', 'organization_id',
               existing_type=sa.UUID(),
               nullable=False)
    
    # Revert role_id to non-nullable
    op.alter_column('users', 'role_id',
               existing_type=sa.INTEGER(),
               nullable=False)

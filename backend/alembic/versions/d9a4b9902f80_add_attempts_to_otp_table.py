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

"""add_attempts_to_otp_table

Revision ID: d9a4b9902f80
Revises: 013174e15242
Create Date: 2025-10-07 19:24:50.790908

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd9a4b9902f80'
down_revision: Union[str, None] = '013174e15242'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if enterprise schema exists before adding column
    # In open-source version, enterprise schema doesn't exist
    connection = op.get_bind()
    
    # Check if enterprise schema exists
    schema_exists = connection.execute(
        sa.text("SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'enterprise')")
    ).scalar()
    
    if schema_exists:
        # Add attempts column to otps table in enterprise schema
        op.add_column('otps', sa.Column('attempts', sa.Integer(), nullable=False, server_default='0'), schema='enterprise')


def downgrade() -> None:
    # Check if enterprise schema exists before removing column
    # In open-source version, enterprise schema doesn't exist
    connection = op.get_bind()
    
    # Check if enterprise schema exists
    schema_exists = connection.execute(
        sa.text("SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'enterprise')")
    ).scalar()
    
    if schema_exists:
        # Remove attempts column from otps table in enterprise schema
        op.drop_column('otps', 'attempts', schema='enterprise')

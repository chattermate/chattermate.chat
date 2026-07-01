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

"""Add allowed_attachment_types to agents table

Revision ID: add_allowed_attachment_types_001
Revises: add_slack_integration_001
Create Date: 2024-12-17

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_allowed_attachment_types_001'
down_revision: Union[str, Sequence[str]] = 'add_slack_integration_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add allowed_attachment_types column as JSON
    op.add_column('agents', 
        sa.Column('allowed_attachment_types', sa.JSON(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('agents', 'allowed_attachment_types')

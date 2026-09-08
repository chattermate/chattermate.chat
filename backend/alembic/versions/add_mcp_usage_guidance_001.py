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

"""Add mcp_tools.usage_guidance

Operator-written notes on what an MCP source holds and how to query it.
Reaches the model as agno per-toolkit instructions so investigations stop
inventing index and field names (#318). Nullable with no server default, so
existing rows stay NULL and their prompts are unchanged.

Revision ID: add_mcp_usage_guidance_001
Revises: add_openai_compat_ai_model_001
Create Date: 2026-09-08 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'add_mcp_usage_guidance_001'
down_revision: Union[str, None] = 'add_openai_compat_ai_model_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'mcp_tools',
        sa.Column('usage_guidance', sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('mcp_tools', 'usage_guidance')

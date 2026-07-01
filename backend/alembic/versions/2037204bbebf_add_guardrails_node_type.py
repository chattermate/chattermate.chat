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

"""add guardrails node type

Revision ID: 2037204bbebf
Revises: 7af9828611e7
Create Date: 2025-10-29 11:47:00.000000

"""
from typing import Sequence, Union

from alembic import op
# revision identifiers, used by Alembic.
revision: str = '2037204bbebf'
down_revision: Union[str, None] = '7af9828611e7'


def upgrade() -> None:
    # Add GUARDRAILS to the NodeType enum
    op.execute("ALTER TYPE nodetype ADD VALUE IF NOT EXISTS 'GUARDRAILS'")


def downgrade() -> None:
    # First, delete or convert any existing GUARDRAILS nodes
    # Option 1: Delete GUARDRAILS nodes (uncomment if you want to delete them)
    # op.execute("DELETE FROM workflow_nodes WHERE node_type = 'GUARDRAILS'")
    
    # Option 2: Convert GUARDRAILS nodes to ACTION nodes (safer - preserves data)
    op.execute("UPDATE workflow_nodes SET node_type = 'ACTION' WHERE node_type = 'GUARDRAILS'")
    
    # Create a new enum without the guardrails value
    op.execute("""
        CREATE TYPE nodetype_new AS ENUM (
            'MESSAGE','LLM','CONDITION','FORM','ACTION','HUMAN_TRANSFER','WAIT','END','LANDING_PAGE','USER_INPUT'
        )
    """)
    
    # Update the column type to use the new enum
    op.execute("ALTER TABLE workflow_nodes ALTER COLUMN node_type TYPE nodetype_new USING node_type::text::nodetype_new")
    
    # Drop the old enum
    op.execute("DROP TYPE nodetype")
    
    # Rename the new enum to the original name
    op.execute("ALTER TYPE nodetype_new RENAME TO nodetype")

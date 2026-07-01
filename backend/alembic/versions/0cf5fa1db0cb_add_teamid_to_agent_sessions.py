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

"""add_teamid_to_agent_sessions

Revision ID: 0cf5fa1db0cb
Revises: 91a148726029
Create Date: 2025-03-21 13:57:55.161703

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0cf5fa1db0cb'
down_revision: Union[str, None] = '91a148726029'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Check if 'ai' schema and agent_sessions table exist before attempting to modify
    conn = op.get_bind()
    
    # Check if schema exists
    schema_result = conn.execute(sa.text("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'ai'"))
    schema_exists = schema_result.fetchone() is not None
    
    if not schema_exists:
        print("Schema 'ai' does not exist, skipping migration")
        return
    
    # Check if table exists
    table_result = conn.execute(sa.text(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'ai' AND table_name = 'agent_sessions'"
    ))
    table_exists = table_result.fetchone() is not None
    
    if table_exists:
        # Add team_id column to ai.agent_sessions table
        op.add_column('agent_sessions', 
            sa.Column('team_id', sa.UUID(), nullable=True),
            schema='ai'
        )
    else:
        print("Table 'ai.agent_sessions' does not exist, skipping migration")


def downgrade() -> None:
    # Check if 'ai' schema and agent_sessions table exist before attempting to modify
    conn = op.get_bind()
    
    # Check if schema exists
    schema_result = conn.execute(sa.text("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'ai'"))
    schema_exists = schema_result.fetchone() is not None
    
    if not schema_exists:
        print("Schema 'ai' does not exist, skipping migration rollback")
        return
    
    # Check if table exists
    table_result = conn.execute(sa.text(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'ai' AND table_name = 'agent_sessions'"
    ))
    table_exists = table_result.fetchone() is not None
    
    if table_exists:
        # Drop team_id column from ai.agent_sessions table
        op.drop_column('agent_sessions', 'team_id', schema='ai')
    else:
        print("Table 'ai.agent_sessions' does not exist, skipping migration rollback")

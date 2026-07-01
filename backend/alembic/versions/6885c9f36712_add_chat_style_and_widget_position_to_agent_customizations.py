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

"""add chat_style and widget_position to agent_customizations

Revision ID: 6885c9f36712
Revises: 9ce623009955
Create Date: 2025-01-27 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6885c9f36712'
down_revision: Union[str, None] = '9ce623009955'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create ChatStyle enum
    chatstyle_enum = sa.Enum('CHATBOT', 'ASK_ANYTHING', name='chatstyle')
    chatstyle_enum.create(op.get_bind())
    
    # Create WidgetPosition enum
    widgetposition_enum = sa.Enum('FLOATING', 'FIXED', name='widgetposition')
    widgetposition_enum.create(op.get_bind())
    
    # Add columns to agent_customizations table as nullable first
    op.add_column('agent_customizations', 
        sa.Column('chat_style', chatstyle_enum, nullable=True)
    )
    op.add_column('agent_customizations', 
        sa.Column('widget_position', widgetposition_enum, nullable=True)
    )
    
    # Update existing rows with default values
    op.execute("UPDATE agent_customizations SET chat_style = 'CHATBOT' WHERE chat_style IS NULL")
    op.execute("UPDATE agent_customizations SET widget_position = 'FLOATING' WHERE widget_position IS NULL")
    
    # Now make the columns NOT NULL
    op.alter_column('agent_customizations', 'chat_style', nullable=False)
    op.alter_column('agent_customizations', 'widget_position', nullable=False)


def downgrade() -> None:
    # Drop columns
    op.drop_column('agent_customizations', 'widget_position')
    op.drop_column('agent_customizations', 'chat_style')
    
    # Drop enums
    sa.Enum(name='widgetposition').drop(op.get_bind())
    sa.Enum(name='chatstyle').drop(op.get_bind()) 
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

"""add sentiment analysis columns

Revision ID: add_sentiment_analysis_001
Revises: add_widget_apps_001
Create Date: 2026-03-16 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_sentiment_analysis_001'
down_revision: Union[str, None] = 'add_widget_apps_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add sentiment columns to chat_history
    op.add_column('chat_history', sa.Column('sentiment_label', sa.String(), nullable=True))
    op.add_column('chat_history', sa.Column('sentiment_score', sa.Float(), nullable=True))

    # Add sentiment columns to session_to_agents
    op.add_column('session_to_agents', sa.Column('sentiment_label', sa.String(), nullable=True))
    op.add_column('session_to_agents', sa.Column('sentiment_score', sa.Float(), nullable=True))

    # Create indexes for efficient sentiment queries
    op.create_index(
        'ix_chat_history_sentiment_label',
        'chat_history',
        ['sentiment_label'],
        unique=False
    )
    op.create_index(
        'ix_session_to_agents_sentiment_label',
        'session_to_agents',
        ['sentiment_label'],
        unique=False
    )


def downgrade() -> None:
    op.drop_index('ix_session_to_agents_sentiment_label', table_name='session_to_agents')
    op.drop_index('ix_chat_history_sentiment_label', table_name='chat_history')
    op.drop_column('session_to_agents', 'sentiment_score')
    op.drop_column('session_to_agents', 'sentiment_label')
    op.drop_column('chat_history', 'sentiment_score')
    op.drop_column('chat_history', 'sentiment_label')

"""add sentiment analysis columns

Revision ID: add_sentiment_analysis_001
Revises: 2381319791e8
Create Date: 2026-03-16 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_sentiment_analysis_001'
down_revision: Union[str, None] = '2381319791e8'
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

"""A person's sent reply can be edited: the original text is kept

chat_history.original_message: what the reply said before its first edit
(encrypted, as the message is). The edit time is in the row's attributes
(edited_at), which the inbox and the widget already read.

Revision ID: message_edits_001
Revises: conversation_notes_001
Create Date: 2026-11-14
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# Keep revision ids under 32 characters: alembic_version.version_num is varchar(32).
revision: str = 'message_edits_001'
down_revision: Union[str, None] = 'conversation_notes_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # chat_history is written by every message: fail fast rather than queue them behind this
    op.execute("SET LOCAL lock_timeout = '5s'")
    op.add_column('chat_history', sa.Column('original_message', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('chat_history', 'original_message')

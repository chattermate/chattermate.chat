"""Add allow_attachments to agents table

Revision ID: add_allow_attachments_001
Revises: abc123456789, 910bfe03518b
Create Date: 2025-11-08 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_allow_attachments_001'
down_revision: Union[str, Sequence[str]] = ('abc123456789', '910bfe03518b')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('agents', 
        sa.Column('allow_attachments', sa.Boolean(), nullable=False, server_default='false')
    )


def downgrade() -> None:
    op.drop_column('agents', 'allow_attachments')

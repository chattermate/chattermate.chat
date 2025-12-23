"""Add require_token_auth to agents table

Revision ID: add_require_token_auth_001
Revises: add_allow_attachments_001
Create Date: 2025-12-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_require_token_auth_001'
down_revision: Union[str, Sequence[str]] = 'add_allow_attachments_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('agents', 
        sa.Column('require_token_auth', sa.Boolean(), nullable=False, server_default='false')
    )


def downgrade() -> None:
    op.drop_column('agents', 'require_token_auth')

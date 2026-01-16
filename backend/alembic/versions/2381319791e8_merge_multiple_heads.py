"""merge multiple heads

Revision ID: 2381319791e8
Revises: add_allowed_attachment_types_001, add_require_token_auth_001
Create Date: 2026-01-08 10:31:54.013991

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2381319791e8'
down_revision: Union[str, None] = ('add_allowed_attachment_types_001', 'add_require_token_auth_001')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

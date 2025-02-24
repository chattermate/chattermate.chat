"""make user org and role nullable

Revision ID: 52e6ca829bb8
Revises: b365b8447598
Create Date: 2024-02-04 18:54:47.823

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '52e6ca829bb8'
down_revision: Union[str, None] = 'b365b8447598'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Make organization_id nullable
    op.alter_column('users', 'organization_id',
               existing_type=sa.UUID(),
               nullable=True)
    
    # Make role_id nullable
    op.alter_column('users', 'role_id',
               existing_type=sa.INTEGER(),
               nullable=True)


def downgrade() -> None:
    # Revert organization_id to non-nullable
    op.alter_column('users', 'organization_id',
               existing_type=sa.UUID(),
               nullable=False)
    
    # Revert role_id to non-nullable
    op.alter_column('users', 'role_id',
               existing_type=sa.INTEGER(),
               nullable=False)

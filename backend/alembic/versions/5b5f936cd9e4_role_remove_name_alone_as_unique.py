"""Role remove name alone as unique

Revision ID: 5b5f936cd9e4
Revises: 52e6ca829bb8
Create Date: 2025-02-08 07:36:33.283138

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5b5f936cd9e4'
down_revision: Union[str, None] = '52e6ca829bb8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('roles_name_key', 'roles', type_='unique')
    op.create_unique_constraint('uq_role_name_org', 'roles', ['name', 'organization_id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('uq_role_name_org', 'roles', type_='unique')
    op.create_unique_constraint('roles_name_key', 'roles', ['name'])
    # ### end Alembic commands ###

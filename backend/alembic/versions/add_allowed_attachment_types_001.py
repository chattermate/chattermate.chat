"""Add allowed_attachment_types to agents table

Revision ID: add_allowed_attachment_types_001
Revises: add_slack_integration_001
Create Date: 2024-12-17

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_allowed_attachment_types_001'
down_revision: Union[str, Sequence[str]] = 'add_slack_integration_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add allowed_attachment_types column as JSON
    op.add_column('agents', 
        sa.Column('allowed_attachment_types', sa.JSON(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('agents', 'allowed_attachment_types')

"""add_file_attachments_table

Revision ID: abc123456789
Revises: 0cf34ff05aee
Create Date: 2025-10-30 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'abc123456789'
down_revision: Union[str, None] = '0cf34ff05aee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create file_attachments table
    op.create_table('file_attachments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('file_url', sa.String(), nullable=False),
        sa.Column('filename', sa.String(), nullable=False),
        sa.Column('content_type', sa.String(), nullable=False),
        sa.Column('file_size', sa.BigInteger(), nullable=False),
        sa.Column('chat_history_id', sa.Integer(), nullable=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('uploaded_by_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('uploaded_by_customer_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['chat_history_id'], ['chat_history.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['uploaded_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['uploaded_by_customer_id'], ['customers.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_file_attachments_id'), 'file_attachments', ['id'], unique=False)


def downgrade() -> None:
    # Drop the table and index
    op.drop_index(op.f('ix_file_attachments_id'), table_name='file_attachments')
    op.drop_table('file_attachments')

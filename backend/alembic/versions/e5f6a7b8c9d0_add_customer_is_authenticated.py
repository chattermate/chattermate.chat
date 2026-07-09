"""add customers.is_authenticated to mark integration-authenticated people

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-07-09

People who were identified via POST /generate-token (the embedding app asserted a
known customer_email) are the business's existing customers, not organic leads, and
must be excluded from the People/leads views. This was previously inferred from
meta_data being NULL, but SQLAlchemy stores an empty JSON value as JSON null rather
than SQL NULL, so `meta_data IS NULL` matched nothing and hid every visitor/lead.
Replace that heuristic with an explicit boolean flag.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'e5f6a7b8c9d0'
down_revision = 'd4e5f6a7b8c9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'customers',
        sa.Column('is_authenticated', sa.Boolean(), nullable=False, server_default='false'),
    )


def downgrade() -> None:
    op.drop_column('customers', 'is_authenticated')

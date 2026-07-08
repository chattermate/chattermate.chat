"""add customers.merged_into_customer_id for visitor→customer merge

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-07-08

When an anonymous widget visitor shares an email that already belongs to an
existing customer in the org, the visitor row is merged into that customer.
The old row keeps a pointer so stale device tokens resolve to the target.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'd4e5f6a7b8c9'
down_revision = 'c3d4e5f6a7b8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'customers',
        sa.Column('merged_into_customer_id', postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        'fk_customers_merged_into', 'customers', 'customers',
        ['merged_into_customer_id'], ['id'],
    )
    op.create_index('ix_customers_merged_into', 'customers', ['merged_into_customer_id'])


def downgrade() -> None:
    op.drop_index('ix_customers_merged_into', table_name='customers')
    op.drop_constraint('fk_customers_merged_into', 'customers', type_='foreignkey')
    op.drop_column('customers', 'merged_into_customer_id')

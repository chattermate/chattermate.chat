"""add cta_enabled to help_center_settings

Lets the primary button (CTA) in the public help-center header be toggled on/off
independently of whether its text/URL are filled in. Existing rows default to
enabled to preserve the prior behaviour (CTA shown when text and URL are set).

Revision ID: add_hc_cta_enabled_001
Revises: add_hc_chat_widget_001
Create Date: 2026-07-13
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_hc_cta_enabled_001'
down_revision = 'add_hc_chat_widget_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'help_center_settings',
        sa.Column('cta_enabled', sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.alter_column('help_center_settings', 'cta_enabled', server_default=None)


def downgrade() -> None:
    op.drop_column('help_center_settings', 'cta_enabled')

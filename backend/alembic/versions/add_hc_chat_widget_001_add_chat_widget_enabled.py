"""add chat_widget_enabled to help_center_settings

Splits the public help center's two AI surfaces into independent toggles: the
inline AI quick-summary in search (ai_search_enabled) and the embedded chat
widget (chat_widget_enabled). Existing rows default to enabled to preserve the
prior behaviour, where a mapped agent's widget was shown alongside AI search.

Revision ID: add_hc_chat_widget_001
Revises: f7a1c2d3e4b5
Create Date: 2026-07-13
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_hc_chat_widget_001'
down_revision = 'f7a1c2d3e4b5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'help_center_settings',
        sa.Column('chat_widget_enabled', sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    # Drop the server default now that existing rows are backfilled — the model
    # supplies the default on insert, matching ai_search_enabled.
    op.alter_column('help_center_settings', 'chat_widget_enabled', server_default=None)


def downgrade() -> None:
    op.drop_column('help_center_settings', 'chat_widget_enabled')

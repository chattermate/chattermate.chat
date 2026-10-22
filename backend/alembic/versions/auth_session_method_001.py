"""auth_sessions.auth_method and identity_id: how a session was opened

Revision ID: auth_session_method_001
Revises: user_identities_001
Create Date: 2026-10-22

NULL on existing sessions, which predate the record.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'auth_session_method_001'
down_revision: Union[str, None] = 'user_identities_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('auth_sessions', sa.Column('auth_method', sa.String(), nullable=True))
    op.add_column('auth_sessions', sa.Column('identity_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(
        'fk_auth_sessions_identity_id', 'auth_sessions', 'user_identities',
        ['identity_id'], ['id'], ondelete='SET NULL',
    )
    op.create_index('ix_auth_sessions_identity_id', 'auth_sessions', ['identity_id'])


def downgrade() -> None:
    op.drop_index('ix_auth_sessions_identity_id', table_name='auth_sessions')
    op.drop_constraint('fk_auth_sessions_identity_id', 'auth_sessions', type_='foreignkey')
    op.drop_column('auth_sessions', 'identity_id')
    op.drop_column('auth_sessions', 'auth_method')

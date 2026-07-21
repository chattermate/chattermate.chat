"""merge ai-ticketing + agent-queue heads

Revision ID: a1dbf557bbb0
Revises: add_agent_tkt_toggle_001, b7c4e91a2d38
Create Date: 2026-07-20 11:02:56.904328

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1dbf557bbb0'
down_revision: Union[str, None] = ('add_agent_tkt_toggle_001', 'b7c4e91a2d38')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

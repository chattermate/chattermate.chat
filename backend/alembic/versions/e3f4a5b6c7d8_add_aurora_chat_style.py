"""add AURORA chat style to agent_customizations

Adds the new AURORA value to the `chatstyle` enum (a dark "ask-me-anything"
design with a gradient orb avatar). The orb-vs-photo avatar choice is stored in
the existing `customization_metadata` JSON column, so no schema change is needed
for that.

Revision ID: e3f4a5b6c7d8
Revises: d2e3f4a5b6c7
Create Date: 2026-06-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'e3f4a5b6c7d8'
down_revision: Union[str, None] = 'd2e3f4a5b6c7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    # Add the new value to the native Postgres `chatstyle` enum. ALTER TYPE ...
    # ADD VALUE cannot run inside a transaction block, so use an autocommit block.
    if bind.dialect.name == "postgresql":
        with op.get_context().autocommit_block():
            op.execute("ALTER TYPE chatstyle ADD VALUE IF NOT EXISTS 'AURORA'")


def downgrade() -> None:
    # Postgres cannot cleanly drop individual enum values; the added chatstyle
    # value is intentionally left in place.
    pass

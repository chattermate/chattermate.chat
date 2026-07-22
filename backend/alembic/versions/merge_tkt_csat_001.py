"""
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

"""merge ticket CSAT and investigation-metering migration heads

Revision ID: merge_tkt_csat_001
Revises: add_tkt_csat_001, add_tkt_metered_001
Create Date: 2026-07-22

The CSAT work branched from add_tkt_row_scope_001 while investigation metering
branched from the same revision, leaving two alembic heads. Deploy runs
`alembic upgrade head`, which refuses to pick between them and fails the
container start, so this no-op merge rejoins them. The revision id is kept
short — alembic_version.version_num is varchar(32).
"""
from alembic import op  # noqa: F401
import sqlalchemy as sa  # noqa: F401

# revision identifiers, used by Alembic.
revision = 'merge_tkt_csat_001'
down_revision = ('add_tkt_csat_001', 'add_tkt_metered_001')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

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

"""prefix stored local upload paths with the static mount

Revision ID: normalise_upload_prefix_001
Revises: repair_agent_role_seed_001
Create Date: 2026-08-08

The app had two conventions for a stored local upload. store_upload wrote
`/api/v1/uploads/...`, matching the static mount; agent photos and profile
pictures wrote a bare `/uploads/...`. The frontend resolves stored paths
against the API origin, so the bare ones came out as `https://host/uploads/...`
and 404'd — every agent avatar and teammate avatar was broken on a self-hosted
install using local file storage. (S3 deployments were unaffected: those store
absolute URLs, which pass through untouched.)

The writers now emit the prefix. This brings the existing rows over.

Only values starting exactly with `/uploads/` are touched, so absolute S3 URLs,
data URIs and already-prefixed rows are left alone and re-running is a no-op.

`/api/v1` is written literally rather than read from settings.API_V1_STR: the
static mount in main.py hardcodes it too, and a migration should not change
shape with runtime config.
"""
from alembic import op

# revision identifiers, used by Alembic.
revision = 'normalise_upload_prefix_001'
down_revision = 'repair_agent_role_seed_001'
branch_labels = None
depends_on = None

# (table, column) pairs that hold a stored upload path written by the
# bare-/uploads/ writers.
_COLUMNS = [
    ('agent_customizations', 'photo_url'),
    ('users', 'profile_pic'),
]


def upgrade() -> None:
    for table, column in _COLUMNS:
        op.execute(
            f"""
            UPDATE {table}
               SET {column} = '/api/v1' || {column}
             WHERE {column} LIKE '/uploads/%'
            """
        )


def downgrade() -> None:
    """Strips the prefix off every local path in these two columns, including
    rows this migration did not create. That is deliberate: the reverted code
    writes bare paths and reads them the same way, so the column should end up
    wholly on the old convention rather than half on each."""
    for table, column in _COLUMNS:
        op.execute(
            f"""
            UPDATE {table}
               SET {column} = substring({column} from length('/api/v1') + 1)
             WHERE {column} LIKE '/api/v1/uploads/%'
            """
        )

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

"""merge the reply-limits and gpt-6-luna heads

Revision ID: merge_reply_limits_gpt6_001
Revises: reply_limits_001, chattermate_model_gpt6_luna_001
Create Date: 2026-11-07

#400 and #401 both branched from journeys_001, which left two heads, and
`alembic upgrade head` refuses to run with more than one. A merge revision
rather than re-parenting either one, so a database already at either head
still upgrades cleanly.
"""

# revision identifiers, used by Alembic.
revision = 'merge_reply_limits_gpt6_001'
down_revision = ('reply_limits_001', 'chattermate_model_gpt6_luna_001')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

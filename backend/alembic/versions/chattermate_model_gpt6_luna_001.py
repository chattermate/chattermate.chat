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

"""move managed ChatterMate AI configs off the GPT-4o family

Revision ID: chattermate_model_gpt6_luna_001
Revises: journeys_001
Create Date: 2026-11-02

OpenAI shuts down gpt-4o, gpt-4o-mini, gpt-4.1 and gpt-4.1-mini on
2027-01-14 (o4-mini and gpt-4.1-nano already went on 2026-10-23) and names
gpt-6-luna as the successor. A managed config copies CHATTERMATE_MODEL_NAME
into ai_configs.model_name when it is created, so changing the env var alone
leaves every existing hosted org on the old model.

Only CHATTERMATE rows are touched: that model is ours to choose. A
bring-your-own-key OPENAI row is the customer's choice on the customer's bill,
so it is left alone. Community installs have no CHATTERMATE rows, which makes
this a no-op outside hosted.
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'chattermate_model_gpt6_luna_001'
down_revision = 'journeys_001'
branch_labels = None
depends_on = None

# Frozen on purpose: a migration must not follow later edits to the catalog.
NEW_MODEL = 'gpt-6-luna'
RETIRED_MODELS = (
    'gpt-4o', 'gpt-4o-2024-05-13', 'gpt-4o-2024-08-06', 'gpt-4o-2024-11-20',
    'gpt-4o-mini', 'gpt-4o-mini-2024-07-18',
    'gpt-4.1', 'gpt-4.1-2025-04-14', 'gpt-4.1-mini', 'gpt-4.1-mini-2025-04-14',
    'gpt-4.1-nano', 'gpt-4.1-nano-2025-04-14', 'o4-mini', 'o4-mini-2025-04-16',
)


def upgrade() -> None:
    op.execute(
        sa.text(
            "UPDATE ai_configs SET model_name = :new "
            "WHERE model_type = 'CHATTERMATE' AND model_name IN :retired"
        ).bindparams(
            sa.bindparam('new', NEW_MODEL),
            sa.bindparam('retired', list(RETIRED_MODELS), expanding=True),
        )
    )


def downgrade() -> None:
    """Deliberately empty: the old model IDs stop working on 2027-01-14, and
    this cannot tell the rows it moved from ones created on gpt-6-luna."""

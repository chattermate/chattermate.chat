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

FAQ generation-job metering + targeting columns:
- llm_calls / metered: per-job LLM call counter for hosted-model message
  metering (metered stamped at enqueue from the org's AI config).
- knowledge_ids: optional explicit source narrowing for GENERATE_ALL jobs.
- source_file_name: original filename for PDF imports.

Revision ID: add_hc_job_meter_001
Revises: add_hc_faq_slug_001
"""

import sqlalchemy as sa
from alembic import op

revision = "add_hc_job_meter_001"
down_revision = "add_hc_faq_slug_001"
branch_labels = None
depends_on = None

TABLE = "faq_generation_jobs"


def upgrade() -> None:
    op.add_column(TABLE, sa.Column("llm_calls", sa.Integer(), nullable=False, server_default="0"))
    op.add_column(TABLE, sa.Column("metered", sa.Boolean(), nullable=False, server_default=sa.text("true")))
    op.add_column(TABLE, sa.Column("knowledge_ids", sa.JSON(), nullable=True))
    op.add_column(TABLE, sa.Column("source_file_name", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column(TABLE, "source_file_name")
    op.drop_column(TABLE, "knowledge_ids")
    op.drop_column(TABLE, "metered")
    op.drop_column(TABLE, "llm_calls")

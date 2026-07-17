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

customers.phone: a second identity key beside email, normalized E.164 with a
leading '+'. Phone-bearing channels (WhatsApp, SMS, Telegram share-contact)
resolve people by it, so it must be unique per org — but only where present,
hence a partial unique index rather than a UniqueConstraint (rows without a
phone are the overwhelming majority and must never collide). The index lives
only here, not in the model's __table_args__, following the
uq_faq_generation_jobs_one_active precedent: partial indexes are Postgres
syntax and the sqlite test schema is built from the models.

No backfill: WhatsApp/SMS aren't live yet, so no rows carry a phone anywhere
to backfill from.

Revision ID: add_customer_phone_001
Revises: add_hc_faq_feedback_001
"""

import sqlalchemy as sa
from alembic import op

revision = "add_customer_phone_001"
down_revision = "add_hc_faq_feedback_001"
branch_labels = None
depends_on = None

INDEX = "uix_customer_phone_org"


def upgrade() -> None:
    op.add_column("customers", sa.Column("phone", sa.String(), nullable=True))
    op.create_index(
        INDEX,
        "customers",
        ["organization_id", "phone"],
        unique=True,
        postgresql_where=sa.text("phone IS NOT NULL"),
    )


def downgrade() -> None:
    op.drop_index(INDEX, table_name="customers")
    op.drop_column("customers", "phone")

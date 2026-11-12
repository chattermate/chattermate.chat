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

import uuid

from sqlalchemy import JSON, Column, DateTime, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database import Base


class ShopifyComplianceEvent(Base):
    """What Shopify asked of us about a shop's data, and what we did.

    One row per uninstall or privacy webhook. It is the record that a redact
    request was fulfilled, so it must never hold the personal data it is about:
    no email, no phone, no message text — only Shopify's own ids and counts.

    It also outlives the shop row. app/uninstalled deletes the shop at once, but
    shop/redact and late customers/redact requests arrive afterwards and still
    need to know which organization held that store's conversations; the
    uninstall row carries that link. organization_id has no foreign key for the
    same reason — the record must survive the organization too.
    """
    __tablename__ = "shopify_compliance_events"
    __table_args__ = (
        UniqueConstraint("webhook_id", name="uq_shopify_compliance_events_webhook_id"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic = Column(String(40), nullable=False)
    shop_domain = Column(String, nullable=False, index=True)
    organization_id = Column(UUID(as_uuid=True), nullable=True)
    # X-Shopify-Webhook-Id. Shopify retries with the same id, so a repeat is
    # answered from this row instead of being processed twice.
    webhook_id = Column(String(64), nullable=True)
    # Shopify's customer id or data request id — never our customer's email.
    subject_ref = Column(String(64), nullable=True)
    status = Column(String(24), nullable=False)
    result = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

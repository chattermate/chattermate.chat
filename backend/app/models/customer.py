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

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index, JSON, Enum as SQLEnum, func, text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import enum
import uuid
from app.database import Base


class LeadStage(str, enum.Enum):
    """Lifecycle stage of a person. Visitor -> Lead is automatic on a qualifying
    capture; Lead -> Customer is a manual transition (phase 1)."""
    VISITOR = "visitor"
    LEAD = "lead"
    CUSTOMER = "customer"


class Customer(Base):
    __tablename__ = "customers"
    __table_args__ = (
        UniqueConstraint('email', 'organization_id', name='uix_customer_email_org'),
        # Phone is the second identity key: unique per org, but only where
        # present (rows without a phone are the overwhelming majority and must
        # never collide). Declared here — not only in the migration — so
        # autogenerate never sees it as unknown and drops it, and so the
        # sqlite test schema enforces the same uniqueness Postgres does
        # (sqlite_where works, and both dialects treat NULLs as distinct).
        Index('uix_customer_phone_org', 'organization_id', 'phone', unique=True,
              postgresql_where=text('phone IS NOT NULL'),
              sqlite_where=text('phone IS NOT NULL')),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False)
    full_name = Column(String)
    # Second identity key beside email, normalized E.164 with leading '+'
    # (see app/utils/phone.py). Set by phone-bearing channels (WhatsApp, SMS,
    # Telegram share-contact) and by lead capture; uniqueness via the partial
    # index in __table_args__. Name is never an identity key.
    phone = Column(String, nullable=True)
    # Arbitrary integrator-supplied fields (e.g. student_name, center_name) passed via
    # POST /generate-token's `custom_data` and surfaced to agents in the chat inbox.
    meta_data = Column(JSON, nullable=True)
    # True when the embedding app identified this person via POST /generate-token with a
    # known identity (customer_email) — an existing/authenticated customer of the business,
    # not an organic lead the agent captured. Used to exclude them from the People/leads
    # views. Deliberately an explicit flag, NOT inferred from meta_data: meta_data can be
    # absent for an authenticated user and present for an anonymous one, and SQLAlchemy
    # persists an empty JSON value as JSON null (not SQL NULL), so `meta_data IS NULL`
    # never matched reliably.
    is_authenticated = Column(Boolean, default=False, server_default="false", nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    # Lead lifecycle — denormalized onto the customer so the People page can filter/aggregate
    # by stage without joining lead_capture_responses on every list request.
    lead_stage = Column(SQLEnum(LeadStage), default=LeadStage.VISITOR, server_default="VISITOR", nullable=False)
    lead_source = Column(JSON, nullable=True)  # {"page_url": ..., "channel": "widget", "captured_at": iso}
    lead_qualified_at = Column(DateTime(timezone=True), nullable=True)
    # Set when this (anonymous) customer was merged into an existing identified customer —
    # e.g. the visitor gave an email that already belongs to another record. Merged rows are
    # hidden from the People page; old device tokens carrying this id resolve to the target.
    merged_into_customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(),
                        onupdate=func.now())

    # Define relationships
    organization = relationship("Organization", back_populates="customers")
    chat_histories = relationship("ChatHistory", back_populates="customer")
    session_assignments = relationship("SessionToAgent", back_populates="customer")
    ratings = relationship("Rating", back_populates="customer")
    lead_capture_responses = relationship(
        "LeadCaptureResponse", back_populates="customer", cascade="all, delete-orphan")
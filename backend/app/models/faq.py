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

import enum
import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

DEFAULT_FAQ_CATEGORY = "General"


class FAQStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"


class FAQ(Base):
    """A single question/answer pair shown on the org's public help center.

    FAQs are a standalone projection of the knowledge base: generation only
    reads knowledge content, and editing/deleting FAQs never touches the
    knowledge tables. Drafts stay private until explicitly published.
    """
    __tablename__ = "faqs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # No single-column index: both composite indexes below lead with org id.
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    # Free-form category assigned by the LLM grouping step (or the user).
    category = Column(String(100), nullable=False, default=DEFAULT_FAQ_CATEGORY)
    # Plain string (values from FAQStatus), like knowledge_queue.status — new
    # states never need an ALTER TYPE migration.
    status = Column(String, nullable=False, default=FAQStatus.DRAFT)
    # Provenance: the knowledge source it was generated from (if any) plus a
    # human-readable label ("example.com/docs", "Imported from support.x.com",
    # "Added manually") that survives source deletion.
    knowledge_id = Column(Integer, ForeignKey("knowledge.id", ondelete="SET NULL"), nullable=True, index=True)
    source_label = Column(String(255), nullable=True)
    generation_job_id = Column(
        Integer, ForeignKey("faq_generation_jobs.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    sort_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    organization = relationship("Organization")
    knowledge = relationship("Knowledge")

    __table_args__ = (
        Index("ix_faqs_org_status", "organization_id", "status"),
        Index("ix_faqs_org_category", "organization_id", "category"),
    )

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

from sqlalchemy import Boolean, CheckConstraint, Column, DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

DEFAULT_BRAND_COLOR = "#4338CA"
DEFAULT_CTA_TEXT = "Contact us"


class DomainStatus(str, enum.Enum):
    UNVERIFIED = "unverified"
    PENDING = "pending"
    VERIFIED = "verified"


class SSLStatus(str, enum.Enum):
    NONE = "none"
    PENDING = "pending"
    ACTIVE = "active"
    FAILED = "failed"


class HelpCenterSettings(Base):
    """Per-org public help center configuration (branding, agent mapping,
    subdomain slug and optional custom domain). One row per organization,
    created lazily the first time the org opens the FAQ admin page.
    """
    __tablename__ = "help_center_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    # Whether the public site is live at {slug}.{HELP_CENTER_BASE_DOMAIN}.
    enabled = Column(Boolean, nullable=False, default=False)
    slug = Column(String(63), unique=True, nullable=True, index=True)

    # Branding
    title = Column(String(120), nullable=True)
    description = Column(String(300), nullable=True)
    logo_url = Column(String, nullable=True)
    brand_color = Column(String(9), nullable=False, default=DEFAULT_BRAND_COLOR)
    # [{"label": str, "url": str}, ...]
    header_links = Column(JSON, nullable=False, default=lambda: [])
    cta_text = Column(String(40), nullable=True, default=DEFAULT_CTA_TEXT)
    cta_url = Column(String, nullable=True)

    # Draft FAQs are auto-generated when a new knowledge source finishes.
    auto_generate = Column(Boolean, nullable=False, default=True)

    # AI search: which agent grounds "Ask AI" answers and whose chat widget is
    # embedded on the public page.
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="SET NULL"), nullable=True)
    ai_search_enabled = Column(Boolean, nullable=False, default=True)

    # Custom domain. Verification state is the two per-record booleans; the
    # aggregate status is derived (see domain_status) so the pieces can never
    # disagree.
    custom_domain = Column(String(255), unique=True, nullable=True, index=True)
    domain_verification_token = Column(String(64), nullable=True)
    txt_record_verified = Column(Boolean, nullable=False, default=False)
    cname_record_verified = Column(Boolean, nullable=False, default=False)
    # Plain string (values from SSLStatus) — an external fact set by the
    # verification probe, stored like knowledge_queue's string statuses.
    ssl_status = Column(String, nullable=False, default=SSLStatus.NONE)
    domain_verified_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    organization = relationship("Organization")
    agent = relationship("Agent")

    __table_args__ = (
        CheckConstraint("slug = lower(slug)", name="ck_help_center_slug_lowercase"),
    )

    @property
    def domain_verified(self) -> bool:
        return bool(self.custom_domain) and self.txt_record_verified and self.cname_record_verified

    @property
    def domain_status(self) -> DomainStatus:
        if not self.custom_domain:
            return DomainStatus.UNVERIFIED
        return DomainStatus.VERIFIED if self.domain_verified else DomainStatus.PENDING


class HelpCenterQuery(Base):
    """Log of public "Ask AI" questions — used for per-period metering on
    hosted models and (later) search analytics. No answer text is stored.
    """
    __tablename__ = "help_center_queries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    query = Column(Text, nullable=False)
    answered = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

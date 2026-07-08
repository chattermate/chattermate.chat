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

from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey,
    Enum as SQLEnum, JSON, Text, func, false, true,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import enum
import uuid
from app.database import Base


class LeadAssignmentMode(str, enum.Enum):
    """Where a qualified lead is routed. Phase 1: stored only, not acted on."""
    NONE = "none"
    SALES_TEAM = "sales_team"
    SPECIFIC_PERSON = "specific_person"
    ROUND_ROBIN = "round_robin"


class CrmSyncTarget(str, enum.Enum):
    """Which CRM a qualified lead syncs to. Phase 1: stored only, no outbound sync."""
    NONE = "none"
    HUBSPOT = "hubspot"
    SALESFORCE = "salesforce"


class LeadCaptureConfig(Base):
    """Per-agent lead-capture configuration (1:1 with Agent).

    Prompt-driven, like transfer_to_human: a simple on/off toggle. When enabled, the
    agent collects the configured fields conversationally (no form) and emits them as
    structured output plus an AI-written lead summary.
    """
    __tablename__ = "lead_capture_configs"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    # Master toggle (mirrors Agent.transfer_to_human).
    enabled = Column(Boolean, default=False, server_default=false(), nullable=False)
    # GDPR: require the visitor's explicit "yes" before a lead is recorded (default on).
    require_consent = Column(Boolean, default=True, server_default=true(), nullable=False)

    # Free-text steering appended to the agent's system prompt (e.g. "prioritise
    # pricing-page visitors, be proactive after hours"). The agent decides *when* to ask.
    guidance = Column(Text, nullable=True)
    # Which details to collect — feeds the prompt and defines the expected lead_data keys:
    #  {"key": "email", "standard": true, "required": true, "enabled": true}
    #  {"key": "custom_1", "standard": false, "label": "Team size", "enabled": true}
    fields = Column(JSON, nullable=True)

    # Routing config — persisted so the shape is ready for real integration later,
    # but never acted on in phase 1 (no CRM/Slack/assignment side effects).
    assignment_mode = Column(SQLEnum(LeadAssignmentMode), default=LeadAssignmentMode.NONE, server_default="NONE", nullable=False)
    assignment_target_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    crm_sync_target = Column(SQLEnum(CrmSyncTarget), default=CrmSyncTarget.NONE, server_default="NONE", nullable=False)
    slack_notify_enabled = Column(Boolean, default=False, server_default=false(), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    agent = relationship("Agent", back_populates="lead_capture_config", uselist=False)


class LeadCaptureResponse(Base):
    """One row per captured lead — the fields the agent extracted conversationally,
    plus an AI-written qualification summary. Kept separate from Customer.meta_data
    (integrator-supplied) so AI-captured leads have a clean home."""
    __tablename__ = "lead_capture_responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="SET NULL"), nullable=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(UUID(as_uuid=True), ForeignKey("session_to_agents.session_id"), nullable=True)

    field_values = Column(JSON, nullable=True)  # {"email": ..., "company": ..., "custom_1": ...}
    # AI-written qualification narrative (e.g. "40-person fintech replacing Intercom, wants a demo").
    summary = Column(Text, nullable=True)
    # Whether the visitor gave explicit consent to be contacted (GDPR).
    consent = Column(Boolean, default=False, nullable=False)
    qualified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="lead_capture_responses")
    agent = relationship("Agent")

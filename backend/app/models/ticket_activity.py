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

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import expression, func

from app.database import Base


from app.models.ticket import _ValueStrEnum


class TicketActivityType(_ValueStrEnum):
    COMMENT = "comment"
    STATUS_CHANGE = "status_change"
    ASSIGNMENT = "assignment"
    PRIORITY_CHANGE = "priority_change"
    AI_TRIAGE = "ai_triage"
    AI_INVESTIGATION_STARTED = "ai_investigation_started"
    AI_INVESTIGATION_COMPLETED = "ai_investigation_completed"
    AI_RESOLUTION_PROPOSED = "ai_resolution_proposed"
    AI_RESOLUTION_APPROVED = "ai_resolution_approved"
    AI_RESOLUTION_REJECTED = "ai_resolution_rejected"
    CUSTOMER_NOTIFIED = "customer_notified"
    CUSTOMER_REPLIED = "customer_replied"
    CUSTOMER_LINKED = "customer_linked"
    CSAT_REQUESTED = "csat_requested"
    REOPENED = "reopened"
    JIRA_ESCALATED = "jira_escalated"


class TicketActorType(_ValueStrEnum):
    USER = "user"
    AI = "ai"
    CUSTOMER = "customer"
    SYSTEM = "system"


class TicketActivity(Base):
    """Append-only ticket feed — doubles as comments and the audit trail of
    every AI/system/human action. Never updated or deleted in place.
    """
    __tablename__ = "ticket_activities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    activity_type = Column(String, nullable=False)
    actor_type = Column(String, nullable=False, default=TicketActorType.SYSTEM)
    actor_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    # Comment text or the human-readable line for audit events.
    body = Column(Text, nullable=True)
    # Internal note vs customer-visible comment.
    is_internal = Column(Boolean, nullable=False, default=True, server_default=expression.true())
    # Structured context: {"from": "open", "to": "investigating"},
    # {"run_id": ...}, {"channel": "web"}, ...
    activity_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ticket = relationship("Ticket", back_populates="activities")
    actor_user = relationship("User")

    __table_args__ = (
        Index("ix_ticket_activities_ticket_created", "ticket_id", "created_at"),
    )

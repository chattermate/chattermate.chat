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

from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, JSON, Float, event
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.encryption import EncryptedText
from app.database import Base
import enum
from sqlalchemy.sql import func
from app.models.user import UserGroup


class SessionStatus(str, enum.Enum):
    OPEN = "open"
    TRANSFERRED = "transferred"
    CLOSED  = "closed"


class EndChatReasonType(str, enum.Enum):
    ISSUE_RESOLVED = "ISSUE_RESOLVED"
    CUSTOMER_REQUEST = "CUSTOMER_REQUEST"
    CONFIRMATION_RECEIVED = "CONFIRMATION_RECEIVED"
    FAREWELL = "FAREWELL"
    THANK_YOU = "THANK_YOU"
    NATURAL_CONCLUSION = "NATURAL_CONCLUSION"
    TASK_COMPLETED = "TASK_COMPLETED"


# A conversation the visitor can still talk in.
ACTIVE_STATUSES = (SessionStatus.OPEN, SessionStatus.TRANSFERRED)


class SessionToAgent(Base):
    __tablename__ = "session_to_agents"

    session_id = Column(UUID(as_uuid=True), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="SET NULL"), nullable=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id", ondelete="SET NULL"), nullable=False, index=True)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id", ondelete="SET NULL"), nullable=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(SQLEnum(SessionStatus), nullable=False, default=SessionStatus.OPEN)
    # Messaging channel the session belongs to ('web' = widget, 'telegram',
    # 'whatsapp', ...). Routing key for outbound delivery of replies.
    channel = Column(String, nullable=False, server_default='web', index=True)
    # Which widget conversation token may resume this session (see
    # conversation_token.conversation_scope). NULL: only a token the embedding app
    # vouched for - and every non-widget channel, which never resumes by token.
    conversation_key = Column(String(64), nullable=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    # Stamped by _stamp_status_change below on every move into that status:
    # the inbox's waiting time and "resolved today" read them.
    handed_over_at = Column(DateTime(timezone=True), nullable=True)
    closed_at = Column(DateTime(timezone=True), nullable=True)
    transfer_reason = Column(String, nullable=True)
    # The free-text fields below are AI-written summaries of the conversation, so
    # they are encrypted at rest alongside the messages themselves.
    transfer_description = Column(EncryptedText, nullable=True)
    end_chat_reason = Column(SQLEnum(EndChatReasonType), nullable=True)
    end_chat_description = Column(EncryptedText, nullable=True)
    # A short AI-written title for the visitor's history, once the chat closed
    # (app/services/conversation_titles.py); titled_at: looked at, titled or not
    title = Column(EncryptedText, nullable=True)
    titled_at = Column(DateTime(timezone=True), nullable=True)
    # A keyed hash of an email the visitor proved with a code in this conversation
    # (email_check.email_key): their other browsers find it by the same proof
    verified_email_key = Column(String(64), nullable=True)

    # Ticket-related fields
    ticket_id = Column(String, nullable=True)
    ticket_status = Column(String, nullable=True)
    ticket_summary = Column(EncryptedText, nullable=True)
    ticket_description = Column(EncryptedText, nullable=True)
    integration_type = Column(String, nullable=True)
    ticket_priority = Column(String, nullable=True)

    # Sentiment fields
    sentiment_label = Column(String, nullable=True)  # Overall session sentiment: 'positive', 'neutral', 'negative'
    sentiment_score = Column(Float, nullable=True)  # Overall average sentiment score: -1.0 to 1.0

    # Workflow-related fields
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id", ondelete="SET NULL"), nullable=True)
    current_node_id = Column(UUID(as_uuid=True), ForeignKey("workflow_nodes.id", ondelete="SET NULL"), nullable=True)

    workflow_state = Column(JSON, default={})  # Store workflow execution state
    workflow_history = Column(JSON, default=[])  # Store form submissions and workflow interactions

    # Relationships
    user = relationship("User", back_populates="session_assignments")
    agent = relationship("Agent", back_populates="session_assignments")
    customer = relationship("Customer", back_populates="session_assignments")
    group = relationship("UserGroup", back_populates="session_assignments")
    ratings = relationship("Rating", back_populates="session_assignments")
    workflow = relationship("Workflow", back_populates="sessions")
    current_node = relationship("WorkflowNode")


def _as_status(value) -> "SessionStatus | None":
    """A status however it was assigned: the enum, its name ("TRANSFERRED") or
    its value ("transferred"). Anything else (an unloaded attribute) is None."""
    if isinstance(value, SessionStatus):
        return value
    if isinstance(value, str):
        if value in SessionStatus.__members__:
            return SessionStatus[value]
        try:
            return SessionStatus(value)
        except ValueError:
            return None
    return None


@event.listens_for(SessionToAgent.status, 'set', active_history=True)
def _stamp_status_change(target, value, oldvalue, _initiator):
    """Record when a conversation was handed to the team or closed.

    On the model, not in each caller: handovers come from the AI, workflows,
    the route-to-human button and channel relays, and closes from as many
    places. Only a change counts, so re-saving a waiting chat keeps its wait.
    Bulk query updates skip ORM events and leave these unset.
    """
    new, old = _as_status(value), _as_status(oldvalue)
    if new is None or new == old:
        return
    if new == SessionStatus.TRANSFERRED:
        target.handed_over_at = datetime.now(timezone.utc)
    elif new == SessionStatus.CLOSED:
        target.closed_at = datetime.now(timezone.utc)


# Add back-reference in UserGroup model if not already present
if not hasattr(UserGroup, 'session_assignments'):
    UserGroup.session_assignments = relationship(
        "SessionToAgent",
        back_populates="group",
        uselist=True
    ) 
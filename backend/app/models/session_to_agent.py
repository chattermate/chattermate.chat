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

from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
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


class SessionToAgent(Base):
    __tablename__ = "session_to_agents"

    session_id = Column(UUID(as_uuid=True), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="SET NULL"), nullable=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id", ondelete="SET NULL"), nullable=False)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id", ondelete="SET NULL"), nullable=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    status = Column(SQLEnum(SessionStatus), nullable=False, default=SessionStatus.OPEN)
    # Messaging channel the session belongs to ('web' = widget, 'telegram',
    # 'whatsapp', ...). Routing key for outbound delivery of replies.
    channel = Column(String, nullable=False, server_default='web', index=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    transfer_reason = Column(String, nullable=True)
    transfer_description = Column(String, nullable=True)
    end_chat_reason = Column(SQLEnum(EndChatReasonType), nullable=True)
    end_chat_description = Column(String, nullable=True)
    
    # Ticket-related fields
    ticket_id = Column(String, nullable=True)
    ticket_status = Column(String, nullable=True)
    ticket_summary = Column(String, nullable=True)
    ticket_description = Column(String, nullable=True)
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


# Add back-reference in UserGroup model if not already present
if not hasattr(UserGroup, 'session_assignments'):
    UserGroup.session_assignments = relationship(
        "SessionToAgent",
        back_populates="group",
        uselist=True
    ) 
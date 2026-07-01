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

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class SlackConversation(Base):
    """Model for tracking Slack thread conversations and mapping to ChatterMate sessions."""
    __tablename__ = "slack_conversations"

    # Unique constraint on (team_id, channel_id, thread_ts) for thread tracking
    __table_args__ = (
        UniqueConstraint('team_id', 'channel_id', 'thread_ts', name='uq_slack_conversation_thread'),
    )

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(String, nullable=False, index=True)  # Slack workspace ID
    channel_id = Column(String, nullable=False, index=True)  # Slack channel ID
    thread_ts = Column(String, nullable=False, index=True)  # Parent message timestamp (thread ID)

    # Link to ChatterMate session
    session_id = Column(
        UUID(as_uuid=True),
        ForeignKey("session_to_agents.session_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Denormalized for faster lookups
    agent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="SET NULL"),
        nullable=True
    )
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False
    )

    # Slack user who started the conversation
    slack_user_id = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    session = relationship("SessionToAgent")
    agent = relationship("Agent")
    organization = relationship("Organization", back_populates="slack_conversations")

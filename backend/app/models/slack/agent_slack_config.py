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

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class AgentSlackConfig(Base):
    """Model for agent-to-Slack channel configuration mapping."""
    __tablename__ = "agent_slack_configs"

    # Unique constraint on (organization_id, channel_id) to allow same channel ID across different orgs
    __table_args__ = (
        UniqueConstraint('organization_id', 'channel_id', name='uq_agent_slack_config_org_channel'),
    )

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    team_id = Column(String, nullable=False, index=True)  # Slack workspace ID
    agent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    channel_id = Column(String, nullable=False, index=True)  # Slack channel ID
    channel_name = Column(String, nullable=False)  # Human-readable channel name

    # Toggle options for interaction methods
    enabled = Column(Boolean, default=True, nullable=False)
    respond_to_mentions = Column(Boolean, default=True, nullable=False)  # @bot mentions
    respond_to_reactions = Column(Boolean, default=True, nullable=False)  # Emoji reactions
    respond_to_commands = Column(Boolean, default=True, nullable=False)  # /chattermate command

    # Trigger emoji for reactions (fixed per plan)
    reaction_emoji = Column(String, default="robot_face", nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="agent_slack_configs")
    agent = relationship("Agent", back_populates="slack_configs")

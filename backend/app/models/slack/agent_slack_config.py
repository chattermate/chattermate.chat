"""
ChatterMate - Agent Slack Config Model
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
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

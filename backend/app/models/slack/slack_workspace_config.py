"""
ChatterMate - Slack Workspace Config Model
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

import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class StorageMode(str, enum.Enum):
    """Storage mode for Slack messages - controls privacy level."""
    FULL_CONTENT = "FULL_CONTENT"  # Store complete message text in ChatHistory
    METADATA_ONLY = "METADATA_ONLY"  # Store only metadata (user_id, timestamp, channel) - no message content
    EMBEDDINGS_ONLY = "EMBEDDINGS_ONLY"  # Store embeddings for search, not raw text


class SlackWorkspaceConfig(Base):
    """Model for workspace-level admin settings for Slack integration."""
    __tablename__ = "slack_workspace_configs"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    team_id = Column(String, nullable=False, index=True)  # Slack workspace ID

    # Admin-configurable settings for privacy/compliance
    allowed_channel_ids = Column(JSON, default=list)  # List of channel IDs bot can monitor (empty = all)
    storage_mode = Column(
        SQLEnum(StorageMode),
        nullable=False,
        default=StorageMode.FULL_CONTENT
    )

    # Default agent when channel has no specific mapping
    default_agent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="SET NULL"),
        nullable=True
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="slack_workspace_configs")
    default_agent = relationship("Agent")

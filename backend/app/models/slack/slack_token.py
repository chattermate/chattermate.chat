"""
ChatterMate - Slack Token Model
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

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class SlackToken(Base):
    """Model for storing Slack OAuth tokens at organization level."""
    __tablename__ = "slack_tokens"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    access_token = Column(String, nullable=False)  # Bot token (xoxb-)
    bot_user_id = Column(String, nullable=False)  # Bot's Slack user ID
    team_id = Column(String, nullable=False, index=True)  # Slack workspace ID
    team_name = Column(String, nullable=False)  # Workspace name
    authed_user_id = Column(String, nullable=True)  # User who installed the app
    scope = Column(String, nullable=True)  # Granted scopes

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    organization = relationship("Organization", back_populates="slack_tokens")

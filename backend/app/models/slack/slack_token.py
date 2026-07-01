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

"""
ChatterMate - Widget App
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

from sqlalchemy import Boolean, Column, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base


class WidgetApp(Base):
    """
    Widget App model for managing API keys for widget authentication.

    Each organization can create multiple widget apps, each with a unique API key
    for generating conversation tokens. API keys are stored as bcrypt hashes for security.
    """
    __tablename__ = "widget_apps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)  # User-friendly name like "Production Widget"
    description = Column(Text, nullable=True)  # Optional description
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    api_key_hash = Column(String, nullable=False)  # bcrypt hash of the API key (one-way)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)  # Audit trail
    is_active = Column(Boolean, default=True, index=True)  # Soft delete support
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="widget_apps")
    creator = relationship("User", foreign_keys=[created_by])

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

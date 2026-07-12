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

from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum
from sqlalchemy.dialects.postgresql import UUID

class NotificationType(str, enum.Enum):
    KNOWLEDGE_PROCESSED = "knowledge_processed"
    KNOWLEDGE_FAILED = "knowledge_failed"
    FAQ_GENERATED = "faq_generated"
    FAQ_GENERATION_FAILED = "faq_generation_failed"
    SYSTEM = "system"
    CHAT = "chat"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(SQLEnum(NotificationType), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    # For additional data like queue_id, knowledge_id etc
    notification_metadata = Column(JSON, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="notifications")

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

from sqlalchemy import Column, Integer, String, BigInteger, ForeignKey, TIMESTAMP, func, UUID
from sqlalchemy.orm import relationship
from app.database import Base


class FileAttachment(Base):
    __tablename__ = "file_attachments"

    id = Column(Integer, primary_key=True, index=True)
    file_url = Column(String, nullable=False)  # AWS S3 URL or local path
    filename = Column(String, nullable=False)  # Original filename
    content_type = Column(String, nullable=False)  # MIME type
    file_size = Column(BigInteger, nullable=False)  # File size in bytes
    
    # Links to chat history message
    chat_history_id = Column(Integer, ForeignKey("chat_history.id", ondelete="CASCADE"), nullable=True)
    
    # Additional metadata
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    uploaded_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    uploaded_by_customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    chat_history = relationship("ChatHistory", backref="attachments")
    organization = relationship("Organization")
    uploaded_by_user = relationship("User", foreign_keys=[uploaded_by_user_id])
    uploaded_by_customer = relationship("Customer", foreign_keys=[uploaded_by_customer_id])

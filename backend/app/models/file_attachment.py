"""
ChatterMate - File Attachment Model
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

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

from sqlalchemy import Column, Integer, String, JSON, DateTime, Enum, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from sqlalchemy.dialects.postgresql import UUID

class QueueStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ProcessingStage(str, enum.Enum):
    NOT_STARTED = "not_started"
    CRAWLING = "crawling"
    EMBEDDING = "embedding"
    COMPLETED = "completed"


class KnowledgeQueue(Base):
    __tablename__ = "knowledge_queue"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(UUID(as_uuid=True), nullable=False)
    agent_id = Column(UUID(as_uuid=True), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)  # Nullable for Shopify session token auth
    # 'pdf_file', 'pdf_url', 'website'
    source_type = Column(String, nullable=False)
    source = Column(String, nullable=False)  # File path or URL
    status = Column(String, default=QueueStatus.PENDING)
    error = Column(String, nullable=True)
    # Renamed from metadata to queue_metadata
    queue_metadata = Column(JSON, nullable=True)
    # Priority: higher number = higher priority (default 0, explore URLs get 10)
    priority = Column(Integer, default=0, index=True)
    # Progress tracking
    processing_stage = Column(String, default=ProcessingStage.NOT_STARTED)
    progress_percentage = Column(Float, default=0.0)
    total_items = Column(Integer, default=0)
    processed_items = Column(Integer, default=0)
    crawled_urls = Column(JSON, default=lambda: [])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Add relationship
    user = relationship("User", back_populates="knowledge_queue_items")
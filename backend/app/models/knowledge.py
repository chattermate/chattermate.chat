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

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from sqlalchemy.dialects.postgresql import UUID

class SourceType(str, enum.Enum):
    DATABASE = "database"
    FILE = "file"
    API = "api"
    WEBSITE = "website"
    CUSTOM = "custom"


class Knowledge(Base):
    __tablename__ = "knowledge"

    id = Column(Integer, primary_key=True, index=True)
    # URL, file path, or connection string
    source = Column(String, nullable=False)
    source_type = Column(SQLEnum(SourceType), nullable=False)
    schema = Column(String)  # JSON schema of the data structure
    table_name = Column(String)
    organization_id = Column(UUID(as_uuid=True), ForeignKey(
        "organizations.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(),
                        onupdate=func.now())

    # Relationships
    organization = relationship(
        "Organization", back_populates="knowledge_sources")
    agent_links = relationship(
        "KnowledgeToAgent", back_populates="knowledge", cascade="all, delete-orphan")

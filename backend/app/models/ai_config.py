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

from sqlalchemy import Boolean, Column, Integer, String, JSON, ForeignKey, DateTime, func, Enum as SQLEnum
from sqlalchemy.orm import relationship
from enum import Enum
from app.database import Base
from sqlalchemy.dialects.postgresql import UUID

class AIModelType(str, Enum):
    OPENAI = "OPENAI"
    ANTHROPIC = "ANTHROPIC"
    DEEPSEEK = "DEEPSEEK"
    GOOGLE = "GOOGLE"
    GOOGLEVERTEX = "GOOGLEVERTEX"
    GROQ = "GROQ"
    MISTRAL = "MISTRAL"
    HUGGINGFACE = "HUGGINGFACE"
    OLLAMA = "OLLAMA"
    XAI = "XAI"
    CHATTERMATE = "CHATTERMATE" # own model for enterprise customers

class AIConfig(Base):
    __tablename__ = "ai_configs"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey(
        "organizations.id"), nullable=False)
    model_type = Column(SQLEnum(AIModelType), nullable=False)
    model_name = Column(String, nullable=False)  # e.g. "gpt-4", "claude-3"
    encrypted_api_key = Column(String, nullable=False)
    # For additional model-specific settings
    settings = Column(JSON, nullable=True, default={
        "instructions": [
            "You are a helpful customer service agent.",
            "Be concise and professional.",
            "If you don't know something, say so.",
            "Always maintain a friendly tone."
        ],
        "tools": ["web_search"],
        "memory": True,
        "markdown": True
    })
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(),
                        onupdate=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="ai_configs")

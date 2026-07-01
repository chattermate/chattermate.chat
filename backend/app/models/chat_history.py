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

from sqlalchemy import Column, Integer, String, JSON, ForeignKey, TIMESTAMP, func, UUID, Interval, Float
from sqlalchemy.orm import relationship
from app.database import Base


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey(
        "organizations.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id", ondelete="SET NULL"), nullable=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey(
        "customers.id", ondelete="SET NULL"), nullable=True)
    agent_id = Column(UUID(as_uuid=True), ForeignKey(
        "agents.id", ondelete="SET NULL"), nullable=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("session_to_agents.session_id"), nullable=True)
    message = Column(String, nullable=False)
    # 'user', 'bot', or 'agent'
    message_type = Column(String, nullable=False)
    attributes = Column(JSON, default={})
    sentiment_label = Column(String, nullable=True)  # 'positive', 'neutral', 'negative'
    sentiment_score = Column(Float, nullable=True)  # -1.0 to 1.0
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(),
                        onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="chat_histories")
    customer = relationship("Customer", back_populates="chat_histories")
    agent = relationship("Agent", back_populates="chat_histories")
    organization = relationship("Organization", back_populates="chat_histories")
    session_assignment = relationship("SessionToAgent")


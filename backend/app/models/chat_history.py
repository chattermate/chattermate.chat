"""
ChatterMate - Chat History
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

from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime, func, UUID, Interval
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
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(),
                        onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="chat_histories")
    customer = relationship("Customer", back_populates="chat_histories")
    agent = relationship("Agent", back_populates="chat_histories")
    organization = relationship("Organization", back_populates="chat_histories")
    session_assignment = relationship("SessionToAgent")


"""
ChatterMate - User
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

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func, Table, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base
from passlib.context import CryptContext
from sqlalchemy.sql import func

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Association table for many-to-many relationship between users and groups
user_groups = Table(
    'user_groups',
    Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('group_id', UUID(as_uuid=True), ForeignKey('groups.id'), primary_key=True)
)

class UserGroup(Base):
    __tablename__ = "groups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="groups")
    users = relationship("User", secondary=user_groups, back_populates="groups")
    session_assignments = relationship("SessionToAgent", back_populates="group")

    # agents relationship will be created by backref from Agent model

    def to_dict(self):
        """Convert user group object to dictionary"""
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "agents": [{"id": str(agent.id), "name": agent.name} for agent in self.agents]
        }

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    profile_pic = Column(String, nullable=True)
    is_online = Column(Boolean, default=False)
    last_seen = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    fcm_token_web = Column(String, nullable=True)

    # Define relationships
    organization = relationship("Organization", back_populates="users")
    role = relationship("Role", back_populates="users")
    knowledge_queue_items = relationship(
        "KnowledgeQueue",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    notifications = relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan")
    chat_histories = relationship("ChatHistory", back_populates="user")
    
    # Add groups relationship
    groups = relationship("UserGroup", secondary=user_groups, back_populates="users")

    # Add this new relationship
    session_assignments = relationship("SessionToAgent", back_populates="user")

    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            "id": str(self.id),
            "email": self.email,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "organization_id": str(self.organization_id),
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "role": self.role.to_dict() if self.role else None
        }

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)

"""
ChatterMate - Organization
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

import uuid
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, func, event
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.role import Role
from sqlalchemy.dialects.postgresql import UUID
from app.core.logger import get_logger

logger = get_logger(__name__)

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True,default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    domain = Column(String(100), unique=True, nullable=False)
    timezone = Column(String(50), nullable=False, default='UTC')
    business_hours = Column(JSON, default={
        'monday': {'start': '09:00', 'end': '17:00', 'enabled': True},
        'tuesday': {'start': '09:00', 'end': '17:00', 'enabled': True},
        'wednesday': {'start': '09:00', 'end': '17:00', 'enabled': True},
        'thursday': {'start': '09:00', 'end': '17:00', 'enabled': True},
        'friday': {'start': '09:00', 'end': '17:00', 'enabled': True},
        'saturday': {'start': '09:00', 'end': '17:00', 'enabled': False},
        'sunday': {'start': '09:00', 'end': '17:00', 'enabled': False}
    })
    settings = Column(JSON, default={})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(),
                        onupdate=func.now())

    # Define relationships
    chat_histories = relationship("ChatHistory", back_populates="organization")
    users = relationship("User", back_populates="organization",
                         cascade="all, delete-orphan")
    customers = relationship(
        "Customer", back_populates="organization", cascade="all, delete-orphan")
    roles = relationship("Role", back_populates="organization",
                         cascade="all, delete-orphan")
    ai_configs = relationship("AIConfig", back_populates="organization",
                              cascade="all, delete-orphan")
    agents = relationship("Agent", back_populates="organization")
    knowledge_sources = relationship(
        "Knowledge", back_populates="organization")
    widgets = relationship("Widget", back_populates="organization")
    groups = relationship("UserGroup", back_populates="organization")

    class Config:
        orm_mode = True

# Try to set up enterprise relationships after mapper configuration
@event.listens_for(Organization, 'mapper_configured')
def setup_enterprise_relationships(mapper, class_):
    try:
        from app.enterprise.models.subscription import Subscription
        from app.enterprise.models.order import PayPalOrder
        
        if not hasattr(class_, 'subscription'):
            class_.subscription = relationship(
                Subscription,
                back_populates="organization",
                uselist=False
            )
            
        if not hasattr(class_, 'paypal_orders'):
            class_.paypal_orders = relationship(
                PayPalOrder,
                back_populates="organization",
                cascade="all, delete-orphan"
            )
            logger.info("Enterprise subscription and paypal_orders relationships configured")
    except ImportError:
        logger.info("Enterprise module not available - subscription relationship not configured")
        class_.subscription = None

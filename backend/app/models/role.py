"""
ChatterMate - Role
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

from sqlalchemy import Column, DateTime, Integer, String, ForeignKey, Boolean, func, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class Role(Base):
    __tablename__ = "roles"
    __table_args__ = (
        UniqueConstraint('name', 'organization_id', name='uq_role_name_org'),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="roles")
    permissions = relationship("Permission", secondary="role_permissions")
    users = relationship("User", back_populates="role")

    def to_dict(self):
        """Convert role object to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description
        }

    def has_permission(self, permission_name: str) -> bool:
        """Check if role has a specific permission"""
        return any(p.name == permission_name for p in self.permissions)

    def is_super_admin(self) -> bool:
        """Check if role has super admin permission"""
        return self.has_permission("super_admin")

    def can_manage_subscription(self) -> bool:
        """Check if role can manage subscriptions"""
        return self.is_super_admin() or self.has_permission("manage_subscription")

    def can_view_subscription(self) -> bool:
        """Check if role can view subscription details"""
        return self.is_super_admin() or self.has_permission("view_subscription")

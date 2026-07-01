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
            "description": self.description,
            "permissions": [{"id": p.id, "name": p.name, "description": p.description} for p in self.permissions] if self.permissions else []
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

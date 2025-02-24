"""
ChatterMate - Permission
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

from sqlalchemy import Column, Integer, String, Table, ForeignKey
from app.database import Base

# Junction table for role-permission many-to-many relationship
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', Integer, ForeignKey('roles.id')),
    Column('permission_id', Integer, ForeignKey('permissions.id'))
)


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)

    # Define default permissions
    @classmethod
    def default_permissions(cls):
        return [
            ("view_all", "Can view all resources"),
            ("manage_users", "Can manage users"),
            ("manage_roles", "Can manage roles"),
            ("manage_agents", "Can manage chat agents"),
            ("view_agents", "Can view chat agents"),
            ("view_analytics", "Can view analytics"),
            ("view_assigned_chats", "Can view assigned chats only"),
            ("manage_assigned_chats", "Can manage assigned chats"),
            ("manage_knowledge", "Can manage knowledge base"),
            ("view_knowledge", "Can view knowledge base"),
            ("manage_ai_config", "Can manage AI configuration"),
            ("view_ai_config", "Can view AI configuration"),
            ("view_all_chats", "Can view all chat history"),
            ("manage_all_chats", "Can manage all chat sessions"),
            ("manage_organization", "Can manage organization settings"),
            ("view_organization", "Can view organization details"),
            ("manage_subscription", "Can manage subscription plans and billing"),
            ("view_subscription", "Can view subscription details"),
            ("super_admin", "Has all permissions")
        ]

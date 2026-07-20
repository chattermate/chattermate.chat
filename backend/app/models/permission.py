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
            # The unclaimed queue: AI-handled sessions nobody has taken yet.
            # Separate from view_assigned_chats so widening an agent's inbox to
            # the queue never silently exposes another agent's conversations.
            ("view_unassigned_chats", "Can view unassigned AI chats"),
            ("manage_knowledge", "Can manage knowledge base"),
            ("view_knowledge", "Can view knowledge base"),
            ("manage_ai_config", "Can manage AI configuration"),
            ("view_ai_config", "Can view AI configuration"),
            ("view_all_chats", "Can view all chat history"),
            ("manage_all_chats", "Can manage all chat sessions"),
            # The people directory, decoupled from chat visibility: an agent can
            # look up who they are talking to without being able to read every
            # other agent's conversations.
            ("view_people", "Can view the people directory"),
            ("manage_organization", "Can manage organization settings"),
            ("view_organization", "Can view organization details"),
            ("manage_subscription", "Can manage subscription plans and billing"),
            ("view_subscription", "Can view subscription details"),
            ("view_tickets", "Can view tickets"),
            ("manage_tickets", "Can manage tickets"),
            ("approve_ticket_actions", "Can approve AI-proposed ticket resolutions"),
            ("manage_ticket_connectors", "Can manage ticket investigation connectors"),
            ("super_admin", "Has all permissions")
        ]

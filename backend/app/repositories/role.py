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

from sqlalchemy.orm import Session
from typing import List, Optional, Union
from app.models.role import Role
from app.models.permission import Permission, role_permissions
from app.models.user import User
from uuid import UUID
from app.core.logger import get_logger

logger = get_logger(__name__)

class RoleRepository:
    def __init__(self, db: Session):
        self.db = db

    def is_role_in_use(self, role_id: int) -> bool:
        """Check if role is assigned to any users"""
        return self.db.query(User)\
            .filter(User.role_id == role_id)\
            .first() is not None

    def create_role(self, name: str, description: str, organization_id: UUID, is_default: bool = False, permission_ids: List[int] = []) -> Role:
        """Create a new role with permissions"""
        role = Role(
            name=name,
            description=description,
            organization_id=organization_id,
            is_default=is_default
        )
        self.db.add(role)
        self.db.flush()  # Get the role ID

        # Add permissions
        if permission_ids:
            permissions = self.db.query(Permission)\
                .filter(Permission.id.in_(permission_ids))\
                .all()
            role.permissions.extend(permissions)

        self.db.commit()
        self.db.refresh(role)
        return role

    def get_role(self, role_id: int) -> Optional[Role]:
        """Get role by ID"""
        return self.db.query(Role).filter(Role.id == role_id).first()

    def get_org_roles(self, organization_id: UUID) -> List[Role]:
        """Get all roles for an organization"""
        return self.db.query(Role)\
            .filter(Role.organization_id == organization_id)\
            .all()

    def update_role(self, role_id: int, **kwargs) -> Optional[Role]:
        """Update role details"""
        role = self.get_role(role_id)
        if not role:
            return None

        # Handle permissions separately if they're in kwargs
        permissions = kwargs.pop('permissions', None)
        if permissions is not None:
            # Handle both dict and object formats
            permission_ids = [
                p.id if hasattr(p, 'id') else p['id'] 
                for p in permissions
            ]
            new_permissions = self.db.query(Permission)\
                .filter(Permission.id.in_(permission_ids))\
                .all()
            role.permissions = new_permissions

        # Update other attributes
        for key, value in kwargs.items():
            if hasattr(role, key):
                setattr(role, key, value)

        self.db.commit()
        self.db.refresh(role)
        return role

    def delete_role(self, role_id: int) -> bool:
        """Delete a role"""
        role = self.get_role(role_id)
        if not role:
            return False

        self.db.delete(role)
        self.db.commit()
        return True

    def add_permission(self, role_id: int, permission: str) -> bool:
        """Add a permission to a role"""
        role = self.get_role(role_id)
        if not role:
            return False

        permission_obj = self.db.query(Permission)\
            .filter(Permission.name == permission)\
            .first()
        
        if not permission_obj:
            return False

        if permission_obj not in role.permissions:
            role.permissions.append(permission_obj)
            self.db.commit()
        return True

    def remove_permission(self, role_id: int, permission: str) -> bool:
        """Remove a permission from a role"""
        role = self.get_role(role_id)
        if not role:
            return False

        permission_obj = self.db.query(Permission)\
            .filter(Permission.name == permission)\
            .first()
        
        if not permission_obj:
            return False

        if permission_obj in role.permissions:
            role.permissions.remove(permission_obj)
            self.db.commit()
        return True

    def get_role_permissions(self, role_id: int) -> List[str]:
        """Get all permissions for a role"""
        role = self.get_role(role_id)
        if not role:
            return []
        return [p.name for p in role.permissions]

    def get_roles_by_organization(self, organization_id: UUID) -> List[Role]:
        """Get all roles in an organization"""
        return self.db.query(Role)\
            .filter(Role.organization_id == organization_id)\
            .order_by(Role.name)\
            .all()

    def get_default_role(self, organization_id: UUID) -> Optional[Role]:
        """Get the default role for an organization"""
        return self.db.query(Role)\
            .filter(Role.organization_id == organization_id)\
            .filter(Role.is_default == True)\
            .first()

    def get_admin_role(self, organization_id: UUID) -> Role:
        """Get or create the admin role for an organization"""
        admin_role = self.db.query(Role)\
            .filter(Role.organization_id == organization_id)\
            .filter(Role.name == "Admin")\
            .first()
        
        if not admin_role:
            # Get all permissions
            all_permissions = self.db.query(Permission).all()
            
            # Create admin role with all permissions
            admin_role = self.create_role(
                name="Admin",
                description="Administrator role with full permissions",
                organization_id=organization_id,
                is_default=False,
                permission_ids=[p.id for p in all_permissions]
            )
        
        return admin_role 
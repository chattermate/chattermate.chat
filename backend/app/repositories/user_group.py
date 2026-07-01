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
from typing import List, Optional
from app.models.user import UserGroup, User
from uuid import UUID
from app.core.logger import get_logger

logger = get_logger(__name__)

class UserGroupRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_groups_by_organization(self, organization_id: UUID) -> List[UserGroup]:
        """Get all groups in an organization"""
        return self.db.query(UserGroup)\
            .filter(UserGroup.organization_id == organization_id)\
            .order_by(UserGroup.name)\
            .all()

    def get_group(self, group_id: UUID) -> Optional[UserGroup]:
        """Get group by ID"""
        return self.db.query(UserGroup).filter(UserGroup.id == group_id).first()

    def create_group(self, name: str, description: str, organization_id: UUID) -> UserGroup:
        """Create a new group"""
        group = UserGroup(
            name=name,
            description=description,
            organization_id=organization_id
        )
        self.db.add(group)
        self.db.commit()
        self.db.refresh(group)
        return group

    def update_group(self, group_id: UUID, **kwargs) -> Optional[UserGroup]:
        """Update group"""
        group = self.get_group(group_id)
        if group:
            for key, value in kwargs.items():
                setattr(group, key, value)
            self.db.commit()
            self.db.refresh(group)
        return group

    def delete_group(self, group_id: UUID) -> bool:
        """Delete group"""
        group = self.get_group(group_id)
        if group:
            self.db.delete(group)
            self.db.commit()
            return True
        return False

    def add_user(self, group_id: UUID, user_id: UUID) -> bool:
        """Add user to group"""
        group = self.get_group(group_id)
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not group or not user:
            return False
            
        if user not in group.users:
            group.users.append(user)
            self.db.commit()
        return True

    def remove_user(self, group_id: UUID, user_id: UUID) -> bool:
        """Remove user from group"""
        group = self.get_group(group_id)
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not group or not user:
            return False
            
        if user in group.users:
            group.users.remove(user)
            self.db.commit()
        return True

    def get_user_groups(self, user_id: UUID) -> List[UserGroup]:
        """Get all groups a user belongs to"""
        user = self.db.query(User).filter(User.id == user_id).first()
        return user.groups if user else [] 
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

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.core.auth import require_permissions
from app.repositories.user_group import UserGroupRepository
from app.models.schemas.user_group import (
    UserGroupCreate,
    UserGroupUpdate,
    UserGroupResponse,
    UserGroupWithUsers
)
from uuid import UUID

router = APIRouter()

@router.get("", response_model=List[UserGroupWithUsers])
async def list_groups(
    current_user: User = Depends(require_permissions("manage_users")),
    db: Session = Depends(get_db)
):
    """List all groups in the organization"""
    group_repo = UserGroupRepository(db)
    return group_repo.get_groups_by_organization(current_user.organization_id)

@router.post("", response_model=UserGroupResponse)
async def create_group(
    group_data: UserGroupCreate,
    current_user: User = Depends(require_permissions("manage_users")),
    db: Session = Depends(get_db)
):
    """Create a new group"""
    group_repo = UserGroupRepository(db)
    return group_repo.create_group(
        name=group_data.name,
        description=group_data.description,
        organization_id=current_user.organization_id
    )

@router.get("/{group_id}", response_model=UserGroupWithUsers)
async def get_group(
    group_id: UUID,
    current_user: User = Depends(require_permissions("manage_users")),
    db: Session = Depends(get_db)
):
    """Get group details including members"""
    group_repo = UserGroupRepository(db)
    group = group_repo.get_group(group_id)
    
    if not group or group.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Group not found")
    
    return group

@router.put("/{group_id}", response_model=UserGroupResponse)
async def update_group(
    group_id: UUID,
    group_data: UserGroupUpdate,
    current_user: User = Depends(require_permissions("manage_users")),
    db: Session = Depends(get_db)
):
    """Update group details"""
    group_repo = UserGroupRepository(db)
    group = group_repo.get_group(group_id)
    
    if not group or group.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Group not found")
    
    return group_repo.update_group(group_id, **group_data.dict(exclude_unset=True))

@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group(
    group_id: UUID,
    current_user: User = Depends(require_permissions("manage_users")),
    db: Session = Depends(get_db)
):
    """Delete a group"""
    group_repo = UserGroupRepository(db)
    group = group_repo.get_group(group_id)
    
    if not group or group.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Group not found")
    
    group_repo.delete_group(group_id)

@router.post("/{group_id}/users/{user_id}")
async def add_user_to_group(
    group_id: UUID,
    user_id: UUID,
    current_user: User = Depends(require_permissions("manage_users")),
    db: Session = Depends(get_db)
):
    """Add a user to a group"""
    group_repo = UserGroupRepository(db)
    group = group_repo.get_group(group_id)
    
    if not group or group.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Group not found")
        
    success = group_repo.add_user(group_id, user_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to add user to group")
    return {"message": "User added to group"}

@router.delete("/{group_id}/users/{user_id}")
async def remove_user_from_group(
    group_id: UUID,
    user_id: UUID,
    current_user: User = Depends(require_permissions("manage_users")),
    db: Session = Depends(get_db)
):
    """Remove a user from a group"""
    group_repo = UserGroupRepository(db)
    group = group_repo.get_group(group_id)
    
    if not group or group.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Group not found")
        
    success = group_repo.remove_user(group_id, user_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to remove user from group")
    return {"message": "User removed from group"} 
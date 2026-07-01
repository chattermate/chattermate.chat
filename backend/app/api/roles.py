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
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.models.user import User
from app.core.auth import get_current_user, require_permissions
from app.repositories.role import RoleRepository
from app.models.permission import Permission
from app.models.schemas.role import (
    RoleCreate,
    RoleUpdate,
    RoleResponse,
    PermissionResponse
)
from typing import List
from uuid import UUID

router = APIRouter()

@router.post("", response_model=RoleResponse)
async def create_role(
    role_data: RoleCreate,
    current_user: User = Depends(require_permissions("manage_roles")),
    db: Session = Depends(get_db)
):
    """Create a new role"""
    role_repo = RoleRepository(db)
    
    # Check if default role already exists for org
    if role_data.is_default:
        existing_default = role_repo.get_default_role(current_user.organization_id)
        if existing_default:
            raise HTTPException(
                status_code=400,
                detail="Organization already has a default role"
            )
    
    # Validate permissions exist
    if role_data.permissions:
        permission_ids = [p.id for p in role_data.permissions]
        existing_permissions = db.query(Permission)\
            .filter(Permission.id.in_(permission_ids))\
            .all()
        if len(existing_permissions) != len(permission_ids):
            raise HTTPException(
                status_code=400,
                detail="Invalid permission"
            )
    
    try:
        role = role_repo.create_role(
            name=role_data.name,
            description=role_data.description,
            organization_id=current_user.organization_id,
            is_default=role_data.is_default,
            permission_ids=[permission.id for permission in role_data.permissions]
        )
        return role
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Role with this name already exists"
        )

@router.get("", response_model=List[RoleResponse])
async def list_roles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all roles in the organization"""
    role_repo = RoleRepository(db)
    return role_repo.get_roles_by_organization(current_user.organization_id)

@router.get("/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: int,  # Changed from UUID to int
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get role details including permissions"""
    role_repo = RoleRepository(db)
    role = role_repo.get_role(role_id)
    
    if not role or role.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Role not found")
    
    return role

@router.put("/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: int,
    role_data: RoleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update role details"""
    role_repo = RoleRepository(db)
    role = role_repo.get_role(role_id)
    
    if not role or role.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Prevent editing default role
    if role.is_default:
        raise HTTPException(
            status_code=400,
            detail="Cannot modify default role"
        )
    
    # Check default role constraints
    if role_data.is_default:
        existing_default = role_repo.get_default_role(current_user.organization_id)
        if existing_default and existing_default.id != role_id:
            raise HTTPException(
                status_code=400,
                detail="Organization already has a default role"
            )
    
    # Validate permissions if provided
    if role_data.permissions:
        permission_ids = [p.id for p in role_data.permissions]
        existing_permissions = db.query(Permission)\
            .filter(Permission.id.in_(permission_ids))\
            .all()
        if len(existing_permissions) != len(permission_ids):
            raise HTTPException(
                status_code=400,
                detail="Invalid permission"
            )
    
    try:
        updated_role = role_repo.update_role(
            role_id,
            **role_data.model_dump(exclude_unset=True)  # Changed from dict() to model_dump()
        )
        return updated_role
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Role with this name already exists"
        )

@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    role_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a role"""
    role_repo = RoleRepository(db)
    role = role_repo.get_role(role_id)
    
    if not role or role.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Role not found")
    
    if role.is_default:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete default role"
        )
    
    if role_repo.is_role_in_use(role_id):
        raise HTTPException(
            status_code=400,
            detail="Cannot delete role that is assigned to users"
        )
    
    role_repo.delete_role(role_id)

@router.post("/{role_id}/permissions/{permission}")
async def add_role_permission(
    role_id: int,
    permission: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a permission to a role"""
    role_repo = RoleRepository(db)
    role = role_repo.get_role(role_id)
    
    if not role or role.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Role not found")
        
    success = role_repo.add_permission(role_id, permission)
    if not success:
        raise HTTPException(status_code=404, detail="Permission not found")
    return {"message": "Permission added to role"}

@router.delete("/{role_id}/permissions/{permission}")
async def remove_role_permission(
    role_id: int,
    permission: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a permission from a role"""
    role_repo = RoleRepository(db)
    role = role_repo.get_role(role_id)
    
    if not role or role.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Role not found")
        
    success = role_repo.remove_permission(role_id, permission)
    if not success:
        raise HTTPException(status_code=404, detail="Permission not found")
    return {"message": "Permission removed from role"}

@router.get("/permissions/all", response_model=List[PermissionResponse])
async def list_permissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all available permissions"""
    return db.query(Permission).all()

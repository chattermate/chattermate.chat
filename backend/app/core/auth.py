"""
ChatterMate - Auth
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

from fastapi import Depends, HTTPException, status, Cookie, Request
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.models.user import User
from app.models.organization import Organization
from app.core.security import verify_token
from app.core.logger import get_logger
from app.models.role import Role

logger = get_logger(__name__)

def check_permissions(user: User, required_permissions: List[str]) -> bool:
    """Check if user has required permissions through their role"""
    if not user.role or not user.role.permissions:
        return False
    user_permissions = [p.name for p in user.role.permissions]
    # If user has super_admin permission, they have access to everything
    if "super_admin" in user_permissions:
        return True
    return all(perm in user_permissions for perm in required_permissions)

def require_permissions(*required_permissions: str):
    """Dependency to check user permissions"""
    async def permission_checker(
        current_user: User = Depends(get_current_user)
    ) -> User:
        if not check_permissions(current_user, list(required_permissions)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return permission_checker

async def get_current_user(
    request: Request,
    access_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from access token cookie"""
    try:
        if not access_token:
            # Try getting token from Authorization header as fallback
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                access_token = auth_header.split(' ')[1]
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated",
                    headers={"WWW-Authenticate": "Bearer"},
                )

        payload = verify_token(access_token)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User is inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_organization(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Organization:
    """Get current user's organization"""
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not associated with any organization"
        )
    
    organization = db.query(Organization).filter(
        Organization.id == current_user.organization_id,
        Organization.is_active == True
    ).first()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found or inactive"
        )
    
    return organization

def require_permission(permission: str):
    """Dependency for checking if user has specific permission"""
    async def permission_dependency(
        current_user: User = Depends(get_current_user)
    ) -> User:
        if not current_user.role or not current_user.role.has_permission(permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User does not have required permission: {permission}"
            )
        return current_user
    return permission_dependency

def require_subscription_management(
    current_user: User = Depends(get_current_user)
) -> User:
    """Dependency for checking if user can manage subscriptions"""
    if not current_user.role or not current_user.role.can_manage_subscription():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have permission to manage subscriptions"
        )
    return current_user

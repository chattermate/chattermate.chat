"""
ChatterMate - Widget Apps
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

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.auth import require_permissions
from app.repositories.widget_app import WidgetAppRepository
from app.models.schemas.widget_app import (
    WidgetAppCreate,
    WidgetAppUpdate,
    WidgetAppResponse,
    WidgetAppWithKeyResponse,
    WidgetAppListResponse
)
from uuid import UUID
from app.core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.post("", response_model=WidgetAppWithKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_widget_app(
    app_data: WidgetAppCreate,
    current_user: User = Depends(require_permissions("manage_organization")),
    db: Session = Depends(get_db)
):
    """
    Create a new widget app with generated API key.

    **IMPORTANT:** The API key is shown only once in this response.
    Save it securely - it cannot be retrieved later.

    Requires: manage_organization permission (admin only)
    """
    try:
        repo = WidgetAppRepository(db)

        # Create app (returns app and plain key)
        app, plain_key = repo.create_app(
            organization_id=current_user.organization_id,
            created_by=current_user.id,
            name=app_data.name,
            description=app_data.description
        )

        # Return app with key (shown only once)
        return WidgetAppWithKeyResponse(
            id=app.id,
            name=app.name,
            description=app.description,
            organization_id=app.organization_id,
            created_by=app.created_by,
            is_active=app.is_active,
            created_at=app.created_at,
            updated_at=app.updated_at,
            api_key=plain_key  # ONLY time key is exposed
        )

    except Exception as e:
        logger.exception(f"Error creating widget app: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create widget app"
        )


@router.get("", response_model=WidgetAppListResponse)
async def list_widget_apps(
    include_inactive: bool = False,
    current_user: User = Depends(require_permissions("manage_organization")),
    db: Session = Depends(get_db)
):
    """
    List all widget apps for current organization.

    Requires: manage_organization permission (admin only)
    """
    try:
        repo = WidgetAppRepository(db)
        apps = repo.get_apps_by_organization(
            organization_id=current_user.organization_id,
            include_inactive=include_inactive
        )

        return WidgetAppListResponse(
            total=len(apps),
            apps=[WidgetAppResponse.from_orm(app) for app in apps]
        )

    except Exception as e:
        logger.exception(f"Error listing widget apps: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list widget apps"
        )


@router.get("/{app_id}", response_model=WidgetAppResponse)
async def get_widget_app(
    app_id: UUID,
    current_user: User = Depends(require_permissions("manage_organization")),
    db: Session = Depends(get_db)
):
    """
    Get widget app details by ID.

    Requires: manage_organization permission (admin only)
    """
    try:
        repo = WidgetAppRepository(db)
        app = repo.get_app_by_id(
            app_id=app_id,
            organization_id=current_user.organization_id
        )

        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Widget app {app_id} not found"
            )

        return WidgetAppResponse.from_orm(app)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error getting widget app: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get widget app"
        )


@router.patch("/{app_id}", response_model=WidgetAppResponse)
async def update_widget_app(
    app_id: UUID,
    update_data: WidgetAppUpdate,
    current_user: User = Depends(require_permissions("manage_organization")),
    db: Session = Depends(get_db)
):
    """
    Update widget app (name, description, active status).

    Requires: manage_organization permission (admin only)
    """
    try:
        repo = WidgetAppRepository(db)
        app = repo.update_app(
            app_id=app_id,
            organization_id=current_user.organization_id,
            name=update_data.name,
            description=update_data.description,
            is_active=update_data.is_active
        )

        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Widget app {app_id} not found"
            )

        return WidgetAppResponse.from_orm(app)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error updating widget app: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update widget app"
        )


@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_widget_app(
    app_id: UUID,
    hard_delete: bool = False,
    current_user: User = Depends(require_permissions("manage_organization")),
    db: Session = Depends(get_db)
):
    """
    Delete widget app (soft delete by default, hard delete if hard_delete=true).

    Soft delete (default): Sets is_active=False, keeps record for audit trail.
    Hard delete: Permanently removes record (use with caution).

    Requires: manage_organization permission (admin only)
    """
    try:
        repo = WidgetAppRepository(db)

        if hard_delete:
            success = repo.delete_app(app_id, current_user.organization_id)
        else:
            success = repo.deactivate_app(app_id, current_user.organization_id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Widget app {app_id} not found"
            )

        # Invalidate cache if we have the key prefix (can't do this without key)
        # Cache will naturally expire after TTL

        return None  # 204 No Content

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error deleting widget app: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete widget app"
        )


@router.post("/{app_id}/regenerate-key", response_model=WidgetAppWithKeyResponse)
async def regenerate_api_key(
    app_id: UUID,
    current_user: User = Depends(require_permissions("manage_organization")),
    db: Session = Depends(get_db)
):
    """
    Regenerate API key for widget app.

    **IMPORTANT:** The new API key is shown only once in this response.
    Save it securely - it cannot be retrieved later.
    The old key will be immediately invalidated.

    Requires: manage_organization permission (admin only)
    """
    try:
        repo = WidgetAppRepository(db)

        result = repo.regenerate_api_key(
            app_id=app_id,
            organization_id=current_user.organization_id
        )

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Widget app {app_id} not found"
            )

        app, new_plain_key = result

        # Invalidate cache (old key is now invalid)
        # Note: We don't have the old key here, so cache will expire naturally

        return WidgetAppWithKeyResponse(
            id=app.id,
            name=app.name,
            description=app.description,
            organization_id=app.organization_id,
            created_by=app.created_by,
            is_active=app.is_active,
            created_at=app.created_at,
            updated_at=app.updated_at,
            api_key=new_plain_key  # New key shown only once
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error regenerating API key: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to regenerate API key"
        )

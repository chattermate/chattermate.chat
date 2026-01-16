"""
ChatterMate - Widget App Repository
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

from sqlalchemy.orm import Session
from app.models.widget_app import WidgetApp
from app.core.security import (
    generate_widget_api_key,
    hash_widget_api_key,
    verify_widget_api_key,
    cache_widget_api_key,
    get_cached_widget_api_key
)
from typing import Optional, List
from uuid import UUID
from app.core.logger import get_logger

logger = get_logger(__name__)


class WidgetAppRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_app(
        self,
        organization_id: UUID,
        created_by: UUID,
        name: str,
        description: Optional[str] = None
    ) -> tuple[WidgetApp, str]:
        """
        Create a new widget app with generated API key.

        Returns:
            tuple: (WidgetApp object, plain_text_api_key)
                   Plain key is returned ONCE and never stored.
        """
        try:
            # Generate new API key
            plain_key = generate_widget_api_key()
            hashed_key = hash_widget_api_key(plain_key)

            app = WidgetApp(
                name=name,
                description=description,
                organization_id=organization_id,
                created_by=created_by,
                api_key_hash=hashed_key,
                is_active=True
            )

            self.db.add(app)
            self.db.commit()
            self.db.refresh(app)

            logger.info(f"Created widget app: {app.id} for org: {organization_id}")

            # Return both app and plain key (shown only once)
            return app, plain_key

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating widget app: {str(e)}")
            raise

    def get_app_by_id(self, app_id: UUID, organization_id: UUID) -> Optional[WidgetApp]:
        """Get widget app by ID (scoped to organization)"""
        return self.db.query(WidgetApp).filter(
            WidgetApp.id == app_id,
            WidgetApp.organization_id == organization_id
        ).first()

    def get_apps_by_organization(
        self,
        organization_id: UUID,
        include_inactive: bool = False
    ) -> List[WidgetApp]:
        """Get all widget apps for an organization"""
        query = self.db.query(WidgetApp).filter(
            WidgetApp.organization_id == organization_id
        )

        if not include_inactive:
            query = query.filter(WidgetApp.is_active == True)

        return query.order_by(WidgetApp.created_at.desc()).all()

    def validate_api_key(self, api_key: str) -> Optional[WidgetApp]:
        """
        Validate API key and return associated app if valid.

        This is the critical path for authentication - uses Redis cache for performance.
        Checks ALL active apps and compares hashes (bcrypt is designed for this).

        Args:
            api_key: Plain text API key from Authorization header

        Returns:
            WidgetApp if valid, None otherwise
        """
        # Try cache first (fast path)
        cached_data = get_cached_widget_api_key(api_key)
        if cached_data:
            # Cache hit - get app from database by ID
            app = self.db.query(WidgetApp).filter(
                WidgetApp.id == cached_data["app_id"],
                WidgetApp.is_active == True
            ).first()
            if app:
                logger.debug(f"Valid API key from cache for app: {app.id}")
                return app

        # Cache miss - do full validation (slow path)
        active_apps = self.db.query(WidgetApp).filter(
            WidgetApp.is_active == True
        ).all()

        # Check each app's hashed key
        # bcrypt.verify is fast enough for this (~100ms per check)
        for app in active_apps:
            if verify_widget_api_key(api_key, app.api_key_hash):
                # Valid key - cache it for future requests
                cache_widget_api_key(api_key, str(app.id), str(app.organization_id))
                logger.info(f"Valid API key for app: {app.id}")
                return app

        logger.warning("Invalid API key attempt")
        return None

    def update_app(
        self,
        app_id: UUID,
        organization_id: UUID,
        name: Optional[str] = None,
        description: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> Optional[WidgetApp]:
        """Update widget app (name, description, active status)"""
        app = self.get_app_by_id(app_id, organization_id)
        if not app:
            return None

        if name is not None:
            app.name = name
        if description is not None:
            app.description = description
        if is_active is not None:
            app.is_active = is_active

        self.db.commit()
        self.db.refresh(app)

        logger.info(f"Updated widget app: {app_id}")
        return app

    def deactivate_app(self, app_id: UUID, organization_id: UUID) -> bool:
        """Deactivate (soft delete) a widget app"""
        app = self.get_app_by_id(app_id, organization_id)
        if not app:
            return False

        app.is_active = False
        self.db.commit()

        logger.info(f"Deactivated widget app: {app_id}")
        return True

    def regenerate_api_key(
        self,
        app_id: UUID,
        organization_id: UUID
    ) -> Optional[tuple[WidgetApp, str]]:
        """
        Regenerate API key for an existing app.

        Returns:
            tuple: (WidgetApp, new_plain_key) or None if app not found
        """
        app = self.get_app_by_id(app_id, organization_id)
        if not app:
            return None

        # Generate new key
        new_plain_key = generate_widget_api_key()
        new_hashed_key = hash_widget_api_key(new_plain_key)

        # Update hash
        app.api_key_hash = new_hashed_key
        self.db.commit()
        self.db.refresh(app)

        logger.info(f"Regenerated API key for app: {app_id}")

        return app, new_plain_key

    def delete_app(self, app_id: UUID, organization_id: UUID) -> bool:
        """
        Hard delete a widget app (use with caution).
        Prefer deactivate_app() for soft delete.
        """
        app = self.get_app_by_id(app_id, organization_id)
        if not app:
            return False

        self.db.delete(app)
        self.db.commit()

        logger.warning(f"HARD DELETED widget app: {app_id}")
        return True

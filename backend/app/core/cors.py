"""
ChatterMate - Cors
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

import json
import os
from typing import Set
from functools import lru_cache
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

# Base CORS origins that are always allowed
BASE_CORS_ORIGINS: list = settings.CORS_ORIGINS

@lru_cache(maxsize=1)
def get_cors_origins() -> Set[str]:
    """
    Get all allowed CORS origins including organization domains.
    This function is cached to improve performance.
    """
    from app.repositories.organization import OrganizationRepository
    from app.database import SessionLocal

    # Start with base origins
    all_origins = set(BASE_CORS_ORIGINS)

    # Add organization domains
    try:
        db = SessionLocal()
        org_repo = OrganizationRepository(db)
        orgs = org_repo.get_active_organizations()
        
        for org in orgs:
            # Add both http and https variants
            all_origins.add(f"https://{org.domain}")
            all_origins.add(f"http://{org.domain}")
            # Add www subdomain variants
            all_origins.add(f"https://www.{org.domain}")
            all_origins.add(f"http://www.{org.domain}")
    except Exception as e:
        logger.error(f"Error fetching organization domains: {e}")
    finally:
        if 'db' in locals():
            db.close()

    return all_origins

def refresh_cors_origins() -> None:
    """
    Clear the CORS origins cache to force a refresh
    """
    get_cors_origins.cache_clear()

def update_cors_middleware(app: FastAPI) -> None:
    """
    Update the CORS middleware with new origins
    """
    # Get fresh CORS origins
    refresh_cors_origins()
    new_origins = list(get_cors_origins())
    
    # Find and update the CORS middleware
    for middleware in app.user_middleware:
        if isinstance(middleware.cls, CORSMiddleware):
            middleware.cls.options['allow_origins'] = new_origins
            logger.info(f"Updated FastAPI CORS origins: {new_origins}")
            break
    
    # Update Socket.IO CORS settings
    from app.core.socketio import sio
    sio.eio.cors_allowed_origins = new_origins
    logger.info(f"Updated Socket.IO CORS origins: {new_origins}") 
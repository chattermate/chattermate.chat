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

Custom-domain lifecycle for the help center: claim, verify (DNS + SSL),
inspect status, remove.
"""

import asyncio

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.auth import require_permissions
from app.database import get_db
from app.models.schemas.help_center import DomainRequest, DomainStatusResponse
from app.models.user import User
from app.services.domain_verification import (
    clear_custom_domain,
    set_custom_domain,
    verify_custom_domain,
)
from app.services.help_center_access import check_help_center_access
from app.services.help_center_settings import get_or_create_settings

router = APIRouter()


def _domain_response(row) -> DomainStatusResponse:
    from app.api.help_center.branding import domain_status_response
    return domain_status_response(row)


@router.post("/domain", response_model=DomainStatusResponse)
async def set_domain(
    payload: DomainRequest,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    check_help_center_access(db, current_user.organization_id)
    row = get_or_create_settings(db, current_user.organization)
    try:
        row = set_custom_domain(db, row, payload.domain)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="That domain is already in use.")
    return _domain_response(row)


@router.delete("/domain", response_model=DomainStatusResponse)
async def remove_domain(
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    check_help_center_access(db, current_user.organization_id)
    row = get_or_create_settings(db, current_user.organization)
    return _domain_response(clear_custom_domain(db, row))


@router.post("/domain/verify", response_model=DomainStatusResponse)
async def verify_domain(
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    check_help_center_access(db, current_user.organization_id)
    row = get_or_create_settings(db, current_user.organization)
    if not row.custom_domain:
        raise HTTPException(status_code=400, detail="Set a custom domain first.")
    # DNS + HTTPS probes block; keep them off the event loop.
    row = await asyncio.to_thread(verify_custom_domain, db, row)
    return _domain_response(row)


@router.get("/domain/status", response_model=DomainStatusResponse)
async def domain_status(
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    """Stored state only — cheap enough for the UI's pending-domain polling.
    POST /domain/verify is the endpoint that re-runs live DNS checks."""
    row = get_or_create_settings(db, current_user.organization)
    return _domain_response(row)

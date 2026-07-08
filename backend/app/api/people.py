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

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.core.logger import get_logger
from app.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.repositories.people import PeopleRepository
from app.models.schemas.people import (
    PeopleListResponse, PeopleStats, PersonDetail, PersonListItem,
)

# Enterprise gating — People is part of Lead Management, a Pro-plan feature where
# the enterprise module is installed; OSS/community deployments are unrestricted.
try:
    from app.enterprise.repositories.plan import PlanRepository
    from app.enterprise.services.feature_access import require_accessible_subscription
    HAS_ENTERPRISE = True
except ImportError:
    HAS_ENTERPRISE = False

router = APIRouter()
logger = get_logger(__name__)

# People is an org-wide view of every lead/customer, so it needs a broad
# chat-viewing capability — not the limited "assigned chats only" permission.
_VIEW_PERMISSIONS = {"view_all_chats", "manage_chats"}


def _require_people_access(current_user: User, db: Session) -> None:
    perms = {p.name for p in current_user.role.permissions}
    if perms.isdisjoint(_VIEW_PERMISSIONS):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    # Pro-plan gate (Lead Management) where the enterprise module is present.
    if HAS_ENTERPRISE:
        subscription = require_accessible_subscription(db, current_user.organization_id)
        if not PlanRepository(db).check_feature_availability(str(subscription.plan_id), 'lead_capture'):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="People / Lead Management is not available in your current plan. Please upgrade to Pro.",
            )


@router.get("", response_model=PeopleListResponse)
async def list_people(
    stage: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Paginated, filterable list of everyone the org's agents have touched."""
    _require_people_access(current_user, db)
    items, total = PeopleRepository(db).list_people(
        current_user.organization_id, stage=stage, search=search, page=page, page_size=page_size,
    )
    return PeopleListResponse(
        items=[PersonListItem(**i) for i in items],
        total=total, page=page, page_size=page_size,
    )


@router.get("/stats", response_model=PeopleStats)
async def people_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """KPI counters for the People page header."""
    _require_people_access(current_user, db)
    return PeopleStats(**PeopleRepository(db).get_stats(current_user.organization_id))


@router.get("/{customer_id}", response_model=PersonDetail)
async def get_person(
    customer_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Full profile: captured attributes, lifecycle timeline, conversations."""
    _require_people_access(current_user, db)
    detail = PeopleRepository(db).get_detail(current_user.organization_id, customer_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Person not found")
    return PersonDetail(**detail)


@router.post("/{customer_id}/mark-customer", response_model=PersonDetail)
async def mark_as_customer(
    customer_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Manually promote a person to the Customer stage (phase 1: no automated signal)."""
    _require_people_access(current_user, db)
    repo = PeopleRepository(db)
    customer = repo.mark_customer(current_user.organization_id, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Person not found")
    detail = repo.get_detail(current_user.organization_id, customer_id)
    return PersonDetail(**detail)

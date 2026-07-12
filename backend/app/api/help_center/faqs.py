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

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.auth import require_permissions
from app.database import get_db
from app.models.faq import FAQ, FAQStatus
from app.models.schemas.faq import (
    FAQBulkStatusRequest,
    FAQCreate,
    FAQListResponse,
    FAQResponse,
    FAQUpdate,
)
from app.models.schemas.pagination import Pagination
from app.models.user import User
from app.repositories.faq import FAQRepository
from app.services.help_center_access import check_help_center_access

router = APIRouter()


def _get_owned_faq(faq_id: UUID, current_user: User, db: Session) -> FAQ:
    faq = FAQRepository(db).get_by_id(faq_id, current_user.organization_id)
    # 404 for both missing and cross-org ids (don't reveal existence).
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return faq


@router.get("/faqs", response_model=FAQListResponse)
async def list_faqs(
    status: Optional[FAQStatus] = Query(default=None),
    category: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None, max_length=200),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=100, ge=1, le=200),
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    items, total = FAQRepository(db).list_for_org(
        current_user.organization_id,
        status=status,
        category=category,
        search=q,
        skip=(page - 1) * page_size,
        limit=page_size,
    )
    return FAQListResponse(
        faqs=[FAQResponse.model_validate(item) for item in items],
        pagination=Pagination.build(total=total, page=page, page_size=page_size),
    )


@router.get("/faqs/categories", response_model=List[str])
async def list_categories(
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    return FAQRepository(db).get_categories(current_user.organization_id)


@router.post("/faqs", response_model=FAQResponse, status_code=201)
async def create_faq(
    payload: FAQCreate,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    check_help_center_access(db, current_user.organization_id)
    faq = FAQ(
        organization_id=current_user.organization_id,
        question=payload.question,
        answer=payload.answer,
        category=payload.category,
        status=payload.status,
        source_label="Added manually",
        created_by=current_user.id,
    )
    return FAQResponse.model_validate(FAQRepository(db).create(faq))


@router.put("/faqs/{faq_id}", response_model=FAQResponse)
async def update_faq(
    faq_id: UUID,
    payload: FAQUpdate,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    check_help_center_access(db, current_user.organization_id)
    faq = _get_owned_faq(faq_id, current_user, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(faq, field, value)
    return FAQResponse.model_validate(FAQRepository(db).update(faq))


@router.delete("/faqs/{faq_id}", status_code=204)
async def delete_faq(
    faq_id: UUID,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    check_help_center_access(db, current_user.organization_id)
    faq = _get_owned_faq(faq_id, current_user, db)
    FAQRepository(db).delete(faq)


@router.post("/faqs/bulk-status")
async def bulk_set_status(
    payload: FAQBulkStatusRequest,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    """Publish/unpublish one or many FAQs in a single call."""
    check_help_center_access(db, current_user.organization_id)
    updated = FAQRepository(db).bulk_set_status(
        current_user.organization_id, payload.faq_ids, payload.status
    )
    return {"updated": updated}

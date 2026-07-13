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
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.core.auth import require_permissions
from app.core.config import settings
from app.database import get_db
from app.models.faq import FAQ, FAQStatus
from app.models.schemas.faq import (
    FAQBulkDeleteRequest,
    FAQBulkStatusRequest,
    FAQCreate,
    FAQListResponse,
    FAQResponse,
    FAQUpdate,
)
from app.models.schemas.pagination import Pagination
from app.models.user import User
from app.repositories.faq import FAQRepository
from app.services.file_storage import store_upload
from app.services.help_center_access import check_help_center_access
from app.services.help_center_settings import generate_faq_slug

router = APIRouter()

# Images embedded in an article's Markdown must resolve to a STABLE, ABSOLUTE URL
# (they render on the help-center domain, and the reference is stored inline in the
# answer forever — so no signed/expiring URLs and no host-relative paths).
MAX_FAQ_IMAGE_BYTES = 5 * 1024 * 1024
_FAQ_IMAGE_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
}


def _absolute_upload_url(stored: str) -> str:
    """Make a stored upload path absolute. S3 returns an absolute http(s) URL
    already; local mode returns a path under the /api/v1/uploads mount, which we
    anchor to the backend's public origin so it loads cross-domain."""
    if stored.startswith("http"):
        return stored
    return f"{settings.BACKEND_URL.rstrip('/')}{stored}"


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
        slug=generate_faq_slug(db, current_user.organization_id, payload.question),
        source_label="Added manually",
        created_by=current_user.id,
    )
    return FAQResponse.model_validate(FAQRepository(db).create(faq))


@router.post("/faqs/image")
async def upload_faq_image(
    file: UploadFile = File(...),
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    """Upload an image for embedding in an article's Markdown. Returns a stable
    absolute URL the editor inserts as ![](url)."""
    check_help_center_access(db, current_user.organization_id)
    content = await file.read()
    if len(content) > MAX_FAQ_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Image must be 5MB or smaller.")
    # Extension comes from the VALIDATED content type, never the client filename.
    if file.content_type not in _FAQ_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Use a PNG, JPEG, GIF or WebP image.")
    file_name = f"{uuid4()}{_FAQ_IMAGE_TYPES[file.content_type]}"
    stored = await store_upload(
        content=content,
        folder="help_center",
        file_name=file_name,
        content_type=file.content_type,
    )
    return {"url": _absolute_upload_url(stored)}


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
    # Backfill a slug for legacy/generated FAQs the first time they're edited;
    # keep an existing slug stable so published article URLs never change.
    if not faq.slug:
        faq.slug = generate_faq_slug(db, current_user.organization_id, faq.question)
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


@router.post("/faqs/bulk-delete")
async def bulk_delete(
    payload: FAQBulkDeleteRequest,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    """Delete many FAQs in one call (org-scoped; foreign ids are ignored)."""
    check_help_center_access(db, current_user.organization_id)
    deleted = FAQRepository(db).bulk_delete(current_user.organization_id, payload.faq_ids)
    return {"deleted": deleted}

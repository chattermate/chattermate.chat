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

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.auth import require_permissions
from app.database import get_db
from app.knowledge.url_safety import resolves_to_blocked_host
from app.models.faq_generation_job import FAQGenerationJob, FAQJobType
from app.models.knowledge import Knowledge
from app.models.schemas.faq import (
    GenerateRequest,
    GenerationEstimateResponse,
    GenerationJobResponse,
    ImportRequest,
)
from app.models.user import User
from app.repositories.ai_config import AIConfigRepository
from app.repositories.faq_generation_job import FAQGenerationJobRepository
from app.services.faq_usage import (
    ensure_generation_budget,
    estimate_generation_calls,
    generation_is_metered,
    remaining_message_credits,
)
from app.services.help_center_access import check_help_center_access

router = APIRouter()

# Budget floor for imports whose call count isn't known up front — blocks only
# a fully exhausted plan; the per-call metering happens in the worker.
MIN_IMPORT_CALL_ESTIMATE = 1


def _require_ai_config(db: Session, organization_id) -> None:
    if not AIConfigRepository(db).get_active_config(organization_id):
        raise HTTPException(
            status_code=400,
            detail="No active AI configuration. Set up an AI model in AI Configuration first.",
        )


def _enqueue(
    db: Session,
    current_user: User,
    job_type: FAQJobType,
    estimated_calls: int = MIN_IMPORT_CALL_ESTIMATE,
    requires_llm: bool = True,
    **fields,
) -> FAQGenerationJob:
    """Shared enqueue guard: one active job per type per org (409 on dupes),
    fail fast when no AI model is configured, 402 when a metered run exceeds
    the remaining message credits. Stamps the job's `metered` flag from the
    org's current AI config. requires_llm=False (article import) skips the
    AI-config and credit checks entirely."""
    org_id = current_user.organization_id
    check_help_center_access(db, org_id)
    if requires_llm:
        _require_ai_config(db, org_id)
        ensure_generation_budget(db, org_id, estimated_calls)
    job_repo = FAQGenerationJobRepository(db)
    if job_repo.get_active_for_org(org_id, job_type):
        raise HTTPException(status_code=409, detail="A job of this type is already running.")
    try:
        return job_repo.create(
            FAQGenerationJob(
                organization_id=org_id,
                user_id=current_user.id,
                job_type=job_type.value,
                metered=requires_llm and generation_is_metered(db, org_id),
                **fields,
            )
        )
    except IntegrityError:
        # Concurrent enqueue lost the race against the partial unique index.
        db.rollback()
        raise HTTPException(status_code=409, detail="A job of this type is already running.")


def _validate_org_knowledge_ids(db: Session, organization_id, knowledge_ids) -> None:
    if not knowledge_ids:
        return
    owned = {
        row[0]
        for row in db.query(Knowledge.id)
        .filter(Knowledge.organization_id == organization_id, Knowledge.id.in_(knowledge_ids))
        .all()
    }
    if set(knowledge_ids) - owned:
        raise HTTPException(status_code=400, detail="Unknown knowledge source in selection.")


@router.get("/generate/estimate", response_model=GenerationEstimateResponse)
async def generation_estimate(
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    """Pre-generation numbers for the confirm dialog: new (ungenerated)
    sources, page count, estimated LLM calls and remaining credits."""
    org_id = current_user.organization_id
    check_help_center_access(db, org_id)
    estimate = estimate_generation_calls(db, org_id)
    metered = generation_is_metered(db, org_id)
    return GenerationEstimateResponse(
        total_sources=estimate.total_sources,
        new_sources=estimate.new_sources,
        pages=estimate.pages,
        estimated_calls=estimate.estimated_calls,
        metered=metered,
        remaining_credits=remaining_message_credits(db, org_id) if metered else None,
    )


@router.post("/generate", response_model=GenerationJobResponse, status_code=202)
async def start_generation(
    payload: Optional[GenerateRequest] = None,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    """Draft FAQs from the knowledge base (additive; the worker dedups against
    existing questions). By default only sources without FAQs are read;
    knowledge_ids explicitly targets sources instead."""
    org_id = current_user.organization_id
    # Plan gate and AI-config checks first: a locked plan must see 403 and a
    # missing model its setup hint, not source-count errors.
    check_help_center_access(db, org_id)
    _require_ai_config(db, org_id)
    knowledge_ids = payload.knowledge_ids if payload else None
    _validate_org_knowledge_ids(db, org_id, knowledge_ids)
    estimate = estimate_generation_calls(db, org_id, knowledge_ids)
    if estimate.total_sources == 0:
        raise HTTPException(status_code=400, detail="No knowledge sources to generate from. Add knowledge first.")
    if estimate.new_sources == 0:
        raise HTTPException(
            status_code=409,
            detail="All knowledge sources already have FAQs. Delete a source's FAQs to regenerate it.",
        )
    job = _enqueue(
        db,
        current_user,
        FAQJobType.GENERATE_ALL,
        estimated_calls=estimate.estimated_calls,
        knowledge_ids=knowledge_ids,
    )
    return GenerationJobResponse.model_validate(job)


@router.post("/import", response_model=GenerationJobResponse, status_code=202)
async def start_import(
    payload: ImportRequest,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    """Migrate an existing help center. mode=qa extracts Q&A pairs from the
    page with the org's model (uses credits); mode=articles crawls the page's
    linked article pages and imports each one as-is (Markdown, no LLM)."""
    # Early SSRF rejection for immediate feedback; the worker re-validates at
    # fetch time (including every redirect hop).
    if resolves_to_blocked_host(payload.url):
        raise HTTPException(status_code=400, detail="That URL points to a blocked or internal host.")
    if payload.mode == "articles":
        # No LLM → no AI-config requirement, no credit checks.
        job = _enqueue(
            db, current_user, FAQJobType.IMPORT_ARTICLES,
            requires_llm=False, source_url=payload.url,
        )
    else:
        job = _enqueue(db, current_user, FAQJobType.IMPORT_URL, source_url=payload.url)
    return GenerationJobResponse.model_validate(job)


@router.get("/jobs", response_model=Optional[GenerationJobResponse])
async def get_job(
    active: bool = Query(default=True, description="Active job only; false = most recent job"),
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    """The UI's polling endpoint: the running job if any (active=true), or the
    most recent job of any status (active=false) for showing the last outcome."""
    job_repo = FAQGenerationJobRepository(db)
    if active:
        job = job_repo.get_active_for_org(current_user.organization_id)
    else:
        job = job_repo.get_latest_for_org(current_user.organization_id)
    return GenerationJobResponse.model_validate(job) if job else None


@router.get("/jobs/{job_id}", response_model=GenerationJobResponse)
async def get_job_by_id(
    job_id: int,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    job = FAQGenerationJobRepository(db).get_by_id_for_org(job_id, current_user.organization_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return GenerationJobResponse.model_validate(job)

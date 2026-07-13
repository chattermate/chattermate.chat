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

FAQ generation usage/credits: estimate how many LLM calls a run will make,
decide whether those calls are metered (hosted model), and enforce the org's
message budget before enqueueing. OSS/self-hosted (no enterprise module) is
never metered and never blocked.
"""

import math
from dataclasses import dataclass
from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logger import get_logger
from app.knowledge.page_editor import PAGE_ID_EXPR
from app.models.knowledge import Knowledge
from app.repositories.ai_config import AIConfigRepository
from app.repositories.faq import FAQRepository

logger = get_logger(__name__)

# Rough pages-per-LLM-call heuristic for the confirm-dialog estimate (matches
# today's floor batch of ~3 average pages). An estimate, not billing.
PAGES_PER_CALL = 3

# Model type whose provider costs land on the platform, hence metered.
HOSTED_MODEL_TYPE = "CHATTERMATE"

OVER_BUDGET_MESSAGE = (
    "Not enough message credits left in your plan for this generation "
    "(~{estimated} needed, {remaining} remaining). Upgrade your plan or "
    "switch to your own AI model key."
)


@dataclass
class SourceEstimate:
    id: int
    name: str
    source_type: str
    has_faqs: bool
    pages: int
    estimated_calls: int


@dataclass
class GenerationEstimate:
    total_sources: int
    new_sources: int
    pages: int
    estimated_calls: int
    sources: List[SourceEstimate]


def generation_is_metered(db: Session, organization_id: UUID) -> bool:
    """Generation costs credits only on the hosted model — own-key orgs pay
    their provider directly. FAQ_METER_OWN_KEY flips to always-meter."""
    if settings.FAQ_METER_OWN_KEY:
        return True
    config = AIConfigRepository(db).get_active_config(organization_id)
    if not config:
        return False
    model_type = config.model_type.value if hasattr(config.model_type, "value") else str(config.model_type)
    return model_type.upper() == HOSTED_MODEL_TYPE


def count_source_pages(db: Session, knowledge: Knowledge) -> Optional[int]:
    """Distinct stored pages for a source, capped like generation itself.
    None when the vector table is missing/unreadable."""
    if not knowledge.schema or not knowledge.table_name:
        return None
    query = text(
        f"SELECT COUNT(*) FROM (SELECT {PAGE_ID_EXPR} "
        f'FROM {knowledge.schema}."{knowledge.table_name}" '
        "WHERE name = :source GROUP BY 1 LIMIT :max_pages) pages"
    )
    try:
        count = db.execute(
            query, {"source": knowledge.source, "max_pages": settings.FAQ_MAX_PAGES_PER_SOURCE}
        ).scalar()
        return int(count or 0)
    except Exception as e:
        logger.warning(f"Page count failed for knowledge {knowledge.id}: {e}")
        db.rollback()
        return None


def estimate_generation_calls(
    db: Session,
    organization_id: UUID,
    knowledge_ids: Optional[List[int]] = None,
    count_pages: bool = True,
) -> GenerationEstimate:
    """Confirm-dialog numbers for a GENERATE_ALL run: which sources it would
    read (new-only unless explicitly targeted) and roughly how many LLM calls
    that costs. Unreadable sources count as one call each.

    Always returns the FULL per-source list (for the generation source picker),
    each with its own page/call estimate and whether it already has FAQs. The
    aggregate counts (new_sources/pages/estimated_calls) cover the run's TARGET
    sources: the explicit `knowledge_ids` selection, or — when none is given —
    every source that doesn't yet have FAQs.

    count_pages=False skips the per-source page COUNT over the vector tables
    (cheap — for surfaces that only need counts, like the Generate button
    label); per-source estimated_calls is then a 1-per-source lower bound."""
    all_sources = (
        db.query(Knowledge).filter(Knowledge.organization_id == organization_id).all()
    )
    generated = FAQRepository(db).knowledge_ids_with_faqs(organization_id)
    existing_ids = {s.id for s in all_sources}
    target_ids = (
        (set(knowledge_ids) & existing_ids)
        if knowledge_ids
        else {s.id for s in all_sources if s.id not in generated}
    )

    source_list: List[SourceEstimate] = []
    agg_pages = 0
    agg_calls = 0
    for source in all_sources:
        source_pages = count_source_pages(db, source) if count_pages else None
        pages = source_pages or 0
        calls = max(1, math.ceil(pages / PAGES_PER_CALL)) if pages else 1
        source_list.append(
            SourceEstimate(
                id=source.id,
                name=source.source,
                source_type=source.source_type.value if hasattr(source.source_type, "value") else str(source.source_type),
                has_faqs=source.id in generated,
                pages=pages,
                estimated_calls=calls,
            )
        )
        if source.id in target_ids:
            agg_pages += pages
            agg_calls += calls

    return GenerationEstimate(
        total_sources=len(all_sources),
        new_sources=len(target_ids),
        pages=agg_pages,
        estimated_calls=agg_calls,
        sources=source_list,
    )


def remaining_message_credits(db: Session, organization_id: UUID) -> Optional[int]:
    """Credits left in the billing period, or None when unlimited (no
    enterprise module, no subscription cap, or the check errored — fail open,
    matching check_message_limit's posture)."""
    try:
        from app.enterprise.services.message_limit import get_remaining_messages
    except ImportError:
        return None
    try:
        return get_remaining_messages(db, organization_id)
    except Exception as e:
        logger.error(f"Remaining-credit check failed for org {organization_id}: {e}")
        return None


def ensure_generation_budget(db: Session, organization_id: UUID, estimated_calls: int) -> None:
    """402 when a metered run would exceed the org's remaining credits."""
    if estimated_calls <= 0 or not generation_is_metered(db, organization_id):
        return
    remaining = remaining_message_credits(db, organization_id)
    if remaining is None:
        return
    if estimated_calls > remaining:
        raise HTTPException(
            status_code=402,
            detail=OVER_BUDGET_MESSAGE.format(estimated=estimated_calls, remaining=remaining),
        )

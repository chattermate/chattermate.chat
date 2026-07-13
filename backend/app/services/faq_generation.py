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

FAQ generation pipeline: read the org's stored knowledge text (no re-crawl),
extract grounded FAQs with the org's configured model, dedup against existing
questions and insert drafts for review. Additive only — regeneration never
edits or deletes existing FAQs. The drafting loop and dedup/category helpers
here are shared with the import service (faq_import.py).
"""

import re
from collections import deque
from difflib import SequenceMatcher
from typing import Awaitable, Callable, List, Optional, Tuple, TypeVar

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.agents.faq_generator import FAQGeneratorAgent, GeneratedFAQ
from app.core.config import settings
from app.core.logger import get_logger
from app.core.security import decrypt_api_key
from app.knowledge.page_editor import PAGE_ID_EXPR
from app.models.faq import FAQ, DEFAULT_FAQ_CATEGORY, FAQStatus
from app.models.faq_generation_job import FAQGenerationJob, FAQJobStage, FAQJobType
from app.models.knowledge import Knowledge
from app.repositories.ai_config import AIConfigRepository
from app.repositories.faq import FAQRepository
from app.repositories.faq_generation_job import FAQGenerationJobRepository

logger = get_logger(__name__)

# Dedup lists injected into prompts are a small recent window for intra-run
# steering only — the in-Python DedupState below (exact + fuzzy) is the real
# guard covering every existing question, so the prompt stays cheap.
MAX_PROMPT_QUESTIONS = 30

# Fuzzy-dedup tuning: token-set Jaccard on content words; borderline scores are
# confirmed with difflib on the normalized strings. Very short questions skip
# fuzzy matching entirely (too collision-prone).
FUZZY_JACCARD_DUP = 0.8
FUZZY_JACCARD_MAYBE = 0.65
FUZZY_SEQUENCE_DUP = 0.87
FUZZY_MIN_CONTENT_TOKENS = 3

# Tiny inline stopword set — enough to keep filler words from inflating
# question similarity, without an NLP dependency.
_STOPWORDS = frozenset(
    "a an and are can could do does for from how i in is it my of on or the "
    "there to we what when where which who why will with you your".split()
)

# Chunk ids look like 'page', 'page_1', ..., 'page_10' — natural sort (length
# first) keeps 'page_2' before 'page_10' where plain text ordering would not.
_NATURAL_ID_ORDER = "length(id), id"

_PUNCT_RE = re.compile(r"[^\w\s]", re.UNICODE)

BatchT = TypeVar("BatchT")


def normalize_question(question: str) -> str:
    """Casefold + strip punctuation/whitespace, so trivial rephrasings of the
    same question dedup against each other."""
    return " ".join(_PUNCT_RE.sub(" ", question.casefold()).split())


class NoAIConfigError(Exception):
    """The org has no active AI configuration to generate with."""


def build_generator(db: Session, organization_id) -> FAQGeneratorAgent:
    config = AIConfigRepository(db).get_active_config(organization_id)
    if not config:
        raise NoAIConfigError(
            "No active AI configuration. Set up an AI model in AI Configuration first."
        )
    return FAQGeneratorAgent(
        api_key=decrypt_api_key(config.encrypted_api_key),
        model_name=config.model_name,
        model_type=config.model_type.value if hasattr(config.model_type, "value") else str(config.model_type),
    )


def load_source_pages(db: Session, knowledge: Knowledge, max_chars: Optional[int] = None) -> List[str]:
    """One string of aggregated text per crawled page/sub-page of a source,
    read straight from the org's vector table (content is stored alongside the
    embeddings — no re-crawl needed). Pages kept in crawl order when the cap
    truncates; chunk text within a page is naturally ordered. max_chars caps
    each page and defaults to the model-agnostic floor."""
    if not knowledge.schema or not knowledge.table_name:
        # Source rows without a vector table (failed/partial ingestion).
        return []
    query = text(
        f"SELECT {PAGE_ID_EXPR} AS page_id, "
        f"string_agg(content, E'\n' ORDER BY {_NATURAL_ID_ORDER}) AS body "
        f'FROM {knowledge.schema}."{knowledge.table_name}" '
        "WHERE name = :source GROUP BY 1 ORDER BY min(created_at) LIMIT :max_pages"
    )
    rows = db.execute(
        query, {"source": knowledge.source, "max_pages": settings.FAQ_MAX_PAGES_PER_SOURCE}
    ).fetchall()
    max_chars = max_chars or settings.FAQ_MAX_BATCH_CHARS
    return [row.body[:max_chars] for row in rows if row.body and row.body.strip()]


def pack_batches(items: List[str], max_chars: Optional[int] = None, sep: str = "\n\n---\n\n") -> List[str]:
    """Greedy-pack whole items (pages, lines) into batches of ~max_chars.
    Oversized single items are truncated to max_chars, never split across
    batches. Shared by generation (page items) and import (line items)."""
    max_chars = max_chars or settings.FAQ_MAX_BATCH_CHARS
    batches: List[str] = []
    current: List[str] = []
    size = 0
    for item in items:
        item = item[:max_chars]
        if current and size + len(item) + len(sep) > max_chars:
            batches.append(sep.join(current))
            current, size = [], 0
        current.append(item)
        size += len(item) + len(sep)
    if current:
        batches.append(sep.join(current))
    return batches


def _content_tokens(normalized: str) -> frozenset:
    return frozenset(t for t in normalized.split() if t not in _STOPWORDS)


class DedupState:
    """Tracks every question seen (existing + accepted this run).

    Two layers: an exact normalized-set match, plus fuzzy similarity (token-set
    Jaccard via an inverted index, difflib confirmation on borderline scores)
    so rephrasings are caught without shipping the whole question list to the
    LLM. A bounded recent-questions window is still exposed for prompts."""

    def __init__(self, existing_questions: List[str]):
        self.seen: set = set()
        self._token_index: dict = {}  # content token -> set of seen keys
        self._key_tokens: dict = {}  # seen key -> its content-token frozenset
        self._recent = deque(existing_questions, maxlen=MAX_PROMPT_QUESTIONS)
        for q in existing_questions:
            self._remember(normalize_question(q))

    def _remember(self, key: str) -> None:
        if not key or key in self.seen:
            return
        self.seen.add(key)
        tokens = _content_tokens(key)
        self._key_tokens[key] = tokens
        for token in tokens:
            self._token_index.setdefault(token, set()).add(key)

    def is_similar(self, key: str) -> bool:
        """True when key fuzzily matches a seen question. Exact hits are the
        caller's job (cheap set test); this covers rephrasings."""
        tokens = _content_tokens(key)
        if len(tokens) < FUZZY_MIN_CONTENT_TOKENS:
            return False
        candidates: set = set()
        for token in tokens:
            candidates |= self._token_index.get(token, set())
        for candidate in candidates:
            other = self._key_tokens[candidate]
            union = len(tokens | other)
            if not union:
                continue
            jaccard = len(tokens & other) / union
            if jaccard >= FUZZY_JACCARD_DUP:
                return True
            if jaccard >= FUZZY_JACCARD_MAYBE and (
                SequenceMatcher(None, key, candidate).ratio() >= FUZZY_SEQUENCE_DUP
            ):
                return True
        return False

    def accept_new(self, faqs: List[GeneratedFAQ]) -> List[GeneratedFAQ]:
        accepted = []
        for faq in faqs:
            key = normalize_question(faq.question)
            if not key or key in self.seen or self.is_similar(key):
                continue
            self._remember(key)
            self._recent.append(faq.question)
            accepted.append(faq)
        return accepted

    @property
    def for_prompt(self) -> List[str]:
        return list(self._recent)


class CategoryMerger:
    """Case-insensitive merge of model-emitted categories into the org's
    existing spellings."""

    def __init__(self, db: Session, organization_id):
        self._known = {c.casefold(): c for c in FAQRepository(db).get_categories(organization_id)}

    def merge(self, category: str) -> str:
        cleaned = (category or "").strip() or DEFAULT_FAQ_CATEGORY
        return self._known.setdefault(cleaned.casefold(), cleaned)

    @property
    def names(self) -> List[str]:
        return list(self._known.values())


async def draft_batches(
    db: Session,
    job: FAQGenerationJob,
    batches: List[BatchT],
    extract: Callable[[BatchT, DedupState], Awaitable[List[GeneratedFAQ]]],
    retries_per_batch: int = 1,
) -> List[Tuple[BatchT, GeneratedFAQ]]:
    """Shared DRAFTING stage: run `extract` per batch with retry, dedup as we
    go, report progress 30→90%. Raises only when every batch failed."""
    job_repo = FAQGenerationJobRepository(db)
    job_repo.update_progress(job.id, stage=FAQJobStage.DRAFTING, progress_percentage=30.0)
    dedup = DedupState(FAQRepository(db).get_existing_questions(job.organization_id))

    accepted: List[Tuple[BatchT, GeneratedFAQ]] = []
    failures = 0
    for index, batch in enumerate(batches):
        faqs = None
        for attempt in range(1 + retries_per_batch):
            # Counted per attempt (retries cost provider tokens too) — this is
            # the single metering choke point for generation and LLM imports.
            job_repo.increment_llm_calls(job.id)
            try:
                faqs = await extract(batch, dedup)
                break
            except Exception as e:
                logger.warning(f"FAQ batch {index + 1}/{len(batches)} attempt {attempt + 1} failed: {e}")
        if faqs is None:
            failures += 1
        else:
            accepted.extend((batch, faq) for faq in dedup.accept_new(faqs))
        job_repo.update_progress(
            job.id, progress_percentage=30.0 + 60.0 * (index + 1) / len(batches)
        )
    if batches and failures == len(batches):
        raise RuntimeError("FAQ generation failed for every content batch.")
    return accepted


def insert_draft_rows(db: Session, job: FAQGenerationJob, rows: List[FAQ]) -> int:
    """Shared GROUPING stage tail: bulk-insert the drafted rows."""
    FAQGenerationJobRepository(db).update_progress(
        job.id, stage=FAQJobStage.GROUPING, progress_percentage=92.0
    )
    if rows:
        FAQRepository(db).bulk_create(rows)
    return len(rows)


async def run_generation_job(db: Session, job: FAQGenerationJob) -> int:
    """Execute a GENERATE_ALL / GENERATE_SOURCE job. Returns FAQs created.
    Status transitions and notifications are the worker's responsibility."""
    job_repo = FAQGenerationJobRepository(db)

    # Stage 1: resolve sources + model config.
    job_repo.update_progress(job.id, stage=FAQJobStage.ANALYZING_SOURCES, progress_percentage=5.0)
    generator = build_generator(db, job.organization_id)

    knowledge_query = db.query(Knowledge).filter(Knowledge.organization_id == job.organization_id)
    if job.job_type == FAQJobType.GENERATE_SOURCE.value:
        knowledge_query = knowledge_query.filter(Knowledge.id == job.knowledge_id)
    elif job.knowledge_ids:
        # Explicit selection overrides the skip-already-generated default.
        knowledge_query = knowledge_query.filter(Knowledge.id.in_(job.knowledge_ids))
    sources = knowledge_query.all()
    if not sources:
        raise ValueError("No knowledge sources to generate from. Add knowledge first.")

    if job.job_type == FAQJobType.GENERATE_ALL.value and not job.knowledge_ids:
        # Regenerate touches only sources that haven't produced FAQs yet —
        # deleting a source's FAQs makes it eligible again.
        generated = FAQRepository(db).knowledge_ids_with_faqs(job.organization_id)
        sources = [s for s in sources if s.id not in generated]
        if not sources:
            raise ValueError(
                "All knowledge sources already have FAQs. "
                "Delete a source's FAQs to regenerate it."
            )

    # Stage 2: read stored page text per source. A broken source (missing
    # vector table etc.) is skipped, not fatal — unless nothing is readable.
    job_repo.update_progress(job.id, stage=FAQJobStage.EXTRACTING, progress_percentage=10.0)
    source_batches: List[Tuple[Knowledge, str]] = []
    for source in sources:
        try:
            # Batch size follows the org's model context window — big-context
            # models get fewer, larger LLM calls.
            pages = load_source_pages(db, source, max_chars=generator.batch_chars)
        except Exception as e:
            logger.warning(f"Skipping unreadable knowledge source {source.id} ({source.source}): {e}")
            db.rollback()
            continue
        for batch in pack_batches(pages, max_chars=generator.batch_chars):
            source_batches.append((source, batch))
    if not source_batches:
        raise ValueError("The selected knowledge sources contain no readable content.")

    # Stage 3: draft per batch (shared loop).
    categories = CategoryMerger(db, job.organization_id)

    async def extract(batch: Tuple[Knowledge, str], dedup: DedupState) -> List[GeneratedFAQ]:
        return await generator.generate_from_text(
            batch[1],
            existing_questions=dedup.for_prompt,
            existing_categories=categories.names,
        )

    accepted = await draft_batches(db, job, source_batches, extract)

    # Stage 4: group + insert drafts.
    rows = [
        FAQ(
            organization_id=job.organization_id,
            question=faq.question,
            answer=faq.answer,
            category=categories.merge(faq.category),
            status=FAQStatus.DRAFT,
            knowledge_id=source.id,
            source_label=source.source,
            generation_job_id=job.id,
            created_by=job.user_id,
        )
        for (source, _batch_text), faq in accepted
    ]
    return insert_draft_rows(db, job, rows)


def maybe_enqueue_auto_faq_job(db: Session, queue_item) -> Optional[FAQGenerationJob]:
    """Auto-generate draft FAQs when a new knowledge source finishes processing.

    Only fires for orgs that have adopted the feature (a help-center settings
    row or any FAQ exists), have auto-generate on, are allowed by their plan
    (cloud), and don't already have an active job for this source. Never raises
    and always leaves the shared session usable — a hook failure must not fail
    knowledge processing.
    """
    try:
        from app.repositories.help_center import HelpCenterRepository
        from app.services.help_center_access import help_center_allowed

        org_id = queue_item.organization_id
        settings_row = HelpCenterRepository(db).get_by_org(org_id)
        faq_repo = FAQRepository(db)
        job_repo_gate = FAQGenerationJobRepository(db)
        # Adoption gate: auto-generation only after the org explicitly ran a
        # generate/import (or added an FAQ). A settings row alone is NOT
        # opt-in — merely opening the admin page creates one.
        if not job_repo_gate.has_user_initiated_job(org_id) and not faq_repo.exists_for_org(org_id):
            return None
        if settings_row and not settings_row.auto_generate:
            return None
        if not help_center_allowed(db, org_id):
            return None
        knowledge = (
            db.query(Knowledge)
            .filter(Knowledge.organization_id == org_id, Knowledge.source == queue_item.source)
            .order_by(Knowledge.id.desc())  # deterministic: newest row wins on duplicate sources
            .first()
        )
        if not knowledge:
            return None
        job_repo = FAQGenerationJobRepository(db)
        if job_repo.get_active_for_org(org_id, FAQJobType.GENERATE_SOURCE, knowledge_id=knowledge.id):
            return None
        from app.services.faq_usage import (
            count_source_pages,
            ensure_generation_budget,
            generation_is_metered,
            PAGES_PER_CALL,
        )
        from math import ceil

        try:
            pages = count_source_pages(db, knowledge)
            ensure_generation_budget(db, org_id, max(1, ceil((pages or 1) / PAGES_PER_CALL)))
        except HTTPException:
            logger.info(f"Auto FAQ generation skipped for org {org_id}: message budget exhausted")
            return None
        job = job_repo.create(
            FAQGenerationJob(
                organization_id=org_id,
                user_id=queue_item.user_id,
                job_type=FAQJobType.GENERATE_SOURCE.value,
                knowledge_id=knowledge.id,
                metered=generation_is_metered(db, org_id),
            )
        )
        logger.info(f"Auto-enqueued FAQ generation job {job.id} for knowledge {knowledge.id}")
        return job
    except Exception as e:
        logger.error(f"Auto FAQ enqueue failed (non-fatal): {e}")
        # A failed flush would otherwise poison the caller's session and turn
        # an already-successful knowledge run into a FAILED one.
        try:
            db.rollback()
        except Exception:
            pass
        return None

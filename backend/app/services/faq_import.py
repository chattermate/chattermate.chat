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

FAQ page migration: fetch the customer's existing FAQ/help-center page
(SSRF-guarded), extract its Q&A pairs with the org's model and insert them as
drafts. Single page only in v1 — linked sub-pages are not followed.
"""

import asyncio
from typing import List, Optional
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logger import get_logger
from app.knowledge.url_safety import guard_url, safe_get
from app.models.faq import FAQ, FAQStatus
from app.models.faq_generation_job import FAQGenerationJob, FAQJobStage
from app.repositories.faq_generation_job import FAQGenerationJobRepository
from app.services.faq_generation import (
    CategoryMerger,
    DedupState,
    build_generator,
    draft_batches,
    insert_draft_rows,
    pack_batches,
)

logger = get_logger(__name__)

# Below this, the static HTML likely lacks the real content (JS-rendered page).
MIN_STATIC_TEXT_CHARS = 500
# Block-level elements get blank-line separators so a question heading stays
# attached to its answer text when batches are split on blocks.
_BLOCK_TAGS = (
    "p", "div", "section", "article", "li", "h1", "h2", "h3", "h4", "h5", "h6",
    "dt", "dd", "summary", "details", "tr",
)
_BOILERPLATE_TAGS = ("script", "style", "noscript", "nav", "footer", "header", "form")

_FETCH_HEADERS = {"User-Agent": "ChatterMate-FAQ-Import/1.0 (+https://chattermate.chat)"}


def _soup_to_text(soup: BeautifulSoup) -> str:
    """Clean text with one BLANK line between block elements, so downstream
    blank-line batching keeps each Q&A block intact."""
    for tag in soup.find_all(_BOILERPLATE_TAGS):
        tag.decompose()
    for tag in soup.find_all(_BLOCK_TAGS):
        tag.append("\n\n")
    lines = [line.strip() for line in soup.get_text("\n").split("\n")]
    text = "\n".join(lines)
    # Collapse 3+ newlines to exactly one blank line.
    while "\n\n\n" in text:
        text = text.replace("\n\n\n", "\n\n")
    return text.strip()


def fetch_page_text(url: str) -> str:
    """Fetch the page and reduce it to clean text. Static fetch first (every
    redirect hop SSRF-checked by safe_get); crawl4ai's headless browser as a
    fallback for JS-rendered pages. Blocking — callers run it in a thread."""
    text = ""
    final_url = url
    try:
        with httpx.Client(timeout=settings.FAQ_IMPORT_FETCH_TIMEOUT, headers=_FETCH_HEADERS) as client:
            response = safe_get(client, url)
            response.raise_for_status()
            # The hop-validated final URL — the browser fallback fetches this,
            # not the original, so a redirect chain can't smuggle it inward.
            final_url = str(response.url)
            text = _soup_to_text(BeautifulSoup(response.text, "html.parser"))
    except httpx.HTTPError as e:
        logger.warning(f"FAQ import static fetch failed for {url}: {e}")

    if len(text) < MIN_STATIC_TEXT_CHARS:
        rendered = _fetch_rendered_text(final_url)
        if rendered and len(rendered) > len(text):
            text = rendered

    if not text.strip():
        raise ValueError("Could not read any text from that page.")
    return text[: settings.FAQ_IMPORT_MAX_PAGE_CHARS]


def _fetch_rendered_text(url: str) -> Optional[str]:
    """Headless-browser fallback for JS-rendered pages. The URL is re-checked
    against the SSRF guard, but a browser follows redirects/JS navigation
    unguarded — same residual exposure as the knowledge crawler's fallback."""
    try:
        guard_url(url)
        from app.knowledge.crawl4ai_fallback import get_crawl4ai_fallback

        fallback = get_crawl4ai_fallback(timeout=settings.FAQ_IMPORT_FETCH_TIMEOUT)
        if not fallback.is_available:
            return None
        _, soup, _ = fallback.fetch_with_browser(url)
        return _soup_to_text(soup) if soup else None
    except Exception as e:
        logger.warning(f"FAQ import browser fetch failed for {url}: {e}")
        return None


def _split_blocks(text: str) -> List[str]:
    """Blank-line-separated blocks (see _soup_to_text) — the batching unit."""
    return [block for block in text.split("\n\n") if block.strip()]


async def run_import_job(db: Session, job: FAQGenerationJob) -> int:
    """Execute an IMPORT_URL job. Returns FAQs created. Status transitions and
    notifications are the worker's responsibility."""
    job_repo = FAQGenerationJobRepository(db)

    job_repo.update_progress(job.id, stage=FAQJobStage.ANALYZING_SOURCES, progress_percentage=5.0)
    generator = build_generator(db, job.organization_id)

    job_repo.update_progress(job.id, stage=FAQJobStage.EXTRACTING, progress_percentage=15.0)
    # Re-validated at fetch time (not only at the API layer) so a job forged or
    # replayed against the queue can't reach internal hosts; run in a thread so
    # the slow fetch doesn't block the worker's event loop.
    page_text = await asyncio.to_thread(fetch_page_text, job.source_url)
    batches = pack_batches(_split_blocks(page_text), max_chars=generator.batch_chars, sep="\n\n")

    async def extract(batch: str, dedup: DedupState):
        return await generator.extract_from_faq_page(batch, existing_questions=dedup.for_prompt)

    accepted = await draft_batches(db, job, batches, extract, retries_per_batch=0)

    categories = CategoryMerger(db, job.organization_id)
    source_label = f"Imported from {urlparse(job.source_url).netloc}"
    rows = [
        FAQ(
            organization_id=job.organization_id,
            question=faq.question,
            answer=faq.answer,
            category=categories.merge(faq.category),
            status=FAQStatus.DRAFT,
            knowledge_id=None,
            source_label=source_label,
            generation_job_id=job.id,
            created_by=job.user_id,
        )
        for _batch, faq in accepted
    ]
    return insert_draft_rows(db, job, rows)

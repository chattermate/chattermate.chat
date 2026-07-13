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

Article-mode help-center import: crawl the linked article pages of an existing
help-center/FAQ index and import each one AS-IS — HTML converted straight to
Markdown (no LLM, no credits), images downloaded and re-hosted on our storage,
links absolutized. One draft FAQ per article: question = page title, answer =
the article body in Markdown.
"""

import asyncio
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from urllib.parse import urldefrag, urljoin, urlparse

import httpx
from bs4 import BeautifulSoup, Tag
from markdownify import MarkdownConverter

from app.core.config import settings
from app.core.logger import get_logger
from app.knowledge.main_content import select_main_node
from app.knowledge.sitemap_parser import _registrable_domain
from app.knowledge.url_safety import safe_get
from app.models.faq import FAQ, FAQStatus
from app.models.faq_generation_job import FAQGenerationJob, FAQJobStage
from app.models.schemas.faq import MAX_ANSWER_LENGTH, MAX_QUESTION_LENGTH
from app.repositories.faq import FAQRepository
from app.repositories.faq_generation_job import FAQGenerationJobRepository
from app.services.faq_generation import CategoryMerger, insert_draft_rows, normalize_question
from app.services.faq_import import _FETCH_HEADERS, MIN_STATIC_TEXT_CHARS
from app.services.help_center_images import (
    FAQ_IMAGE_TYPES,
    MAX_FAQ_IMAGE_BYTES,
    store_article_image,
)

logger = get_logger(__name__)

DEFAULT_ARTICLE_CATEGORY = "Imported"

# Link targets that can never be article pages.
_SKIP_EXTENSIONS = (
    ".pdf", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".zip", ".mp4",
    ".css", ".js", ".xml", ".ico", ".woff", ".woff2", ".txt", ".json",
)

# In-article chrome that shouldn't survive into the imported Markdown.
_TOC_RE = re.compile("toc|table-of-contents|on-this-page|breadcrumb", re.IGNORECASE)

# Internal scheme marking images collected during conversion, replaced with the
# re-hosted URL afterwards (conversion is sync; storage is async).
_IMG_PLACEHOLDER = "cm-pending-image://{index}"


@dataclass
class Article:
    url: str
    title: str
    markdown: str
    category_hint: str
    # index -> (bytes, content_type) awaiting re-host.
    pending_images: Dict[int, Tuple[bytes, str]] = field(default_factory=dict)


class _ArticleConverter(MarkdownConverter):
    """HTML→Markdown converter that absolutizes links and swaps images for
    placeholders after downloading them (SSRF-guarded, size/type-capped)."""

    def __init__(self, base_url: str, client: httpx.Client, **options):
        super().__init__(**options)
        self._base_url = base_url
        self._client = client
        self.images: Dict[int, Tuple[bytes, str]] = {}

    def convert_a(self, el, text, parent_tags):
        href = el.get("href")
        if href:
            el["href"] = urljoin(self._base_url, href)
        return super().convert_a(el, text, parent_tags)

    def convert_img(self, el, text, parent_tags):
        alt = (el.get("alt") or "").strip()
        src = (el.get("src") or "").strip()
        if not src or src.startswith("data:"):
            return alt  # inline/base64 images are stripped by the renderer anyway
        if len(self.images) >= settings.FAQ_ARTICLE_IMPORT_MAX_IMAGES:
            return alt
        image = self._download(urljoin(self._base_url, src))
        if not image:
            return alt
        index = len(self.images)
        self.images[index] = image
        return f"![{alt}]({_IMG_PLACEHOLDER.format(index=index)})"

    def _download(self, url: str) -> Optional[Tuple[bytes, str]]:
        try:
            response = safe_get(self._client, url)
            response.raise_for_status()
            content_type = (response.headers.get("content-type") or "").split(";")[0].strip()
            if content_type not in FAQ_IMAGE_TYPES or len(response.content) > MAX_FAQ_IMAGE_BYTES:
                return None
            return response.content, content_type
        except Exception as e:
            logger.warning(f"Article image skipped ({url}): {e}")
            return None


def _fetch_soup(client: httpx.Client, url: str) -> Tuple[Optional[BeautifulSoup], str]:
    """Static SSRF-guarded fetch → (soup, final hop-validated URL)."""
    try:
        response = safe_get(client, url)
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser"), str(response.url)
    except httpx.HTTPError as e:
        logger.warning(f"Article fetch failed for {url}: {e}")
        return None, url


def _fetch_index_soup(client: httpx.Client, url: str) -> Tuple[Optional[BeautifulSoup], str]:
    """Index fetch with the headless-browser fallback for JS-rendered indexes
    (article pages themselves are static-only — one browser per crawl, not 30)."""
    soup, final_url = _fetch_soup(client, url)
    if soup and len(soup.get_text(" ", strip=True)) >= MIN_STATIC_TEXT_CHARS:
        return soup, final_url
    try:
        from app.knowledge.crawl4ai_fallback import get_crawl4ai_fallback

        fallback = get_crawl4ai_fallback(timeout=settings.FAQ_IMPORT_FETCH_TIMEOUT)
        if fallback.is_available:
            html, browser_soup, _ = fallback.fetch_with_browser(final_url)
            if browser_soup is not None:
                return browser_soup, final_url
            if isinstance(html, str) and html:
                return BeautifulSoup(html, "html.parser"), final_url
    except Exception as e:
        logger.warning(f"Article index browser fetch failed for {url}: {e}")
    return soup, final_url


def discover_article_links(client: httpx.Client, index_url: str, limit: int) -> List[str]:
    """Same-site article links from the index page, in page order: fragments/
    queries stripped, binaries and the index itself excluded, links sharing the
    index's path prefix preferred (most help centers nest articles under it)."""
    soup, final_url = _fetch_index_soup(client, index_url)
    if soup is None:
        raise ValueError("Could not read that page.")
    root_domain = _registrable_domain(urlparse(final_url).hostname or "")
    index_clean = urldefrag(final_url)[0].rstrip("/")
    index_path = urlparse(final_url).path.rstrip("/")

    preferred: List[str] = []
    others: List[str] = []
    seen = set()
    for anchor in soup.find_all("a", href=True):
        url = urldefrag(urljoin(final_url, anchor["href"]))[0].rstrip("/")
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https") or parsed.query:
            continue
        # Bare-root links are nav (home/app links), never articles.
        if parsed.path in ("", "/"):
            continue
        if url == index_clean or url in seen:
            continue
        if _registrable_domain(parsed.hostname or "") != root_domain:
            continue
        if parsed.path.lower().endswith(_SKIP_EXTENSIONS):
            continue
        seen.add(url)
        (preferred if index_path and parsed.path.startswith(index_path + "/") else others).append(url)
    links = (preferred + others)[:limit]
    if not links:
        raise ValueError("No linked article pages found on that page.")
    return links


def _page_title(soup: BeautifulSoup, node: Tag) -> str:
    og = soup.find("meta", property="og:title")
    if og and og.get("content", "").strip():
        return og["content"].strip()
    h1 = node.find("h1") or soup.find("h1")
    if h1 and h1.get_text(strip=True):
        return h1.get_text(" ", strip=True)
    if soup.title and soup.title.get_text(strip=True):
        # Drop the " | Site Name" tail commonly appended to <title>.
        return soup.title.get_text(strip=True).split("|")[0].strip()
    return ""


def _category_hint(soup: BeautifulSoup, url: str) -> str:
    """Breadcrumb (second-to-last crumb = the article's section) or a URL path
    segment, else the generic import bucket."""
    crumbs = soup.select('[aria-label*="readcrumb"] a, nav.breadcrumb a, .breadcrumbs a, .breadcrumb a')
    texts = [c.get_text(" ", strip=True) for c in crumbs if c.get_text(strip=True)]
    if len(texts) >= 2:
        # Last crumb is the page itself; the one before is its section.
        return texts[-2][:100]
    segments = [s for s in urlparse(url).path.split("/") if s]
    if len(segments) >= 2:
        return segments[-2].replace("-", " ").replace("_", " ").title()[:100]
    return DEFAULT_ARTICLE_CATEGORY


def fetch_article(client: httpx.Client, url: str) -> Optional[Article]:
    """One article page → title + Markdown body (+ images pending re-host).
    None when the page can't be read or has no substantial content."""
    soup, final_url = _fetch_soup(client, url)
    if soup is None:
        return None
    category = _category_hint(soup, final_url)
    node = select_main_node(soup)
    if node is None:
        return None
    title = _page_title(soup, node)
    if not title:
        return None
    # The page's own h1 would duplicate the FAQ question.
    first_h1 = node.find("h1")
    if first_h1:
        first_h1.extract()
    # Strip in-article chrome: nav bars and "On this page" TOCs.
    for chrome in node.find_all("nav"):
        chrome.extract()
    for chrome in node.find_all(class_=_TOC_RE) + node.find_all(id=_TOC_RE):
        chrome.extract()
    converter = _ArticleConverter(base_url=final_url, client=client, heading_style="ATX", bullets="-")
    markdown = converter.convert_soup(node).strip()
    if not markdown:
        return None
    return Article(
        url=final_url,
        title=title[:MAX_QUESTION_LENGTH],
        markdown=markdown,
        category_hint=category,
        pending_images=converter.images,
    )


async def _rehost_images(article: Article) -> str:
    markdown = article.markdown
    for index, (content, content_type) in article.pending_images.items():
        placeholder = _IMG_PLACEHOLDER.format(index=index)
        try:
            markdown = markdown.replace(placeholder, await store_article_image(content, content_type))
        except Exception as e:
            logger.warning(f"Article image re-host failed ({article.url}): {e}")
            markdown = markdown.replace(f"({placeholder})", "()")
    return markdown


async def run_article_import_job(db, job: FAQGenerationJob) -> int:
    """Execute an IMPORT_ARTICLES job. Returns FAQs created. No LLM involved —
    articles are imported verbatim as Markdown drafts."""
    job_repo = FAQGenerationJobRepository(db)
    job_repo.update_progress(job.id, stage=FAQJobStage.ANALYZING_SOURCES, progress_percentage=5.0)

    client = httpx.Client(timeout=settings.FAQ_IMPORT_FETCH_TIMEOUT, headers=_FETCH_HEADERS)
    try:
        links = await asyncio.to_thread(
            discover_article_links, client, job.source_url, settings.FAQ_ARTICLE_IMPORT_MAX_PAGES
        )
        job_repo.update_progress(job.id, stage=FAQJobStage.EXTRACTING, progress_percentage=10.0)

        existing = {normalize_question(q) for q in FAQRepository(db).get_existing_questions(job.organization_id)}
        categories = CategoryMerger(db, job.organization_id)
        source_label = f"Imported from {urlparse(job.source_url).netloc}"

        rows: List[FAQ] = []
        for index, link in enumerate(links):
            article = await asyncio.to_thread(fetch_article, client, link)
            job_repo.update_progress(
                job.id, progress_percentage=10.0 + 78.0 * (index + 1) / len(links)
            )
            if not article:
                continue
            key = normalize_question(article.title)
            if not key or key in existing:
                continue
            existing.add(key)
            answer = (await _rehost_images(article))[:MAX_ANSWER_LENGTH]
            rows.append(
                FAQ(
                    organization_id=job.organization_id,
                    question=article.title,
                    answer=answer,
                    category=categories.merge(article.category_hint),
                    status=FAQStatus.DRAFT,
                    knowledge_id=None,
                    source_label=source_label,
                    generation_job_id=job.id,
                    created_by=job.user_id,
                )
            )
    finally:
        client.close()

    if not rows:
        return 0
    return insert_draft_rows(db, job, rows)

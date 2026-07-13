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
# Word-boundary anchored: matches "docs-toc"/"breadcrumbs" but never innocent
# substrings like "stock-levels" or "autocomplete".
_TOC_RE = re.compile(r"\b(toc|table-of-contents|on-this-page|breadcrumbs?)\b", re.IGNORECASE)

# Help-center chrome text (platform branding / article metadata) to drop.
_CHROME_TEXT_RE = re.compile(r"^(made with|powered by)\b|^last updated\b", re.IGNORECASE)
_CHROME_HREFS = ("chatwoot.com", "chatwoot.help")

# Path markers separating leaf article pages from category/section listings
# across Chatwoot / Zendesk / Intercom-style help centers. Only /articles/
# pages hold real content; the listings are followed for their article links.
_ARTICLE_MARKER = "/articles/"
_CATEGORY_MARKERS = ("/categories/", "/sections/", "/collections/")
_HEADING_TAGS = ("h1", "h2", "h3", "h4")
_LEADING_SYMBOLS_RE = re.compile(r"^[^\w]+", re.UNICODE)

# Homepage section headings that are curated cross-cuts, not real categories —
# their articles' true category comes from the category listing pages instead.
_GENERIC_SECTIONS = frozenset({
    "featured articles", "featured", "popular", "popular articles", "all articles",
    "browse", "recent articles", "recently updated", "top articles",
})

# Breadcrumb "back" links whose leading container should be dropped from bodies.
_BREADCRUMB_ROOTS = frozenset({"home", "all collections", "all categories", "help center", "help centre"})

# Internal scheme marking images collected during conversion, replaced with the
# re-hosted URL afterwards (conversion is sync; storage is async). The trailing
# ".img" delimits the index so "…//1.img" is never a prefix of "…//10.img".
_IMG_PLACEHOLDER = "cm-pending-image://{index}.img"


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


def _clean_category(text: str) -> str:
    """Strip a leading emoji/symbol (Chatwoot section headings are '📞 Help
    and support') and cap length."""
    cleaned = _LEADING_SYMBOLS_RE.sub("", (text or "").strip()).strip()
    return cleaned[:100] or DEFAULT_ARTICLE_CATEGORY


def _same_site_href(anchor: Tag, base_url: str, root_domain: str) -> Optional[str]:
    """Absolute same-site content URL for an anchor, or None if it's off-site,
    a fragment/query, a bare root, or a binary asset."""
    href = anchor.get("href")
    if not href:
        return None
    url = urldefrag(urljoin(base_url, href))[0].rstrip("/")
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or parsed.query:
        return None
    if parsed.path in ("", "/"):
        return None
    if _registrable_domain(parsed.hostname or "") != root_domain:
        return None
    if parsed.path.lower().endswith(_SKIP_EXTENSIONS):
        return None
    return url


def _is_article_url(url: str) -> bool:
    return _ARTICLE_MARKER in urlparse(url).path.lower()


def _is_category_url(url: str) -> bool:
    path = urlparse(url).path.lower()
    return any(marker in path for marker in _CATEGORY_MARKERS)


def _sectioned_article_links(node: Tag, base_url: str, root_domain: str) -> List[Tuple[str, Optional[str]]]:
    """Article links in document order, each tagged with the nearest preceding
    section heading (a help-center homepage's category cards). Headings nested
    inside a link are article titles, not sections, so they don't reset it."""
    results: List[Tuple[str, Optional[str]]] = []
    current: Optional[str] = None
    for el in node.find_all([*_HEADING_TAGS, "a"]):
        if el.name in _HEADING_TAGS:
            if not el.find_parent("a"):
                cat = _clean_category(el.get_text(" ", strip=True))
                # Curated cross-cut sections ("Featured Articles") aren't real
                # categories — leave those articles for the category pages.
                current = None if cat.lower() in _GENERIC_SECTIONS else cat
            continue
        url = _same_site_href(el, base_url, root_domain)
        if url and _is_article_url(url):
            results.append((url, current))
    return results


def discover_article_links(
    client: httpx.Client, index_url: str, limit: int
) -> List[Tuple[str, Optional[str]]]:
    """Discover (article_url, category) pairs from a help-center index.

    Standard help centers (Chatwoot/Zendesk/Intercom) nest articles under
    /articles/ and group them into /categories/ (or /sections//collections/).
    We tag each article with its homepage section heading, then follow the
    category listing pages for the full per-category list (homepages truncate
    each section to a few articles). A non-standard/flat page with no /articles/
    links falls back to importing every same-site content link.
    """
    soup, final_url = _fetch_index_soup(client, index_url)
    if soup is None:
        raise ValueError("Could not read that page.")
    root_domain = _registrable_domain(urlparse(final_url).hostname or "")
    index_clean = urldefrag(final_url)[0].rstrip("/")
    main = select_main_node(soup) or soup

    ordered: List[str] = []
    category_of: Dict[str, Optional[str]] = {}

    def record(url: str, category: Optional[str]) -> None:
        if url == index_clean:
            return
        if url not in category_of:
            category_of[url] = category
            ordered.append(url)
        elif category and not category_of[url]:
            # Upgrade a still-uncategorised article (e.g. seen first under a
            # generic homepage section) with the category page's real name.
            category_of[url] = category

    # 1. Homepage article links, tagged by their section heading.
    for url, category in _sectioned_article_links(main, final_url, root_domain):
        record(url, category)

    # 2. Follow category/section pages for the complete per-category list.
    category_links: List[str] = []
    seen_cat = set()
    for anchor in main.find_all("a", href=True):
        url = _same_site_href(anchor, final_url, root_domain)
        if url and _is_category_url(url) and url not in seen_cat:
            seen_cat.add(url)
            category_links.append(url)
    for cat_url in category_links[: settings.FAQ_ARTICLE_IMPORT_MAX_CATEGORIES]:
        if len(ordered) >= limit:
            break
        cat_soup, cat_final = _fetch_soup(client, cat_url)
        if cat_soup is None:
            continue
        og_title, doc_title = _head_titles(cat_soup)
        cat_node = select_main_node(cat_soup) or cat_soup
        cat_name = _clean_category(_page_title(og_title, doc_title, cat_node, cat_soup))
        for anchor in cat_node.find_all("a", href=True):
            url = _same_site_href(anchor, cat_final, root_domain)
            if url and _is_article_url(url):
                record(url, cat_name)

    # 3. Fallback: no standard article URLs — import every same-site link,
    #    resolving each article's category from its own breadcrumb/URL.
    if not ordered:
        for anchor in main.find_all("a", href=True):
            url = _same_site_href(anchor, final_url, root_domain)
            if url:
                record(url, None)

    ordered = ordered[:limit]
    if not ordered:
        raise ValueError("No linked article pages found on that page.")
    return [(url, category_of[url]) for url in ordered]


def _head_titles(soup: BeautifulSoup) -> Tuple[str, str]:
    """(og:title, <title>) — must run BEFORE select_main_node, which strips
    <head> from the soup."""
    og = soup.find("meta", property="og:title")
    og_title = og["content"].strip() if og and og.get("content", "").strip() else ""
    doc_title = ""
    if soup.title and soup.title.get_text(strip=True):
        # Drop the " | Site Name" tail commonly appended to <title>.
        doc_title = soup.title.get_text(strip=True).split("|")[0].strip()
    return og_title, doc_title


def _page_title(og_title: str, doc_title: str, node: Tag, soup: BeautifulSoup) -> str:
    if og_title:
        return og_title
    h1 = node.find("h1") or soup.find("h1")
    if h1 and h1.get_text(strip=True):
        return h1.get_text(" ", strip=True)
    return doc_title


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


def _strip_chrome(node: Tag) -> None:
    """Remove in-article chrome that shouldn't become FAQ content: nav bars,
    TOCs, footers, help-center platform branding ('Made with Chatwoot') and
    'Last updated' metadata lines. Best-effort — a detached element mid-loop
    just skips."""
    for chrome in node.find_all("nav") + node.find_all("footer"):
        chrome.decompose()
    for chrome in node.find_all(class_=_TOC_RE) + node.find_all(id=_TOC_RE):
        try:
            chrome.decompose()
        except Exception:
            pass
    # Leading breadcrumb ("Home › …") — a short container whose first link is a
    # back-to-index link. Chatwoot renders it as a bare div (no nav/class hook).
    for anchor in node.find_all("a"):
        if anchor.get_text(strip=True).lower() in _BREADCRUMB_ROOTS:
            container = anchor.find_parent(["nav", "ol", "ul", "div"])
            if container and len(container.get_text(" ", strip=True)) <= 80:
                try:
                    container.decompose()
                except Exception:
                    pass
            break
    for anchor in list(node.find_all("a", href=True)):
        try:
            href = (anchor.get("href") or "").lower()
            if any(brand in href for brand in _CHROME_HREFS):
                (anchor.find_parent(["div", "footer", "section"]) or anchor).decompose()
        except Exception:
            pass
    for el in list(node.find_all(["p", "div", "span", "small", "time"])):
        try:
            text = el.get_text(" ", strip=True)
            if text and len(text) <= 60 and _CHROME_TEXT_RE.search(text):
                el.decompose()
        except Exception:
            pass


def fetch_article(
    client: httpx.Client, url: str, category_override: Optional[str] = None
) -> Optional[Article]:
    """One article page → title + Markdown body (+ images pending re-host).
    category_override (from the category listing that linked here) wins over the
    per-page breadcrumb/URL guess. None when the page can't be read or is empty."""
    soup, final_url = _fetch_soup(client, url)
    if soup is None:
        return None
    og_title, doc_title = _head_titles(soup)  # before <head> is stripped below
    node = select_main_node(soup)
    if node is None:
        return None
    title = _page_title(og_title, doc_title, node, soup)
    if not title:
        return None
    category = category_override or _category_hint(soup, final_url)
    # The page's own h1 would duplicate the FAQ question.
    first_h1 = node.find("h1")
    if first_h1:
        first_h1.extract()
    _strip_chrome(node)
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
        for index, (link, category) in enumerate(links):
            article = await asyncio.to_thread(fetch_article, client, link, category)
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

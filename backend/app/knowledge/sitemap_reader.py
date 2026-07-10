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

from typing import Callable, Dict, Optional

from app.core.logger import get_logger
from app.knowledge.enhanced_website_reader import EnhancedWebsiteReader
from app.knowledge.sitemap_parser import fetch_sitemap_urls

logger = get_logger(__name__)


class SitemapReader(EnhancedWebsiteReader):
    """Crawl exactly the pages listed in a ``sitemap.xml`` — no ``<a href>`` following.

    Reuses EnhancedWebsiteReader's whole per-page pipeline (httpx fetch, Crawl4AI
    fallback, bot-challenge detection, content extraction, Document creation, and
    the ``name = <sitemap url>`` / ``id = <page url>`` grouping); only the URL
    source differs — pages come from the sitemap rather than BFS link discovery.

    Construct with ``max_depth=1`` so ``_process_url`` never yields child links,
    and ``max_links`` = the plan's ``max_sub_pages`` so the discovered page list
    is capped at ingest.
    """

    def crawl(
        self,
        url: str,
        starting_depth: int = 1,
        on_document_callback: Optional[Callable[[str, str], None]] = None,
        on_url_crawled_callback: Optional[Callable[[str], None]] = None,
    ) -> Dict[str, str]:
        url = self._normalize_url(url)

        # Reset per-crawl state exactly as the base crawl does — the counters are
        # read by the progress logs and by _raise_if_bot_blocked (a fully
        # bot-blocked sitemap must still fail with the "add manually" message).
        self._visited = set()
        self._urls_to_crawl = []
        self._crawled_pages_count = 0
        self._successful_crawls = 0
        self._failed_crawls = 0
        self._challenge_blocked = 0

        primary_domain = self._get_primary_domain(url)
        page_urls = fetch_sitemap_urls(
            url,
            headers=self.headers,
            timeout=self.timeout,
            verify_ssl=self.verify_ssl,
            max_urls=self.max_links,
        )
        # Exposed so the dispatcher can fail a sitemap that lists no pages
        # (wrong URL / not a sitemap) instead of silently creating an empty source.
        self._sitemap_page_count = len(page_urls)
        logger.info(f"Sitemap {url}: crawling {len(page_urls)} listed page(s)")
        if not page_urls:
            return {}

        seeds = [(page_url, starting_depth) for page_url in page_urls]
        return self._run_crawl_queue(
            seeds, primary_domain, on_document_callback, on_url_crawled_callback
        )

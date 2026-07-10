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

"""Fetch and parse ``sitemap.xml`` files into a flat list of page URLs.

Supports plain ``<urlset>`` sitemaps and ``<sitemapindex>`` files that point to
child sitemaps (recursed breadth-first, bounded), gzip-compressed sitemaps, and
namespaced tags. Parsing uses ``defusedxml`` to avoid XML-bomb / XXE attacks.

Because the sitemap URL (and every child ``<loc>``) is user-supplied, fetches are
hardened against abuse: downloads and decompression are size-capped (gzip-bomb
protection), literal private/loopback/link-local IP hosts are blocked (SSRF), and
recursed child sitemaps are restricted to the root's registrable domain so an
index can't fan out to arbitrary hosts.
"""

import gzip
import io
from typing import Dict, List, Optional, Tuple
from urllib.parse import urljoin, urlparse

import httpx

from defusedxml import ElementTree as DefusedET

from app.core.logger import get_logger
from app.knowledge.url_safety import BlockedHostError, MAX_REDIRECTS, guard_url

logger = get_logger(__name__)

# Sitemaps.org limits are 50 MB uncompressed / 50k URLs per file; cap a little
# above that and bound decompression so a gzip bomb can't exhaust memory.
MAX_DOWNLOAD_BYTES = 50 * 1024 * 1024
MAX_DECOMPRESSED_BYTES = 60 * 1024 * 1024


def _local_name(tag: str) -> str:
    """Strip an XML namespace from a tag: ``{ns}loc`` -> ``loc`` (lowercased)."""
    return tag.rsplit("}", 1)[-1].lower()


def _registrable_domain(host: str) -> str:
    """Best-effort registrable domain (last two labels) for same-site checks."""
    host = (host or "").lower().rstrip(".")
    if host.startswith("www."):
        host = host[4:]
    parts = host.split(".")
    return ".".join(parts[-2:]) if len(parts) >= 2 else host


def _bounded_gunzip(data: bytes) -> Optional[bytes]:
    """Decompress gzip bytes, bounded to MAX_DECOMPRESSED_BYTES. None if not gzip
    or the decompressed size would exceed the cap (gzip-bomb protection)."""
    try:
        with gzip.GzipFile(fileobj=io.BytesIO(data)) as gz:
            out = gz.read(MAX_DECOMPRESSED_BYTES + 1)
    except OSError:
        return None
    if len(out) > MAX_DECOMPRESSED_BYTES:
        logger.warning("Sitemap decompressed size exceeds cap; rejecting")
        return None
    return out


def _maybe_gunzip(url: str, content: bytes) -> bytes:
    """Decompress a ``.gz`` sitemap; leave anything else untouched."""
    if url.lower().endswith(".gz"):
        out = _bounded_gunzip(content)
        if out is not None:
            return out
    return content


def _fetch(client: httpx.Client, url: str) -> Optional[bytes]:
    """GET a sitemap URL (size-capped, SSRF-guarded); (gunzipped) bytes or None.

    Redirects are followed manually so each hop's host is re-validated against
    internal addresses before it is fetched.
    """
    current = url
    for _ in range(MAX_REDIRECTS + 1):
        try:
            guard_url(current)
        except BlockedHostError as e:
            logger.warning(str(e))
            return None
        try:
            with client.stream("GET", current, follow_redirects=False) as resp:
                if resp.is_redirect:
                    location = resp.headers.get("location")
                    if not location:
                        return None
                    current = urljoin(str(resp.url), location)
                    continue
                resp.raise_for_status()
                chunks: List[bytes] = []
                total = 0
                for chunk in resp.iter_bytes():
                    total += len(chunk)
                    if total > MAX_DOWNLOAD_BYTES:
                        logger.warning(f"Sitemap '{current}' exceeds size cap; rejecting")
                        return None
                    chunks.append(chunk)
            return _maybe_gunzip(current, b"".join(chunks))
        except Exception as e:
            logger.warning(f"Failed to fetch sitemap '{current}': {e}")
            return None
    logger.warning(f"Too many redirects while fetching sitemap {url}")
    return None


def _parse(content: bytes) -> Tuple[List[str], List[str]]:
    """Parse sitemap XML into (page_urls, child_sitemap_urls).

    A ``<url>`` entry is a page; a ``<sitemap>`` entry points to a child sitemap.
    Falls back to a bounded gunzip once if the bytes aren't valid XML (some
    servers return gzip without a ``.gz`` extension).
    """
    try:
        root = DefusedET.fromstring(content)
    except Exception:
        unzipped = _bounded_gunzip(content)
        if unzipped is None:
            return [], []
        try:
            root = DefusedET.fromstring(unzipped)
        except Exception as e:
            logger.warning(f"Failed to parse sitemap XML: {e}")
            return [], []

    pages: List[str] = []
    children: List[str] = []
    for entry in root:
        kind = _local_name(entry.tag)
        if kind not in ("url", "sitemap"):
            continue
        loc: Optional[str] = None
        for child in entry:
            if _local_name(child.tag) == "loc" and child.text and child.text.strip():
                loc = child.text.strip()
                break
        if not loc:
            continue
        (children if kind == "sitemap" else pages).append(loc)
    return pages, children


def fetch_sitemap_urls(
    url: str,
    *,
    headers: Optional[Dict[str, str]] = None,
    timeout: float = 30,
    verify_ssl: bool = True,
    max_urls: int = 50,
    max_sitemaps: int = 50,
) -> List[str]:
    """Return the deduped page URLs listed in a sitemap (or sitemap index).

    Recurses child sitemaps breadth-first, bounded by ``max_sitemaps`` fetches
    and ``max_urls`` total pages (the plan's per-source sub-page limit). Child
    sitemaps outside the root's registrable domain, and errors on individual
    (child) sitemaps, are skipped.
    """
    headers = headers or {}
    root_domain = _registrable_domain(urlparse(url).hostname or "")
    to_visit: List[str] = [url]
    visited_sitemaps: set = set()
    seen_pages: set = set()
    pages: List[str] = []

    with httpx.Client(
        timeout=timeout, follow_redirects=True, headers=headers, verify=verify_ssl
    ) as client:
        while to_visit and len(pages) < max_urls and len(visited_sitemaps) < max_sitemaps:
            sitemap_url = to_visit.pop(0)
            if sitemap_url in visited_sitemaps:
                continue
            visited_sitemaps.add(sitemap_url)

            content = _fetch(client, sitemap_url)
            if not content:
                continue

            found_pages, child_sitemaps = _parse(content)
            for page in found_pages:
                if page not in seen_pages:
                    seen_pages.add(page)
                    pages.append(page)
                    if len(pages) >= max_urls:
                        break
            for child in child_sitemaps:
                if child in visited_sitemaps or child in to_visit:
                    continue
                if _registrable_domain(urlparse(child).hostname or "") != root_domain:
                    logger.warning(f"Skipping cross-domain child sitemap: {child}")
                    continue
                to_visit.append(child)

    logger.info(
        f"Sitemap '{url}': discovered {len(pages)} page(s) from "
        f"{len(visited_sitemaps)} sitemap file(s)"
    )
    return pages[:max_urls]

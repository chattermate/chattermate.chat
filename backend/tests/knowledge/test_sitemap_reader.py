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

from unittest.mock import patch

from app.knowledge.sitemap_reader import SitemapReader

SITEMAP = "https://site.com/sitemap.xml"


def test_crawl_uses_sitemap_pages_and_caps_at_max_links():
    reader = SitemapReader(max_depth=1, max_links=2, min_content_length=10)
    pages = ["https://site.com/a", "https://site.com/b", "https://site.com/c"]
    collected = []

    with patch(
        "app.knowledge.sitemap_reader.fetch_sitemap_urls", return_value=pages
    ) as mock_parse, patch.object(
        reader, "_process_url", side_effect=lambda info, domain: (info[0], f"content {info[0]}", [])
    ):
        result = reader.crawl(SITEMAP, on_document_callback=lambda u, c: collected.append(u))

    # The parser is asked for at most max_links pages.
    assert mock_parse.call_args.kwargs["max_urls"] == 2
    # _run_crawl_queue caps stored pages at max_links even if more were seeded.
    assert len(result) == 2
    assert len(collected) == 2
    assert all(url in pages for url in result)


def test_crawl_empty_sitemap_returns_empty():
    reader = SitemapReader(max_depth=1, max_links=5)
    with patch("app.knowledge.sitemap_reader.fetch_sitemap_urls", return_value=[]):
        result = reader.crawl(SITEMAP)
    assert result == {}


def test_document_groups_under_sitemap_name_with_page_id():
    # Every discovered page is one sub-page of the single sitemap source:
    # document.name = sitemap url (the group), document.id = page url.
    reader = SitemapReader(max_depth=1, max_links=5)
    doc = reader._create_document_from_content(
        "https://site.com/pricing", "Plans and pricing content", SITEMAP, 1
    )
    assert doc.id == "https://site.com/pricing"
    assert doc.name == SITEMAP


def test_sitemap_page_count_signals_empty_vs_found():
    reader = SitemapReader(max_depth=1, max_links=5)
    with patch("app.knowledge.sitemap_reader.fetch_sitemap_urls", return_value=[]):
        reader.crawl(SITEMAP)
    assert reader._sitemap_page_count == 0  # dispatcher fails the source on this

    with patch(
        "app.knowledge.sitemap_reader.fetch_sitemap_urls",
        return_value=["https://site.com/a", "https://site.com/b"],
    ), patch.object(reader, "_process_url", side_effect=lambda info, domain: (info[0], "c", [])):
        reader.crawl(SITEMAP)
    assert reader._sitemap_page_count == 2


def test_crawl_resets_challenge_counter():
    reader = SitemapReader(max_depth=1, max_links=5)
    reader._challenge_blocked = 7  # stale from a previous run
    with patch("app.knowledge.sitemap_reader.fetch_sitemap_urls", return_value=[]):
        reader.crawl(SITEMAP)
    assert reader._challenge_blocked == 0

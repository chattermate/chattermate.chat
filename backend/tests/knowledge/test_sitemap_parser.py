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

import gzip
from unittest.mock import patch

from app.knowledge import sitemap_parser

NS = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'

URLSET = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset {NS}>
  <url><loc>https://site.com/a</loc></url>
  <url><loc>https://site.com/b</loc></url>
  <url><loc>https://site.com/a</loc></url>
</urlset>""".encode()

INDEX = f"""<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex {NS}>
  <sitemap><loc>https://site.com/sitemap-1.xml</loc></sitemap>
  <sitemap><loc>https://site.com/sitemap-2.xml</loc></sitemap>
</sitemapindex>""".encode()

CHILD1 = f"""<urlset {NS}><url><loc>https://site.com/1</loc></url></urlset>""".encode()
CHILD2 = f"""<urlset {NS}><url><loc>https://site.com/2</loc></url></urlset>""".encode()


def _fake_fetch(mapping):
    """Return a _fetch replacement that serves bytes from a url->bytes mapping."""
    def _fetch(client, url):
        return mapping.get(url)
    return _fetch


def test_parse_urlset_dedupes_and_preserves_order():
    with patch.object(sitemap_parser, "_fetch", _fake_fetch({"https://site.com/sitemap.xml": URLSET})):
        urls = sitemap_parser.fetch_sitemap_urls("https://site.com/sitemap.xml", max_urls=50)
    assert urls == ["https://site.com/a", "https://site.com/b"]


def test_sitemap_index_recurses_into_children():
    mapping = {
        "https://site.com/sitemap.xml": INDEX,
        "https://site.com/sitemap-1.xml": CHILD1,
        "https://site.com/sitemap-2.xml": CHILD2,
    }
    with patch.object(sitemap_parser, "_fetch", _fake_fetch(mapping)):
        urls = sitemap_parser.fetch_sitemap_urls("https://site.com/sitemap.xml", max_urls=50)
    assert urls == ["https://site.com/1", "https://site.com/2"]


def test_max_urls_caps_the_result():
    with patch.object(sitemap_parser, "_fetch", _fake_fetch({"https://site.com/sitemap.xml": URLSET})):
        urls = sitemap_parser.fetch_sitemap_urls("https://site.com/sitemap.xml", max_urls=1)
    assert urls == ["https://site.com/a"]


def test_gzip_content_without_extension_is_parsed():
    gzipped = gzip.compress(URLSET)
    with patch.object(sitemap_parser, "_fetch", _fake_fetch({"https://site.com/sitemap.xml": gzipped})):
        urls = sitemap_parser.fetch_sitemap_urls("https://site.com/sitemap.xml", max_urls=50)
    assert urls == ["https://site.com/a", "https://site.com/b"]


def test_child_fetch_failure_is_skipped():
    mapping = {
        "https://site.com/sitemap.xml": INDEX,
        "https://site.com/sitemap-1.xml": CHILD1,
        # sitemap-2.xml returns None (fetch failure)
    }
    with patch.object(sitemap_parser, "_fetch", _fake_fetch(mapping)):
        urls = sitemap_parser.fetch_sitemap_urls("https://site.com/sitemap.xml", max_urls=50)
    assert urls == ["https://site.com/1"]


def test_invalid_xml_returns_empty():
    with patch.object(sitemap_parser, "_fetch", _fake_fetch({"https://site.com/sitemap.xml": b"not xml <<<"})):
        urls = sitemap_parser.fetch_sitemap_urls("https://site.com/sitemap.xml", max_urls=50)
    assert urls == []


def test_is_blocked_host_rejects_private_and_loopback():
    f = sitemap_parser._is_blocked_host
    assert f("http://169.254.169.254/latest/meta-data/")  # cloud metadata
    assert f("http://127.0.0.1/sitemap.xml")
    assert f("http://10.0.0.5/sitemap.xml")
    assert f("http://localhost/sitemap.xml")
    assert not f("https://site.com/sitemap.xml")
    assert not f("https://8.8.8.8/sitemap.xml")  # public IP allowed


def test_cross_domain_child_sitemap_is_skipped():
    evil_index = f"""<sitemapindex {NS}>
      <sitemap><loc>https://site.com/ok.xml</loc></sitemap>
      <sitemap><loc>https://evil.com/steal.xml</loc></sitemap>
    </sitemapindex>""".encode()
    mapping = {
        "https://site.com/sitemap.xml": evil_index,
        "https://site.com/ok.xml": CHILD1,
        "https://evil.com/steal.xml": CHILD2,  # must NOT be fetched
    }
    with patch.object(sitemap_parser, "_fetch", _fake_fetch(mapping)):
        urls = sitemap_parser.fetch_sitemap_urls("https://site.com/sitemap.xml", max_urls=50)
    assert urls == ["https://site.com/1"]  # evil.com child skipped


def test_bounded_gunzip_rejects_oversize(monkeypatch):
    monkeypatch.setattr(sitemap_parser, "MAX_DECOMPRESSED_BYTES", 100)
    bomb = gzip.compress(b"A" * 5000)  # decompresses to 5000 > 100
    assert sitemap_parser._bounded_gunzip(bomb) is None
    small = gzip.compress(b"A" * 50)
    assert sitemap_parser._bounded_gunzip(small) == b"A" * 50


def test_max_sitemaps_bounds_index_fanout():
    # A sitemap index pointing at many children; only max_sitemaps files are fetched
    # (1 index + 1 child when max_sitemaps=2).
    big_index = (
        f'<sitemapindex {NS}>'
        + "".join(f"<sitemap><loc>https://site.com/s{i}.xml</loc></sitemap>" for i in range(10))
        + "</sitemapindex>"
    ).encode()
    mapping = {"https://site.com/sitemap.xml": big_index}
    for i in range(10):
        mapping[f"https://site.com/s{i}.xml"] = (
            f"<urlset {NS}><url><loc>https://site.com/p{i}</loc></url></urlset>".encode()
        )
    with patch.object(sitemap_parser, "_fetch", _fake_fetch(mapping)):
        urls = sitemap_parser.fetch_sitemap_urls(
            "https://site.com/sitemap.xml", max_urls=50, max_sitemaps=2
        )
    # index + first child only
    assert urls == ["https://site.com/p0"]

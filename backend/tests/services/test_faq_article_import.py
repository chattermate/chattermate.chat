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

Article-mode import tests: link discovery bounds, HTML→Markdown conversion
(link absolutization, image placeholder/re-host, data: skip), and the
end-to-end job with mocked fetches.
"""
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
from urllib.parse import urlparse

import pytest

from app.models.faq import FAQ, FAQStatus
from app.models.faq_generation_job import FAQGenerationJob, FAQJobType
from app.repositories.faq import FAQRepository
from app.services import faq_article_import
from app.services.faq_article_import import (
    _ArticleConverter,
    discover_article_links,
    fetch_article,
    run_article_import_job,
)


def _response(text="", url="https://help.example.com/", content=b"", content_type="text/html"):
    response = MagicMock()
    response.text = text
    response.url = url
    response.content = content
    response.headers = {"content-type": content_type}
    response.raise_for_status = MagicMock()
    return response


# Chatwoot-style homepage: category cards, each a section heading + article
# links, plus a curated "Featured Articles" cross-cut and a category page link.
INDEX_HTML = """
<html><body><main>
  <p>{filler}</p>
  <section>
    <h2>Featured Articles</h2>
    <a href="/hc/atoa/articles/1-how-to-install">Install (featured)</a>
  </section>
  <section>
    <h2>📞 Help and support</h2>
    <a href="/hc/atoa/articles/1-how-to-install">Install</a>
    <a href="/hc/atoa/articles/2-refunds">Refunds</a>
    <a href="/hc/atoa/categories/9-help-and-support">View all</a>
  </section>
  <a href="https://other-site.com/hc/x/articles/9-foreign">Foreign</a>
  <a href="/downloads/guide.pdf">PDF</a>
  <a href="/pricing">Pricing (not an article)</a>
</main></body></html>
""".format(filler="x" * 600)

ARTICLE_HTML = """
<html><head><title>How to install | Example Help</title></head><body>
<main>
<nav><a href="/">Atoa Help Centre</a></nav>
<div class="crumbs"><a href="/hc/atoa/en">Home</a></div>
<article>
  <h1>How to install</h1>
  <p>{filler}</p>
  <ol><li>Download the app.</li><li>Run the installer.</li></ol>
  <p>See <a href="/pricing">pricing</a> for plans.</p>
  <img src="/img/shot.png" alt="screenshot">
  <img src="data:image/png;base64,AAAA" alt="inline">
</article>
<span>Last updated on Sep 20, 2024</span>
<footer><p>Made with <a href="https://www.chatwoot.com">Chatwoot</a></p></footer>
</main>
</body></html>
""".format(filler="Installation takes about two minutes. " * 10)


def test_discover_links_sections_categories_and_filters():
    client = MagicMock()
    from bs4 import BeautifulSoup
    # A category page reachable via the "View all" link returns the full list.
    category_page = BeautifulSoup(
        "<body><main><h1>Help and support</h1>"
        '<a href="/hc/atoa/articles/2-refunds">Refunds</a>'
        '<a href="/hc/atoa/articles/3-disputes">Disputes</a>'
        "</main></body>",
        "html.parser",
    )
    with patch.object(faq_article_import, "_fetch_index_soup") as index_fetch, \
         patch.object(faq_article_import, "_fetch_soup") as page_fetch:
        index_fetch.return_value = (BeautifulSoup(INDEX_HTML, "html.parser"), "https://help.example.com/hc/atoa/en")
        page_fetch.return_value = (category_page, "https://help.example.com/hc/atoa/categories/9-help-and-support")
        links = discover_article_links(client, "https://help.example.com/hc/atoa/en", limit=20)

    by_url = dict(links)
    # Only /articles/ pages; off-site, pdf and /pricing excluded. Check the
    # parsed host/path (not a URL substring) so an off-site article can't slip
    # through and the check isn't a substring-sanitization smell.
    hosts = {urlparse(u).hostname for u, _ in links}
    assert hosts == {"help.example.com"}
    assert not any(urlparse(u).path.endswith(".pdf") or urlparse(u).path == "/pricing" for u, _ in links)
    # Featured cross-cut isn't a category; the section heading tags the article.
    assert by_url["https://help.example.com/hc/atoa/articles/1-how-to-install"] == "Help and support"
    assert by_url["https://help.example.com/hc/atoa/articles/2-refunds"] == "Help and support"
    # Article only on the followed category page still imported + categorised.
    assert by_url["https://help.example.com/hc/atoa/articles/3-disputes"] == "Help and support"


def test_discover_links_respects_limit():
    client = MagicMock()
    many = "".join(f'<a href="/articles/a{i}">A{i}</a>' for i in range(50))
    with patch.object(faq_article_import, "_fetch_index_soup") as fetch:
        from bs4 import BeautifulSoup
        fetch.return_value = (
            BeautifulSoup(f"<body><main><p>{'x' * 600}</p>{many}</main></body>", "html.parser"),
            "https://help.example.com/articles",
        )
        links = discover_article_links(client, "https://help.example.com/articles", limit=5)
    assert len(links) == 5


def test_discover_links_flat_fallback_without_article_marker():
    """A non-standard help page with no /articles/ links imports every link."""
    client = MagicMock()
    html = f"<body><main><p>{'x' * 600}</p><a href='/faq/pay'>Pay</a><a href='/faq/refund'>Refund</a></main></body>"
    with patch.object(faq_article_import, "_fetch_index_soup") as fetch:
        from bs4 import BeautifulSoup
        fetch.return_value = (BeautifulSoup(html, "html.parser"), "https://help.example.com/faq")
        links = discover_article_links(client, "https://help.example.com/faq", limit=10)
    assert {u for u, _ in links} == {"https://help.example.com/faq/pay", "https://help.example.com/faq/refund"}
    assert all(c is None for _, c in links)  # category resolved per-article later


def test_fetch_article_converts_markdown_strips_chrome_and_collects_images():
    client = MagicMock()
    image = _response(content=b"\x89PNG", content_type="image/png")
    with patch.object(faq_article_import, "_fetch_soup") as fetch, \
         patch.object(faq_article_import, "safe_get", return_value=image):
        from bs4 import BeautifulSoup
        fetch.return_value = (
            BeautifulSoup(ARTICLE_HTML, "html.parser"),
            "https://help.example.com/hc/atoa/articles/1-how-to-install",
        )
        article = fetch_article(client, "https://help.example.com/hc/atoa/articles/1", "Help and support")

    assert article is not None
    assert article.title == "How to install"
    assert article.category_hint == "Help and support"  # from the category override
    # h1 removed (would duplicate the question), list preserved as Markdown.
    assert "# How to install" not in article.markdown
    assert "1. Download the app." in article.markdown
    # Link absolutized.
    assert "[pricing](https://help.example.com/pricing)" in article.markdown
    # Real image collected as placeholder; data: image reduced to alt text.
    assert "cm-pending-image://0.img" in article.markdown
    assert len(article.pending_images) == 1
    assert "base64" not in article.markdown
    # Help-center chrome stripped: no Chatwoot footer, breadcrumb or metadata.
    lowered = article.markdown.lower()
    assert "chatwoot" not in lowered
    assert "made with" not in lowered
    assert "last updated" not in lowered
    assert "[home]" not in lowered
    assert "atoa help centre" not in lowered


def test_converter_skips_oversized_and_wrong_type_images():
    client = MagicMock()
    too_big = _response(content=b"x" * (faq_article_import.MAX_FAQ_IMAGE_BYTES + 1), content_type="image/png")
    wrong_type = _response(content=b"x", content_type="image/svg+xml")
    for response in (too_big, wrong_type):
        with patch.object(faq_article_import, "safe_get", return_value=response):
            converter = _ArticleConverter(base_url="https://a.example.com/", client=client)
            markdown = converter.convert('<img src="/i.png" alt="pic">')
        assert converter.images == {}
        assert "pic" in markdown and "![" not in markdown


@pytest.mark.asyncio
async def test_article_import_job_inserts_drafts(db, test_organization):
    job = FAQGenerationJob(
        organization_id=test_organization.id,
        job_type=FAQJobType.IMPORT_ARTICLES.value,
        source_url="https://help.example.com/articles",
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Duplicate-title article must dedup against existing FAQs.
    FAQRepository(db).create(FAQ(
        organization_id=test_organization.id, question="How to install",
        answer="old", category="Guides",
    ))

    articles = {
        "https://help.example.com/articles/one": faq_article_import.Article(
            url="https://help.example.com/articles/one",
            title="How to install", markdown="dupe", category_hint="Guides",
        ),
        "https://help.example.com/articles/two": faq_article_import.Article(
            url="https://help.example.com/articles/two",
            title="How billing works", markdown="**Billing** steps.", category_hint="Billing",
        ),
    }
    # discover now yields (url, category) pairs; the category flows to fetch_article.
    discovered = [(url, "Billing") for url in articles]
    with patch.object(faq_article_import, "discover_article_links", return_value=discovered), \
         patch.object(faq_article_import, "fetch_article", side_effect=lambda c, url, category: articles[url]):
        created = await run_article_import_job(db, job)

    assert created == 1
    row = db.query(FAQ).filter(FAQ.question == "How billing works").one()
    assert row.status == FAQStatus.DRAFT.value
    assert row.answer == "**Billing** steps."
    assert row.source_label == "Imported from help.example.com"
    assert row.knowledge_id is None

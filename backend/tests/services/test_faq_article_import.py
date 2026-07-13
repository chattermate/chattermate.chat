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


INDEX_HTML = """
<html><body><main>
  <p>{filler}</p>
  <a href="/articles/how-to-install">Install</a>
  <a href="/articles/how-to-install#steps">Install anchor dupe</a>
  <a href="https://help.example.com/articles/billing/">Billing</a>
  <a href="https://other-site.com/articles/foreign">Foreign</a>
  <a href="/downloads/guide.pdf">PDF</a>
  <a href="/pricing">Pricing (outside /articles)</a>
</main></body></html>
""".format(filler="x" * 600)

ARTICLE_HTML = """
<html><head><title>How to install | Example Help</title></head><body>
<nav class="breadcrumb"><a href="/">Home</a><a href="/articles">Guides</a><a href="#">Install</a></nav>
<article>
  <h1>How to install</h1>
  <p>{filler}</p>
  <ol><li>Download the app.</li><li>Run the installer.</li></ol>
  <p>See <a href="/pricing">pricing</a> for plans.</p>
  <img src="/img/shot.png" alt="screenshot">
  <img src="data:image/png;base64,AAAA" alt="inline">
</article>
</body></html>
""".format(filler="Installation takes about two minutes. " * 10)


def test_discover_links_bounds_and_filters():
    client = MagicMock()
    with patch.object(faq_article_import, "_fetch_index_soup") as fetch:
        from bs4 import BeautifulSoup
        fetch.return_value = (BeautifulSoup(INDEX_HTML, "html.parser"), "https://help.example.com/articles")
        links = discover_article_links(client, "https://help.example.com/articles", limit=10)
    # Same-site only, fragment deduped, pdf skipped; /articles children first.
    assert links[0] == "https://help.example.com/articles/how-to-install"
    assert links[1] == "https://help.example.com/articles/billing"
    assert links[-1] == "https://help.example.com/pricing"
    assert not any("other-site.com" in link or link.endswith(".pdf") for link in links)


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


def test_fetch_article_converts_markdown_and_collects_images():
    client = MagicMock()
    image = _response(content=b"\x89PNG", content_type="image/png")
    with patch.object(faq_article_import, "_fetch_soup") as fetch, \
         patch.object(faq_article_import, "safe_get", return_value=image):
        from bs4 import BeautifulSoup
        fetch.return_value = (
            BeautifulSoup(ARTICLE_HTML, "html.parser"),
            "https://help.example.com/articles/how-to-install",
        )
        article = fetch_article(client, "https://help.example.com/articles/how-to-install")

    assert article is not None
    assert article.title == "How to install"
    assert article.category_hint == "Guides"  # breadcrumb second-to-last
    # h1 removed (would duplicate the question), list preserved as Markdown.
    assert "# How to install" not in article.markdown
    assert "1. Download the app." in article.markdown
    # Link absolutized.
    assert "[pricing](https://help.example.com/pricing)" in article.markdown
    # Real image collected as placeholder; data: image reduced to alt text.
    assert "cm-pending-image://0" in article.markdown
    assert len(article.pending_images) == 1
    assert "base64" not in article.markdown


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
    with patch.object(faq_article_import, "discover_article_links", return_value=list(articles)), \
         patch.object(faq_article_import, "fetch_article", side_effect=lambda c, url: articles[url]):
        created = await run_article_import_job(db, job)

    assert created == 1
    row = db.query(FAQ).filter(FAQ.question == "How billing works").one()
    assert row.status == FAQStatus.DRAFT.value
    assert row.answer == "**Billing** steps."
    assert row.source_label == "Imported from help.example.com"
    assert row.knowledge_id is None

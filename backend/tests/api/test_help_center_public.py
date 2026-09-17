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

Public help-center tests: host resolution, published-only rendering with
escaping and JSON-LD, plan/enabled gating (404s), Ask AI guards, host
dispatch routing.
"""

import json
import re
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.api.help_center_public import public_app
from app.core.config import settings
from app.core.help_center_host import HelpCenterHostMiddleware, is_help_center_host
from app.database import get_db
from app.models.faq import FAQ, FAQStatus
from app.models.help_center import HelpCenterSettings
from app.repositories.faq import FAQRepository
from app.services.help_center_public import contrast_ink, resolve_help_center, slug_for_host

HOST = "test-org.chattermate.help"


@pytest.fixture(autouse=True)
def _open_plan_gate():
    """Env-independent plan gating: local dev has the enterprise module (test
    org has no subscription → the public site 404s), CI/OSS doesn't. These
    tests target the public renderer, not the gate."""
    with patch("app.services.help_center_public.help_center_allowed", return_value=True):
        yield


@pytest.fixture
def client(db):
    def override_db():
        yield db

    public_app.dependency_overrides[get_db] = override_db
    yield TestClient(public_app)
    public_app.dependency_overrides.clear()


@pytest.fixture
def help_center(db, test_organization):
    row = HelpCenterSettings(
        organization_id=test_organization.id,
        slug="test-org",
        enabled=True,
        brand_color="#4338CA",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def _publish_faq(db, org_id, question="How do I sign up?", answer="Use your <b>email</b>.",
                 category="Getting started", slug=None, url_path=None):
    return FAQRepository(db).create(FAQ(
        organization_id=org_id, question=question, answer=answer,
        category=category, status=FAQStatus.PUBLISHED, slug=slug, url_path=url_path,
    ))


@pytest.fixture
def subdomain_mode(monkeypatch):
    """Advertise {slug}.{base} URLs (cloud config) for tests that assert them."""
    monkeypatch.setattr(settings, "HELP_CENTER_PUBLIC_MODE", "subdomain")


async def _not_found_app(scope, receive, send):
    """Main-app stand-in: anything not dispatched to public_app 404s as 'main app'."""
    await send({"type": "http.response.start", "status": 404,
                "headers": [(b"content-type", b"text/plain")]})
    await send({"type": "http.response.body", "body": b"main app"})


@pytest.fixture
def path_client(db, monkeypatch):
    """Client through the real dispatch middleware in PATH mode, so /help/{slug}
    requests exercise path dispatch (public_app is bypassed by the plain client)."""
    monkeypatch.setattr(settings, "HELP_CENTER_PUBLIC_MODE", "path")

    def override_db():
        yield db

    public_app.dependency_overrides[get_db] = override_db
    yield TestClient(HelpCenterHostMiddleware(_not_found_app, public_app))
    public_app.dependency_overrides.clear()


# ---------- helpers ----------

def test_slug_for_host():
    assert slug_for_host("acme.chattermate.help") == "acme"
    assert slug_for_host("a.b.chattermate.help") is None
    assert slug_for_host("chattermate.help") is None
    assert slug_for_host("help.acme.com") is None


def test_contrast_ink():
    assert contrast_ink("#FFFFFF") == "#12131A"
    assert contrast_ink("#0B0C10") == "#FFFFFF"
    assert contrast_ink("not-a-color") == "#FFFFFF"


# ---------- rendering ----------

def test_page_renders_published_only_and_escapes(client, db, test_organization, help_center, subdomain_mode):
    _publish_faq(db, test_organization.id)
    FAQRepository(db).create(FAQ(
        organization_id=test_organization.id, question="Secret draft?",
        answer="Hidden.", category="Getting started", status=FAQStatus.DRAFT,
    ))
    r = client.get("/", headers={"host": HOST})
    assert r.status_code == 200
    assert "How do I sign up?" in r.text
    assert "Secret draft?" not in r.text
    # The index shows a plain-text preview (Markdown stripped) that links to the
    # article page — the answer's raw HTML never reaches the page.
    assert "<b>email</b>" not in r.text
    assert "Use your email" in r.text
    # SEO artifacts.
    assert 'application/ld+json' in r.text and "FAQPage" in r.text
    assert f'<link rel="canonical" href="https://{HOST}/">' in r.text
    assert r.headers["cache-control"] == "public, max-age=60"


def test_article_page_renders_sanitized_markdown(client, db, test_organization, help_center):
    faq = _publish_faq(
        db, test_organization.id,
        answer="Click **Settings**.\n\n<script>alert(1)</script>",
    )
    faq.slug = "how-do-i-sign-up"
    db.commit()
    r = client.get(f"/a/{faq.slug}", headers={"host": HOST})
    assert r.status_code == 200
    # Markdown rendered, but the injected <script> is sanitized away (the body
    # is rendered | safe). The page has its own widget/enhancement scripts, so
    # the guard is on the injected payload, not the <script> tag in general.
    assert "<strong>Settings</strong>" in r.text
    assert "alert(1)" not in r.text


def _json_ld(response) -> dict:
    blocks = re.findall(
        r'<script type="application/ld\+json">(.*?)</script>', response.text, re.DOTALL
    )
    assert blocks, "page emitted no JSON-LD"
    return json.loads(blocks[0])


def _nodes_by_type(graph: dict) -> dict:
    """Graph nodes keyed by @type (multi-typed nodes land under each type)."""
    nodes: dict = {}
    for node in graph["@graph"]:
        types = node["@type"]
        for node_type in [types] if isinstance(types, str) else types:
            nodes[node_type] = node
    return nodes


def test_index_json_ld_graph_keeps_faqpage(client, db, test_organization, help_center, subdomain_mode):
    """The landing page stays a FAQPage (it really is a list of Q&A), wired into
    an @graph with the Organization and WebSite nodes."""
    _publish_faq(db, test_organization.id, answer="Click **Settings**.")
    r = client.get("/", headers={"host": HOST})
    assert r.status_code == 200

    nodes = _nodes_by_type(_json_ld(r))
    assert set(nodes) >= {"Organization", "WebSite", "CollectionPage", "FAQPage"}
    page = nodes["FAQPage"]
    # Same node carries both types, and it is wired to the WebSite by @id.
    assert page["@id"] == nodes["CollectionPage"]["@id"]
    assert page["isPartOf"]["@id"] == nodes["WebSite"]["@id"]
    assert nodes["WebSite"]["publisher"]["@id"] == nodes["Organization"]["@id"]
    question = page["mainEntity"][0]
    assert question["@type"] == "Question"
    assert question["name"] == "How do I sign up?"
    # Answer text is plain text, with the Markdown stripped.
    assert question["acceptedAnswer"]["text"] == "Click Settings ."
    assert "QAPage" not in r.text


def test_article_json_ld_is_techarticle_with_breadcrumbs(
    client, db, test_organization, help_center, subdomain_mode
):
    """A single help article is a TechArticle, not a FAQPage: Google retired FAQ
    rich results, while BreadcrumbList still renders in search."""
    faq = _publish_faq(db, test_organization.id, answer="Click **Settings**.")
    faq.slug = "how-do-i-sign-up"
    db.commit()
    r = client.get(f"/a/{faq.slug}", headers={"host": HOST})
    assert r.status_code == 200

    nodes = _nodes_by_type(_json_ld(r))
    assert set(nodes) >= {"Organization", "WebSite", "WebPage", "BreadcrumbList", "TechArticle"}
    assert "FAQPage" not in nodes and "QAPage" not in r.text

    article, page, crumbs = nodes["TechArticle"], nodes["WebPage"], nodes["BreadcrumbList"]
    assert article["headline"] == "How do I sign up?"
    assert article["articleSection"] == "Getting started"
    # Every node is wired by @id, not repeated inline.
    assert article["mainEntityOfPage"]["@id"] == page["@id"]
    assert article["publisher"]["@id"] == nodes["Organization"]["@id"]
    assert page["breadcrumb"]["@id"] == crumbs["@id"]
    # datePublished comes from the row; dateModified falls back to it when the
    # article has never been edited (so it can't predate publication).
    assert article["dateModified"] == article["datePublished"]

    items = crumbs["itemListElement"]
    assert [c["position"] for c in items] == [1, 2, 3]
    assert [c["name"] for c in items] == ["Home", "Getting started", "How do I sign up?"]
    assert items[-1]["item"] == f"https://{HOST}/a/how-do-i-sign-up"


def test_article_renders_visible_breadcrumb_matching_markup(
    client, db, test_organization, help_center
):
    """Google requires the BreadcrumbList to match what the page shows, so the
    trail must actually be rendered — the current page as text, not a link."""
    faq = _publish_faq(db, test_organization.id)
    faq.slug = "how-do-i-sign-up"
    db.commit()
    r = client.get(f"/a/{faq.slug}", headers={"host": HOST})

    assert '<nav class="hc-crumbs" aria-label="Breadcrumb">' in r.text
    assert '<a href="/">Home</a>' in r.text
    assert '<a href="/?topic=Getting%20started">Getting started</a>' in r.text
    assert 'aria-current="page"' in r.text


def test_meta_overrides_win_over_derived_values(client, db, test_organization, help_center):
    """meta_title/meta_description replace the derived title and excerpt; the
    canonical URL is unaffected."""
    faq = _publish_faq(db, test_organization.id, answer="Click **Settings**.")
    faq.slug = "how-do-i-sign-up"
    faq.meta_title = "Signing up, step by step"
    faq.meta_description = "A short custom description."
    db.commit()
    r = client.get(f"/a/{faq.slug}", headers={"host": HOST})

    assert "<title>Signing up, step by step</title>" in r.text
    assert '<meta name="description" content="A short custom description.">' in r.text
    assert '<meta property="og:title" content="Signing up, step by step">' in r.text
    # The visible <h1> still shows the real question — meta is search-only.
    assert "How do I sign up?" in r.text


def test_og_image_is_absolute(client, db, test_organization, help_center, subdomain_mode):
    """Scrapers don't resolve relative og:image URLs, so a stored relative logo
    path has to be anchored to the serving origin."""
    help_center.logo_url = "/api/v1/uploads/help_center/logo.png"
    db.commit()
    r = client.get("/", headers={"host": HOST})

    expected = f"https://{HOST}/api/v1/uploads/help_center/logo.png"
    assert f'<meta property="og:image" content="{expected}">' in r.text
    assert '<meta name="twitter:card" content="summary_large_image">' in r.text


def test_widget_embed_points_at_this_install(
    client, db, test_organization, help_center, test_widget, monkeypatch
):
    """The loader falls back to the API URL baked in at build time (the vendor
    cloud) unless the page sets window.chattermateBaseUrl. Without it, a
    self-hosted help center asks the wrong backend for its widget and the
    visitor gets "Chat Unavailable"."""
    monkeypatch.setattr(settings, "BACKEND_URL", "https://api.selfhosted.example")
    help_center.agent_id = test_widget.agent_id
    db.commit()

    r = client.get("/", headers={"host": HOST})
    assert f'window.chattermateId = "{test_widget.id}"' in r.text
    assert 'window.chattermateBaseUrl = "https://api.selfhosted.example/api/v1"' in r.text


def test_custom_domain_page_is_self_contained(
    client, db, test_organization, help_center, test_widget, monkeypatch
):
    """On a verified custom domain the page must advertise ITS OWN origin for
    canonical/og/assets (public_app serves the uploads mount there), while the
    widget still calls back to the install's API origin cross-origin — which is
    exactly what domain verification adds to CORS."""
    monkeypatch.setattr(settings, "HELP_CENTER_PUBLIC_MODE", "path")
    monkeypatch.setattr(settings, "BACKEND_URL", "https://api.selfhosted.example")
    help_center.custom_domain = "help.customer.com"
    help_center.txt_record_verified = True
    help_center.cname_record_verified = True
    help_center.logo_url = "/api/v1/uploads/help_center/logo.png"
    help_center.agent_id = test_widget.agent_id
    db.commit()

    r = client.get("/", headers={"host": "help.customer.com"})
    assert r.status_code == 200
    # The custom domain wins over path mode — no /help/{slug} anywhere.
    assert '<link rel="canonical" href="https://help.customer.com/">' in r.text
    assert "/help/test-org" not in r.text
    assert (
        '<meta property="og:image" content="https://help.customer.com/api/v1/uploads/help_center/logo.png">'
        in r.text
    )
    assert 'window.chattermateBaseUrl = "https://api.selfhosted.example/api/v1"' in r.text


def test_og_card_degrades_without_a_logo(client, db, test_organization, help_center):
    """No logo means no og:image at all — a broken thumbnail is worse than a
    text-only card."""
    r = client.get("/", headers={"host": HOST})
    assert "og:image" not in r.text
    assert '<meta name="twitter:card" content="summary">' in r.text


def test_search_filters_results(client, db, test_organization, help_center):
    _publish_faq(db, test_organization.id, question="How does billing work?", answer="Per seat.")
    _publish_faq(db, test_organization.id, question="Is data encrypted?", answer="Yes.")
    r = client.get("/", params={"q": "billing"}, headers={"host": HOST})
    assert "How does billing work?" in r.text
    assert "Is data encrypted?" not in r.text


def test_disabled_or_unknown_hosts_404(client, db, test_organization, help_center):
    assert client.get("/", headers={"host": "nope.chattermate.help"}).status_code == 404
    help_center.enabled = False
    db.commit()
    assert client.get("/", headers={"host": HOST}).status_code == 404


def test_lapsed_plan_hides_site(client, db, test_organization, help_center):
    with patch("app.services.help_center_public.help_center_allowed", return_value=False):
        assert client.get("/", headers={"host": HOST}).status_code == 404


def test_sitemap_and_robots(client, db, test_organization, help_center, subdomain_mode):
    sitemap = client.get("/sitemap.xml", headers={"host": HOST})
    assert sitemap.status_code == 200 and f"https://{HOST}/" in sitemap.text
    robots = client.get("/robots.txt", headers={"host": HOST})
    assert "Sitemap:" in robots.text


def test_robots_closes_non_content_paths_but_keeps_articles(
    client, db, test_organization, help_center, subdomain_mode
):
    """The articles stay crawlable — only the paths that are not pages are
    closed: /feedback and /search (the catch-all 404s both as article slugs)
    and the per-category ?topic= variants of the landing page."""
    lines = client.get("/robots.txt", headers={"host": HOST}).text.splitlines()

    assert "Allow: /" in lines
    assert "Disallow: /feedback" in lines
    assert "Disallow: /search" in lines
    assert "Disallow: /*?topic=" in lines
    assert not any(line.startswith("Disallow: /a/") for line in lines)


def test_robots_disallows_carry_the_base_path_in_path_mode(
    path_client, db, test_organization, help_center
):
    """A bare "Disallow: /feedback" would name the origin root under path
    dispatch, not this site — so the rules carry the base path, same as every
    other link the site builds. (Crawlers only read the origin-root
    robots.txt, which is the API one; this keeps the two consistent.)"""
    lines = path_client.get("/help/test-org/robots.txt").text.splitlines()

    assert "Disallow: /help/test-org/feedback" in lines


# ---------- path dispatch (self-host default) ----------

def test_path_dispatch_serves_index(path_client, db, test_organization, help_center):
    _publish_faq(db, test_organization.id)
    r = path_client.get("/help/test-org")
    assert r.status_code == 200
    assert "How do I sign up?" in r.text
    # Internal links carry the /help/{slug} base_path prefix.
    assert 'href="/help/test-org/a/' in r.text
    # Canonical follows path mode (BACKEND_URL/help/{slug}).
    assert '<link rel="canonical" href="http' in r.text and "/help/test-org/" in r.text


def test_path_dispatch_nested_article(path_client, db, test_organization, help_center):
    faq = _publish_faq(db, test_organization.id, answer="Click **Settings**.")
    faq.slug = "how-do-i-sign-up"
    db.commit()
    r = path_client.get("/help/test-org/a/how-do-i-sign-up")
    assert r.status_code == 200
    assert "<strong>Settings</strong>" in r.text


def test_path_dispatch_unknown_slug_404(path_client, db):
    assert path_client.get("/help/nope").status_code == 404


def test_public_app_only_serves_help_center_uploads():
    """The help-center app must expose ONLY help_center images — never the whole
    uploads/ tree (chat_attachments, knowledge, avatars, …) or /assets."""
    from starlette.routing import Mount
    mount_paths = {r.path for r in public_app.routes if isinstance(r, Mount)}
    assert "/api/v1/uploads/help_center" in mount_paths
    assert "/api/v1/uploads" not in mount_paths   # not the whole tree
    assert "/assets" not in mount_paths


def test_path_dispatch_trailing_slash_served_not_redirected(path_client, db, test_organization, help_center):
    """A trailing slash must serve the article, not 307 to the origin root without
    the /help/{slug} prefix (which would 404)."""
    faq = _publish_faq(db, test_organization.id)
    faq.slug = "how-do-i-sign-up"
    db.commit()
    r = path_client.get("/help/test-org/a/how-do-i-sign-up/")
    assert r.status_code == 200
    assert "How do I sign up?" in r.text


def test_path_dispatch_feedback_post(path_client, db, test_organization, help_center):
    faq = _publish_faq(db, test_organization.id)
    faq.slug = "how-do-i-sign-up"
    db.commit()
    r = path_client.post("/help/test-org/a/how-do-i-sign-up/feedback", json={"helpful": True})
    assert r.status_code == 200


def test_path_dispatch_inert_in_subdomain_mode(db, monkeypatch):
    """In subdomain mode, /help/{slug} is NOT claimed — it falls through to the
    main app (cloud safety: no path serving, no duplicate content)."""
    monkeypatch.setattr(settings, "HELP_CENTER_PUBLIC_MODE", "subdomain")
    client = TestClient(HelpCenterHostMiddleware(_not_found_app, public_app))
    r = client.get("/help/test-org")
    assert r.status_code == 404 and r.text == "main app"


# ---------- ask ----------

def test_ask_disabled_404(client, db, test_organization, help_center):
    help_center.ai_search_enabled = False
    db.commit()
    r = client.post("/ask", json={"question": "How do I sign up?"}, headers={"host": HOST})
    assert r.status_code == 404


def test_ask_answers_and_rate_limits(client, db, test_organization, help_center, test_agent):
    help_center.agent_id = test_agent.id
    db.commit()
    with patch("app.api.help_center_public.answer_question", new=AsyncMock(return_value="From your dashboard.")):
        ok = client.post("/ask", json={"question": "Where do I log in?"}, headers={"host": HOST})
        assert ok.status_code == 200
        assert ok.json()["answer"] == "From your dashboard."
    with patch("app.api.help_center_public.allow_request", return_value=False):
        limited = client.post("/ask", json={"question": "again?"}, headers={"host": HOST})
        assert limited.status_code == 429


def test_ask_unanswerable_503(client, db, test_organization, help_center, test_agent):
    help_center.agent_id = test_agent.id
    db.commit()
    with patch("app.api.help_center_public.answer_question", new=AsyncMock(return_value=None)):
        r = client.post("/ask", json={"question": "Where do I log in?"}, headers={"host": HOST})
        assert r.status_code == 503


# ---------- host dispatch ----------

def test_is_help_center_host_matches_subdomains_only():
    assert is_help_center_host("acme.chattermate.help") is True
    assert is_help_center_host("chattermate.help") is False
    assert is_help_center_host("api.chattermate.chat") is False
    assert is_help_center_host("") is False


def test_is_help_center_host_checks_verified_domain_cache():
    with patch("app.core.help_center_host._domain_cache") as cache:
        cache.contains.return_value = True
        assert is_help_center_host("help.customer.com") is True
        cache.contains.assert_called_once_with("help.customer.com")


def test_resolve_help_center_via_verified_domain(db, test_organization, help_center):
    help_center.custom_domain = "help.customer.com"
    help_center.txt_record_verified = True
    help_center.cname_record_verified = True
    db.commit()
    assert resolve_help_center(db, "help.customer.com").id == help_center.id
    # Unverified custom domains never resolve.
    help_center.txt_record_verified = False
    db.commit()
    assert resolve_help_center(db, "help.customer.com") is None


def test_article_feedback_records_and_dedupes(client, db, test_organization, help_center):
    faq = _publish_faq(db, test_organization.id)
    faq.slug = "how-do-i-sign-up"
    db.commit()
    r = client.post(f"/a/{faq.slug}/feedback", json={"helpful": True}, headers={"host": HOST})
    assert r.status_code == 200 and r.json() == {"ok": True}
    db.refresh(faq)
    assert (faq.helpful_yes, faq.helpful_no) == (1, 0)
    # Same client (IP) can't vote again — deduped, tallies unchanged.
    client.post(f"/a/{faq.slug}/feedback", json={"helpful": False}, headers={"host": HOST})
    db.refresh(faq)
    assert (faq.helpful_yes, faq.helpful_no) == (1, 0)


def test_article_feedback_unknown_slug_404(client, db, test_organization, help_center):
    r = client.post("/a/does-not-exist/feedback", json={"helpful": True}, headers={"host": HOST})
    assert r.status_code == 404


# ---------- preserved original article URLs (help-center migration) ----------

# The kind of URL an org arrives with from Zendesk/Intercom.
MIGRATED_PATH = "/hc/en-us/articles/360012-reset-password"


def _migrated_faq(db, org_id, **kw):
    kw.setdefault("question", "How do I reset my password?")
    kw.setdefault("slug", "how-do-i-reset-my-password")
    kw.setdefault("url_path", MIGRATED_PATH)
    return _publish_faq(db, org_id, **kw)


def test_preserved_path_serves_the_article(client, db, test_organization, help_center):
    """The whole point: the URL the org already ranks for keeps working."""
    faq = _migrated_faq(db, test_organization.id)

    r = client.get(MIGRATED_PATH, headers={"host": HOST})

    assert r.status_code == 200
    assert faq.question in r.text


def test_slug_url_redirects_to_the_preserved_path(client, db, test_organization, help_center):
    """One canonical URL per article — /a/{slug} is only an alias."""
    faq = _migrated_faq(db, test_organization.id)

    r = client.get(f"/a/{faq.slug}", headers={"host": HOST}, follow_redirects=False)

    assert r.status_code == 301
    assert r.headers["location"] == MIGRATED_PATH
    # Bounded, so clearing the path later doesn't strand browsers on a dead 301.
    assert r.headers["cache-control"] == "public, max-age=60"


def test_preserved_path_drives_canonical_and_json_ld(
    client, db, test_organization, help_center, subdomain_mode
):
    _migrated_faq(db, test_organization.id)

    r = client.get(MIGRATED_PATH, headers={"host": HOST})

    expected = f"https://test-org.chattermate.help{MIGRATED_PATH}"
    assert f'<link rel="canonical" href="{expected}">' in r.text
    assert f'<meta property="og:url" content="{expected}">' in r.text
    graph = json.loads(re.search(
        r'<script type="application/ld\+json">(.*?)</script>', r.text, re.S
    ).group(1))["@graph"]
    page = next(n for n in graph if n["@type"] == "WebPage")
    assert page["url"] == expected
    crumbs = next(n for n in graph if n["@type"] == "BreadcrumbList")
    assert crumbs["itemListElement"][-1]["item"] == expected


def test_sitemap_lists_the_preserved_path(client, db, test_organization, help_center, subdomain_mode):
    _migrated_faq(db, test_organization.id)

    r = client.get("/sitemap.xml", headers={"host": HOST})

    assert f"<loc>https://test-org.chattermate.help{MIGRATED_PATH}</loc>" in r.text
    assert "/a/how-do-i-reset-my-password" not in r.text


def test_index_and_related_cards_link_to_the_preserved_path(
    client, db, test_organization, help_center
):
    _migrated_faq(db, test_organization.id)
    other = _publish_faq(
        db, test_organization.id, question="How do I sign up?", slug="how-do-i-sign-up",
    )

    index = client.get("/", headers={"host": HOST})
    assert f'href="{MIGRATED_PATH}"' in index.text

    # Same-category related list on the other article points at it too.
    article = client.get(f"/a/{other.slug}", headers={"host": HOST})
    assert f'href="{MIGRATED_PATH}"' in article.text


def test_cross_article_body_links_resolve_to_the_preserved_path(
    client, db, test_organization, help_center
):
    """Bodies STORE /a/{slug}; the reader should still land on the preserved URL
    directly rather than bouncing through the 301."""
    _migrated_faq(db, test_organization.id)
    _publish_faq(
        db, test_organization.id, question="Billing", slug="billing",
        answer="See [resetting](/a/how-do-i-reset-my-password) and [home](/).",
    )

    r = client.get("/a/billing", headers={"host": HOST})

    assert f'href="{MIGRATED_PATH}"' in r.text
    assert 'href="/a/how-do-i-reset-my-password"' not in r.text


def test_feedback_posts_to_the_slug_route_from_a_preserved_path_page(
    client, db, test_organization, help_center
):
    """location.pathname would POST to a path with no route (a 405, not a 404)."""
    faq = _migrated_faq(db, test_organization.id)

    page = client.get(MIGRATED_PATH, headers={"host": HOST})
    assert f'data-feedback-url="/a/{faq.slug}/feedback"' in page.text

    r = client.post(f"/a/{faq.slug}/feedback", json={"helpful": True}, headers={"host": HOST})
    assert r.status_code == 200
    assert faq.helpful_yes == 1


def test_preserved_path_trailing_slash_redirects(client, db, test_organization, help_center):
    _migrated_faq(db, test_organization.id)

    r = client.get(f"{MIGRATED_PATH}/", headers={"host": HOST}, follow_redirects=False)

    assert r.status_code == 301
    assert r.headers["location"] == MIGRATED_PATH


def test_slug_trailing_slash_still_redirects(client, db, test_organization, help_center):
    """Regression guard: a catch-all matches everything, so Starlette's own
    redirect_slashes fallback never fires again and we must do it ourselves."""
    faq = _publish_faq(db, test_organization.id, slug="how-do-i-sign-up")

    r = client.get(f"/a/{faq.slug}/", headers={"host": HOST}, follow_redirects=False)

    assert r.status_code == 301
    assert r.headers["location"] == f"/a/{faq.slug}"


def test_unknown_path_404s(client, db, test_organization, help_center):
    _migrated_faq(db, test_organization.id)

    assert client.get("/hc/en-us/articles/nope", headers={"host": HOST}).status_code == 404


def test_reserved_routes_win_over_a_preserved_path(client, db, test_organization, help_center):
    """Belt and braces on route ordering: even a path forced past the normaliser
    straight into the DB must not shadow a real route."""
    _publish_faq(
        db, test_organization.id, slug="sneaky", url_path="/sitemap.xml",
    )

    r = client.get("/sitemap.xml", headers={"host": HOST})

    assert r.status_code == 200
    assert "<urlset" in r.text


def test_path_dispatch_serves_the_preserved_path(path_client, db, test_organization, help_center):
    """Under /help/{slug} the preserved path hangs off the base path, and every
    rendered link keeps the prefix."""
    _migrated_faq(db, test_organization.id)
    _publish_faq(db, test_organization.id, question="Billing", slug="billing")

    r = path_client.get(f"/help/test-org{MIGRATED_PATH}")
    assert r.status_code == 200

    index = path_client.get("/help/test-org/")
    assert f'href="/help/test-org{MIGRATED_PATH}"' in index.text


def test_path_dispatch_slug_url_redirects_with_the_base_path(
    path_client, db, test_organization, help_center
):
    faq = _migrated_faq(db, test_organization.id)

    r = path_client.get(f"/help/test-org/a/{faq.slug}", follow_redirects=False)

    assert r.status_code == 301
    assert r.headers["location"] == f"/help/test-org{MIGRATED_PATH}"

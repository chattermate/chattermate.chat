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

from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.api.help_center_public import public_app
from app.core.help_center_host import is_help_center_host
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


def _publish_faq(db, org_id, question="How do I sign up?", answer="Use your <b>email</b>.", category="Getting started"):
    return FAQRepository(db).create(FAQ(
        organization_id=org_id, question=question, answer=answer,
        category=category, status=FAQStatus.PUBLISHED,
    ))


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

def test_page_renders_published_only_and_escapes(client, db, test_organization, help_center):
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


def test_sitemap_and_robots(client, db, test_organization, help_center):
    sitemap = client.get("/sitemap.xml", headers={"host": HOST})
    assert sitemap.status_code == 200 and f"https://{HOST}/" in sitemap.text
    robots = client.get("/robots.txt", headers={"host": HOST})
    assert "Sitemap:" in robots.text


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

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

Help-center admin API tests: settings get-or-create + slug, FAQ CRUD and
publish flow, generation/import job enqueueing (409/400 guards, SSRF),
and plan gating in simulated cloud mode.
"""

from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

import app.main  # noqa: F401 — ensures routers are registered on the FastAPI app
from app.core.application import app
from app.core.auth import get_current_user, require_permissions
from app.database import get_db
from app.models.faq import FAQ, FAQStatus
from app.repositories.faq import FAQRepository

BASE = "/api/v1/help-center"


@pytest.fixture
def client(db, test_user):
    # The shared test_role lacks manage_knowledge, which every help-center
    # endpoint requires.
    from app.models.permission import Permission
    perm = Permission(name="manage_knowledge")
    db.add(perm)
    test_user.role.permissions.append(perm)
    db.commit()

    async def override_user():
        return test_user

    def override_db():
        yield db

    # NOTE: overriding require_permissions itself would be a no-op (FastAPI
    # keys overrides on the closure it returns) — the real permission check
    # runs against test_user's role, which now has manage_knowledge.
    app.dependency_overrides[get_current_user] = override_user
    app.dependency_overrides[get_db] = override_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def _create_faq(db, org_id, **kwargs):
    defaults = dict(question="How do I sign up?", answer="With your email.", category="Getting started")
    defaults.update(kwargs)
    return FAQRepository(db).create(FAQ(organization_id=org_id, **defaults))


# ---------- settings ----------

def test_settings_get_or_create_assigns_slug_and_defaults(client, test_agent):
    r = client.get(f"{BASE}/settings")
    assert r.status_code == 200
    body = r.json()
    assert body["slug"] == "test-organization"
    assert body["live_url"].startswith("https://test-organization.")
    assert body["plan_allowed"] is True  # OSS mode: never locked
    assert body["auto_generate"] is True
    assert body["ai_search_enabled"] is True
    assert [a["name"] for a in body["agents"]] == ["Test Agent"]
    # Second call returns the same row (no duplicate creation).
    assert client.get(f"{BASE}/settings").json()["slug"] == "test-organization"


def test_settings_update_branding(client):
    client.get(f"{BASE}/settings")
    r = client.put(f"{BASE}/settings", json={
        "brand_color": "#0E8C8C",
        "header_links": [{"label": "Product", "url": "example.com"}],
        "cta_text": "Sign in",
        "cta_url": "app.example.com",
        "enabled": True,
    })
    assert r.status_code == 200
    body = r.json()
    assert body["brand_color"] == "#0E8C8C"
    assert body["header_links"] == [{"label": "Product", "url": "https://example.com"}]
    assert body["cta_url"] == "https://app.example.com"
    assert body["enabled"] is True


def test_settings_update_rejects_bad_color_and_cross_org_agent(client):
    assert client.put(f"{BASE}/settings", json={"brand_color": "red"}).status_code == 422
    assert client.put(f"{BASE}/settings", json={"agent_id": str(uuid4())}).status_code == 404


# ---------- FAQ CRUD ----------

def test_faq_crud_flow(client, db, test_organization):
    created = client.post(f"{BASE}/faqs", json={
        "question": "What does it cost?", "answer": "From $19.", "category": "Billing",
    })
    assert created.status_code == 201
    faq_id = created.json()["id"]
    assert created.json()["status"] == "draft"
    assert created.json()["source_label"] == "Added manually"

    # Partial update must not reset omitted fields (category keeps Billing).
    updated = client.put(f"{BASE}/faqs/{faq_id}", json={"status": "published"})
    assert updated.status_code == 200
    assert updated.json()["status"] == "published"
    assert updated.json()["category"] == "Billing"

    listing = client.get(f"{BASE}/faqs", params={"status": "published"})
    assert listing.status_code == 200
    assert listing.json()["pagination"]["total"] == 1

    assert client.get(f"{BASE}/faqs/categories").json() == ["Billing"]

    assert client.delete(f"{BASE}/faqs/{faq_id}").status_code == 204
    assert client.get(f"{BASE}/faqs").json()["pagination"]["total"] == 0


def test_faq_cross_org_is_404(client, db):
    from app.models.organization import Organization
    other_org = Organization(name="Other", domain="other.com", timezone="UTC")
    db.add(other_org)
    db.commit()
    foreign = _create_faq(db, other_org.id)
    assert client.put(f"{BASE}/faqs/{foreign.id}", json={"status": "published"}).status_code == 404
    assert client.delete(f"{BASE}/faqs/{foreign.id}").status_code == 404


def test_bulk_status_publish(client, db, test_organization):
    ids = [str(_create_faq(db, test_organization.id, question=f"Q{i}?").id) for i in range(3)]
    r = client.post(f"{BASE}/faqs/bulk-status", json={"faq_ids": ids, "status": "published"})
    assert r.status_code == 200
    assert r.json()["updated"] == 3


# ---------- generation / import ----------

def test_generate_requires_ai_config(client):
    assert client.post(f"{BASE}/generate").status_code == 400


def test_generate_enqueues_and_409s_on_duplicate(client, test_ai_config):
    first = client.post(f"{BASE}/generate")
    assert first.status_code == 202
    assert first.json()["status"] == "pending"
    assert client.post(f"{BASE}/generate").status_code == 409
    # Polling returns the active job.
    active = client.get(f"{BASE}/jobs")
    assert active.json()["id"] == first.json()["id"]


def test_import_rejects_internal_hosts(client, test_ai_config):
    with patch("app.api.help_center.generation.resolves_to_blocked_host", return_value=True):
        assert client.post(f"{BASE}/import", json={"url": "https://internal.host/faq"}).status_code == 400


def test_import_enqueues_with_source_url(client, test_ai_config):
    with patch("app.api.help_center.generation.resolves_to_blocked_host", return_value=False):
        r = client.post(f"{BASE}/import", json={"url": "support.example.com/faq"})
    assert r.status_code == 202
    assert r.json()["source_url"] == "https://support.example.com/faq"
    assert r.json()["job_type"] == "import_url"


def test_job_by_id_cross_org_404(client):
    assert client.get(f"{BASE}/jobs/999999").status_code == 404


# ---------- plan gating (simulated cloud) ----------

def _cloud_gate(feature_available: bool):
    """Simulate the enterprise module being present with a plan whose
    help_center flag is `feature_available`."""
    subscription = MagicMock(plan_id=uuid4())
    plan_repo = MagicMock()
    plan_repo.check_feature_availability.return_value = feature_available
    return (
        patch("app.services.feature_gate.HAS_ENTERPRISE", True),
        patch("app.services.feature_gate.require_accessible_subscription",
              return_value=subscription, create=True),
        patch("app.services.feature_gate.PlanRepository",
              return_value=plan_repo, create=True),
    )


def test_cloud_free_plan_gets_403_on_writes(client, test_ai_config):
    p1, p2, p3 = _cloud_gate(feature_available=False)
    with p1, p2, p3:
        assert client.post(f"{BASE}/faqs", json={"question": "Q?", "answer": "A."}).status_code == 403
        assert client.post(f"{BASE}/generate").status_code == 403
        # Ungated read still works and reports the lock.
        settings_response = client.get(f"{BASE}/settings")
        assert settings_response.status_code == 200
        assert settings_response.json()["plan_allowed"] is False


def test_cloud_pro_plan_allowed(client, test_ai_config):
    p1, p2, p3 = _cloud_gate(feature_available=True)
    with p1, p2, p3:
        assert client.post(f"{BASE}/faqs", json={"question": "Q?", "answer": "A."}).status_code == 201
        assert client.get(f"{BASE}/settings").json()["plan_allowed"] is True

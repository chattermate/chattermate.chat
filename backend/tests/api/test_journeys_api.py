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
from uuid import uuid4

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

import app.main  # noqa: F401 — registers the routers on the app
from app.core.application import app
from app.core.auth import get_current_user, require_permissions
from app.database import get_db
from app.models.journey import JourneyProgress
from app.services.journey_runtime import JourneyRunner

BASE = "/api/v1/agent"
STEP = {"id": "s1", "title": "Set currency", "done_when": [{"kind": "event", "value": "currency_set"}]}


def _journey(**extra):
    body = {"key": "first_invoice", "name": "First invoice", "status": "draft",
            "definition": {"start": {"kind": "url", "value": "/dashboard*"}, "steps": [STEP]}}
    body.update(extra)
    return body


@pytest.fixture
def client(db, test_user):
    async def override_user():
        return test_user

    async def override_perms(*args, **kwargs):
        return test_user

    def override_db():
        yield db

    app.dependency_overrides[get_current_user] = override_user
    app.dependency_overrides[require_permissions] = override_perms
    app.dependency_overrides[get_db] = override_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def _url(agent, *parts):
    return "/".join([f"{BASE}/{agent.id}/journeys", *parts]).rstrip("/")


def test_create_list_get_update_delete(client, test_agent):
    created = client.post(_url(test_agent), json=_journey())
    assert created.status_code == 201
    journey = created.json()
    assert journey["version"] == 1 and journey["status"] == "draft"

    assert [j["key"] for j in client.get(_url(test_agent)).json()] == ["first_invoice"]
    assert client.get(_url(test_agent, journey["id"])).json()["name"] == "First invoice"

    updated = client.put(_url(test_agent, journey["id"]), json=_journey(name="Invoice in 5", definition={
        "start": {"kind": "url", "value": "/dashboard*"}, "steps": [STEP, {**STEP, "id": "s2"}]}))
    assert updated.status_code == 200 and updated.json()["version"] == 2

    live = client.patch(_url(test_agent, journey["id"], "status"), json={"status": "live"})
    assert live.json()["status"] == "live"

    assert client.delete(_url(test_agent, journey["id"])).status_code == 204
    assert client.get(_url(test_agent, journey["id"])).status_code == 404


def test_validation_and_duplicates(client, test_agent):
    assert client.post(_url(test_agent), json=_journey(key="Bad Key")).status_code == 422
    assert client.post(_url(test_agent), json=_journey(definition={"steps": []})).status_code == 422
    assert client.post(_url(test_agent), json=_journey()).status_code == 201
    assert client.post(_url(test_agent), json=_journey()).status_code == 409


def test_rename_to_a_taken_key_is_409(client, test_agent):
    a = client.post(_url(test_agent), json=_journey(key="a")).json()
    client.post(_url(test_agent), json=_journey(key="b"))
    assert client.put(_url(test_agent, a["id"]), json=_journey(key="b")).status_code == 409


def test_reorder_sets_priority(client, test_agent):
    a = client.post(_url(test_agent), json=_journey(key="a")).json()
    b = client.post(_url(test_agent), json=_journey(key="b")).json()
    ordered = client.put(_url(test_agent, "order"), json={"ids": [b["id"], a["id"]]}).json()
    assert [j["key"] for j in ordered] == ["b", "a"]


def test_templates_and_copy_as_draft(client, test_agent):
    templates = client.get(_url(test_agent, "templates")).json()
    assert len(templates) == 7 and {"trial_to_paid", "saas_onboarding"} <= {t["key"] for t in templates}
    made = client.post(_url(test_agent, "from-template"), json={"template_key": "trial_to_paid"})
    assert made.status_code == 201
    body = made.json()
    assert body["status"] == "draft" and body["template_key"] == "trial_to_paid" and body["goal_event"] == "subscription_started"
    assert client.post(_url(test_agent, "from-template"), json={"template_key": "nope"}).status_code == 404


def test_funnel_and_stuck_users_and_csv(client, db, test_agent, test_customer):
    journey = client.post(_url(test_agent), json=_journey(status="live")).json()
    session = {"org_id": test_agent.organization_id, "agent_id": str(test_agent.id),
               "customer_id": str(test_customer.id), "host_url": "https://app.x/dashboard"}
    JourneyRunner(db, session).sync()

    funnel = client.get(_url(test_agent, journey["id"], "funnel")).json()
    assert funnel["started"] == 1 and funnel["steps"][0]["reached"] == 1

    users = client.get(_url(test_agent, journey["id"], "steps", "s1", "users")).json()
    assert users[0]["email"] == test_customer.email
    csv_response = client.get(_url(test_agent, journey["id"], "steps", "s1", "users") + "?format=csv")
    assert csv_response.headers["content-type"].startswith("text/csv")
    assert test_customer.email in csv_response.text
    assert client.get(_url(test_agent, journey["id"], "steps", "nope", "users")).status_code == 404

    timeline = client.get(f"/api/v1/people/{test_customer.id}/journeys").json()
    assert timeline[0]["journey_name"] == "First invoice" and timeline[0]["steps"][0]["reached_at"]


def test_cross_org_and_unknown_are_404(client, test_agent):
    assert client.get(f"{BASE}/{uuid4()}/journeys").status_code == 404
    assert client.get(_url(test_agent, str(uuid4()))).status_code == 404
    assert client.get(f"/api/v1/people/{uuid4()}/journeys").status_code == 404


def test_every_route_is_gated(client, test_agent, test_customer):
    refuse = HTTPException(status_code=403, detail="Journeys are not available in your current plan.")
    with patch("app.api.journeys.check_journeys_access", side_effect=refuse):
        for method, path in [
            ("get", _url(test_agent)), ("post", _url(test_agent)), ("get", _url(test_agent, "templates")),
            ("get", _url(test_agent, "context-keys")), ("get", _url(test_agent, str(uuid4()), "funnel")),
            ("get", f"/api/v1/people/{test_customer.id}/journeys"),
        ]:
            response = getattr(client, method)(path, json=_journey()) if method == "post" else getattr(client, method)(path)
            assert response.status_code == 403, path

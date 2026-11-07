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
from app.core.config import settings
from app.database import get_db
from app.models.agent import AgentType
from app.models.organization import Organization
from app.repositories.agent import AgentRepository

BASE = "/api/v1/agent"


def _payload(**overrides):
    body = {
        "name": "create_draft_invoice",
        "label": "Draft an invoice",
        "description": "Creates a draft invoice for a customer.",
        "parameters": {
            "type": "object",
            "properties": {"customer": {"type": "string"}},
            "required": ["customer"],
        },
        "confirm": "always",
        "timeout_s": 15,
        "sensitive_form": False,
        "enabled": True,
    }
    body.update(overrides)
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


def _create(client, agent, **overrides):
    return client.post(f"{BASE}/{agent.id}/actions", json=_payload(**overrides))


def test_list_empty_reports_platform_cap_on_oss(client, test_agent):
    r = client.get(f"{BASE}/{test_agent.id}/actions")
    assert r.status_code == 200
    assert r.json() == {"actions": [], "cap": settings.ACTION_MAX_PER_AGENT}


def test_create_then_list(client, test_agent):
    r = _create(client, test_agent)
    assert r.status_code == 201
    body = r.json()
    assert body["name"] == "create_draft_invoice"
    assert body["confirm"] == "always"
    assert body["last_registered_at"] is None

    listed = client.get(f"{BASE}/{test_agent.id}/actions").json()["actions"]
    assert [a["name"] for a in listed] == ["create_draft_invoice"]


def test_default_parameters_and_timeout(client, test_agent):
    body = {"name": "open_page", "label": "Go to a page", "description": "Navigates."}
    r = client.post(f"{BASE}/{test_agent.id}/actions", json=body)
    assert r.status_code == 201
    assert r.json()["parameters"] == {"type": "object", "properties": {}}
    assert r.json()["timeout_s"] == settings.ACTION_TIMEOUT_DEFAULT_S
    assert r.json()["confirm"] == "never"


def test_duplicate_name_is_409(client, test_agent):
    assert _create(client, test_agent).status_code == 201
    assert _create(client, test_agent).status_code == 409


@pytest.mark.parametrize("name", ["Create", "1st", "has-dash", "a" * 65, ""])
def test_rejects_bad_names(client, test_agent, name):
    assert _create(client, test_agent, name=name).status_code == 422


@pytest.mark.parametrize("parameters", [
    {"type": "string"},
    {"properties": {}},
    {"type": "object", "properties": {"x": {"type": "nope"}}},
])
def test_rejects_bad_schemas(client, test_agent, parameters):
    assert _create(client, test_agent, parameters=parameters).status_code == 422


def test_rejects_oversized_schema(client, test_agent):
    props = {f"f{i}": {"type": "string", "description": "x" * 100} for i in range(200)}
    r = _create(client, test_agent, parameters={"type": "object", "properties": props})
    assert r.status_code == 422


def test_rejects_timeout_over_cap_and_blank_label(client, test_agent):
    assert _create(client, test_agent, timeout_s=settings.ACTION_TIMEOUT_MAX_S + 1).status_code == 422
    assert _create(client, test_agent, timeout_s=0).status_code == 422
    assert _create(client, test_agent, label="   ").status_code == 422


def test_update_and_rename_conflict(client, test_agent):
    first = _create(client, test_agent).json()
    _create(client, test_agent, name="send_invoice")

    r = client.put(f"{BASE}/{test_agent.id}/actions/{first['id']}", json=_payload(label="Draft it", enabled=False))
    assert r.status_code == 200
    assert r.json()["label"] == "Draft it"
    assert r.json()["enabled"] is False

    clash = client.put(f"{BASE}/{test_agent.id}/actions/{first['id']}", json=_payload(name="send_invoice"))
    assert clash.status_code == 409


def test_delete(client, test_agent):
    action = _create(client, test_agent).json()
    assert client.delete(f"{BASE}/{test_agent.id}/actions/{action['id']}").status_code == 204
    assert client.delete(f"{BASE}/{test_agent.id}/actions/{action['id']}").status_code == 404


def test_model_view_adds_sensitive_form_note(client, test_agent):
    action = _create(client, test_agent, name="connect_bank", sensitive_form=True, confirm="never").json()
    r = client.get(f"{BASE}/{test_agent.id}/actions/{action['id']}/model-view")
    assert r.status_code == 200
    view = r.json()
    assert view["name"] == "connect_bank"
    assert view["description"].startswith("Creates a draft invoice")
    assert "Never pass such details" in view["description"]
    assert view["parameters"]["required"] == ["customer"]


def test_cross_org_agent_is_404(client, db):
    org = Organization(name="Other org", domain="other-actions.example", timezone="UTC")
    db.add(org)
    db.commit()
    other = AgentRepository(db).create_agent(
        name="Other", agent_type=AgentType.CUSTOMER_SUPPORT, instructions=["x"], org_id=org.id,
    )
    assert client.get(f"{BASE}/{other.id}/actions").status_code == 404
    assert _create(client, other).status_code == 404


def test_unknown_action_is_404(client, test_agent):
    assert client.put(f"{BASE}/{test_agent.id}/actions/{uuid4()}", json=_payload()).status_code == 404
    assert client.get(f"{BASE}/{test_agent.id}/actions/{uuid4()}/model-view").status_code == 404


def test_plan_cap_blocks_creation(client, test_agent):
    with patch("app.services.agent_action_access.feature_limit", return_value=1):
        assert _create(client, test_agent).status_code == 201
        r = _create(client, test_agent, name="second")
        assert r.status_code == 403
        assert "1 actions" in r.json()["detail"]
        assert client.get(f"{BASE}/{test_agent.id}/actions").json()["cap"] == 1


def test_plan_cap_never_exceeds_platform_cap(client, test_agent):
    with patch("app.services.agent_action_access.feature_limit", return_value=10_000):
        assert client.get(f"{BASE}/{test_agent.id}/actions").json()["cap"] == settings.ACTION_MAX_PER_AGENT


def test_toggle_only_changes_enabled(client, test_agent):
    action = _create(client, test_agent).json()
    r = client.patch(f"{BASE}/{test_agent.id}/actions/{action['id']}", json={"enabled": False})
    assert r.status_code == 200
    assert r.json()["enabled"] is False
    assert r.json()["label"] == action["label"]


def test_lost_duplicate_race_is_409(client, test_agent):
    # Simulate the second of two concurrent creates: the pre-check passes but
    # the unique constraint fires on commit.
    assert _create(client, test_agent).status_code == 201
    with patch("app.api.agent_actions._reject_duplicate_name"):
        r = _create(client, test_agent)
    assert r.status_code == 409


def test_list_works_without_a_subscription(client, test_agent):
    with patch("app.services.agent_action_access.feature_limit",
               side_effect=HTTPException(status_code=403, detail="No active subscription found")):
        r = client.get(f"{BASE}/{test_agent.id}/actions")
    assert r.status_code == 200
    assert r.json()["cap"] == 0

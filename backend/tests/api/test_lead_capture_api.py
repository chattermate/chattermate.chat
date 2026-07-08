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

import pytest
from unittest.mock import patch
from uuid import uuid4
from fastapi.testclient import TestClient

import app.main  # noqa: F401 — ensures routers are registered on the FastAPI app
from app.core.application import app
from app.core.auth import get_current_user, require_permissions
from app.database import get_db

BASE = "/api/v1/agent"


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


def test_get_lazily_creates_off_config(client, test_agent):
    r = client.get(f"{BASE}/{test_agent.id}/lead-capture")
    assert r.status_code == 200
    body = r.json()
    assert body["enabled"] is False
    assert body["agent_id"] == str(test_agent.id)


def test_get_cross_org_agent_404(client):
    r = client.get(f"{BASE}/{uuid4()}/lead-capture")
    assert r.status_code == 404


def test_put_updates_config_oss_mode(client, test_agent):
    # OSS mode (no enterprise gate) so any plan can save.
    with patch("app.api.lead_capture.HAS_ENTERPRISE", False):
        payload = {
            "enabled": True,
            "require_consent": True,
            "guidance": "Ask after pricing",
            "fields": [
                {"key": "email", "standard": True, "enabled": True, "required": True},
                {"key": "company", "standard": True, "enabled": True, "required": False},
            ],
            "assignment_mode": "none",
            "assignment_target_user_id": None,
            "crm_sync_target": "none",
            "slack_notify_enabled": False,
        }
        r = client.put(f"{BASE}/{test_agent.id}/lead-capture", json=payload)
    assert r.status_code == 200
    body = r.json()
    assert body["enabled"] is True
    assert {f["key"] for f in body["fields"]} == {"email", "company"}


def test_put_rejects_cross_org_assignment_target(client, test_agent):
    with patch("app.api.lead_capture.HAS_ENTERPRISE", False):
        payload = {
            "enabled": True,
            "require_consent": True,
            "guidance": None,
            "fields": [{"key": "email", "standard": True, "enabled": True, "required": True}],
            "assignment_mode": "specific_person",
            "assignment_target_user_id": str(uuid4()),  # not in this org
            "crm_sync_target": "none",
            "slack_notify_enabled": False,
        }
        r = client.put(f"{BASE}/{test_agent.id}/lead-capture", json=payload)
    assert r.status_code == 400

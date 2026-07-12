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

import os
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

from app.core.exceptions import JiraAuthError
from app.core.security import decrypt_api_key
from app.services.jira import JiraClient, get_credentials, store_token
from app.services.jira.oauth import JiraOAuth


@pytest.fixture
def oauth():
    with patch.dict(os.environ, {
        "JIRA_CLIENT_ID": "cid",
        "JIRA_CLIENT_SECRET": "secret",
        "JIRA_REDIRECT_URI": "https://app.test/callback",
    }):
        yield JiraOAuth()


def _resp(status=200, payload=None, text=""):
    r = MagicMock()
    r.status_code = status
    r.json.return_value = payload if payload is not None else {}
    r.text = text
    return r


# --- OAuth ---------------------------------------------------------------

def test_authorization_url_includes_params(oauth):
    url = oauth.authorization_url("xyz-state")
    assert url.startswith("https://auth.atlassian.com/authorize?")
    assert "client_id=cid" in url and "state=xyz-state" in url and "scope=" in url


def test_exchange_code_success(oauth):
    payload = {"access_token": "a", "refresh_token": "r", "token_type": "Bearer", "expires_in": 3600}
    with patch("app.services.jira.oauth.requests.post", return_value=_resp(200, payload)):
        data = oauth.exchange_code("code123")
    assert data["access_token"] == "a" and data["refresh_token"] == "r"
    assert data["expires_at"] > datetime.utcnow()


def test_exchange_code_failure_raises(oauth):
    with patch("app.services.jira.oauth.requests.post", return_value=_resp(400, text="bad")):
        with pytest.raises(JiraAuthError):
            oauth.exchange_code("bad")


def test_refresh_keeps_old_refresh_token_when_absent(oauth):
    payload = {"access_token": "a2", "token_type": "Bearer", "expires_in": 3600}
    with patch("app.services.jira.oauth.requests.post", return_value=_resp(200, payload)):
        data = oauth.refresh("old-refresh")
    assert data["refresh_token"] == "old-refresh"  # falls back to the supplied one


def test_get_accessible_resources_empty_raises(oauth):
    with patch("app.services.jira.oauth.requests.get", return_value=_resp(200, [])):
        with pytest.raises(JiraAuthError):
            oauth.get_accessible_resources("token")


# --- Client --------------------------------------------------------------

def test_client_get_issue_types_filters_subtasks():
    project = {"issueTypes": [
        {"id": "1", "name": "Task", "subtask": False},
        {"id": "2", "name": "Sub-task", "subtask": True},
    ]}
    client = JiraClient("tok", "cloud1", "https://x.atlassian.net")
    with patch("app.services.jira.client.requests.request", return_value=_resp(200, project)):
        types = client.get_issue_types("PROJ")
    assert [t["id"] for t in types] == ["1"]  # sub-task excluded


def test_client_create_issue_builds_adf_and_skips_priority_when_none():
    client = JiraClient("tok", "cloud1", "https://x.atlassian.net")
    captured = {}

    def fake_request(method, url, **kwargs):
        captured["json"] = kwargs.get("json")
        return _resp(201, {"key": "PROJ-1", "id": "10001"})

    # priority_id=None skips the availability lookup entirely
    with patch("app.services.jira.client.requests.request", side_effect=fake_request):
        result = client.create_issue("PROJ", "10001", "Sum", "Body", priority_id=None)

    assert result["key"] == "PROJ-1"
    fields = captured["json"]["fields"]
    assert fields["summary"] == "Sum"
    assert fields["description"]["type"] == "doc"  # Atlassian Document Format
    assert "priority" not in fields


def test_client_add_comment_does_not_raise_on_failure():
    client = JiraClient("tok", "cloud1")
    with patch("app.services.jira.client.requests.request", return_value=_resp(500, text="nope")):
        client.add_comment("PROJ-1", "hi")  # logs a warning, never raises


# --- Tokens (encryption + refresh) --------------------------------------

def test_store_token_encrypts_at_rest(db, test_organization):
    token_data = {
        "access_token": "plain-access",
        "refresh_token": "plain-refresh",
        "token_type": "Bearer",
        "expires_at": datetime.utcnow() + timedelta(hours=1),
    }
    row = store_token(db, test_organization.id, token_data, "cloud1", "https://x.atlassian.net")
    assert row.access_token != "plain-access"  # stored ciphertext
    assert decrypt_api_key(row.access_token) == "plain-access"


def test_get_credentials_refreshes_when_expired(db, test_organization):
    store_token(db, test_organization.id, {
        "access_token": "old", "refresh_token": "old-r", "token_type": "Bearer",
        "expires_at": datetime.utcnow() - timedelta(minutes=1),  # already expired
    }, "cloud1", "https://x.atlassian.net")

    refreshed = {"access_token": "new", "refresh_token": "new-r", "token_type": "Bearer",
                 "expires_at": datetime.utcnow() + timedelta(hours=1)}
    with patch.object(JiraOAuth, "refresh", return_value=refreshed) as mock_refresh:
        creds = get_credentials(db, test_organization.id)
    mock_refresh.assert_called_once()
    assert creds.access_token == "new" and creds.cloud_id == "cloud1"


def test_get_credentials_no_connection_raises(db, test_organization):
    with pytest.raises(JiraAuthError):
        get_credentials(db, test_organization.id)

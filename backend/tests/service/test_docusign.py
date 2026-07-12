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

from app.core.exceptions import DocuSignAuthError
from app.core.security import decrypt_api_key
from app.services.docusign import DocuSignClient, get_credentials, store_token
from app.services.docusign.oauth import DocuSignOAuth


@pytest.fixture
def oauth():
    with patch.dict(os.environ, {
        "DOCUSIGN_CLIENT_ID": "cid",
        "DOCUSIGN_CLIENT_SECRET": "secret",
        "DOCUSIGN_REDIRECT_URI": "https://app.test/callback",
    }):
        yield DocuSignOAuth()


def _resp(status=200, payload=None, text=""):
    r = MagicMock()
    r.status_code = status
    r.json.return_value = payload if payload is not None else {}
    r.text = text
    return r


# --- OAuth ---------------------------------------------------------------

def test_authorization_url_includes_params(oauth):
    verifier, challenge = oauth.generate_pkce()
    url = oauth.authorization_url("state1", challenge)
    assert "/oauth/auth?" in url
    assert "client_id=cid" in url and "state=state1" in url and "scope=signature" in url
    assert "code_challenge=" in url and "code_challenge_method=S256" in url


def test_generate_pkce_is_s256_of_verifier(oauth):
    import base64 as _b64, hashlib as _hashlib
    verifier, challenge = oauth.generate_pkce()
    expected = _b64.urlsafe_b64encode(_hashlib.sha256(verifier.encode()).digest()).decode().rstrip("=")
    assert challenge == expected
    assert 43 <= len(verifier) <= 128  # RFC 7636 length bounds


def test_exchange_code_success(oauth):
    payload = {"access_token": "a", "refresh_token": "r", "token_type": "Bearer", "expires_in": 3600}
    with patch("app.services.docusign.oauth.requests.post", return_value=_resp(200, payload)) as post:
        data = oauth.exchange_code("code", "verifier-123")
    assert data["access_token"] == "a" and data["expires_at"] > datetime.utcnow()
    # PKCE verifier must be sent on the token exchange
    assert post.call_args.kwargs["data"]["code_verifier"] == "verifier-123"


def test_refresh_keeps_old_refresh_when_absent(oauth):
    payload = {"access_token": "a2", "token_type": "Bearer", "expires_in": 3600}
    with patch("app.services.docusign.oauth.requests.post", return_value=_resp(200, payload)):
        data = oauth.refresh("old-r")
    assert data["refresh_token"] == "old-r"


def test_get_account_picks_default(oauth):
    payload = {"accounts": [
        {"account_id": "1", "base_uri": "https://na1", "is_default": False},
        {"account_id": "2", "base_uri": "https://na2", "is_default": True},
    ]}
    with patch("app.services.docusign.oauth.requests.get", return_value=_resp(200, payload)):
        account = oauth.get_account("tok")
    assert account["account_id"] == "2" and account["base_uri"] == "https://na2"


def test_get_account_none_raises(oauth):
    with patch("app.services.docusign.oauth.requests.get", return_value=_resp(200, {"accounts": []})):
        with pytest.raises(DocuSignAuthError):
            oauth.get_account("tok")


# --- Client --------------------------------------------------------------

def test_client_list_templates_maps_fields():
    payload = {"envelopeTemplates": [{"templateId": "t1", "name": "NDA", "extra": "x"}]}
    client = DocuSignClient("tok", "acct", "https://na2.docusign.net")
    with patch("app.services.docusign.client.requests.request", return_value=_resp(200, payload)):
        templates = client.list_templates()
    assert templates == [{"templateId": "t1", "name": "NDA"}]


def test_client_send_envelope_builds_template_roles():
    client = DocuSignClient("tok", "acct", "https://na2.docusign.net")
    captured = {}

    def fake_request(method, url, **kwargs):
        captured["json"] = kwargs.get("json")
        return _resp(201, {"envelopeId": "env-1", "status": "sent"})

    with patch("app.services.docusign.client.requests.request", side_effect=fake_request):
        result = client.send_envelope_from_template("t1", "s@x.com", "Sam")

    assert result["envelopeId"] == "env-1"
    body = captured["json"]
    assert body["templateId"] == "t1" and body["status"] == "sent"
    assert body["templateRoles"][0]["email"] == "s@x.com"


def test_client_send_envelope_failure_raises():
    client = DocuSignClient("tok", "acct", "https://na2.docusign.net")
    with patch("app.services.docusign.client.requests.request", return_value=_resp(400, text="bad")):
        with pytest.raises(DocuSignAuthError):
            client.send_envelope_from_template("t1", "s@x.com", "Sam")


# --- Tokens --------------------------------------------------------------

def test_store_token_encrypts_at_rest(db, test_organization):
    row = store_token(db, test_organization.id, {
        "access_token": "plain", "refresh_token": "plain-r", "token_type": "Bearer",
        "expires_at": datetime.utcnow() + timedelta(hours=1),
    }, account_id="acct", base_uri="https://na2.docusign.net")
    assert row.access_token != "plain"
    assert decrypt_api_key(row.access_token) == "plain"


def test_get_credentials_refreshes_when_expired(db, test_organization):
    store_token(db, test_organization.id, {
        "access_token": "old", "refresh_token": "old-r", "token_type": "Bearer",
        "expires_at": datetime.utcnow() - timedelta(minutes=1),
    }, account_id="acct", base_uri="https://na2.docusign.net")

    refreshed = {"access_token": "new", "refresh_token": "new-r", "token_type": "Bearer",
                 "expires_at": datetime.utcnow() + timedelta(hours=1)}
    with patch.object(DocuSignOAuth, "refresh", return_value=refreshed) as mock_refresh:
        creds = get_credentials(db, test_organization.id)
    mock_refresh.assert_called_once()
    assert creds.access_token == "new" and creds.account_id == "acct"


def test_get_credentials_no_connection_raises(db, test_organization):
    with pytest.raises(DocuSignAuthError):
        get_credentials(db, test_organization.id)

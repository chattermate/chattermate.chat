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

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

import app.channels.teams as teams
from app.channels.teams import TeamsAdapter


@pytest.fixture
def adapter():
    return TeamsAdapter()


def _activity(**over):
    base = {
        "type": "message",
        "id": "act-1",
        "text": "hello there",
        "serviceUrl": "https://smba.trafficmanager.net/amer/",
        "conversation": {"id": "conv-1"},
        "from": {"id": "user-1", "name": "Ada Lovelace"},
        "recipient": {"id": "bot-1"},
    }
    base.update(over)
    return base


def test_parse_inbound_extracts_message_and_service_url(adapter):
    msgs = adapter.parse_inbound(_activity())
    assert len(msgs) == 1
    m = msgs[0]
    assert m.external_conversation_id == "conv-1"
    assert m.external_user_id == "user-1"
    assert m.text == "hello there"
    assert m.profile["name"] == "Ada Lovelace"
    assert m.profile["service_url"] == "https://smba.trafficmanager.net/amer/"


def test_parse_inbound_ignores_non_message(adapter):
    assert adapter.parse_inbound({"type": "conversationUpdate"}) == []
    assert adapter.parse_inbound(_activity(text="  ")) == []


def test_conversation_state_persists_service_url(adapter):
    [inbound] = adapter.parse_inbound(_activity())
    assert adapter.conversation_state(inbound) == {
        "service_url": "https://smba.trafficmanager.net/amer/"}


@pytest.mark.asyncio
async def test_verify_webhook_rejects_missing_bearer(adapter):
    account = MagicMock()
    assert await adapter.verify_webhook({}, b"", account) is False
    assert await adapter.verify_webhook({"authorization": "Basic xyz"}, b"", account) is False


@pytest.mark.asyncio
async def test_verify_webhook_validates_jwt(adapter):
    account = MagicMock()
    with patch.object(TeamsAdapter, "_app_id", return_value="app-123"), \
         patch("app.channels.teams._get_jwks_client") as jwks, \
         patch("app.channels.teams.jwt.decode", return_value={"aud": "app-123"}) as decode:
        jwks.return_value.get_signing_key_from_jwt.return_value = MagicMock(key="k")
        ok = await adapter.verify_webhook({"authorization": "Bearer tok"}, b"", account)
    assert ok is True
    assert decode.call_args.kwargs["audience"] == "app-123"


@pytest.mark.asyncio
async def test_verify_webhook_fails_closed_on_bad_jwt(adapter):
    account = MagicMock()
    with patch.object(TeamsAdapter, "_app_id", return_value="app-123"), \
         patch("app.channels.teams._get_jwks_client"), \
         patch("app.channels.teams.jwt.decode", side_effect=Exception("bad sig")):
        assert await adapter.verify_webhook({"authorization": "Bearer tok"}, b"", account) is False


@pytest.mark.asyncio
async def test_send_text_requires_service_url(adapter):
    account = MagicMock()
    conversation = MagicMock(extra={}, external_conversation_id="conv-1")
    result = await adapter.send_text(account, conversation, "hi")
    assert result.ok is False and "serviceUrl" in result.error


@pytest.mark.asyncio
async def test_send_text_posts_activity(adapter):
    account = MagicMock()
    conversation = MagicMock(
        extra={"service_url": "https://smba.example/amer/"}, external_conversation_id="conv-1")
    response = MagicMock(status_code=200)
    response.json.return_value = {"id": "sent-1"}
    client = MagicMock()
    client.post = AsyncMock(return_value=response)
    with patch.object(TeamsAdapter, "_outbound_token", AsyncMock(return_value="tok")), \
         patch("app.channels.teams._get_http_client", return_value=client):
        result = await adapter.send_text(account, conversation, "hi")

    assert result.ok and result.external_message_id == "sent-1"
    url = client.post.call_args.args[0]
    assert url == "https://smba.example/amer/v3/conversations/conv-1/activities"


@pytest.mark.asyncio
async def test_request_connector_token_returns_none_on_failure():
    response = MagicMock(status_code=401)
    client = MagicMock()
    client.post = AsyncMock(return_value=response)
    with patch("app.channels.teams._get_http_client", return_value=client):
        assert await teams.request_connector_token("aid", "bad") is None

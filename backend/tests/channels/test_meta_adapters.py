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

import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock

import pytest

from app.channels import get_adapter
from app.channels.base import WindowStatus
from app.channels.meta_base import (
    verify_meta_signature,
    verify_challenge,
    graph_post_json,
    graph_delete,
    WINDOW_HOURS,
)
from app.core.config import settings


WHATSAPP_PAYLOAD = {
    "object": "whatsapp_business_account",
    "entry": [{
        "id": "WABA1",
        "changes": [{
            "field": "messages",
            "value": {
                "messaging_product": "whatsapp",
                "metadata": {"display_phone_number": "15550001111", "phone_number_id": "PN123"},
                "contacts": [{"profile": {"name": "Ada Lovelace"}, "wa_id": "447000000001"}],
                "messages": [{
                    "from": "447000000001",
                    "id": "wamid.ABC",
                    "timestamp": "1720000000",
                    "type": "text",
                    "text": {"body": "hello whatsapp"},
                }],
            },
        }],
    }],
}

WHATSAPP_STATUS_PAYLOAD = {
    "object": "whatsapp_business_account",
    "entry": [{
        "changes": [{
            "value": {
                "metadata": {"phone_number_id": "PN123"},
                "statuses": [{"id": "wamid.ABC", "status": "delivered"}],
            },
        }],
    }],
}

MESSENGER_PAYLOAD = {
    "object": "page",
    "entry": [{
        "id": "PAGE9",
        "time": 1720000000000,
        "messaging": [{
            "sender": {"id": "PSID5"},
            "recipient": {"id": "PAGE9"},
            "timestamp": 1720000000000,
            "message": {"mid": "mid.1", "text": "hello messenger"},
        }],
    }],
}

INSTAGRAM_PAYLOAD = {
    "object": "instagram",
    "entry": [{
        "id": "IG7",
        "messaging": [{
            "sender": {"id": "IGSID2"},
            "recipient": {"id": "IG7"},
            "timestamp": 1720000000000,
            "message": {"mid": "mid.3", "text": "hello instagram"},
        }],
    }],
}


class TestSignatureAndChallenge:
    def test_valid_signature(self, monkeypatch):
        monkeypatch.setattr(settings, "META_APP_SECRET", "s3cret")
        body = b'{"object":"page"}'
        sig = "sha256=" + hmac.new(b"s3cret", body, hashlib.sha256).hexdigest()
        assert verify_meta_signature(body, sig) is True

    def test_invalid_or_missing_signature(self, monkeypatch):
        monkeypatch.setattr(settings, "META_APP_SECRET", "s3cret")
        assert verify_meta_signature(b"{}", "sha256=deadbeef") is False
        assert verify_meta_signature(b"{}", "") is False
        assert verify_meta_signature(b"{}", "sha1=abc") is False

    def test_signature_rejected_without_configured_secret(self, monkeypatch):
        monkeypatch.setattr(settings, "META_APP_SECRET", "")
        assert verify_meta_signature(b"{}", "sha256=anything") is False

    def test_challenge(self, monkeypatch):
        monkeypatch.setattr(settings, "META_WEBHOOK_VERIFY_TOKEN", "vtok")
        assert verify_challenge("subscribe", "vtok", "12345") == "12345"
        assert verify_challenge("subscribe", "wrong", "12345") is None
        assert verify_challenge(None, None, None) is None


class TestWhatsAppParse:
    def test_parse_text_message(self):
        messages = get_adapter("whatsapp").parse_inbound(WHATSAPP_PAYLOAD)
        assert len(messages) == 1
        m = messages[0]
        assert m.external_account_id == "PN123"
        assert m.external_conversation_id == "447000000001"
        assert m.external_message_id == "wamid.ABC"
        assert m.text == "hello whatsapp"
        assert m.profile["name"] == "Ada Lovelace"
        assert m.timestamp.tzinfo is not None

    def test_status_callback_yields_nothing(self):
        assert get_adapter("whatsapp").parse_inbound(WHATSAPP_STATUS_PAYLOAD) == []

    def test_button_reply_text(self):
        payload = {
            "object": "whatsapp_business_account",
            "entry": [{"changes": [{"value": {
                "metadata": {"phone_number_id": "PN123"},
                "messages": [{"from": "447", "id": "wamid.B", "type": "button",
                              "button": {"text": "Yes please"}}],
            }}]}],
        }
        messages = get_adapter("whatsapp").parse_inbound(payload)
        assert messages[0].text == "Yes please"


class TestMessengerInstagramParse:
    def test_parse_messenger(self):
        messages = get_adapter("messenger").parse_inbound(MESSENGER_PAYLOAD)
        assert len(messages) == 1
        m = messages[0]
        assert m.external_account_id == "PAGE9"
        assert m.external_conversation_id == "PSID5"
        assert m.external_message_id == "mid.1"
        assert m.text == "hello messenger"

    def test_echo_and_receipts_skipped(self):
        payload = {
            "object": "page",
            "entry": [{"id": "PAGE9", "messaging": [
                {"sender": {"id": "PSID5"}, "message": {"mid": "m", "text": "x", "is_echo": True}},
                {"sender": {"id": "PSID5"}, "delivery": {"mids": ["m"]}},
                {"sender": {"id": "PSID5"}, "read": {"watermark": 1}},
            ]}],
        }
        assert get_adapter("messenger").parse_inbound(payload) == []

    def test_parse_instagram(self):
        messages = get_adapter("instagram").parse_inbound(INSTAGRAM_PAYLOAD)
        assert len(messages) == 1
        assert messages[0].external_account_id == "IG7"
        assert messages[0].external_conversation_id == "IGSID2"


class TestDeliveryWindow:
    def _conversation(self, hours_ago: float):
        conv = MagicMock()
        conv.last_inbound_at = datetime.now(timezone.utc) - timedelta(hours=hours_ago)
        return conv

    def test_within_window_ok(self):
        for channel in ("whatsapp", "messenger", "instagram"):
            assert get_adapter(channel).check_delivery_window(self._conversation(1)) is WindowStatus.OK

    def test_expired_whatsapp_allows_template(self):
        status = get_adapter("whatsapp").check_delivery_window(self._conversation(WINDOW_HOURS + 1))
        assert status is WindowStatus.TEMPLATE_REQUIRED

    def test_expired_messenger_instagram_undeliverable(self):
        for channel in ("messenger", "instagram"):
            status = get_adapter(channel).check_delivery_window(self._conversation(WINDOW_HOURS + 1))
            assert status is WindowStatus.UNDELIVERABLE

    def test_naive_timestamp_treated_as_utc(self):
        conv = MagicMock()
        conv.last_inbound_at = datetime.utcnow() - timedelta(hours=1)  # naive
        assert get_adapter("whatsapp").check_delivery_window(conv) is WindowStatus.OK

    def test_no_inbound_at_means_expired(self):
        conv = MagicMock()
        conv.last_inbound_at = None
        assert get_adapter("whatsapp").check_delivery_window(conv) is WindowStatus.TEMPLATE_REQUIRED


class _FakeResponse:
    def __init__(self, status_code=200, body=None):
        self.status_code = status_code
        self._body = {} if body is None else body

    def json(self):
        return self._body


class _RecordingClient:
    """Stands in for the shared Graph http client, capturing what was sent."""

    def __init__(self):
        self.response = _FakeResponse()
        self.error = None
        self.calls = []

    async def request(self, method, url, params=None, json=None, headers=None):
        self.calls.append({"method": method, "url": url, "params": params,
                           "json": json, "headers": headers})
        if self.error:
            raise self.error
        return self.response


@pytest.fixture
def graph_client(monkeypatch):
    client = _RecordingClient()
    monkeypatch.setattr("app.channels.meta_base._get_http_client", lambda: client)
    return client


class TestGraphHelpers:
    """graph_post_json/graph_delete keep the whole response body, unlike
    graph_post which reduces it to a message id."""

    @pytest.mark.asyncio
    async def test_post_json_returns_full_body(self, graph_client):
        created = {"id": "T1", "status": "PENDING", "category": "UTILITY"}
        graph_client.response = _FakeResponse(200, created)

        ok, body = await graph_post_json("WABA1/message_templates", "tok", {"name": "hello"})

        assert (ok, body) == (True, created)
        assert graph_client.calls[0]["method"] == "POST"
        assert graph_client.calls[0]["json"] == {"name": "hello"}

    @pytest.mark.asyncio
    async def test_token_travels_in_header_not_url(self, graph_client):
        await graph_post_json("WABA1/message_templates", "sekret", {})

        call = graph_client.calls[0]
        assert call["headers"]["Authorization"] == "Bearer sekret"
        assert "sekret" not in call["url"]

    @pytest.mark.asyncio
    async def test_delete_passes_params_and_reports_failure(self, graph_client):
        graph_client.response = _FakeResponse(400, {"error": {"message": "not found"}})

        ok, body = await graph_delete("WABA1/message_templates", "tok", {"name": "gone"})

        assert ok is False
        assert body["error"]["message"] == "not found"
        assert graph_client.calls[0]["method"] == "DELETE"
        assert graph_client.calls[0]["params"] == {"name": "gone"}

    @pytest.mark.asyncio
    async def test_network_error_is_reported_not_raised(self, graph_client):
        graph_client.error = RuntimeError("connection reset")

        ok, body = await graph_delete("WABA1/message_templates", "tok")

        assert ok is False
        assert "connection reset" in body["error"]["message"]

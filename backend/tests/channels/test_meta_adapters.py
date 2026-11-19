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
from unittest.mock import AsyncMock, MagicMock
from urllib.parse import urlparse

import pytest

from app.channels import get_adapter
from app.channels.base import (
    DeliveryState, InteractiveButton, InteractiveKind, InteractiveMessage,
    InteractiveReplyType, InteractiveRow, InteractiveSection, WindowStatus,
)
from app.channels.meta_base import (
    verify_meta_signature,
    verify_challenge,
    exchange_for_long_lived_token,
    exchange_instagram_code,
    exchange_instagram_long_lived,
    graph_get,
    graph_list_all,
    whatsapp_send_blocker,
    graph_post,
    graph_post_json,
    instagram_token_payload,
    GRAPH_BASE,
    GRAPH_INSTAGRAM_BASE,
    WINDOW_HOURS,
)
from app.core.config import settings


def _host(url: str) -> str:
    """The host a request actually went to.

    Compared rather than prefix-matched: `startswith(GRAPH_BASE)` is also
    satisfied by `https://graph.facebook.com.evil.example/...`, so it does not
    really pin down where a token was sent.
    """
    return urlparse(url).hostname or ""


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
        monkeypatch.setattr(settings, "INSTAGRAM_APP_SECRET", "")
        assert verify_meta_signature(b"{}", "sha256=anything") is False

    def test_accepts_a_payload_signed_with_the_instagram_secret(self, monkeypatch):
        """Instagram Login webhooks are signed with the Instagram app secret;
        rejecting those would drop every Instagram DM at the door."""
        monkeypatch.setattr(settings, "META_APP_SECRET", "fb-secret")
        monkeypatch.setattr(settings, "INSTAGRAM_APP_SECRET", "ig-secret")
        body = b'{"object":"instagram"}'
        sig = "sha256=" + hmac.new(b"ig-secret", body, hashlib.sha256).hexdigest()
        assert verify_meta_signature(body, sig) is True

    def test_a_signature_from_neither_secret_is_rejected(self, monkeypatch):
        monkeypatch.setattr(settings, "META_APP_SECRET", "fb-secret")
        monkeypatch.setattr(settings, "INSTAGRAM_APP_SECRET", "ig-secret")
        body = b'{"object":"instagram"}'
        sig = "sha256=" + hmac.new(b"attacker", body, hashlib.sha256).hexdigest()
        assert verify_meta_signature(body, sig) is False

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
        # wa_id declared verbatim; the normalize_msisdn boundary adds the '+'
        assert m.profile["phone"] == "447000000001"
        assert m.timestamp.tzinfo is not None

    def test_status_callback_yields_nothing(self):
        assert get_adapter("whatsapp").parse_inbound(WHATSAPP_STATUS_PAYLOAD) == []

    def test_template_quick_reply_keeps_text_and_payload(self):
        messages = get_adapter("whatsapp").parse_inbound(_wa_message({
            "type": "button", "button": {"text": "Yes please", "payload": "CONFIRM_42"},
        }))
        assert messages[0].text == "Yes please"
        assert messages[0].interactive.type == InteractiveReplyType.TEMPLATE_BUTTON
        assert messages[0].interactive.id == "CONFIRM_42"

    def test_button_reply_keeps_id_and_reply_context(self):
        messages = get_adapter("whatsapp").parse_inbound(_wa_message({
            "type": "interactive",
            "context": {"from": "15550001111", "id": "wamid.OFFER"},
            "interactive": {"type": "button_reply",
                            "button_reply": {"id": "qr_1", "title": "Tomorrow"}},
        }))
        m = messages[0]
        assert m.text == "Tomorrow"
        assert (m.interactive.type, m.interactive.id) == (InteractiveReplyType.BUTTON_REPLY, "qr_1")
        assert m.reply_to_message_id == "wamid.OFFER"

    def test_list_reply_keeps_id_and_description(self):
        messages = get_adapter("whatsapp").parse_inbound(_wa_message({
            "type": "interactive",
            "interactive": {"type": "list_reply", "list_reply": {
                "id": "attendance:present", "title": "Present", "description": "On time"}},
        }))
        reply = messages[0].interactive
        assert reply.type == InteractiveReplyType.LIST_REPLY
        assert (reply.id, reply.title) == ("attendance:present", "Present")

    def test_location_becomes_readable_text(self):
        messages = get_adapter("whatsapp").parse_inbound(_wa_message({
            "type": "location",
            "location": {"latitude": 51.5, "longitude": -0.12, "name": "Pitch 3"},
        }))
        m = messages[0]
        assert m.location.latitude == 51.5 and m.location.name == "Pitch 3"
        assert m.text == "Shared location: Pitch 3 (51.5, -0.12)"

    def test_an_untitled_tap_reads_as_its_id_never_empty(self):
        messages = get_adapter("whatsapp").parse_inbound(_wa_message({
            "type": "interactive",
            "interactive": {"type": "button_reply", "button_reply": {"id": "confirm"}},
        }))
        assert messages[0].text == "confirm"

    def test_a_tap_with_neither_title_nor_id_is_skipped(self):
        assert get_adapter("whatsapp").parse_inbound(_wa_message({
            "type": "interactive", "interactive": {"type": "button_reply", "button_reply": {}},
        })) == []

    def test_media_is_still_skipped(self):
        assert get_adapter("whatsapp").parse_inbound(_wa_message({
            "type": "image", "image": {"id": "MEDIA1"},
        })) == []


def _wa_message(message: dict) -> dict:
    """A one-message WhatsApp webhook payload."""
    return {
        "object": "whatsapp_business_account",
        "entry": [{"changes": [{"value": {
            "metadata": {"phone_number_id": "PN123"},
            "messages": [{"from": "447", "id": "wamid.B", **message}],
        }}]}],
    }


def _wa_statuses(*statuses: dict) -> dict:
    return {
        "object": "whatsapp_business_account",
        "entry": [{"changes": [{"value": {
            "metadata": {"phone_number_id": "PN123"},
            "statuses": list(statuses),
        }}]}],
    }


class TestWhatsAppStatuses:
    def test_parses_status_with_pricing(self):
        events = get_adapter("whatsapp").parse_status_events(_wa_statuses({
            "id": "wamid.ABC", "status": "read", "timestamp": "1720000000",
            "recipient_id": "447",
            "pricing": {"billable": True, "pricing_model": "PMP", "category": "utility"},
        }))
        assert len(events) == 1
        e = events[0]
        assert (e.external_account_id, e.external_message_id) == ("PN123", "wamid.ABC")
        assert e.status == DeliveryState.READ
        assert (e.pricing_category, e.billable) == ("utility", True)
        assert e.timestamp.tzinfo is not None

    def test_parses_per_message_pricing(self):
        [e] = get_adapter("whatsapp").parse_status_events(_wa_statuses({
            "id": "wamid.ABC", "status": "delivered", "timestamp": "1720000000", "recipient_id": "447",
            "pricing": {"billable": False, "pricing_model": "PMP", "category": "service",
                        "type": "free_customer_service"},
        }))
        assert (e.pricing_category, e.pricing_type, e.pricing_model) == ("service", "free_customer_service", "PMP")

    def test_a_status_without_pricing_or_errors_has_none(self):
        [e] = get_adapter("whatsapp").parse_status_events(_wa_statuses({
            "id": "wamid.ABC", "status": "sent", "timestamp": "1720000000", "recipient_id": "447"}))
        assert (e.pricing_type, e.pricing_model, e.error_code) == (None, None, None)

    def test_failed_status_carries_the_reason(self):
        events = get_adapter("whatsapp").parse_status_events(_wa_statuses({
            "id": "wamid.X", "status": "failed",
            "errors": [{"code": 131047, "title": "Re-engagement message",
                        "error_data": {"details": "More than 24 hours have passed"}}],
        }))
        assert events[0].status == DeliveryState.FAILED
        assert events[0].error == "More than 24 hours have passed"
        assert events[0].error_code == "131047"
        # One message out of its window: the account itself is fine
        assert events[0].account_blocked is False

    @pytest.mark.parametrize("code", ["131031", "131042", "133010"])
    def test_a_failure_the_account_causes_is_flagged(self, code):
        [e] = get_adapter("whatsapp").parse_status_events(_wa_statuses({
            "id": "wamid.X", "status": "failed", "recipient_id": "447",
            "errors": [{"code": int(code), "title": "Business account has been locked."}],
        }))
        assert e.account_blocked is True
        assert e.error == "Business account has been locked."

    def test_unknown_states_and_messages_are_ignored(self):
        adapter = get_adapter("whatsapp")
        assert adapter.parse_status_events(_wa_statuses({"id": "wamid.X", "status": "deleted"})) == []
        assert adapter.parse_status_events(WHATSAPP_PAYLOAD) == []

    def test_other_channels_report_no_statuses(self):
        assert get_adapter("messenger").parse_status_events(MESSENGER_PAYLOAD) == []


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

    def test_parse_instagram_changes_shape(self):
        """Instagram also delivers a DM under changes[] with field=messages
        (this is the shape Meta's own webhook sample sends). Reading only
        messaging[] drops the message silently — the webhook still acks."""
        payload = {
            "object": "instagram",
            "entry": [{
                "id": "IG7",
                "changes": [{
                    "field": "messages",
                    "value": {
                        "sender": {"id": "IGSID2"},
                        "recipient": {"id": "IG7"},
                        "timestamp": "1527459824",
                        "message": {"mid": "mid.9", "text": "hello from changes"},
                    },
                }],
            }],
        }
        messages = get_adapter("instagram").parse_inbound(payload)
        assert len(messages) == 1
        assert messages[0].external_account_id == "IG7"
        assert messages[0].external_conversation_id == "IGSID2"
        assert messages[0].text == "hello from changes"

    def test_messenger_ignores_the_changes_shape(self):
        """Only Instagram delivers messaging events that way."""
        payload = {"object": "page", "entry": [{"id": "PAGE9", "changes": [
            {"field": "messages", "value": {"sender": {"id": "PSID5"},
                                            "message": {"mid": "m", "text": "x"}}}]}]}
        assert get_adapter("messenger").parse_inbound(payload) == []


class TestInstagramTransport:
    """Instagram Login accounts hold an Instagram user token, which the Facebook
    graph rejects — every call for them must go to graph.instagram.com."""

    @pytest.mark.asyncio
    async def test_instagram_sends_via_graph_instagram(self, graph_client, monkeypatch):
        adapter = get_adapter("instagram")
        monkeypatch.setattr(adapter, "access_token", lambda account: "IGTOKEN")
        graph_client.response = _FakeResponse(200, {"message_id": "m1"})
        conversation = MagicMock()
        conversation.external_conversation_id = "IGSID1"

        await adapter.send_text(MagicMock(), conversation, "hi")

        call = graph_client.calls[0]
        assert _host(call["url"]) == _host(GRAPH_INSTAGRAM_BASE)
        # messaging_type is Messenger-only; Instagram's send body omits it.
        assert "messaging_type" not in call["json"]

    @pytest.mark.asyncio
    async def test_messenger_still_sends_via_graph_facebook(self, graph_client, monkeypatch):
        adapter = get_adapter("messenger")
        monkeypatch.setattr(adapter, "access_token", lambda account: "PAGETOKEN")
        graph_client.response = _FakeResponse(200, {"message_id": "m1"})
        conversation = MagicMock()
        conversation.external_conversation_id = "PSID1"

        await adapter.send_text(MagicMock(), conversation, "hi")

        call = graph_client.calls[0]
        assert _host(call["url"]) == _host(GRAPH_BASE)
        assert call["json"]["messaging_type"] == "RESPONSE"


class TestProfileEnrichment:
    """The inbound payload carries only a sender id, so the customer's real name
    is looked up on demand — otherwise everyone shows as 'Messenger user 2742…'."""

    def _adapter(self, channel, monkeypatch, graph_return):
        adapter = get_adapter(channel)
        monkeypatch.setattr(adapter, "access_token", lambda account: "PAGE_TOKEN")
        graph = AsyncMock(return_value=graph_return)
        monkeypatch.setattr("app.channels.messenger.graph_get", graph)
        return adapter, graph

    @pytest.mark.asyncio
    async def test_messenger_resolves_the_senders_name(self, monkeypatch):
        adapter, graph = self._adapter(
            "messenger", monkeypatch, (True, {"first_name": "Ada", "last_name": "Lovelace"}))
        assert await adapter.fetch_profile(MagicMock(), "PSID1") == {"name": "Ada Lovelace"}
        graph.assert_awaited_once_with(
            "PSID1", "PAGE_TOKEN", params={"fields": "first_name,last_name"},
            base="https://graph.facebook.com")

    @pytest.mark.asyncio
    async def test_a_graph_failure_degrades_to_no_name(self, monkeypatch):
        """A lookup failure must not lose the message — it keeps the placeholder."""
        adapter, _ = self._adapter(
            "messenger", monkeypatch, (False, {"error": {"message": "rate limited"}}))
        assert await adapter.fetch_profile(MagicMock(), "PSID1") == {}

    @pytest.mark.asyncio
    async def test_instagram_uses_the_ig_name_fields(self, monkeypatch):
        adapter, graph = self._adapter(
            "instagram", monkeypatch, (True, {"name": "Ada", "username": "ada_l"}))
        assert await adapter.fetch_profile(MagicMock(), "IGSID1") == {"name": "Ada"}
        graph.assert_awaited_once_with(
            "IGSID1", "PAGE_TOKEN", params={"fields": "name,username"},
            base="https://graph.instagram.com")

    @pytest.mark.asyncio
    async def test_instagram_falls_back_to_username(self, monkeypatch):
        adapter, _ = self._adapter(
            "instagram", monkeypatch, (True, {"username": "ada_l"}))
        assert await adapter.fetch_profile(MagicMock(), "IGSID1") == {"name": "ada_l"}


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

    async def request(self, method, url, params=None, json=None, headers=None, data=None):
        self.calls.append({"method": method, "url": url, "params": params,
                           "json": json, "headers": headers, "data": data})
        if self.error:
            raise self.error
        return self.response

    async def post(self, url, json=None, headers=None):
        """graph_post sends through .post rather than .request."""
        return await self.request("POST", url, json=json, headers=headers)


@pytest.fixture
def graph_client(monkeypatch):
    client = _RecordingClient()
    monkeypatch.setattr("app.channels.meta_base._get_http_client", lambda: client)
    return client


class TestGraphHelpers:
    """graph_post_json/graph_get keep the whole response body, unlike
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
    async def test_params_are_passed_and_a_4xx_is_reported_not_raised(self, graph_client):
        graph_client.response = _FakeResponse(400, {"error": {"message": "not found"}})

        ok, body = await graph_get("WABA1/message_templates", "tok", {"fields": "name"})

        assert ok is False
        assert body["error"]["message"] == "not found"
        assert graph_client.calls[0]["method"] == "GET"
        assert graph_client.calls[0]["params"] == {"fields": "name"}

    @pytest.mark.asyncio
    async def test_network_error_is_reported_not_raised(self, graph_client):
        graph_client.error = RuntimeError("connection reset")

        ok, body = await graph_get("WABA1/message_templates", "tok")

        assert ok is False
        assert "connection reset" in body["error"]["message"]

    @pytest.mark.asyncio
    async def test_long_lived_exchange_uses_app_credentials_not_a_bearer(self, graph_client, monkeypatch):
        """Like the signup-code exchange, this authenticates with the app secret
        in the query, so it must carry no Authorization header."""
        monkeypatch.setattr(settings, "META_APP_ID", "APP1")
        monkeypatch.setattr(settings, "META_APP_SECRET", "SEKRET")
        graph_client.response = _FakeResponse(200, {"access_token": "LONGLIVED"})

        ok, body = await exchange_for_long_lived_token("short-token")

        assert (ok, body["access_token"]) == (True, "LONGLIVED")
        call = graph_client.calls[0]
        assert call["headers"].get("Authorization") is None
        assert call["params"]["grant_type"] == "fb_exchange_token"
        assert call["params"]["fb_exchange_token"] == "short-token"
        assert "SEKRET" not in call["url"]

    @pytest.mark.asyncio
    async def test_instagram_code_exchange_uses_the_instagram_app_and_host(
            self, graph_client, monkeypatch):
        """Instagram Login is its own OAuth: Instagram app credentials, its own
        host, form-encoded — the Facebook app id here would be rejected."""
        monkeypatch.setattr(settings, "INSTAGRAM_APP_ID", "IGAPP")
        monkeypatch.setattr(settings, "INSTAGRAM_APP_SECRET", "IGSECRET")
        monkeypatch.setattr(settings, "META_APP_ID", "FBAPP")
        graph_client.response = _FakeResponse(200, {"access_token": "IGShort", "user_id": 178})

        ok, body = await exchange_instagram_code("CODE", "https://app.test/cb.html")

        assert (ok, body["access_token"]) == (True, "IGShort")
        call = graph_client.calls[0]
        assert call["url"] == "https://api.instagram.com/oauth/access_token"
        assert call["data"]["client_id"] == "IGAPP"
        assert call["data"]["grant_type"] == "authorization_code"
        assert call["data"]["redirect_uri"] == "https://app.test/cb.html"

    @pytest.mark.asyncio
    async def test_instagram_long_lived_exchange_hits_graph_instagram(self, graph_client, monkeypatch):
        monkeypatch.setattr(settings, "INSTAGRAM_APP_SECRET", "IGSECRET")
        graph_client.response = _FakeResponse(200, {"access_token": "IGLong", "expires_in": 5183944})

        ok, body = await exchange_instagram_long_lived("IGShort")

        assert (ok, body["access_token"]) == (True, "IGLong")
        call = graph_client.calls[0]
        assert call["url"] == f"{GRAPH_INSTAGRAM_BASE}/access_token"
        assert call["params"]["grant_type"] == "ig_exchange_token"

    def test_token_payload_accepts_both_response_shapes(self):
        """Instagram has returned the token flat and wrapped in `data`; reading
        only one shape yields no token and looks like a login failure."""
        flat = {"access_token": "A", "user_id": 1}
        wrapped = {"data": [{"access_token": "A", "user_id": 1}]}
        assert instagram_token_payload(flat)["access_token"] == "A"
        assert instagram_token_payload(wrapped)["access_token"] == "A"
        # An empty/malformed `data` falls back rather than raising
        assert instagram_token_payload({"data": []}) == {"data": []}

    @pytest.mark.asyncio
    async def test_graph_list_all_follows_the_cursor(self, graph_client):
        """Two full pages then a short one: it must return every node, not stop
        at the first page."""
        pages = [
            _FakeResponse(200, {"data": [{"id": "1"}, {"id": "2"}],
                                "paging": {"cursors": {"after": "c1"}}}),
            _FakeResponse(200, {"data": [{"id": "3"}]}),
        ]
        call_count = {"n": 0}

        async def request(method, url, params=None, json=None, headers=None):
            graph_client.calls.append({"method": method, "url": url, "params": params})
            r = pages[call_count["n"]]
            call_count["n"] += 1
            return r

        graph_client.request = request
        ok, items = await graph_list_all("me/accounts", "tok", {"limit": 2})

        assert ok is True
        assert [i["id"] for i in items] == ["1", "2", "3"]
        assert graph_client.calls[1]["params"]["after"] == "c1"


class TestWhatsAppInteractiveSend:
    @pytest.fixture
    def adapter(self, monkeypatch):
        adapter = get_adapter("whatsapp")
        monkeypatch.setattr(adapter, "access_token", lambda account: "WATOKEN")
        return adapter

    @staticmethod
    def _conversation():
        conversation = MagicMock()
        conversation.external_conversation_id = "447000000001"
        return conversation

    @pytest.mark.asyncio
    async def test_reply_buttons_payload(self, graph_client, adapter):
        graph_client.response = _FakeResponse(200, {"messages": [{"id": "wamid.OUT"}]})
        message = InteractiveMessage(
            kind=InteractiveKind.BUTTONS, body="Mark attendance?", footer="CoachIQ",
            buttons=[InteractiveButton(id="present", title="Present"),
                     InteractiveButton(id="absent", title="Absent")])

        result = await adapter.send_interactive(MagicMock(), self._conversation(), message)

        assert result.ok and result.external_message_id == "wamid.OUT"
        body = graph_client.calls[0]["json"]
        assert body["type"] == "interactive" and body["to"] == "447000000001"
        assert body["interactive"] == {
            "type": "button",
            "body": {"text": "Mark attendance?"},
            "footer": {"text": "CoachIQ"},
            "action": {"buttons": [
                {"type": "reply", "reply": {"id": "present", "title": "Present"}},
                {"type": "reply", "reply": {"id": "absent", "title": "Absent"}},
            ]},
        }

    @pytest.mark.asyncio
    async def test_list_payload(self, graph_client, adapter):
        graph_client.response = _FakeResponse(200, {"messages": [{"id": "wamid.OUT"}]})
        message = InteractiveMessage(
            kind=InteractiveKind.LIST, body="Pick a session", header="Today",
            list_button_label="Sessions",
            sections=[InteractiveSection(title="Morning", rows=[
                InteractiveRow(id="s1", title="U12 09:00", description="Pitch 3"),
                InteractiveRow(id="s2", title="U14 10:30"),
            ])])

        await adapter.send_interactive(MagicMock(), self._conversation(), message)

        interactive = graph_client.calls[0]["json"]["interactive"]
        assert interactive["type"] == "list"
        assert interactive["header"] == {"type": "text", "text": "Today"}
        assert interactive["action"] == {"button": "Sessions", "sections": [{
            "title": "Morning",
            "rows": [{"id": "s1", "title": "U12 09:00", "description": "Pitch 3"},
                     {"id": "s2", "title": "U14 10:30"}],
        }]}

    @pytest.mark.asyncio
    async def test_cta_url_payload(self, graph_client, adapter):
        message = InteractiveMessage(kind=InteractiveKind.CTA_URL, body="Your invoice",
                                     display_text="Pay now", url="https://pay.example/1")

        await adapter.send_interactive(MagicMock(), self._conversation(), message)

        interactive = graph_client.calls[0]["json"]["interactive"]
        assert interactive["type"] == "cta_url"
        assert interactive["action"] == {"name": "cta_url", "parameters": {
            "display_text": "Pay now", "url": "https://pay.example/1"}}

    @pytest.mark.asyncio
    async def test_channels_without_support_refuse(self):
        adapter = get_adapter("slack")
        assert adapter.supports_interactive is False
        result = await adapter.send_interactive(
            MagicMock(), MagicMock(), InteractiveMessage(kind=InteractiveKind.BUTTONS, body="x"))
        assert result.ok is False


class TestWhatsAppReadReceipts:
    @pytest.mark.asyncio
    async def test_mark_read_has_no_typing_indicator(self, graph_client, monkeypatch):
        adapter = get_adapter("whatsapp")
        monkeypatch.setattr(adapter, "access_token", lambda account: "WATOKEN")
        graph_client.response = _FakeResponse(200, {"success": True})

        await adapter.mark_read(MagicMock(), "wamid.IN")

        assert graph_client.calls[0]["json"] == {
            "messaging_product": "whatsapp", "status": "read", "message_id": "wamid.IN"}

    @pytest.mark.asyncio
    async def test_typing_marks_read_with_the_indicator(self, graph_client, monkeypatch):
        adapter = get_adapter("whatsapp")
        monkeypatch.setattr(adapter, "access_token", lambda account: "WATOKEN")
        conversation = MagicMock()
        conversation.extra = {"last_inbound_message_id": "wamid.IN"}

        await adapter.send_typing(MagicMock(), conversation)

        assert graph_client.calls[0]["json"]["typing_indicator"] == {"type": "text"}


class TestGraphPostAuthFailure:
    """A refused token is flagged so the account can be marked for
    reconnection; a refused message is not."""

    @pytest.mark.asyncio
    @pytest.mark.parametrize("status,body", [
        (401, {"error": {"message": "Authentication Error", "code": 0}}),
        (400, {"error": {"message": "Authentication Error", "code": 0}}),
        (400, {"error": {"message": "Session has expired", "code": 190, "error_subcode": 463}}),
        (400, {"error": {"message": "Error validating access token", "code": 102}}),
        (401, {}),
    ])
    async def test_token_refusals_are_auth_failures(self, graph_client, status, body):
        graph_client.response = _FakeResponse(status, body)
        result = await graph_post("PN1/messages", "tok", {})
        assert result.ok is False
        assert result.auth_failed is True

    @pytest.mark.asyncio
    @pytest.mark.parametrize("body", [
        {"error": {"message": "Re-engagement message", "code": 131047}},
        {"error": {"message": "Invalid parameter", "code": 100}},
        {"error": "not a dict"},
    ])
    async def test_message_refusals_are_not(self, graph_client, body):
        graph_client.response = _FakeResponse(400, body)
        result = await graph_post("PN1/messages", "tok", {})
        assert result.ok is False
        assert result.auth_failed is False

    @pytest.mark.asyncio
    async def test_success_is_not(self, graph_client):
        graph_client.response = _FakeResponse(200, {"messages": [{"id": "wamid.1"}]})
        result = await graph_post("PN1/messages", "tok", {})
        assert result.ok is True
        assert result.auth_failed is False


class TestWhatsAppSendBlocker:
    """Meta's health_status: registered and connected is not the same as able to send."""

    def _health(self, monkeypatch, response):
        monkeypatch.setattr("app.channels.meta_base.graph_get", AsyncMock(return_value=response))

    @pytest.mark.asyncio
    async def test_a_blocked_waba_gives_metas_reason(self, monkeypatch):
        """tkt-8's actual status: the number LIMITED, the WABA BLOCKED on billing."""
        self._health(monkeypatch, (True, {"health_status": {
            "can_send_message": "BLOCKED",
            "entities": [
                {"entity_type": "PHONE_NUMBER", "can_send_message": "LIMITED", "errors": [
                    {"error_code": 138024, "error_description": "Calling cannot use SIP"}]},
                {"entity_type": "WABA", "can_send_message": "BLOCKED", "errors": [
                    {"error_code": 141006, "error_description": "There is an error with the payment method."}]},
                {"entity_type": "BUSINESS", "can_send_message": "LIMITED", "errors": [
                    {"error_code": 141010, "error_description": "Not verified."}]},
            ]}}))

        assert await whatsapp_send_blocker("PN1", "token") == "There is an error with the payment method."

    @pytest.mark.asyncio
    async def test_limited_or_available_is_not_blocked(self, monkeypatch):
        self._health(monkeypatch, (True, {"health_status": {"can_send_message": "LIMITED", "entities": []}}))
        assert await whatsapp_send_blocker("PN1", "token") is None

    @pytest.mark.asyncio
    async def test_blocked_without_a_description_still_says_so(self, monkeypatch):
        self._health(monkeypatch, (True, {"health_status": {"can_send_message": "BLOCKED"}}))
        assert await whatsapp_send_blocker("PN1", "token")

    @pytest.mark.asyncio
    async def test_an_unreadable_status_is_not_a_problem(self, monkeypatch):
        self._health(monkeypatch, (False, {"error": {"message": "Unsupported get request"}}))
        assert await whatsapp_send_blocker("PN1", "token") is None

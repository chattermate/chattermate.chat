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

import base64
import hashlib
import hmac
import json

import pytest
from unittest.mock import MagicMock

from app.channels import get_adapter
from app.channels.email import EmailAdapter, strip_quoted_reply, verify_webhook_token
from app.channels.sms_twilio import TwilioSmsAdapter, verify_twilio_signature
from app.channels.line import LineAdapter


class TestEmailAdapter:
    def test_parse_sendgrid_style(self):
        payload = {
            "from": "Ada Lovelace <ada@example.com>",
            "to": "support@acme.com",
            "subject": "Order issue",
            "text": "My order never arrived.\n\nOn Mon, Jul 7 2026 support wrote:\n> earlier reply",
            "headers": "Message-ID: <abc123@mail.example.com>\nDate: Mon, 7 Jul 2026",
        }
        m = get_adapter("email").parse_inbound(payload)[0]
        assert m.external_conversation_id == "ada@example.com"
        assert m.text == "My order never arrived."
        assert m.profile["subject"] == "Order issue"
        assert m.profile["inbound_message_id"] == "<abc123@mail.example.com>"

    def test_parse_brevo_style(self):
        payload = {
            "From": {"Address": "Ada@Example.com", "Name": "Ada"},
            "Subject": "Hi",
            "RawTextBody": "hello there",
            "MessageId": "<m1@brevo>",
        }
        m = get_adapter("email").parse_inbound(payload)[0]
        assert m.external_conversation_id == "ada@example.com"
        assert m.external_message_id == "<m1@brevo>"

    def test_parse_no_sender_or_body_yields_nothing(self):
        assert get_adapter("email").parse_inbound({"text": "x"}) == []
        assert get_adapter("email").parse_inbound({"from": "a@b.co", "text": "  "}) == []

    def test_all_quoted_body_falls_back_to_raw(self):
        # Over-eager stripping must never drop a message entirely
        m = get_adapter("email").parse_inbound({"from": "a@b.co", "text": "> all quoted"})[0]
        assert m.text == "> all quoted"

    def test_auto_generated_mail_dropped(self):
        payload = {"from": "a@b.co", "text": "I am out of office",
                   "headers": "Auto-Submitted: auto-replied\nMessage-ID: <x@y>"}
        assert get_adapter("email").parse_inbound(payload) == []

    def test_strip_quoted_reply(self):
        text = "New content\n> old line\nOn Tue, someone wrote:\nmore old"
        assert strip_quoted_reply(text) == "New content"

    def test_smtp_config_per_inbox_and_fallback(self):
        import json
        from app.channels.email import smtp_config
        from app.models.channels import ChannelAccount
        from app.core.security import encrypt_api_key
        from app.core.config import settings

        per = ChannelAccount(external_account_id="support@acme.com",
            encrypted_credentials=encrypt_api_key(json.dumps({
                "smtp_host": "smtp.acme.com", "smtp_port": 465,
                "smtp_username": "u", "smtp_password": "p", "from_email": "help@acme.com"})))
        cfg = smtp_config(per)
        assert cfg["host"] == "smtp.acme.com" and cfg["port"] == 465
        assert cfg["use_ssl"] is True and cfg["from_email"] == "help@acme.com"

        fallback = ChannelAccount(external_account_id="x@y.com",
            encrypted_credentials=encrypt_api_key(json.dumps({})))
        cfg2 = smtp_config(fallback)
        assert cfg2["host"] == settings.SMTP_SERVER
        assert cfg2["from_email"] == "x@y.com"  # falls back to the inbox address

    def test_conversation_state(self):
        adapter = EmailAdapter()
        m = adapter.parse_inbound({"from": "a@b.co", "text": "hi", "subject": "S",
                                   "headers": "Message-ID: <x@y>"})[0]
        state = adapter.conversation_state(m)
        assert state == {"last_message_id": "<x@y>", "subject": "S"}

    def test_webhook_token(self):
        account = MagicMock(webhook_secret="tok")
        assert verify_webhook_token(account, "tok") is True
        assert verify_webhook_token(account, "nope") is False
        assert verify_webhook_token(account, "") is False


class TestTwilioAdapter:
    def test_parse_inbound(self):
        m = get_adapter("sms").parse_inbound({
            "From": "+447700900123", "To": "+15551234567",
            "Body": " help please ", "MessageSid": "SM1"})[0]
        assert m.external_conversation_id == "+447700900123"
        assert m.external_account_id == "+15551234567"
        assert m.text == "help please"

    def test_parse_empty_body_ignored(self):
        assert get_adapter("sms").parse_inbound({"From": "+44", "Body": " "}) == []

    def test_signature_roundtrip(self):
        url = "https://x.example/api/v1/webhooks/twilio/abc"
        params = {"From": "+44", "Body": "hi", "MessageSid": "SM1"}
        payload = url + "".join(f"{k}{params[k]}" for k in sorted(params))
        signature = base64.b64encode(
            hmac.new(b"authtok", payload.encode(), hashlib.sha1).digest()).decode()
        assert verify_twilio_signature("authtok", url, params, signature) is True
        assert verify_twilio_signature("authtok", url, params, "bad") is False
        assert verify_twilio_signature("", url, params, signature) is False

    def test_format_outbound_plain_text(self):
        adapter = TwilioSmsAdapter()
        assert adapter.format_outbound("**bold** and __underline__") == "bold and underline"


class TestLineAdapter:
    PAYLOAD = {
        "destination": "Ubot1",
        "events": [{
            "type": "message",
            "timestamp": 1720000000000,
            "source": {"type": "user", "userId": "Ucust9"},
            "message": {"type": "text", "id": "m100", "text": "konnichiwa"},
        }, {
            "type": "follow",
            "source": {"type": "user", "userId": "Ucust9"},
        }],
    }

    def test_parse_inbound(self):
        messages = get_adapter("line").parse_inbound(self.PAYLOAD)
        assert len(messages) == 1
        m = messages[0]
        assert m.external_account_id == "Ubot1"
        assert m.external_conversation_id == "Ucust9"
        assert m.text == "konnichiwa"
        assert m.timestamp.tzinfo is not None

    @pytest.mark.asyncio
    async def test_verify_signature(self, monkeypatch):
        adapter = LineAdapter()
        body = json.dumps(self.PAYLOAD).encode()
        secret = "line-secret"
        signature = base64.b64encode(hmac.new(secret.encode(), body, hashlib.sha256).digest()).decode()
        account = MagicMock()
        monkeypatch.setattr("app.channels.line.credentials", lambda a: {"channel_secret": secret})
        assert await adapter.verify_webhook({"x-line-signature": signature}, body, account) is True
        assert await adapter.verify_webhook({"x-line-signature": "bad"}, body, account) is False
        assert await adapter.verify_webhook({}, body, None) is False

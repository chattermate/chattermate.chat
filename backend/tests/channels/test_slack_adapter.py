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
import time

import pytest

from app.channels import get_adapter
from app.channels.slack import SlackAdapter, verify_slack_signature
from app.core.config import settings


def make_event(event: dict, team_id="T111", event_id="Ev1"):
    return {"type": "event_callback", "team_id": team_id, "event_id": event_id, "event": event}


MENTION_EVENT = make_event({
    "type": "app_mention",
    "user": "U42",
    "text": "<@UBOT> what are your opening hours?",
    "channel": "C9",
    "ts": "1720000000.000100",
})

DM_EVENT = make_event({
    "type": "message",
    "channel_type": "im",
    "user": "U42",
    "text": "hello there",
    "channel": "D7",
    "ts": "1720000001.000200",
})


@pytest.fixture
def adapter():
    return SlackAdapter()


def test_registry_resolves_slack():
    assert isinstance(get_adapter("slack"), SlackAdapter)


def test_parse_mention_threads_conversation(adapter):
    messages = adapter.parse_inbound(MENTION_EVENT)
    assert len(messages) == 1
    m = messages[0]
    assert m.external_account_id == "T111"
    assert m.external_conversation_id == "C9:1720000000.000100"
    assert m.text == "what are your opening hours?"  # mention stripped
    assert m.external_message_id == "Ev1"


def test_parse_mention_reply_keeps_thread(adapter):
    payload = make_event({**MENTION_EVENT["event"], "thread_ts": "1719990000.000001"})
    m = adapter.parse_inbound(payload)[0]
    assert m.external_conversation_id == "C9:1719990000.000001"


def test_parse_dm_uses_channel_as_conversation(adapter):
    m = adapter.parse_inbound(DM_EVENT)[0]
    assert m.external_conversation_id == "D7"
    assert m.text == "hello there"


def test_bot_and_subtype_events_ignored(adapter):
    assert adapter.parse_inbound(make_event({**DM_EVENT["event"], "bot_id": "B1"})) == []
    assert adapter.parse_inbound(make_event({**DM_EVENT["event"], "subtype": "message_changed"})) == []
    assert adapter.parse_inbound(make_event({"type": "reaction_added"})) == []


def test_split_conversation():
    assert SlackAdapter._split_conversation("C9:123.456") == ("C9", "123.456")
    assert SlackAdapter._split_conversation("D7") == ("D7", None)


def test_format_outbound_mrkdwn(adapter):
    assert adapter.format_outbound("**bold** text") == "*bold* text"


class TestSignature:
    def _sign(self, body: bytes, secret: str, ts: str) -> str:
        return "v0=" + hmac.new(secret.encode(), f"v0:{ts}:".encode() + body, hashlib.sha256).hexdigest()

    def test_valid(self, monkeypatch):
        monkeypatch.setattr(settings, "SLACK_SIGNING_SECRET", "sek")
        ts = str(int(time.time()))
        body = b'{"type":"event_callback"}'
        headers = {"x-slack-request-timestamp": ts,
                   "x-slack-signature": self._sign(body, "sek", ts)}
        assert verify_slack_signature(headers, body) is True

    def test_wrong_secret_or_missing(self, monkeypatch):
        monkeypatch.setattr(settings, "SLACK_SIGNING_SECRET", "sek")
        ts = str(int(time.time()))
        body = b"{}"
        assert verify_slack_signature(
            {"x-slack-request-timestamp": ts,
             "x-slack-signature": self._sign(body, "other", ts)}, body) is False
        assert verify_slack_signature({}, body) is False

    def test_replay_rejected(self, monkeypatch):
        monkeypatch.setattr(settings, "SLACK_SIGNING_SECRET", "sek")
        old_ts = str(int(time.time()) - 3600)
        body = b"{}"
        headers = {"x-slack-request-timestamp": old_ts,
                   "x-slack-signature": self._sign(body, "sek", old_ts)}
        assert verify_slack_signature(headers, body) is False

    def test_unconfigured_secret_fails_closed(self, monkeypatch):
        monkeypatch.setattr(settings, "SLACK_SIGNING_SECRET", "")
        assert verify_slack_signature({"x-slack-request-timestamp": "1",
                                       "x-slack-signature": "v0=x"}, b"{}") is False

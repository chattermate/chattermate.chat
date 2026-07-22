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
from unittest.mock import MagicMock

import pytest

from app.api.webhooks.slack import _handle_lifecycle_event
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


class TestLifecycleEvents:
    """app_uninstalled / tokens_revoked must drop the workspace's credentials,
    but only when it's really our bot token that died."""

    @pytest.fixture
    def repo(self):
        repo = MagicMock()
        repo.get_by_external_id.return_value = MagicMock(name="account")
        repo.delete.return_value = True
        return repo

    def test_uninstall_deletes_account(self, repo):
        _handle_lifecycle_event(make_event({"type": "app_uninstalled"}), repo)
        repo.get_by_external_id.assert_called_once_with("slack", "T111")
        repo.delete.assert_called_once()

    def test_bot_token_revoked_deletes_account(self, repo):
        payload = make_event({"type": "tokens_revoked", "tokens": {"bot": ["B123"]}})
        _handle_lifecycle_event(payload, repo)
        repo.delete.assert_called_once()

    def test_user_token_revoke_keeps_account(self, repo):
        """We only ever store a bot token — a user-token revoke leaves the
        workspace working, so deleting it would disconnect a healthy install."""
        payload = make_event({"type": "tokens_revoked", "tokens": {"oauth": ["U123"]}})
        _handle_lifecycle_event(payload, repo)
        repo.delete.assert_not_called()

    def test_unknown_team_is_noop(self, repo):
        repo.get_by_external_id.return_value = None
        _handle_lifecycle_event(make_event({"type": "app_uninstalled"}), repo)
        repo.delete.assert_not_called()

    def test_missing_team_id_is_noop(self, repo):
        payload = make_event({"type": "app_uninstalled"}, team_id="")
        _handle_lifecycle_event(payload, repo)
        repo.get_by_external_id.assert_not_called()
        repo.delete.assert_not_called()

    def test_failed_delete_does_not_raise(self, repo):
        """delete() reports failure by returning False; Slack still needs a 200."""
        repo.delete.return_value = False
        _handle_lifecycle_event(make_event({"type": "app_uninstalled"}), repo)
        repo.delete.assert_called_once()

    def test_lifecycle_events_are_not_messages(self, adapter):
        """They must stay out of the message path — parse_inbound yields nothing,
        which is why the route resolves the team off the envelope instead."""
        assert adapter.parse_inbound(make_event({"type": "app_uninstalled"})) == []
        assert adapter.parse_inbound(make_event({"type": "tokens_revoked"})) == []


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


class TestSlackProfileAndTyping:
    @pytest.mark.asyncio
    async def test_fetch_profile_resolves_real_name(self, adapter, monkeypatch):
        from unittest.mock import AsyncMock, MagicMock
        acc = MagicMock()
        monkeypatch.setattr(adapter, "_access_token", lambda a: "tok")
        monkeypatch.setattr("app.channels.slack.slack_api", AsyncMock(return_value={
            "ok": True, "user": {"real_name": "Ada Lovelace",
                                 "profile": {"display_name": "ada", "email": "ada@acme.com"}}}))
        prof = await adapter.fetch_profile(acc, "U09UPKP7")
        assert prof["name"] == "Ada Lovelace"
        assert prof["email"] == "ada@acme.com"

    @pytest.mark.asyncio
    async def test_fetch_profile_handles_error(self, adapter, monkeypatch):
        from unittest.mock import AsyncMock, MagicMock
        monkeypatch.setattr(adapter, "_access_token", lambda a: "tok")
        monkeypatch.setattr("app.channels.slack.slack_api",
                            AsyncMock(return_value={"ok": False, "error": "missing_scope"}))
        assert await adapter.fetch_profile(MagicMock(), "U0") == {}

    @pytest.mark.asyncio
    async def test_typing_placeholder_then_edit(self, adapter, monkeypatch):
        from unittest.mock import AsyncMock, MagicMock
        import app.channels.slack as slk
        acc = MagicMock(); acc.id = "acc1"
        conv = MagicMock(external_conversation_id="D7")
        monkeypatch.setattr(adapter, "_access_token", lambda a: "tok")
        calls = []
        async def fake_api(method, token, payload):
            calls.append((method, payload))
            if method == "chat.postMessage":
                return {"ok": True, "ts": "111.222"}
            if method == "chat.update":
                return {"ok": True, "ts": payload["ts"]}
            return {"ok": False}
        monkeypatch.setattr(slk, "slack_api", fake_api)

        await adapter.send_typing(acc, conv)         # posts placeholder
        result = await adapter.send_text(acc, conv, "Here is your answer")  # edits it
        assert result.ok and result.external_message_id == "111.222"
        methods = [m for m, _ in calls]
        assert methods == ["chat.postMessage", "chat.update"]  # not a second post
        # placeholder consumed
        assert slk._typing_placeholders.get(("acc1", "D7")) is None

    @pytest.mark.asyncio
    async def test_placeholder_deleted_when_update_fails(self, adapter, monkeypatch):
        """When chat.update fails, the stale '_typing…_' is deleted and a fresh
        message is posted — no dangling placeholder beside the reply."""
        from unittest.mock import MagicMock
        import app.channels.slack as slk
        acc = MagicMock(); acc.id = "acc9"
        conv = MagicMock(external_conversation_id="D9")
        monkeypatch.setattr(adapter, "_access_token", lambda a: "tok")
        calls = []
        async def fake_api(method, token, payload):
            calls.append((method, payload))
            if method == "chat.postMessage":
                return {"ok": True, "ts": "555.666"}
            if method == "chat.update":
                return {"ok": False, "error": "cant_update_message"}
            return {"ok": True}
        monkeypatch.setattr(slk, "slack_api", fake_api)

        await adapter.send_typing(acc, conv)
        result = await adapter.send_text(acc, conv, "The answer")
        methods = [m for m, _ in calls]
        assert methods == ["chat.postMessage", "chat.update", "chat.delete", "chat.postMessage"]
        assert result.ok
        assert slk._typing_placeholders.get(("acc9", "D9")) is None

    def test_prune_placeholders_drops_stale(self, monkeypatch):
        import app.channels.slack as slk
        slk._typing_placeholders.clear()
        slk._typing_placeholders[("a", "c1")] = ("1.1", 1000.0)
        slk._typing_placeholders[("a", "c2")] = ("2.2", 1000.0 + slk._PLACEHOLDER_TTL_SECONDS + 1)
        slk._prune_placeholders(1000.0 + slk._PLACEHOLDER_TTL_SECONDS + 2)
        assert ("a", "c1") not in slk._typing_placeholders  # stale, pruned
        assert ("a", "c2") in slk._typing_placeholders       # fresh, kept
        slk._typing_placeholders.clear()

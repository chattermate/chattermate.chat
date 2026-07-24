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
from unittest.mock import AsyncMock, MagicMock

import pytest

import app.api.webhooks.slack as slack_webhook
import app.services.slack_events as slack_events
from app.api.webhooks.slack import _handle_lifecycle_event
from app.channels import get_adapter
from app.channels.slack import SlackAdapter, build_home_view, verify_slack_signature
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


def test_parse_dm_with_thread_keys_by_thread(adapter):
    """Assistant-sidebar messages are DMs carrying the assistant thread ts — they
    key by thread so the reply posts back into that thread."""
    ev = make_event({"type": "message", "channel_type": "im", "user": "U42",
                     "text": "hi", "channel": "D7", "ts": "1720000002.0003",
                     "thread_ts": "1719999999.0001"})
    m = adapter.parse_inbound(ev)[0]
    assert m.external_conversation_id == "D7:1719999999.0001"


DASH = "https://app.chattermate.chat"


class TestHomeView:
    def test_intro_and_dashboard_link_always_present(self):
        import json
        blob = json.dumps(build_home_view(None, DASH))
        assert "AI customer support" in blob   # what it does, up top
        assert DASH in blob                     # dashboard link
        assert "How to use me" in blob

    def test_no_agent_shows_connect_prompt(self):
        import json
        v = build_home_view(None, DASH)
        assert v["type"] == "home"
        assert "No agent connected" in json.dumps(v)

    def test_connected_agent_card_and_truncation(self):
        import json
        v = build_home_view({"name": "Support", "is_active": True,
                             "instruction": "x" * 300, "photo_url": None}, DASH)
        blob = json.dumps(v)
        assert "Connected agent" in blob and "Support" in blob
        section_texts = [b["text"]["text"] for b in v["blocks"] if b.get("type") == "section"]
        long_text = next(t for t in section_texts if t.startswith("x"))
        assert long_text.endswith("…") and len(long_text) <= 250


class TestAppSurfaceDispatch:
    """Webhook fan-out: the right event schedules the right background handler."""

    def _repo(self, active=True):
        account = MagicMock(); account.id = "acc1"; account.is_active = active
        repo = MagicMock(); repo.get_by_external_id.return_value = account
        return repo

    def test_messages_tab_open_schedules_welcome(self):
        bg = MagicMock()
        slack_webhook._dispatch_app_surface_event(
            {"type": "app_home_opened", "user": "U1", "channel": "D1", "tab": "messages"},
            "T1", self._repo(), bg)
        args = bg.add_task.call_args[0]
        assert args[0] is slack_webhook.deliver_home_welcome
        assert args[1:] == ("acc1", "U1", "D1")

    def test_missing_tab_defaults_to_welcome(self):
        bg = MagicMock()
        slack_webhook._dispatch_app_surface_event(
            {"type": "app_home_opened", "user": "U1", "channel": "D1"}, "T1", self._repo(), bg)
        assert bg.add_task.call_args[0][0] is slack_webhook.deliver_home_welcome

    def test_home_tab_open_schedules_home_publish(self):
        bg = MagicMock()
        slack_webhook._dispatch_app_surface_event(
            {"type": "app_home_opened", "user": "U1", "tab": "home"}, "T1", self._repo(), bg)
        args = bg.add_task.call_args[0]
        assert args[0] is slack_webhook.publish_agent_home and args[1:] == ("acc1", "U1")

    def test_assistant_started_schedules_handler(self):
        bg = MagicMock()
        slack_webhook._dispatch_app_surface_event(
            {"type": "assistant_thread_started",
             "assistant_thread": {"channel_id": "D2", "thread_ts": "111.222"}},
            "T1", self._repo(), bg)
        args = bg.add_task.call_args[0]
        assert args[0] is slack_webhook.handle_assistant_thread_started
        assert args[1:] == ("acc1", "D2", "111.222")

    def test_context_changed_is_noop(self):
        bg = MagicMock()
        slack_webhook._dispatch_app_surface_event(
            {"type": "assistant_thread_context_changed"}, "T1", self._repo(), bg)
        bg.add_task.assert_not_called()

    def test_inactive_team_is_noop(self):
        bg = MagicMock()
        slack_webhook._dispatch_app_surface_event(
            {"type": "app_home_opened", "user": "U1", "tab": "messages"},
            "T1", self._repo(active=False), bg)
        bg.add_task.assert_not_called()

    def test_missing_team_id_is_noop(self):
        bg = MagicMock()
        slack_webhook._dispatch_app_surface_event(
            {"type": "app_home_opened", "user": "U1"}, "", self._repo(), bg)
        bg.add_task.assert_not_called()


class TestHomeWelcomeDelivery:
    def _patch_common(self, monkeypatch):
        db = MagicMock()
        monkeypatch.setattr(slack_events, "SessionLocal", lambda: db)
        account = MagicMock(); account.is_active = True
        repo = MagicMock(); repo.get_by_id.return_value = account
        monkeypatch.setattr(slack_events, "ChannelAccountRepository", lambda d: repo)
        monkeypatch.setattr(slack_events, "_assigned_agent", lambda d, a: None)
        monkeypatch.setattr(slack_events.SlackAdapter, "_access_token", staticmethod(lambda a: "tok"))
        api = AsyncMock()
        monkeypatch.setattr(slack_events, "slack_api", api)
        return api

    @pytest.mark.asyncio
    async def test_welcome_sent_once(self, monkeypatch):
        api = self._patch_common(monkeypatch)
        redis = MagicMock()
        redis.set.side_effect = [True, None]  # first claims the slot, second is taken
        monkeypatch.setattr(slack_events, "get_redis", lambda: redis)

        await slack_events.deliver_home_welcome("acc1", "U1", "D1")
        await slack_events.deliver_home_welcome("acc1", "U1", "D1")

        assert api.await_count == 1
        assert api.await_args[0][0] == "chat.postMessage"
        assert api.await_args[0][2]["channel"] == "D1"

    @pytest.mark.asyncio
    async def test_no_channel_no_send(self, monkeypatch):
        api = self._patch_common(monkeypatch)
        monkeypatch.setattr(slack_events, "get_redis", lambda: None)
        await slack_events.deliver_home_welcome("acc1", "U1", "")
        api.assert_not_awaited()

    @pytest.mark.asyncio
    async def test_assistant_started_sets_status_prompts_and_welcome(self, monkeypatch):
        self._patch_common(monkeypatch)
        status = AsyncMock(); prompts = AsyncMock()
        monkeypatch.setattr(slack_events, "set_assistant_status", status)
        monkeypatch.setattr(slack_events, "set_suggested_prompts", prompts)
        api = AsyncMock()
        monkeypatch.setattr(slack_events, "slack_api", api)

        await slack_events.handle_assistant_thread_started("acc1", "D2", "111.222")

        status.assert_awaited_once()
        prompts.assert_awaited_once()
        api.assert_awaited_once()
        assert api.await_args[0][0] == "chat.postMessage"
        assert api.await_args[0][2].get("thread_ts") == "111.222"

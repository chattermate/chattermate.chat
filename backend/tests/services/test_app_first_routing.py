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

App-first routing: an installed extension may answer a channel message
before the AI does, and hears about every inbound message.
"""

import asyncio
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.channels import get_adapter
from app.channels.app_hooks import (
    EventKind, HandledBy, register_event_listener, register_inbound_handler,
)
from app.channels.base import InboundMessage
from app.models.channels import ChannelConversation
from app.models.chat_history import ChatHistory
from app.models.session_to_agent import SessionToAgent, SessionStatus
from app.repositories.channels import AgentChannelConfigRepository, ChannelAccountRepository
from app.repositories.chat import ChatRepository
from app.services import agent_rooms, app_first_routing, channel_chat
from app.services.channel_chat import process_channel_message
from app.services.chat_notifications import notify_new_channel_chat_once
from app.services.message_delivery import DeliveryResult
from tests.socket_db import serve_session_off_loop


def _inbound(text="present", wamid="wamid.IN1"):
    return InboundMessage(external_account_id="PN123", external_conversation_id="447",
                          external_user_id="447", external_message_id=wamid, text=text,
                          profile={"phone": "447"})


@pytest.fixture
def account(db, test_organization, test_agent):
    account = ChannelAccountRepository(db).create_account(
        organization_id=test_organization.id, channel_type="whatsapp",
        external_account_id="PN123", credentials={"access_token": "tok"}, display_name="+1 555")
    AgentChannelConfigRepository(db).set_agent(account.id, test_agent.id)
    return account


@pytest.fixture
def use_test_db(db, monkeypatch):
    serve_session_off_loop(monkeypatch, channel_chat, db)
    return db


@pytest.fixture
def quiet_channel(monkeypatch):
    """No real Graph calls, sockets or pushes."""
    adapter = get_adapter("whatsapp")
    monkeypatch.setattr(adapter, "mark_read", AsyncMock())
    monkeypatch.setattr(adapter, "send_typing", AsyncMock())
    sio = MagicMock()
    sio.emit = AsyncMock()
    monkeypatch.setattr(agent_rooms, "sio", sio)
    notify = AsyncMock()
    monkeypatch.setattr("app.services.chat_notifications.notify_new_chat", notify)
    return SimpleNamespace(adapter=adapter, sio=sio, notify=notify)


@pytest.fixture
def events():
    seen = []

    async def listen(event):
        seen.append(event)
    register_event_listener(listen)
    return seen


def _fake_agent(order=None):
    agent = MagicMock()
    agent.last_bot_message_id = None
    agent.safe_cleanup_mcp_tools = AsyncMock()

    async def respond(**kwargs):
        if order is not None:
            order.append("ai")
        return SimpleNamespace(message="Noted", transfer_to_human=False,
                               end_chat=False, request_lead_capture=False)
    agent.get_response = AsyncMock(side_effect=respond)
    return agent


@pytest.mark.asyncio
async def test_a_message_the_app_handles_never_reaches_the_ai(
        db, account, use_test_db, test_ai_config, quiet_channel, events):
    register_inbound_handler(AsyncMock(return_value=True))

    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock()) as create_async, \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock()) as deliver:
        await process_channel_message(account.id, _inbound())

    create_async.assert_not_awaited()
    deliver.assert_not_awaited()
    quiet_channel.notify.assert_not_awaited()  # the team isn't needed
    quiet_channel.adapter.mark_read.assert_awaited_once_with(account, "wamid.IN1")
    stored = db.query(ChatHistory).filter_by(message_type="user").one()
    assert stored.message == "present"
    assert [(e.kind, e.handled_by) for e in events] == [(EventKind.INBOUND, HandledBy.APP)]
    assert events[0].event_id == f"{account.id}:wamid.IN1"


@pytest.mark.asyncio
async def test_the_app_gets_plain_ids_and_the_message(db, account, use_test_db, quiet_channel):
    handler = AsyncMock(return_value=True)
    register_inbound_handler(handler)

    await process_channel_message(account.id, _inbound())

    context = handler.await_args.args[0]
    assert context.channel_account_id == account.id
    assert context.organization_id == account.organization_id
    assert context.inbound.external_message_id == "wamid.IN1"
    assert context.received_at.tzinfo is not None


@pytest.mark.asyncio
async def test_the_apps_reply_sorts_after_the_message_it_answers(
        db, account, use_test_db, quiet_channel):
    """The app usually replies while we're still waiting on it, so its reply
    is stored first; the customer's message keeps its arrival time and still
    reads before it."""
    async def replies_during_the_call(context):
        await asyncio.sleep(0.01)
        ChatRepository(db).create_message({
            "message": "Marked present", "message_type": "bot",
            "session_id": context.session_id, "organization_id": str(context.organization_id),
            "created_at": datetime.now(timezone.utc),
            "attributes": {"source": "app"},
        })
        return True
    register_inbound_handler(replies_during_the_call)

    await process_channel_message(account.id, _inbound())

    session = db.query(SessionToAgent).one()
    history = await ChatRepository(db).get_session_history(session.session_id)
    assert [m.message for m in history] == ["present", "Marked present"]


@pytest.mark.asyncio
@pytest.mark.parametrize("handler", [
    AsyncMock(return_value=False),
    AsyncMock(side_effect=RuntimeError("partner down")),
])
async def test_not_handled_or_failing_falls_back_to_the_ai(
        db, account, use_test_db, test_ai_config, quiet_channel, events, handler):
    register_inbound_handler(handler)
    order = []

    async def record_event(event):
        order.append(event.handled_by.value)
    register_event_listener(record_event)

    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=_fake_agent(order))), \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock(return_value=DeliveryResult(ok=True))):
        await process_channel_message(account.id, _inbound())

    # The inbound event (handled by the AI) goes out before the AI runs
    assert order == ["ai", "ai"]
    quiet_channel.notify.assert_awaited_once()


@pytest.mark.asyncio
async def test_an_app_that_does_not_answer_in_time_is_skipped(
        db, account, use_test_db, test_ai_config, quiet_channel, events, monkeypatch):
    monkeypatch.setattr(app_first_routing, "APP_HANDLER_TIMEOUT_SECONDS", 0.01)

    async def hangs(context):
        await asyncio.sleep(5)
        return True
    register_inbound_handler(hangs)

    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=_fake_agent())) as create_async, \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock(return_value=DeliveryResult(ok=True))):
        await process_channel_message(account.id, _inbound())

    create_async.assert_awaited_once()
    assert events[0].handled_by == HandledBy.AI


@pytest.mark.asyncio
async def test_a_chat_a_human_holds_is_never_offered_to_the_app(
        db, account, use_test_db, quiet_channel, events, test_user):
    handler = AsyncMock(return_value=True)
    register_inbound_handler(handler)
    await process_channel_message(account.id, _inbound(wamid="wamid.A"))  # app takes the first
    session = db.query(SessionToAgent).one()
    session.user_id = test_user.id
    db.commit()

    await process_channel_message(account.id, _inbound(wamid="wamid.B"))

    handler.assert_awaited_once()  # only for the first
    assert events[-1].handled_by == HandledBy.HUMAN


@pytest.mark.asyncio
async def test_a_human_only_agent_still_lets_the_app_go_first(
        db, account, use_test_db, quiet_channel, test_agent):
    test_agent.ai_replies_enabled = False
    db.commit()
    handler = AsyncMock(return_value=True)
    register_inbound_handler(handler)

    await process_channel_message(account.id, _inbound())

    handler.assert_awaited_once()


@pytest.mark.asyncio
async def test_the_team_is_told_once_when_the_thread_first_needs_them(
        db, account, use_test_db, test_ai_config, quiet_channel):
    answers = iter([True, False, False])
    register_inbound_handler(AsyncMock(side_effect=lambda ctx: next(answers)))

    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(side_effect=lambda **_: _fake_agent())), \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock(return_value=DeliveryResult(ok=True))):
        await process_channel_message(account.id, _inbound(wamid="wamid.A"))  # app
        quiet_channel.notify.assert_not_awaited()
        await process_channel_message(account.id, _inbound(wamid="wamid.B"))  # AI
        await process_channel_message(account.id, _inbound(wamid="wamid.C"))  # AI again

    quiet_channel.notify.assert_awaited_once()
    conversation = db.query(ChannelConversation).one()
    assert conversation.extra["team_notified"] is True


@pytest.mark.asyncio
async def test_threads_from_before_the_flag_existed_are_never_announced_again(
        db, account, use_test_db, test_ai_config, quiet_channel):
    """They were announced when created; the next message must not page the team."""
    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(side_effect=lambda **_: _fake_agent())), \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock(return_value=DeliveryResult(ok=True))):
        await process_channel_message(account.id, _inbound(wamid="wamid.A"))
        conversation = db.query(ChannelConversation).one()
        conversation.extra = {}  # as stored before this change
        db.commit()
        quiet_channel.notify.reset_mock()

        await process_channel_message(account.id, _inbound(wamid="wamid.B"))

    quiet_channel.notify.assert_not_awaited()


@pytest.mark.asyncio
async def test_a_thread_a_human_already_holds_is_marked_without_paging(
        db, account, use_test_db, quiet_channel, test_user):
    register_inbound_handler(AsyncMock(return_value=True))
    await process_channel_message(account.id, _inbound(wamid="wamid.A"))  # app answers; flag still False
    session = db.query(SessionToAgent).one()
    session.user_id = test_user.id
    db.commit()

    await process_channel_message(account.id, _inbound(wamid="wamid.B"))

    quiet_channel.notify.assert_not_awaited()
    assert db.query(ChannelConversation).one().extra["team_notified"] is True


@pytest.mark.asyncio
async def test_only_one_of_two_racing_first_messages_pages_the_team(db, account, quiet_channel):
    """The flag is claimed under the row lock: the second claimant sees True."""
    conversation = SimpleNamespace(id=None, extra={"team_notified": False})
    repo = MagicMock()
    repo.return_value.merge_extra.side_effect = [{"team_notified": False}, {"team_notified": True}]
    session = SimpleNamespace(user_id=None)
    with patch("app.services.chat_notifications.ChannelConversationRepository", repo):
        await notify_new_channel_chat_once(db, session, conversation)
        await notify_new_channel_chat_once(db, session, conversation)

    quiet_channel.notify.assert_awaited_once()


@pytest.mark.asyncio
@pytest.mark.parametrize("answer", ["true", 1, None, {"handled": True}])
async def test_only_an_exact_true_counts_as_handled(
        db, account, use_test_db, test_ai_config, quiet_channel, answer):
    register_inbound_handler(AsyncMock(return_value=answer))

    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=_fake_agent())) as create_async, \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock(return_value=DeliveryResult(ok=True))):
        await process_channel_message(account.id, _inbound())

    create_async.assert_awaited_once()


@pytest.mark.asyncio
async def test_the_message_is_announced_even_when_no_ai_can_answer(
        db, account, use_test_db, quiet_channel, events):
    """No AI config: the message is dropped, but the app still hears it."""
    await process_channel_message(account.id, _inbound())

    assert [(e.kind, e.handled_by) for e in events] == [(EventKind.INBOUND, HandledBy.AI)]


@pytest.mark.asyncio
async def test_the_app_and_the_event_share_the_message_id(db, account, use_test_db, quiet_channel, events):
    handler = AsyncMock(return_value=True)
    register_inbound_handler(handler)

    await process_channel_message(account.id, _inbound())

    assert handler.await_args.args[0].event_id == events[0].event_id


# --- Codes and keywords the business answers itself (register_text_handler) ------------------------

@pytest.mark.asyncio
async def test_a_text_handler_answers_without_the_ai(
        db, account, use_test_db, test_ai_config, quiet_channel, events):
    from app.channels.app_hooks import register_text_handler
    register_text_handler(AsyncMock(return_value="You're on the list."))
    app = AsyncMock(return_value=True)
    register_inbound_handler(app)

    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock()) as create_async, \
         patch.object(channel_chat, "notify_customer", AsyncMock()) as notify:
        await process_channel_message(account.id, _inbound("Notify me. Ref BIS-1-abc"))

    create_async.assert_not_awaited()
    app.assert_not_awaited()
    notify.assert_awaited_once()
    assert notify.await_args.args[2] == "You're on the list."
    assert db.query(ChatHistory).filter_by(message_type="user").one().message == "Notify me. Ref BIS-1-abc"
    assert [(e.kind, e.handled_by) for e in events] == [(EventKind.INBOUND, HandledBy.APP)]


@pytest.mark.asyncio
async def test_a_text_handler_answers_even_when_a_human_holds_the_chat(
        db, account, use_test_db, quiet_channel, test_user):
    from app.channels.app_hooks import register_text_handler
    register_text_handler(AsyncMock(return_value=""))
    await process_channel_message(account.id, _inbound("first"))
    session = db.query(SessionToAgent).one()
    session.user_id = test_user.id
    db.commit()

    with patch.object(channel_chat, "notify_customer", AsyncMock()) as notify, \
         patch.object(channel_chat, "relay_stored_message", AsyncMock()):
        await process_channel_message(account.id, _inbound("BIS-1-abc", "wamid.IN2"))
    notify.assert_not_awaited()  # "" is handled with nothing to say


@pytest.mark.asyncio
@pytest.mark.parametrize("handler", [
    AsyncMock(return_value=None),
    AsyncMock(side_effect=RuntimeError("store down")),
])
async def test_a_text_handler_that_passes_or_fails_leaves_it_to_the_ai(
        db, account, use_test_db, test_ai_config, quiet_channel, handler):
    from app.channels.app_hooks import register_text_handler
    register_text_handler(handler)
    fake = _fake_agent()
    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake)), \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock(return_value=DeliveryResult(ok=True))):
        await process_channel_message(account.id, _inbound("hello"))
    fake.get_response.assert_awaited()


@pytest.mark.asyncio
async def test_a_slow_text_handler_is_skipped(db, account, use_test_db, monkeypatch):
    from app.channels.app_hooks import register_text_handler
    monkeypatch.setattr(app_first_routing, "TEXT_HANDLER_TIMEOUT_SECONDS", 0.01)

    async def slow(context):
        await asyncio.sleep(1)
        return "late"
    register_text_handler(slow)
    second = AsyncMock(return_value="second")
    register_text_handler(second)
    session = SimpleNamespace(session_id="s1")
    reply = await app_first_routing.text_reply(db, account, session, "c1", _inbound(), datetime.now(timezone.utc))
    assert reply == "second"


@pytest.mark.asyncio
async def test_a_marketing_template_may_start_a_thread_the_customer_asked_for(db, account, monkeypatch):
    """A back-in-stock sign-up: the customer wrote first, asking for exactly this."""
    from app.services import whatsapp_outbound
    template = {"name": "back_in_stock", "language": "en", "status": "APPROVED", "category": "MARKETING",
                "components": [{"type": "BODY", "text": "{{1}} is back"}]}
    monkeypatch.setattr(whatsapp_outbound, "fetch_message_templates", AsyncMock(return_value=(True, [template])))
    monkeypatch.setattr(ChannelAccountRepository, "get_credentials",
                        lambda self, a: {"waba_id": "W1", "access_token": "tok"})
    with pytest.raises(whatsapp_outbound.OutboundError, match="Marketing"):
        await whatsapp_outbound._approved_outbound_template(db, account, "back_in_stock", "en",
                                                            starts_conversation=True)
    found = await whatsapp_outbound._approved_outbound_template(db, account, "back_in_stock", "en",
                                                                starts_conversation=True, customer_asked=True)
    assert found["name"] == "back_in_stock"

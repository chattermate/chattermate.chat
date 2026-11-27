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

STOP and START on a business number, taps on buttons the business owns,
and the opt-out check on every business-initiated send.
"""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.channels import get_adapter
from app.channels.app_hooks import (
    EventKind, HandledBy, InboundContext, register_button_handler, register_event_listener,
    register_inbound_handler,
)
from app.channels.base import InboundMessage, InteractiveReply, InteractiveReplyType, SendResult
from app.models.channels import ChannelOptOut, OptOutSource
from app.models.chat_history import ChatHistory
from app.models.session_to_agent import SessionToAgent
from app.repositories.channels import (
    AgentChannelConfigRepository, ChannelAccountRepository, ChannelOptOutRepository,
)
from app.services import agent_rooms, app_first_routing, channel_chat, channel_opt_outs, whatsapp_outbound
from app.services.channel_chat import process_channel_message
from app.services.message_delivery import DeliveryResult
from tests.session_db import serve_session_off_loop

CUSTOMER = "447700900123"
CONTACT = "+447700900123"


def _inbound(text=None, wamid="wamid.IN1", tap=None):
    return InboundMessage(external_account_id="PN123", external_conversation_id=CUSTOMER,
                          external_user_id=CUSTOMER, external_message_id=wamid, text=text,
                          profile={"phone": CUSTOMER}, interactive=tap)


def _tap(payload, title="Confirm"):
    return InteractiveReply(type=InteractiveReplyType.TEMPLATE_BUTTON, id=payload, title=title)


@pytest.fixture
def account(db, test_organization, test_agent):
    account = ChannelAccountRepository(db).create_account(
        organization_id=test_organization.id, channel_type="whatsapp",
        external_account_id="PN123", credentials={"access_token": "tok", "waba_id": "W1"},
        display_name="+1 555")
    AgentChannelConfigRepository(db).set_agent(account.id, test_agent.id)
    return account


@pytest.fixture
def use_test_db(db, monkeypatch):
    serve_session_off_loop(monkeypatch, channel_chat, db)
    return db


@pytest.fixture
def quiet_channel(monkeypatch):
    adapter = get_adapter("whatsapp")
    monkeypatch.setattr(adapter, "mark_read", AsyncMock())
    monkeypatch.setattr(adapter, "send_typing", AsyncMock())
    sio = MagicMock()
    sio.emit = AsyncMock()
    monkeypatch.setattr(agent_rooms, "sio", sio)
    monkeypatch.setattr("app.services.chat_notifications.notify_new_chat", AsyncMock())
    return adapter


@pytest.fixture
def events():
    seen = []

    async def listen(event):
        seen.append(event)
    register_event_listener(listen)
    return seen


@pytest.fixture
def replies(monkeypatch):
    notify = AsyncMock()
    monkeypatch.setattr(channel_chat, "notify_customer", notify)
    return notify


@pytest.fixture
def no_ai():
    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock()) as create_async:
        yield create_async


def _said(replies):
    return [call.args[2] for call in replies.await_args_list]


# --- STOP and START -------------------------------------------------------------------------------

@pytest.mark.asyncio
@pytest.mark.parametrize("text", ["STOP", "stop", "Stop.", "  stop updates! ", "Unsubscribe"])
async def test_stop_opts_the_number_out_without_the_ai(
        db, account, use_test_db, test_ai_config, quiet_channel, replies, no_ai, events, text):
    app = AsyncMock(return_value=True)
    register_inbound_handler(app)

    await process_channel_message(account.id, _inbound(text))

    row = db.query(ChannelOptOut).one()
    assert (row.contact, row.source, row.channel_account_id) == (CONTACT, OptOutSource.STOP_WORD, account.id)
    assert _said(replies) == [channel_opt_outs.STOPPED_REPLY]
    no_ai.assert_not_awaited()
    app.assert_not_awaited()
    # Kept in the conversation like any message the business answered itself
    assert db.query(ChatHistory).filter_by(message_type="user").one().message == text
    assert [(e.kind, e.handled_by) for e in events] == [(EventKind.INBOUND, HandledBy.APP)]


@pytest.mark.asyncio
@pytest.mark.parametrize("text", ["please stop sending me the wrong size", "stopped", "don't stop", "start"])
async def test_other_messages_with_the_words_are_ordinary(
        db, account, use_test_db, test_ai_config, quiet_channel, text):
    fake = MagicMock()
    fake.last_bot_message_id = None
    fake.safe_cleanup_mcp_tools = AsyncMock()
    fake.get_response = AsyncMock(return_value=SimpleNamespace(
        message="Sure", transfer_to_human=False, end_chat=False, request_lead_capture=False))
    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake)), \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock(return_value=DeliveryResult(ok=True))):
        await process_channel_message(account.id, _inbound(text))
    fake.get_response.assert_awaited()
    assert db.query(ChannelOptOut).count() == 0


@pytest.mark.asyncio
async def test_start_turns_updates_back_on(db, account, use_test_db, quiet_channel, replies, no_ai):
    await process_channel_message(account.id, _inbound("STOP"))
    await process_channel_message(account.id, _inbound("Start", "wamid.IN2"))

    assert db.query(ChannelOptOut).count() == 0
    assert _said(replies) == [channel_opt_outs.STOPPED_REPLY, channel_opt_outs.STARTED_REPLY]
    no_ai.assert_not_awaited()


@pytest.mark.asyncio
async def test_a_second_stop_keeps_the_first(db, account, use_test_db, quiet_channel, replies, no_ai):
    await process_channel_message(account.id, _inbound("STOP"))
    first = db.query(ChannelOptOut).one().opted_out_at
    await process_channel_message(account.id, _inbound("stop", "wamid.IN2"))
    assert db.query(ChannelOptOut).one().opted_out_at == first
    assert _said(replies) == [channel_opt_outs.STOPPED_REPLY] * 2


@pytest.mark.asyncio
async def test_the_stop_updates_button_opts_out(db, account, use_test_db, quiet_channel, replies, no_ai):
    await process_channel_message(account.id, _inbound("Stop updates", tap=_tap("optout:stop", "Stop updates")))
    assert db.query(ChannelOptOut).one().source == OptOutSource.BUTTON
    assert _said(replies) == [channel_opt_outs.STOPPED_REPLY]


@pytest.mark.asyncio
async def test_stop_works_while_a_person_holds_the_chat(
        db, account, use_test_db, quiet_channel, replies, test_user):
    with patch.object(channel_chat, "relay_stored_message", AsyncMock()):
        await process_channel_message(account.id, _inbound("hello"))
        session = db.query(SessionToAgent).one()
        session.user_id = test_user.id
        db.commit()
        await process_channel_message(account.id, _inbound("STOP", "wamid.IN2"))
    assert db.query(ChannelOptOut).count() == 1
    assert channel_opt_outs.STOPPED_REPLY in _said(replies)


@pytest.mark.asyncio
async def test_stop_on_one_number_leaves_the_others(db, account, test_organization, use_test_db,
                                                    quiet_channel, replies, test_agent):
    other = ChannelAccountRepository(db).create_account(
        organization_id=test_organization.id, channel_type="whatsapp",
        external_account_id="PN999", credentials={"access_token": "tok"}, display_name="+1 556")
    await process_channel_message(account.id, _inbound("STOP"))
    repo = ChannelOptOutRepository(db)
    assert repo.is_opted_out(account.id, CONTACT)
    assert not repo.is_opted_out(other.id, CONTACT)


@pytest.mark.asyncio
async def test_listeners_hear_each_change_and_a_failing_one_is_skipped(
        db, account, use_test_db, quiet_channel, replies):
    heard = []

    def broken(db_, account_, contact, opted_out):
        raise RuntimeError("boom")
    channel_opt_outs.register_opt_out_listener(broken)
    channel_opt_outs.register_opt_out_listener(
        lambda db_, account_, contact, opted_out: heard.append((account_.id, contact, opted_out)))

    await process_channel_message(account.id, _inbound("STOP"))
    await process_channel_message(account.id, _inbound("START", "wamid.IN2"))

    assert heard == [(account.id, CONTACT, True), (account.id, CONTACT, False)]
    assert db.query(ChannelOptOut).count() == 0


def test_other_channels_never_treat_stop_as_an_opt_out(db, test_organization):
    telegram = ChannelAccountRepository(db).create_account(
        organization_id=test_organization.id, channel_type="telegram",
        external_account_id="bot1", credentials={"bot_token": "t"}, display_name="bot")
    assert channel_opt_outs.opt_out_reply(db, telegram, _inbound("STOP")) is None


def test_the_repository_reads_a_batch_of_contacts(db, account):
    repo = ChannelOptOutRepository(db)
    repo.opt_out(account, CONTACT, OptOutSource.STOP_WORD)
    assert repo.opted_out_of(account.id, [CONTACT, "+19990000000"]) == {CONTACT}


MX_WA_ID = "5215512345678"
MX_WRITTEN = "+525512345678"


@pytest.mark.asyncio
async def test_a_stop_from_a_wa_id_covers_the_number_as_written(
        db, account, use_test_db, quiet_channel, replies, no_ai):
    await process_channel_message(account.id, InboundMessage(
        external_account_id="PN123", external_conversation_id=MX_WA_ID, external_user_id=MX_WA_ID,
        external_message_id="wamid.MX", text="STOP", profile={"phone": MX_WA_ID}))
    assert channel_opt_outs.is_opted_out(db, account, MX_WRITTEN)
    assert channel_opt_outs.is_opted_out(db, account, "+" + MX_WA_ID)


@pytest.mark.asyncio
async def test_start_from_either_form_clears_the_stop(db, account, use_test_db, quiet_channel, replies, no_ai):
    ChannelOptOutRepository(db).opt_out(account, MX_WRITTEN, OptOutSource.STOP_WORD)
    await process_channel_message(account.id, InboundMessage(
        external_account_id="PN123", external_conversation_id=MX_WA_ID, external_user_id=MX_WA_ID,
        external_message_id="wamid.MX2", text="START", profile={"phone": MX_WA_ID}))
    assert not channel_opt_outs.is_opted_out(db, account, MX_WRITTEN)
    assert channel_opt_outs.STARTED_REPLY in _said(replies)


# --- Buttons the business owns (register_button_handler) -------------------------------------------

@pytest.mark.asyncio
async def test_a_claimed_tap_goes_to_its_handler_only(
        db, account, use_test_db, test_ai_config, quiet_channel, replies, no_ai, events):
    seen = []

    async def handler(context: InboundContext):
        seen.append(context.inbound.interactive.id)
        return "Thanks, your order is confirmed"
    register_button_handler("cod", handler)
    app = AsyncMock(return_value=True)
    register_inbound_handler(app)

    await process_channel_message(account.id, _inbound("Confirm", tap=_tap("cod:confirm:tok123")))

    assert seen == ["cod:confirm:tok123"]
    assert _said(replies) == ["Thanks, your order is confirmed"]
    no_ai.assert_not_awaited()
    app.assert_not_awaited()
    assert [(e.kind, e.handled_by) for e in events] == [(EventKind.INBOUND, HandledBy.APP)]


@pytest.mark.asyncio
async def test_a_claimed_tap_works_while_a_person_holds_the_chat(
        db, account, use_test_db, quiet_channel, replies, test_user):
    handler = AsyncMock(return_value="")
    register_button_handler("cod", handler)
    with patch.object(channel_chat, "relay_stored_message", AsyncMock()):
        await process_channel_message(account.id, _inbound("hello"))
        session = db.query(SessionToAgent).one()
        session.user_id = test_user.id
        db.commit()
        await process_channel_message(account.id, _inbound("Cancel", "wamid.IN2", tap=_tap("cod:cancel:t")))
    handler.assert_awaited_once()
    assert _said(replies) == []  # "" claims it with nothing to say


@pytest.mark.asyncio
@pytest.mark.parametrize("handler", [AsyncMock(side_effect=RuntimeError("db down")), AsyncMock(return_value=42)])
async def test_a_failing_handler_still_keeps_the_tap_from_the_ai(
        db, account, use_test_db, test_ai_config, quiet_channel, replies, no_ai, handler):
    register_button_handler("cod", handler)
    await process_channel_message(account.id, _inbound("Confirm", tap=_tap("cod:confirm:t")))
    no_ai.assert_not_awaited()
    assert _said(replies) == []


@pytest.mark.asyncio
async def test_a_slow_handler_times_out_claimed(db, account, monkeypatch):
    monkeypatch.setattr(app_first_routing, "BUTTON_HANDLER_TIMEOUT_SECONDS", 0.01)

    async def slow(context):
        await asyncio.sleep(1)
        return "late"
    register_button_handler("cod", slow)
    reply = await app_first_routing.button_reply(db, account, SimpleNamespace(session_id="s1"), "c1",
                                                 _inbound("Confirm", tap=_tap("cod:confirm:t")), None)
    assert reply == ""


@pytest.mark.asyncio
async def test_taps_nobody_owns_reach_the_ai_as_before(
        db, account, use_test_db, test_ai_config, quiet_channel):
    register_button_handler("cod", AsyncMock(return_value="no"))
    fake = MagicMock()
    fake.last_bot_message_id = None
    fake.safe_cleanup_mcp_tools = AsyncMock()
    fake.get_response = AsyncMock(return_value=SimpleNamespace(
        message="Here you go", transfer_to_human=False, end_chat=False, request_lead_capture=False))
    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake)), \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock(return_value=DeliveryResult(ok=True))):
        await process_channel_message(account.id, _inbound("Track my order", tap=_tap("track", "Track my order")))
        await process_channel_message(account.id, _inbound("Other", "wamid.IN2", tap=_tap("codx:1")))
    assert fake.get_response.await_count == 2


def test_a_prefix_is_one_word():
    with pytest.raises(ValueError):
        register_button_handler("cod:x", AsyncMock())
    with pytest.raises(ValueError):
        register_button_handler("", AsyncMock())


# --- Business sends check the opt-out (start_outbound_conversation) --------------------------------

TEMPLATE = {"name": "order_placed", "language": "en", "status": "APPROVED", "category": "UTILITY",
            "components": [{"type": "BODY", "text": "Order {{1}} is confirmed"}]}


@pytest.fixture
def templates(monkeypatch):
    fetch = AsyncMock(return_value=(True, [TEMPLATE]))
    monkeypatch.setattr(whatsapp_outbound, "fetch_message_templates", fetch)
    return fetch


@pytest.mark.asyncio
async def test_an_opted_out_number_gets_no_template(db, account, templates, quiet_channel, monkeypatch):
    send = AsyncMock(return_value=SendResult(ok=True, external_message_id="wamid.OUT"))
    monkeypatch.setattr(quiet_channel, "send_template", send)
    ChannelOptOutRepository(db).opt_out(account, CONTACT, OptOutSource.STOP_WORD)

    with pytest.raises(whatsapp_outbound.OutboundError) as refused:
        await whatsapp_outbound.start_outbound_conversation(
            db, account, to=CONTACT, template_name="order_placed", language="en",
            source=channel_chat.MessageSource.APP)
    assert (refused.value.status_code, refused.value.reason) == (409, whatsapp_outbound.OutboundReason.OPTED_OUT)
    send.assert_not_awaited()


@pytest.mark.asyncio
async def test_the_reply_from_the_wa_id_joins_the_thread_we_started(
        db, account, templates, quiet_channel, use_test_db, replies, no_ai, monkeypatch):
    monkeypatch.setattr(quiet_channel, "send_template",
                        AsyncMock(return_value=SendResult(ok=True, external_message_id="wamid.OUT")))
    sent = await whatsapp_outbound.start_outbound_conversation(
        db, account, to=MX_WRITTEN, template_name="order_placed", language="en",
        source=channel_chat.MessageSource.APP)
    await process_channel_message(account.id, InboundMessage(
        external_account_id="PN123", external_conversation_id=MX_WA_ID, external_user_id=MX_WA_ID,
        external_message_id="wamid.MX3", text="where is it?", profile={"phone": MX_WA_ID}))
    assert db.query(SessionToAgent).count() == 1
    session = db.query(SessionToAgent).one()
    assert str(session.session_id) == str(sent.session_id)
    # One person: the reply is the customer the order message started with
    from app.models.customer import Customer
    assert db.query(Customer).filter(Customer.organization_id == account.organization_id,
                                     Customer.phone.in_([MX_WRITTEN, "+" + MX_WA_ID])).count() == 1


@pytest.mark.asyncio
async def test_a_refused_send_carries_metas_code(db, account, templates, quiet_channel, monkeypatch):
    monkeypatch.setattr(quiet_channel, "send_template", AsyncMock(return_value=SendResult(
        ok=False, error="Business eligibility payment issue", error_code=131042)))
    with pytest.raises(whatsapp_outbound.OutboundError) as refused:
        await whatsapp_outbound.start_outbound_conversation(
            db, account, to=CONTACT, template_name="order_placed", language="en",
            source=channel_chat.MessageSource.APP)
    assert refused.value.reason == whatsapp_outbound.OutboundReason.SEND_FAILED
    assert refused.value.meta_code == 131042


@pytest.mark.asyncio
async def test_an_approved_template_is_read_from_meta_once_for_a_while(db, account, templates):
    for _ in range(3):
        await whatsapp_outbound._approved_outbound_template(db, account, "order_placed", "en",
                                                            starts_conversation=True)
    assert templates.await_count == 1


@pytest.mark.asyncio
async def test_a_template_still_in_review_is_read_again_each_time(db, account, templates):
    templates.return_value = (True, [{**TEMPLATE, "status": "PENDING"}])
    with pytest.raises(whatsapp_outbound.OutboundError) as pending:
        await whatsapp_outbound._approved_outbound_template(db, account, "order_placed", "en",
                                                            starts_conversation=True)
    assert pending.value.reason == whatsapp_outbound.OutboundReason.TEMPLATE_NOT_APPROVED
    templates.return_value = (True, [TEMPLATE])
    found = await whatsapp_outbound._approved_outbound_template(db, account, "order_placed", "en",
                                                                starts_conversation=True)
    assert found["status"] == "APPROVED"
    assert templates.await_count == 2


@pytest.mark.asyncio
async def test_the_cache_expires(db, account, templates, monkeypatch):
    await whatsapp_outbound._approved_outbound_template(db, account, "order_placed", "en", starts_conversation=True)
    monkeypatch.setattr(whatsapp_outbound, "TEMPLATE_CACHE_SECONDS", -1)
    whatsapp_outbound.forget_templates()
    await whatsapp_outbound._approved_outbound_template(db, account, "order_placed", "en", starts_conversation=True)
    await whatsapp_outbound._approved_outbound_template(db, account, "order_placed", "en", starts_conversation=True)
    assert templates.await_count == 3

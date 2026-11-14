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

from uuid import uuid4
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.channels.app_hooks import EventKind, register_event_listener
from app.channels.constants import MessageSource
from app.channels.base import SendResult, WindowStatus
from app.channels.interactive import from_options
from app.channels.interactive_limits import INSTAGRAM_LIMITS, WHATSAPP_LIMITS
from app.channels.sent_choices import SENT_CHOICES_ATTRIBUTE, decode_sent_choices
from app.repositories.channels import ChannelAccountRepository, ChannelConversationRepository
from app.repositories.channels.accounts import needs_reconnect
from app.repositories.chat import ChatRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services import message_delivery
from app.services.business_message import LAST_BUSINESS_MESSAGE, remember_business_message
from app.services.message_delivery import deliver_to_customer


@pytest.fixture
def mock_sio(monkeypatch):
    sio = MagicMock()
    sio.emit = AsyncMock()
    monkeypatch.setattr(message_delivery, "sio", sio)
    return sio


def make_session(db, test_agent, test_customer, test_organization, channel):
    return SessionToAgentRepository(db).create_session(
        session_id=uuid4(),
        agent_id=test_agent.id,
        customer_id=test_customer.id,
        organization_id=test_organization.id,
        channel=channel,
    )


def make_channel_session(db, test_agent, test_customer, test_organization):
    session = make_session(db, test_agent, test_customer, test_organization, 'telegram')
    account = ChannelAccountRepository(db).create_account(
        organization_id=test_organization.id,
        channel_type='telegram',
        external_account_id='bot123',
        credentials={'bot_token': '123:abc'},
        display_name='@testbot',
    )
    ChannelConversationRepository(db).create(
        channel_account_id=account.id,
        channel_type='telegram',
        external_conversation_id='222',
        external_user_id='111',
        session_id=session.session_id,
        organization_id=test_organization.id,
        agent_id=test_agent.id,
        customer_id=test_customer.id,
    )
    return session, account


@pytest.mark.asyncio
async def test_web_session_uses_socket_emit_only(db, test_agent, test_customer, test_organization, mock_sio):
    session = make_session(db, test_agent, test_customer, test_organization, 'web')
    result = await deliver_to_customer(db, session, {'message': 'hi'}, source=MessageSource.HUMAN)
    assert result.ok is True
    mock_sio.emit.assert_awaited_once_with(
        'chat_response', {'message': 'hi'}, room=str(session.session_id), namespace='/widget')


@pytest.mark.asyncio
async def test_channel_session_routes_to_adapter(db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    adapter = MagicMock()
    adapter.check_delivery_window.return_value = WindowStatus.OK
    adapter.format_outbound.side_effect = lambda t: t
    adapter.send_text = AsyncMock(return_value=SendResult(ok=True))
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: adapter)

    result = await deliver_to_customer(db, session, {'message': 'hello'}, source=MessageSource.HUMAN)

    assert result.ok is True
    adapter.send_text.assert_awaited_once()
    assert adapter.send_text.await_args.args[2] == 'hello'
    mock_sio.emit.assert_awaited_once()  # dashboard viewers still get the event


@pytest.mark.asyncio
async def test_channel_session_window_expired(db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    adapter = MagicMock()
    adapter.check_delivery_window.return_value = WindowStatus.TEMPLATE_REQUIRED
    adapter.send_text = AsyncMock()
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: adapter)

    result = await deliver_to_customer(db, session, {'message': 'hello'}, source=MessageSource.HUMAN)

    assert result.ok is False
    assert result.reason == 'window_expired'
    assert result.can_template is True
    adapter.send_text.assert_not_awaited()


@pytest.mark.asyncio
async def test_channel_session_without_conversation_fails(db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    session = make_session(db, test_agent, test_customer, test_organization, 'telegram')
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: MagicMock())

    result = await deliver_to_customer(db, session, {'message': 'hello'}, source=MessageSource.HUMAN)

    assert result.ok is False
    assert result.reason == 'no_channel_conversation'


@pytest.mark.asyncio
async def test_send_failure_reported(db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    adapter = MagicMock()
    adapter.check_delivery_window.return_value = WindowStatus.OK
    adapter.format_outbound.side_effect = lambda t: t
    adapter.send_text = AsyncMock(return_value=SendResult(ok=False, error='chat not found'))
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: adapter)

    result = await deliver_to_customer(db, session, {'message': 'hello'}, source=MessageSource.HUMAN)

    assert result.ok is False
    assert result.reason == 'chat not found'


@pytest.mark.asyncio
async def test_a_refused_token_marks_the_account_for_reconnection(db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    session, account = make_channel_session(db, test_agent, test_customer, test_organization)
    adapter = _channel_adapter(False)
    adapter.send_text = AsyncMock(return_value=SendResult(
        ok=False, error='Authentication Error', auth_failed=True))
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: adapter)

    result = await deliver_to_customer(db, session, {'message': 'hello'}, source=MessageSource.AI)
    assert result.ok is False
    db.refresh(account)
    assert needs_reconnect(account) is True

    # Once a send goes through again, the account is healthy
    adapter.send_text = AsyncMock(return_value=SendResult(ok=True, external_message_id='wamid.OK'))
    result = await deliver_to_customer(db, session, {'message': 'hello'}, source=MessageSource.AI)
    assert result.ok is True
    db.refresh(account)
    assert needs_reconnect(account) is False


@pytest.mark.asyncio
async def test_an_interactive_auth_failure_still_marks_the_account(db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    """The interactive attempt and the text fallback both fail; the result
    that decides is the fallback's."""
    session, account = make_channel_session(db, test_agent, test_customer, test_organization)
    refused = SendResult(ok=False, error='Authentication Error', auth_failed=True)
    adapter = _channel_adapter(True)
    adapter.send_interactive = AsyncMock(return_value=refused)
    adapter.send_text = AsyncMock(return_value=refused)
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: adapter)

    await deliver_to_customer(db, session, {'message': 'Pick one'},
                              interactive=from_options('Pick one', ['A', 'B']),
                              source=MessageSource.AI)

    db.refresh(account)
    assert needs_reconnect(account) is True


def _channel_adapter(supports_interactive: bool):
    adapter = MagicMock()
    adapter.channel_type = 'whatsapp'
    adapter.supports_interactive = supports_interactive
    adapter.interactive_limits = WHATSAPP_LIMITS if supports_interactive else None
    adapter.reports_delivery_status = True
    adapter.max_text_length = 4096
    adapter.supports_edit = False
    adapter.check_delivery_window.return_value = WindowStatus.OK
    adapter.format_outbound.side_effect = lambda t: t
    adapter.send_text = AsyncMock(return_value=SendResult(ok=True, external_message_id='wamid.TXT'))
    adapter.send_interactive = AsyncMock(return_value=SendResult(ok=True, external_message_id='wamid.INT'))
    return adapter


@pytest.mark.asyncio
async def test_quick_replies_go_out_as_buttons(db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    adapter = _channel_adapter(supports_interactive=True)
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: adapter)

    result = await deliver_to_customer(db, session, {'message': 'Confirm?'}, interactive=from_options('Confirm?', ['Yes', 'No']), source=MessageSource.HUMAN)

    assert result.ok
    sent = adapter.send_interactive.await_args.args[2]
    assert [b.title for b in sent.buttons] == ['Yes', 'No']
    adapter.send_text.assert_not_awaited()


@pytest.mark.asyncio
async def test_quick_replies_fall_back_to_text_without_support(db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    adapter = _channel_adapter(supports_interactive=False)
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: adapter)

    await deliver_to_customer(db, session, {'message': 'Confirm?'}, interactive=from_options('Confirm?', ['Yes', 'No']), source=MessageSource.HUMAN)

    adapter.send_interactive.assert_not_awaited()
    assert adapter.send_text.await_args.args[2] == 'Confirm?\n\n1. Yes\n2. No'


@pytest.mark.asyncio
async def test_rejected_interactive_send_falls_back_to_text(db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    adapter = _channel_adapter(supports_interactive=True)
    adapter.send_interactive = AsyncMock(return_value=SendResult(ok=False, error='bad param'))
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: adapter)

    result = await deliver_to_customer(db, session, {'message': 'Confirm?'}, interactive=from_options('Confirm?', ['Yes']), source=MessageSource.HUMAN)

    assert result.ok
    assert adapter.send_text.await_args.args[2] == 'Confirm?\n\n1. Yes'


@pytest.mark.asyncio
async def test_sent_message_id_lands_on_the_given_row(db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: _channel_adapter(False))
    chat_repo = ChatRepository(db)
    common = {'session_id': str(session.session_id), 'organization_id': str(test_organization.id),
              'message_type': 'bot'}
    target = chat_repo.create_message({**common, 'message': 'first'})
    later = chat_repo.create_message({**common, 'message': 'second'})

    await deliver_to_customer(db, session, {'message': 'first'}, message_id=target.id, source=MessageSource.HUMAN)

    db.refresh(target)
    db.refresh(later)
    assert target.external_message_id == 'wamid.TXT'
    assert later.external_message_id is None


def _bot_row(db, session, test_organization, text='Confirm?'):
    return ChatRepository(db).create_message({
        'session_id': str(session.session_id), 'organization_id': str(test_organization.id),
        'message_type': 'bot', 'message': text})


@pytest.mark.asyncio
async def test_what_was_sent_is_recorded_on_the_row(db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: _channel_adapter(True))
    row = _bot_row(db, session, test_organization)

    await deliver_to_customer(db, session, {'message': 'Confirm?'}, message_id=row.id,
                              interactive=from_options('Confirm?', ['Yes', 'No']), source=MessageSource.HUMAN)

    db.refresh(row)
    record = decode_sent_choices(row.attributes[SENT_CHOICES_ATTRIBUTE])
    assert record['as_text'] is False
    assert [c['text'] for c in record['choices']] == ['Yes', 'No']
    assert row.external_message_id == 'wamid.INT'


@pytest.mark.asyncio
async def test_a_text_fallback_is_recorded_as_such(db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: _channel_adapter(False))
    row = _bot_row(db, session, test_organization)

    await deliver_to_customer(db, session, {'message': 'Confirm?'}, message_id=row.id,
                              interactive=from_options('Confirm?', ['Yes']), source=MessageSource.HUMAN)

    db.refresh(row)
    assert decode_sent_choices(row.attributes[SENT_CHOICES_ATTRIBUTE])['as_text'] is True


@pytest.mark.asyncio
async def test_a_long_reply_goes_as_text_then_the_choices(db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    adapter = _channel_adapter(True)
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: adapter)
    row = _bot_row(db, session, test_organization)
    long_reply = 'x' * 1100

    await deliver_to_customer(db, session, {'message': long_reply}, message_id=row.id,
                              interactive=from_options(long_reply, ['Yes', 'No']), source=MessageSource.HUMAN)

    assert adapter.send_text.await_args.args[2] == long_reply
    choices = adapter.send_interactive.await_args.args[2]
    assert choices.body == 'Choose an option:' and [b.title for b in choices.buttons] == ['Yes', 'No']
    db.refresh(row)
    assert row.external_message_id == 'wamid.INT'  # a tap replies to the choices


@pytest.mark.asyncio
async def test_both_messages_of_a_split_reply_are_announced(db, test_agent, test_customer, test_organization,
                                                           mock_sio, monkeypatch):
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: _channel_adapter(True))
    seen = []

    async def listen(event):
        if event.kind == EventKind.OUTBOUND:
            seen.append((event.outbound.external_message_id, event.outbound.interactive is not None))
    register_event_listener(listen)
    long_reply = 'x' * 1100

    await deliver_to_customer(db, session, {'message': long_reply}, message_id=_bot_row(db, session, test_organization).id,
                              interactive=from_options(long_reply, ['Yes', 'No']), source=MessageSource.AI)

    assert seen == [('wamid.TXT', False), ('wamid.INT', True)]


@pytest.mark.asyncio
async def test_channels_without_receipts_record_no_message_id(db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    adapter = _channel_adapter(False)
    adapter.reports_delivery_status = False
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: adapter)
    row = _bot_row(db, session, test_organization)

    await deliver_to_customer(db, session, {'message': 'hi'}, message_id=row.id, source=MessageSource.HUMAN)

    db.refresh(row)
    assert row.external_message_id is None


@pytest.mark.asyncio
async def test_a_channel_that_can_edit_records_the_id_without_receipts(
        db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    """Telegram and Slack send no receipts, but an edit changes the platform's
    copy by this id."""
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    adapter = _channel_adapter(False)
    adapter.reports_delivery_status = False
    adapter.supports_edit = True
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: adapter)
    row = _bot_row(db, session, test_organization)

    await deliver_to_customer(db, session, {'message': 'hi'}, message_id=row.id, source=MessageSource.HUMAN)

    db.refresh(row)
    assert row.external_message_id == 'wamid.TXT'


@pytest.mark.asyncio
async def test_choices_on_a_channel_without_receipts_record_the_offers_id(
        db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    """A tap is matched back to the message that offered it (Messenger, Telegram)."""
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    adapter = _channel_adapter(True)
    adapter.reports_delivery_status = False
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: adapter)
    row = _bot_row(db, session, test_organization)

    await deliver_to_customer(db, session, {'message': 'Coming?'}, message_id=row.id,
                              interactive=from_options('Coming?', ['Yes', 'No']), source=MessageSource.AI)

    db.refresh(row)
    assert row.external_message_id == 'wamid.INT'
    assert decode_sent_choices(row.attributes[SENT_CHOICES_ATTRIBUTE])["numbered"] is False


@pytest.mark.asyncio
async def test_choices_written_into_the_text_split_a_long_reply_and_are_numbered(
        db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    """Instagram: the reply plus its numbered choices must fit, or the reply
    goes on its own first — never cut, which would lose the question."""
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    adapter = _channel_adapter(True)
    adapter.interactive_limits = INSTAGRAM_LIMITS
    adapter.reports_delivery_status = False
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: adapter)
    row = _bot_row(db, session, test_organization)
    reply = 'x' * 960 + ' Which one do you want?'  # fits alone, not with the choices

    await deliver_to_customer(db, session, {'message': reply}, message_id=row.id,
                              interactive=from_options(reply, ['First', 'Second', 'Third'], INSTAGRAM_LIMITS),
                              source=MessageSource.AI)

    assert adapter.send_text.await_args.args[2] == reply
    assert adapter.send_interactive.await_args.args[2].body == 'Choose an option:'
    db.refresh(row)
    assert decode_sent_choices(row.attributes[SENT_CHOICES_ATTRIBUTE])["numbered"] is True


@pytest.mark.asyncio
async def test_bookkeeping_failure_never_fails_a_delivered_message(db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: _channel_adapter(False))
    monkeypatch.setattr(message_delivery, "record_sent", AsyncMock(side_effect=RuntimeError("socket down")))
    row = _bot_row(db, session, test_organization)

    result = await deliver_to_customer(db, session, {'message': 'hi'}, message_id=row.id, source=MessageSource.HUMAN)

    assert result.ok is True


@pytest.mark.asyncio
async def test_long_reply_counts_as_delivered_when_only_its_choices_fail(
        db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    adapter = _channel_adapter(True)
    adapter.send_text = AsyncMock(side_effect=[SendResult(ok=True, external_message_id='wamid.BODY'),
                                               SendResult(ok=False, error='rate limited')])
    adapter.send_interactive = AsyncMock(return_value=SendResult(ok=False, error='bad param'))
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: adapter)
    row = _bot_row(db, session, test_organization)
    long_reply = 'x' * 1100

    result = await deliver_to_customer(db, session, {'message': long_reply}, message_id=row.id,
                                       interactive=from_options(long_reply, ['Yes', 'No']), source=MessageSource.HUMAN)

    assert result.ok is True
    db.refresh(row)
    assert row.external_message_id == 'wamid.BODY'
    assert SENT_CHOICES_ATTRIBUTE not in (row.attributes or {})


@pytest.fixture
def outbound_events():
    seen = []

    async def listen(event):
        seen.append(event)
    register_event_listener(listen)
    return seen


@pytest.mark.asyncio
async def test_a_channel_send_is_announced_with_who_wrote_it(
        db, test_agent, test_customer, test_organization, mock_sio, monkeypatch, outbound_events):
    session, account = make_channel_session(db, test_agent, test_customer, test_organization)
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: _channel_adapter(False))
    row = _bot_row(db, session, test_organization, text='hi')

    result = await deliver_to_customer(db, session, {'message': 'hi'}, message_id=row.id,
                                       source=MessageSource.AI)

    assert result.external_message_id == 'wamid.TXT'
    (event,) = outbound_events
    assert event.kind == EventKind.OUTBOUND
    assert event.channel_account_id == account.id
    assert (event.outbound.source, event.outbound.message_id, event.outbound.text) == \
        (MessageSource.AI, row.id, 'hi')


@pytest.mark.asyncio
async def test_failed_and_web_sends_are_not_announced(
        db, test_agent, test_customer, test_organization, mock_sio, monkeypatch, outbound_events):
    web = make_session(db, test_agent, test_customer, test_organization, 'web')
    await deliver_to_customer(db, web, {'message': 'hi'}, source=MessageSource.AI)

    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    adapter = _channel_adapter(False)
    adapter.send_text = AsyncMock(return_value=SendResult(ok=False, error='blocked'))
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: adapter)
    await deliver_to_customer(db, session, {'message': 'hi'}, source=MessageSource.AI)

    assert outbound_events == []


@pytest.mark.asyncio
@pytest.mark.parametrize("source,kept", [
    (MessageSource.HUMAN, False),   # a person took over from there
    (MessageSource.AI, True),       # the AI's own turns don't make it stale
    (MessageSource.SYSTEM, True),   # e.g. a quota notice before the AI could answer
    (MessageSource.APP, True),
])
async def test_only_a_person_replying_ends_the_business_message_context(
        db, test_agent, test_customer, test_organization, mock_sio, monkeypatch, source, kept):
    session, _ = make_channel_session(db, test_agent, test_customer, test_organization)
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: _channel_adapter(False))
    conversation = ChannelConversationRepository(db).get_by_session(session.session_id)
    remember_business_message(db, conversation, "Coming at 5?", "wamid.T")

    await deliver_to_customer(db, session, {'message': 'ok'}, source=source)

    db.refresh(conversation)
    assert (LAST_BUSINESS_MESSAGE in (conversation.extra or {})) is kept

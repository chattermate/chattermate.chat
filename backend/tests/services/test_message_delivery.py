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

from app.channels.base import SendResult, WindowStatus
from app.repositories.channels import ChannelAccountRepository, ChannelConversationRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services import message_delivery
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
    result = await deliver_to_customer(db, session, {'message': 'hi'})
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

    result = await deliver_to_customer(db, session, {'message': 'hello'})

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

    result = await deliver_to_customer(db, session, {'message': 'hello'})

    assert result.ok is False
    assert result.reason == 'window_expired'
    assert result.can_template is True
    adapter.send_text.assert_not_awaited()


@pytest.mark.asyncio
async def test_channel_session_without_conversation_fails(db, test_agent, test_customer, test_organization, mock_sio, monkeypatch):
    session = make_session(db, test_agent, test_customer, test_organization, 'telegram')
    monkeypatch.setattr(message_delivery, "get_adapter", lambda c: MagicMock())

    result = await deliver_to_customer(db, session, {'message': 'hello'})

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

    result = await deliver_to_customer(db, session, {'message': 'hello'})

    assert result.ok is False
    assert result.reason == 'chat not found'

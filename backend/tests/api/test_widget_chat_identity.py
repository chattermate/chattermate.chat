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

What the widget socket tells the page about the conversation it landed in, and
adopting a rotated token on a connection that is already open.
"""
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from app.api import widget_chat
from app.models.customer import Customer
from app.models.session_to_agent import SessionStatus, SessionToAgent
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services import conversation_token


@pytest.fixture
def mock_sio():
    mock = MagicMock()
    mock.enter_room = AsyncMock()
    mock.emit = AsyncMock()
    mock.save_session = AsyncMock()
    mock.get_environ = MagicMock()
    mock.get_session = AsyncMock()
    mock.leave_room = AsyncMock()
    return mock


@pytest.fixture
def identified_customer(db, test_organization) -> Customer:
    customer = Customer(
        organization_id=test_organization.id,
        email="signed.in@example.com",
        full_name="Signed In",
        is_authenticated=True,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@pytest.fixture
def connected(db, test_widget, test_ai_config, identified_customer, mock_sio, monkeypatch):
    """A widget socket connected as the identified visitor."""
    token, _, _ = conversation_token.mint(
        {
            "sub": str(identified_customer.id),
            "widget_id": str(test_widget.id),
            "customer_email": identified_customer.email,
        },
        ttl_seconds=600,
    )

    monkeypatch.setattr(widget_chat, "sio", mock_sio)
    monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
    monkeypatch.setattr(
        widget_chat,
        "authenticate_socket_conversation_token",
        AsyncMock(return_value=(
            str(test_widget.id),
            str(test_widget.organization_id),
            str(identified_customer.id),
            token,
        )),
    )
    monkeypatch.setattr(
        "app.repositories.widget.WidgetRepository.get_widget",
        lambda self, widget_id: test_widget,
    )
    ai_repo = MagicMock()
    ai_repo.get_active_config.return_value = test_ai_config
    monkeypatch.setattr(widget_chat, "AIConfigRepository", lambda db: ai_repo)
    return token


def _session_initialized(mock_sio) -> dict:
    for call in mock_sio.emit.call_args_list:
        if call[0][0] == 'session_initialized':
            return call[0][1]
    raise AssertionError("session_initialized was never emitted")


@pytest.mark.asyncio
async def test_a_new_conversation_is_reported_as_created_and_authenticated(mock_sio, connected):
    assert await widget_chat.widget_connect("sid-1", {}, {}) is True

    payload = _session_initialized(mock_sio)
    assert payload['created'] is True
    assert payload['authenticated'] is True


@pytest.mark.asyncio
async def test_resuming_a_conversation_is_not_reported_as_created(
    db, test_widget, identified_customer, mock_sio, connected, monkeypatch
):
    open_session = SessionToAgent(
        session_id=uuid4(),
        customer_id=identified_customer.id,
        agent_id=test_widget.agent_id,
        organization_id=test_widget.organization_id,
        status=SessionStatus.OPEN,
    )
    db.add(open_session)
    db.commit()
    # The lookup takes a string customer id, which SQLite's UUID column cannot bind -
    # the same reason the other widget socket tests stub this out.
    monkeypatch.setattr(
        "app.repositories.session_to_agent.SessionToAgentRepository.get_active_customer_session",
        lambda self, customer_id, agent_id=None: open_session,
    )

    assert await widget_chat.widget_connect("sid-2", {}, {}) is True

    assert _session_initialized(mock_sio)['created'] is False


@pytest.mark.asyncio
async def test_an_anonymous_visitor_is_not_reported_as_authenticated(
    db, test_widget, test_ai_config, test_customer, mock_sio, monkeypatch
):
    anonymous_token, _, _ = conversation_token.mint(
        {"sub": str(test_customer.id), "widget_id": str(test_widget.id)}, ttl_seconds=600
    )
    monkeypatch.setattr(widget_chat, "sio", mock_sio)
    monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
    monkeypatch.setattr(
        widget_chat,
        "authenticate_socket_conversation_token",
        AsyncMock(return_value=(
            str(test_widget.id), str(test_widget.organization_id),
            str(test_customer.id), anonymous_token,
        )),
    )
    monkeypatch.setattr(
        "app.repositories.widget.WidgetRepository.get_widget",
        lambda self, widget_id: test_widget,
    )
    ai_repo = MagicMock()
    ai_repo.get_active_config.return_value = test_ai_config
    monkeypatch.setattr(widget_chat, "AIConfigRepository", lambda db: ai_repo)

    assert await widget_chat.widget_connect("sid-3", {}, {}) is True

    assert _session_initialized(mock_sio)['authenticated'] is False


@pytest.mark.asyncio
async def test_a_rotated_token_replaces_the_one_the_socket_connected_with(
    test_widget, identified_customer, mock_sio, connected
):
    await widget_chat.widget_connect("sid-4", {}, {})
    session = mock_sio.save_session.call_args[0][1]
    mock_sio.get_session.return_value = session
    rotated, _, _ = conversation_token.mint(
        {
            "sub": str(identified_customer.id),
            "widget_id": str(test_widget.id),
            "customer_email": identified_customer.email,
        },
        ttl_seconds=600,
    )

    await widget_chat.handle_refresh_token("sid-4", {"conversation_token": rotated})

    assert mock_sio.save_session.call_args[0][1]['conversation_token'] == rotated


@pytest.mark.asyncio
async def test_a_token_for_another_customer_is_refused(
    db, test_widget, test_customer, mock_sio, connected
):
    await widget_chat.widget_connect("sid-5", {}, {})
    session = mock_sio.save_session.call_args[0][1]
    mock_sio.get_session.return_value = session
    someone_else, _, _ = conversation_token.mint(
        {"sub": str(test_customer.id), "widget_id": str(test_widget.id)}, ttl_seconds=600
    )

    await widget_chat.handle_refresh_token("sid-5", {"conversation_token": someone_else})

    # The socket keeps its own conversation; a refresh may never move it to another.
    assert mock_sio.save_session.call_args[0][1]['conversation_token'] == connected


@pytest.mark.asyncio
async def test_a_conversation_survives_the_token_it_started_with(
    db, test_widget, identified_customer, mock_sio, connected, monkeypatch
):
    """The failure this whole path exists for: a chat open longer than its token.

    end_chat re-authenticates from the token the socket connected with, so a
    conversation whose token was rotated in the page must close on the rotated one -
    otherwise the visitor's New chat silently does nothing.
    """
    await widget_chat.widget_connect("sid-7", {}, {})
    session = mock_sio.save_session.call_args[0][1]
    mock_sio.get_session.return_value = session
    session_id = session['session_id']

    rotated, _, _ = conversation_token.mint(
        {
            "sub": str(identified_customer.id),
            "widget_id": str(test_widget.id),
            "customer_email": identified_customer.email,
        },
        ttl_seconds=600,
    )
    await widget_chat.handle_refresh_token("sid-7", {"conversation_token": rotated})
    mock_sio.get_session.return_value = mock_sio.save_session.call_args[0][1]

    # The original token is now gone, exactly as it would be past its TTL.
    monkeypatch.setattr(
        widget_chat,
        "authenticate_socket_conversation_token",
        AsyncMock(side_effect=lambda sid, sess: (
            (str(test_widget.id), str(test_widget.organization_id),
             str(identified_customer.id), sess.get('conversation_token'))
            if sess.get('conversation_token') == rotated
            else (None, None, None, None)
        )),
    )

    await widget_chat.handle_end_chat("sid-7", {"reason": "CUSTOMER_REQUEST"})

    closed = SessionToAgentRepository(db).get_session(session_id)
    assert closed.status == SessionStatus.CLOSED
    assert any(call[0][0] == 'chat_ended' for call in mock_sio.emit.call_args_list)


@pytest.mark.asyncio
async def test_a_taken_over_conversation_can_still_adopt_a_rotated_token(
    db, test_widget, test_user, identified_customer, mock_sio, connected
):
    """A handover lasts far longer than an hour-long token. Refreshing must keep
    working while a person is handling the chat, or the socket ends up holding a
    token that no longer authenticates mid-conversation."""
    await widget_chat.widget_connect("sid-8", {}, {})
    session = mock_sio.save_session.call_args[0][1]
    mock_sio.get_session.return_value = session

    # A human agent takes the conversation over.
    repo = SessionToAgentRepository(db)
    taken_over = repo.get_session(session['session_id'])
    taken_over.user_id = test_user.id
    db.commit()

    rotated, _, _ = conversation_token.mint(
        {
            "sub": str(identified_customer.id),
            "widget_id": str(test_widget.id),
            "customer_email": identified_customer.email,
        },
        ttl_seconds=600,
    )
    await widget_chat.handle_refresh_token("sid-8", {"conversation_token": rotated})

    assert mock_sio.save_session.call_args[0][1]['conversation_token'] == rotated
    assert repo.get_session(session['session_id']).user_id == test_user.id


@pytest.mark.asyncio
async def test_an_unusable_token_is_refused(mock_sio, connected):
    await widget_chat.widget_connect("sid-6", {}, {})
    session = mock_sio.save_session.call_args[0][1]
    mock_sio.get_session.return_value = session

    await widget_chat.handle_refresh_token("sid-6", {"conversation_token": "not-a-jwt"})

    assert mock_sio.save_session.call_args[0][1]['conversation_token'] == connected

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

A stored message tells the inboxes open on its organization, whichever path
stored it — from the server's loop or from a worker thread — and only once it
is committed.
"""

import asyncio
import threading
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest

from app.models.chat_history import ChatHistory
from app.models.session_to_agent import SessionStatus, SessionToAgent
from app.repositories.chat import ChatRepository
from app.services import conversation_activity


@pytest.fixture
def conversation(db, test_agent, test_customer, test_organization) -> SessionToAgent:
    session = SessionToAgent(
        session_id=uuid4(),
        agent_id=test_agent.id,
        customer_id=test_customer.id,
        organization_id=test_organization.id,
        status=SessionStatus.OPEN,
        assigned_at=datetime.now(timezone.utc),
    )
    db.add(session)
    db.commit()
    return session


@pytest.fixture
def emitted():
    emit = AsyncMock()
    with patch.object(conversation_activity, 'emit_to_org_inbox', emit):
        yield emit
    conversation_activity.bind_loop(None)


def _message(conversation, text='Do you ship to Canada?', message_type='user') -> dict:
    return {
        'message': text,
        'message_type': message_type,
        'session_id': conversation.session_id,
        'organization_id': conversation.organization_id,
        'agent_id': conversation.agent_id,
        'customer_id': conversation.customer_id,
    }


async def _settle():
    for _ in range(3):
        await asyncio.sleep(0)


@pytest.mark.asyncio
async def test_a_stored_message_is_announced_to_its_organizations_inbox(db, conversation, emitted):
    conversation_activity.bind_loop(asyncio.get_running_loop())
    ChatRepository(db).create_message(_message(conversation, 'Hello! How can I help?', 'bot'))
    await _settle()

    emitted.assert_awaited_once_with(
        'conversation_activity', {'session_id': str(conversation.session_id)}, str(conversation.organization_id))


@pytest.mark.asyncio
async def test_two_messages_in_one_commit_announce_the_conversation_once(db, conversation, emitted):
    conversation_activity.bind_loop(asyncio.get_running_loop())
    db.add(ChatHistory(**_message(conversation)))
    db.add(ChatHistory(**_message(conversation, 'Usually 5 to 8 working days.', 'bot')))
    db.commit()
    await _settle()

    assert emitted.await_count == 1


@pytest.mark.asyncio
async def test_a_rolled_back_message_is_not_announced(db, conversation, emitted):
    conversation_activity.bind_loop(asyncio.get_running_loop())
    db.add(ChatHistory(**_message(conversation)))
    db.flush()
    db.rollback()
    db.commit()
    await _settle()

    emitted.assert_not_awaited()


@pytest.mark.asyncio
async def test_a_message_stored_from_a_worker_thread_is_announced_on_the_servers_loop(db, conversation, emitted):
    conversation_activity.bind_loop(asyncio.get_running_loop())
    worker = threading.Thread(target=lambda: ChatRepository(db).create_message(_message(conversation)))
    worker.start()
    await asyncio.get_running_loop().run_in_executor(None, worker.join)
    await _settle()

    emitted.assert_awaited_once()


def test_nothing_is_sent_without_a_server_loop(db, conversation, emitted):
    """Background workers and scripts store messages with no inbox listening."""
    ChatRepository(db).create_message(_message(conversation))

    emitted.assert_not_called()


@pytest.mark.asyncio
async def test_a_failed_announcement_never_breaks_storing_the_message(db, conversation, emitted):
    conversation_activity.bind_loop(asyncio.get_running_loop())
    emitted.side_effect = RuntimeError('redis down')
    stored = ChatRepository(db).create_message(_message(conversation))
    await _settle()

    assert stored.id is not None
    emitted.assert_awaited_once()

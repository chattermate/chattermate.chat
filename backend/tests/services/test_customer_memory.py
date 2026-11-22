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

Customer memory is a provider's: without one nothing is remembered, a failing
one is the same as none, and what one recalls reaches the agent first in its
context, worked out once per conversation and proof.
"""

import asyncio
import threading
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import patch
from uuid import uuid4

import pytest

from app.models.session_to_agent import SessionStatus, SessionToAgent
from app.repositories.chat import ChatRepository
from app.services import customer_memory
from app.services.widget_reply import CONTINUED_CONTEXT_KEY, widget_agent_kwargs


class FakeMemory:
    def __init__(self, context='Earlier: asked about order 1042', fail=False, on=True):
        self.context = context
        self.fail = fail
        self.on = on
        self.recalled = []
        self.recall_threads = []
        self.activity = []

    def enabled(self, organization_id):
        return self.on

    def recall(self, db, conversation):
        self.recall_threads.append(threading.current_thread())
        self.recalled.append(conversation)
        if self.fail:
            raise RuntimeError('memory store down')
        return self.context

    def note_activity(self, session_id, organization_id):
        if self.fail:
            raise RuntimeError('redis down')
        self.activity.append((session_id, organization_id))


@pytest.fixture
def memory():
    provider = FakeMemory()
    customer_memory.install(provider)
    yield provider
    customer_memory.install(None)


def _socket_session(**extra):
    session = {
        'ai_config': SimpleNamespace(encrypted_api_key='x', model_name='m', model_type='OPENAI', settings={}),
        'org_id': 'org-1', 'agent_id': 'agent-1', 'customer_id': 'cust-1', 'session_id': 'sess-1',
        'conversation_scope': 'scope-1',
    }
    session.update(extra)
    return session


# ---- Without a provider ----

@pytest.mark.asyncio
async def test_without_a_provider_nothing_is_recalled_or_kept():
    customer_memory.install(None)
    session = _socket_session()
    conversation = customer_memory.widget_conversation(session)

    assert customer_memory.recall(None, conversation) is None
    assert await customer_memory.recall_off_loop(None, conversation) is None
    customer_memory.note_activity('sess-1', 'org-1')  # no error
    assert await customer_memory.prepare_widget(None, session) is False
    assert customer_memory.SESSION_KEY not in session
    assert customer_memory.widget_context(session) is None


@patch('app.services.widget_reply.decrypt_api_key', return_value='key')
def test_without_a_provider_the_agent_context_is_unchanged(_decrypt):
    customer_memory.install(None)
    assert widget_agent_kwargs(_socket_session())['extra_context'] is None


# ---- A provider that fails ----

@pytest.mark.asyncio
async def test_a_failing_provider_recalls_nothing_and_raises_nothing():
    provider = FakeMemory(fail=True)
    customer_memory.install(provider)
    try:
        session = _socket_session()
        assert customer_memory.recall(None, customer_memory.widget_conversation(session)) is None
        customer_memory.note_activity('sess-1', 'org-1')  # swallowed
        await customer_memory.prepare_widget(None, session)
        assert customer_memory.widget_context(session) is None
    finally:
        customer_memory.install(None)


@pytest.mark.asyncio
async def test_an_unreadable_proof_recalls_as_if_unproven(memory):
    session = _socket_session()
    with patch.object(customer_memory.email_proof, 'verified_email', side_effect=RuntimeError('redis down')):
        assert await customer_memory.prepare_widget(None, session) is True
    assert session[customer_memory.SESSION_KEY]['proof'] is None


@pytest.mark.asyncio
async def test_an_org_without_memory_costs_no_thread_or_proof_read(memory):
    memory.on = False
    session = _socket_session()
    with patch.object(customer_memory.email_proof, 'verified_email') as proof, \
            patch.object(customer_memory.asyncio, 'to_thread') as to_thread:
        assert await customer_memory.prepare_widget(None, session) is False
        assert await customer_memory.recall_off_loop(None, customer_memory.widget_conversation(session)) is None
    proof.assert_not_called()
    to_thread.assert_not_called()
    assert memory.recalled == [] and customer_memory.SESSION_KEY not in session


def test_a_provider_that_cannot_say_whether_it_is_on_is_off():
    provider = FakeMemory()
    provider.enabled = lambda organization_id: 1 / 0
    customer_memory.install(provider)
    try:
        assert customer_memory.enabled('org-1') is False
        assert customer_memory.recall(None, customer_memory.widget_conversation(_socket_session())) is None
        assert provider.recalled == []
    finally:
        customer_memory.install(None)


@pytest.mark.asyncio
async def test_a_cancelled_recall_waits_for_its_thread_before_the_caller_cleans_up(memory):
    started, release, finished = threading.Event(), threading.Event(), threading.Event()

    def slow_recall(db, conversation):
        started.set()
        release.wait(5)
        finished.set()
        return 'late'
    memory.recall = slow_recall

    task = asyncio.create_task(customer_memory.recall_off_loop(None, customer_memory.widget_conversation(_socket_session())))
    await asyncio.to_thread(started.wait, 5)
    task.cancel()
    await asyncio.sleep(0.05)
    assert not task.done()  # still waiting: the session is the thread's until it returns
    release.set()
    with pytest.raises(asyncio.CancelledError):
        await task
    assert finished.is_set()


@pytest.mark.asyncio
async def test_cancelled_again_while_waiting_it_still_waits_for_the_thread(memory):
    started, release, finished = threading.Event(), threading.Event(), threading.Event()

    def slow_recall(db, conversation):
        started.set()
        release.wait(5)
        finished.set()
        return 'late'
    memory.recall = slow_recall

    task = asyncio.create_task(customer_memory.recall_off_loop(None, customer_memory.widget_conversation(_socket_session())))
    await asyncio.to_thread(started.wait, 5)
    task.cancel()
    await asyncio.sleep(0.05)
    task.cancel()  # a second cancel during the wait
    await asyncio.sleep(0.05)
    assert not task.done()
    release.set()
    with pytest.raises(asyncio.CancelledError):
        await task
    assert finished.is_set()


def _channel(session_id='sess-1'):
    return customer_memory.Conversation('org-1', 'agent-1', 'cust-1', session_id, 'telegram')


@pytest.mark.asyncio
async def test_a_channel_conversation_is_recalled_once(memory):
    assert await customer_memory.channel_context(None, _channel()) == memory.context
    assert await customer_memory.channel_context(None, _channel()) == memory.context
    assert len(memory.recalled) == 1
    await customer_memory.channel_context(None, _channel('sess-2'))  # another conversation
    assert len(memory.recalled) == 2


@pytest.mark.asyncio
async def test_a_channel_context_is_worked_out_again_once_old(memory, monkeypatch):
    clock = [1000.0]
    monkeypatch.setattr(customer_memory.time, 'monotonic', lambda: clock[0])
    await customer_memory.channel_context(None, _channel())
    clock[0] += customer_memory.CHANNEL_CONTEXT_SECONDS + 1
    await customer_memory.channel_context(None, _channel())
    assert len(memory.recalled) == 2


@pytest.mark.asyncio
async def test_the_channel_cache_stays_bounded(memory, monkeypatch):
    monkeypatch.setattr(customer_memory, 'CHANNEL_CONTEXTS', 3)
    for i in range(5):
        await customer_memory.channel_context(None, _channel(f'sess-{i}'))
    assert list(customer_memory._channel_contexts) == ['sess-2', 'sess-3', 'sess-4']


def test_an_empty_recall_counts_as_none(memory):
    memory.context = ''
    assert customer_memory.recall(None, customer_memory.widget_conversation(_socket_session())) is None


# ---- The widget ----

def test_a_socket_without_a_full_identity_has_no_conversation():
    for missing in ('org_id', 'agent_id', 'customer_id', 'session_id'):
        assert customer_memory.widget_conversation(_socket_session(**{missing: None})) is None


@pytest.mark.asyncio
async def test_the_provider_is_asked_off_the_event_loop_about_this_conversation(memory):
    session = _socket_session()
    assert await customer_memory.prepare_widget(None, session) is True

    assert memory.recall_threads[0] is not threading.main_thread()
    asked = memory.recalled[0]
    assert (asked.organization_id, asked.agent_id, asked.customer_id, asked.session_id, asked.channel,
            asked.conversation_scope) == ('org-1', 'agent-1', 'cust-1', 'sess-1', 'web', 'scope-1')
    assert customer_memory.widget_context(session) == memory.context


@pytest.mark.asyncio
async def test_recalled_once_per_conversation(memory):
    session = _socket_session()
    await customer_memory.prepare_widget(None, session)
    assert await customer_memory.prepare_widget(None, session) is False
    assert len(memory.recalled) == 1

    session['session_id'] = 'sess-2'  # the visitor started a new conversation
    assert customer_memory.widget_context(session) is None  # never the old one's
    assert await customer_memory.prepare_widget(None, session) is True
    assert len(memory.recalled) == 2


@pytest.mark.asyncio
async def test_recalled_again_once_the_visitor_proves_an_email(memory):
    session = _socket_session()
    await customer_memory.prepare_widget(None, session)

    with patch.object(customer_memory.email_proof, 'verified_email', return_value='Ana@Example.com'):
        assert await customer_memory.prepare_widget(None, session) is True
        assert await customer_memory.prepare_widget(None, session) is False
    assert len(memory.recalled) == 2
    # The socket session keeps a digest, never the address
    assert 'example' not in str(session[customer_memory.SESSION_KEY]).lower()


@patch('app.services.widget_reply.decrypt_api_key', return_value='key')
def test_the_recalled_context_comes_first_in_the_agents_context(_decrypt):
    session = _socket_session(host_prompt='Visitor is on the pricing page')
    session[customer_memory.SESSION_KEY] = {'session_id': 'sess-1', 'proof': None, 'context': 'MEMORY'}

    context = widget_agent_kwargs(session, journey_hint='Next step: connect a store')['extra_context']

    assert context.startswith('MEMORY\n\n')
    assert 'Next step: connect a store' in context


@patch('app.services.widget_reply.decrypt_api_key', return_value='key')
def test_a_continued_conversation_is_not_recalled_beside_it(_decrypt):
    session = _socket_session()
    session[customer_memory.SESSION_KEY] = {'session_id': 'sess-1', 'proof': None, 'context': 'MEMORY'}
    session[CONTINUED_CONTEXT_KEY] = {'session_id': 'sess-1', 'context': 'CONTINUED'}

    context = widget_agent_kwargs(session)['extra_context']

    assert 'CONTINUED' in context and 'MEMORY' not in context


# ---- Activity ----

@pytest.fixture
def conversation(db, test_agent, test_customer, test_organization) -> SessionToAgent:
    session = SessionToAgent(
        session_id=uuid4(), agent_id=test_agent.id, customer_id=test_customer.id,
        organization_id=test_organization.id, status=SessionStatus.OPEN,
        assigned_at=datetime.now(timezone.utc),
    )
    db.add(session)
    db.commit()
    return session


def _store(db, conversation):
    return ChatRepository(db).create_message({
        'message': 'Where is my order?', 'message_type': 'user',
        'session_id': conversation.session_id, 'organization_id': conversation.organization_id,
        'agent_id': conversation.agent_id, 'customer_id': conversation.customer_id,
    })


def test_a_stored_message_is_noted_once_committed(db, conversation, memory):
    _store(db, conversation)
    assert memory.activity == [(str(conversation.session_id), str(conversation.organization_id))]


def test_a_failing_provider_never_stops_a_message_being_stored(db, conversation):
    customer_memory.install(FakeMemory(fail=True))
    try:
        assert _store(db, conversation) is not None
    finally:
        customer_memory.install(None)

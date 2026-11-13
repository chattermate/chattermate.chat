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


The conversation-history socket events.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.api import widget_history as handlers

PLAN = {"conversation_history": True, "follow_ups": True, "shop_in_chat": True, "known_customers": True}
SESSION = {"agent_id": "a", "org_id": "o", "customer_id": "c", "session_id": "s", "conversation_scope": "k",
           "plan_features": PLAN}


def _patches(session=SESSION, **service):
    return [patch.object(handlers, "authenticated_session", AsyncMock(return_value=dict(session))),
            patch.object(handlers, "SessionLocal", MagicMock()),
            patch.object(handlers, "allow_request", return_value=True)] + \
        [patch.object(handlers.visitor_history, name, **spec) for name, spec in service.items()]


async def _call(handler, data, session=SESSION, **service):
    patches = _patches(session, **service)
    with patch.object(handlers, "sio") as sio:
        sio.emit, sio.save_session = AsyncMock(), AsyncMock()
        for p in patches:
            p.start()
        try:
            await handler("sid", data)
        finally:
            for p in patches:
                p.stop()
    return sio


@pytest.mark.asyncio
async def test_another_visitors_conversation_reads_as_not_found():
    sio = await _call(handlers.handle_get_conversation, {"id": "x"}, get_conversation={"return_value": None})
    assert sio.emit.await_args.args[:2] == ("error", handlers.NOT_FOUND)


@pytest.mark.asyncio
async def test_a_failure_answers_an_empty_list():
    sio = await _call(handlers.handle_list_conversations, {}, list_conversations={"side_effect": RuntimeError("db")})
    assert sio.emit.await_args.args[:2] == ("conversations", {"items": [], "next_cursor": None, "total": 0})


@pytest.mark.asyncio
async def test_continuing_keeps_the_context_for_the_agent():
    sio = await _call(handlers.handle_continue_conversation, {"id": "x"},
                      continue_conversation={"return_value": {"title": "Late order", "context": "ctx"}})
    saved = sio.save_session.await_args.args[1]
    assert saved[handlers.visitor_history.CONTINUED_KEY] == "ctx"
    assert sio.emit.await_args.args[:2] == ("conversation_continued", {"title": "Late order"})



@pytest.mark.asyncio
async def test_too_many_requests_answer_nothing_but_an_empty_list():
    patches = [patch.object(handlers, "authenticated_session", AsyncMock(return_value=dict(SESSION))),
               patch.object(handlers, "allow_request", return_value=False),
               patch.object(handlers.visitor_history, "list_conversations")]
    with patch.object(handlers, "sio") as sio:
        sio.emit = AsyncMock()
        for p in patches:
            p.start()
        try:
            await handlers.handle_list_conversations("sid", {})
            assert not handlers.visitor_history.list_conversations.called
        finally:
            for p in patches:
                p.stop()
    assert sio.emit.await_args.args[1]["items"] == []


FREE = {**SESSION, "plan_features": {**PLAN, "conversation_history": False}}


@pytest.mark.asyncio
async def test_on_free_there_are_no_past_chats():
    listed = MagicMock(return_value={"items": [{"id": "x"}], "next_cursor": None, "total": 1})
    sio = await _call(handlers.handle_list_conversations, {}, session=FREE, list_conversations={"new": listed})
    listed.assert_not_called()
    assert sio.emit.await_args.args[:2] == ("conversations", {"items": [], "next_cursor": None, "total": 0})


@pytest.mark.asyncio
@pytest.mark.parametrize("handler, service", [
    (handlers.handle_get_conversation, "get_conversation"),
    (handlers.handle_continue_conversation, "continue_conversation"),
])
async def test_on_free_a_past_chat_reads_as_not_found(handler, service):
    served = MagicMock(return_value={"title": "Late order", "context": "ctx"})
    sio = await _call(handler, {"id": "x"}, session=FREE, **{service: {"new": served}})
    served.assert_not_called()
    sio.save_session.assert_not_awaited()
    assert sio.emit.await_args.args[:2] == ("error", handlers.NOT_FOUND)

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

SESSION = {"agent_id": "a", "org_id": "o", "customer_id": "c", "session_id": "s", "conversation_scope": "k"}


def _patches(**service):
    return [patch.object(handlers, "authenticated_session", AsyncMock(return_value=dict(SESSION))),
            patch.object(handlers, "session_off_loop", AsyncMock(return_value=MagicMock())),
            patch.object(handlers, "close_session")] + \
        [patch.object(handlers.visitor_history, name, **spec) for name, spec in service.items()]


async def _call(handler, data, **service):
    patches = _patches(**service)
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

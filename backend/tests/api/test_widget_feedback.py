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


The visitor's thumb on an AI reply reaches the team's open inboxes.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.api import widget_feedback as handlers

SESSION = {"session_id": "s-1", "org_id": "o-1", "customer_id": "c-1", "conversation_scope": "k"}


def _patched(saved):
    return (patch.object(handlers, "authenticated_session", AsyncMock(return_value=SESSION)),
            patch.object(handlers, "sio"),
            patch.object(handlers, "session_off_loop", AsyncMock(return_value=MagicMock())),
            patch.object(handlers, "close_session"),
            patch.object(handlers, "save_visitor_feedback", return_value=saved),
            patch.object(handlers, "emit_to_org_inbox", AsyncMock()))


@pytest.mark.asyncio
@pytest.mark.parametrize("value", ["up", "down", None])
async def test_a_saved_thumb_is_told_to_the_inbox(value):
    auth, sio, off_loop, close, save, inbox = _patched(True)
    with auth, sio as socket, off_loop, close, save, inbox as told:
        socket.emit = AsyncMock()
        await handlers.handle_message_feedback("sid", {"message_id": 42, "value": value})
    told.assert_awaited_once_with("message_feedback", {"session_id": "s-1", "message_id": 42, "value": value}, "o-1")


@pytest.mark.asyncio
async def test_a_refused_thumb_tells_nobody():
    auth, sio, off_loop, close, save, inbox = _patched(False)
    with auth, sio as socket, off_loop, close, save, inbox as told:
        socket.emit = AsyncMock()
        await handlers.handle_message_feedback("sid", {"message_id": 42, "value": "up"})
    told.assert_not_awaited()


@pytest.mark.asyncio
async def test_an_invalid_thumb_is_never_saved_or_told():
    auth, sio, off_loop, close, save, inbox = _patched(True)
    with auth, sio as socket, off_loop, close, save as saver, inbox as told:
        socket.emit = AsyncMock()
        await handlers.handle_message_feedback("sid", {"message_id": 42, "value": "love"})
    saver.assert_not_called()
    told.assert_not_awaited()

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

"""The chat handler stops at an agent's reply limits before any model call."""

from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from app.api import widget_chat
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services import reply_limits
from tests.services.test_reply_limits import FakeRedis
from tests.socket_db import serve_socket_db


class ModelCalled(Exception):
    pass


@pytest.fixture
def chat(db, monkeypatch, test_widget, test_customer, test_ai_config):
    sio = MagicMock(emit=AsyncMock(), save_session=AsyncMock(), get_session=AsyncMock())
    monkeypatch.setattr(widget_chat, "sio", sio)
    counts = FakeRedis()
    monkeypatch.setattr(reply_limits, "get_redis", lambda: counts)
    serve_socket_db(monkeypatch, db)
    session_id = uuid4()
    SessionToAgentRepository(db).create_session(
        session_id=session_id, agent_id=test_widget.agent_id,
        customer_id=test_customer.id, organization_id=test_widget.organization_id,
    )
    session = {
        "widget_id": str(test_widget.id), "org_id": str(test_widget.organization_id),
        "agent_id": str(test_widget.agent_id), "customer_id": str(test_customer.id),
        "session_id": str(session_id), "ai_config": test_ai_config,
        "replies_per_customer_per_day": 2,
    }
    sio.get_session.return_value = session
    held = {"user_id": None}
    monkeypatch.setattr(widget_chat, "_own_session", lambda repo, s, active_only=True: MagicMock(
        session_id=session["session_id"], status=widget_chat.SessionStatus.OPEN,
        user_id=held["user_id"], workflow_id=None))
    monkeypatch.setattr(widget_chat, "notify_new_chat", AsyncMock())
    model = AsyncMock(side_effect=ModelCalled)
    monkeypatch.setattr(widget_chat, "create_widget_agent", model)
    return MagicMock(sio=sio, session=session, model=model, held=held)


def _emitted(sio, event):
    return [c.args[1] for c in sio.emit.call_args_list if c.args[0] == event]


@pytest.mark.asyncio
async def test_over_the_day_limit_the_model_is_not_called(chat):
    for _ in range(3):
        await widget_chat.handle_widget_chat("sid", {"message": "Hi"})
    assert chat.model.await_count == 2
    [refusal] = _emitted(chat.sio, "chat_response")
    assert refusal["message"] == reply_limits.DAILY_LIMIT_MESSAGE
    assert refusal["type"] == "reply_limit"


@pytest.mark.asyncio
async def test_an_agent_without_limits_always_reaches_the_model(chat):
    chat.session.pop("replies_per_customer_per_day")
    for _ in range(5):
        await widget_chat.handle_widget_chat("sid", {"message": "Hi"})
    assert chat.model.await_count == 5
    assert _emitted(chat.sio, "chat_response") == []


@pytest.mark.asyncio
async def test_messages_to_a_human_are_not_counted(chat):
    chat.held["user_id"] = uuid4()
    for _ in range(5):
        await widget_chat.handle_widget_chat("sid", {"message": "Hi"})
    chat.held["user_id"] = None
    for _ in range(2):
        await widget_chat.handle_widget_chat("sid", {"message": "Back to the bot"})
    assert chat.model.await_count == 2
    assert _emitted(chat.sio, "chat_response") == []

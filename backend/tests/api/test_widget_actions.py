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

from unittest.mock import AsyncMock, MagicMock
from uuid import UUID, uuid4

import pytest
from agno.models.response import ToolExecution

from app.agents.host_actions.turns import PausedTurn
from app.api import widget_actions, widget_chat
from app.models.schemas.agent_action import AgentActionCreate
from app.repositories.agent_action import AgentActionRepository
from app.repositories.agent_action_call import AgentActionCallRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services import host_action_runtime, widget_journeys, widget_reply
from tests.socket_db import serve_socket_db


@pytest.fixture
def sio(monkeypatch):
    mock = MagicMock()
    mock.emit = AsyncMock()
    mock.save_session = AsyncMock()
    mock.get_session = AsyncMock()
    for module in (widget_actions, widget_chat, widget_reply, host_action_runtime, widget_journeys):
        monkeypatch.setattr(module, "sio", mock)
    return mock


@pytest.fixture
def socket_session(db, monkeypatch, test_widget, test_customer, test_ai_config, sio):
    serve_socket_db(monkeypatch, db)
    monkeypatch.setattr(widget_actions, "session_off_loop", AsyncMock(return_value=db))
    monkeypatch.setattr(widget_actions, "close_session", lambda _db: None)
    session_id = uuid4()
    SessionToAgentRepository(db).create_session(
        session_id=session_id, agent_id=test_widget.agent_id,
        customer_id=test_customer.id, organization_id=test_widget.organization_id,
    )
    data = {
        "widget_id": str(test_widget.id), "org_id": str(test_widget.organization_id),
        "agent_id": str(test_widget.agent_id), "customer_id": str(test_customer.id),
        "session_id": str(session_id), "ai_config": test_ai_config,
    }
    sio.get_session.return_value = data
    return data


@pytest.fixture
def open_page(db, test_widget):
    return AgentActionRepository(db).create(test_widget.organization_id, test_widget.agent_id, AgentActionCreate(
        name="open_page", label="Go to a page", description="Navigates."))


def _emitted(sio, event):
    return [c.args[1] for c in sio.emit.call_args_list if c.args[0] == event]


@pytest.mark.asyncio
async def test_actions_are_refused_off_allowed_domains(sio, socket_session, open_page):
    await widget_actions.handle_actions_available("sid", {"names": ["open_page"], "host_origin": "https://x.example"})
    assert _emitted(sio, "actions_ready") == [{"names": []}]
    assert socket_session[host_action_runtime.OFFERED_KEY] == []


@pytest.mark.asyncio
async def test_actions_are_offered_on_an_allowed_domain(db, sio, socket_session, open_page, test_widget):
    test_widget.allowed_domains = ["app.example.com"]
    db.commit()
    await widget_actions.handle_actions_available(
        "sid", {"names": ["open_page", "ghost", 7], "host_origin": "https://app.example.com"})
    assert _emitted(sio, "actions_ready") == [{"names": ["open_page"]}]


@pytest.mark.asyncio
async def test_bad_payloads_offer_nothing(db, sio, socket_session, open_page, test_widget):
    test_widget.allowed_domains = ["app.example.com"]
    db.commit()
    await widget_actions.handle_actions_available("sid", {"names": "open_page", "host_origin": "https://app.example.com"})
    await widget_actions.handle_actions_available("sid", None)
    assert _emitted(sio, "actions_ready") == [{"names": []}, {"names": []}]


@pytest.mark.asyncio
async def test_set_context_is_cleaned(sio, socket_session):
    await widget_actions.handle_set_context("sid", {"context": {"plan": "free", "bad key": 1, "deep": {}}})
    assert socket_session["host_context"] == {"plan": "free"}


@pytest.mark.asyncio
async def test_unauthenticated_sockets_are_refused(sio):
    sio.get_session.return_value = {}
    await widget_actions.handle_set_context("sid", {"context": {"a": 1}})
    await widget_actions.handle_action_result("sid", {"call_id": "c", "status": "ok"})
    assert [e["type"] for e in _emitted(sio, "error")] == ["auth_error", "auth_error"]


@pytest.mark.asyncio
async def test_a_paused_reply_waits_for_the_page(db, sio, socket_session, open_page, monkeypatch):
    socket_session[host_action_runtime.OFFERED_KEY] = ["open_page"]
    monkeypatch.setattr(widget_chat, "_own_session", lambda repo, s, active_only=True: MagicMock(
        session_id=socket_session["session_id"], status=widget_chat.SessionStatus.OPEN,
        user_id=None, workflow_id=None))
    monkeypatch.setattr(widget_chat, "notify_new_chat", AsyncMock())
    agent = MagicMock()
    agent.agent.session_id = socket_session["session_id"]
    agent.safe_cleanup_mcp_tools = AsyncMock()
    agent.get_response = AsyncMock(return_value=PausedTurn(run_id="r1", calls=[ToolExecution(
        tool_call_id="c1", tool_name="open_page", tool_args={"path": "/a"}, external_execution_required=True)]))
    create = AsyncMock(return_value=agent)
    monkeypatch.setattr(widget_chat, "create_widget_agent", create)

    await widget_chat.handle_widget_chat("sid", {"message": "Open billing"})

    assert create.call_args.args[0]["host_action_functions"][0].name == "open_page"
    [request] = _emitted(sio, "action_request")
    assert request["name"] == "open_page" and request["args"] == {"path": "/a"}
    assert _emitted(sio, "chat_response") == []

    # A second message while the page works on it is held back.
    await widget_chat.handle_widget_chat("sid", {"message": "Hello?"})
    assert [e["type"] for e in _emitted(sio, "error")] == ["action_pending"]
    assert agent.get_response.await_count == 1
    open_call = AgentActionCallRepository(db).open_call(UUID(socket_session["session_id"]))
    assert str(open_call.id) == request["call_id"]

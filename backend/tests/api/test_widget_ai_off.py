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

from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from app.api import widget_chat
from app.models.session_to_agent import SessionStatus
from app.repositories.chat import ChatRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services import ai_access, host_action_runtime, message_delivery, widget_reply
from app.services.ai_access import AI_OFF_ATTRIBUTE, AI_OFF_NOTICE, FORM_RECEIVED_NOTICE
from tests.socket_db import serve_socket_db


@pytest.fixture
def sio(monkeypatch):
    mock = MagicMock()
    mock.emit = AsyncMock()
    mock.get_session = AsyncMock()
    mock.save_session = AsyncMock()
    mock.get_environ = MagicMock(return_value={})
    for module in (widget_chat, widget_reply, host_action_runtime, message_delivery):
        monkeypatch.setattr(module, "sio", mock)
    return mock


@pytest.fixture
def chat(db, test_widget, test_ai_config, test_customer, sio, monkeypatch):
    """A visitor's open conversation, ready to receive a message."""
    serve_socket_db(monkeypatch, db)
    monkeypatch.setattr(ai_access, "is_within_business_hours", lambda org: True)
    session_id = uuid4()
    monkeypatch.setattr(widget_chat, "authenticate_socket_conversation_token", AsyncMock(return_value=(
        str(test_widget.id), str(test_widget.organization_id), str(test_customer.id), "token")))
    SessionToAgentRepository(db).create_session(
        session_id=session_id, agent_id=test_widget.agent_id, customer_id=test_customer.id,
        organization_id=test_widget.organization_id)
    sio.get_session.return_value = {
        "widget_id": str(test_widget.id), "org_id": str(test_widget.organization_id),
        "agent_id": str(test_widget.agent_id), "customer_id": str(test_customer.id),
        "session_id": str(session_id), "ai_config": test_ai_config, "conversation_token": "token",
    }
    live = MagicMock(session_id=session_id, status=SessionStatus.OPEN, user_id=None, group_id=None, workflow_id=None,
                     channel="web", agent_id=test_widget.agent_id, organization_id=test_widget.organization_id,
                     customer_id=test_customer.id)
    monkeypatch.setattr(widget_chat, "_own_session", lambda repo, session, active_only=True: live)
    return live


def plan_says(monkeypatch, allowed):
    monkeypatch.setattr(widget_chat, "plan_allows_ai", lambda *a, **k: allowed)
    monkeypatch.setattr(ai_access, "plan_allows_ai", lambda *a, **k: allowed)


def plan_has_workflows(monkeypatch, allowed):
    monkeypatch.setattr(widget_chat, "plan_feature_on", lambda *a, **k: allowed)
    monkeypatch.setattr(ai_access, "plan_feature_on", lambda *a, **k: allowed)


async def send(text="hello"):
    with patch("app.services.widget_reply.ChatAgent.create_async", AsyncMock()) as create_async, \
         patch("app.api.widget_chat.get_agent_availability_response", AsyncMock()) as availability:
        await widget_chat.handle_widget_chat("sid", {"message": text})
    return create_async, availability


async def start_workflow():
    with patch("app.api.widget_chat.WorkflowExecutionService") as execution:
        await widget_chat.handle_get_workflow_state("sid")
    return execution


def event_names(sio):
    return [call[0][0] for call in sio.emit.call_args_list]


@pytest.mark.asyncio
class TestWidgetWithAiOff:
    async def test_no_model_runs_and_the_chat_stays_open(self, db, chat, sio, monkeypatch):
        plan_says(monkeypatch, False)

        create_async, availability = await send()

        create_async.assert_not_awaited()
        availability.assert_not_awaited()
        stored = SessionToAgentRepository(db).get_session(str(chat.session_id))
        assert stored.status == SessionStatus.OPEN
        assert "bot_typing" not in event_names(sio)

    async def test_the_visitor_is_told_once_and_never_sees_an_error(self, db, chat, sio, monkeypatch):
        plan_says(monkeypatch, False)

        await send("hello")
        await send("still there?")

        history = await ChatRepository(db).get_session_history(str(chat.session_id))
        assert [m.message_type for m in history] == ["user", "bot", "user"]
        assert history[1].message == AI_OFF_NOTICE
        assert "error" not in event_names(sio)

    async def test_the_team_gets_the_message(self, chat, sio, monkeypatch):
        plan_says(monkeypatch, False)

        await send()

        assert "chat_reply" in event_names(sio)

    async def test_the_visitor_is_asked_for_contact_details(self, chat, sio, monkeypatch):
        plan_says(monkeypatch, False)
        form = AsyncMock()
        monkeypatch.setattr(widget_chat, "send_handoff_contact_form", form)

        await send("hello")
        await send("again")

        form.assert_awaited_once()

    async def test_a_queued_chat_costs_no_model_call(self, chat, sio, monkeypatch):
        plan_says(monkeypatch, False)
        chat.status = SessionStatus.TRANSFERRED

        _, availability = await send()

        availability.assert_not_awaited()

    async def test_a_human_only_agents_queued_chat_costs_no_model_call(self, db, chat, sio, monkeypatch):
        plan_says(monkeypatch, False)
        sio.get_session.return_value["ai_replies_enabled"] = False
        chat.status = SessionStatus.TRANSFERRED
        # With groups, the queued reply would be written by the availability model.
        monkeypatch.setattr(widget_chat.JiraRepository, "get_agent_with_jira_config",
                            lambda self, agent_id: MagicMock(groups=[MagicMock()]))

        _, availability = await send()

        availability.assert_not_awaited()
        history = await ChatRepository(db).get_session_history(str(chat.session_id))
        assert history[0].message_type == "user"
        assert "chat_reply" in event_names(sio)

    async def test_a_chat_a_person_holds_never_asks_the_plan(self, db, chat, sio, test_user, monkeypatch):
        asked = MagicMock(return_value=False)
        monkeypatch.setattr(widget_chat, "plan_allows_ai", asked)
        chat.user_id = test_user.id

        await send()

        asked.assert_not_called()
        history = await ChatRepository(db).get_session_history(str(chat.session_id))
        assert [m.message_type for m in history] == ["user"]

    async def test_the_check_runs_on_every_message_not_at_connect(self, chat, sio, monkeypatch):
        asked = MagicMock(return_value=False)
        monkeypatch.setattr(widget_chat, "plan_allows_ai", asked)

        await send("one")
        await send("two")

        assert asked.call_count == 2

    async def test_a_workflow_does_not_start_while_the_ai_is_off(self, chat, sio, monkeypatch):
        plan_says(monkeypatch, False)
        chat.workflow_id = uuid4()
        chat.current_node_id = None

        execution = await start_workflow()

        execution.assert_not_called()

    async def test_a_workflow_starts_when_the_plan_allows(self, chat, sio, monkeypatch):
        plan_says(monkeypatch, True)
        chat.workflow_id = uuid4()
        chat.current_node_id = None

        execution = await start_workflow()

        execution.assert_called_once()

    async def test_a_workflow_does_not_advance_while_the_ai_is_off(self, chat, sio, monkeypatch):
        plan_says(monkeypatch, False)
        chat.workflow_id = uuid4()

        with patch("app.api.widget_chat.WorkflowExecutionService") as execution:
            await widget_chat.handle_proceed_workflow("sid", {})

        execution.assert_not_called()

    async def test_the_canned_queue_line_is_not_a_metered_reply(self, db, chat, sio, test_organization, monkeypatch):
        plan_says(monkeypatch, True)
        chat.status = SessionStatus.TRANSFERRED

        await send()

        assert ChatRepository(db).get_message_count_for_period(str(test_organization.id), None, None) == 0

    async def test_a_submitted_form_reaches_the_team_and_runs_no_workflow(self, db, chat, sio, monkeypatch):
        plan_says(monkeypatch, False)
        chat.workflow_id = uuid4()
        chat.current_node_id = uuid4()
        workflow = MagicMock(nodes=[MagicMock(id=chat.current_node_id, form_fields=[])])
        monkeypatch.setattr("app.repositories.workflow.WorkflowRepository.get_workflow_with_nodes_and_connections",
                            lambda self, workflow_id: workflow)

        with patch("app.api.widget_chat.WorkflowExecutionService") as execution:
            await widget_chat.handle_form_submission("sid", {"form_data": {"email": "a@b.co"}})

        execution.assert_not_called()
        history = await ChatRepository(db).get_session_history(str(chat.session_id))
        assert history[0].message == "email: a@b.co"
        assert history[1].message == AI_OFF_NOTICE


@pytest.mark.asyncio
class TestWidgetOnAPlanWithoutWorkflows:
    @pytest.fixture(autouse=True)
    def workflow_session(self, chat, monkeypatch):
        plan_says(monkeypatch, True)
        plan_has_workflows(monkeypatch, False)
        chat.workflow_id = uuid4()
        chat.current_node_id = uuid4()

    async def test_the_normal_agent_answers_instead(self, chat, sio):
        with patch("app.api.widget_chat.WorkflowChatService") as workflow_chat:
            create_async, _ = await send()

        workflow_chat.assert_not_called()
        create_async.assert_awaited_once()

    async def test_the_workflow_is_back_when_the_plan_is(self, chat, sio, monkeypatch):
        plan_has_workflows(monkeypatch, True)
        with patch("app.api.widget_chat.WorkflowChatService") as workflow_chat:
            workflow_chat.return_value.handle_workflow_chat = AsyncMock(return_value=None)
            create_async, _ = await send()

        workflow_chat.return_value.handle_workflow_chat.assert_awaited_once()
        create_async.assert_not_awaited()

    async def test_a_widget_asking_for_the_workflow_is_told_to_chat(self, chat, sio):
        execution = await start_workflow()

        execution.assert_not_called()
        states = [call[0][1] for call in sio.emit.call_args_list if call[0][0] == 'workflow_state']
        assert [state['type'] for state in states] == ['ready']

    async def test_it_does_not_advance(self, chat, sio):
        with patch("app.api.widget_chat.WorkflowExecutionService") as execution:
            await widget_chat.handle_proceed_workflow("sid", {})

        execution.assert_not_called()

    async def test_a_form_left_open_still_reaches_the_team(self, db, chat, sio, monkeypatch):
        workflow = MagicMock(nodes=[MagicMock(id=chat.current_node_id, form_fields=[])])
        monkeypatch.setattr("app.repositories.workflow.WorkflowRepository.get_workflow_with_nodes_and_connections",
                            lambda self, workflow_id: workflow)

        with patch("app.api.widget_chat.WorkflowExecutionService") as execution:
            await widget_chat.handle_form_submission("sid", {"form_data": {"email": "a@b.co"}})

        execution.assert_not_called()
        history = await ChatRepository(db).get_session_history(str(chat.session_id))
        assert [row.message for row in history] == ["email: a@b.co", FORM_RECEIVED_NOTICE]
        # The AI is still on: a real stop later in this chat still gets its notice
        assert not ChatRepository(db).has_message_flag(str(chat.session_id), AI_OFF_ATTRIBUTE)
        assert "display_form" not in event_names(sio)

    async def test_a_person_holding_the_chat_is_untouched(self, chat, sio, test_user):
        chat.user_id = test_user.id
        with patch("app.api.widget_chat.WorkflowChatService") as workflow_chat:
            create_async, _ = await send()

        workflow_chat.assert_not_called()
        create_async.assert_not_awaited()

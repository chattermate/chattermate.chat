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

import asyncio

import pytest
from unittest.mock import Mock, MagicMock, patch, AsyncMock
from app.models.agent import Agent, AgentType
from app.services import host_action_runtime, widget_reply
from app.models.chat_history import ChatHistory
from app.models.workflow import Workflow, WorkflowStatus
from app.models.workflow_node import WorkflowNode, NodeType
from app.services.workflow_execution import WorkflowExecutionService
from app.models.organization import Organization
from app.models.user import User
from uuid import UUID, uuid4
from app.services.conversation_token import VERIFIED_SCOPE
from tests.socket_db import serve_socket_db


@pytest.fixture
def test_organization(db):
    """Create a test organization"""
    organization = Organization(
        id=uuid4(),
        name="Test Organization",
        domain="test.com"
    )
    db.add(organization)
    db.commit()
    db.refresh(organization)
    return organization


@pytest.fixture
def test_user(db, test_organization):
    """Create a test user"""
    user = User(
        id=uuid4(),
        email="test@example.com",
        hashed_password="hashed_password",
        is_active=True,
        organization_id=test_organization.id,
        full_name="Test User"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_agent(db, test_organization):
    """Create a test agent with workflow enabled"""
    agent = Agent(
        id=uuid4(),
        name="Test Agent",
        display_name="Test Agent",
        description="Test agent with workflow",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Test instruction"],
        is_active=True,
        organization_id=test_organization.id,
        use_workflow=True
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


@pytest.fixture
def test_workflow(db, test_organization, test_agent, test_user):
    """Create a test workflow"""
    workflow = Workflow(
        id=uuid4(),
        name="Test Workflow",
        description="Test workflow",
        status=WorkflowStatus.PUBLISHED,
        version=1,
        is_template=False,
        default_language="en",
        canvas_data={
            "nodes": [
                {
                    "id": "start",
                    "type": "start",
                    "data": {"label": "Start"}
                }
            ]
        },
        settings={},
        organization_id=test_organization.id,
        agent_id=test_agent.id,
        created_by=test_user.id
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    
    # Update agent to use this workflow
    test_agent.active_workflow_id = workflow.id
    db.commit()
    
    return workflow


class TestWidgetChatWorkflow:
    
    def test_agent_has_workflow_enabled(self, test_agent, test_workflow):
        """Test that the agent has workflow properly configured"""
        assert test_agent.use_workflow is True
        assert test_agent.active_workflow_id == test_workflow.id
    
    def test_workflow_is_published(self, test_workflow):
        """Test that the workflow is in published status"""
        assert test_workflow.status == WorkflowStatus.PUBLISHED
        assert test_workflow.canvas_data is not None
        assert "nodes" in test_workflow.canvas_data
    
    @pytest.mark.asyncio
    async def test_workflow_execution_service_mock(self, test_agent, test_workflow):
        """Test that WorkflowExecutionService can be mocked properly"""
        from app.services.workflow_execution import WorkflowExecutionService
        
        with patch.object(WorkflowExecutionService, '__init__', return_value=None) as mock_init, \
             patch.object(WorkflowExecutionService, 'execute_workflow', new_callable=AsyncMock) as mock_execute:
            
            mock_execute.return_value = {
                "success": True,
                "message": "Workflow executed",
                "next_node": None
            }
            
            # Create service instance
            service = WorkflowExecutionService(None)
            
            # Call execute_workflow
            result = await service.execute_workflow(
                session_id="test_session",
                message="Hello",
                agent_id=test_agent.id,
                workflow_id=test_workflow.id
            )
            
            # Verify the mock was called and returned expected result
            mock_execute.assert_called_once()
            assert result["success"] is True
            assert result["message"] == "Workflow executed"
    
    def test_workflow_data_structure(self, test_workflow):
        """Test that workflow has proper data structure"""
        assert isinstance(test_workflow.canvas_data, dict)
        assert "nodes" in test_workflow.canvas_data
        assert len(test_workflow.canvas_data["nodes"]) >= 1
        
        # Check first node structure
        first_node = test_workflow.canvas_data["nodes"][0]
        assert "id" in first_node
        assert "type" in first_node
        assert "data" in first_node
    
    def test_agent_workflow_relationship(self, test_agent, test_workflow):
        """Test the relationship between agent and workflow"""
        assert test_agent.active_workflow_id == test_workflow.id
        assert test_workflow.agent_id == test_agent.id
        assert test_agent.organization_id == test_workflow.organization_id


@pytest.fixture
def one_message_session(db, test_workflow, test_agent, test_customer, test_ai_config, monkeypatch):
    """A widget session on a workflow that is a single MESSAGE node."""
    from app.api import widget_chat
    from app.services import message_delivery
    from app.repositories.session_to_agent import SessionToAgentRepository

    db.add(WorkflowNode(
        id=uuid4(),
        workflow_id=test_workflow.id,
        node_type=NodeType.MESSAGE,
        name="Greeting",
        config={"message_text": "Hello from the workflow"},
    ))
    db.commit()

    session_id = uuid4()
    active_session = SessionToAgentRepository(db).create_session(
        session_id=session_id,
        agent_id=test_agent.id,
        customer_id=test_customer.id,
        organization_id=test_agent.organization_id,
    )
    assert active_session.workflow_id == test_workflow.id

    sio = MagicMock()
    sio.emit = AsyncMock()
    sio.get_session = AsyncMock(return_value={
        "widget_id": str(uuid4()),
        "org_id": str(test_agent.organization_id),
        "agent_id": str(test_agent.id),
        "customer_id": str(test_customer.id),
        "session_id": str(session_id),
        "ai_config": test_ai_config,
        # A keyless session is resumed by a token the embedding app vouched for.
        "conversation_scope": VERIFIED_SCOPE,
    })
    monkeypatch.setattr(widget_chat, "sio", sio)
    monkeypatch.setattr(widget_reply, "sio", sio)
    monkeypatch.setattr(host_action_runtime, "sio", sio)
    monkeypatch.setattr(message_delivery, "sio", sio)
    serve_socket_db(monkeypatch, db)
    monkeypatch.setattr(widget_chat, "notify_new_chat", AsyncMock())
    return sio, str(session_id)


def _chat_responses(sio):
    return [c.args[1]["message"] for c in sio.emit.call_args_list if c.args[0] == "chat_response"]


def _stored_bot_messages(db, session_id):
    return [m.message for m in db.query(ChatHistory).filter(
        ChatHistory.session_id == UUID(session_id), ChatHistory.message_type == "bot").all()]


class TestOneMessageWorkflowIsSentOnce:
    """A workflow ending on a MESSAGE node used to send and store that message
    twice: once as an intermediate message and once as the final reply."""

    @pytest.mark.asyncio
    async def test_on_load(self, db, one_message_session):
        from app.api import widget_chat
        sio, session_id = one_message_session

        await widget_chat.handle_get_workflow_state("test_sid")

        assert _chat_responses(sio) == ["Hello from the workflow"]
        states = [c.args[1] for c in sio.emit.call_args_list if c.args[0] == "workflow_state"]
        assert [(s["type"], s["message"]) for s in states] == [("message", "Hello from the workflow")]
        assert _stored_bot_messages(db, session_id) == ["Hello from the workflow"]

    @pytest.mark.asyncio
    async def test_when_the_widget_asks_twice_at_once(self, db, one_message_session, monkeypatch):
        from app.api import widget_chat
        sio, session_id = one_message_session

        async def session_after_a_wait():
            await asyncio.sleep(0)  # as the real checkout does, off the loop
            return db
        monkeypatch.setattr(widget_chat, "session_off_loop", session_after_a_wait)
        start_workflow = WorkflowExecutionService.execute_workflow

        async def start_after_a_wait(self, **kwargs):
            await asyncio.sleep(0)  # starting a workflow awaits real work
            return await start_workflow(self, **kwargs)
        monkeypatch.setattr(WorkflowExecutionService, "execute_workflow", start_after_a_wait)

        await asyncio.gather(widget_chat.handle_get_workflow_state("sid_a"),
                             widget_chat.handle_get_workflow_state("sid_b"))

        assert _chat_responses(sio) == ["Hello from the workflow"]
        assert _stored_bot_messages(db, session_id) == ["Hello from the workflow"]

    @pytest.mark.asyncio
    async def test_on_first_message(self, db, one_message_session):
        from app.api import widget_chat
        sio, session_id = one_message_session

        await widget_chat.handle_widget_chat("test_sid", {"message": "hi"})

        assert _chat_responses(sio) == ["Hello from the workflow"]
        assert _stored_bot_messages(db, session_id) == ["Hello from the workflow"]
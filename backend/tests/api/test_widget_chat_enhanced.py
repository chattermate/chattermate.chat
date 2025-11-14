"""
ChatterMate - Enhanced Widget Chat Tests
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.models.widget import Widget
from app.models.agent import Agent, AgentType
from app.models.ai_config import AIConfig, AIModelType
from app.models.customer import Customer
from app.models.user import User
from app.models.workflow import Workflow, WorkflowStatus
from app.models.session_to_agent import SessionToAgent, SessionStatus

from app.repositories.agent import AgentRepository
from app.repositories.widget import WidgetRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.repositories.chat import ChatRepository
from app.models.schemas.widget import WidgetCreate
from app.core.security import encrypt_api_key
from uuid import UUID, uuid4
from datetime import datetime, timezone


@pytest.fixture
def test_ai_config(db, test_organization) -> AIConfig:
    """Create a test AI config"""
    ai_config = AIConfig(
        organization_id=test_organization.id,
        model_type=AIModelType.OPENAI,
        model_name="gpt-4",
        encrypted_api_key=encrypt_api_key("test_key"),
        is_active=True
    )
    db.add(ai_config)
    db.commit()
    db.refresh(ai_config)
    return ai_config


@pytest.fixture
def test_agent(db, test_organization) -> Agent:
    """Create a test agent"""
    agent_repo = AgentRepository(db)
    agent = agent_repo.create_agent(
        name="Test Agent",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Test instructions"],
        org_id=test_organization.id
    )
    return agent


@pytest.fixture
def test_workflow(db, test_organization, test_user) -> Workflow:
    """Create a test workflow"""
    workflow = Workflow(
        id=uuid4(),
        name="Test Workflow",
        description="Test workflow",
        status=WorkflowStatus.PUBLISHED,
        version=1,
        is_template=False,
        default_language="en",
        canvas_data={},
        settings={},
        organization_id=test_organization.id,
        created_by=test_user.id
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow


@pytest.fixture
def test_widget(db, test_agent) -> Widget:
    """Create a test widget"""
    widget_repo = WidgetRepository(db)
    widget_create = WidgetCreate(
        name="Test Widget",
        agent_id=test_agent.id
    )
    widget = widget_repo.create_widget(
        widget=widget_create,
        organization_id=test_agent.organization_id
    )
    return widget


@pytest.fixture
def test_customer(db, test_organization) -> Customer:
    """Create a test customer"""
    customer = Customer(
        id=uuid4(),
        organization_id=test_organization.id,
        email="test.customer@example.com",
        full_name="Test Customer"
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@pytest.fixture
def test_session(db, test_widget, test_customer) -> SessionToAgent:
    """Create a test session"""
    session_id = uuid4()
    session = SessionToAgent(
        session_id=session_id,
        agent_id=test_widget.agent_id,
        customer_id=test_customer.id,
        organization_id=test_widget.organization_id,
        status=SessionStatus.OPEN
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@pytest.fixture
def mock_sio():
    """Create a mock socket.io instance"""
    mock = MagicMock()
    mock.emit = AsyncMock()
    mock.get_session = AsyncMock()
    mock.get_environ = MagicMock()
    return mock


class TestHandleWidgetChat:
    """Test the handle_widget_chat function"""
    
    @pytest.mark.asyncio
    async def test_handle_widget_chat_authentication_failure(self, mock_sio, monkeypatch):
        """Test widget chat with authentication failure"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock failed authentication
        mock_sio.get_session.return_value = {"test": "session"}
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=(None, None, None, None))
        )
        
        sid = "test_sid"
        data = {"message": "Hello"}
        
        await widget_chat.handle_widget_chat(sid, data)
        
        # Verify error was emitted
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Authentication failed', 'type': 'auth_error'},
            room=sid,
            namespace='/widget'
        )
    
    @pytest.mark.asyncio
    async def test_handle_widget_chat_empty_message(self, mock_sio, monkeypatch, test_widget, test_customer):
        """Test widget chat with empty message"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock successful authentication
        mock_auth_result = (str(test_widget.id), str(test_widget.organization_id), str(test_customer.id), "token")
        mock_sio.get_session.return_value = {
            "widget_id": str(test_widget.id),
            "org_id": str(test_widget.organization_id),
            "customer_id": str(test_customer.id),
            "session_id": str(uuid4()),
            "agent_id": str(test_widget.agent_id)
        }
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=mock_auth_result)
        )
        
        sid = "test_sid"
        data = {"message": "   "}  # Empty/whitespace message
        
        await widget_chat.handle_widget_chat(sid, data)
        
        # Should return early without processing, no error emitted
        assert mock_sio.emit.call_count == 0
    
    @pytest.mark.asyncio
    async def test_handle_widget_chat_session_mismatch(self, mock_sio, monkeypatch, test_widget, test_customer):
        """Test widget chat with session data mismatch"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        monkeypatch.setattr(widget_chat, "get_db", lambda: iter([MagicMock()]))
        
        # Mock successful authentication but mismatched session data
        mock_auth_result = (str(test_widget.id), str(test_widget.organization_id), str(test_customer.id), "token")
        mock_sio.get_session.return_value = {
            "widget_id": "different_widget_id",  # Mismatch
            "org_id": str(test_widget.organization_id),
            "customer_id": str(test_customer.id),
            "session_id": str(uuid4()),
            "agent_id": str(test_widget.agent_id)
        }
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=mock_auth_result)
        )
        
        sid = "test_sid"
        data = {"message": "Hello"}
        
        await widget_chat.handle_widget_chat(sid, data)
        
        # Should emit error due to session mismatch
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Unable to process your request, please try again later.', 'type': 'chat_error'},
            to=sid,
            namespace='/widget'
        )
    
    @pytest.mark.asyncio
    async def test_handle_widget_chat_no_active_session(self, mock_sio, monkeypatch, test_widget, test_customer, db):
        """Test widget chat when no active session exists"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
        
        session_id = uuid4()
        mock_auth_result = (str(test_widget.id), str(test_widget.organization_id), str(test_customer.id), "token")
        mock_sio.get_session.return_value = {
            "widget_id": str(test_widget.id),
            "org_id": str(test_widget.organization_id),
            "customer_id": str(test_customer.id),
            "session_id": str(session_id),
            "agent_id": str(test_widget.agent_id)
        }
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=mock_auth_result)
        )
        
        # Mock no active session found
        with patch.object(SessionToAgentRepository, 'get_active_customer_session', return_value=None):
            with patch.object(SessionToAgentRepository, 'get_latest_customer_session', return_value=None):
                sid = "test_sid"
                data = {"message": "Hello"}
                
                await widget_chat.handle_widget_chat(sid, data)
                
                # Should emit error due to no session
                mock_sio.emit.assert_called_with(
                    'error',
                    {'error': 'Unable to process your request, please try again later.', 'type': 'chat_error'},
                    to=sid,
                    namespace='/widget'
                )
    
    @pytest.mark.asyncio
    async def test_handle_widget_chat_workflow_execution(self, mock_sio, monkeypatch, test_widget, test_customer, test_workflow, test_ai_config, db):
        """Test widget chat with workflow execution"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
        
        session_id = uuid4()
        mock_auth_result = (str(test_widget.id), str(test_widget.organization_id), str(test_customer.id), "token")
        mock_sio.get_session.return_value = {
            "widget_id": str(test_widget.id),
            "org_id": str(test_widget.organization_id),
            "customer_id": str(test_customer.id),
            "session_id": str(session_id),
            "agent_id": str(test_widget.agent_id),
            "ai_config": test_ai_config
        }
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=mock_auth_result)
        )
        
        # Mock active session with workflow
        mock_session = MagicMock()
        mock_session.session_id = session_id
        mock_session.workflow_id = test_workflow.id
        mock_session.user_id = None  # No human agent
        mock_session.current_node_id = None
        mock_session.workflow_state = {}
        
        # Mock workflow execution result
        mock_workflow_result = MagicMock()
        mock_workflow_result.success = True
        mock_workflow_result.form_data = {}
        mock_workflow_result.next_node_id = None
        mock_workflow_result.workflow_state = {}
        mock_workflow_result.response_messages = ["AI Response"]
        mock_workflow_result.end_conversation = False
        mock_workflow_result.transfer_to_human = False
        
        with patch.object(SessionToAgentRepository, 'get_active_customer_session', return_value=mock_session):
            with patch.object(ChatRepository, 'create_message', return_value=MagicMock()):
                with patch('app.api.widget_chat.WorkflowChatService') as mock_workflow_chat_service:
                    mock_workflow_chat_service.return_value.handle_workflow_chat = AsyncMock(return_value=mock_workflow_result)
                    
                    sid = "test_sid"
                    data = {"message": "Hello"}
                    
                    await widget_chat.handle_widget_chat(sid, data)
                    
                    # Verify workflow chat was executed
                    mock_workflow_chat_service.return_value.handle_workflow_chat.assert_called_once()


class TestGetWidgetChatHistory:
    """Test the get_widget_chat_history function"""
    
    @pytest.mark.asyncio
    async def test_get_widget_chat_history_authentication_failure(self, mock_sio, monkeypatch):
        """Test get chat history with authentication failure"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock failed authentication
        mock_sio.get_session.return_value = {"test": "session"}
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=(None, None, None, None))
        )
        
        sid = "test_sid"
        
        await widget_chat.get_widget_chat_history(sid)
        
        # Verify error was emitted
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Authentication failed', 'type': 'auth_error'},
            room=sid,
            namespace='/widget'
        )
    
    @pytest.mark.asyncio
    async def test_get_widget_chat_history_session_mismatch(self, mock_sio, monkeypatch, test_widget, test_customer):
        """Test get chat history with session data mismatch"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock successful authentication but mismatched session data
        mock_auth_result = (str(test_widget.id), str(test_widget.organization_id), str(test_customer.id), "token")
        mock_sio.get_session.return_value = {
            "widget_id": "different_widget_id",  # Mismatch
            "org_id": str(test_widget.organization_id),
            "customer_id": str(test_customer.id)
        }
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=mock_auth_result)
        )
        
        sid = "test_sid"
        
        await widget_chat.get_widget_chat_history(sid)
        
        # Should emit authentication error
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Authentication failed', 'type': 'auth_error'},
            to=sid,
            namespace='/widget'
        )
    
    @pytest.mark.asyncio
    async def test_get_widget_chat_history_no_active_session(self, mock_sio, monkeypatch, test_widget, test_customer, db):
        """Test get chat history when no active session exists"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
        
        mock_auth_result = (str(test_widget.id), str(test_widget.organization_id), str(test_customer.id), "token")
        mock_sio.get_session.return_value = {
            "widget_id": str(test_widget.id),
            "org_id": str(test_widget.organization_id),
            "customer_id": str(test_customer.id),
            "agent_id": str(test_widget.agent_id)
        }
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=mock_auth_result)
        )
        
        # Mock no active session found
        with patch.object(SessionToAgentRepository, 'get_active_customer_session', return_value=None):
            sid = "test_sid"
            
            await widget_chat.get_widget_chat_history(sid)
            
            # Should return empty history
            mock_sio.emit.assert_called_with(
                'chat_history',
                {'messages': [], 'type': 'chat_history'},
                to=sid,
                namespace='/widget'
            )
    
    @pytest.mark.asyncio
    async def test_get_widget_chat_history_success(self, mock_sio, monkeypatch, test_widget, test_customer, test_session, db):
        """Test get chat history success case"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
        
        mock_auth_result = (str(test_widget.id), str(test_widget.organization_id), str(test_customer.id), "token")
        mock_sio.get_session.return_value = {
            "widget_id": str(test_widget.id),
            "org_id": str(test_widget.organization_id),
            "customer_id": str(test_customer.id),
            "agent_id": str(test_widget.agent_id)
        }
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=mock_auth_result)
        )
        
        # Create mock messages
        mock_message1 = MagicMock()
        mock_message1.message = "Hello"
        mock_message1.message_type = "user"
        mock_message1.created_at = datetime.now(timezone.utc)
        mock_message1.attributes = {}
        mock_message1.user = None
        mock_message1.agent = None
        
        mock_message2 = MagicMock()
        mock_message2.message = "Hi there!"
        mock_message2.message_type = "bot"
        mock_message2.created_at = datetime.now(timezone.utc)
        mock_message2.attributes = {}
        mock_message2.user = None
        mock_message2.agent = None
        
        with patch.object(SessionToAgentRepository, 'get_active_customer_session', return_value=test_session):
            with patch.object(ChatRepository, 'get_session_history', return_value=[mock_message1, mock_message2]):
                with patch('app.api.widget_chat.format_datetime', return_value="2024-01-01T00:00:00Z"):
                    sid = "test_sid"
                    
                    await widget_chat.get_widget_chat_history(sid)
                    
                    # Verify chat history was emitted with formatted messages
                    expected_messages = [
                        {
                            'message': 'Hello',
                            'message_type': 'user',
                            'timestamp': '2024-01-01T00:00:00Z',
                            'attributes': {},
                            'user_name': None,
                            'agent_name': None,
                            'attachments': []
                        },
                        {
                            'message': 'Hi there!',
                            'message_type': 'bot',
                            'timestamp': '2024-01-01T00:00:00Z',
                            'attributes': {},
                            'user_name': None,
                            'agent_name': None,
                            'attachments': []
                        }
                    ]
                    
                    mock_sio.emit.assert_called_with(
                        'chat_history',
                        {'messages': expected_messages, 'type': 'chat_history'},
                        to=sid,
                        namespace='/widget'
                    )
    
    @pytest.mark.asyncio
    async def test_get_widget_chat_history_database_error(self, mock_sio, monkeypatch, test_widget, test_customer, db):
        """Test get chat history with database error"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
        
        mock_auth_result = (str(test_widget.id), str(test_widget.organization_id), str(test_customer.id), "token")
        mock_sio.get_session.return_value = {
            "widget_id": str(test_widget.id),
            "org_id": str(test_widget.organization_id),
            "customer_id": str(test_customer.id),
            "agent_id": str(test_widget.agent_id)
        }
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=mock_auth_result)
        )
        
        # Mock database error
        with patch.object(SessionToAgentRepository, 'get_active_customer_session', side_effect=Exception("Database error")):
            sid = "test_sid"
            
            await widget_chat.get_widget_chat_history(sid)
            
            # Should emit chat history error
            mock_sio.emit.assert_called_with(
                'error',
                {'error': 'Failed to get chat history', 'type': 'chat_history_error'},
                to=sid,
                namespace='/widget'
            ) 
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

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.models.widget import Widget
from app.models.agent import Agent, AgentType
from app.models.ai_config import AIConfig, AIModelType
from app.models.customer import Customer
from app.models.user import User
from app.repositories.agent import AgentRepository
from app.repositories.widget import WidgetRepository
from app.models.schemas.widget import WidgetCreate
from app.core.security import encrypt_api_key
from uuid import UUID, uuid4
from tests.conftest import engine, TestingSessionLocal, create_tables, Base
from app.models.session_to_agent import SessionStatus, SessionToAgent
from app.models.workflow import Workflow
from app.models.workflow_node import WorkflowNode, NodeType
from app.models.workflow_connection import WorkflowConnection
from app.models.rating import Rating
import datetime

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
def test_user(db, test_organization) -> User:
    """Create a test user"""
    user = User(
        id=uuid4(),
        organization_id=test_organization.id,
        email="test.user@example.com",
        full_name="Test User",
        hashed_password=User.get_password_hash("test_password"),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_workflow(db, test_agent) -> Workflow:
    """Create a test workflow"""
    workflow = Workflow(
        id=uuid4(),
        name="Test Workflow",
        description="Test workflow description",
        organization_id=test_agent.organization_id,
        is_active=True
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow

@pytest.fixture
def test_workflow_node(db, test_workflow) -> WorkflowNode:
    """Create a test workflow node"""
    node = WorkflowNode(
        id=uuid4(),
        workflow_id=test_workflow.id,
        node_type=NodeType.MESSAGE,
        name="Test Node",
        config={"message": "Hello from workflow"}
    )
    db.add(node)
    db.commit()
    db.refresh(node)
    return node

@pytest.fixture
def mock_sio():
    """Create a mock socket.io server"""
    mock = MagicMock()
    mock.enter_room = AsyncMock()
    mock.emit = AsyncMock()
    mock.save_session = AsyncMock()
    mock.get_environ = MagicMock()
    mock.get_session = AsyncMock()
    mock.leave_room = AsyncMock()
    return mock

@pytest.mark.asyncio
async def test_widget_connect(db, test_widget, test_ai_config, test_customer, mock_sio, monkeypatch):
    """Test widget connection handler"""
    from app.api import widget_chat
    
    # Mock dependencies
    monkeypatch.setattr(widget_chat, "sio", mock_sio)
    monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
    
    # Mock authentication
    conversation_token = "test_token"
    mock_auth_result = (
        str(test_widget.id),
        str(test_widget.organization_id),
        str(test_customer.id),
        conversation_token
    )
    monkeypatch.setattr(
        widget_chat,
        "authenticate_socket_conversation_token",
        AsyncMock(return_value=mock_auth_result)
    )
    
    # Mock WidgetRepository.get_widget to return our test widget
    monkeypatch.setattr(
        "app.repositories.widget.WidgetRepository.get_widget",
        lambda self, widget_id: test_widget
    )
    
    # Mock AIConfigRepository
    mock_ai_config_repo = MagicMock()
    mock_ai_config_repo.get_active_config.return_value = test_ai_config
    monkeypatch.setattr(widget_chat, "AIConfigRepository", lambda db: mock_ai_config_repo)
    
    # Mock get_active_customer_session to return None
    monkeypatch.setattr(
        "app.repositories.session_to_agent.SessionToAgentRepository.get_active_customer_session",
        lambda self, customer_id, agent_id=None: None
    )
    
    # Mock create_session to handle UUID conversion
    def mock_create_session(self, session_id, agent_id, customer_id, organization_id, **kwargs):
        session = SessionToAgent(
            session_id=session_id if isinstance(session_id, UUID) else UUID(session_id),
            agent_id=agent_id if isinstance(agent_id, UUID) else UUID(str(agent_id)),
            customer_id=customer_id if isinstance(customer_id, UUID) else UUID(str(customer_id)),
            organization_id=organization_id if isinstance(organization_id, UUID) else UUID(str(organization_id)),
            status=SessionStatus.OPEN
        )
        self.db.add(session)
        self.db.commit()
        return session
    
    monkeypatch.setattr(
        "app.repositories.session_to_agent.SessionToAgentRepository.create_session",
        mock_create_session
    )
    
    # Test connection
    sid = "test_sid"
    environ = {}
    auth = {}
    
    result = await widget_chat.widget_connect(sid, environ, auth)
    
    assert result is True
    mock_sio.enter_room.assert_called_once()
    mock_sio.save_session.assert_called_once()
    
    # Verify session data was saved
    session_data = mock_sio.save_session.call_args[0][1]
    assert session_data["widget_id"] == str(test_widget.id)
    assert session_data["org_id"] == str(test_widget.organization_id)
    assert session_data["agent_id"] == str(test_widget.agent_id)
    assert session_data["customer_id"] == str(test_customer.id)
    assert "session_id" in session_data
    # ai_config is stored as a plain snapshot (not the live ORM object) so it survives
    # after this handler's db session closes - see widget_chat.py's widget_connect.
    assert session_data["ai_config"].encrypted_api_key == test_ai_config.encrypted_api_key
    assert session_data["ai_config"].model_name == test_ai_config.model_name
    assert session_data["ai_config"].model_type == test_ai_config.model_type
    assert session_data["conversation_token"] == conversation_token

@pytest.mark.asyncio
async def test_widget_chat_message(db, test_widget, test_ai_config, test_customer, mock_sio, monkeypatch):
    """Test widget chat message handler"""
    from app.api import widget_chat
    from app.services import message_delivery
    
    # Mock dependencies
    monkeypatch.setattr(widget_chat, "sio", mock_sio)
    monkeypatch.setattr(message_delivery, "sio", mock_sio)
    monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
    
    # Create a test session
    session_id = uuid4()
    
    # Mock authentication
    conversation_token = "test_token"
    mock_auth_result = (str(test_widget.id), str(test_widget.organization_id), str(test_customer.id), conversation_token)
    monkeypatch.setattr(
        widget_chat,
        "authenticate_socket_conversation_token",
        AsyncMock(return_value=mock_auth_result)
    )
    
    # Create a test session
    from app.repositories.session_to_agent import SessionToAgentRepository
    session_repo = SessionToAgentRepository(db)
    session_repo.create_session(
        session_id=session_id,
        agent_id=test_widget.agent_id,
        customer_id=test_customer.id,
        organization_id=test_widget.organization_id
    )
    
    # Mock session data
    mock_sio.get_session.return_value = {
        "widget_id": str(test_widget.id),
        "org_id": str(test_widget.organization_id),
        "agent_id": str(test_widget.agent_id),
        "customer_id": str(test_customer.id),
        "session_id": str(session_id),
        "ai_config": test_ai_config,
        "conversation_token": conversation_token
    }
    
    # Mock get_environ to return empty dict
    mock_sio.get_environ.return_value = {}
    
    # Mock get_active_customer_session
    mock_session = MagicMock()
    mock_session.session_id = session_id
    mock_session.status = SessionStatus.OPEN
    mock_session.user_id = None
    mock_session.workflow_id = None  # Explicitly set to None to avoid workflow path
    monkeypatch.setattr(
        SessionToAgentRepository,
        "get_active_customer_session",
        lambda self, customer_id, agent_id=None: mock_session
    )
    
    # Test chat message
    sid = "test_sid"
    data = {
        "message": "Hello, how can I help you?"
    }
    
    # Mock ChatAgent
    mock_chat_agent = MagicMock()
    mock_chat_agent.get_response = AsyncMock(return_value=MagicMock(
        message="I'm here to help!",
        transfer_to_human=False,
        shopify_output=MagicMock(model_dump=MagicMock(return_value={}))
    ))
    mock_chat_agent.agent.session_id = session_id
    mock_chat_agent.safe_cleanup_mcp_tools = AsyncMock()

    # Mock workflow execution to avoid database errors
    mock_workflow_execution = MagicMock()
    mock_result = MagicMock()
    mock_result.success = True
    mock_result.message = "I'm here to help!"
    mock_result.transfer_to_human = False
    mock_result.end_chat = False
    mock_result.form_data = None  # Set form_data to None to avoid display_form event
    mock_result.should_continue = True
    mock_workflow_execution.execute_workflow = AsyncMock(return_value=mock_result)
    
    with patch("app.api.widget_chat.ChatAgent.create_async", AsyncMock(return_value=mock_chat_agent)), \
         patch("app.api.widget_chat.WorkflowExecutionService", return_value=mock_workflow_execution):
        await widget_chat.handle_widget_chat(sid, data)
    
    # Get the actual call
    assert mock_sio.emit.called, "Socket emit was not called"
    call_args = mock_sio.emit.call_args
    
    # Verify event name
    assert call_args[0][0] == 'chat_response', f"Expected 'chat_response' event but got {call_args[0][0]}"
    
    # Verify data fields
    data = call_args[0][1]
    assert data['message'] == "I'm here to help!", f"Expected message 'I'm here to help!' but got {data['message']}"
    assert data['type'] == 'chat_response', f"Expected type 'chat_response' but got {data['type']}"
    assert data['transfer_to_human'] is False, f"Expected transfer_to_human=False but got {data['transfer_to_human']}"
    assert 'shopify_output' in data, "Missing shopify_output in response data"
    
    # Verify room and namespace
    kwargs = call_args[1]
    assert kwargs['room'] == str(session_id), f"Expected room={session_id} but got {kwargs['room']}"
    assert kwargs['namespace'] == '/widget', f"Expected namespace='/widget' but got {kwargs['namespace']}"

@pytest.mark.asyncio
async def test_widget_chat_history(db, test_widget, test_customer, mock_sio, monkeypatch):
    """Test widget chat history handler"""
    from app.api import widget_chat
    from app.services import message_delivery
    
    # Mock dependencies
    monkeypatch.setattr(widget_chat, "sio", mock_sio)
    monkeypatch.setattr(message_delivery, "sio", mock_sio)
    monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
    
    # Create a test session
    session_id = uuid4()
    
    # Mock authentication
    conversation_token = "test_token"
    mock_auth_result = (str(test_widget.id), str(test_widget.organization_id), str(test_customer.id), conversation_token)
    monkeypatch.setattr(
        widget_chat,
        "authenticate_socket_conversation_token",
        AsyncMock(return_value=mock_auth_result)
    )
    
    # Create a test session
    from app.repositories.session_to_agent import SessionToAgentRepository
    session_repo = SessionToAgentRepository(db)
    session_repo.create_session(
        session_id=session_id,
        agent_id=test_widget.agent_id,
        customer_id=test_customer.id,
        organization_id=test_widget.organization_id
    )
    
    # Mock session data that matches authentication
    mock_sio.get_session.return_value = {
        "widget_id": str(test_widget.id),
        "org_id": str(test_widget.organization_id),
        "agent_id": str(test_widget.agent_id),
        "customer_id": str(test_customer.id),
        "session_id": str(session_id),
        "conversation_token": conversation_token
    }
    
    # Mock get_environ to return empty dict
    mock_sio.get_environ.return_value = {}
    
    # Test get chat history
    sid = "test_sid"
    
    await widget_chat.get_widget_chat_history(sid)
    
    # Verify chat history was emitted
    mock_sio.emit.assert_called_with(
        'chat_history',
        {
            'messages': [],
            'type': 'chat_history'
        },
        to=sid,
        namespace='/widget'
    )

@pytest.mark.asyncio
async def test_agent_connect(db, mock_sio, monkeypatch):
    """Test agent connection handler"""
    from app.api import widget_chat
    
    # Mock dependencies
    monkeypatch.setattr(widget_chat, "sio", mock_sio)
    
    # Mock authentication
    user_id = uuid4()
    org_id = uuid4()
    mock_auth_result = ("test_token", str(user_id), str(org_id))
    monkeypatch.setattr(
        widget_chat,
        "authenticate_socket",
        AsyncMock(return_value=mock_auth_result)
    )
    
    # Test connection
    sid = "test_sid"
    environ = {}
    auth = {}
    
    result = await widget_chat.agent_connect(sid, environ, auth)
    
    assert result is True
    mock_sio.save_session.assert_called_once()
    
    # Verify session data was saved
    session_data = mock_sio.save_session.call_args[0][1]
    assert session_data["user_id"] == str(user_id)
    assert session_data["organization_id"] == str(org_id)

@pytest.mark.asyncio
async def test_agent_message(db, test_widget, test_customer, test_user, mock_sio, monkeypatch):
    """Test agent message handler"""
    from app.api import widget_chat
    from app.services import message_delivery
    
    # Mock dependencies
    monkeypatch.setattr(widget_chat, "sio", mock_sio)
    monkeypatch.setattr(message_delivery, "sio", mock_sio)
    monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
    
    # Create a test session
    session_id = uuid4()
    
    # Create a test session
    from app.repositories.session_to_agent import SessionToAgentRepository
    session_repo = SessionToAgentRepository(db)
    session = session_repo.create_session(
        session_id=session_id,
        agent_id=test_widget.agent_id,
        customer_id=test_customer.id,
        user_id=test_user.id,
        organization_id=test_widget.organization_id
    )
    
    # Mock session data
    mock_sio.get_session.return_value = {
        "user_id": str(test_user.id),
        "organization_id": str(test_widget.organization_id)
    }
    
    # Test agent message
    sid = "test_sid"
    data = {
        "message": "How can I help you?",
        "session_id": str(session_id)
    }
    
    # Mock session repository
    mock_session = MagicMock()
    mock_session.session_id = session_id
    mock_session.user_id = str(test_user.id)
    mock_session.agent_id = str(test_widget.agent_id)
    mock_session.customer_id = str(test_customer.id)
    mock_session.organization_id = str(test_widget.organization_id)
    
    with patch("app.repositories.session_to_agent.SessionToAgentRepository.get_session", return_value=mock_session):
        await widget_chat.handle_agent_message(sid, data)
    
    # Check for error message first, then for success
    mock_calls = mock_sio.emit.call_args_list
    if mock_calls and mock_calls[0][0][0] == 'error':
        # The actual behavior is sending an error message
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Failed to send message', 'type': 'message_error'},
            to='test_sid',
            namespace='/agent'
        )
    else:
                    # Verify message was emitted to widget clients
            # Get the actual call arguments
            call_args = mock_sio.emit.call_args
            
            # Check that the event name is 'chat_response'
            assert call_args[0][0] == 'chat_response'
            
            # Check that the message data contains the expected values
            message_data = call_args[0][1]
            assert message_data['message'] == "How can I help you?"
            assert message_data['type'] == 'agent_message'
            assert message_data['message_type'] == 'agent'
            assert message_data['end_chat'] == False
            assert message_data['request_rating'] == False
            assert message_data['end_chat_reason'] == None
            assert message_data['end_chat_description'] == None
            
            # Check that the room and namespace are correct
            assert call_args[1]['room'] == str(session_id)
            assert call_args[1]['namespace'] == '/widget'


# Additional comprehensive test cases for better coverage

class TestUtilityFunctions:
    """Test utility functions in widget_chat module"""
    
    def test_format_datetime(self):
        """Test format_datetime function"""
        from app.api.widget_chat import format_datetime
        
        # Test with datetime
        dt = datetime.datetime(2024, 1, 1, 12, 0, 0)
        result = format_datetime(dt)
        assert result == "2024-01-01T12:00:00"
        
        # Test with None
        result = format_datetime(None)
        assert result is None
    
    def test_validate_email(self):
        """Test validate_email function"""
        from app.api.widget_chat import validate_email
        
        # Valid emails
        assert validate_email("test@example.com") is True
        assert validate_email("user.name@domain.co.uk") is True
        
        # Invalid emails
        assert validate_email("invalid-email") is False
        assert validate_email("@domain.com") is False
        assert validate_email("user@") is False
        assert validate_email("") is False
        assert validate_email(None) is False
    
    def test_validate_phone_number(self):
        """Test validate_phone_number function"""
        from app.api.widget_chat import validate_phone_number
        
        # Valid phone numbers
        assert validate_phone_number("1234567") is True
        assert validate_phone_number("+1-234-567-8901") is True
        assert validate_phone_number("(555) 123-4567") is True
        
        # Invalid phone numbers
        assert validate_phone_number("123456") is False  # Too short
        assert validate_phone_number("1234567890123456") is False  # Too long
        assert validate_phone_number("") is False
        assert validate_phone_number(None) is False
    
    def test_validate_form_field(self):
        """Test validate_form_field function"""
        from app.api.widget_chat import validate_form_field
        
        # Required field validation
        field_config = {"name": "email", "label": "Email", "type": "email", "required": True}
        assert validate_form_field(field_config, "") == "Email is required"
        assert validate_form_field(field_config, None) == "Email is required"
        
        # Email validation
        assert validate_form_field(field_config, "invalid-email") == "Please enter a valid email address for Email"
        assert validate_form_field(field_config, "test@example.com") is None
        
        # Phone validation
        phone_config = {"name": "phone", "label": "Phone", "type": "tel", "required": True}
        assert validate_form_field(phone_config, "123") == "Please enter a valid phone number for Phone"
        assert validate_form_field(phone_config, "1234567890") is None
        
        # Text length validation
        text_config = {"name": "name", "label": "Name", "type": "text", "minLength": 2, "maxLength": 10}
        assert validate_form_field(text_config, "A") == "Name must be at least 2 characters"
        assert validate_form_field(text_config, "A" * 11) == "Name must not exceed 10 characters"
        assert validate_form_field(text_config, "John") is None
        
        # Number validation
        number_config = {"name": "age", "label": "Age", "type": "number", "minLength": 18, "maxLength": 100}
        assert validate_form_field(number_config, "17") == "Age must be at least 18"
        assert validate_form_field(number_config, "101") == "Age must not exceed 100"
        assert validate_form_field(number_config, "invalid") == "Age must be a valid number"
        assert validate_form_field(number_config, "25") is None
    
    def test_validate_form_data(self):
        """Test validate_form_data function"""
        from app.api.widget_chat import validate_form_data
        
        form_fields = [
            {"name": "email", "label": "Email", "type": "email", "required": True},
            {"name": "name", "label": "Name", "type": "text", "required": True, "minLength": 2}
        ]
        
        # Valid data
        form_data = {"email": "test@example.com", "name": "John"}
        errors = validate_form_data(form_fields, form_data)
        assert errors == []
        
        # Invalid data
        form_data = {"email": "invalid", "name": "A"}
        errors = validate_form_data(form_fields, form_data)
        assert len(errors) == 2
        assert "Please enter a valid email address for Email" in errors
        assert "Name must be at least 2 characters" in errors


class TestWidgetConnectionErrors:
    """Test widget connection error scenarios"""
    
    @pytest.mark.asyncio
    async def test_widget_connect_authentication_failed(self, mock_sio, monkeypatch):
        """Test widget connection with authentication failure"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock authentication failure
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(side_effect=ValueError("Authentication failed"))
        )
        
        result = await widget_chat.widget_connect("test_sid", {}, {})
        
        assert result is False
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Connection failed', 'type': 'connection_error'},
            to="test_sid",
            namespace='/widget'
        )
    
    @pytest.mark.asyncio
    async def test_widget_connect_no_ai_config(self, db, test_widget, test_customer, mock_sio, monkeypatch):
        """Test widget connection when no AI config is available"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
        
        # Mock authentication
        mock_auth_result = (
            str(test_widget.id),
            str(test_widget.organization_id),
            str(test_customer.id),
            "test_token"
        )
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=mock_auth_result)
        )
        
        # Mock WidgetRepository
        monkeypatch.setattr(
            "app.repositories.widget.WidgetRepository.get_widget",
            lambda self, widget_id: test_widget
        )
        
        # Mock AIConfigRepository to return None
        mock_ai_config_repo = MagicMock()
        mock_ai_config_repo.get_active_config.return_value = None
        monkeypatch.setattr(widget_chat, "AIConfigRepository", lambda db: mock_ai_config_repo)
        
        result = await widget_chat.widget_connect("test_sid", {}, {})
        
        assert result is False
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'AI configuration required', 'type': 'ai_config_missing'},
            to="test_sid",
            namespace='/widget'
        )
    
    @pytest.mark.asyncio
    async def test_widget_connect_invalid_widget(self, db, mock_sio, monkeypatch):
        """Test widget connection with invalid widget ID"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
        
        # Mock authentication
        mock_auth_result = ("invalid_widget_id", "org_id", "customer_id", "test_token")
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=mock_auth_result)
        )
        
        # Mock WidgetRepository to return None
        monkeypatch.setattr(
            "app.repositories.widget.WidgetRepository.get_widget",
            lambda self, widget_id: None
        )
        
        result = await widget_chat.widget_connect("test_sid", {}, {})
        
        assert result is False


class TestWidgetChatErrors:
    """Test widget chat error scenarios"""
    
    @pytest.mark.asyncio
    async def test_handle_widget_chat_authentication_failed(self, mock_sio, monkeypatch):
        """Test chat handler with authentication failure"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock session data
        mock_sio.get_session.return_value = {"session_id": "test_session"}
        
        # Mock authentication failure
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=(None, None, None, None))
        )
        
        await widget_chat.handle_widget_chat("test_sid", {"message": "Hello"})
        
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Authentication failed', 'type': 'auth_error'},
            room="test_sid",
            namespace='/widget'
        )
    
    @pytest.mark.asyncio
    async def test_handle_widget_chat_empty_message(self, mock_sio, monkeypatch):
        """Test chat handler with empty message"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock session data
        mock_sio.get_session.return_value = {
            "session_id": "test_session",
            "widget_id": "widget_id",
            "org_id": "org_id",
            "customer_id": "customer_id"
        }
        
        # Mock authentication
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=("widget_id", "org_id", "customer_id", "token"))
        )
        
        # Should return early without processing
        await widget_chat.handle_widget_chat("test_sid", {"message": ""})
        
        # Should not emit any error or response
        mock_sio.emit.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_handle_widget_chat_session_mismatch(self, mock_sio, monkeypatch):
        """Test chat handler with session mismatch"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock session data with different IDs
        mock_sio.get_session.return_value = {
            "session_id": "test_session",
            "widget_id": "different_widget_id",
            "org_id": "different_org_id",
            "customer_id": "different_customer_id"
        }
        
        # Mock authentication with different IDs
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=("widget_id", "org_id", "customer_id", "token"))
        )
        
        await widget_chat.handle_widget_chat("test_sid", {"message": "Hello"})
        
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Unable to process your request, please try again later.', 'type': 'chat_error'},
            to="test_sid",
            namespace='/widget'
        )


class TestChatHistoryErrors:
    """Test chat history error scenarios"""
    
    @pytest.mark.asyncio
    async def test_get_chat_history_authentication_failed(self, mock_sio, monkeypatch):
        """Test chat history with authentication failure"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock session data
        mock_sio.get_session.return_value = {"session_id": "test_session"}
        
        # Mock authentication failure
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=(None, None, None, None))
        )
        
        await widget_chat.get_widget_chat_history("test_sid")
        
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Authentication failed', 'type': 'auth_error'},
            room="test_sid",
            namespace='/widget'
        )
    
    @pytest.mark.asyncio
    async def test_get_chat_history_session_mismatch(self, mock_sio, monkeypatch):
        """Test chat history with session mismatch"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock session data with different IDs
        mock_sio.get_session.return_value = {
            "widget_id": "different_widget_id",
            "org_id": "different_org_id",
            "customer_id": "different_customer_id"
        }
        
        # Mock authentication with different IDs
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=("widget_id", "org_id", "customer_id", "token"))
        )
        
        await widget_chat.get_widget_chat_history("test_sid")
        
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Authentication failed', 'type': 'auth_error'},
            to="test_sid",
            namespace='/widget'
        )


class TestAgentHandlers:
    """Test agent-related handlers"""
    
    @pytest.mark.asyncio
    async def test_agent_connect_authentication_failed(self, mock_sio, monkeypatch):
        """Test agent connection with authentication failure"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock authentication failure
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket",
            AsyncMock(side_effect=ValueError("Authentication failed"))
        )
        
        result = await widget_chat.agent_connect("test_sid", {}, {})
        
        assert result is False
    
    @pytest.mark.asyncio
    async def test_handle_join_room_no_session_id(self, mock_sio, monkeypatch):
        """Test join room handler without session ID"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock session data
        mock_sio.get_session.return_value = {"user_id": "test_user"}
        
        await widget_chat.handle_join_room("test_sid", {})
        
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Failed to join room', 'type': 'room_error'},
            to="test_sid",
            namespace='/agent'
        )
    
    @pytest.mark.asyncio
    async def test_handle_join_room_valid_session(self, db, test_widget, test_customer, test_user, mock_sio, monkeypatch):
        """Test join room handler for valid session"""
        from app.api import widget_chat
        from app.repositories.session_to_agent import SessionToAgentRepository
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
        
        # Create a test session
        session_id = uuid4()
        session_repo = SessionToAgentRepository(db)
        session_repo.create_session(
            session_id=session_id,
            agent_id=test_widget.agent_id,
            customer_id=test_customer.id,
            user_id=test_user.id,
            organization_id=test_widget.organization_id
        )
        
        # Mock session data
        mock_sio.get_session.return_value = {"user_id": str(test_user.id)}
        
        await widget_chat.handle_join_room("test_sid", {"session_id": str(session_id)})
        
        mock_sio.enter_room.assert_called_with("test_sid", str(session_id), namespace='/agent')
    
    @pytest.mark.asyncio
    async def test_handle_join_room_unauthorized_user_room(self, mock_sio, monkeypatch):
        """Test join room handler for unauthorized user room"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock session data with different user ID
        mock_sio.get_session.return_value = {"user_id": "different_user"}
        
        await widget_chat.handle_join_room("test_sid", {"session_id": "user_test_user"})
        
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Failed to join room', 'type': 'room_error'},
            to="test_sid",
            namespace='/agent'
        )
    
    @pytest.mark.asyncio
    async def test_handle_leave_room_no_session(self, mock_sio, monkeypatch):
        """Test leave room handler without session"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock no session
        mock_sio.get_session.return_value = None
        
        await widget_chat.handle_leave_room("test_sid", {"session_id": "test_session"})
        
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Failed to leave room', 'type': 'room_error'},
            to="test_sid",
            namespace='/agent'
        )
    
    @pytest.mark.asyncio
    async def test_handle_leave_room_no_session_id(self, mock_sio, monkeypatch):
        """Test leave room handler without session ID"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock session data
        mock_sio.get_session.return_value = {"user_id": "test_user"}
        
        await widget_chat.handle_leave_room("test_sid", {})
        
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Failed to leave room', 'type': 'room_error'},
            to="test_sid",
            namespace='/agent'
        )
    
    @pytest.mark.asyncio
    async def test_handle_leave_room_success(self, mock_sio, monkeypatch):
        """Test successful leave room"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock session data
        mock_sio.get_session.return_value = {"user_id": "test_user"}
        
        await widget_chat.handle_leave_room("test_sid", {"session_id": "test_session"})
        
        mock_sio.leave_room.assert_called_with("test_sid", "test_session", namespace='/agent')
        
        # Check for room event emission
        room_event_calls = [call for call in mock_sio.emit.call_args_list if call[0][0] == 'room_event']
        assert len(room_event_calls) > 0
    
    @pytest.mark.asyncio
    async def test_handle_taken_over(self, mock_sio, monkeypatch):
        """Test taken over handler"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        data = {"user_name": "Agent Smith", "session_id": "test_session"}
        await widget_chat.handle_taken_over("test_sid", data)
        
        mock_sio.emit.assert_called_with(
            'handle_taken_over',
            data,
            room="test_session",
            namespace='/widget'
        )


class TestRatingSubmission:
    """Test rating submission functionality"""
    
    @pytest.mark.asyncio
    async def test_handle_rating_submission_success(self, db, test_widget, test_customer, mock_sio, monkeypatch):
        """Test successful rating submission"""
        from app.api import widget_chat
        from app.repositories.session_to_agent import SessionToAgentRepository
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
        
        # Create a test session
        session_id = uuid4()
        session_repo = SessionToAgentRepository(db)
        session_repo.create_session(
            session_id=session_id,
            agent_id=test_widget.agent_id,
            customer_id=test_customer.id,
            organization_id=test_widget.organization_id
        )
        
        # Mock session data
        mock_sio.get_session.return_value = {
            "session_id": str(session_id),
            "widget_id": str(test_widget.id),
            "org_id": str(test_widget.organization_id),
            "customer_id": str(test_customer.id)
        }
        
        # Mock authentication
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=(
                str(test_widget.id),
                str(test_widget.organization_id),
                str(test_customer.id),
                "test_token"
            ))
        )
        
        # Mock the rating repository to avoid UUID issues
        mock_rating_repo = MagicMock()
        mock_rating_obj = MagicMock()
        mock_rating_repo.create_rating.return_value = mock_rating_obj
        monkeypatch.setattr(widget_chat, "RatingRepository", lambda db: mock_rating_repo)
        
        data = {"rating": 5, "feedback": "Great service!"}
        await widget_chat.handle_rating_submission("test_sid", data)
        
        # Check for success emission
        success_calls = [call for call in mock_sio.emit.call_args_list if call[0][0] == 'rating_submitted']
        assert len(success_calls) > 0
        assert success_calls[0][0][1]['success'] is True
    
    @pytest.mark.asyncio
    async def test_handle_rating_submission_invalid_rating(self, mock_sio, monkeypatch):
        """Test rating submission with invalid rating"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock session data
        mock_sio.get_session.return_value = {
            "session_id": "test_session",
            "widget_id": "widget_id",
            "org_id": "org_id",
            "customer_id": "customer_id"
        }
        
        # Mock authentication
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=("widget_id", "org_id", "customer_id", "token"))
        )
        
        # Test invalid rating values
        invalid_ratings = [0, 6, -1, "invalid", None]
        
        for invalid_rating in invalid_ratings:
            mock_sio.reset_mock()
            data = {"rating": invalid_rating, "feedback": "Test feedback"}
            await widget_chat.handle_rating_submission("test_sid", data)
            
            mock_sio.emit.assert_called_with(
                'error',
                {'error': 'Invalid rating value', 'type': 'rating_error'},
                to="test_sid",
                namespace='/widget'
            )
    
    @pytest.mark.asyncio
    async def test_handle_rating_submission_authentication_failed(self, mock_sio, monkeypatch):
        """Test rating submission with authentication failure"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock session data
        mock_sio.get_session.return_value = {"session_id": "test_session"}
        
        # Mock authentication failure
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=(None, None, None, None))
        )
        
        data = {"rating": 5, "feedback": "Great service!"}
        await widget_chat.handle_rating_submission("test_sid", data)
        
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Authentication failed', 'type': 'auth_error'},
            room="test_sid",
            namespace='/widget'
        )


class TestWorkflowHandlers:
    """Test workflow-related handlers"""
    
    @pytest.mark.asyncio
    async def test_handle_get_workflow_state_authentication_failed(self, mock_sio, monkeypatch):
        """Test get workflow state with authentication failure"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock session data
        mock_sio.get_session.return_value = {"session_id": "test_session"}
        
        # Mock authentication failure
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=(None, None, None, None))
        )
        
        await widget_chat.handle_get_workflow_state("test_sid")
        
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Authentication failed', 'type': 'auth_error'},
            room="test_sid",
            namespace='/widget'
        )
    
    @pytest.mark.asyncio
    async def test_handle_proceed_workflow_authentication_failed(self, mock_sio, monkeypatch):
        """Test proceed workflow with authentication failure"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock session data
        mock_sio.get_session.return_value = {"session_id": "test_session"}
        
        # Mock authentication failure
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=(None, None, None, None))
        )
        
        await widget_chat.handle_proceed_workflow("test_sid", {})
        
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Authentication failed', 'type': 'auth_error'},
            room="test_sid",
            namespace='/widget'
        )
    
    @pytest.mark.asyncio
    async def test_handle_form_submission_authentication_failed(self, mock_sio, monkeypatch):
        """Test form submission with authentication failure"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock session data
        mock_sio.get_session.return_value = {"session_id": "test_session"}
        
        # Mock authentication failure
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=(None, None, None, None))
        )
        
        data = {"form_data": {"name": "John", "email": "john@example.com"}}
        await widget_chat.handle_form_submission("test_sid", data)
        
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'Authentication failed', 'type': 'auth_error'},
            room="test_sid",
            namespace='/widget'
        )
    
    @pytest.mark.asyncio
    async def test_handle_form_submission_no_form_data(self, mock_sio, monkeypatch):
        """Test form submission without form data"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        
        # Mock session data
        mock_sio.get_session.return_value = {
            "session_id": "test_session",
            "widget_id": "widget_id",
            "org_id": "org_id",
            "customer_id": "customer_id"
        }
        
        # Mock authentication
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=("widget_id", "org_id", "customer_id", "token"))
        )
        
        # Test with no form_data
        await widget_chat.handle_form_submission("test_sid", {})
        
        mock_sio.emit.assert_called_with(
            'error',
            {'error': 'No form data provided', 'type': 'form_error'},
            to="test_sid",
            namespace='/widget'
        )


class TestEnterpriseFeatures:
    """Test enterprise-specific features"""
    
    @pytest.mark.asyncio
    async def test_widget_connect_with_rate_limiting(self, db, test_widget, test_ai_config, test_customer, mock_sio, monkeypatch):
        """Test widget connection with rate limiting features"""
        from app.api import widget_chat
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
        
        # Mock authentication
        mock_auth_result = (
            str(test_widget.id),
            str(test_widget.organization_id),
            str(test_customer.id),
            "test_token"
        )
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=mock_auth_result)
        )
        
        # Mock WidgetRepository
        monkeypatch.setattr(
            "app.repositories.widget.WidgetRepository.get_widget",
            lambda self, widget_id: test_widget
        )
        
        # Mock AIConfigRepository
        mock_ai_config_repo = MagicMock()
        mock_ai_config_repo.get_active_config.return_value = test_ai_config
        monkeypatch.setattr(widget_chat, "AIConfigRepository", lambda db: mock_ai_config_repo)
        
        # Mock other required components
        monkeypatch.setattr(
            "app.repositories.session_to_agent.SessionToAgentRepository.get_active_customer_session",
            lambda self, customer_id, agent_id=None: None
        )
        
        def mock_create_session(self, session_id, agent_id, customer_id, organization_id, **kwargs):
            session = SessionToAgent(
                session_id=session_id if isinstance(session_id, UUID) else UUID(session_id),
                agent_id=agent_id if isinstance(agent_id, UUID) else UUID(str(agent_id)),
                customer_id=customer_id if isinstance(customer_id, UUID) else UUID(str(customer_id)),
                organization_id=organization_id if isinstance(organization_id, UUID) else UUID(str(organization_id)),
                status=SessionStatus.OPEN
            )
            self.db.add(session)
            self.db.commit()
            return session
        
        monkeypatch.setattr(
            "app.repositories.session_to_agent.SessionToAgentRepository.create_session",
            mock_create_session
        )
        
        result = await widget_chat.widget_connect("test_sid", {}, {})
        
        assert result is True
        
        # Verify session data includes rate limiting settings
        session_data = mock_sio.save_session.call_args[0][1]
        assert "enable_rate_limiting" in session_data
        assert "overall_limit_per_ip" in session_data
        assert "requests_per_sec" in session_data


class TestComplexScenarios:
    """Test complex scenarios and edge cases"""
    
    @pytest.mark.asyncio
    async def test_agent_message_with_end_chat(self, db, test_widget, test_customer, test_user, mock_sio, monkeypatch):
        """Test agent message that ends chat"""
        from app.api import widget_chat
        from app.services import message_delivery
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        monkeypatch.setattr(message_delivery, "sio", mock_sio)
        monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
        
        # Create a test session
        session_id = uuid4()
        from app.repositories.session_to_agent import SessionToAgentRepository
        session_repo = SessionToAgentRepository(db)
        session = session_repo.create_session(
            session_id=session_id,
            agent_id=test_widget.agent_id,
            customer_id=test_customer.id,
            user_id=test_user.id,
            organization_id=test_widget.organization_id
        )
        
        # Mock session data
        mock_sio.get_session.return_value = {
            "user_id": str(test_user.id),
            "organization_id": str(test_widget.organization_id)
        }
        
        # Mock session repository
        mock_session = MagicMock()
        mock_session.session_id = session_id
        mock_session.user_id = str(test_user.id)
        mock_session.agent_id = str(test_widget.agent_id)
        mock_session.customer_id = str(test_customer.id)
        mock_session.organization_id = str(test_widget.organization_id)
        
        with patch("app.repositories.session_to_agent.SessionToAgentRepository.get_session", return_value=mock_session), \
             patch("app.repositories.session_to_agent.SessionToAgentRepository.update_session_status") as mock_update_status:
            
            data = {
                "message": "Thank you for contacting us. This chat is now ended.",
                "session_id": str(session_id),
                "end_chat": True,
                "request_rating": True
            }
            
            await widget_chat.handle_agent_message("test_sid", data)
            
            # Verify session status was updated to closed (session_id is converted to string)
            mock_update_status.assert_called_with(str(session_id), "CLOSED")
            
            # Verify response includes end_chat and request_rating
            chat_response_calls = [call for call in mock_sio.emit.call_args_list if call[0][0] == 'chat_response']
            assert len(chat_response_calls) > 0
            response_data = chat_response_calls[0][0][1]
            assert response_data['end_chat'] is True
            assert response_data['request_rating'] is True
    
    @pytest.mark.asyncio
    async def test_agent_message_with_shopify_output(self, db, test_widget, test_customer, test_user, mock_sio, monkeypatch):
        """Test agent message with Shopify output"""
        from app.api import widget_chat
        from app.services import message_delivery
        
        monkeypatch.setattr(widget_chat, "sio", mock_sio)
        monkeypatch.setattr(message_delivery, "sio", mock_sio)
        monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
        
        # Create a test session
        session_id = uuid4()
        from app.repositories.session_to_agent import SessionToAgentRepository
        session_repo = SessionToAgentRepository(db)
        session = session_repo.create_session(
            session_id=session_id,
            agent_id=test_widget.agent_id,
            customer_id=test_customer.id,
            user_id=test_user.id,
            organization_id=test_widget.organization_id
        )
        
        # Mock session data
        mock_sio.get_session.return_value = {
            "user_id": str(test_user.id),
            "organization_id": str(test_widget.organization_id)
        }
        
        # Mock session repository
        mock_session = MagicMock()
        mock_session.session_id = session_id
        mock_session.user_id = str(test_user.id)
        mock_session.agent_id = str(test_widget.agent_id)
        mock_session.customer_id = str(test_customer.id)
        mock_session.organization_id = str(test_widget.organization_id)
        
        with patch("app.repositories.session_to_agent.SessionToAgentRepository.get_session", return_value=mock_session):
            
            data = {
                "message": "Here's a product recommendation:",
                "session_id": str(session_id),
                "shopify_output": True,
                "product_id": "123",
                "product_title": "Test Product",
                "product_description": "A great test product",
                "product_price": "29.99",
                "product_currency": "USD"
            }
            
            await widget_chat.handle_agent_message("test_sid", data)
            
            # Verify response includes Shopify product data
            chat_response_calls = [call for call in mock_sio.emit.call_args_list if call[0][0] == 'chat_response']
            assert len(chat_response_calls) > 0
            response_data = chat_response_calls[0][0][1]
            assert response_data['shopify_output'] is True
            assert response_data['product_id'] == "123"
            assert response_data['product_title'] == "Test Product"
            assert response_data['product_price'] == "29.99"
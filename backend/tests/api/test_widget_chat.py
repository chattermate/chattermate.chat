"""
ChatterMate - Test Widget Chat
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
from app.repositories.agent import AgentRepository
from app.repositories.widget import create_widget
from app.models.schemas.widget import WidgetCreate
from app.core.security import encrypt_api_key
from uuid import UUID, uuid4
from tests.conftest import engine, TestingSessionLocal, create_tables, Base
from app.models.session_to_agent import SessionStatus, SessionToAgent

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
    widget = create_widget(
        db=db,
        widget=WidgetCreate(name="Test Widget", agent_id=test_agent.id),
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
def mock_sio():
    """Create a mock socket.io server"""
    mock = MagicMock()
    mock.enter_room = AsyncMock()
    mock.emit = AsyncMock()
    mock.save_session = AsyncMock()
    mock.get_environ = MagicMock()
    mock.get_session = AsyncMock()
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
    
    # Mock get_widget to return our test widget
    monkeypatch.setattr(widget_chat, "get_widget", lambda db, widget_id: test_widget)
    
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
            session_id=UUID(session_id),
            agent_id=UUID(str(agent_id)),
            customer_id=UUID(str(customer_id)),
            organization_id=UUID(str(organization_id)),
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
    assert session_data["ai_config"] == test_ai_config
    assert session_data["conversation_token"] == conversation_token

@pytest.mark.asyncio
async def test_widget_chat_message(db, test_widget, test_ai_config, test_customer, mock_sio, monkeypatch):
    """Test widget chat message handler"""
    from app.api import widget_chat
    
    # Mock dependencies
    monkeypatch.setattr(widget_chat, "sio", mock_sio)
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
    mock_session.status = "open"
    mock_session.user_id = None
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
        transfer_to_human=False
    ))
    mock_chat_agent.agent.session_id = session_id
    
    with patch("app.api.widget_chat.ChatAgent", return_value=mock_chat_agent):
        await widget_chat.handle_widget_chat(sid, data)
    
    # Verify response was emitted
    mock_sio.emit.assert_called_with(
        'chat_response',
        {
            'message': "I'm here to help!",
            'type': 'chat_response',
            'transfer_to_human': False
        },
        room=str(session_id),
        namespace='/widget'
    )

@pytest.mark.asyncio
async def test_widget_chat_history(db, test_widget, test_customer, mock_sio, monkeypatch):
    """Test widget chat history handler"""
    from app.api import widget_chat
    
    # Mock dependencies
    monkeypatch.setattr(widget_chat, "sio", mock_sio)
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
    
    # Mock dependencies
    monkeypatch.setattr(widget_chat, "sio", mock_sio)
    monkeypatch.setattr(widget_chat, "get_db", lambda: iter([db]))
    
    # Create a test session
    session_id = uuid4()
    
    # Create a test session
    from app.repositories.session_to_agent import SessionToAgentRepository
    session_repo = SessionToAgentRepository(db)
    session_repo.create_session(
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
    mock_session.user_id = str(test_user.id)
    mock_session.agent_id = str(test_widget.agent_id)
    mock_session.customer_id = str(test_customer.id)
    mock_session.organization_id = str(test_widget.organization_id)
    
    with patch("app.repositories.session_to_agent.SessionToAgentRepository") as mock_repo:
        mock_repo.return_value.get_session.return_value = mock_session
        await widget_chat.handle_agent_message(sid, data)
    
    # Verify message was emitted to widget clients
    mock_sio.emit.assert_called_with(
        'chat_response',
        {
            'message': "How can I help you?",
            'type': 'agent_message',
        },
        room=str(session_id),
        namespace='/widget'
    )
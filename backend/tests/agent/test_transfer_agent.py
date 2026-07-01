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
import pytz
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock, AsyncMock
import sys
from app.agents.transfer_agent import TransferResponseAgent, get_agent_availability_response
from app.models.chat_history import ChatHistory
from app.models.agent import Agent, AgentType
from app.models.organization import Organization
from app.models.user import User, UserGroup
from uuid import uuid4
import app.utils.agno_utils
from fastapi import HTTPException

# Mock for agno.agent.Agent
class MockPhiAgent:
    def __init__(self, *args, **kwargs):
        self.instructions = kwargs.get('instructions', [])
        self.response_content = "I'll transfer you to a human agent who can help you better."
    
    async def arun(self, message=None, stream=False):
        return MagicMock(content=self.response_content)

@pytest.fixture
def test_organization():
    """Create a test organization with business hours"""
    org = Organization(
        id=str(uuid4()),
        name="Test Organization",
        timezone="UTC",
        business_hours={
            'monday': {'start': '09:00', 'end': '17:00', 'enabled': True},
            'tuesday': {'start': '09:00', 'end': '17:00', 'enabled': True},
            'wednesday': {'start': '09:00', 'end': '17:00', 'enabled': True},
            'thursday': {'start': '09:00', 'end': '17:00', 'enabled': True},
            'friday': {'start': '09:00', 'end': '17:00', 'enabled': True},
            'saturday': {'start': '09:00', 'end': '17:00', 'enabled': False},
            'sunday': {'start': '09:00', 'end': '17:00', 'enabled': False}
        }
    )
    return org

@pytest.fixture
def test_agent(test_organization):
    """Create a test agent with groups"""
    agent = Agent(
        id=str(uuid4()),
        name="Test Agent",
        display_name="Test Display Name",
        organization_id=test_organization.id,
        organization=test_organization,
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Be helpful", "Be concise"],
        groups=[]
    )
    return agent

@pytest.fixture
def test_user_group():
    """Create a test user group"""
    group = UserGroup(
        id=str(uuid4()),
        name="Test Group",
        users=[]
    )
    return group

@pytest.fixture
def test_user(test_user_group):
    """Create a test user"""
    user = User(
        id=str(uuid4()),
        email="test@example.com",
        full_name="Test User",
        is_online=True,
        is_active=True
    )
    test_user_group.users.append(user)
    return user

@pytest.fixture
def test_chat_history():
    """Create test chat history"""
    return [
        ChatHistory(
            id=str(uuid4()),
            session_id=str(uuid4()),
            message="Hello, I need help with my account",
            message_type="user"
        ),
        ChatHistory(
            id=str(uuid4()),
            session_id=str(uuid4()),
            message="I'll do my best to help you. What's the issue?",
            message_type="agent"
        ),
        ChatHistory(
            id=str(uuid4()),
            session_id=str(uuid4()),
            message="I can't access my dashboard",
            message_type="user"
        )
    ]

@pytest.mark.skip(reason="Needs further investigation for proper mocking")
@pytest.mark.asyncio
async def test_transfer_response_agent_initialization():
    """Test TransferResponseAgent initialization with different model types"""
    
    # Create a spy to track calls to create_model
    create_model_calls = []
    original_create_model = app.utils.agno_utils.create_model
    
    def spy_create_model(*args, **kwargs):
        create_model_calls.append((args, kwargs))
        return MagicMock()
    
    # Mock AgentRepository to avoid database calls
    mock_agent_repo = MagicMock()
    mock_agent_repo.get_by_agent_id.return_value = None
    
    # Test with OpenAI model
    with patch('app.agents.transfer_agent.AgentRepository', return_value=mock_agent_repo), \
         patch('app.utils.agno_utils.create_model', side_effect=spy_create_model), \
         patch('app.agents.transfer_agent.Agent', return_value=MockPhiAgent()), \
         patch('app.agents.transfer_agent.next', return_value=MagicMock()):
        
        # Reset call history
        create_model_calls.clear()
        
        agent = TransferResponseAgent(
            api_key="test_key",
            model_name="gpt-4",
            model_type="OPENAI"
        )
        
        # Verify create_model was called with expected args
        assert len(create_model_calls) == 1
        kwargs = create_model_calls[0][1]
        assert kwargs['model_type'] == "OPENAI"
        assert kwargs['api_key'] == "test_key"
        assert kwargs['model_name'] == "gpt-4"
        assert kwargs['max_tokens'] == 1000
        
        assert isinstance(agent.agent, MockPhiAgent)
    
    # Test with Anthropic model
    with patch('app.agents.transfer_agent.AgentRepository', return_value=mock_agent_repo), \
         patch('app.utils.agno_utils.create_model', side_effect=spy_create_model), \
         patch('app.agents.transfer_agent.Agent', return_value=MockPhiAgent()), \
         patch('app.agents.transfer_agent.next', return_value=MagicMock()):
        
        # Reset call history
        create_model_calls.clear()
        
        agent = TransferResponseAgent(
            api_key="test_key",
            model_name="claude-3-opus",
            model_type="ANTHROPIC"
        )
        
        # Verify create_model was called with expected args
        assert len(create_model_calls) == 1
        kwargs = create_model_calls[0][1]
        assert kwargs['model_type'] == "ANTHROPIC"
        assert kwargs['api_key'] == "test_key"
        assert kwargs['model_name'] == "claude-3-opus"
        assert kwargs['max_tokens'] == 1000
        
        assert isinstance(agent.agent, MockPhiAgent)
    
    # Test with unsupported model
    with patch('app.agents.transfer_agent.AgentRepository', return_value=mock_agent_repo), \
         patch('app.utils.agno_utils.create_model', side_effect=ValueError("Unsupported model type: UNKNOWN")), \
         patch('app.agents.transfer_agent.next', return_value=MagicMock()):
        
        with pytest.raises(ValueError) as excinfo:
            TransferResponseAgent(
                api_key="test_key",
                model_name="unknown-model",
                model_type="UNKNOWN"
            )
        
        assert "Unsupported model type" in str(excinfo.value)

@pytest.mark.asyncio
async def test_get_business_context():
    """Test get_business_context method"""
    
    # Mock AgentRepository to avoid database calls
    mock_agent_repo = MagicMock()
    mock_agent_repo.get_by_agent_id.return_value = None
    
    with patch('app.agents.transfer_agent.AgentRepository', return_value=mock_agent_repo), \
         patch('app.utils.agno_utils.create_model', return_value=MagicMock()), \
         patch('app.agents.transfer_agent.Agent', return_value=MockPhiAgent()):
        
        agent = TransferResponseAgent(
            api_key="test_key",
            model_name="gpt-4",
            model_type="OPENAI"
        )
        
        # Test with valid business hours
        business_hours = {
            'monday': {'start': '09:00', 'end': '17:00', 'enabled': True},
            'tuesday': {'start': '09:00', 'end': '17:00', 'enabled': True},
            'wednesday': {'start': '09:00', 'end': '17:00', 'enabled': True},
            'thursday': {'start': '09:00', 'end': '17:00', 'enabled': True},
            'friday': {'start': '09:00', 'end': '17:00', 'enabled': True},
            'saturday': {'start': '09:00', 'end': '17:00', 'enabled': False},
            'sunday': {'start': '09:00', 'end': '17:00', 'enabled': False}
        }
        
        context = await agent.get_business_context(business_hours, 5)
        
        assert "Business Hours:" in context
        assert "Monday: 09:00 - 17:00" in context
        assert "Saturday: Closed" in context
        assert "Available Agents: 5" in context
        
        # Test with exception handling
        context = await agent.get_business_context(None, 5)
        assert "Business Hours:" in context
        assert "Available Agents: 5" in context

@pytest.mark.asyncio
async def test_get_transfer_response():
    """Test get_transfer_response method"""
    
    # Mock AgentRepository to avoid database calls
    mock_agent_repo = MagicMock()
    mock_agent_repo.get_by_agent_id.return_value = None
    
    with patch('app.agents.transfer_agent.AgentRepository', return_value=mock_agent_repo), \
         patch('app.utils.agno_utils.create_model', return_value=MagicMock()), \
         patch('app.agents.transfer_agent.Agent', return_value=MockPhiAgent()):
        
        agent = TransferResponseAgent(
            api_key="test_key",
            model_name="gpt-4",
            model_type="OPENAI"
        )
        
        # Mock agent's arun method
        agent.agent.arun = AsyncMock(return_value=MagicMock(content="I'll transfer you to a human agent."))
        
        # Test with business hours and available agents
        response = await agent.get_transfer_response(
            chat_history=[
                MagicMock(message_type="user", message="I need help"),
                MagicMock(message_type="agent", message="How can I help?")
            ],
            business_hours={
                'monday': {'start': '09:00', 'end': '17:00', 'enabled': True}
            },
            available_agents=3,
            is_business_hours=True,
            customer_email="customer@example.com"
        )
        
        assert response["message"] == "I'll transfer you to a human agent."
        assert response["transfer_to_human"] is True
        
        # Test outside business hours
        response = await agent.get_transfer_response(
            chat_history=[
                MagicMock(message_type="user", message="I need help"),
                MagicMock(message_type="agent", message="How can I help?")
            ],
            business_hours={
                'monday': {'start': '09:00', 'end': '17:00', 'enabled': True}
            },
            available_agents=3,
            is_business_hours=False,
            customer_email="customer@example.com"
        )
        
        assert response["message"] == "I'll transfer you to a human agent."
        assert response["transfer_to_human"] is False

@pytest.mark.asyncio
async def test_get_agent_availability_response(test_agent, test_user_group, test_user, test_chat_history):
    """Test get_agent_availability_response function"""
    
    # Setup test data
    test_agent.groups = [test_user_group]
    
    # Mock dependencies
    mock_db = MagicMock()
    mock_customer_repo = MagicMock()
    mock_customer_repo.get_customer_email.return_value = "customer@example.com"
    
    mock_group_repo = MagicMock()
    mock_group_repo.get_group_with_users.return_value = test_user_group
    
    # Mock TransferResponseAgent
    mock_transfer_agent = MagicMock()
    mock_transfer_agent.get_transfer_response = AsyncMock(
        return_value={
            "message": "I'll transfer you to a human agent.",
            "transfer_to_human": True
        }
    )
    
    with patch('app.agents.transfer_agent.CustomerRepository', return_value=mock_customer_repo), \
         patch('app.agents.transfer_agent.GroupRepository', return_value=mock_group_repo), \
         patch('app.agents.transfer_agent.TransferResponseAgent', return_value=mock_transfer_agent), \
         patch('app.agents.transfer_agent.datetime') as mock_datetime:
        
        # Mock current time to be within business hours
        mock_now = MagicMock()
        mock_now.strftime.return_value = "monday"
        mock_now.hour = 12
        mock_now.minute = 0
        mock_datetime.now.return_value = mock_now
        
        # Test with valid agent and within business hours
        response = await get_agent_availability_response(
            agent=test_agent,
            customer_id="customer123",
            chat_history=test_chat_history,
            db=mock_db,
            api_key="test_key",
            model_name="gpt-4",
            model_type="OPENAI",
            session_id="test_session_id"
        )
        
        assert response["message"] == "I'll transfer you to a human agent."
        assert response["transfer_to_human"] is True
        
        # Test with no agent groups
        test_agent.groups = []
        response = await get_agent_availability_response(
            agent=test_agent,
            customer_id="customer123",
            chat_history=test_chat_history,
            db=mock_db,
            api_key="test_key",
            model_name="gpt-4",
            model_type="OPENAI",
            session_id="test_session_id"
        )
        
        assert "unable to transfer" in response["message"]
        assert response["transfer_to_human"] is False

@pytest.mark.asyncio
async def test_business_hours_calculation(test_agent, test_organization):
    """Test business hours calculation logic"""

    # Setup test data
    test_agent.groups = []
    test_agent.id = "test-agent-id"
    test_organization.business_hours = {
        'monday': {'start': '09:00', 'end': '17:00', 'enabled': True},
    }
    test_agent.organization = test_organization

    # Mock dependencies
    mock_db = MagicMock()
    mock_customer_repo = MagicMock()
    mock_group_repo = MagicMock()
    mock_get_db = MagicMock(return_value=iter([mock_db]))

    # Create a real TransferResponseAgent mock that will be returned by our patch
    mock_transfer_agent = MagicMock()
    mock_transfer_agent.get_transfer_response = AsyncMock(
        return_value={
            "message": "I'll transfer you to a human agent.",
            "transfer_to_human": True
        }
    )

    with patch('app.agents.transfer_agent.CustomerRepository', return_value=mock_customer_repo), \
         patch('app.agents.transfer_agent.GroupRepository', return_value=mock_group_repo), \
         patch('app.agents.transfer_agent.get_db', return_value=mock_get_db), \
         patch('app.agents.transfer_agent.TransferResponseAgent', return_value=mock_transfer_agent):

        # Test case: The agent has no groups, so it should return the default message
        response = await get_agent_availability_response(
            agent=test_agent,
            customer_id="customer123",
            chat_history=[],
            db=mock_db,
            api_key="test_key",
            model_name="gpt-4",
            model_type="OPENAI",
            session_id="test_session_id"
        )

        # Verify the response matches the expected default for agents with no groups
        assert response == {
            "message": "I apologize, but I'm unable to transfer the chat at this time.",
            "transfer_to_human": False
        }
        
        # Now add a group with users to test the full flow
        mock_group = MagicMock()
        mock_group.id = "group-id"
        test_agent.groups = [mock_group]
        
        # Mock the group repository to return a group with online users
        mock_db_group = MagicMock()
        mock_user = MagicMock()
        mock_user.is_online = True
        mock_user.is_active = True
        mock_db_group.users = [mock_user]
        mock_group_repo.get_group_with_users.return_value = mock_db_group
        
        # Test again with a group that has an online user
        response = await get_agent_availability_response(
            agent=test_agent,
            customer_id="customer123",
            chat_history=[],
            db=mock_db,
            api_key="test_key",
            model_name="gpt-4",
            model_type="OPENAI",
            session_id="test_session_id"
        )
        
        # Now the TransferResponseAgent should be called and its response returned
        assert mock_transfer_agent.get_transfer_response.called
        assert response == {
            "message": "I'll transfer you to a human agent.",
            "transfer_to_human": True
        }

@pytest.mark.asyncio
async def test_timezone_handling(test_agent):
    """Test timezone handling in get_agent_availability_response"""

    # Setup test data
    test_agent.groups = []
    test_agent.id = "test-agent-id"
    test_agent.organization = MagicMock()
    test_agent.organization.timezone = "America/New_York"
    test_agent.organization.business_hours = {
        'monday': {'start': '09:00', 'end': '17:00', 'enabled': True},
    }

    # Mock dependencies
    mock_db = MagicMock()
    mock_customer_repo = MagicMock()
    mock_group_repo = MagicMock()
    mock_get_db = MagicMock(return_value=iter([mock_db]))

    # Mock TransferResponseAgent
    mock_transfer_agent = MagicMock()
    mock_transfer_agent.get_transfer_response = AsyncMock(
        return_value={
            "message": "I'll transfer you to a human agent.",
            "transfer_to_human": True
        }
    )

    # Add a group with users to test the full flow
    mock_group = MagicMock()
    mock_group.id = "group-id"
    test_agent.groups = [mock_group]
    
    # Mock the group repository to return a group with online users
    mock_db_group = MagicMock()
    mock_user = MagicMock()
    mock_user.is_online = True
    mock_user.is_active = True
    mock_db_group.users = [mock_user]
    
    with patch('app.agents.transfer_agent.CustomerRepository', return_value=mock_customer_repo), \
         patch('app.agents.transfer_agent.GroupRepository', return_value=mock_group_repo), \
         patch('app.agents.transfer_agent.get_db', return_value=mock_get_db), \
         patch('app.agents.transfer_agent.TransferResponseAgent', return_value=mock_transfer_agent), \
         patch('app.agents.transfer_agent.pytz', autospec=True) as mock_pytz:
        
        # Test with valid timezone
        mock_group_repo.get_group_with_users.return_value = mock_db_group
        mock_pytz.timezone.side_effect = lambda tz: pytz.timezone(tz)
        mock_pytz.UTC = pytz.UTC
        mock_pytz.UnknownTimeZoneError = pytz.exceptions.UnknownTimeZoneError
        
        response = await get_agent_availability_response(
            agent=test_agent,
            customer_id="customer123",
            chat_history=[],
            db=mock_db,
            api_key="test_key",
            model_name="gpt-4",
            model_type="OPENAI",
            session_id="test_session_id"
        )
        
        # Verify that timezone was called with the correct timezone
        mock_pytz.timezone.assert_called_with("America/New_York")
        
        # Test with invalid timezone
        mock_pytz.timezone.reset_mock()
        mock_pytz.timezone.side_effect = pytz.exceptions.UnknownTimeZoneError("Invalid/Timezone")
        test_agent.organization.timezone = "Invalid/Timezone"
        
        response = await get_agent_availability_response(
            agent=test_agent,
            customer_id="customer123",
            chat_history=[],
            db=mock_db,
            api_key="test_key",
            model_name="gpt-4",
            model_type="OPENAI",
            session_id="test_session_id"
        )
        
        # Verify that timezone was called with the invalid timezone
        mock_pytz.timezone.assert_called_with("Invalid/Timezone") 
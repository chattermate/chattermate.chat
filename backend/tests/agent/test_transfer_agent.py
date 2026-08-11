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
import pytz
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock, AsyncMock
import sys
from app.agents.transfer_agent import (
    FOLLOW_UP_NEEDS_EMAIL_TIMEOUT_MESSAGE,
    FOLLOW_UP_TIMEOUT_MESSAGE,
    TRANSFER_TIMEOUT_MESSAGE,
    TransferResponseAgent,
    get_agent_availability_response,
)
from app.core.config import settings
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
async def test_get_transfer_response_timeout():
    """A stuck transfer run is cancelled and falls back to a plain handoff line,
    keeping the routing decision intact (issue #269)."""
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

        async def hung_run(*args, **kwargs):
            await asyncio.sleep(60)

        agent.agent.arun = hung_run
        business_hours = {'monday': {'start': '09:00', 'end': '17:00', 'enabled': True}}

        with patch.object(settings, 'AGENT_RUN_TIMEOUT', 1):
            # Agents available -> still transfers, with the fallback wording
            response = await agent.get_transfer_response(
                chat_history=[],
                business_hours=business_hours,
                available_agents=3,
                is_business_hours=True,
                customer_email=None
            )
            assert response["message"] == TRANSFER_TIMEOUT_MESSAGE
            assert response["transfer_to_human"] is True

            # Nobody available and no email on file -> the fallback has to ask
            # for one, or the follow-up it promises can never happen.
            response = await agent.get_transfer_response(
                chat_history=[],
                business_hours=business_hours,
                available_agents=0,
                is_business_hours=False,
                customer_email=None
            )
            assert response["message"] == FOLLOW_UP_NEEDS_EMAIL_TIMEOUT_MESSAGE
            assert response["transfer_to_human"] is False

            # Nobody available but we already know where to reach them -> no ask.
            response = await agent.get_transfer_response(
                chat_history=[],
                business_hours=business_hours,
                available_agents=0,
                is_business_hours=False,
                customer_email="known@acme.com"
            )
            assert response["message"] == FOLLOW_UP_TIMEOUT_MESSAGE
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

# ---------- asking for an email when nobody can pick the chat up ----------

async def _prompt_for(available_agents, is_business_hours, customer_email):
    """Run get_transfer_response and return the prompt the LLM was given."""
    mock_agent_repo = MagicMock()
    mock_agent_repo.get_by_agent_id.return_value = None
    with patch('app.agents.transfer_agent.AgentRepository', return_value=mock_agent_repo), \
         patch('app.utils.agno_utils.create_model', return_value=MagicMock()), \
         patch('app.agents.transfer_agent.Agent', return_value=MockPhiAgent()):
        agent = TransferResponseAgent(api_key="k", model_name="gpt-4", model_type="OPENAI")
        agent.agent.arun = AsyncMock(return_value=MagicMock(content="ok"))
        await agent.get_transfer_response(
            chat_history=[MagicMock(message_type="user", message="I want a human")],
            business_hours={'monday': {'start': '09:00', 'end': '17:00', 'enabled': True}},
            available_agents=available_agents,
            is_business_hours=is_business_hours,
            customer_email=customer_email,
        )
        return agent.agent.arun.call_args.kwargs["message"]


@pytest.mark.asyncio
async def test_asks_for_email_when_nobody_is_available_and_none_on_file():
    """The reported bug: out of hours with no email, the visitor was told the team
    would follow up and never asked how. The team then opens a chat with no way to
    reach anyone."""
    prompt = await _prompt_for(available_agents=0, is_business_hours=False, customer_email=None)

    assert "ASK them to reply with their email address" in prompt
    assert "Do NOT ask for an email" not in prompt


@pytest.mark.asyncio
async def test_asks_for_email_when_in_hours_but_no_agents_online():
    """Same dead end — business hours don't matter if nobody is online."""
    prompt = await _prompt_for(available_agents=0, is_business_hours=True, customer_email=None)

    assert "ASK them to reply with their email address" in prompt


@pytest.mark.asyncio
async def test_does_not_ask_when_a_human_is_actually_joining():
    """A live transfer needs no email — a person is arriving in this chat."""
    prompt = await _prompt_for(available_agents=3, is_business_hours=True, customer_email=None)

    assert "do NOT ask for an email" in prompt
    assert "ASK them to reply with their email address" not in prompt


@pytest.mark.asyncio
async def test_does_not_ask_when_the_email_is_already_known():
    prompt = await _prompt_for(
        available_agents=0, is_business_hours=False, customer_email="known@acme.com"
    )

    assert "will follow up at known@acme.com" in prompt
    assert "ASK them to reply with their email address" not in prompt


@pytest.mark.asyncio
async def test_never_invents_a_form_link_or_placeholder_address():
    """These guards exist because the model used to emit fake addresses and
    links to forms that don't exist; asking for an email must not lose them."""
    prompt = await _prompt_for(available_agents=0, is_business_hours=False, customer_email=None)

    assert "never write a URL" in prompt
    assert "Do NOT mention, reference, or link to any form" in prompt


@pytest.mark.asyncio
async def test_timeout_fallback_still_asks_when_there_is_no_email():
    """A stuck LLM run must not silently drop the ask — the canned line has to
    carry it too, or a timeout reintroduces the same dead end."""
    mock_agent_repo = MagicMock()
    mock_agent_repo.get_by_agent_id.return_value = None
    with patch('app.agents.transfer_agent.AgentRepository', return_value=mock_agent_repo), \
         patch('app.utils.agno_utils.create_model', return_value=MagicMock()), \
         patch('app.agents.transfer_agent.Agent', return_value=MockPhiAgent()):
        agent = TransferResponseAgent(api_key="k", model_name="gpt-4", model_type="OPENAI")

        async def _hang(*a, **kw):
            await asyncio.sleep(3600)

        agent.agent.arun = _hang
        with patch.object(settings, "AGENT_RUN_TIMEOUT", 0.01):
            no_email = await agent.get_transfer_response(
                chat_history=[MagicMock(message_type="user", message="human please")],
                business_hours={'monday': {'start': '09:00', 'end': '17:00', 'enabled': True}},
                available_agents=0, is_business_hours=False, customer_email=None,
            )
            known = await agent.get_transfer_response(
                chat_history=[MagicMock(message_type="user", message="human please")],
                business_hours={'monday': {'start': '09:00', 'end': '17:00', 'enabled': True}},
                available_agents=0, is_business_hours=False, customer_email="a@b.com",
            )

    assert no_email["message"] == FOLLOW_UP_NEEDS_EMAIL_TIMEOUT_MESSAGE
    assert "email" in no_email["message"].lower()
    assert known["message"] == FOLLOW_UP_TIMEOUT_MESSAGE

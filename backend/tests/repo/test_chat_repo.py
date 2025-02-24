"""
ChatterMate - Test Chat Repo
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
from datetime import datetime
from app.repositories.chat import ChatRepository
from app.models.chat_history import ChatHistory
from app.models.customer import Customer
from app.models.agent import Agent, AgentType
from app.models.session_to_agent import SessionToAgent, SessionStatus
from app.models.user import User, UserGroup
from uuid import uuid4, UUID

@pytest.fixture
def chat_repo(db):
    return ChatRepository(db)

@pytest.fixture
def test_data(db, test_organization_id):
    """Create test data including customer, agent, user, and session"""
    customer = Customer(
        id=uuid4(),
        email="customer@test.com",
        full_name="Test Customer",
        organization_id=test_organization_id
    )
    db.add(customer)

    agent = Agent(
        id=uuid4(),
        name="test-agent",
        display_name="Test Agent",
        organization_id=test_organization_id,
        description="Test agent description",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Be helpful"],
        is_active=True
    )
    db.add(agent)

    user = User(
        id=uuid4(),
        email="user@test.com",
        full_name="Test User",
        hashed_password="dummy_hash",
        is_active=True,
        organization_id=test_organization_id
    )
    db.add(user)

    # Create a test group
    group = UserGroup(
        id=uuid4(),
        name="Test Group",
        description="Test group description",
        organization_id=test_organization_id
    )
    db.add(group)
    db.flush()

    session_id = uuid4()
    session = SessionToAgent(
        session_id=session_id,
        organization_id=test_organization_id,
        agent_id=agent.id,
        user_id=user.id,
        customer_id=customer.id,
        status=SessionStatus.OPEN,
        group_id=group.id
    )
    db.add(session)

    # Add some chat messages
    messages = []
    for i in range(3):
        message = ChatHistory(
            organization_id=test_organization_id,
            session_id=session_id,
            customer_id=customer.id,
            agent_id=agent.id,
            user_id=user.id,
            message=f"Test message {i}",
            message_type="text",
            attributes={"key": f"value{i}"}
        )
        messages.append(message)
        db.add(message)

    db.commit()
    
    return {
        "org_id": test_organization_id,
        "customer": customer,
        "agent": agent,
        "user": user,
        "session_id": session_id,
        "messages": messages,
        "group": group
    }

def test_create_message(chat_repo, test_data):
    """Test creating a new chat message"""
    message_data = {
        "organization_id": test_data["org_id"],
        "session_id": test_data["session_id"],
        "customer_id": test_data["customer"].id,
        "agent_id": test_data["agent"].id,
        "user_id": test_data["user"].id,
        "message": "New test message",
        "message_type": "text",
        "attributes": {"test": "value"}
    }

    message = chat_repo.create_message(message_data)
    assert message is not None
    assert message.message == "New test message"
    assert message.message_type == "text"
    assert message.attributes == {"test": "value"}

def test_get_session_history(chat_repo, test_data):
    """Test retrieving chat history for a session"""
    history = chat_repo.get_session_history(test_data["session_id"])
    
    assert len(history) == 3
    for i, msg in enumerate(history):
        assert msg.message == f"Test message {i}"
        assert msg.user is not None
        assert msg.agent is not None

def test_get_user_history(chat_repo, test_data):
    """Test retrieving chat history for a user"""
    history = chat_repo.get_user_history(test_data["user"].id)
    
    assert len(history) == 3
    for msg in history:
        assert msg.user_id == test_data["user"].id

def test_get_recent_chats(chat_repo, test_data):
    """Test retrieving recent chat overviews"""
    chats = chat_repo.get_recent_chats(
        organization_id=test_data["org_id"],
        user_id=test_data["user"].id,
        user_groups=[str(test_data["group"].id)]
    )
    
    assert len(chats) == 1
    chat = chats[0]
    assert chat["customer"]["email"] == "customer@test.com"
    assert chat["agent"]["name"] == "test-agent"
    assert chat["message_count"] == 3
    assert chat["status"] == SessionStatus.OPEN
    assert chat["group_id"] == str(test_data["group"].id)

@pytest.mark.asyncio
async def test_check_session_access(chat_repo, test_data):
    """Test checking session access"""
    # Test access with user_id
    has_access = await chat_repo.check_session_access(
        test_data["session_id"],
        test_data["user"].id,
        [str(test_data["group"].id)]
    )
    assert has_access is True

    # Test access with group
    has_access = await chat_repo.check_session_access(
        test_data["session_id"],
        uuid4(),  # Different user
        [str(test_data["group"].id)]
    )
    assert has_access is True

    # Test no access
    has_access = await chat_repo.check_session_access(
        test_data["session_id"],
        uuid4(),  # Different user
        [str(uuid4())]  # Different group
    )
    assert has_access is False

@pytest.mark.asyncio
async def test_get_chat_detail(chat_repo, test_data):
    """Test retrieving detailed chat information"""
    detail = await chat_repo.get_chat_detail(
        test_data["session_id"],
        test_data["org_id"]
    )
    
    assert detail is not None
    assert detail["customer"]["email"] == "customer@test.com"
    assert detail["agent"]["name"] == "test-agent"
    assert detail["status"] == SessionStatus.OPEN
    assert detail["group_id"] == str(test_data["group"].id)
    assert detail["user_id"] == test_data["user"].id
    assert detail["user_name"] == "Test User"
    assert len(detail["messages"]) == 3

@pytest.mark.asyncio
async def test_get_nonexistent_chat_detail(chat_repo):
    """Test retrieving detail for nonexistent chat"""
    detail = await chat_repo.get_chat_detail(uuid4(), uuid4())
    assert detail is None 
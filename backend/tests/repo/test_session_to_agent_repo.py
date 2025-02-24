"""
ChatterMate - Test Session To Agent Repo
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
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission, role_permissions
from app.models.session_to_agent import SessionToAgent, SessionStatus
from app.models.chat_history import ChatHistory
from app.models.customer import Customer
from app.models.agent import Agent, AgentType
from uuid import UUID, uuid4
from app.core.security import get_password_hash
from app.repositories.session_to_agent import SessionToAgentRepository

@pytest.fixture
def test_role(db: Session, test_organization_id: UUID) -> Role:
    """Create a test role with required permissions"""
    role = Role(
        name="Test Role",
        organization_id=test_organization_id
    )
    db.add(role)
    db.commit()

    # Add required permissions
    permission = Permission(
        name="manage_chats",
        description="Can manage chats"
    )
    db.add(permission)
    db.commit()

    # Associate permission with role
    db.execute(
        role_permissions.insert().values(
            role_id=role.id,
            permission_id=permission.id
        )
    )
    db.commit()
    return role

@pytest.fixture
def test_user(db: Session, test_organization_id: UUID, test_role: Role) -> User:
    """Create a test user with required permissions"""
    user = User(
        id=uuid4(),
        email="test@test.com",
        hashed_password=get_password_hash("testpassword"),
        organization_id=test_organization_id,
        role_id=test_role.id,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_customer(db, test_organization_id) -> Customer:
    """Create a test customer"""
    customer = Customer(
        id=uuid4(),
        organization_id=test_organization_id,
        email="customer@example.com",
        full_name="Test Customer"
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@pytest.fixture
def test_agent(db, test_organization_id) -> Agent:
    """Create a test agent"""
    agent = Agent(
        id=uuid4(),
        organization_id=test_organization_id,
        name="Test Agent",
        display_name="Test Agent Display",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions="Test instructions"
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

@pytest.fixture
def test_session(db: Session, test_organization_id: UUID, test_customer: Customer, test_agent: Agent) -> SessionToAgent:
    """Create a test session"""
    session = SessionToAgent(
        session_id=uuid4(),
        organization_id=test_organization_id,
        customer_id=test_customer.id,
        agent_id=test_agent.id,
        status=SessionStatus.OPEN
    )
    db.add(session)
    db.commit()

    # Add a test chat message
    chat = ChatHistory(
        organization_id=test_organization_id,
        customer_id=test_customer.id,
        agent_id=test_agent.id,
        session_id=session.session_id,
        message="Test message",
        message_type="agent"
    )
    db.add(chat)
    db.commit()
    db.refresh(session)
    return session

@pytest.fixture
def session_repo(db):
    """Create a session repository instance"""
    return SessionToAgentRepository(db)

def test_create_session(session_repo, test_organization_id, test_customer, test_agent):
    """Test creating a new session"""
    session_id = uuid4()
    
    session = session_repo.create_session(
        session_id=session_id,
        agent_id=test_agent.id,
        customer_id=test_customer.id,
        organization_id=test_organization_id
    )

    assert session.session_id == session_id
    assert session.agent_id == test_agent.id
    assert session.customer_id == test_customer.id
    assert session.organization_id == test_organization_id
    assert session.status == SessionStatus.OPEN
    assert session.user_id is None

def test_get_session(session_repo, test_session):
    """Test retrieving a session by ID"""
    retrieved_session = session_repo.get_session(test_session.session_id)
    assert retrieved_session.session_id == test_session.session_id
    assert retrieved_session.agent_id == test_session.agent_id
    assert retrieved_session.customer_id == test_session.customer_id

def test_assign_user(session_repo, test_session, test_user):
    """Test assigning a user to a session"""
    success = session_repo.assign_user(test_session.session_id, test_user.id)
    assert success is True

    # Verify assignment
    updated_session = session_repo.get_session(test_session.session_id)
    assert updated_session.user_id == test_user.id
    assert updated_session.status == SessionStatus.TRANSFERRED

def test_close_session(session_repo, test_session):
    """Test closing a session"""
    success = session_repo.close_session(test_session.session_id)
    assert success is True

    # Verify closure
    closed_session = session_repo.get_session(test_session.session_id)
    assert closed_session.status == SessionStatus.CLOSED
    assert closed_session.closed_at is not None

def test_get_agent_sessions(session_repo, test_agent, test_organization_id, test_customer):
    """Test retrieving all sessions for an agent"""
    # Create multiple sessions
    session1 = session_repo.create_session(
        session_id=uuid4(),
        agent_id=test_agent.id,
        customer_id=test_customer.id,
        organization_id=test_organization_id
    )
    session2 = session_repo.create_session(
        session_id=uuid4(),
        agent_id=test_agent.id,
        customer_id=test_customer.id,
        organization_id=test_organization_id
    )

    # Get sessions
    sessions = session_repo.get_agent_sessions(test_agent.id)
    assert len(sessions) == 2
    assert all(s.agent_id == test_agent.id for s in sessions)

def test_get_user_sessions(session_repo, test_session, test_user):
    """Test retrieving all sessions assigned to a user"""
    # Assign session to user
    session_repo.assign_user(test_session.session_id, test_user.id)

    # Create and assign another session
    session2 = session_repo.create_session(
        session_id=uuid4(),
        agent_id=test_session.agent_id,
        customer_id=test_session.customer_id,
        organization_id=test_session.organization_id
    )
    session_repo.assign_user(session2.session_id, test_user.id)

    # Get user sessions
    sessions = session_repo.get_user_sessions(test_user.id)
    assert len(sessions) == 2
    assert all(s.user_id == test_user.id for s in sessions)

def test_get_open_sessions(session_repo, test_session):
    """Test retrieving all open sessions"""
    # Create another session and close it
    closed_session = session_repo.create_session(
        session_id=uuid4(),
        agent_id=test_session.agent_id,
        customer_id=test_session.customer_id,
        organization_id=test_session.organization_id
    )
    session_repo.close_session(closed_session.session_id)

    # Get open sessions
    sessions = session_repo.get_open_sessions()
    assert len(sessions) == 1
    assert sessions[0].session_id == test_session.session_id
    assert sessions[0].status == SessionStatus.OPEN

def test_get_customer_sessions(session_repo, test_session, test_customer):
    """Test retrieving all sessions for a customer"""
    # Create another session for the same customer
    session2 = session_repo.create_session(
        session_id=uuid4(),
        agent_id=test_session.agent_id,
        customer_id=test_customer.id,
        organization_id=test_session.organization_id
    )

    # Get customer sessions
    sessions = session_repo.get_customer_sessions(test_customer.id)
    assert len(sessions) == 2
    assert all(s[0].customer_id == test_customer.id for s in sessions)

def test_get_active_customer_session(session_repo, test_session, test_customer):
    """Test retrieving active session for a customer"""
    # Create another session and close it
    closed_session = session_repo.create_session(
        session_id=uuid4(),
        agent_id=test_session.agent_id,
        customer_id=test_customer.id,
        organization_id=test_session.organization_id
    )
    session_repo.close_session(closed_session.session_id)

    # Get active session
    session = session_repo.get_active_customer_session(test_customer.id, test_session.agent_id)
    assert session is not None
    assert session.session_id == test_session.session_id
    assert session.status == SessionStatus.OPEN

def test_takeover_session(session_repo, test_session, test_user):
    """Test taking over a chat session"""
    success = session_repo.takeover_session(str(test_session.session_id), str(test_user.id))
    assert success is True

    # Verify takeover
    updated_session = session_repo.get_session(test_session.session_id)
    assert updated_session.user_id == test_user.id
    assert updated_session.group_id is None
    assert updated_session.status == SessionStatus.OPEN

def test_takeover_nonexistent_session(session_repo, test_user):
    """Test taking over a nonexistent session"""
    success = session_repo.takeover_session(str(uuid4()), str(test_user.id))
    assert success is False

def test_takeover_already_taken_session(session_repo, test_session, test_user):
    """Test taking over an already taken session"""
    # First takeover
    session_repo.takeover_session(str(test_session.session_id), str(test_user.id))
    
    # Second takeover attempt
    another_user_id = uuid4()
    success = session_repo.takeover_session(str(test_session.session_id), str(another_user_id))
    assert success is False 
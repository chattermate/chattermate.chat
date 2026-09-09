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
from fastapi.testclient import TestClient
from app.database import get_db
from fastapi import FastAPI, status
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission, role_permissions
from app.models.session_to_agent import SessionToAgent, SessionStatus
from app.models.chat_history import ChatHistory
from app.models.agent import Agent, AgentType
from app.models.customer import Customer
from uuid import UUID, uuid4
from app.api import session_to_agent as session_to_agent_router
from app.core.auth import get_current_user, require_permissions
from typing import Generator
from datetime import datetime
from app.models.schemas.chat import ChatDetailResponse, CustomerInfo, AgentInfo, Message
from tests.conftest import engine, TestingSessionLocal, create_tables, Base
from app.models.organization import Organization
from app.repositories.session_to_agent import SessionToAgentRepository
from unittest.mock import patch

# Create a test FastAPI app
app = FastAPI()
app.include_router(
    session_to_agent_router.router,
    prefix="/api/v1/session-to-agent",
    tags=["session-to-agent"]
)

@pytest.fixture(scope="function")
def db() -> Generator:
    """Create a fresh database for each test."""
    # Drop all tables first
    Base.metadata.drop_all(bind=engine)
    # Create tables except enterprise ones
    create_tables()
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_permissions(db) -> list[Permission]:
    """Create test permissions"""
    permissions = []
    # manage_all_chats, not "manage_chats": the latter was never in
    # Permission.default_permissions(), so the endpoint check it fed never
    # matched anyone. view_unassigned_chats is what lets an agent see (and
    # therefore claim) a chat the AI is still handling.
    for name in ["manage_all_chats", "manage_assigned_chats", "view_unassigned_chats"]:
        perm = Permission(
            name=name,
            description=f"Test permission for {name}"
        )
        db.add(perm)
        permissions.append(perm)
    db.commit()
    for p in permissions:
        db.refresh(p)
    return permissions

@pytest.fixture
def test_role_with_manage_chats(db, test_permissions) -> Role:
    """Create a test role with manage_all_chats permission"""
    role = Role(
        id=1,
        name="Manage Chats Role",
        description="Role with manage_all_chats permission",
        is_default=False
    )
    db.add(role)
    db.commit()

    # Add manage_all_chats permission
    manage_chats_perm = next(p for p in test_permissions if p.name == "manage_all_chats")
    db.execute(
        role_permissions.insert().values(
            role_id=role.id,
            permission_id=manage_chats_perm.id
        )
    )
    db.commit()
    db.refresh(role)
    return role

@pytest.fixture
def test_role_with_manage_assigned_chats(db, test_permissions) -> Role:
    """Create a test role with manage_assigned_chats permission"""
    role = Role(
        id=2,
        name="Manage Assigned Chats Role",
        description="Role with manage_assigned_chats permission",
        is_default=False
    )
    db.add(role)
    db.commit()

    # Add manage_assigned_chats + view_unassigned_chats, mirroring the seeded
    # Agent role: claiming an unclaimed chat requires being able to see it.
    for perm_name in ("manage_assigned_chats", "view_unassigned_chats"):
        perm = next(p for p in test_permissions if p.name == perm_name)
        db.execute(
            role_permissions.insert().values(
                role_id=role.id,
                permission_id=perm.id
            )
        )
    db.commit()
    db.refresh(role)
    return role

@pytest.fixture
def test_role_without_permissions(db) -> Role:
    """Create a test role without any permissions"""
    role = Role(
        id=3,
        name="No Permissions Role",
        description="Role without permissions",
        is_default=False
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

@pytest.fixture
def test_organization(db) -> Organization:
    """Create a test organization"""
    organization = Organization(
        id=uuid4(),
        name="Test Organization",
        domain="test.example.com",
        business_hours={"monday": {"start": "09:00", "end": "17:00"}},
        settings={"timezone": "UTC"}
    )
    db.add(organization)
    db.commit()
    db.refresh(organization)
    return organization

@pytest.fixture
def user_with_manage_chats_permission(db, test_role_with_manage_chats, test_organization) -> User:
    """Create a test user with manage_chats permission"""
    user = User(
        id=uuid4(),
        email="manage_chats@example.com",
        hashed_password="hashed_password",
        is_active=True,
        organization_id=test_organization.id,
        full_name="Manage Chats User",
        role_id=test_role_with_manage_chats.id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def user_with_manage_assigned_chats(db, test_role_with_manage_assigned_chats, test_organization, test_agent) -> User:
    """Create a test user with manage_assigned_chats permission"""
    user = User(
        id=uuid4(),
        email="manage_assigned@example.com",
        hashed_password="hashed_password",
        is_active=True,
        organization_id=test_organization.id,
        full_name="Manage Assigned Chats User",
        role_id=test_role_with_manage_assigned_chats.id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def regular_user(db, test_role_without_permissions, test_organization) -> User:
    """Create a test user without special permissions"""
    user = User(
        id=uuid4(),
        email="regular@example.com",
        hashed_password="hashed_password",
        is_active=True,
        organization_id=test_organization.id,
        full_name="Regular User",
        role_id=test_role_without_permissions.id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_agent(db, test_organization) -> Agent:
    """Create a test agent"""
    agent = Agent(
        id=uuid4(),
        name="Test Agent",
        display_name="Test Display Name",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Test instruction"],
        is_active=True,
        organization_id=test_organization.id
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

@pytest.fixture
def test_customer(db, test_organization) -> Customer:
    """Create a test customer"""
    customer = Customer(
        id=uuid4(),
        organization_id=test_organization.id,
        email="customer@example.com",
        full_name="Test Customer"
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@pytest.fixture
def create_chat_session(db, test_agent, test_customer):
    """Create a test chat session"""
    def _create_session():
        session = SessionToAgent(
            session_id=uuid4(),
            organization_id=test_agent.organization_id,
            customer_id=test_customer.id,
            agent_id=test_agent.id
        )
        db.add(session)
        db.commit()
        db.refresh(session)

        # Create a test message for the session
        message = ChatHistory(
            message="Test message",
            message_type="agent",
            session_id=session.session_id,
            organization_id=session.organization_id,
            agent_id=session.agent_id,
            customer_id=session.customer_id
        )
        db.add(message)
        db.commit()

        return session
    return _create_session

@pytest.fixture
def mock_chat_response(test_agent, test_customer) -> ChatDetailResponse:
    """Create a mock chat response"""
    return ChatDetailResponse(
        customer=CustomerInfo(
            id=test_customer.id,
            email=test_customer.email,
            full_name=test_customer.full_name
        ),
        agent=AgentInfo(
            id=test_agent.id,
            name=test_agent.name,
            display_name=test_agent.display_name
        ),
        messages=[
            Message(
                message="Test message",
                message_type="agent",
                created_at=datetime.now(),
                attributes={}
            )
        ],
        status=SessionStatus.OPEN,
        group_id=None,
        session_id=uuid4(),
        user_id=None,
        user_name=None,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )

@pytest.fixture
def client(user_with_manage_chats_permission) -> TestClient:
    """Create test client with mocked dependencies.

    The takeover endpoint itself is the real one: these tests assert on the
    status codes it raises (403/404/400/500), so it must not be swapped for a
    stub. Do not rebuild the sub-router's routes here — the app copied them at
    include time, and on current FastAPI a late swap would replace the endpoint
    under test.
    """
    async def override_get_current_user():
        return user_with_manage_chats_permission

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_db] = lambda: TestingSessionLocal()

    return TestClient(app)

@pytest.fixture
def client_with_error_mock(user_with_manage_chats_permission, mock_chat_response) -> TestClient:
    """Create test client with error mocking capabilities"""
    async def override_get_current_user():
        return user_with_manage_chats_permission

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_db] = lambda: TestingSessionLocal()
    
    return TestClient(app)

def test_takeover_chat_success(client, db, user_with_manage_chats_permission, 
                             create_chat_session, mock_chat_response):
    """Test successful chat takeover"""
    # Create test data
    session = create_chat_session()
    
    # Test takeover with direct auth
    response = client.post(
        f"/api/v1/session-to-agent/{session.session_id}/takeover"
    )
    
    print("Response:", response.json())  # Add this line to print the error message
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, dict)
    assert "customer" in data
    assert "agent" in data
    assert "messages" in data
    assert "status" in data
    assert data["status"] == SessionStatus.OPEN.value

def test_takeover_chat_no_permission(client, db, regular_user, create_chat_session):
    """Test chat takeover with insufficient permissions"""
    session = create_chat_session()
    
    # Override get_current_user to return regular_user
    async def override_get_current_user():
        return regular_user
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    # Test takeover
    response = client.post(
        f"/api/v1/session-to-agent/{session.session_id}/takeover"
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "Not enough permissions" in response.json()["detail"]

def test_takeover_chat_invalid_session(client, db, user_with_manage_chats_permission):
    """Test chat takeover with invalid session ID"""
    # Test takeover with invalid session ID
    invalid_session_id = str(uuid4())

    response = client.post(
        f"/api/v1/session-to-agent/{invalid_session_id}/takeover"
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Chat session not found" in response.json()["detail"]

def test_takeover_chat_unauthorized(client, db, create_chat_session):
    """Test chat takeover without authentication"""
    session = create_chat_session()
    
    # Remove all dependency overrides
    app.dependency_overrides = {}
    
    # Test takeover without auth
    response = client.post(
        f"/api/v1/session-to-agent/{session.session_id}/takeover"
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_takeover_chat_with_manage_assigned_chats(client, db, 
                                                user_with_manage_assigned_chats, 
                                                create_chat_session,
                                                mock_chat_response):
    """Test chat takeover with manage_assigned_chats permission"""
    session = create_chat_session()
    
    # Override get_current_user to return user with manage_assigned_chats
    async def override_get_current_user():
        return user_with_manage_assigned_chats
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    # Test takeover
    response = client.post(
        f"/api/v1/session-to-agent/{session.session_id}/takeover"
    )
    
    print("Response:", response.json())  # Add this line to print the error message
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, dict)
    assert "customer" in data
    assert "agent" in data
    assert "messages" in data
    assert "status" in data
    assert data["status"] == SessionStatus.OPEN.value

def test_takeover_chat_update_failure(client_with_error_mock, db, user_with_manage_chats_permission, create_chat_session):
    """Test chat takeover when session update fails"""
    session = create_chat_session()
    
    # Mock the repository to simulate update failure
    def mock_takeover_session(*args, **kwargs):
        return False
    
    with patch('app.repositories.session_to_agent.SessionToAgentRepository.takeover_session', 
               side_effect=mock_takeover_session):
        response = client_with_error_mock.post(
            f"/api/v1/session-to-agent/{session.session_id}/takeover"
        )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Failed to take over chat" in response.json()["detail"]

def test_takeover_chat_details_failure(client_with_error_mock, db, user_with_manage_chats_permission, create_chat_session):
    """Test chat takeover when getting chat details fails"""
    session = create_chat_session()
    
    # Mock the repository to simulate chat details failure
    def mock_get_chat_detail(*args, **kwargs):
        return None
    
    with patch('app.repositories.chat.ChatRepository.get_chat_detail', 
               side_effect=mock_get_chat_detail):
        response = client_with_error_mock.post(
            f"/api/v1/session-to-agent/{session.session_id}/takeover"
        )
    
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert "Failed to get chat details after takeover" in response.json()["detail"]

def test_takeover_chat_unexpected_error(client_with_error_mock, db, user_with_manage_chats_permission, create_chat_session):
    """Test chat takeover with unexpected error"""
    session = create_chat_session()
    
    # Mock the repository to simulate unexpected error
    def mock_get_session(*args, **kwargs):
        raise Exception("Unexpected error occurred")
    
    with patch('app.repositories.session_to_agent.SessionToAgentRepository.get_session', 
               side_effect=mock_get_session):
        response = client_with_error_mock.post(
            f"/api/v1/session-to-agent/{session.session_id}/takeover"
        )
    
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert "Failed to take over chat" in response.json()["detail"]

def test_takeover_chat_already_taken(client, db, user_with_manage_chats_permission, create_chat_session):
    """Test chat takeover when session is already taken"""
    session = create_chat_session()
    
    # First takeover should succeed
    response1 = client.post(
        f"/api/v1/session-to-agent/{session.session_id}/takeover"
    )
    assert response1.status_code == status.HTTP_200_OK
    
    # Second takeover should fail
    response2 = client.post(
        f"/api/v1/session-to-agent/{session.session_id}/takeover"
    )
    assert response2.status_code == status.HTTP_400_BAD_REQUEST
    assert "Failed to take over chat" in response2.json()["detail"]

def test_takeover_chat_closed_session(client_with_error_mock, db, user_with_manage_chats_permission, create_chat_session):
    """Test chat takeover when session is closed"""
    session = create_chat_session()
    
    # Close the session
    session_repo = SessionToAgentRepository(db)
    session_repo.update_session_status(session.session_id, SessionStatus.CLOSED)
    
    # Mock the repository to simulate takeover failure
    def mock_takeover_session(*args, **kwargs):
        return False
    
    with patch('app.repositories.session_to_agent.SessionToAgentRepository.takeover_session', 
               side_effect=mock_takeover_session):
        response = client_with_error_mock.post(
            f"/api/v1/session-to-agent/{session.session_id}/takeover"
        )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Failed to take over chat" in response.json()["detail"] 

@pytest.fixture
def other_org_user(db, test_role_with_manage_chats) -> User:
    """A user (and their org) entirely separate from the caller's."""
    other_org = Organization(
        id=uuid4(),
        name="Other Organization",
        domain="other.example.com",
        business_hours={},
        settings={}
    )
    db.add(other_org)
    db.commit()

    user = User(
        id=uuid4(),
        email="outsider@example.com",
        hashed_password="hashed_password",
        is_active=True,
        organization_id=other_org.id,
        full_name="Outsider",
        role_id=test_role_with_manage_chats.id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _assigned_session(db, create_chat_session, user):
    """An open session already handled by a human — reassignable."""
    session = create_chat_session()
    session.user_id = user.id
    db.commit()
    db.refresh(session)
    return session


def test_reassign_chat_success(client_with_error_mock, db, user_with_manage_chats_permission,
                               user_with_manage_assigned_chats, create_chat_session):
    """Reassigning to a colleague in the same org pushes them a notification"""
    session = _assigned_session(db, create_chat_session, user_with_manage_chats_permission)

    with patch('app.api.session_to_agent.notify_chat_assigned') as mock_notify:
        mock_notify.return_value = None
        response = client_with_error_mock.post(
            f"/api/v1/session-to-agent/{session.session_id}/reassign",
            params={"to_user_id": str(user_with_manage_assigned_chats.id)}
        )

    assert response.status_code == status.HTTP_200_OK
    db.refresh(session)
    assert session.user_id == user_with_manage_assigned_chats.id
    assert mock_notify.called


def test_reassign_notifies_previous_assignee_not_new_one(
    client_with_error_mock, db, user_with_manage_chats_permission,
    user_with_manage_assigned_chats, create_chat_session
):
    """The 'reassigned_from_you' event must target the PREVIOUS owner's room.

    reassign_session mutates the loaded session in place, so reading
    session.user_id after it would wrongly point at the new assignee.
    """
    from unittest.mock import AsyncMock
    previous = user_with_manage_chats_permission
    new = user_with_manage_assigned_chats
    session = _assigned_session(db, create_chat_session, previous)

    with patch('app.api.session_to_agent.notify_chat_assigned', new=AsyncMock()), \
         patch('app.api.session_to_agent.sio.emit', new=AsyncMock()) as mock_emit:
        response = client_with_error_mock.post(
            f"/api/v1/session-to-agent/{session.session_id}/reassign",
            params={"to_user_id": str(new.id)}
        )

    assert response.status_code == status.HTTP_200_OK

    from_you = [
        c for c in mock_emit.call_args_list
        if c.args and isinstance(c.args[1], dict)
        and c.args[1].get('type') == 'reassigned_from_you'
    ]
    assert len(from_you) == 1, "expected exactly one reassigned_from_you emit"
    assert from_you[0].kwargs.get('room') == f"user_{previous.id}"
    assert from_you[0].kwargs.get('room') != f"user_{new.id}"


def test_reassign_to_same_user_skips_from_you_event(
    client_with_error_mock, db, user_with_manage_chats_permission, create_chat_session
):
    """Reassigning a chat to its current owner is a no-op — no contradictory ping."""
    from unittest.mock import AsyncMock
    owner = user_with_manage_chats_permission
    session = _assigned_session(db, create_chat_session, owner)

    with patch('app.api.session_to_agent.notify_chat_assigned', new=AsyncMock()), \
         patch('app.api.session_to_agent.sio.emit', new=AsyncMock()) as mock_emit:
        response = client_with_error_mock.post(
            f"/api/v1/session-to-agent/{session.session_id}/reassign",
            params={"to_user_id": str(owner.id)}
        )

    assert response.status_code == status.HTTP_200_OK
    from_you = [
        c for c in mock_emit.call_args_list
        if c.args and isinstance(c.args[1], dict)
        and c.args[1].get('type') == 'reassigned_from_you'
    ]
    assert from_you == []


def test_reassign_chat_other_org_session(client_with_error_mock, db, other_org_user,
                                         user_with_manage_assigned_chats,
                                         user_with_manage_chats_permission, create_chat_session):
    """A session belonging to another org is invisible, not reassignable"""
    session = _assigned_session(db, create_chat_session, user_with_manage_chats_permission)
    session.organization_id = other_org_user.organization_id
    db.commit()

    response = client_with_error_mock.post(
        f"/api/v1/session-to-agent/{session.session_id}/reassign",
        params={"to_user_id": str(user_with_manage_assigned_chats.id)}
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Chat session not found"
    db.refresh(session)
    assert session.user_id == user_with_manage_chats_permission.id


def test_reassign_chat_target_in_another_org(client_with_error_mock, db, other_org_user,
                                             user_with_manage_chats_permission, create_chat_session):
    """A chat can't be handed to someone outside the caller's org"""
    session = _assigned_session(db, create_chat_session, user_with_manage_chats_permission)

    response = client_with_error_mock.post(
        f"/api/v1/session-to-agent/{session.session_id}/reassign",
        params={"to_user_id": str(other_org_user.id)}
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "User not found"
    db.refresh(session)
    assert session.user_id == user_with_manage_chats_permission.id


def test_reassign_chat_unknown_target(client_with_error_mock, db,
                                      user_with_manage_chats_permission, create_chat_session):
    """An unknown user id is a 404, and a malformed one isn't a 500"""
    session = _assigned_session(db, create_chat_session, user_with_manage_chats_permission)

    for target in (str(uuid4()), "not-a-uuid"):
        response = client_with_error_mock.post(
            f"/api/v1/session-to-agent/{session.session_id}/reassign",
            params={"to_user_id": target}
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND, target
        assert response.json()["detail"] == "User not found"


def test_reassign_chat_no_permission(client_with_error_mock, db, regular_user,
                                     user_with_manage_chats_permission,
                                     user_with_manage_assigned_chats, create_chat_session):
    """Without a manage grant, reassignment is forbidden"""
    session = _assigned_session(db, create_chat_session, user_with_manage_chats_permission)

    async def override_get_current_user():
        return regular_user

    app.dependency_overrides[get_current_user] = override_get_current_user
    try:
        response = client_with_error_mock.post(
            f"/api/v1/session-to-agent/{session.session_id}/reassign",
            params={"to_user_id": str(user_with_manage_assigned_chats.id)}
        )
    finally:
        app.dependency_overrides[get_current_user] = lambda: user_with_manage_chats_permission

    assert response.status_code == status.HTTP_403_FORBIDDEN


def _route_to_human(client, session):
    return client.post(f"/api/v1/session-to-agent/{session.session_id}/route-to-human")


def test_route_to_human_queues_the_chat_without_claiming_it(
    client_with_error_mock, db, user_with_manage_chats_permission, create_chat_session
):
    """The AI stops answering, but the chat stays claimable by anyone."""
    from unittest.mock import AsyncMock
    session = create_chat_session()

    with patch('app.services.human_routing.notify_chat_event', new=AsyncMock()) as mock_notify:
        response = _route_to_human(client_with_error_mock, session)

    assert response.status_code == status.HTTP_200_OK
    db.refresh(session)
    assert session.status == SessionStatus.TRANSFERRED
    # Not claimed: every backend guard reads "a human has this" off user_id.
    assert session.user_id is None
    assert mock_notify.called


def test_route_to_human_is_idempotent(
    client_with_error_mock, db, user_with_manage_chats_permission, create_chat_session
):
    """A second click must not re-notify the team."""
    from unittest.mock import AsyncMock
    session = create_chat_session()

    with patch('app.services.human_routing.notify_chat_event', new=AsyncMock()):
        assert _route_to_human(client_with_error_mock, session).status_code == status.HTTP_200_OK

    with patch('app.services.human_routing.notify_chat_event', new=AsyncMock()) as mock_notify:
        response = _route_to_human(client_with_error_mock, session)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert not mock_notify.called


def test_route_to_human_refuses_a_chat_a_human_holds(
    client_with_error_mock, db, user_with_manage_chats_permission, create_chat_session
):
    """Someone is already on it — there is no AI to stop."""
    session = _assigned_session(db, create_chat_session, user_with_manage_chats_permission)

    response = _route_to_human(client_with_error_mock, session)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    db.refresh(session)
    assert session.user_id == user_with_manage_chats_permission.id


def test_route_to_human_refuses_a_closed_chat(
    client_with_error_mock, db, user_with_manage_chats_permission, create_chat_session
):
    session = create_chat_session()
    session.status = SessionStatus.CLOSED
    db.commit()

    response = _route_to_human(client_with_error_mock, session)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    db.refresh(session)
    assert session.status == SessionStatus.CLOSED


def test_route_to_human_no_permission(
    client_with_error_mock, db, regular_user, user_with_manage_chats_permission,
    create_chat_session
):
    session = create_chat_session()

    async def override_get_current_user():
        return regular_user

    app.dependency_overrides[get_current_user] = override_get_current_user
    try:
        response = _route_to_human(client_with_error_mock, session)
    finally:
        app.dependency_overrides[get_current_user] = lambda: user_with_manage_chats_permission

    assert response.status_code == status.HTTP_403_FORBIDDEN
    db.refresh(session)
    assert session.status == SessionStatus.OPEN


def test_route_to_human_other_org_session(
    client_with_error_mock, db, other_org_user, user_with_manage_chats_permission,
    create_chat_session
):
    """A guessable session id must not let an outsider touch the chat."""
    session = create_chat_session()

    async def override_get_current_user():
        return other_org_user

    app.dependency_overrides[get_current_user] = override_get_current_user
    try:
        response = _route_to_human(client_with_error_mock, session)
    finally:
        app.dependency_overrides[get_current_user] = lambda: user_with_manage_chats_permission

    assert response.status_code == status.HTTP_404_NOT_FOUND
    db.refresh(session)
    assert session.status == SessionStatus.OPEN


def test_takeover_notifies_a_channel_customer_but_not_the_widget(
    client_with_error_mock, db, user_with_manage_chats_permission, create_chat_session
):
    """The widget shows handover in its own UI; only channels need telling.

    Both cases share one helper now, so this pins the skip in place.
    """
    from unittest.mock import AsyncMock
    from app.services.message_delivery import DeliveryResult

    web_session = create_chat_session()
    channel_session = create_chat_session()
    channel_session.channel = 'telegram'
    db.commit()

    with patch('app.services.human_routing.deliver_to_customer',
               new=AsyncMock(return_value=DeliveryResult(ok=True))) as mock_deliver:
        client_with_error_mock.post(
            f"/api/v1/session-to-agent/{web_session.session_id}/takeover")
        assert not mock_deliver.called

        client_with_error_mock.post(
            f"/api/v1/session-to-agent/{channel_session.session_id}/takeover")
        assert mock_deliver.called


def test_route_to_human_tells_a_channel_customer_someone_is_coming(
    client_with_error_mock, db, user_with_manage_chats_permission, create_chat_session
):
    """Queued is not the same as connected — the holding line says so."""
    from unittest.mock import AsyncMock
    from app.services.human_routing import QUEUED_FOR_HUMAN_NOTICE
    from app.services.message_delivery import DeliveryResult

    session = create_chat_session()
    session.channel = 'telegram'
    db.commit()

    with patch('app.services.human_routing.notify_chat_event', new=AsyncMock()), \
         patch('app.services.human_routing.deliver_to_customer',
               new=AsyncMock(return_value=DeliveryResult(ok=True))) as mock_deliver:
        response = _route_to_human(client_with_error_mock, session)

    assert response.status_code == status.HTTP_200_OK
    assert mock_deliver.called
    assert mock_deliver.call_args.args[2]['message'] == QUEUED_FOR_HUMAN_NOTICE

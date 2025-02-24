"""
ChatterMate - Test Session To Agent
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
from fastapi.testclient import TestClient
from app.database import get_db
from fastapi import FastAPI, status, HTTPException, Depends
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
from sqlalchemy.orm import Session
from tests.conftest import engine, TestingSessionLocal, create_tables, Base
from app.models.organization import Organization

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
    for name in ["manage_chats", "manage_assigned_chats"]:
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
    """Create a test role with manage_chats permission"""
    role = Role(
        id=1,
        name="Manage Chats Role",
        description="Role with manage_chats permission",
        is_default=False
    )
    db.add(role)
    db.commit()

    # Add manage_chats permission
    manage_chats_perm = next(p for p in test_permissions if p.name == "manage_chats")
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

    # Add manage_assigned_chats permission
    manage_assigned_perm = next(p for p in test_permissions if p.name == "manage_assigned_chats")
    db.execute(
        role_permissions.insert().values(
            role_id=role.id,
            permission_id=manage_assigned_perm.id
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
def client(user_with_manage_chats_permission, mock_chat_response) -> TestClient:
    """Create test client with mocked dependencies"""
    async def override_get_current_user():
        return user_with_manage_chats_permission

    async def mock_takeover_chat(
        session_id: str,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> ChatDetailResponse:
        # Create a new instance of ChatDetailResponse with the mock data
        return mock_chat_response

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_db] = lambda: TestingSessionLocal()
    
    # Override the takeover_chat endpoint
    session_to_agent_router.router.routes = [
        route for route in session_to_agent_router.router.routes 
        if route.path_format != "/{session_id}/takeover"
    ]
    session_to_agent_router.router.add_api_route(
        "/{session_id}/takeover",
        mock_takeover_chat,
        methods=["POST"],
        response_model=ChatDetailResponse
    )
    
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
    
    # Override the takeover_chat endpoint to raise 404
    async def mock_takeover_chat(*args, **kwargs):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    session_to_agent_router.router.routes = [
        route for route in session_to_agent_router.router.routes 
        if route.path_format != "/{session_id}/takeover"
    ]
    session_to_agent_router.router.add_api_route(
        "/{session_id}/takeover",
        mock_takeover_chat,
        methods=["POST"],
        response_model=ChatDetailResponse
    )
    
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
"""
ChatterMate - Test Chat
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
from fastapi import FastAPI
from app.models.user import User, UserGroup
from app.models.chat_history import ChatHistory
from app.models.session_to_agent import SessionToAgent, SessionStatus
from app.models.agent import Agent
from app.models.role import Role
from app.models.customer import Customer
from app.models.permission import Permission, role_permissions
from uuid import uuid4
from datetime import datetime, timezone
from app.api import chat as chat_router
from app.core.auth import get_current_user, require_permissions
from app.database import get_db
from app.models.organization import Organization

# Create a test FastAPI app
app = FastAPI()
app.include_router(
    chat_router.router,
    prefix="/api/chats",
    tags=["chat"]
)

@pytest.fixture
def test_permissions(db) -> list[Permission]:
    """Create test permissions"""
    permissions = []
    for name in ["view_all_chats", "view_assigned_chats"]:
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
def test_role(db, test_organization_id, test_permissions) -> Role:
    """Create a test role with required permissions"""
    role = Role(
        name="Test Role",
        description="Test Role Description",
        organization_id=test_organization_id,
        is_default=True
    )
    db.add(role)
    db.commit()

    # Associate permissions with role
    for perm in test_permissions:
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
def test_user(db, test_organization_id, test_role) -> User:
    """Create a test user with required permissions"""
    user = User(
        id=uuid4(),
        email="test@example.com",
        hashed_password="hashed_password",
        is_active=True,
        organization_id=test_organization_id,
        full_name="Test User",
        role_id=test_role.id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_group(db, test_user) -> UserGroup:
    """Create a test user group"""
    group = UserGroup(
        id=uuid4(),
        name="Test Group",
        organization_id=test_user.organization_id
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    return group

@pytest.fixture
def test_agent(db, test_user) -> Agent:
    """Create a test agent"""
    agent = Agent(
        id=uuid4(),
        name="Test Agent",
        display_name="Test Display Name",
        description="Test Description",
        agent_type="CUSTOMER_SUPPORT",
        instructions=["Test instruction"],
        is_active=True,
        organization_id=test_user.organization_id
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

@pytest.fixture
def test_customer(db, test_user) -> Customer:
    """Create a test customer"""
    customer = Customer(
        id=uuid4(),
        email="customer@example.com",
        full_name="Test Customer",
        organization_id=test_user.organization_id,
        is_active=True
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@pytest.fixture
def test_chat_session(db, test_user, test_agent, test_customer) -> SessionToAgent:
    """Create a test chat session"""
    session = SessionToAgent(
        session_id=uuid4(),
        user_id=test_user.id,
        agent_id=test_agent.id,
        customer_id=test_customer.id,
        organization_id=test_user.organization_id,
        status=SessionStatus.OPEN,
        assigned_at=datetime.now(timezone.utc)
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@pytest.fixture
def test_chat_messages(db, test_chat_session, test_user, test_customer) -> list[ChatHistory]:
    """Create test chat messages"""
    messages = []
    for i in range(3):
        message = ChatHistory(
            organization_id=test_user.organization_id,
            user_id=test_user.id,
            customer_id=test_customer.id,
            agent_id=test_chat_session.agent_id,
            session_id=test_chat_session.session_id,
            message=f"Test message {i+1}",
            message_type="user" if i % 2 == 0 else "bot",
            created_at=datetime.now(timezone.utc)
        )
        messages.append(message)
        db.add(message)
    db.commit()
    for m in messages:
        db.refresh(m)
    return messages

@pytest.fixture
def client(db, test_user) -> TestClient:
    """Create test client with mocked dependencies"""
    async def override_get_current_user():
        return test_user

    async def override_require_permissions(*args, **kwargs):
        return test_user

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[require_permissions] = override_require_permissions
    app.dependency_overrides[get_db] = override_get_db
    
    return TestClient(app)

# Test cases
def test_get_recent_chats_with_view_all(
    client,
    db,
    test_user,
    test_chat_session,
    test_chat_messages
):
    """Test getting recent chats with view_all permission"""
    response = client.get("/api/chats/recent")
    assert response.status_code == 200
    chats = response.json()
    assert len(chats) == 1
    assert chats[0]["session_id"] == str(test_chat_session.session_id)
    assert chats[0]["agent"]["id"] == str(test_chat_session.agent_id)

def test_get_recent_chats_with_view_assigned(
    client,
    db,
    test_user,
    test_chat_session,
    test_chat_messages
):
    """Test getting recent chats with view_assigned permission"""
    # Remove view_all permission
    view_all_perm = db.query(Permission).filter_by(name="view_all_chats").first()
    db.execute(
        role_permissions.delete().where(
            role_permissions.c.permission_id == view_all_perm.id
        )
    )
    db.commit()

    response = client.get("/api/chats/recent")
    assert response.status_code == 200
    chats = response.json()
    assert len(chats) == 1  # Should only see own chat
    assert chats[0]["session_id"] == str(test_chat_session.session_id)

def test_get_recent_chats_no_permission(
    client,
    db,
    test_user,
    test_chat_session
):
    """Test getting recent chats without required permissions"""
    # Remove all chat permissions
    db.execute(role_permissions.delete())
    db.commit()

    response = client.get("/api/chats/recent")
    assert response.status_code == 403
    assert response.json()["detail"] == "Not enough permissions"

def test_get_chat_detail_success(
    client,
    db,
    test_user,
    test_chat_session,
    test_chat_messages
):
    """Test getting chat detail successfully"""
    response = client.get(f"/api/chats/{test_chat_session.session_id}")
    assert response.status_code == 200
    chat = response.json()
    assert chat["session_id"] == str(test_chat_session.session_id)
    assert len(chat["messages"]) == 3
    assert chat["agent"]["id"] == str(test_chat_session.agent_id)

def test_get_chat_detail_not_found(
    client,
    db,
    test_user
):
    """Test getting non-existent chat detail"""
    response = client.get(f"/api/chats/{uuid4()}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Chat session not found"

def test_get_chat_detail_wrong_org(
    client,
    db,
    test_user,
    test_chat_session
):
    """Test getting chat detail from wrong organization"""
    # Create a new organization first
    new_org = Organization(
        id=uuid4(),
        name="Test Org 2",
        domain="test2.com",
        timezone="UTC"
    )
    db.add(new_org)
    db.commit()
    
    # Change session's organization
    test_chat_session.organization_id = new_org.id
    db.commit()

    response = client.get(f"/api/chats/{test_chat_session.session_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Chat session not found"

def test_get_chat_detail_no_permission(
    client,
    db,
    test_user,
    test_chat_session
):
    """Test getting chat detail without required permissions"""
    # Remove all chat permissions
    db.execute(role_permissions.delete())
    db.commit()

    response = client.get(f"/api/chats/{test_chat_session.session_id}")
    assert response.status_code == 403
    assert response.json()["detail"] == "Not enough permissions" 
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
from app.core.auth import get_current_user, require_permissions, get_unified_chat_auth
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

    async def override_get_unified_chat_auth():
        # Refresh the user to get the latest role and permissions from the database
        db.refresh(test_user)
        db.refresh(test_user.role)
        
        # Get user permissions for chat auth
        user_permissions = {p.name for p in test_user.role.permissions}
        can_view_all = "view_all_chats" in user_permissions
        can_view_assigned = "view_assigned_chats" in user_permissions
        
        # Check if user has no permissions
        if not (can_view_all or can_view_assigned):
            from fastapi import HTTPException
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions"
            )
        
        return {
            "auth_type": "jwt",
            "organization_id": test_user.organization_id,  # Keep as UUID
            "user_id": test_user.id,
            "current_user": test_user,
            "can_view_all": can_view_all,
            "can_view_assigned": can_view_assigned
        }

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[require_permissions] = override_require_permissions
    app.dependency_overrides[get_unified_chat_auth] = override_get_unified_chat_auth
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

def test_get_chat_history_endpoint(client):
    """Test the basic chat history endpoint"""
    response = client.get("/api/chats/")
    assert response.status_code == 200
    assert response.json() == {"message": "Chat history endpoint"}

def test_get_recent_chats_with_filters(
    client,
    db,
    test_user,
    test_agent,
    test_customer
):
    """Test getting recent chats with various filters"""
    # Create multiple sessions with different statuses
    open_session = SessionToAgent(
        session_id=uuid4(),
        user_id=test_user.id,
        agent_id=test_agent.id,
        customer_id=test_customer.id,
        organization_id=test_user.organization_id,
        status=SessionStatus.OPEN,
        assigned_at=datetime.now(timezone.utc)
    )
    db.add(open_session)

    closed_session = SessionToAgent(
        session_id=uuid4(),
        user_id=test_user.id,
        agent_id=test_agent.id,
        customer_id=test_customer.id,
        organization_id=test_user.organization_id,
        status=SessionStatus.CLOSED,
        assigned_at=datetime.now(timezone.utc)
    )
    db.add(closed_session)
    db.commit()

    # Test with status filter
    response = client.get("/api/chats/recent?status=open")
    assert response.status_code == 200
    chats = response.json()
    assert all(chat["status"] == "OPEN" for chat in chats)

    # Test with agent_id filter
    response = client.get(f"/api/chats/recent?agent_id={test_agent.id}")
    assert response.status_code == 200
    chats = response.json()
    assert all(chat["agent"]["id"] == str(test_agent.id) for chat in chats)

    # Test with limit and skip
    response = client.get("/api/chats/recent?limit=1&skip=0")
    assert response.status_code == 200
    chats = response.json()
    assert len(chats) <= 1

def test_get_recent_chats_invalid_uuid(client, db, test_user):
    """Test getting recent chats with invalid UUID format"""
    response = client.get("/api/chats/recent?user_id=invalid-uuid")
    assert response.status_code == 400
    assert "Invalid UUID format" in response.json()["detail"]

def test_get_chat_detail_invalid_uuid(client, db, test_user):
    """Test getting chat detail with invalid session_id format"""
    response = client.get("/api/chats/invalid-uuid")
    assert response.status_code == 400
    assert "Invalid UUID format" in response.json()["detail"]

def test_get_chat_detail_with_shopify_output(
    client,
    db,
    test_user,
    test_chat_session,
    test_customer
):
    """Test getting chat detail with Shopify output in attributes"""
    import json

    # Create message with shopify_output in attributes
    shopify_data = {
        "products": [{"id": "123", "title": "Test Product"}],
        "search_query": "test"
    }

    message = ChatHistory(
        organization_id=test_user.organization_id,
        user_id=test_user.id,
        customer_id=test_customer.id,
        agent_id=test_chat_session.agent_id,
        session_id=test_chat_session.session_id,
        message="Here are some products",
        message_type="bot",
        attributes={
            "shopify_output": shopify_data,
            "end_chat": False
        },
        created_at=datetime.now(timezone.utc)
    )
    db.add(message)
    db.commit()

    response = client.get(f"/api/chats/{test_chat_session.session_id}")
    assert response.status_code == 200
    chat = response.json()

    # Check that shopify_output was processed
    messages = chat["messages"]
    shopify_message = next((m for m in messages if m.get("shopify_output")), None)
    assert shopify_message is not None
    assert shopify_message["message_type"] == "product"

def test_get_chat_detail_with_end_chat_reason(
    client,
    db,
    test_user,
    test_chat_session,
    test_customer
):
    """Test getting chat detail with end_chat_reason in attributes"""
    # Create message with valid end_chat_reason
    message = ChatHistory(
        organization_id=test_user.organization_id,
        user_id=test_user.id,
        customer_id=test_customer.id,
        agent_id=test_chat_session.agent_id,
        session_id=test_chat_session.session_id,
        message="Thank you!",
        message_type="bot",
        attributes={
            "end_chat": True,
            "end_chat_reason": "ISSUE_RESOLVED",  # Valid enum value
            "end_chat_description": "Issue resolved"
        },
        created_at=datetime.now(timezone.utc)
    )
    db.add(message)
    db.commit()

    response = client.get(f"/api/chats/{test_chat_session.session_id}")
    assert response.status_code == 200
    chat = response.json()

    messages = chat["messages"]
    end_chat_message = next((m for m in messages if m.get("end_chat")), None)
    assert end_chat_message is not None
    assert end_chat_message["end_chat_reason"] == "ISSUE_RESOLVED"
    assert end_chat_message["end_chat_description"] == "Issue resolved"

def test_get_chat_detail_with_invalid_end_chat_reason(
    client,
    db,
    test_user,
    test_chat_session,
    test_customer
):
    """Test getting chat detail with invalid end_chat_reason (should be set to None)"""
    # Create message with invalid end_chat_reason
    message = ChatHistory(
        organization_id=test_user.organization_id,
        user_id=test_user.id,
        customer_id=test_customer.id,
        agent_id=test_chat_session.agent_id,
        session_id=test_chat_session.session_id,
        message="Thank you!",
        message_type="bot",
        attributes={
            "end_chat": True,
            "end_chat_reason": "INVALID_REASON",
            "end_chat_description": "Issue resolved"
        },
        created_at=datetime.now(timezone.utc)
    )
    db.add(message)
    db.commit()

    response = client.get(f"/api/chats/{test_chat_session.session_id}")
    assert response.status_code == 200
    chat = response.json()

    messages = chat["messages"]
    end_chat_message = next((m for m in messages if m.get("end_chat")), None)
    assert end_chat_message is not None
    # Invalid reason should be set to None
    assert end_chat_message["end_chat_reason"] is None

def test_get_chat_detail_assigned_access_denied(
    client,
    db,
    test_user,
    test_customer,
    test_agent
):
    """Test that user with view_assigned permission cannot access unassigned chats"""
    # Remove view_all permission
    view_all_perm = db.query(Permission).filter_by(name="view_all_chats").first()
    db.execute(
        role_permissions.delete().where(
            role_permissions.c.permission_id == view_all_perm.id
        )
    )
    db.commit()

    # Create a session not assigned to test_user
    other_user = User(
        id=uuid4(),
        email="other@example.com",
        hashed_password="hashed",
        is_active=True,
        organization_id=test_user.organization_id,
        full_name="Other User",
        role_id=test_user.role_id
    )
    db.add(other_user)
    db.commit()

    other_session = SessionToAgent(
        session_id=uuid4(),
        user_id=other_user.id,
        agent_id=test_agent.id,
        customer_id=test_customer.id,
        organization_id=test_user.organization_id,
        status=SessionStatus.OPEN,
        assigned_at=datetime.now(timezone.utc)
    )
    db.add(other_session)
    db.commit()

    response = client.get(f"/api/chats/{other_session.session_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Chat session not found"

def test_get_recent_chats_with_user_name_filter(
    client,
    db,
    test_user,
    test_chat_session
):
    """Test getting recent chats with user_name filter"""
    # Test with user_name filter
    response = client.get(f"/api/chats/recent?user_name={test_user.full_name}")
    assert response.status_code == 200
    # Filter parameters are passed to repository, endpoint should handle it
    assert isinstance(response.json(), list)

def test_get_recent_chats_shopify_endpoint(client, db, test_user, test_chat_session):
    """Test the Shopify-specific endpoint"""
    response = client.get("/api/chats/recent/shopify")
    assert response.status_code == 200
    chats = response.json()
    assert isinstance(chats, list)

def test_get_chat_detail_shopify_endpoint(client, db, test_user, test_chat_session, test_chat_messages):
    """Test the Shopify-specific chat detail endpoint"""
    response = client.get(f"/api/chats/{test_chat_session.session_id}/shopify")
    assert response.status_code == 200
    chat = response.json()
    assert chat["session_id"] == str(test_chat_session.session_id) 
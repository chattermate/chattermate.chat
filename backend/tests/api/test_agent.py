"""
ChatterMate - Test Agent
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
from app.models.agent import Agent, AgentCustomization, AgentType
from app.models.role import Role
from app.models.permission import Permission, role_permissions
from uuid import UUID, uuid4
from datetime import datetime
import os
from typing import Dict, Generator
from app.api import agent as agent_router
from app.core.auth import get_current_user, require_permissions
from app.models.schemas.agent_customization import CustomizationCreate
from app.database import get_db
from app.models.organization import Organization

# Create a test FastAPI app
app = FastAPI()
app.include_router(
    agent_router.router,
    prefix="/api/agents",
    tags=["agent"]
)

@pytest.fixture
def test_permissions(db) -> list[Permission]:
    """Create test permissions"""
    permissions = []
    for name in ["manage_agents", "view_all"]:
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

    # Associate permissions with role using the role_permissions table
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
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Test instruction"],
        is_active=True,
        organization_id=test_user.organization_id,
        transfer_to_human=True
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

@pytest.fixture
def test_customization(db, test_agent) -> AgentCustomization:
    """Create a test agent customization"""
    customization = AgentCustomization(
        agent_id=test_agent.id,
        photo_url="/test/photo.jpg",
        chat_background_color="#F8F9FA",
        chat_bubble_color="#E9ECEF",
        chat_text_color="#212529",
        icon_color="#6C757D",
        accent_color="#f34611"
    )
    db.add(customization)
    db.commit()
    db.refresh(customization)
    return customization

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
def test_get_organization_agents(
    client,
    db,
    test_user,
    test_agent,
    test_customization
):
    """Test getting all agents for an organization"""
    response = client.get("/api/agents/list")
    assert response.status_code == 200
    agents = response.json()
    assert len(agents) == 1
    assert agents[0]["id"] == str(test_agent.id)
    assert agents[0]["name"] == test_agent.name

def test_get_agent_by_id(
    client,
    db,
    test_user,
    test_agent,
    test_customization
):
    """Test getting a specific agent by ID"""
    response = client.get(f"/api/agents/{test_agent.id}")
    assert response.status_code == 200
    agent_data = response.json()
    assert agent_data["id"] == str(test_agent.id)
    assert agent_data["name"] == test_agent.name

def test_update_agent(
    client,
    db,
    test_user,
    test_agent
):
    """Test updating an agent"""
    update_data = {
        "display_name": "Updated Display Name",
        "description": "Updated Description",
        "instructions": ["Updated instruction"],
        "is_active": True,
        "transfer_to_human": True
    }
    
    response = client.put(
        f"/api/agents/{test_agent.id}",
        json=update_data
    )
    assert response.status_code == 200
    updated_agent = response.json()
    assert updated_agent["display_name"] == update_data["display_name"]
    assert updated_agent["instructions"] == update_data["instructions"]

def test_update_agent_groups(
    client,
    db,
    test_user,
    test_agent,
    test_group
):
    """Test updating agent's assigned groups"""
    group_ids = [str(test_group.id)]
    response = client.put(
        f"/api/agents/{test_agent.id}/groups",
        json=group_ids
    )
    assert response.status_code == 200
    updated_agent = response.json()
    assert len(updated_agent["groups"]) == 1
    assert updated_agent["groups"][0]["id"] == str(test_group.id)

def test_create_agent_customization(
    client,
    db,
    test_user,
    test_agent
):
    """Test creating agent customization"""
    customization_data = CustomizationCreate(
        chat_background_color="#F8F9FA",
        chat_bubble_color="#E9ECEF",
        chat_text_color="#212529",
        icon_color="#6C757D",
        accent_color="#f34611"
    ).model_dump()
    
    response = client.post(
        f"/api/agents/{test_agent.id}/customization",
        json=customization_data
    )
    assert response.status_code == 200
    customization = response.json()
    assert customization["chat_background_color"] == customization_data["chat_background_color"]
    assert customization["chat_bubble_color"] == customization_data["chat_bubble_color"]

# Negative test cases
def test_get_nonexistent_agent(
    client,
    db,
    test_user
):
    """Test getting a non-existent agent"""
    response = client.get(f"/api/agents/{uuid4()}")
    assert response.status_code == 404

def test_update_agent_wrong_org(
    client,
    db,
    test_user,
    test_agent
):
    """Test updating an agent from wrong organization"""
    # Create a new organization
    new_org_id = uuid4()
    new_org = Organization(
        id=new_org_id,
        name="Wrong Org",
        domain="wrong.org",
        timezone="UTC"
    )
    db.add(new_org)
    db.commit()
    
    # Change agent's organization
    test_agent.organization_id = new_org_id
    db.commit()
    
    response = client.put(
        f"/api/agents/{test_agent.id}",
        json={"display_name": "Wrong Org Update"}
    )
    assert response.status_code == 403

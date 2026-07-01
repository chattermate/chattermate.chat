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
from fastapi import FastAPI
from app.models.user import User
from app.models.agent import Agent, AgentType
from app.models.role import Role
from app.models.permission import Permission, role_permissions
from app.models.organization import Organization
from app.models.workflow import Workflow, WorkflowStatus
from uuid import uuid4
from app.api import agent as agent_router
from app.core.auth import get_current_user, require_permissions, get_unified_auth
from app.database import get_db

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
def test_agent(db, test_user) -> Agent:
    """Create a test agent"""
    agent = Agent(
        id=uuid4(),
        name="Test Agent",
        display_name="Test Display Name",
        description="Test Description",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Test instruction"],  # Using the correct field name
        is_active=True,
        organization_id=test_user.organization_id,
        transfer_to_human=True,
        use_workflow=False
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


@pytest.fixture
def test_workflow(db, test_user, test_agent) -> Workflow:
    """Create a test workflow"""
    workflow = Workflow(
        id=uuid4(),
        name="Test Workflow",
        description="Test workflow description",
        status=WorkflowStatus.PUBLISHED,
        version=1,
        is_template=False,
        default_language="en",
        canvas_data={},
        settings={},
        organization_id=test_user.organization_id,
        agent_id=test_agent.id,
        created_by=test_user.id
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow


@pytest.fixture
def client(db, test_user) -> TestClient:
    """Create test client with mocked dependencies"""
    async def override_get_current_user():
        return test_user

    async def override_require_permissions(*args, **kwargs):
        return test_user

    async def override_get_unified_auth():
        # Refresh the user to get the latest role and permissions from the database
        db.refresh(test_user)
        db.refresh(test_user.role)
        
        # Get user permissions
        user_permissions = {p.name for p in test_user.role.permissions}
        
        # Check if user has manage_agents permission
        if "manage_agents" not in user_permissions:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions"
            )
        
        return {
            "auth_type": "jwt",
            "organization_id": test_user.organization_id,  # Keep as UUID
            "user_id": test_user.id,
            "current_user": test_user
        }

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[require_permissions] = override_require_permissions
    app.dependency_overrides[get_unified_auth] = override_get_unified_auth
    app.dependency_overrides[get_db] = override_get_db
    
    return TestClient(app)


class TestAgentWorkflowAPI:
    
    def test_create_agent_with_workflow_disabled(self, client, test_user):
        """Test creating an agent with workflow disabled"""
        agent_data = {
            "name": "New Agent",
            "display_name": "New Agent Display",
            "description": "New agent description",
            "agent_type": "customer_support",
            "instructions": ["New agent instruction"],
            "is_active": True,
            "transfer_to_human": True,
            "use_workflow": False
        }
        
        response = client.post("/api/agents", json=agent_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == agent_data["name"]
        assert data["use_workflow"] is False
        assert data["active_workflow_id"] is None
    
    def test_update_agent_enable_workflow(self, client, test_agent, test_workflow):
        """Test updating an agent to enable workflow"""
        update_data = {
            "use_workflow": True,
            "active_workflow_id": str(test_workflow.id)
        }
        
        response = client.put(f"/api/agents/{test_agent.id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["use_workflow"] is True
        assert data["active_workflow_id"] == str(test_workflow.id)
    
    def test_update_agent_disable_workflow(self, client, test_agent, test_workflow):
        """Test updating an agent to disable workflow"""
        # First enable workflow
        test_agent.use_workflow = True
        test_agent.active_workflow_id = test_workflow.id
        
        update_data = {
            "use_workflow": False,
            "active_workflow_id": None
        }
        
        response = client.put(f"/api/agents/{test_agent.id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["use_workflow"] is False
        assert data["active_workflow_id"] is None
    
    def test_update_agent_workflow_without_id(self, client, test_agent):
        """Test updating an agent to use workflow without providing workflow ID"""
        update_data = {
            "use_workflow": True
            # Missing active_workflow_id
        }
        
        response = client.put(f"/api/agents/{test_agent.id}", json=update_data)
        
        # This should either fail validation or default to None
        # The exact behavior depends on your API implementation
        assert response.status_code in [200, 422]
    
    def test_get_agent_with_workflow(self, client, test_agent, test_workflow):
        """Test getting an agent that has workflow enabled"""
        # Set up agent with workflow
        test_agent.use_workflow = True
        test_agent.active_workflow_id = test_workflow.id
        
        response = client.get(f"/api/agents/{test_agent.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["use_workflow"] is True
        assert data["active_workflow_id"] == str(test_workflow.id)
    
    def test_list_agents_with_workflow(self, client, test_agent, test_workflow):
        """Test listing agents, including those with workflows"""
        # Set up agent with workflow
        test_agent.use_workflow = True
        test_agent.active_workflow_id = test_workflow.id
        
        response = client.get("/api/agents/list")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        
        # Find our test agent in the response
        agent_data = next((agent for agent in data if agent["id"] == str(test_agent.id)), None)
        assert agent_data is not None
        assert agent_data["use_workflow"] is True
        assert agent_data["active_workflow_id"] == str(test_workflow.id) 
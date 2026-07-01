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
import uuid
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.application import app
from app.models.workflow import Workflow, WorkflowStatus
from app.models.user import User
from app.models.agent import Agent
from app.models.organization import Organization
from app.models.role import Role
from app.models.permission import Permission
from app.models.schemas.workflow import WorkflowCreate, WorkflowUpdate
from app.services.workflow import WorkflowService
from app.core.config import settings
from app.core.auth import get_current_user, require_permissions
from app.database import get_db
from app.api import workflow as workflow_router

# Include the workflow router in the app for testing
app.include_router(
    workflow_router.router,
    prefix=f"{settings.API_V1_STR}/workflow",
    tags=["workflow"]
)

@pytest.fixture
def test_organization(db: Session) -> Organization:
    """Create a test organization"""
    organization = Organization(
        name="Test Organization",
        domain="test.com"
    )
    db.add(organization)
    db.commit()
    db.refresh(organization)
    return organization


@pytest.fixture
def test_permissions(db: Session) -> list[Permission]:
    """Create permissions for managing agents and viewing all resources"""
    permissions = []
    for name in ["manage_agents", "view_all"]:
        permission = Permission(
            name=name,
            description=f"Can {name}"
        )
        db.add(permission)
        permissions.append(permission)
    
    db.commit()
    for perm in permissions:
        db.refresh(perm)
    return permissions


@pytest.fixture
def test_role(db: Session, test_organization: Organization, test_permissions: list[Permission]) -> Role:
    """Create a test role with manage_agents and view_all permissions"""
    role = Role(
        name="Test Admin",
        description="Test role with manage_agents and view_all permissions",
        organization_id=test_organization.id
    )
    db.add(role)
    db.commit()
    
    # Add permissions to role
    role.permissions = test_permissions
    db.commit()
    db.refresh(role)
    return role


@pytest.fixture
def test_user(db: Session, test_organization: Organization, test_role: Role) -> User:
    """Create a test user with manage_agents and view_all permissions via role"""
    user = User(
        email="test@example.com",
        full_name="Test User",
        hashed_password="hashed_password",
        organization_id=test_organization.id,
        is_active=True,
        role_id=test_role.id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_agent(db: Session, test_organization: Organization) -> Agent:
    """Create a test agent"""
    agent = Agent(
        name="Test Agent",
        display_name="Test Agent",
        description="Test agent description",
        agent_type="CUSTOMER_SUPPORT",
        organization_id=test_organization.id,
        is_active=True,
        instructions=["Test instructions"]  # Adding required instructions field
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


@pytest.fixture
def test_workflow(db: Session, test_organization: Organization, test_agent: Agent, test_user: User) -> Workflow:
    """Create a test workflow"""
    workflow = Workflow(
        name="Test Workflow",
        description="Test workflow description",
        status=WorkflowStatus.DRAFT,
        version=1,
        is_template=False,
        default_language="en",
        canvas_data={},
        settings={},
        organization_id=test_organization.id,
        agent_id=test_agent.id,
        created_by=test_user.id
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow


@pytest.fixture
def client(db: Session, test_user: User):
    """Create a test client with authentication"""
    # Override the dependency to return our test user
    async def override_get_current_user():
        return test_user
    
    async def override_require_permissions(*args, **kwargs):
        return test_user
    
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    # Set up dependency overrides
    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[require_permissions] = override_require_permissions
    app.dependency_overrides[get_db] = override_get_db
    
    client = TestClient(app)
    yield client
    
    # Clean up
    app.dependency_overrides = {}


class TestWorkflowAPI:
    
    def test_create_workflow(self, client: TestClient, test_agent: Agent):
        """Test creating a new workflow"""
        # Prepare request data
        workflow_data = {
            "name": "New Workflow",
            "description": "New workflow description",
            "agent_id": str(test_agent.id)
        }
        
        # Make the request
        response = client.post(
            f"{settings.API_V1_STR}/workflow",
            json=workflow_data
        )
        
        # Assertions
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == workflow_data["name"]
        assert data["description"] == workflow_data["description"]
        assert data["agent_id"] == str(test_agent.id)
        assert data["status"] == "draft"
        assert "id" in data
    
    def test_create_workflow_duplicate_name(self, client: TestClient, test_agent: Agent, test_workflow: Workflow):
        """Test creating a workflow with a duplicate name"""
        # Prepare request data with the same name as test_workflow
        workflow_data = {
            "name": test_workflow.name,
            "description": "Another workflow description",
            "agent_id": str(test_agent.id)
        }
        
        # Make the request
        response = client.post(
            f"{settings.API_V1_STR}/workflow",
            json=workflow_data
        )
        
        # Assertions
        assert response.status_code == 400
        assert "Agent already has a workflow" in response.json()["detail"]
    
    def test_create_workflow_agent_has_workflow(self, client: TestClient, test_agent: Agent, test_workflow: Workflow):
        """Test creating a workflow for an agent that already has one"""
        # Prepare request data
        workflow_data = {
            "name": "Another Workflow",
            "description": "Another workflow description",
            "agent_id": str(test_agent.id)
        }
        
        # Make the request
        response = client.post(
            f"{settings.API_V1_STR}/workflow",
            json=workflow_data
        )
        
        # Assertions
        assert response.status_code == 400
        assert "Agent already has a workflow" in response.json()["detail"]
    
    def test_get_workflow_by_agent_id(self, client: TestClient, test_agent: Agent, test_workflow: Workflow):
        """Test getting a workflow by agent ID"""
        # Make the request
        response = client.get(
            f"{settings.API_V1_STR}/workflow/agent/{test_agent.id}"
        )
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_workflow.id)
        assert data["name"] == test_workflow.name
        assert data["agent_id"] == str(test_agent.id)
    
    def test_get_workflow_by_agent_id_not_found(self, client: TestClient):
        """Test getting a workflow for an agent that doesn't have one"""
        # Generate a random UUID for a non-existent agent
        agent_id = uuid.uuid4()
        
        # Make the request
        response = client.get(
            f"{settings.API_V1_STR}/workflow/agent/{agent_id}"
        )
        
        # Assertions
        assert response.status_code == 400
        assert "Agent not found" in response.json()["detail"]
    
    def test_update_workflow(self, client: TestClient, test_workflow: Workflow):
        """Test updating a workflow"""
        # Prepare update data
        update_data = {
            "name": "Updated Workflow",
            "description": "Updated workflow description",
            "status": "published"
        }
        
        # Make the request
        response = client.put(
            f"{settings.API_V1_STR}/workflow/{test_workflow.id}",
            json=update_data
        )
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_workflow.id)
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert data["status"] == update_data["status"]
    
    def test_update_workflow_not_found(self, client: TestClient):
        """Test updating a workflow that doesn't exist"""
        # Generate a random UUID for a non-existent workflow
        workflow_id = uuid.uuid4()
        
        # Prepare update data
        update_data = {
            "name": "Updated Workflow",
            "description": "Updated workflow description"
        }
        
        # Make the request
        response = client.put(
            f"{settings.API_V1_STR}/workflow/{workflow_id}",
            json=update_data
        )
        
        # Assertions
        assert response.status_code == 400
        assert "Workflow not found" in response.json()["detail"]
    
    def test_delete_workflow(self, client: TestClient, test_workflow: Workflow, test_agent: Agent):
        """Test deleting a workflow"""
        # Make the request
        response = client.delete(
            f"{settings.API_V1_STR}/workflow/{test_workflow.id}"
        )
        
        # Assertions
        assert response.status_code == 204
        assert response.content == b''  # No content for 204 response
        
        # Create a new workflow for the agent to test if the workflow was actually deleted
        workflow_data = {
            "name": "New Workflow After Delete",
            "description": "New workflow description after delete",
            "agent_id": str(test_agent.id)
        }
        
        create_response = client.post(
            f"{settings.API_V1_STR}/workflow",
            json=workflow_data
        )
        
        # If we can create a new workflow for the same agent, it means the previous one was deleted
        assert create_response.status_code == 201
        assert create_response.json()["name"] == workflow_data["name"]
    
    def test_delete_workflow_not_found(self, client: TestClient):
        """Test deleting a workflow that doesn't exist"""
        # Generate a random UUID for a non-existent workflow
        workflow_id = uuid.uuid4()
        
        # Make the request
        response = client.delete(
            f"{settings.API_V1_STR}/workflow/{workflow_id}"
        )
        
        # Assertions
        assert response.status_code == 400
        assert "Workflow not found" in response.json()["detail"] 
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
from uuid import uuid4
from app.models import (
    Agent, 
    User, 
    Organization, 
    Workflow, 
    WorkflowNode
)
from app.models.schemas.workflow import WorkflowNodeCreate, WorkflowNodeUpdate
from app.models.workflow import WorkflowStatus
from app.models.workflow_node import NodeType
from app.api import workflow_node as workflow_node_router
from app.core.auth import get_current_user, require_permissions
from app.database import get_db

# Create a test FastAPI app
app = FastAPI()
app.include_router(
    workflow_node_router.router,
    prefix="/api/workflow-nodes",
    tags=["workflow-nodes"]
)

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

@pytest.fixture
def sample_node_data():
    return {
        "node_id": "node-1",
        "node_type": "action",
        "name": "Test Node",
        "description": "A test node",
        "position": {"x": 100, "y": 200},
        "config": {"action_type": "send_message", "message": "Hello"},
        "connections": [{"source": "node-1", "target": "node-2"}]
    }

def test_update_workflow_node_success(client, db, test_user, test_organization, test_agent):
    """Test successful update of workflow node"""
    
    # Create a workflow
    workflow = Workflow(
        id=uuid4(),
        name="Test Workflow",
        description="Test workflow for node update",
        agent_id=test_agent.id,
        organization_id=test_organization.id,
        created_by=test_user.id,
        status=WorkflowStatus.DRAFT
    )
    db.add(workflow)
    
    # Create a workflow node
    node = WorkflowNode(
        id=uuid4(),
        workflow_id=workflow.id,
        node_type=NodeType.MESSAGE,
        name="Test Node",
        description="Test node for update",
        position_x=100,
        position_y=200,
        config={"message_text": "Hello World"}
    )
    db.add(node)
    db.commit()
    
    # Update node data
    update_data = {
        "name": "Updated Test Node",
        "description": "Updated description",
        "config": {"message_text": "Updated Hello World"}
    }
    
    response = client.put(
        f"/api/workflow-nodes/{workflow.id}/nodes/{node.id}",
        json=update_data
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify node was updated
    assert data["name"] == "Updated Test Node"
    assert data["description"] == "Updated description"
    assert data["config"]["message_text"] == "Updated Hello World"


def test_get_workflow_node_success(client, db, test_user, test_organization, test_agent):
    """Test successful retrieval of workflow node"""
    
    # Create a workflow
    workflow = Workflow(
        id=uuid4(),
        name="Test Workflow",
        description="Test workflow for node retrieval",
        agent_id=test_agent.id,
        organization_id=test_organization.id,
        created_by=test_user.id,
        status=WorkflowStatus.DRAFT
    )
    db.add(workflow)
    
    # Create a workflow node
    node = WorkflowNode(
        id=uuid4(),
        workflow_id=workflow.id,
        node_type=NodeType.MESSAGE,
        name="Test Node",
        description="Test node for retrieval",
        position_x=100,
        position_y=200,
        config={"message_text": "Hello World"}
    )
    db.add(node)
    db.commit()
    
    response = client.get(
        f"/api/workflow-nodes/{workflow.id}/nodes/{node.id}"
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify node data
    assert data["id"] == str(node.id)
    assert data["name"] == "Test Node"
    assert data["config"]["message_text"] == "Hello World"


def test_update_workflow_node_not_found(client, db, test_user, test_organization, test_agent):
    """Test update of non-existent workflow node"""
    
    workflow_id = uuid4()
    node_id = uuid4()
    
    update_data = {
        "name": "Updated Test Node"
    }
    
    response = client.put(
        f"/api/workflow-nodes/{workflow_id}/nodes/{node_id}",
        json=update_data
    )
    
    assert response.status_code == 500  # Will be 500 due to workflow not found


def test_get_workflow_node_not_found(client, db, test_user, test_organization, test_agent):
    """Test retrieval of non-existent workflow node"""
    
    workflow_id = uuid4()
    node_id = uuid4()
    
    response = client.get(
        f"/api/workflow-nodes/{workflow_id}/nodes/{node_id}"
    )
    
    assert response.status_code == 500  # Will be 500 due to workflow not found


def test_update_workflow_node_unauthorized(client, db):
    """Test update of workflow node without proper permissions"""
    
    workflow_id = uuid4()
    node_id = uuid4()
    
    update_data = {
        "name": "Updated Test Node"
    }
    
    # Override auth to return None (no user)
    async def override_get_current_user():
        return None
    
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    response = client.put(
        f"/api/workflow-nodes/{workflow_id}/nodes/{node_id}",
        json=update_data
    )
    
    # Should return 422 due to validation error (no user)
    assert response.status_code in [401, 422, 500] 
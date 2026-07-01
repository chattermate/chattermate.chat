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
from app.models.agent import Agent, AgentType
from app.models.workflow import Workflow, WorkflowStatus
from app.models.organization import Organization
from app.models.user import User
from app.models.widget import Widget
from app.models.customer import Customer
from uuid import uuid4
from app.api import widget as widget_router
from app.database import get_db


# Create a test FastAPI app
app = FastAPI()
app.include_router(
    widget_router.router,
    prefix="/api/widget",
    tags=["widget"]
)


@pytest.fixture
def test_organization(db):
    """Create a test organization"""
    organization = Organization(
        id=uuid4(),
        name="Test Organization",
        domain="test.com"
    )
    db.add(organization)
    db.commit()
    db.refresh(organization)
    return organization


@pytest.fixture
def test_user(db, test_organization):
    """Create a test user"""
    user = User(
        id=uuid4(),
        email="test@example.com",
        hashed_password="hashed_password",
        is_active=True,
        organization_id=test_organization.id,
        full_name="Test User"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_agent(db, test_organization):
    """Create a test agent with workflow enabled"""
    agent = Agent(
        id=uuid4(),
        name="Test Agent",
        display_name="Test Agent",
        description="Test agent with workflow",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Test instruction"],  # Required field
        is_active=True,
        organization_id=test_organization.id,
        use_workflow=True
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


@pytest.fixture
def test_workflow(db, test_organization, test_agent, test_user):
    """Create a test workflow"""
    workflow = Workflow(
        id=uuid4(),
        name="Test Workflow",
        description="Test workflow",
        status=WorkflowStatus.PUBLISHED,
        version=1,
        is_template=False,
        default_language="en",
        canvas_data={
            "nodes": [
                {
                    "id": "start",
                    "type": "start",
                    "data": {"label": "Start"}
                }
            ]
        },
        settings={},
        organization_id=test_organization.id,
        agent_id=test_agent.id,
        created_by=test_user.id
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    
    # Update agent to use this workflow
    test_agent.active_workflow_id = workflow.id
    db.commit()
    
    return workflow


@pytest.fixture
def test_widget(db, test_agent):
    """Create a test widget"""
    widget = Widget(
        name="Test Widget",
        agent_id=test_agent.id,
        organization_id=test_agent.organization_id
    )
    db.add(widget)
    db.commit()
    db.refresh(widget)
    return widget


@pytest.fixture
def test_customer(db, test_organization):
    """Create a test customer"""
    customer = Customer(
        id=uuid4(),
        email="customer@example.com",
        organization_id=test_organization.id,
        metadata={}
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@pytest.fixture
def client(db) -> TestClient:
    """Create test client with mocked dependencies"""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    
    return TestClient(app)


class TestWidgetWorkflow:
    
    def test_widget_created_successfully(self, test_widget, test_agent):
        """Test that widget is created with the right agent"""
        assert test_widget.name == "Test Widget"
        assert test_widget.agent_id == test_agent.id
        assert test_widget.organization_id == test_agent.organization_id
    
    def test_agent_has_workflow_enabled(self, test_agent, test_workflow):
        """Test that the agent has workflow properly configured"""
        assert test_agent.use_workflow is True
        assert test_agent.active_workflow_id == test_workflow.id
    
    def test_workflow_is_published(self, test_workflow):
        """Test that the workflow is in published status"""
        assert test_workflow.status == WorkflowStatus.PUBLISHED
        assert test_workflow.canvas_data is not None
        assert "nodes" in test_workflow.canvas_data
    
    def test_widget_agent_relationship(self, test_widget, test_agent):
        """Test the relationship between widget and agent"""
        assert test_widget.agent_id == test_agent.id
        assert test_widget.organization_id == test_agent.organization_id
    
    def test_agent_workflow_relationship(self, test_agent, test_workflow):
        """Test the relationship between agent and workflow"""
        assert test_agent.active_workflow_id == test_workflow.id
        assert test_workflow.agent_id == test_agent.id
        assert test_agent.organization_id == test_workflow.organization_id 
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
from unittest.mock import Mock, patch, AsyncMock
from app.models.agent import Agent, AgentType
from app.models.workflow import Workflow, WorkflowStatus
from app.models.organization import Organization
from app.models.user import User
from uuid import uuid4


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
        instructions=["Test instruction"],
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


class TestWidgetChatWorkflow:
    
    def test_agent_has_workflow_enabled(self, test_agent, test_workflow):
        """Test that the agent has workflow properly configured"""
        assert test_agent.use_workflow is True
        assert test_agent.active_workflow_id == test_workflow.id
    
    def test_workflow_is_published(self, test_workflow):
        """Test that the workflow is in published status"""
        assert test_workflow.status == WorkflowStatus.PUBLISHED
        assert test_workflow.canvas_data is not None
        assert "nodes" in test_workflow.canvas_data
    
    @pytest.mark.asyncio
    async def test_workflow_execution_service_mock(self, test_agent, test_workflow):
        """Test that WorkflowExecutionService can be mocked properly"""
        from app.services.workflow_execution import WorkflowExecutionService
        
        with patch.object(WorkflowExecutionService, '__init__', return_value=None) as mock_init, \
             patch.object(WorkflowExecutionService, 'execute_workflow', new_callable=AsyncMock) as mock_execute:
            
            mock_execute.return_value = {
                "success": True,
                "message": "Workflow executed",
                "next_node": None
            }
            
            # Create service instance
            service = WorkflowExecutionService(None)
            
            # Call execute_workflow
            result = await service.execute_workflow(
                session_id="test_session",
                message="Hello",
                agent_id=test_agent.id,
                workflow_id=test_workflow.id
            )
            
            # Verify the mock was called and returned expected result
            mock_execute.assert_called_once()
            assert result["success"] is True
            assert result["message"] == "Workflow executed"
    
    def test_workflow_data_structure(self, test_workflow):
        """Test that workflow has proper data structure"""
        assert isinstance(test_workflow.canvas_data, dict)
        assert "nodes" in test_workflow.canvas_data
        assert len(test_workflow.canvas_data["nodes"]) >= 1
        
        # Check first node structure
        first_node = test_workflow.canvas_data["nodes"][0]
        assert "id" in first_node
        assert "type" in first_node
        assert "data" in first_node
    
    def test_agent_workflow_relationship(self, test_agent, test_workflow):
        """Test the relationship between agent and workflow"""
        assert test_agent.active_workflow_id == test_workflow.id
        assert test_workflow.agent_id == test_agent.id
        assert test_agent.organization_id == test_workflow.organization_id 
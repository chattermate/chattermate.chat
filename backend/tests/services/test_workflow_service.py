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
from app.services.workflow import WorkflowService
from app.models.workflow import Workflow, WorkflowStatus
from app.models.schemas.workflow import WorkflowCreate


class TestWorkflowService:
    
    @pytest.fixture
    def mock_db(self):
        """Create a mock database session"""
        db = MagicMock()
        db.add = MagicMock()
        db.commit = MagicMock()
        db.rollback = MagicMock()
        return db
    
    @pytest.fixture
    def mock_workflow_repo(self):
        """Create a mock workflow repository"""
        repo = MagicMock()
        return repo
    
    @pytest.fixture
    def mock_agent_repo(self):
        """Create a mock agent repository"""
        repo = MagicMock()
        return repo
    
    @pytest.fixture
    def workflow_service(self, mock_db, mock_workflow_repo, mock_agent_repo):
        """Create a workflow service with mocked dependencies"""
        service = WorkflowService(mock_db)
        service.workflow_repo = mock_workflow_repo
        service.agent_repo = mock_agent_repo
        return service
    
    @pytest.fixture
    def sample_agent(self):
        """Create a sample agent"""
        agent_id = uuid.uuid4()
        organization_id = uuid.uuid4()
        return MagicMock(
            id=agent_id,
            organization_id=organization_id
        )
    
    @pytest.fixture
    def sample_workflow(self, sample_agent):
        """Create a sample workflow"""
        workflow_id = uuid.uuid4()
        return MagicMock(
            id=workflow_id,
            name="Test Workflow",
            description="Test workflow description",
            status=WorkflowStatus.DRAFT,
            version=1,
            is_template=False,
            default_language="en",
            canvas_data={},
            settings={},
            organization_id=sample_agent.organization_id,
            agent_id=sample_agent.id,
            created_by=uuid.uuid4(),
            created_at=None,
            updated_at=None
        )
    
    @pytest.fixture
    def workflow_create_data(self, sample_agent):
        """Create workflow creation data"""
        return WorkflowCreate(
            name="New Workflow",
            description="New workflow description",
            agent_id=sample_agent.id
        )
    
    def test_create_workflow(self, workflow_service, mock_workflow_repo, mock_agent_repo, sample_agent, workflow_create_data):
        """Test creating a new workflow"""
        created_by = uuid.uuid4()
        organization_id = sample_agent.organization_id
        
        # Setup mock returns
        mock_agent_repo.get_by_id.return_value = sample_agent
        mock_workflow_repo.get_workflows_by_agent.return_value = []
        mock_workflow_repo.get_by_name.return_value = None
        
        # Create a mock workflow to return
        mock_workflow = MagicMock(
            id=uuid.uuid4(),
            name=workflow_create_data.name,
            description=workflow_create_data.description,
            agent_id=sample_agent.id,
            organization_id=organization_id,
            created_by=created_by
        )
        mock_workflow_repo.create_workflow.return_value = mock_workflow
        
        # Call the method
        result = workflow_service.create_workflow(workflow_create_data, created_by, organization_id)
        
        # Assertions
        mock_agent_repo.get_by_id.assert_called_with(sample_agent.id)
        mock_workflow_repo.get_workflows_by_agent.assert_called_with(sample_agent.id)
        mock_workflow_repo.get_by_name.assert_called_with(workflow_create_data.name, organization_id)
        
        # Check that workflow_repo.create_workflow was called with correct parameters
        create_call_args = mock_workflow_repo.create_workflow.call_args[1]
        assert create_call_args["name"] == workflow_create_data.name
        assert create_call_args["description"] == workflow_create_data.description
        assert create_call_args["agent_id"] == sample_agent.id
        assert create_call_args["created_by"] == created_by
        assert create_call_args["organization_id"] == organization_id
        
        assert result == mock_workflow
    
    def test_create_workflow_agent_not_found(self, workflow_service, mock_agent_repo, workflow_create_data):
        """Test creating a workflow when agent not found"""
        created_by = uuid.uuid4()
        organization_id = uuid.uuid4()
        
        # Setup mock returns
        mock_agent_repo.get_by_id.return_value = None
        
        # Call the method and assert exception
        with pytest.raises(ValueError, match="Agent not found"):
            workflow_service.create_workflow(workflow_create_data, created_by, organization_id)
    
    def test_create_workflow_agent_wrong_organization(self, workflow_service, mock_agent_repo, sample_agent, workflow_create_data):
        """Test creating a workflow when agent belongs to different organization"""
        created_by = uuid.uuid4()
        wrong_organization_id = uuid.uuid4()  # Different from sample_agent.organization_id
        
        # Setup mock returns
        mock_agent_repo.get_by_id.return_value = sample_agent
        
        # Call the method and assert exception
        with pytest.raises(ValueError, match="Agent does not belong to your organization"):
            workflow_service.create_workflow(workflow_create_data, created_by, wrong_organization_id)
    
    def test_create_workflow_existing_workflow(self, workflow_service, mock_agent_repo, mock_workflow_repo, sample_agent, sample_workflow, workflow_create_data):
        """Test creating a workflow when agent already has a workflow"""
        created_by = uuid.uuid4()
        organization_id = sample_agent.organization_id
        
        # Setup mock returns
        mock_agent_repo.get_by_id.return_value = sample_agent
        mock_workflow_repo.get_workflows_by_agent.return_value = [sample_workflow]
        
        # Call the method and assert exception
        with pytest.raises(ValueError, match="Agent already has a workflow"):
            workflow_service.create_workflow(workflow_create_data, created_by, organization_id)
    
    def test_create_workflow_name_exists(self, workflow_service, mock_agent_repo, mock_workflow_repo, sample_agent, sample_workflow, workflow_create_data):
        """Test creating a workflow with a name that already exists"""
        created_by = uuid.uuid4()
        organization_id = sample_agent.organization_id
        
        # Setup mock returns
        mock_agent_repo.get_by_id.return_value = sample_agent
        mock_workflow_repo.get_workflows_by_agent.return_value = []
        mock_workflow_repo.get_by_name.return_value = sample_workflow
        
        # Call the method and assert exception
        with pytest.raises(ValueError, match=f"Workflow with name '{workflow_create_data.name}' already exists"):
            workflow_service.create_workflow(workflow_create_data, created_by, organization_id)
    
    def test_get_workflow_by_agent_id(self, workflow_service, mock_agent_repo, mock_workflow_repo, sample_agent, sample_workflow):
        """Test getting workflow by agent ID"""
        organization_id = sample_agent.organization_id
        
        # Setup mock returns
        mock_agent_repo.get_by_id.return_value = sample_agent
        mock_workflow_repo.get_workflows_by_agent.return_value = [sample_workflow]
        
        # Call the method
        result = workflow_service.get_workflow_by_agent_id(sample_agent.id, organization_id)
        
        # Assertions
        mock_agent_repo.get_by_id.assert_called_with(sample_agent.id)
        mock_workflow_repo.get_workflows_by_agent.assert_called_with(sample_agent.id)
        assert result == sample_workflow
    
    def test_get_workflow_by_agent_id_agent_not_found(self, workflow_service, mock_agent_repo):
        """Test getting workflow by agent ID when agent not found"""
        agent_id = uuid.uuid4()
        organization_id = uuid.uuid4()
        
        # Setup mock returns
        mock_agent_repo.get_by_id.return_value = None
        
        # Call the method and assert exception
        with pytest.raises(ValueError, match="Agent not found"):
            workflow_service.get_workflow_by_agent_id(agent_id, organization_id)
    
    def test_get_workflow_by_agent_id_agent_wrong_organization(self, workflow_service, mock_agent_repo, sample_agent):
        """Test getting workflow by agent ID when agent belongs to different organization"""
        wrong_organization_id = uuid.uuid4()  # Different from sample_agent.organization_id
        
        # Setup mock returns
        mock_agent_repo.get_by_id.return_value = sample_agent
        
        # Call the method and assert exception
        with pytest.raises(ValueError, match="Agent does not belong to your organization"):
            workflow_service.get_workflow_by_agent_id(sample_agent.id, wrong_organization_id)
    
    def test_get_workflow_by_agent_id_no_workflow(self, workflow_service, mock_agent_repo, mock_workflow_repo, sample_agent):
        """Test getting workflow by agent ID when no workflow exists"""
        organization_id = sample_agent.organization_id
        
        # Setup mock returns
        mock_agent_repo.get_by_id.return_value = sample_agent
        mock_workflow_repo.get_workflows_by_agent.return_value = []
        
        # Call the method
        result = workflow_service.get_workflow_by_agent_id(sample_agent.id, organization_id)
        
        # Assertions
        assert result is None
    
    def test_update_workflow(self, workflow_service, mock_workflow_repo, mock_agent_repo, sample_workflow):
        """Test updating a workflow"""
        workflow_id = sample_workflow.id
        organization_id = sample_workflow.organization_id
        
        # Prepare update data
        update_data = {
            "name": "Updated Workflow",
            "description": "Updated description"
        }
        
        # Setup mock returns
        mock_workflow_repo.get_by_id.return_value = sample_workflow
        mock_workflow_repo.get_by_name.return_value = None
        
        # Create a mock updated workflow to return
        updated_workflow = MagicMock(
            id=sample_workflow.id,
            name=update_data["name"],
            description=update_data["description"],
            organization_id=sample_workflow.organization_id
        )
        mock_workflow_repo.update_workflow.return_value = updated_workflow
        
        # Call the method
        result = workflow_service.update_workflow(workflow_id, update_data, organization_id)
        
        # Assertions
        mock_workflow_repo.get_by_id.assert_called_with(workflow_id)
        mock_workflow_repo.update_workflow.assert_called_with(workflow_id, **update_data)
        assert result == updated_workflow
    
    def test_update_workflow_not_found(self, workflow_service, mock_workflow_repo):
        """Test updating a workflow that doesn't exist"""
        workflow_id = uuid.uuid4()
        organization_id = uuid.uuid4()
        update_data = {"name": "Updated Workflow"}
        
        # Setup mock returns
        mock_workflow_repo.get_by_id.return_value = None
        
        # Call the method and assert exception
        with pytest.raises(ValueError, match="Workflow not found"):
            workflow_service.update_workflow(workflow_id, update_data, organization_id)
    
    def test_update_workflow_wrong_organization(self, workflow_service, mock_workflow_repo, sample_workflow):
        """Test updating a workflow from a different organization"""
        workflow_id = sample_workflow.id
        wrong_organization_id = uuid.uuid4()  # Different from sample_workflow.organization_id
        update_data = {"name": "Updated Workflow"}
        
        # Setup mock returns
        mock_workflow_repo.get_by_id.return_value = sample_workflow
        
        # Call the method and assert exception
        with pytest.raises(ValueError, match="Workflow does not belong to your organization"):
            workflow_service.update_workflow(workflow_id, update_data, wrong_organization_id)
    
    def test_update_workflow_name_exists(self, workflow_service, mock_workflow_repo, sample_workflow):
        """Test updating a workflow with a name that already exists"""
        workflow_id = sample_workflow.id
        organization_id = sample_workflow.organization_id
        new_name = "Existing Workflow Name"
        update_data = {"name": new_name}
        
        # Create another workflow with the same name
        existing_workflow = MagicMock(
            id=uuid.uuid4(),  # Different ID
            name=new_name,
            organization_id=organization_id
        )
        
        # Setup mock returns
        mock_workflow_repo.get_by_id.return_value = sample_workflow
        mock_workflow_repo.get_by_name.return_value = existing_workflow
        
        # Call the method and assert exception
        with pytest.raises(ValueError, match=f"Workflow with name '{new_name}' already exists"):
            workflow_service.update_workflow(workflow_id, update_data, organization_id)
    
    def test_update_workflow_agent_id(self, workflow_service, mock_workflow_repo, mock_agent_repo, sample_workflow, sample_agent):
        """Test updating a workflow's agent_id"""
        workflow_id = sample_workflow.id
        organization_id = sample_workflow.organization_id
        
        # Create a new agent
        new_agent = MagicMock(
            id=uuid.uuid4(),
            organization_id=organization_id
        )
        
        # Prepare update data
        update_data = {
            "agent_id": new_agent.id
        }
        
        # Setup mock returns
        mock_workflow_repo.get_by_id.return_value = sample_workflow
        mock_agent_repo.get_by_id.return_value = new_agent
        mock_workflow_repo.get_workflows_by_agent.return_value = []
        
        # Create a mock updated workflow to return
        updated_workflow = MagicMock(
            id=sample_workflow.id,
            agent_id=new_agent.id,
            organization_id=organization_id
        )
        mock_workflow_repo.update_workflow.return_value = updated_workflow
        
        # Call the method
        result = workflow_service.update_workflow(workflow_id, update_data, organization_id)
        
        # Assertions
        mock_workflow_repo.get_by_id.assert_called_with(workflow_id)
        mock_agent_repo.get_by_id.assert_called_with(new_agent.id)
        mock_workflow_repo.get_workflows_by_agent.assert_called_with(new_agent.id)
        mock_workflow_repo.update_workflow.assert_called_with(workflow_id, **update_data)
        assert result == updated_workflow
    
    def test_update_workflow_agent_id_agent_not_found(self, workflow_service, mock_workflow_repo, mock_agent_repo, sample_workflow):
        """Test updating a workflow's agent_id when agent not found"""
        workflow_id = sample_workflow.id
        organization_id = sample_workflow.organization_id
        new_agent_id = uuid.uuid4()
        
        # Prepare update data
        update_data = {
            "agent_id": new_agent_id
        }
        
        # Setup mock returns
        mock_workflow_repo.get_by_id.return_value = sample_workflow
        mock_agent_repo.get_by_id.return_value = None
        
        # Call the method and assert exception
        with pytest.raises(ValueError, match="Agent not found"):
            workflow_service.update_workflow(workflow_id, update_data, organization_id)
    
    def test_update_workflow_agent_id_agent_wrong_organization(self, workflow_service, mock_workflow_repo, mock_agent_repo, sample_workflow):
        """Test updating a workflow's agent_id when agent belongs to different organization"""
        workflow_id = sample_workflow.id
        organization_id = sample_workflow.organization_id
        
        # Create a new agent with different organization
        new_agent = MagicMock(
            id=uuid.uuid4(),
            organization_id=uuid.uuid4()  # Different from workflow's organization_id
        )
        
        # Prepare update data
        update_data = {
            "agent_id": new_agent.id
        }
        
        # Setup mock returns
        mock_workflow_repo.get_by_id.return_value = sample_workflow
        mock_agent_repo.get_by_id.return_value = new_agent
        
        # Call the method and assert exception
        with pytest.raises(ValueError, match="Agent does not belong to your organization"):
            workflow_service.update_workflow(workflow_id, update_data, organization_id)
    
    def test_update_workflow_agent_id_agent_has_workflow(self, workflow_service, mock_workflow_repo, mock_agent_repo, sample_workflow):
        """Test updating a workflow's agent_id when agent already has a workflow"""
        workflow_id = sample_workflow.id
        organization_id = sample_workflow.organization_id
        
        # Create a new agent
        new_agent = MagicMock(
            id=uuid.uuid4(),
            organization_id=organization_id
        )
        
        # Create another workflow for the new agent
        existing_workflow = MagicMock(
            id=uuid.uuid4(),  # Different ID
            agent_id=new_agent.id,
            organization_id=organization_id
        )
        
        # Prepare update data
        update_data = {
            "agent_id": new_agent.id
        }
        
        # Setup mock returns
        mock_workflow_repo.get_by_id.return_value = sample_workflow
        mock_agent_repo.get_by_id.return_value = new_agent
        mock_workflow_repo.get_workflows_by_agent.return_value = [existing_workflow]
        
        # Call the method and assert exception
        with pytest.raises(ValueError, match="Agent already has a workflow"):
            workflow_service.update_workflow(workflow_id, update_data, organization_id)
    
    def test_update_workflow_status_to_published(self, workflow_service, mock_workflow_repo, mock_agent_repo, sample_workflow, sample_agent):
        """Test updating a workflow's status to published"""
        workflow_id = sample_workflow.id
        organization_id = sample_workflow.organization_id
        
        # Prepare update data
        update_data = {
            "status": "published"
        }
        
        # Setup mock returns
        mock_workflow_repo.get_by_id.return_value = sample_workflow
        mock_agent_repo.get_by_id.return_value = sample_agent
        
        # Create a mock updated workflow to return
        updated_workflow = MagicMock(
            id=sample_workflow.id,
            status=WorkflowStatus.PUBLISHED,
            agent_id=sample_agent.id,
            organization_id=organization_id
        )
        mock_workflow_repo.update_workflow.return_value = updated_workflow
        
        # Call the method
        result = workflow_service.update_workflow(workflow_id, update_data, organization_id)
        
        # Assertions
        mock_workflow_repo.get_by_id.assert_called_with(workflow_id)
        mock_agent_repo.get_by_id.assert_called_with(sample_agent.id)
        mock_agent_repo.update_agent.assert_called_with(
            sample_agent.id,
            active_workflow_id=workflow_id,
            use_workflow=True
        )
        mock_workflow_repo.update_workflow.assert_called_with(workflow_id, **update_data)
        assert result == updated_workflow
    
    def test_update_workflow_status_to_draft(self, workflow_service, mock_workflow_repo, mock_agent_repo, sample_workflow, sample_agent):
        """Test updating a workflow's status to draft"""
        workflow_id = sample_workflow.id
        organization_id = sample_workflow.organization_id
        
        # Set the agent to use this workflow
        sample_agent.active_workflow_id = workflow_id
        
        # Prepare update data
        update_data = {
            "status": "draft"
        }
        
        # Setup mock returns
        mock_workflow_repo.get_by_id.return_value = sample_workflow
        mock_agent_repo.get_by_id.return_value = sample_agent
        
        # Create a mock updated workflow to return
        updated_workflow = MagicMock(
            id=sample_workflow.id,
            status=WorkflowStatus.DRAFT,
            agent_id=sample_agent.id,
            organization_id=organization_id
        )
        mock_workflow_repo.update_workflow.return_value = updated_workflow
        
        # Call the method
        result = workflow_service.update_workflow(workflow_id, update_data, organization_id)
        
        # Assertions
        mock_workflow_repo.get_by_id.assert_called_with(workflow_id)
        mock_agent_repo.get_by_id.assert_called_with(sample_agent.id)
        mock_agent_repo.update_agent.assert_called_with(
            sample_agent.id,
            active_workflow_id=None,
            use_workflow=False
        )
        mock_workflow_repo.update_workflow.assert_called_with(workflow_id, **update_data)
        assert result == updated_workflow
    
    def test_delete_workflow(self, workflow_service, mock_workflow_repo, mock_agent_repo, sample_workflow, sample_agent):
        """Test deleting a workflow"""
        workflow_id = sample_workflow.id
        organization_id = sample_workflow.organization_id
        
        # Set the agent to use this workflow
        sample_agent.active_workflow_id = workflow_id
        
        # Setup mock returns
        mock_workflow_repo.get_by_id.return_value = sample_workflow
        mock_agent_repo.get_by_id.return_value = sample_agent
        mock_workflow_repo.delete_workflow.return_value = True
        
        # Call the method
        result = workflow_service.delete_workflow(workflow_id, organization_id)
        
        # Assertions
        mock_workflow_repo.get_by_id.assert_called_with(workflow_id)
        mock_agent_repo.get_by_id.assert_called_with(sample_workflow.agent_id)
        mock_agent_repo.update_agent.assert_called_with(
            sample_agent.id,
            active_workflow_id=None,
            use_workflow=False
        )
        mock_workflow_repo.delete_workflow.assert_called_with(workflow_id)
        assert result is True
    
    def test_delete_workflow_not_found(self, workflow_service, mock_workflow_repo):
        """Test deleting a workflow that doesn't exist"""
        workflow_id = uuid.uuid4()
        organization_id = uuid.uuid4()
        
        # Setup mock returns
        mock_workflow_repo.get_by_id.return_value = None
        
        # Call the method and assert exception
        with pytest.raises(ValueError, match="Workflow not found"):
            workflow_service.delete_workflow(workflow_id, organization_id)
    
    def test_delete_workflow_wrong_organization(self, workflow_service, mock_workflow_repo, sample_workflow):
        """Test deleting a workflow from a different organization"""
        workflow_id = sample_workflow.id
        wrong_organization_id = uuid.uuid4()  # Different from sample_workflow.organization_id
        
        # Setup mock returns
        mock_workflow_repo.get_by_id.return_value = sample_workflow
        
        # Call the method and assert exception
        with pytest.raises(ValueError, match="Workflow does not belong to your organization"):
            workflow_service.delete_workflow(workflow_id, wrong_organization_id) 
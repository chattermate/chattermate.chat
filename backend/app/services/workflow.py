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

from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.repositories.workflow import WorkflowRepository
from app.repositories.agent import AgentRepository
from app.models.workflow import Workflow
from app.models.schemas.workflow import WorkflowCreate
from app.core.logger import get_logger

logger = get_logger(__name__)


class WorkflowService:
    def __init__(self, db: Session):
        self.db = db
        self.workflow_repo = WorkflowRepository(db)
        self.agent_repo = AgentRepository(db)

    def create_workflow(self, workflow_data: WorkflowCreate, created_by: UUID, organization_id: UUID) -> Workflow:
        """Create a new workflow with validation"""
        
        # Validate agent exists and belongs to organization
        agent = self.agent_repo.get_by_id(workflow_data.agent_id)
        if not agent:
            raise ValueError("Agent not found")
        
        if agent.organization_id != organization_id:
            raise ValueError("Agent does not belong to your organization")
        
        # Check if workflow already exists for this agent
        existing_workflow = self.workflow_repo.get_workflows_by_agent(workflow_data.agent_id)
        if existing_workflow:
            raise ValueError("Agent already has a workflow. Only one workflow per agent is allowed.")
        
        # Check if workflow name already exists in organization
        existing_workflow_name = self.workflow_repo.get_by_name(
            workflow_data.name, 
            organization_id
        )
        if existing_workflow_name:
            raise ValueError(f"Workflow with name '{workflow_data.name}' already exists")
        
        # Create workflow data
        workflow_dict = workflow_data.model_dump()
        workflow_dict.update({
            "created_by": created_by,
            "organization_id": organization_id
        })
        
        # Create workflow
        workflow = self.workflow_repo.create_workflow(**workflow_dict)
        
        logger.info(f"Created workflow {workflow.id} for agent {workflow_data.agent_id}")
        return workflow

    def get_workflow_by_agent_id(self, agent_id: UUID, organization_id: UUID) -> Optional[Workflow]:
        """Get workflow by agent ID with organization validation"""
        
        # Validate agent exists and belongs to organization
        agent = self.agent_repo.get_by_id(agent_id)
        if not agent:
            raise ValueError("Agent not found")
        
        if agent.organization_id != organization_id:
            raise ValueError("Agent does not belong to your organization")
        
        # Get workflows for this agent
        workflows = self.workflow_repo.get_workflows_by_agent(agent_id)
        
        # Return the first workflow (should be only one due to our constraint)
        return workflows[0] if workflows else None

    def update_workflow(self, workflow_id: UUID, workflow_data: dict, organization_id: UUID) -> Optional[Workflow]:
        """Update workflow with validation"""
        
        # Get existing workflow
        workflow = self.workflow_repo.get_by_id(workflow_id)
        if not workflow:
            raise ValueError("Workflow not found")
        
        # Verify organization access
        if workflow.organization_id != organization_id:
            raise ValueError("Workflow does not belong to your organization")
        
        # If name is being updated, check for duplicates
        if 'name' in workflow_data and workflow_data['name'] != workflow.name:
            existing_workflow = self.workflow_repo.get_by_name(
                workflow_data['name'], 
                organization_id
            )
            if existing_workflow and existing_workflow.id != workflow_id:
                raise ValueError(f"Workflow with name '{workflow_data['name']}' already exists")
        
        # If agent_id is being updated, validate the new agent and check constraint
        if 'agent_id' in workflow_data and workflow_data['agent_id'] != workflow.agent_id:
            # Validate new agent exists and belongs to organization
            agent = self.agent_repo.get_by_id(workflow_data['agent_id'])
            if not agent:
                raise ValueError("Agent not found")
            
            if agent.organization_id != organization_id:
                raise ValueError("Agent does not belong to your organization")
            
            # Check if new agent already has a workflow
            existing_workflows = self.workflow_repo.get_workflows_by_agent(workflow_data['agent_id'])
            if existing_workflows:
                raise ValueError("Agent already has a workflow. Only one workflow per agent is allowed.")
        
        # Check if status is being updated to published
        if 'status' in workflow_data and workflow_data['status'] == 'published':
            # When publishing, update the agent's active_workflow_id and use_workflow
            agent = self.agent_repo.get_by_id(workflow.agent_id)
            if agent:
                self.agent_repo.update_agent(
                    workflow.agent_id, 
                    active_workflow_id=workflow_id,
                    use_workflow=True
                )
                logger.info(f"Updated agent {workflow.agent_id} active_workflow_id to {workflow_id}")
        
        # Check if status is being updated to draft (unpublished)
        if 'status' in workflow_data and workflow_data['status'] == 'draft':
            # When unpublishing, clear the agent's active_workflow_id and disable workflow
            agent = self.agent_repo.get_by_id(workflow.agent_id)
            if agent and agent.active_workflow_id == workflow_id:
                self.agent_repo.update_agent(
                    workflow.agent_id, 
                    active_workflow_id=None,
                    use_workflow=False
                )
                logger.info(f"Cleared agent {workflow.agent_id} active_workflow_id")
        
        # Update workflow
        updated_workflow = self.workflow_repo.update_workflow(workflow_id, **workflow_data)
        
        logger.info(f"Updated workflow {workflow_id}")
        return updated_workflow

    def delete_workflow(self, workflow_id: UUID, organization_id: UUID) -> bool:
        """Delete workflow with validation"""
        
        # Get existing workflow
        workflow = self.workflow_repo.get_by_id(workflow_id)
        if not workflow:
            raise ValueError("Workflow not found")
        
        # Verify organization access
        if workflow.organization_id != organization_id:
            raise ValueError("Workflow does not belong to your organization")
        
        # Clear agent's active_workflow_id if this workflow is active
        agent = self.agent_repo.get_by_id(workflow.agent_id)
        if agent and agent.active_workflow_id == workflow_id:
            self.agent_repo.update_agent(
                workflow.agent_id, 
                active_workflow_id=None,
                use_workflow=False
            )
            logger.info(f"Cleared agent {workflow.agent_id} active_workflow_id before deleting workflow")
        
        # Delete workflow
        success = self.workflow_repo.delete_workflow(workflow_id)
        
        if success:
            logger.info(f"Deleted workflow {workflow_id}")
        
        return success

 
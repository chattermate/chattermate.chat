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

from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import SQLAlchemyError

from app.models.workflow import Workflow, WorkflowStatus
from app.models.workflow_node import WorkflowNode
from app.models.workflow_connection import WorkflowConnection

from app.core.logger import get_logger

logger = get_logger(__name__)


class WorkflowRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_workflow(self, **kwargs) -> Workflow:
        """Create a new workflow"""
        try:
            workflow = Workflow(**kwargs)
            self.db.add(workflow)
            self.db.commit()
            self.db.refresh(workflow)
            logger.info(f"Created workflow: {workflow.id}")
            return workflow
        except Exception as e:
            logger.error(f"Error creating workflow: {str(e)}")
            self.db.rollback()
            raise

    def get_by_id(self, workflow_id: UUID) -> Optional[Workflow]:
        """Get workflow by ID"""
        return self.db.query(Workflow).filter(Workflow.id == workflow_id).first()

    def get_by_name(self, name: str, organization_id: UUID) -> Optional[Workflow]:
        """Get workflow by name within organization"""
        return self.db.query(Workflow).filter(
            Workflow.name == name,
            Workflow.organization_id == organization_id
        ).first()

    def get_all_workflows(self, organization_id: UUID) -> List[Workflow]:
        """Get all workflows for an organization"""
        return self.db.query(Workflow).filter(
            Workflow.organization_id == organization_id
        ).all()

    def get_workflows_by_agent(self, agent_id: UUID) -> List[Workflow]:
        """Get all workflows for a specific agent"""
        return self.db.query(Workflow).filter(
            Workflow.agent_id == agent_id
        ).all()

    def get_published_workflows(self, organization_id: UUID) -> List[Workflow]:
        """Get all published workflows for an organization"""
        return self.db.query(Workflow).filter(
            Workflow.organization_id == organization_id,
            Workflow.status == WorkflowStatus.PUBLISHED
        ).all()

    def get_workflow_templates(self, organization_id: UUID) -> List[Workflow]:
        """Get all workflow templates for an organization"""
        return self.db.query(Workflow).filter(
            Workflow.organization_id == organization_id,
            Workflow.is_template == True
        ).all()

    def update_workflow(self, workflow_id: UUID, **kwargs) -> Optional[Workflow]:
        """Update workflow"""
        try:
            workflow = self.get_by_id(workflow_id)
            if not workflow:
                return None

            for key, value in kwargs.items():
                if hasattr(workflow, key):
                    setattr(workflow, key, value)

            self.db.commit()
            self.db.refresh(workflow)
            logger.info(f"Updated workflow: {workflow_id}")
            return workflow
        except Exception as e:
            logger.error(f"Error updating workflow {workflow_id}: {str(e)}")
            self.db.rollback()
            raise

    def delete_workflow(self, workflow_id: UUID) -> bool:
        """Delete workflow and all related data"""
        try:
            workflow = self.get_by_id(workflow_id)
            if not workflow:
                return False

            self.db.delete(workflow)
            self.db.commit()
            logger.info(f"Deleted workflow: {workflow_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting workflow {workflow_id}: {str(e)}")
            self.db.rollback()
            raise

    def get_workflow_with_nodes_and_connections(self, workflow_id: UUID) -> Optional[Workflow]:
        """Get workflow with all nodes and connections"""
        return self.db.query(Workflow).options(
            selectinload(Workflow.nodes),
            selectinload(Workflow.connections)
        ).filter(Workflow.id == workflow_id).first() 
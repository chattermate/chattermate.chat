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

from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.workflow_node import WorkflowNode
from app.models.workflow_connection import WorkflowConnection
from app.core.logger import get_logger

logger = get_logger(__name__)


class WorkflowNodeRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_node(self, **kwargs) -> WorkflowNode:
        """Create a new workflow node"""
        try:
            node = WorkflowNode(**kwargs)
            self.db.add(node)
            self.db.flush()  # Flush to get the ID without committing
            logger.info(f"Created workflow node: {node.id}")
            return node
        except Exception as e:
            logger.error(f"Error creating workflow node: {str(e)}")
            raise

    def get_nodes_by_workflow(self, workflow_id: UUID) -> List[WorkflowNode]:
        """Get all nodes for a workflow"""
        return self.db.query(WorkflowNode).filter(
            WorkflowNode.workflow_id == workflow_id
        ).all()

    def get_node_by_id(self, node_id: UUID) -> Optional[WorkflowNode]:
        """Get node by ID"""
        return self.db.query(WorkflowNode).filter(WorkflowNode.id == node_id).first()

    def update_node(self, node_id: UUID, **kwargs) -> Optional[WorkflowNode]:
        """Update workflow node"""
        try:
            node = self.get_node_by_id(node_id)
            if not node:
                return None

            # Filter out None values to avoid overwriting existing data with None
            # Only update fields that have actual values
            for key, value in kwargs.items():
                if hasattr(node, key) and value is not None:
                    setattr(node, key, value)

            self.db.flush()  # Flush to update without committing
            logger.info(f"Updated workflow node: {node_id}")
            return node
        except Exception as e:
            logger.error(f"Error updating workflow node {node_id}: {str(e)}")
            raise

    def delete_node(self, node_id: UUID) -> bool:
        """Delete workflow node"""
        try:
            node = self.get_node_by_id(node_id)
            if not node:
                return False

            self.db.delete(node)
            self.db.flush()  # Flush to delete without committing
            logger.info(f"Deleted workflow node: {node_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting workflow node {node_id}: {str(e)}")
            raise

    def delete_nodes_by_workflow(self, workflow_id: UUID) -> bool:
        """Delete all nodes for a workflow"""
        try:
            # Delete all nodes directly without calling get_nodes_by_workflow to avoid the JOIN issue
            deleted_count = self.db.query(WorkflowNode).filter(
                WorkflowNode.workflow_id == workflow_id
            ).delete()
            
            self.db.flush()  # Flush to delete without committing
            logger.info(f"Deleted {deleted_count} nodes for workflow: {workflow_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting nodes for workflow {workflow_id}: {str(e)}")
            raise

    def create_connection(self, **kwargs) -> WorkflowConnection:
        """Create a new workflow connection"""
        try:
            connection = WorkflowConnection(**kwargs)
            self.db.add(connection)
            self.db.flush()  # Flush to get the ID without committing
            logger.info(f"Created workflow connection: {connection.id}")
            return connection
        except Exception as e:
            logger.error(f"Error creating workflow connection: {str(e)}")
            raise

    def get_connections_by_workflow(self, workflow_id: UUID) -> List[WorkflowConnection]:
        """Get all connections for a workflow"""
        return self.db.query(WorkflowConnection).filter(
            WorkflowConnection.workflow_id == workflow_id
        ).all()

    def delete_connections_by_workflow(self, workflow_id: UUID) -> bool:
        """Delete all connections for a workflow"""
        try:
            connections = self.get_connections_by_workflow(workflow_id)
            for connection in connections:
                self.db.delete(connection)
            
            self.db.flush()  # Flush to delete without committing
            logger.info(f"Deleted all connections for workflow: {workflow_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting connections for workflow {workflow_id}: {str(e)}")
            raise 
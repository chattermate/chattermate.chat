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

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from uuid import UUID
from pydantic import BaseModel
from app.core.logger import get_logger
from app.database import get_db
from app.models.user import User
from app.core.auth import require_permissions, get_current_user
from app.services.workflow_node import WorkflowNodeService
from app.models.schemas.workflow import WorkflowNodeResponse, WorkflowConnectionResponse, WorkflowNodeUpdate


router = APIRouter()
logger = get_logger(__name__)


class WorkflowNodesUpdateRequest(BaseModel):
    nodes: List[Dict[str, Any]]
    connections: List[Dict[str, Any]]


class WorkflowNodesResponse(BaseModel):
    nodes: List[WorkflowNodeResponse]
    connections: List[WorkflowConnectionResponse]


@router.put("/{workflow_id}/nodes", response_model=WorkflowNodesResponse)
async def replace_workflow_nodes(
    workflow_id: UUID,
    request_data: WorkflowNodesUpdateRequest,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db)
):
    """Replace all workflow nodes and connections with cached data"""
    try:
        workflow_node_service = WorkflowNodeService(db)
        
        # Replace all nodes and connections (delete existing, save new ones)
        result = workflow_node_service.replace_workflow_nodes_and_connections(
            workflow_id=workflow_id,
            nodes_data=request_data.nodes,
            connections_data=request_data.connections,
            organization_id=current_user.organization_id
        )
        
        # Convert to response format
        nodes_response = [
            WorkflowNodeResponse(
                id=node.id,
                workflow_id=node.workflow_id,
                node_type=node.node_type,
                name=node.name,
                description=node.description,
                position_x=node.position_x,
                position_y=node.position_y,
                config=node.config,
                created_at=node.created_at,
                updated_at=node.updated_at
            )
            for node in result["nodes"]
        ]
        
        connections_response = [
            WorkflowConnectionResponse(
                id=conn.id,
                workflow_id=conn.workflow_id,
                source_node_id=conn.source_node_id,
                target_node_id=conn.target_node_id,
                label=conn.label,
                condition=conn.condition,
                priority=conn.priority,
                connection_metadata=conn.connection_metadata,
                created_at=conn.created_at,
                updated_at=conn.updated_at
            )
            for conn in result["connections"]
        ]
        
        return WorkflowNodesResponse(
            nodes=nodes_response,
            connections=connections_response
        )
        
    except ValueError as e:
        logger.error(f"Validation error updating workflow nodes: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        # Let intended HTTP errors (e.g. 403 plan feature-gate, 400, 404) propagate
        # instead of being masked as a generic 500.
        raise
    except Exception as e:
        logger.error(f"Error replacing workflow nodes: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to replace workflow nodes")


@router.get("/{workflow_id}/nodes", response_model=WorkflowNodesResponse)
async def get_workflow_nodes(
    workflow_id: UUID,
    current_user: User = Depends(require_permissions("view_all", "manage_agents")),
    db: Session = Depends(get_db)
):
    """Get all nodes and connections for a workflow"""
    try:
        workflow_node_service = WorkflowNodeService(db)
        
        # Get nodes and connections
        result = workflow_node_service.get_workflow_nodes_and_connections(
            workflow_id=workflow_id,
            organization_id=current_user.organization_id
        )
        
        # Convert to response format
        nodes_response = [
            WorkflowNodeResponse(
                id=node.id,
                workflow_id=node.workflow_id,
                node_type=node.node_type,
                name=node.name,
                description=node.description,
                position_x=node.position_x,
                position_y=node.position_y,
                config=node.config,
                created_at=node.created_at,
                updated_at=node.updated_at
            )
            for node in result["nodes"]
        ]
        
        connections_response = [
            WorkflowConnectionResponse(
                id=conn.id,
                workflow_id=conn.workflow_id,
                source_node_id=conn.source_node_id,
                target_node_id=conn.target_node_id,
                label=conn.label,
                condition=conn.condition,
                priority=conn.priority,
                connection_metadata=conn.connection_metadata,
                created_at=conn.created_at,
                updated_at=conn.updated_at
            )
            for conn in result["connections"]
        ]
        
        return WorkflowNodesResponse(
            nodes=nodes_response,
            connections=connections_response
        )
        
    except ValueError as e:
        logger.error(f"Validation error getting workflow nodes: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        # Let intended HTTP errors (e.g. 403 plan feature-gate, 400, 404) propagate
        # instead of being masked as a generic 500.
        raise
    except Exception as e:
        logger.error(f"Error getting workflow nodes: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get workflow nodes")


@router.put("/{workflow_id}/nodes/{node_id}", response_model=WorkflowNodeResponse)
async def update_workflow_node(
    workflow_id: UUID,
    node_id: UUID,
    node_data: WorkflowNodeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a single workflow node with its properties"""
    try:
        # Get the workflow node service
        workflow_node_service = WorkflowNodeService(db)
        logger.debug(f"Node data: {node_data}")
        # Update the node
        updated_node = workflow_node_service.update_single_node(
            workflow_id=workflow_id,
            node_id=node_id,
            node_data=node_data.model_dump(),
            organization_id=current_user.organization_id
        )
        
        if not updated_node:
            raise HTTPException(status_code=400, detail="Node not found or could not be updated")
        
        return updated_node
        
    except HTTPException:
        # Let intended HTTP errors (e.g. 403 plan feature-gate, 400, 404) propagate
        # instead of being masked as a generic 500.
        raise
    except Exception as e:
        logger.error(f"Error updating workflow node: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update workflow node: {str(e)}")


@router.get("/{workflow_id}/nodes/{node_id}", response_model=WorkflowNodeResponse)
async def get_workflow_node(
    workflow_id: UUID,
    node_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single workflow node"""
    try:
        # Get the workflow node service
        workflow_node_service = WorkflowNodeService(db)
        
        # Get the node
        node = workflow_node_service.get_single_node(
            workflow_id=workflow_id,
            node_id=node_id,
            organization_id=current_user.organization_id
        )
        
        if not node:
            raise HTTPException(status_code=400, detail="Node not found")
        
        return node
        
    except HTTPException:
        # Let intended HTTP errors (e.g. 403 plan feature-gate, 400, 404) propagate
        # instead of being masked as a generic 500.
        raise
    except Exception as e:
        logger.error(f"Error getting workflow node: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get workflow node: {str(e)}") 
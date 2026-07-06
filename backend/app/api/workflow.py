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
from typing import Optional
from uuid import UUID
from app.core.logger import get_logger
from app.database import get_db
from app.models.user import User
from app.core.auth import require_permissions
from app.services.workflow import WorkflowService
from app.models.schemas.workflow import WorkflowCreate, WorkflowResponse, WorkflowUpdate

# Enterprise feature check
try:
    from app.enterprise.repositories.plan import PlanRepository
    from app.enterprise.services.feature_access import require_accessible_subscription
    HAS_ENTERPRISE = True
except ImportError:
    HAS_ENTERPRISE = False

router = APIRouter()
logger = get_logger(__name__)


def check_workflow_feature_access(current_user: User, db: Session):
    """Check if user has access to workflow feature"""
    if not HAS_ENTERPRISE:
        return  # Allow access in non-enterprise mode
    
    # Accessible = active/trial/past-due-in-period OR cancelled-but-still-in-
    # paid-period; raises 403 when the org has no accessible plan.
    subscription = require_accessible_subscription(db, current_user.organization_id)
    plan_repo = PlanRepository(db)

    # Check if workflow feature is available in the plan
    if not plan_repo.check_feature_availability(str(subscription.plan_id), 'workflow'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Workflow feature is not available in your current plan. Please upgrade to access this feature."
        )


@router.post("", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    workflow_data: WorkflowCreate,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db)
):
    """Create a new workflow"""
    try:
        # Check workflow feature access
        check_workflow_feature_access(current_user, db)
        
        workflow_service = WorkflowService(db)
        
        # Create workflow with organization ID from current user
        workflow = workflow_service.create_workflow(
            workflow_data=workflow_data,
            created_by=current_user.id,
            organization_id=current_user.organization_id
        )
        
        # Prepare response
        response = WorkflowResponse(
            id=workflow.id,
            name=workflow.name,
            description=workflow.description,
            status=workflow.status,
            version=workflow.version,
            is_template=workflow.is_template,
            default_language=workflow.default_language,
            canvas_data=workflow.canvas_data,
            settings=workflow.settings,
            organization_id=workflow.organization_id,
            agent_id=workflow.agent_id,
            created_by=workflow.created_by,
            created_at=workflow.created_at,
            updated_at=workflow.updated_at
        )
        
        return response
        
    except ValueError as e:
        logger.error(f"Validation error creating workflow: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        # Let intended HTTP errors (e.g. 403 plan feature-gate, 400, 404) propagate
        # instead of being masked as a generic 500.
        raise
    except Exception as e:
        logger.error(f"Error creating workflow: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create workflow")


@router.get("/agent/{agent_id}", response_model=Optional[WorkflowResponse])
async def get_workflow_by_agent_id(
    agent_id: UUID,
    current_user: User = Depends(require_permissions("view_all", "manage_agents")),
    db: Session = Depends(get_db)
):
    """Get workflow by agent ID"""
    try:
        # Check workflow feature access
        check_workflow_feature_access(current_user, db)
        
        workflow_service = WorkflowService(db)
        
        # Get workflow for the agent
        workflow = workflow_service.get_workflow_by_agent_id(
            agent_id=agent_id,
            organization_id=current_user.organization_id
        )
        
        if not workflow:
            return None
        
        # Prepare response
        response = WorkflowResponse(
            id=workflow.id,
            name=workflow.name,
            description=workflow.description,
            status=workflow.status,
            version=workflow.version,
            is_template=workflow.is_template,
            default_language=workflow.default_language,
            canvas_data=workflow.canvas_data,
            settings=workflow.settings,
            organization_id=workflow.organization_id,
            agent_id=workflow.agent_id,
            created_by=workflow.created_by,
            created_at=workflow.created_at,
            updated_at=workflow.updated_at
        )
        
        return response
        
    except ValueError as e:
        logger.error(f"Validation error getting workflow by agent ID: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        # Let intended HTTP errors (e.g. 403 plan feature-gate, 400, 404) propagate
        # instead of being masked as a generic 500.
        raise
    except Exception as e:
        logger.error(f"Error getting workflow by agent ID: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get workflow")


@router.put("/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: UUID,
    workflow_data: WorkflowUpdate,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db)
):
    """Update workflow"""
    try:
        # Check workflow feature access
        check_workflow_feature_access(current_user, db)
        
        workflow_service = WorkflowService(db)
        
        # Update workflow
        workflow = workflow_service.update_workflow(
            workflow_id=workflow_id,
            workflow_data=workflow_data.model_dump(exclude_unset=True),
            organization_id=current_user.organization_id
        )
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Prepare response
        response = WorkflowResponse(
            id=workflow.id,
            name=workflow.name,
            description=workflow.description,
            status=workflow.status,
            version=workflow.version,
            is_template=workflow.is_template,
            default_language=workflow.default_language,
            canvas_data=workflow.canvas_data,
            settings=workflow.settings,
            organization_id=workflow.organization_id,
            agent_id=workflow.agent_id,
            created_by=workflow.created_by,
            created_at=workflow.created_at,
            updated_at=workflow.updated_at
        )
        
        return response
        
    except ValueError as e:
        logger.error(f"Validation error updating workflow: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        # Let intended HTTP errors (e.g. 403 plan feature-gate, 400, 404) propagate
        # instead of being masked as a generic 500.
        raise
    except Exception as e:
        logger.error(f"Error updating workflow: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update workflow")


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(
    workflow_id: UUID,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db)
):
    """Delete workflow"""
    try:
        # Check workflow feature access
        check_workflow_feature_access(current_user, db)
        
        workflow_service = WorkflowService(db)
        
        # Delete workflow
        success = workflow_service.delete_workflow(
            workflow_id=workflow_id,
            organization_id=current_user.organization_id
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        return None  # 204 No Content
        
    except ValueError as e:
        logger.error(f"Validation error deleting workflow: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        # Let intended HTTP errors (e.g. 403 plan feature-gate, 400, 404) propagate
        # instead of being masked as a generic 500.
        raise
    except Exception as e:
        logger.error(f"Error deleting workflow: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete workflow") 
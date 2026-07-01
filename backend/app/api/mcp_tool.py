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
from typing import List
from app.core.logger import get_logger
from app.database import get_db
from app.models.user import User
from app.core.auth import get_current_user, require_permissions
from app.repositories.mcp_tool import MCPToolRepository
from app.repositories.agent import AgentRepository

# Enterprise feature check
try:
    from app.enterprise.repositories.subscription import SubscriptionRepository
    from app.enterprise.repositories.plan import PlanRepository
    HAS_ENTERPRISE = True
except ImportError:
    HAS_ENTERPRISE = False
from app.models.schemas.mcp_tool import (
    MCPToolCreate, MCPToolUpdate, MCPToolResponse,
    MCPToolToAgentCreate, MCPToolToAgentResponse,
    AgentMCPToolsResponse
)
from sqlalchemy.orm import Session
from uuid import UUID

router = APIRouter()
logger = get_logger(__name__)


def check_mcp_feature_access(current_user: User, db: Session):
    """Check if user has access to MCP tools feature"""
    if not HAS_ENTERPRISE:
        return  # Allow access in non-enterprise mode
    
    subscription_repo = SubscriptionRepository(db)
    plan_repo = PlanRepository(db)
    
    # Get current subscription
    subscription = subscription_repo.get_by_organization(str(current_user.organization_id))
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active subscription found"
        )
    
    # Check subscription status
    if not subscription.is_active() and not subscription.is_trial():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Subscription is not active"
        )
    
    # Check if MCP tools feature is available in the plan
    if not plan_repo.check_feature_availability(str(subscription.plan_id), 'mcp_tools'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="MCP Tools feature is not available in your current plan. Please upgrade to access this feature."
        )


@router.post("", response_model=MCPToolResponse)
async def create_mcp_tool(
    mcp_tool_data: MCPToolCreate,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db)
):
    """Create a new MCP tool"""
    try:
        # Check MCP tools feature access
        check_mcp_feature_access(current_user, db)
        
        mcp_tool_repo = MCPToolRepository(db)
        
        # Set organization_id from current user
        create_data = mcp_tool_data.model_dump()
        create_data['organization_id'] = current_user.organization_id
        
        # Check if MCP tool with same name already exists
        existing = mcp_tool_repo.get_by_name(
            mcp_tool_data.name, 
            current_user.organization_id
        )
        if existing:
            raise HTTPException(
                status_code=400,
                detail="MCP tool with this name already exists"
            )
        
        mcp_tool = mcp_tool_repo.create_mcp_tool(**create_data)
        return mcp_tool
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"MCP tool creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=List[MCPToolResponse])
async def get_organization_mcp_tools(
    enabled_only: bool = True,
    current_user: User = Depends(require_permissions("view_all", "manage_agents")),
    db: Session = Depends(get_db)
):
    """Get all MCP tools for the current user's organization"""
    try:
        # Check MCP tools feature access
        check_mcp_feature_access(current_user, db)
        
        mcp_tool_repo = MCPToolRepository(db)
        mcp_tools = mcp_tool_repo.get_org_mcp_tools(
            current_user.organization_id, 
            enabled_only=enabled_only
        )
        return mcp_tools
        
    except Exception as e:
        logger.error(f"Error fetching MCP tools: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{mcp_tool_id}", response_model=MCPToolResponse)
async def get_mcp_tool(
    mcp_tool_id: int,
    current_user: User = Depends(require_permissions("view_all", "manage_agents")),
    db: Session = Depends(get_db)
):
    """Get a specific MCP tool"""
    try:
        mcp_tool_repo = MCPToolRepository(db)
        mcp_tool = mcp_tool_repo.get_mcp_tool(mcp_tool_id)
        
        if not mcp_tool:
            raise HTTPException(
                status_code=404,
                detail="MCP tool not found"
            )
        
        # Check if user has access to this MCP tool's organization
        if mcp_tool.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to access this MCP tool"
            )
        
        return mcp_tool
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error fetching MCP tool: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{mcp_tool_id}", response_model=MCPToolResponse)
async def update_mcp_tool(
    mcp_tool_id: int,
    update_data: MCPToolUpdate,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db)
):
    """Update an existing MCP tool"""
    try:
        mcp_tool_repo = MCPToolRepository(db)
        mcp_tool = mcp_tool_repo.get_mcp_tool(mcp_tool_id)
        
        if not mcp_tool:
            raise HTTPException(
                status_code=404,
                detail="MCP tool not found"
            )
        
        # Check if user has access to this MCP tool's organization
        if mcp_tool.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to update this MCP tool"
            )
        
        # Update MCP tool with provided fields
        update_dict = update_data.model_dump(exclude_unset=True)
        
        # Check for name conflicts if name is being updated
        if 'name' in update_dict:
            existing = mcp_tool_repo.get_by_name(
                update_dict['name'], 
                current_user.organization_id
            )
            if existing and existing.id != mcp_tool_id:
                raise HTTPException(
                    status_code=400,
                    detail="MCP tool with this name already exists"
                )
        
        updated_mcp_tool = mcp_tool_repo.update_mcp_tool(mcp_tool_id, **update_dict)
        return updated_mcp_tool
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"MCP tool update error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{mcp_tool_id}")
async def delete_mcp_tool(
    mcp_tool_id: int,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db)
):
    """Delete an MCP tool"""
    try:
        mcp_tool_repo = MCPToolRepository(db)
        mcp_tool = mcp_tool_repo.get_mcp_tool(mcp_tool_id)
        
        if not mcp_tool:
            raise HTTPException(
                status_code=404,
                detail="MCP tool not found"
            )
        
        # Check if user has access to this MCP tool's organization
        if mcp_tool.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to delete this MCP tool"
            )
        
        success = mcp_tool_repo.delete_mcp_tool(mcp_tool_id)
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to delete MCP tool"
            )
        
        return {"message": "MCP tool deleted successfully"}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"MCP tool deletion error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Agent-MCPTool association endpoints
@router.post("/agent-association", response_model=MCPToolToAgentResponse)
async def add_mcp_tool_to_agent(
    association_data: MCPToolToAgentCreate,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db)
):
    """Add MCP tool to agent"""
    try:
        # Check MCP tools feature access
        check_mcp_feature_access(current_user, db)
        
        mcp_tool_repo = MCPToolRepository(db)
        agent_repo = AgentRepository(db)
        
        # Verify MCP tool exists and belongs to user's organization
        mcp_tool = mcp_tool_repo.get_mcp_tool(association_data.mcp_tool_id)
        if not mcp_tool:
            raise HTTPException(
                status_code=404,
                detail="MCP tool not found"
            )
        
        if mcp_tool.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to access this MCP tool"
            )
        
        # Verify agent exists and belongs to user's organization
        agent = agent_repo.get_agent(association_data.agent_id)
        if not agent:
            raise HTTPException(
                status_code=404,
                detail="Agent not found"
            )
        
        if agent.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to access this agent"
            )
        
        # Create association
        association = mcp_tool_repo.add_mcp_tool_to_agent(
            association_data.mcp_tool_id,
            association_data.agent_id
        )
        
        return association
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error adding MCP tool to agent: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/agent-association/{mcp_tool_id}/{agent_id}")
async def remove_mcp_tool_from_agent(
    mcp_tool_id: int,
    agent_id: UUID,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db)
):
    """Remove MCP tool from agent"""
    try:
        mcp_tool_repo = MCPToolRepository(db)
        agent_repo = AgentRepository(db)
        
        # Verify MCP tool exists and belongs to user's organization
        mcp_tool = mcp_tool_repo.get_mcp_tool(mcp_tool_id)
        if not mcp_tool:
            raise HTTPException(
                status_code=404,
                detail="MCP tool not found"
            )
        
        if mcp_tool.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to access this MCP tool"
            )
        
        # Verify agent exists and belongs to user's organization
        agent = agent_repo.get_agent(agent_id)
        if not agent:
            raise HTTPException(
                status_code=404,
                detail="Agent not found"
            )
        
        if agent.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to access this agent"
            )
        
        # Remove association
        success = mcp_tool_repo.remove_mcp_tool_from_agent(mcp_tool_id, agent_id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Association not found"
            )
        
        return {"message": "MCP tool removed from agent successfully"}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error removing MCP tool from agent: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/agent/{agent_id}", response_model=AgentMCPToolsResponse)
async def get_agent_mcp_tools(
    agent_id: UUID,
    current_user: User = Depends(require_permissions("view_all", "manage_agents")),
    db: Session = Depends(get_db)
):
    """Get all MCP tools associated with an agent"""
    try:
        mcp_tool_repo = MCPToolRepository(db)
        agent_repo = AgentRepository(db)
        
        # Verify agent exists and belongs to user's organization
        agent = agent_repo.get_agent(agent_id)
        if not agent:
            raise HTTPException(
                status_code=404,
                detail="Agent not found"
            )
        
        if agent.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to access this agent"
            )
        
        # Get agent's MCP tools
        mcp_tools = mcp_tool_repo.get_agent_mcp_tools(agent_id)
        
        return AgentMCPToolsResponse(
            id=agent.id,
            name=agent.name,
            mcp_tools=mcp_tools
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error fetching agent MCP tools: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 
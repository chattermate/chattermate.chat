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

from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.models.mcp_tool import MCPTool, MCPToolToAgent, MCPTransportType
from uuid import UUID
from app.core.logger import get_logger

logger = get_logger(__name__)


class MCPToolRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_mcp_tool(self, **kwargs) -> MCPTool:
        """Create a new MCP tool"""
        # Handle org_id to organization_id conversion for backward compatibility
        if 'org_id' in kwargs:
            kwargs['organization_id'] = kwargs.pop('org_id')

        # Create new MCP tool
        mcp_tool = MCPTool(**kwargs)
        self.db.add(mcp_tool)
        self.db.commit()
        self.db.refresh(mcp_tool)
        return mcp_tool

    def get_by_name(self, name: str, organization_id: UUID) -> Optional[MCPTool]:
        """Get MCP tool by name within an organization"""
        return self.db.query(MCPTool).filter(
            MCPTool.name == name,
            MCPTool.organization_id == organization_id
        ).first()

    def get_mcp_tool(self, mcp_tool_id: int) -> Optional[MCPTool]:
        """Get MCP tool by ID"""
        return self.db.query(MCPTool).filter(
            MCPTool.id == mcp_tool_id
        ).first()

    def get_by_ids(self, org_id: UUID, tool_ids: List[int], enabled_only: bool = True) -> List[MCPTool]:
        """Get specific MCP tools by id, scoped to the organization — ids
        from another org are silently dropped."""
        if not tool_ids:
            return []
        query = self.db.query(MCPTool).filter(
            MCPTool.organization_id == org_id,
            MCPTool.id.in_(tool_ids),
        )
        if enabled_only:
            query = query.filter(MCPTool.enabled == True)
        return query.all()

    def get_org_mcp_tools(self, org_id: UUID, enabled_only: bool = True) -> List[MCPTool]:
        """Get all MCP tools for an organization"""
        query = self.db.query(MCPTool).filter(
            MCPTool.organization_id == org_id
        )
        if enabled_only:
            query = query.filter(MCPTool.enabled == True)
        return query.all()

    def update_mcp_tool(self, mcp_tool_id: int, **kwargs) -> Optional[MCPTool]:
        """Update an existing MCP tool"""
        mcp_tool = self.get_mcp_tool(mcp_tool_id)
        if not mcp_tool:
            return None

        for key, value in kwargs.items():
            setattr(mcp_tool, key, value)

        self.db.commit()
        self.db.refresh(mcp_tool)
        return mcp_tool

    def delete_mcp_tool(self, mcp_tool_id: int) -> bool:
        """Delete an MCP tool"""
        mcp_tool = self.get_mcp_tool(mcp_tool_id)
        if not mcp_tool:
            return False

        self.db.delete(mcp_tool)
        self.db.commit()
        return True

    def get_enabled_mcp_tools(self, org_id: UUID) -> List[MCPTool]:
        """Get enabled MCP tools for an organization"""
        return self.db.query(MCPTool)\
            .filter(MCPTool.organization_id == org_id)\
            .filter(MCPTool.enabled == True)\
            .all()

    def get_all_mcp_tools(self, org_id: UUID) -> List[MCPTool]:
        """Get all MCP tools for organization"""
        return self.db.query(MCPTool)\
            .filter(MCPTool.organization_id == org_id)\
            .all()

    # Agent-MCPTool association methods
    def add_mcp_tool_to_agent(self, mcp_tool_id: int, agent_id: UUID) -> Optional[MCPToolToAgent]:
        """Add MCP tool to agent"""
        # Check if association already exists
        existing = self.db.query(MCPToolToAgent).filter(
            MCPToolToAgent.mcp_tool_id == mcp_tool_id,
            MCPToolToAgent.agent_id == agent_id
        ).first()
        
        if existing:
            return existing

        # Create new association
        association = MCPToolToAgent(
            mcp_tool_id=mcp_tool_id,
            agent_id=agent_id
        )
        self.db.add(association)
        self.db.commit()
        self.db.refresh(association)
        return association

    def remove_mcp_tool_from_agent(self, mcp_tool_id: int, agent_id: UUID) -> bool:
        """Remove MCP tool from agent"""
        association = self.db.query(MCPToolToAgent).filter(
            MCPToolToAgent.mcp_tool_id == mcp_tool_id,
            MCPToolToAgent.agent_id == agent_id
        ).first()
        
        if not association:
            return False

        self.db.delete(association)
        self.db.commit()
        return True

    def get_agent_mcp_tools(self, agent_id: UUID) -> List[MCPTool]:
        """Get all MCP tools associated with an agent"""
        return self.db.query(MCPTool)\
            .join(MCPToolToAgent)\
            .filter(MCPToolToAgent.agent_id == agent_id)\
            .filter(MCPTool.enabled == True)\
            .all()

    def get_mcp_tool_agents(self, mcp_tool_id: int) -> List[UUID]:
        """Get all agent IDs associated with an MCP tool"""
        associations = self.db.query(MCPToolToAgent).filter(
            MCPToolToAgent.mcp_tool_id == mcp_tool_id
        ).all()
        return [assoc.agent_id for assoc in associations]

    def get_mcp_tool_with_agents(self, mcp_tool_id: int) -> Optional[MCPTool]:
        """Get MCP tool with associated agents loaded"""
        return self.db.query(MCPTool)\
            .options(joinedload(MCPTool.agent_links))\
            .filter(MCPTool.id == mcp_tool_id)\
            .first() 
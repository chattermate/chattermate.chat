"""
ChatterMate -   Init  
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
"""

from app.database import Base
from .organization import Organization
from .user import User
from .customer import Customer
from .role import Role
from .permission import Permission
from .ai_config import AIConfig, AIModelType
from .agent import Agent
from .knowledge_to_agent import KnowledgeToAgent
from .knowledge import Knowledge
from .chat_history import ChatHistory
from .session_to_agent import SessionToAgent, SessionStatus
from .rating import Rating
from app.models.jira import JiraToken
from app.models.shopify import ShopifyShop
from app.models.workflow import Workflow
from app.models.workflow_node import WorkflowNode, ExitCondition
from app.models.workflow_connection import WorkflowConnection
from app.models.mcp_tool import MCPTool, MCPToolToAgent, MCPTransportType
from app.models.file_attachment import FileAttachment



# This ensures all models are imported in the correct order
__all__ = [
    "Organization",
    "User",
    "Customer",
    "Permission",
    "Role",
    "AIConfig",
    "AIModelType",
    "Agent",
    "KnowledgeToAgent",
    "Knowledge",
    "ChatHistory",
    "SessionToAgent",
    "SessionStatus",
    "Rating",
    "JiraToken",
    "ShopifyShop",
    "Workflow",
    "WorkflowNode",
    "ExitCondition",
    "WorkflowConnection",
    "MCPTool",
    "MCPToolToAgent",
    "MCPTransportType",
    "FileAttachment",
]

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

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, Enum as SQLEnum, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from sqlalchemy.dialects.postgresql import UUID, JSON

class MCPTransportType(str, enum.Enum):
    STDIO = "stdio"
    SSE = "sse"
    HTTP = "http"


class MCPTool(Base):
    __tablename__ = "mcp_tools"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # Display name for the MCP server
    description = Column(Text)  # Optional description of what this MCP server does
    transport_type = Column(SQLEnum(MCPTransportType), nullable=False)
    enabled = Column(Boolean, default=True, nullable=False)
    
    # For STDIO transport
    command = Column(String)  # e.g., "npx", "uvx", "node"
    args = Column(JSON)  # List of arguments, e.g., ["-y", "@modelcontextprotocol/server-filesystem"]
    env_vars = Column(JSON)  # Environment variables as key-value pairs
    
    # For SSE/HTTP transports
    url = Column(String)  # Server URL
    headers = Column(JSON)  # HTTP headers as key-value pairs
    timeout = Column(Integer)  # Connection timeout in seconds
    sse_read_timeout = Column(Integer)  # SSE read timeout in seconds
    terminate_on_close = Column(Boolean, default=True)  # For HTTP transport
    
    # Relationships
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="mcp_tools")
    agent_links = relationship("MCPToolToAgent", back_populates="mcp_tool", cascade="all, delete-orphan")


class MCPToolToAgent(Base):
    __tablename__ = "mcp_tool_to_agent"

    id = Column(Integer, primary_key=True, index=True)
    mcp_tool_id = Column(Integer, ForeignKey("mcp_tools.id"), nullable=False)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    mcp_tool = relationship("MCPTool", back_populates="agent_links")
    agent = relationship("Agent", back_populates="mcp_tool_links") 
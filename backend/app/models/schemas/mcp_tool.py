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

from datetime import datetime
from pydantic import BaseModel, Field, field_serializer, validator
from typing import List, Optional, Dict, Union
from enum import Enum
from uuid import UUID
from app.models.mcp_tool import MCPTransportType


class MCPTransportTypeEnum(str, Enum):
    STDIO = "stdio"
    SSE = "sse"
    HTTP = "http"


# Stand-in sent to the client in place of stored environment/header values.
# An update that sends it back means "keep what is stored", so correcting an
# unrelated field never costs a credential rotation — providers typically show
# an API key exactly once.
SECRET_MASK = "********"

# Ceiling on a connector's usage guidance. Enforced here so an over-long value
# is a clean 422, and again at injection so a row written before this existed
# can never blow the prompt.
MAX_USAGE_GUIDANCE_CHARS = 2000


def mask_secret_values(values: Optional[Dict[str, str]]) -> Optional[Dict[str, str]]:
    """Replace every value with the mask, keeping the keys so the operator can
    still see which variables are set."""
    if not values:
        return values
    return {key: SECRET_MASK for key in values}


def unmask_secret_values(
    incoming: Optional[Dict[str, str]], stored: Optional[Dict[str, str]]
) -> Optional[Dict[str, str]]:
    """Resolve an incoming secret map against what is stored: a masked value
    keeps the stored one, anything else is a deliberate replacement. A masked
    key with nothing stored behind it is dropped rather than written empty."""
    if not incoming:
        return incoming
    stored = stored or {}
    resolved = {}
    for key, value in incoming.items():
        if value != SECRET_MASK:
            resolved[key] = value
        elif key in stored:
            resolved[key] = stored[key]
    return resolved


class MCPToolBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Display name for the MCP server")
    description: Optional[str] = Field(None, description="Optional description of what this MCP server does")
    usage_guidance: Optional[str] = Field(
        None, max_length=MAX_USAGE_GUIDANCE_CHARS,
        description="What this source holds and how to query it — given to the AI as tool guidance",
    )
    transport_type: MCPTransportTypeEnum
    enabled: bool = Field(default=True, description="Whether this MCP tool is enabled")
    
    # STDIO transport fields
    command: Optional[str] = Field(None, description="Command to run the MCP server (e.g., 'npx', 'uvx', 'node')")
    args: Optional[List[str]] = Field(None, description="Arguments to pass to the MCP server")
    env_vars: Optional[Dict[str, str]] = Field(None, description="Environment variables as key-value pairs")
    
    # SSE/HTTP transport fields
    url: Optional[str] = Field(None, description="Server URL for SSE/HTTP transport")
    headers: Optional[Dict[str, str]] = Field(None, description="HTTP headers as key-value pairs")
    timeout: Optional[int] = Field(None, ge=1, le=300, description="Connection timeout in seconds (1-300)")
    sse_read_timeout: Optional[int] = Field(None, ge=1, le=600, description="SSE read timeout in seconds (1-600)")
    terminate_on_close: Optional[bool] = Field(default=True, description="Whether to terminate connection when client is closed (HTTP only)")

    @validator('command')
    def validate_stdio_command(cls, v, values):
        if values.get('transport_type') == MCPTransportTypeEnum.STDIO and not v:
            raise ValueError('Command is required for STDIO transport')
        return v

    @validator('url')
    def validate_url(cls, v, values):
        if values.get('transport_type') in [MCPTransportTypeEnum.SSE, MCPTransportTypeEnum.HTTP] and not v:
            raise ValueError('URL is required for SSE/HTTP transport')
        return v


class MCPToolCreate(MCPToolBase):
    organization_id: Optional[UUID] = None


class MCPToolUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    usage_guidance: Optional[str] = Field(
        None, max_length=MAX_USAGE_GUIDANCE_CHARS,
        description="What this source holds and how to query it — given to the AI as tool guidance",
    )
    transport_type: Optional[MCPTransportTypeEnum] = None
    enabled: Optional[bool] = None
    
    # STDIO transport fields
    command: Optional[str] = None
    args: Optional[List[str]] = None
    env_vars: Optional[Dict[str, str]] = None
    
    # SSE/HTTP transport fields
    url: Optional[str] = None
    headers: Optional[Dict[str, str]] = None
    timeout: Optional[int] = Field(None, ge=1, le=300)
    sse_read_timeout: Optional[int] = Field(None, ge=1, le=600)
    terminate_on_close: Optional[bool] = None


class MCPToolResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    # Deliberately not masked — guidance is prompt text, not a credential.
    usage_guidance: Optional[str]
    transport_type: MCPTransportTypeEnum
    enabled: bool
    
    # STDIO transport fields
    command: Optional[str]
    args: Optional[List[str]]
    env_vars: Optional[Dict[str, str]]
    
    # SSE/HTTP transport fields
    url: Optional[str]
    headers: Optional[Dict[str, str]]
    timeout: Optional[int]
    sse_read_timeout: Optional[int]
    terminate_on_close: Optional[bool]
    
    organization_id: UUID
    created_at: datetime
    updated_at: datetime

    @field_serializer("env_vars", "headers")
    def _mask_secrets(self, values: Optional[Dict[str, str]], _info):
        """Credentials never leave the server. The edit form round-trips the
        mask, and the update endpoint resolves it back to the stored value."""
        return mask_secret_values(values)

    class Config:
        from_attributes = True


class MCPToolReferencesResponse(BaseModel):
    """Where a connector is in use, so a delete confirmation can name what it
    is about to break instead of asking blind."""
    agents: List[str] = []
    used_in_investigations: bool = False


class MCPToolToAgentCreate(BaseModel):
    mcp_tool_id: int
    agent_id: UUID


class MCPToolToAgentResponse(BaseModel):
    id: int
    mcp_tool_id: int
    agent_id: UUID
    created_at: datetime
    mcp_tool: MCPToolResponse

    class Config:
        from_attributes = True


class AgentMCPToolsResponse(BaseModel):
    id: UUID
    name: str
    mcp_tools: List[MCPToolResponse] = []

    class Config:
        from_attributes = True


class MCPToolTestResponse(BaseModel):
    """Result of a one-off connection test against a configured tool."""
    success: bool
    functions: List[str] = []
    error: Optional[str] = None
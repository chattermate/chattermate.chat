"""
ChatterMate - Slack Schemas
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

from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from enum import Enum


class StorageModeEnum(str, Enum):
    """Storage mode for Slack messages."""
    FULL_CONTENT = "FULL_CONTENT"
    METADATA_ONLY = "METADATA_ONLY"
    EMBEDDINGS_ONLY = "EMBEDDINGS_ONLY"


# ==================== Connection Status ====================

class SlackConnectionStatus(BaseModel):
    """Response schema for Slack connection status."""
    connected: bool
    team_id: Optional[str] = None
    team_name: Optional[str] = None
    bot_user_id: Optional[str] = None


# ==================== Channel Schemas ====================

class SlackChannelResponse(BaseModel):
    """Schema for a Slack channel."""
    id: str
    name: str
    is_private: bool = False
    is_member: bool = False
    num_members: Optional[int] = None


# ==================== Workspace Config Schemas ====================

class SlackWorkspaceConfigBase(BaseModel):
    """Base schema for workspace configuration."""
    allowed_channel_ids: List[str] = Field(default_factory=list)
    storage_mode: StorageModeEnum = StorageModeEnum.FULL_CONTENT
    default_agent_id: Optional[UUID] = None


class SlackWorkspaceConfigCreate(SlackWorkspaceConfigBase):
    """Schema for creating workspace configuration."""
    pass


class SlackWorkspaceConfigUpdate(BaseModel):
    """Schema for updating workspace configuration."""
    allowed_channel_ids: Optional[List[str]] = None
    storage_mode: Optional[StorageModeEnum] = None
    default_agent_id: Optional[UUID] = None


class SlackWorkspaceConfigResponse(SlackWorkspaceConfigBase):
    """Response schema for workspace configuration."""
    id: int
    organization_id: UUID
    team_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Agent Slack Config Schemas ====================

class AgentSlackConfigBase(BaseModel):
    """Base schema for agent Slack configuration."""
    channel_id: str
    channel_name: str
    enabled: bool = True
    respond_to_mentions: bool = True
    respond_to_reactions: bool = True
    respond_to_commands: bool = True
    reaction_emoji: str = "robot_face"


class AgentSlackConfigCreate(AgentSlackConfigBase):
    """Schema for creating agent Slack configuration."""
    pass


class AgentSlackConfigUpdate(BaseModel):
    """Schema for updating agent Slack configuration."""
    enabled: Optional[bool] = None
    respond_to_mentions: Optional[bool] = None
    respond_to_reactions: Optional[bool] = None
    respond_to_commands: Optional[bool] = None
    reaction_emoji: Optional[str] = None


class AgentSlackConfigResponse(AgentSlackConfigBase):
    """Response schema for agent Slack configuration."""
    id: int
    organization_id: UUID
    team_id: str
    agent_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Bulk Configuration Schemas ====================

class AgentSlackConfigBulkCreate(BaseModel):
    """Schema for bulk creating/updating agent Slack configurations."""
    configs: List[AgentSlackConfigCreate]


class AgentSlackConfigBulkResponse(BaseModel):
    """Response schema for bulk agent Slack configuration."""
    agent_id: UUID
    configs: List[AgentSlackConfigResponse]


# ==================== OAuth State ====================

class SlackOAuthState(BaseModel):
    """Schema for OAuth state parameter."""
    organization_id: str
    nonce: str
    timestamp: int


# ==================== Webhook Event Schemas ====================

class SlackEventChallenge(BaseModel):
    """Schema for Slack URL verification challenge."""
    type: str
    token: str
    challenge: str


class SlackEventCallback(BaseModel):
    """Schema for Slack event callback."""
    type: str
    event: dict
    team_id: str
    api_app_id: str
    event_id: str
    event_time: int


class SlackSlashCommand(BaseModel):
    """Schema for Slack slash command."""
    command: str
    text: str
    response_url: str
    trigger_id: str
    user_id: str
    user_name: str
    channel_id: str
    channel_name: str
    team_id: str
    team_domain: str


class SlackInteractionPayload(BaseModel):
    """Schema for Slack interaction payload."""
    type: str
    callback_id: Optional[str] = None
    trigger_id: str
    user: dict
    channel: dict
    team: dict
    message: Optional[dict] = None
    response_url: str


# ==================== Data Deletion Schemas ====================

class SlackDataDeletionRequest(BaseModel):
    """Schema for Slack data deletion request."""
    team_id: str
    user_id: Optional[str] = None  # If None, delete all workspace data


class SlackDataDeletionResponse(BaseModel):
    """Response schema for data deletion."""
    ok: bool
    deleted_records: Optional[dict] = None
    message: Optional[str] = None

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
from pydantic import BaseModel, Field, field_validator
from typing import Annotated, List, Optional, Dict
from enum import Enum
from uuid import UUID
from app.models.agent import AgentType
from app.agents.guardrail_policy import GUARDRAIL_PROMPT_MAX
from app.services.reply_limits import MAX_PER_DAY, MAX_PER_MINUTE
from app.models.schemas.agent_customization import CustomizationResponse
from app.models.schemas.user_group import UserGroupResponse

# Per customer, counting only messages the AI answers; None = no limit.
PerMinuteLimit = Annotated[Optional[int], Field(ge=1, le=MAX_PER_MINUTE)]
PerDayLimit = Annotated[Optional[int], Field(ge=1, le=MAX_PER_DAY)]

AGENT_NAME_MAX = 100
AGENT_DESCRIPTION_MAX = 500
# The agent's own Offline reply (services/agent_offline.py)
OFFLINE_MESSAGE_MAX = 500


class KnowledgeItem(BaseModel):
    id: int
    name: str
    type: str


class AgentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    agent_type: AgentType
    instructions: List[str]
    tools: Optional[List[Dict]] = None
    is_active: bool = True
    is_default: bool = False
    transfer_to_human: bool = False
    ai_replies_enabled: bool = True
    channel_quick_replies: bool = False
    ask_for_rating: bool = False
    handoff_collect_email: bool = True
    handoff_collect_name: bool = True
    enable_rate_limiting: bool = False
    overall_limit_per_ip: int = Field(default=100, description="Maximum number of requests allowed per IP address")
    requests_per_sec: float = Field(default=1.0, description="Number of requests allowed per second")
    messages_per_customer_per_minute: PerMinuteLimit = None
    replies_per_customer_per_day: PerDayLimit = None
    use_workflow: bool = False
    active_workflow_id: Optional[UUID] = None
    display_name: Optional[str] = None
    allow_attachments: bool = False
    allowed_attachment_types: Optional[List[str]] = Field(
        default=None,
        description="List of allowed attachment type categories: 'images', 'documents', 'office', 'text'. If null/empty, all types allowed."
    )
    require_token_auth: bool = False
    ticketing_enabled: bool = True
    topic_scope: Optional[str] = Field(
        default=None, max_length=500,
        description="Optional one-line business remit used by the platform guardrail's topic-scope line."
    )
    guardrail_prompt: Optional[str] = Field(
        default=None, max_length=GUARDRAIL_PROMPT_MAX,
        description="Scope rule for this agent. Null uses the platform default; edit it to fit your business."
    )
    guardrail_enabled: bool = Field(
        default=True,
        description="Apply the scope rule. Injection and disclosure protections are always on."
    )
    offline_message: Optional[str] = Field(
        default=None, max_length=OFFLINE_MESSAGE_MAX,
        description="Sent once per conversation while the agent is Offline. Null sends the default."
    )
    offline_ask_email: bool = Field(
        default=True,
        description="After the offline message, ask website visitors for an email we don't have."
    )


class AgentCreate(AgentBase):
    organization_id: Optional[UUID] = None


class AgentUpdate(BaseModel):
    # `name` is the agent's role line under its display name on cards.
    name: Optional[str] = Field(default=None, max_length=AGENT_NAME_MAX)
    display_name: Optional[str] = None
    description: Optional[str] = Field(default=None, max_length=AGENT_DESCRIPTION_MAX)
    instructions: Optional[List[str]] = None
    is_active: Optional[bool] = None
    transfer_to_human: Optional[bool] = None
    ai_replies_enabled: Optional[bool] = None
    channel_quick_replies: Optional[bool] = None
    ask_for_rating: Optional[bool] = None
    handoff_collect_email: Optional[bool] = None
    handoff_collect_name: Optional[bool] = None
    enable_rate_limiting: Optional[bool] = None
    overall_limit_per_ip: Optional[int] = None
    requests_per_sec: Optional[float] = None
    messages_per_customer_per_minute: PerMinuteLimit = None
    replies_per_customer_per_day: PerDayLimit = None
    use_workflow: Optional[bool] = None
    active_workflow_id: Optional[UUID] = None
    allow_attachments: Optional[bool] = None
    allowed_attachment_types: Optional[List[str]] = Field(
        default=None,
        description="List of allowed attachment type categories: 'images', 'documents', 'office', 'text'. If null/empty, all types allowed."
    )
    require_token_auth: Optional[bool] = None
    ticketing_enabled: Optional[bool] = None
    topic_scope: Optional[str] = Field(default=None, max_length=500)
    guardrail_prompt: Optional[str] = Field(default=None, max_length=GUARDRAIL_PROMPT_MAX)
    guardrail_enabled: Optional[bool] = None
    offline_message: Optional[str] = Field(default=None, max_length=OFFLINE_MESSAGE_MAX)
    offline_ask_email: Optional[bool] = None

    @field_validator('name')
    @classmethod
    def name_not_blank(cls, value: Optional[str]) -> str:
        """The column is required, so a sent name must have text in it."""
        stripped = (value or '').strip()
        if not stripped:
            raise ValueError('Name cannot be empty')
        return stripped

    @field_validator('description')
    @classmethod
    def strip_description(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() if value is not None else None

    @field_validator('offline_message')
    @classmethod
    def blank_offline_message_is_default(cls, value: Optional[str]) -> Optional[str]:
        """An emptied box goes back to the default text."""
        stripped = (value or '').strip()
        return stripped or None


class AgentKnowledge(BaseModel):
    id: int
    name: str
    type: str


class AgentRosterItem(BaseModel):
    """An AI agent as the inbox filter needs it: a name to group chats by.

    Deliberately none of AgentResponse's configuration — `instructions`, and
    especially `guardrail_prompt`, which tells a reader how to phrase a bypass.
    """
    id: UUID
    name: str
    display_name: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True


class AgentResponse(BaseModel):
    id: UUID
    name: str
    display_name: Optional[str]
    description: Optional[str]
    agent_type: AgentType
    instructions: List[str]
    is_active: bool
    organization_id: UUID
    knowledge: List[AgentKnowledge] = []
    transfer_to_human: bool = False
    ai_replies_enabled: bool = True
    channel_quick_replies: bool = False
    ask_for_rating: bool = False
    handoff_collect_email: bool = True
    handoff_collect_name: bool = True
    enable_rate_limiting: Optional[bool] = None
    overall_limit_per_ip: Optional[int] = None
    requests_per_sec: Optional[float] = None
    messages_per_customer_per_minute: Optional[int] = None
    replies_per_customer_per_day: Optional[int] = None
    use_workflow: Optional[bool] = False
    active_workflow_id: Optional[UUID] = None
    allow_attachments: bool = False
    allowed_attachment_types: Optional[List[str]] = None
    require_token_auth: bool = False
    ticketing_enabled: bool = True
    topic_scope: Optional[str] = None
    guardrail_prompt: Optional[str] = None
    guardrail_enabled: bool = True
    offline_message: Optional[str] = None
    offline_ask_email: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AgentWithCustomizationResponse(AgentResponse):
    customization: Optional[CustomizationResponse] = None
    groups: List[UserGroupResponse] = []

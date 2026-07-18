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
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum
from uuid import UUID
from app.models.agent import AgentType
from app.models.schemas.agent_customization import CustomizationResponse
from app.models.schemas.user_group import UserGroupResponse

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
    ask_for_rating: bool = False
    handoff_collect_email: bool = True
    handoff_collect_name: bool = True
    enable_rate_limiting: bool = False
    overall_limit_per_ip: int = Field(default=100, description="Maximum number of requests allowed per IP address")
    requests_per_sec: float = Field(default=1.0, description="Number of requests allowed per second")
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


class AgentCreate(AgentBase):
    organization_id: Optional[UUID] = None


class AgentUpdate(BaseModel):
    display_name: Optional[str] = None
    instructions: Optional[List[str]] = None
    is_active: Optional[bool] = None
    transfer_to_human: Optional[bool] = None
    ask_for_rating: Optional[bool] = None
    handoff_collect_email: Optional[bool] = None
    handoff_collect_name: Optional[bool] = None
    enable_rate_limiting: Optional[bool] = None
    overall_limit_per_ip: Optional[int] = None
    requests_per_sec: Optional[float] = None
    use_workflow: Optional[bool] = None
    active_workflow_id: Optional[UUID] = None
    allow_attachments: Optional[bool] = None
    allowed_attachment_types: Optional[List[str]] = Field(
        default=None,
        description="List of allowed attachment type categories: 'images', 'documents', 'office', 'text'. If null/empty, all types allowed."
    )
    require_token_auth: Optional[bool] = None
    ticketing_enabled: Optional[bool] = None


class AgentKnowledge(BaseModel):
    id: int
    name: str
    type: str


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
    ask_for_rating: bool = False
    handoff_collect_email: bool = True
    handoff_collect_name: bool = True
    enable_rate_limiting: Optional[bool] = None
    overall_limit_per_ip: Optional[int] = None
    requests_per_sec: Optional[float] = None
    use_workflow: Optional[bool] = False
    active_workflow_id: Optional[UUID] = None
    allow_attachments: bool = False
    allowed_attachment_types: Optional[List[str]] = None
    require_token_auth: bool = False
    ticketing_enabled: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AgentWithCustomizationResponse(AgentResponse):
    customization: Optional[CustomizationResponse] = None
    groups: List[UserGroupResponse] = []

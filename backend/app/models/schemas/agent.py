"""
ChatterMate - Agent Schema
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
    enable_rate_limiting: bool = False
    overall_limit_per_ip: int = Field(default=100, description="Maximum number of requests allowed per IP address")
    requests_per_sec: float = Field(default=1.0, description="Number of requests allowed per second")
    use_workflow: bool = False
    active_workflow_id: Optional[UUID] = None
    display_name: Optional[str] = None
    allow_attachments: bool = False


class AgentCreate(AgentBase):
    organization_id: Optional[UUID] = None


class AgentUpdate(BaseModel):
    display_name: Optional[str] = None
    instructions: Optional[List[str]] = None
    is_active: Optional[bool] = None
    transfer_to_human: Optional[bool] = None
    ask_for_rating: Optional[bool] = None
    enable_rate_limiting: Optional[bool] = None
    overall_limit_per_ip: Optional[int] = None
    requests_per_sec: Optional[float] = None
    use_workflow: Optional[bool] = None
    active_workflow_id: Optional[UUID] = None
    allow_attachments: Optional[bool] = None



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
    enable_rate_limiting: Optional[bool] = None
    overall_limit_per_ip: Optional[int] = None
    requests_per_sec: Optional[float] = None
    use_workflow: Optional[bool] = False
    active_workflow_id: Optional[UUID] = None
    allow_attachments: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


    class Config:
        from_attributes = True


class AgentWithCustomizationResponse(AgentResponse):
    customization: Optional[CustomizationResponse] = None
    groups: List[UserGroupResponse] = []

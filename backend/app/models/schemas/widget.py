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

from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID


class WidgetBase(BaseModel):
    name: str

    # Optional agent ID for widget configuration
    agent_id: Optional[UUID] = None


class WidgetCreate(WidgetBase):
    pass


class AgentCustomizationResponse(BaseModel):
    chat_background_color: Optional[str] = None
    chat_text_color: Optional[str] = None
    chat_bubble_color: Optional[str] = None
    accent_color: Optional[str] = None
    font_family: Optional[str] = None
    photo_url: Optional[str] = None
    chat_style: Optional[str] = "CHATBOT"
    widget_position: Optional[str] = "FLOATING"
    welcome_title: Optional[str] = None
    welcome_subtitle: Optional[str] = None
    welcome_message: Optional[str] = None
    chat_initiation_messages: Optional[List[str]] = None
    quick_actions: Optional[List[str]] = None
    show_citations: Optional[bool] = None
    collect_email: Optional[bool] = None

    @property
    def photo_url_signed(self) -> Optional[str]:
        """Get signed URL for photo if using S3"""
        if not self.photo_url:
            return None
        
        from app.core.config import settings
        if settings.S3_FILE_STORAGE:
            from app.core.s3 import get_s3_signed_url
            import asyncio
            return asyncio.run(get_s3_signed_url(self.photo_url))
        return self.photo_url

    class Config:
        from_attributes = True
        json_schema_extra = {
            "properties": {
                "photo_url_signed": {
                    "type": "string",
                    "description": "Signed URL for agent photo if using S3"
                }
            }
        }


class AgentResponse(BaseModel):
    id: UUID
    name: str
    display_name: Optional[str] = None
    customization: Optional[AgentCustomizationResponse] = None
    workflow: bool = False


class HumanAgentResponse(BaseModel):
    human_agent_name: Optional[str] = None
    human_agent_profile_pic: Optional[str] = None

    @property
    def human_agent_profile_pic_url(self) -> Optional[str]:
        """Get signed URL for profile picture if using S3"""
        if not self.human_agent_profile_pic:
            return None
        
        from app.core.config import settings
        if settings.S3_FILE_STORAGE:
            from app.core.s3 import get_s3_signed_url
            import asyncio
            return asyncio.run(get_s3_signed_url(self.human_agent_profile_pic))
        return self.human_agent_profile_pic

    class Config:
        from_attributes = True
        json_schema_extra = {
            "properties": {
                "human_agent_profile_pic_url": {
                    "type": "string",
                    "description": "Signed URL for profile picture if using S3"
                }
            }
        }


class WidgetResponse(BaseModel):
    id: str
    organization_id: UUID
    agent: AgentResponse
    human_agent: Optional[HumanAgentResponse] = None
    # Include agent ID in response if set
    agent_id: Optional[UUID] = None
    token: Optional[str] = None
    class Config:
        from_attributes = True

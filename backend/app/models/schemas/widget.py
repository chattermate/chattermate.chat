"""
ChatterMate - Widget
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

from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class WidgetBase(BaseModel):
    name: str

    # Optional agent ID for widget configuration
    agent_id: Optional[UUID] = None


class WidgetCreate(WidgetBase):
    pass


class AgentCustomizationResponse(BaseModel):
    chat_background_color: Optional[str] = None
    chat_bubble_color: Optional[str] = None
    accent_color: Optional[str] = None
    font_family: Optional[str] = None
    photo_url: Optional[str] = None

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


class CustomerResponse(BaseModel):
    full_name: Optional[str] = None
    profile_pic: Optional[str] = None

    @property
    def profile_pic_url(self) -> Optional[str]:
        """Get signed URL for profile picture if using S3"""
        if not self.profile_pic:
            return None
        
        from app.core.config import settings
        if settings.S3_FILE_STORAGE:
            from app.core.s3 import get_s3_signed_url
            import asyncio
            return asyncio.run(get_s3_signed_url(self.profile_pic))
        return self.profile_pic

    class Config:
        from_attributes = True
        json_schema_extra = {
            "properties": {
                "profile_pic_url": {
                    "type": "string",
                    "description": "Signed URL for profile picture if using S3"
                }
            }
        }


class WidgetResponse(BaseModel):
    id: str
    organization_id: UUID
    agent: AgentResponse
    customer: Optional[CustomerResponse] = None
    # Include agent ID in response if set
    agent_id: Optional[UUID] = None
    token: Optional[str] = None
    class Config:
        from_attributes = True

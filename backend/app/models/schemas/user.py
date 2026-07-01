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

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from app.models.schemas.role import RoleResponse



class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    is_active: bool = True
    profile_pic: Optional[str] = None
    is_online: bool = False
    last_seen: Optional[datetime] = None


class UserCreate(UserBase):
    password: str
    role_id: int


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    current_password: Optional[str] = None
    role_id: Optional[int] = None
    profile_pic: Optional[str] = None
    is_online: Optional[bool] = None

class UserStatusUpdate(BaseModel):
    is_online: bool

class UserGroupResponse(BaseModel):
    name: str
    description: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    organization_id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_online: Optional[bool] = None
    last_seen: Optional[datetime] = None
    profile_pic: Optional[str] = None
    is_active: Optional[bool] = None
    groups: Optional[List[UserGroupResponse]] = None    
    role: Optional[RoleResponse] = None

    @property
    def profile_pic_url(self) -> Optional[str]:
        """Get signed URL for profile picture if using S3"""
        if not self.profile_pic:
            return None
        
        from app.core.config import settings
        if settings.S3_FILE_STORAGE:
            from app.core.s3 import get_s3_signed_url
            import asyncio
            # Run synchronously since this is a property
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




class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse

    class Config:
        from_attributes = True

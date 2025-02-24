"""
ChatterMate - User
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

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

from pydantic import BaseModel, EmailStr, field_serializer, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from app.core.s3 import sign_s3_url_stable
from app.core.security import validate_password_strength

from app.models.schemas.role import RoleResponse



class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    is_active: bool = True
    profile_pic: Optional[str] = None
    is_online: bool = False
    last_seen: Optional[datetime] = None


class ChatScopeFields(BaseModel):
    """The two chat-scope toggles on the user form.

    Both default to None, meaning "whatever the chosen role already grants".
    A client that predates these fields keeps its old behaviour; the form
    sends explicit values because it renders the role's current scope.
    """
    see_all_ai_chats: Optional[bool] = None
    see_all_org_chats: Optional[bool] = None


class UserCreate(UserBase, ChatScopeFields):
    password: str
    role_id: int

    @field_validator('password')
    @classmethod
    def _check_strength(cls, value: str) -> str:
        # The password an admin picks for a new teammate clears the same bar as
        # one set by a reset — otherwise the policy is one invite away from
        # being bypassed.
        return validate_password_strength(value)


class UserUpdate(ChatScopeFields):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    current_password: Optional[str] = None
    role_id: Optional[int] = None
    profile_pic: Optional[str] = None
    is_online: Optional[bool] = None

class TeammateResponse(BaseModel):
    """A colleague as the inbox needs them: enough to pick one and render them.

    No role, no permissions, no timestamps — an agent listing who they can hand
    a chat to has no business reading the org's permission matrix, which is
    what UserResponse would give them.
    """
    id: UUID
    full_name: Optional[str] = None
    email: EmailStr
    profile_pic: Optional[str] = None
    is_online: Optional[bool] = False

    @field_serializer('profile_pic')
    def _sign_profile_pic(self, v: Optional[str]) -> Optional[str]:
        return sign_s3_url_stable(v) if v else v

    class Config:
        from_attributes = True


class AdminPasswordReset(BaseModel):
    """An admin setting a new password for someone else in their organization.

    No current_password: the admin does not know it — that is the point of a
    reset. The policy check lives here because nobody is around to see the
    form's strength meter when the call arrives from a script.
    """
    new_password: str

    @field_validator('new_password')
    @classmethod
    def _check_strength(cls, value: str) -> str:
        return validate_password_strength(value)


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

    @field_serializer('profile_pic')
    def _sign_profile_pic(self, v: Optional[str]) -> Optional[str]:
        """Sign on the way out, every response — never stored signed. The stable
        signature lets the browser cache the picture across page loads."""
        return sign_s3_url_stable(v) if v else v

    class Config:
        from_attributes = True




class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse

    class Config:
        from_attributes = True

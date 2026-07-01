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
from typing import Optional, Dict, TypedDict
from uuid import UUID

from app.models.schemas.user import UserResponse


class BusinessHours(TypedDict):
    start: str
    end: str
    enabled: bool


class BusinessHoursDict(TypedDict):
    monday: BusinessHours
    tuesday: BusinessHours
    wednesday: BusinessHours
    thursday: BusinessHours
    friday: BusinessHours
    saturday: BusinessHours
    sunday: BusinessHours


class OrganizationBase(BaseModel):
    name: str
    domain: str
    timezone: Optional[str] = 'UTC'
    business_hours: Optional[BusinessHoursDict] = {
        'monday': {'start': '09:00', 'end': '17:00', 'enabled': True},
        'tuesday': {'start': '09:00', 'end': '17:00', 'enabled': True},
        'wednesday': {'start': '09:00', 'end': '17:00', 'enabled': True},
        'thursday': {'start': '09:00', 'end': '17:00', 'enabled': True},
        'friday': {'start': '09:00', 'end': '17:00', 'enabled': True},
        'saturday': {'start': '09:00', 'end': '17:00', 'enabled': False},
        'sunday': {'start': '09:00', 'end': '17:00', 'enabled': False}
    }
    settings: Optional[Dict] = {}


class OrganizationCreate(OrganizationBase):
    admin_email: EmailStr
    admin_name: str
    admin_password: str


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    timezone: Optional[str] = None
    business_hours: Optional[BusinessHoursDict] = None
    settings: Optional[Dict] = None


class OrganizationCreateResponse(OrganizationBase):
    id: UUID
    is_active: bool
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: Optional[str] = None
    user: UserResponse

    class Config:
        from_attributes = True


class OrganizationResponse(OrganizationBase):
    id: UUID
    is_active: bool
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: Optional[str] = None


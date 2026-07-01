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

from uuid import UUID
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PermissionResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]

    class Config:
        from_attributes = True

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_default: Optional[bool] = False

class RoleCreate(RoleBase):
    permissions: List["PermissionResponse"]

class RoleUpdate(RoleBase):
    permissions: Optional[List["PermissionResponse"]] = None

class SimpleRoleResponse(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class RoleResponse(RoleBase):
    id: int
    organization_id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    permissions: Optional[List["PermissionResponse"]] = None

    class Config:
        from_attributes = True



RoleResponse.update_forward_refs()

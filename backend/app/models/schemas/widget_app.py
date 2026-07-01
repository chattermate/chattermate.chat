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

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class WidgetAppBase(BaseModel):
    """Base schema with common fields"""
    name: str = Field(..., min_length=1, max_length=100, description="App name (e.g., 'Production Widget')")
    description: Optional[str] = Field(None, max_length=500, description="Optional description")


class WidgetAppCreate(WidgetAppBase):
    """Schema for creating a new widget app"""
    pass


class WidgetAppUpdate(BaseModel):
    """Schema for updating widget app"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class WidgetAppResponse(WidgetAppBase):
    """Schema for widget app response (without API key)"""
    id: UUID
    organization_id: UUID
    created_by: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WidgetAppWithKeyResponse(WidgetAppResponse):
    """
    Schema for newly created app (includes API key ONCE).

    IMPORTANT: Only use this for create/regenerate responses.
    Never log or persist the api_key field.
    """
    api_key: str = Field(..., description="API key - SAVE THIS! It won't be shown again.")


class WidgetAppListResponse(BaseModel):
    """Schema for list of widget apps"""
    total: int
    apps: list[WidgetAppResponse]

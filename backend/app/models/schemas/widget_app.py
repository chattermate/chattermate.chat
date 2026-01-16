"""
ChatterMate - Widget App Schemas
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

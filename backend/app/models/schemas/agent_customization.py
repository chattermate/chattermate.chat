"""
ChatterMate - Agent Customization
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
from typing import Optional, Dict
from uuid import UUID


class CustomizationBase(BaseModel):
    photo_url: Optional[str] = None
    chat_background_color: Optional[str] = "#F8F9FA"
    chat_bubble_color: Optional[str] = "#E9ECEF"
    chat_text_color: Optional[str] = "#212529"
    icon_url: Optional[str] = None
    icon_color: Optional[str] = "#6C757D"
    accent_color: Optional[str] = "#f34611"
    font_family: Optional[str] = "Inter, system-ui, sans-serif"
    custom_css: Optional[str] = None
    customization_metadata: Optional[Dict] = {}


class CustomizationCreate(CustomizationBase):
    pass


class CustomizationResponse(CustomizationBase):
    id: int
    agent_id: UUID

    class Config:
        from_attributes = True

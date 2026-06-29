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
from typing import Optional, Dict, List
from uuid import UUID
import enum


class ChatStyle(str, enum.Enum):
    CHATBOT = "CHATBOT"
    ASK_ANYTHING = "ASK_ANYTHING"
    # Premium design presets
    GLASS = "GLASS"
    TERMINAL = "TERMINAL"
    PLAYFUL = "PLAYFUL"
    CALM_MINT = "CALM_MINT"
    AURORA = "AURORA"


class WidgetPosition(str, enum.Enum):
    FLOATING = "FLOATING"
    FIXED = "FIXED"


# Predefined chat initiation messages
DEFAULT_CHAT_INITIATIONS = [
    "👋 Hi! Need help? Ask me anything!",
    "💬 Have a question? I'm here to help!",
    "🤝 Welcome! How can I assist you today?",
    "✨ Got questions? Let's chat!",
    "👨‍💼 Need support? Click to chat with us!"
]


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
    chat_style: Optional[ChatStyle] = ChatStyle.CHATBOT
    widget_position: Optional[WidgetPosition] = WidgetPosition.FLOATING
    welcome_title: Optional[str] = None
    welcome_subtitle: Optional[str] = None
    chat_initiation_messages: Optional[List[str]] = None
    show_citations: Optional[bool] = True
    collect_email: Optional[bool] = False


class CustomizationCreate(CustomizationBase):
    pass


class CustomizationResponse(CustomizationBase):
    id: int
    agent_id: UUID

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

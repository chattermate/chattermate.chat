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
from typing import Optional, Dict, List
from typing_extensions import Annotated
from uuid import UUID
import enum

# Cap launcher/welcome copy so it can't balloon the widget (the launcher nudge is
# also clamped to 4 lines client-side). Limits match the frontend input maxlengths
# so the UI never lets a user type something the API would reject.
InitiationMessage = Annotated[str, Field(max_length=100)]


class ChatStyle(str, enum.Enum):
    CHATBOT = "CHATBOT"
    ASK_ANYTHING = "ASK_ANYTHING"
    # Premium design presets
    GLASS = "GLASS"
    TERMINAL = "TERMINAL"
    PLAYFUL = "PLAYFUL"
    CALM_MINT = "CALM_MINT"
    AURORA = "AURORA"
    SUNRISE = "SUNRISE"


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

# Predefined quick-action buttons (clicking sends the label as a message)
DEFAULT_QUICK_ACTIONS = [
    "Track my order",
    "Start a return",
    "Talk to a human"
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
    # NOTE: length caps live on CustomizationCreate (input), NOT here — the response
    # model also inherits this base, and existing rows may exceed a newly-lowered cap;
    # enforcing on the response would 500 the whole agent list.
    welcome_title: Optional[str] = None
    welcome_subtitle: Optional[str] = None
    welcome_message: Optional[str] = None
    chat_initiation_messages: Optional[List[str]] = None
    quick_actions: Optional[List[str]] = None
    show_citations: Optional[bool] = False
    collect_email: Optional[bool] = False


class CustomizationCreate(CustomizationBase):
    # Enforce length caps on write only, so the UI can't submit values the widget
    # can't display. Reads (CustomizationResponse) intentionally stay unconstrained.
    welcome_title: Optional[str] = Field(default=None, max_length=100)
    welcome_subtitle: Optional[str] = Field(default=None, max_length=250)
    welcome_message: Optional[str] = Field(default=None, max_length=500)
    chat_initiation_messages: Optional[List[InitiationMessage]] = None


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

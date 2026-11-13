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

from pydantic import BaseModel, Field, StringConstraints, field_serializer, field_validator
from typing import Annotated, List, Optional
from uuid import UUID

from app.core.s3 import sign_s3_url


class WidgetBase(BaseModel):
    name: str

    # Optional agent ID for widget configuration
    agent_id: Optional[UUID] = None


class WidgetCreate(WidgetBase):
    pass


class AgentCustomizationResponse(BaseModel):
    chat_background_color: Optional[str] = None
    chat_text_color: Optional[str] = None
    chat_bubble_color: Optional[str] = None
    accent_color: Optional[str] = None
    font_family: Optional[str] = None
    photo_url: Optional[str] = None
    chat_style: Optional[str] = "CHATBOT"
    widget_position: Optional[str] = "FLOATING"
    welcome_title: Optional[str] = None
    welcome_subtitle: Optional[str] = None
    welcome_message: Optional[str] = None
    chat_initiation_messages: Optional[List[str]] = None
    # Every-page quick actions as plain strings (page rules stay on the server)
    quick_actions: Optional[List[str]] = None

    @field_validator('quick_actions', mode='before')
    @classmethod
    def every_page_quick_actions(cls, value):
        """Stored quick actions may be page rules; visitors get the every-page labels."""
        from app.services.page_suggestions import every_page_labels
        return None if value is None else every_page_labels(value)
    show_citations: Optional[bool] = None
    collect_email: Optional[bool] = None
    show_ai_disclaimer: Optional[bool] = None
    allow_new_chat: Optional[bool] = None
    # Free-form extras (avatar_style, widget_display placement defaults, ...)
    customization_metadata: Optional[dict] = None
    # Already resolved for visitors: empty unless the plan covers it, and signed
    # or absolute (see services/launcher.py). Not a column, so never the raw value.
    launcher_logo_url: Optional[str] = None

    @field_serializer('photo_url')
    def _sign_photo_url(self, v: Optional[str]) -> Optional[str]:
        """Sign on the way out, every response — never stored signed."""
        return sign_s3_url(v) if v else v

    class Config:
        from_attributes = True


class AgentResponse(BaseModel):
    id: UUID
    name: str
    display_name: Optional[str] = None
    customization: Optional[AgentCustomizationResponse] = None
    workflow: bool = False


class HumanAgentResponse(BaseModel):
    human_agent_name: Optional[str] = None
    human_agent_profile_pic: Optional[str] = None

    @field_serializer('human_agent_profile_pic')
    def _sign_profile_pic(self, v: Optional[str]) -> Optional[str]:
        """Sign on the way out, every response — never stored signed."""
        return sign_s3_url(v) if v else v

    class Config:
        from_attributes = True


class WidgetResponse(BaseModel):
    id: str
    organization_id: UUID
    agent: AgentResponse
    human_agent: Optional[HumanAgentResponse] = None
    # Include agent ID in response if set
    agent_id: Optional[UUID] = None
    token: Optional[str] = None
    class Config:
        from_attributes = True


class WidgetEmbedSettings(BaseModel):
    """Where a widget may be embedded. Org-only: never part of the public
    WidgetResponse, which any visitor's widget can read. Entries are checked
    and normalised by app.services.widget_embed_policy; these bounds only keep
    an oversized request from being processed at all, well above the policy's
    own limits, so a person over those gets its plain message instead."""
    allowed_domains: List[Annotated[str, StringConstraints(max_length=2000)]] = Field(default_factory=list,
                                                                                    max_length=200)


class WidgetEmbedSettingsResponse(WidgetEmbedSettings):
    """The settings, plus the widget's frame host (WIDGET_FRAME_URL's origin), which
    the API's /frame redirects to: a strict site's frame-src needs it beside the API,
    and only the backend knows it. None when the widget is framed on the API itself."""
    frame_host: Optional[str] = None

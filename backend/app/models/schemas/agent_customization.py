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

from pydantic import BaseModel, Field, field_serializer, field_validator
from typing import Literal, Optional, Dict, List
from typing_extensions import Annotated
from uuid import UUID
import enum

from app.core.brand import BRAND_COLORS
from app.core.s3 import sign_s3_url, strip_s3_signature

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


class WidgetDisplayMode(str, enum.Enum):
    FLOATING = "floating"
    SIDEBAR_LEFT = "sidebar-left"
    SIDEBAR_RIGHT = "sidebar-right"
    SEARCH_BAR = "search-bar"


class WidgetDisplaySide(str, enum.Enum):
    LEFT = "left"
    RIGHT = "right"


class WidgetDisplayConfig(BaseModel):
    """Dashboard "Widget placement" defaults, stored in customization_metadata.

    The embed loader (chattermate.js) merges these under any options the
    installing developer set on the page. Bounds keep saved values renderable
    on any reasonable screen; the loader clamps again client-side.
    """
    mode: Optional[WidgetDisplayMode] = None
    side: Optional[WidgetDisplaySide] = None
    launcher: Optional[bool] = None
    width: Optional[int] = Field(default=None, ge=280, le=800)
    height: Optional[int] = Field(default=None, ge=400, le=900)
    sidebar_width: Optional[int] = Field(default=None, ge=320, le=640)
    search_placeholder: Optional[str] = Field(default=None, max_length=80)
    offset_bottom: Optional[int] = Field(default=None, ge=0, le=200)
    offset_side: Optional[int] = Field(default=None, ge=0, le=200)
    z_index: Optional[int] = Field(default=None, ge=1, le=2147483647)


class LauncherIcon(str, enum.Enum):
    DOTS = "dots"
    CHAT = "chat"
    HEADSET = "headset"
    HELP = "help"
    SPARKLE = "sparkle"
    LOGO = "logo"


class LauncherSize(str, enum.Enum):
    SMALL = "sm"
    MEDIUM = "md"
    LARGE = "lg"


class LauncherShape(str, enum.Enum):
    BUBBLE = "bubble"
    CIRCLE = "circle"


class LauncherAnimation(str, enum.Enum):
    NONE = "none"
    CLASSIC = "classic"
    BOUNCE = "bounce"
    SWOOSH = "swoosh"
    GLOW = "glow"


class LauncherBackground(str, enum.Enum):
    WHITE = "white"
    BRAND = "brand"
    NONE = "none"


class LauncherConfig(BaseModel):
    """Dashboard "Launcher" look, stored in customization_metadata.

    Unset keys keep today's launcher. logo_transparent is set by the logo
    upload, not by this form (see services/launcher.py).
    """
    icon: Optional[LauncherIcon] = None
    size: Optional[LauncherSize] = None
    shape: Optional[LauncherShape] = None
    animation: Optional[LauncherAnimation] = None
    background: Optional[LauncherBackground] = None
    logo_transparent: Optional[bool] = None


class WidgetUiConfig(BaseModel):
    """Which widget design the agent's visitors get: 1 is the classic widget, 2 the
    redesigned one. Absent means 1. See services/widget_ui.py."""
    version: Literal[1, 2] = 1

    @field_validator('version', mode='before')
    @classmethod
    def _whole_number_only(cls, v):
        # A Literal also accepts True (== 1) and 2.0 (== 2); only real integers count.
        if type(v) is not int:
            raise ValueError('version must be 1 or 2')
        return v


# customization_metadata keys with a fixed shape, read by the embed loader on
# customer pages. The rest of the dict stays free-form.
STRUCTURED_METADATA = {
    'widget_display': WidgetDisplayConfig,
    'launcher': LauncherConfig,
    'widget_ui': WidgetUiConfig,
}


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

    @field_validator('photo_url')
    @classmethod
    def _strip_photo_url_signature(cls, v: Optional[str]) -> Optional[str]:
        """Keep the bare S3 URL as the stored value.

        CustomizationResponse serializes photo_url signed, and the agent
        customization form POSTs the value it was given straight back, so
        without this the expiring signature would be written to the column.
        """
        return strip_s3_signature(v)
    chat_background_color: Optional[str] = "#F8F9FA"
    # The launcher colour; by default the ChatterMate mark's ink tile.
    chat_bubble_color: Optional[str] = BRAND_COLORS["ink"]
    chat_text_color: Optional[str] = "#212529"
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
    show_ai_disclaimer: Optional[bool] = True
    allow_new_chat: Optional[bool] = False


class CustomizationCreate(CustomizationBase):
    # Enforce length caps on write only, so the UI can't submit values the widget
    # can't display. Reads (CustomizationResponse) intentionally stay unconstrained.
    welcome_title: Optional[str] = Field(default=None, max_length=100)
    welcome_subtitle: Optional[str] = Field(default=None, max_length=250)
    welcome_message: Optional[str] = Field(default=None, max_length=500)
    chat_initiation_messages: Optional[List[InitiationMessage]] = None

    @field_validator('customization_metadata')
    @classmethod
    def _validate_structured_metadata(cls, v: Optional[Dict]) -> Optional[Dict]:
        """Validate and normalize the structured metadata keys on write.

        The rest of customization_metadata stays free-form (avatar_style etc.);
        these keys are consumed by the embed loader on customer pages, so bad
        values must be rejected here. Unknown keys inside them are dropped and
        unset keys aren't stored. An explicit null clears the settings.
        """
        if not v:
            return v
        for key, config in STRUCTURED_METADATA.items():
            if v.get(key) is None:
                continue
            validated = config.model_validate(v[key])
            # mode='json' turns enums into plain strings — the dict goes straight
            # into a JSON column, so it must hold JSON primitives, not enum members.
            v[key] = validated.model_dump(mode='json', exclude_none=True)
        return v


class CustomizationResponse(CustomizationBase):
    id: int
    agent_id: UUID
    # The launcher logo. Response-only: only the logo upload may set it, so a
    # posted URL can't skip the plan check or the re-encode.
    icon_url: Optional[str] = None

    @field_serializer('photo_url')
    def _sign_photo_url(self, v: Optional[str]) -> Optional[str]:
        """Sign on the way out, every response. Signing is a local HMAC (~0.05ms),
        so there is nothing to gain by caching the result in the database."""
        return sign_s3_url(v) if v else v

    @field_serializer('icon_url')
    def _sign_icon_url(self, v: Optional[str]) -> Optional[str]:
        return sign_s3_url(v) if v else v

    class Config:
        from_attributes = True

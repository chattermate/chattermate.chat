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

import enum
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import ClassVar, List, Optional

from app.models.channels import ChannelAccount, ChannelConversation


@dataclass
class InboundMessage:
    """A customer message normalized from a channel webhook payload."""
    external_account_id: str        # which connected account received it
    external_conversation_id: str   # platform conversation id (chat_id / wa_id / PSID ...)
    external_user_id: str           # platform id of the customer
    external_message_id: str        # platform message id, used for dedupe
    text: Optional[str] = None
    attachments: List[dict] = field(default_factory=list)
    profile: dict = field(default_factory=dict)   # name / phone / username when available
    timestamp: Optional[datetime] = None


@dataclass
class SendResult:
    ok: bool
    external_message_id: Optional[str] = None
    error: Optional[str] = None
    # True when the failure is a closed messaging window that an approved
    # template message could reopen (WhatsApp)
    can_template: bool = False


@dataclass
class ChannelInteraction:
    """A non-message interaction from a channel (a tapped button, a shared
    contact) — distinct from a customer text turn, so it bypasses the AI
    pipeline and is handled directly."""
    type: str                        # 'rating' | 'contact'
    external_account_id: str
    external_conversation_id: str
    external_user_id: str
    rating: Optional[int] = None     # for type == 'rating'
    phone: Optional[str] = None      # for type == 'contact'
    callback_id: Optional[str] = None  # platform id needed to acknowledge a button tap
    profile: dict = field(default_factory=dict)


class WindowStatus(str, enum.Enum):
    OK = "ok"
    # Outside the customer-service window but a template message can reopen it
    TEMPLATE_REQUIRED = "template_required"
    # Outside the window with no recovery path
    UNDELIVERABLE = "undeliverable"


class ChannelAdapter(ABC):
    """Per-channel behavior behind a uniform interface.

    Adapters are stateless singletons: every method receives the
    ChannelAccount (with credentials accessed via the account repository)
    and, where relevant, the ChannelConversation.
    """

    channel_type: ClassVar[str]

    @abstractmethod
    async def verify_webhook(self, headers: dict, raw_body: bytes, account: Optional[ChannelAccount]) -> bool:
        """Authenticate an inbound webhook request before parsing it."""

    @abstractmethod
    def parse_inbound(self, payload: dict) -> List[InboundMessage]:
        """Extract customer messages from a webhook payload.
        Non-message events (delivery receipts, edits, joins) yield []."""

    @abstractmethod
    async def send_text(self, account: ChannelAccount, conversation: ChannelConversation, text: str) -> SendResult:
        """Deliver a text reply to the customer."""

    async def send_media(self, account: ChannelAccount, conversation: ChannelConversation,
                         url: str, content_type: str) -> SendResult:
        """Deliver a media attachment. Default: unsupported."""
        return SendResult(ok=False, error=f"{self.channel_type} does not support media yet")

    def check_delivery_window(self, conversation: ChannelConversation) -> WindowStatus:
        """Whether the platform still accepts free-form outbound messages.
        Default: no window restrictions (Telegram, Slack, email...)."""
        return WindowStatus.OK

    def format_outbound(self, markdown: str) -> str:
        """Convert the agent's markdown to the channel's markup and apply
        length caps. Default: pass through unchanged."""
        return markdown

    # --- Optional interactive capabilities (default: unsupported no-ops so
    # channels without them are simply skipped) ---

    def parse_interaction(self, payload: dict) -> Optional["ChannelInteraction"]:
        """Extract a button tap / shared contact from a webhook payload, or
        None if the payload isn't such an interaction."""
        return None

    async def send_typing(self, account: ChannelAccount, conversation: ChannelConversation) -> None:
        """Show a 'typing…' indicator while the agent composes a reply."""
        return None

    async def send_rating_prompt(self, account: ChannelAccount, conversation: ChannelConversation,
                                 text: str) -> SendResult:
        """Prompt the customer to rate the conversation (e.g. star buttons)."""
        return SendResult(ok=False, error=f"{self.channel_type} does not support rating prompts")

    async def request_phone(self, account: ChannelAccount, conversation: ChannelConversation,
                            text: str) -> SendResult:
        """Ask the customer to share their phone number natively."""
        return SendResult(ok=False, error=f"{self.channel_type} does not support phone requests")

    async def acknowledge_interaction(self, account: ChannelAccount,
                                      interaction: "ChannelInteraction", text: str = None) -> None:
        """Acknowledge a button tap so the platform stops its spinner."""
        return None

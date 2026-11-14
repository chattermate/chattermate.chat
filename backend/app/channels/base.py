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

from app.channels.interactive_limits import InteractiveLimits
from app.models.channels import ChannelAccount, ChannelConversation


class InteractiveReplyType(str, enum.Enum):
    BUTTON_REPLY = "button_reply"   # tap on a reply button we sent
    LIST_REPLY = "list_reply"       # pick from a list message we sent
    TEMPLATE_BUTTON = "template_button"  # tap on an approved template's quick-reply button


@dataclass
class InteractiveReply:
    """The customer tapped a button or list row. `id` is the payload we set
    when sending; `title` is the text they saw."""
    type: InteractiveReplyType
    id: str
    title: str


@dataclass
class SharedLocation:
    latitude: float
    longitude: float
    name: Optional[str] = None
    address: Optional[str] = None


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
    interactive: Optional[InteractiveReply] = None
    location: Optional[SharedLocation] = None
    # The platform message this one replies to (WhatsApp context.id) — ties a
    # button tap back to the message that offered the button.
    reply_to_message_id: Optional[str] = None


class InteractiveKind(str, enum.Enum):
    BUTTONS = "buttons"
    LIST = "list"
    CTA_URL = "cta_url"


@dataclass
class InteractiveButton:
    id: str
    title: str
    # The choice's full text when the title had to be cut to fit (not sent)
    description: Optional[str] = None


@dataclass
class InteractiveRow:
    id: str
    title: str
    description: Optional[str] = None


@dataclass
class InteractiveSection:
    rows: List[InteractiveRow]
    title: Optional[str] = None


@dataclass
class InteractiveMessage:
    """A channel-native choice prompt: reply buttons, a list, or a link button.
    Limits are enforced by app.channels.interactive.validate_interactive."""
    kind: InteractiveKind
    body: str
    header: Optional[str] = None
    footer: Optional[str] = None
    buttons: List[InteractiveButton] = field(default_factory=list)
    list_button_label: Optional[str] = None
    sections: List[InteractiveSection] = field(default_factory=list)
    url: Optional[str] = None
    display_text: Optional[str] = None


class DeliveryState(str, enum.Enum):
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"


@dataclass
class StatusEvent:
    """A delivery receipt for a message we sent."""
    external_account_id: str
    external_message_id: str
    recipient_id: str
    status: DeliveryState
    timestamp: Optional[datetime] = None
    error: Optional[str] = None
    error_code: Optional[str] = None        # the platform's code for `error`
    pricing_category: Optional[str] = None  # e.g. marketing, utility, service
    # Per-message pricing: whether this message is charged ("regular") or
    # free ("free_customer_service", "free_entry_point"); `billable` is the
    # older flag the platform is retiring in its favour
    pricing_type: Optional[str] = None
    pricing_model: Optional[str] = None
    billable: Optional[bool] = None


@dataclass
class SendResult:
    ok: bool
    external_message_id: Optional[str] = None
    error: Optional[str] = None
    # True when the failure is a closed messaging window that an approved
    # template message could reopen (WhatsApp)
    can_template: bool = False
    # True when the platform rejected the account's credentials (expired or
    # revoked token): nothing will send until the account is reconnected
    auth_failed: bool = False


@dataclass
class ChannelInteraction:
    """A non-message interaction from a channel (a shared contact) — distinct
    from a customer text turn, so it bypasses the AI pipeline and is handled
    directly."""
    type: str                        # 'contact'
    external_account_id: str
    external_conversation_id: str
    external_user_id: str
    phone: Optional[str] = None      # for type == 'contact'
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
    # What send_interactive can carry on this channel; None when it can't
    # send choices at all
    interactive_limits: ClassVar[Optional[InteractiveLimits]] = None
    # Whether the platform sends delivery receipts (parse_status_events) for
    # the messages we send, so their ids are worth recording
    reports_delivery_status: ClassVar[bool] = False
    # The platform's cap on one text message, when it has one
    max_text_length: ClassVar[Optional[int]] = None
    # Whether a sent message can be changed on the platform (edit_text), so
    # its id is worth recording and the inbox offers Edit
    supports_edit: ClassVar[bool] = False

    @property
    def supports_interactive(self) -> bool:
        return self.interactive_limits is not None

    def choice_limits_for(self, conversation: ChannelConversation) -> Optional[InteractiveLimits]:
        """What choices can be offered in this conversation; None where a tap
        couldn't come back to us. Default: the channel's limits."""
        return self.interactive_limits

    async def edit_text(self, account: ChannelAccount, conversation: ChannelConversation,
                        external_message_id: str, text: str) -> SendResult:
        """Change the text of a message we sent (supports_edit platforms only)."""
        return SendResult(ok=False, error=f"{self.channel_type} can't change a sent message")

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

    async def send_interactive(self, account: ChannelAccount, conversation: ChannelConversation,
                               message: InteractiveMessage) -> SendResult:
        """Deliver buttons / a list / a link button. Default: unsupported —
        callers check supports_interactive and fall back to text."""
        return SendResult(ok=False, error=f"{self.channel_type} does not support interactive messages")

    def parse_status_events(self, payload: dict) -> List[StatusEvent]:
        """Extract delivery receipts (sent/delivered/read/failed) from a
        webhook payload. Default: the channel reports none."""
        return []

    def check_delivery_window(self, conversation: ChannelConversation) -> WindowStatus:
        """Whether the platform still accepts free-form outbound messages.
        Default: no window restrictions (Telegram, Slack, email...)."""
        return WindowStatus.OK

    def format_outbound(self, markdown: str) -> str:
        """Convert the agent's markdown to the channel's markup and apply
        length caps. Default: pass through unchanged."""
        return markdown

    def conversation_state(self, inbound: InboundMessage) -> dict:
        """Channel-specific state to merge into the conversation's extra JSON
        on each inbound message (e.g. email subject + Message-ID for reply
        threading). Default: nothing."""
        return {}

    # --- Optional interactive capabilities (default: unsupported no-ops so
    # channels without them are simply skipped) ---

    def parse_interaction(self, payload: dict) -> Optional["ChannelInteraction"]:
        """Extract a button tap / shared contact from a webhook payload, or
        None if the payload isn't such an interaction."""
        return None

    async def send_typing(self, account: ChannelAccount, conversation: ChannelConversation) -> None:
        """Show a 'typing…' indicator while the agent composes a reply."""
        return None

    async def mark_read(self, account: ChannelAccount, external_message_id: str) -> None:
        """Mark a customer's message read without a typing indicator — for a
        message something other than the AI answers."""
        return None

    async def fetch_profile(self, account: ChannelAccount, external_user_id: str) -> dict:
        """Look up the customer's real name/email from the platform API when the
        webhook payload doesn't include it. Returns {} by default."""
        return {}

    async def request_phone(self, account: ChannelAccount, conversation: ChannelConversation,
                            text: str) -> SendResult:
        """Ask the customer to share their phone number natively."""
        return SendResult(ok=False, error=f"{self.channel_type} does not support phone requests")

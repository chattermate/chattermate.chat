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

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.channels.constants import DEFAULT_TEMPLATE_LANGUAGE


class ChannelAccountOut(BaseModel):
    """Connected channel account as exposed to the settings UI (no secrets)."""
    id: UUID
    channel_type: str
    external_account_id: str
    display_name: Optional[str] = None
    is_active: bool
    agent_id: Optional[UUID] = None   # agent currently routed to this account
    created_at: Optional[datetime] = None
    # For channels the customer must point at us (email inbound-parse, SMS):
    # the exact webhook URL to configure on their provider.
    webhook_url: Optional[str] = None

    class Config:
        from_attributes = True


class TelegramConnectRequest(BaseModel):
    bot_token: str


class WhatsAppConnectRequest(BaseModel):
    """Manual WhatsApp Cloud API credentials (self-hosters with their own Meta app)."""
    phone_number_id: str
    access_token: str
    waba_id: Optional[str] = None
    display_name: Optional[str] = None


class MessengerConnectRequest(BaseModel):
    page_id: str
    page_access_token: str
    display_name: Optional[str] = None


class InstagramConnectRequest(BaseModel):
    ig_id: str
    page_access_token: str
    display_name: Optional[str] = None


class TemplateSendRequest(BaseModel):
    """Reopen an expired WhatsApp window with an approved template."""
    session_id: UUID
    template_name: str
    language: str = DEFAULT_TEMPLATE_LANGUAGE
    components: Optional[list] = None


class OutboundConversationRequest(BaseModel):
    """Start a WhatsApp conversation with a phone number — the customer has
    not messaged us; an approved template is the only thing Meta will deliver.

    customer_id links the conversation to a person the agent picked in People;
    without it the customer is resolved by phone or created. customer_name
    only names a newly created person (never renames an existing one)."""
    to: str
    template_name: str
    language: str = DEFAULT_TEMPLATE_LANGUAGE
    components: Optional[list] = None
    customer_id: Optional[UUID] = None
    customer_name: Optional[str] = None


class OutboundConversationOut(BaseModel):
    """The session the outbound send created (or reused): everything else —
    the inbox thread, template resend, AI takeover on reply — keys off it."""
    session_id: UUID


class EmbeddedSignupRequest(BaseModel):
    """What the Embedded Signup JS SDK hands back: a short-lived code to trade
    for the customer's business token, plus the assets it created."""
    code: str
    waba_id: str
    phone_number_id: str
    display_name: Optional[str] = None


class EmbeddedSignupConfigOut(BaseModel):
    """Tells the connect UI whether to offer Embedded Signup. Everything but
    `enabled` is None when it isn't, so nothing leaks to orgs without it."""
    enabled: bool
    config_id: Optional[str] = None
    app_id: Optional[str] = None
    graph_version: str


class TemplateOut(BaseModel):
    """A message template as it exists on the customer's WhatsApp Business
    Account. Only APPROVED templates can actually be sent."""
    id: Optional[str] = None
    name: str
    status: Optional[str] = None
    category: Optional[str] = None
    language: Optional[str] = None
    components: Optional[list] = None


class TemplateLibraryOut(BaseModel):
    """A deep link into Meta's Template Library for one WhatsApp Business
    Account — which is where templates get written. We list and send them; Meta
    authors them."""
    url: str


class AgentChannelConfigRequest(BaseModel):
    agent_id: UUID
    is_active: bool = True


class EmailConnectRequest(BaseModel):
    inbound_address: str      # e.g. support@acme.com (the address customers write to)
    display_name: Optional[str] = None
    # Optional per-inbox outbound SMTP. When omitted, replies use the platform
    # SMTP settings. Provide these to send from the inbox's own domain with
    # correct SPF/DKIM alignment.
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    from_email: Optional[str] = None   # defaults to inbound_address
    smtp_use_ssl: Optional[bool] = None  # None = auto (port 465 → implicit TLS)


class SmsConnectRequest(BaseModel):
    provider: str                      # 'twilio' | 'vonage' | 'messagebird' | ...
    phone_number: str                  # sender number / id
    credentials: dict = {}             # provider-specific secrets


class SmsProviderInfo(BaseModel):
    name: str
    label: str
    fields: list                       # [{key,label,secret,optional}] for the UI


class LineConnectRequest(BaseModel):
    channel_secret: str
    channel_access_token: str

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
    language: str = "en_US"
    components: Optional[list] = None


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


class TwilioConnectRequest(BaseModel):
    account_sid: str
    auth_token: str
    phone_number: str         # E.164, e.g. +15551234567


class LineConnectRequest(BaseModel):
    channel_secret: str
    channel_access_token: str

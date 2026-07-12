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
import uuid

from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class ChannelType(str, enum.Enum):
    """Messaging channels a customer conversation can arrive from.

    Stored as plain strings (not a DB enum) so adding a channel never
    requires a schema migration. 'web' is the embedded widget and has no
    ChannelAccount row.
    """
    WEB = "web"
    TELEGRAM = "telegram"
    WHATSAPP = "whatsapp"
    MESSENGER = "messenger"
    INSTAGRAM = "instagram"
    SLACK = "slack"
    EMAIL = "email"
    SMS = "sms"
    LINE = "line"
    TEAMS = "teams"
    API = "api"


class ChannelAccount(Base):
    """An organization's connected account on an external messaging channel.

    One row per connected bot/number/page. Channel-specific secrets
    (bot tokens, page access tokens, WABA ids, ...) live together in
    `encrypted_credentials` as a Fernet-encrypted JSON blob so new channels
    never need schema changes.
    """
    __tablename__ = "channel_accounts"

    __table_args__ = (
        UniqueConstraint('channel_type', 'external_account_id', name='uq_channel_account_external'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    channel_type = Column(String, nullable=False, index=True)
    # Platform-side identifier: Telegram bot id, WhatsApp phone_number_id,
    # Facebook page id, Slack team id, inbound email address, ...
    external_account_id = Column(String, nullable=False)
    # Human-readable label shown in settings: "@acme_bot", "Acme (+44...)"
    display_name = Column(String, nullable=True)
    # Fernet-encrypted JSON of channel-specific secrets
    encrypted_credentials = Column(Text, nullable=False)
    # Per-account secret used to authenticate inbound webhooks
    webhook_secret = Column(String, nullable=False)
    # Non-secret channel settings (greeting, template defaults, storage mode, ...)
    settings = Column(JSON, default=dict)
    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    organization = relationship("Organization")

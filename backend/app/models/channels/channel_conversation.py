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

import uuid

from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class ChannelConversation(Base):
    """Maps an external channel conversation to a ChatterMate session.

    The generic analog of SlackConversation: one row per
    (connected account, platform conversation, session). A new session for
    the same platform conversation (e.g. after the previous one closes)
    gets a new row.
    """
    __tablename__ = "channel_conversations"

    __table_args__ = (
        UniqueConstraint(
            'channel_account_id', 'external_conversation_id', 'session_id',
            name='uq_channel_conversation_session'
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    channel_account_id = Column(
        UUID(as_uuid=True),
        ForeignKey("channel_accounts.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    channel_type = Column(String, nullable=False)
    # Platform conversation id: Telegram chat_id, WhatsApp wa_id,
    # Messenger PSID, Instagram IGSID, Slack thread key, email thread id, ...
    external_conversation_id = Column(String, nullable=False, index=True)
    # Platform user id of the customer (often equals the conversation id)
    external_user_id = Column(String, nullable=False)

    session_id = Column(
        UUID(as_uuid=True),
        ForeignKey("session_to_agents.session_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Denormalized for faster webhook-path lookups
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False
    )
    agent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="SET NULL"),
        nullable=True
    )
    customer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="SET NULL"),
        nullable=True
    )

    # Timestamp of the customer's latest inbound message; drives the
    # 24h (Meta) delivery-window checks.
    last_inbound_at = Column(DateTime(timezone=True), nullable=True)
    # Channel-specific extras (message thread ids, profile snapshots, ...)
    extra = Column(JSON, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    account = relationship("ChannelAccount")
    session = relationship("SessionToAgent")

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

A contact who asked a business number to stop messaging them (STOP). The
one record every business-initiated send checks: order updates, alerts,
the inbox's templates and app integrations alike.
"""

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database import Base


class OptOutSource:
    STOP_WORD = "stop_word"
    BUTTON = "button"
    INBOX = "inbox"
    APP = "app"


class ChannelOptOut(Base):
    __tablename__ = "channel_opt_outs"
    __table_args__ = (
        UniqueConstraint("channel_account_id", "contact", name="uq_channel_opt_out_contact"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"),
                             nullable=False, index=True)
    # The business number they told: opting out of one store's number leaves
    # the organization's other numbers alone
    channel_account_id = Column(UUID(as_uuid=True), ForeignKey("channel_accounts.id", ondelete="CASCADE"),
                                nullable=False)
    # WhatsApp: the number in E.164
    contact = Column(String(64), nullable=False)
    source = Column(String(16), nullable=False)
    opted_out_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

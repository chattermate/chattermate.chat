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

from sqlalchemy import Column, DateTime, ForeignKey, Integer, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.encryption import EncryptedText
from app.database import Base


class ConversationNote(Base):
    """A note the team leaves on a conversation. Only the team sees it.

    Its own table, not a chat_history row, on purpose: every path that reads a
    conversation for the customer or the model (the widget's history, channel
    adapters, the AI's context, transcripts, sentiment, analytics) reads
    chat_history, so a note here cannot reach any of them by mistake.
    """
    __tablename__ = 'conversation_notes'

    id = Column(Integer, primary_key=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey('session_to_agents.session_id', ondelete='CASCADE'),
                        nullable=False, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    # Who wrote it; kept when they leave, so the note keeps its text
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    # Internal, but it is about a customer: encrypted at rest like the messages
    body = Column(EncryptedText, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    mentions = relationship('ConversationNoteMention', cascade='all, delete-orphan', lazy='selectin')


class ConversationNoteMention(Base):
    """A teammate a note @-mentions: notified once, and listed in their Mentions view."""
    __tablename__ = 'conversation_note_mentions'
    __table_args__ = (PrimaryKeyConstraint('note_id', 'user_id'),)

    note_id = Column(Integer, ForeignKey('conversation_notes.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)

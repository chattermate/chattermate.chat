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

from datetime import datetime, timezone
from typing import Iterable, List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.channels import ChannelConversation
from app.models.session_to_agent import SessionToAgent, SessionStatus
from app.core.logger import get_logger
from app.utils.phone import to_wa_id, whatsapp_equivalents

WHATSAPP = "whatsapp"

logger = get_logger(__name__)


def external_ids(channel_type: str, external_conversation_id: str) -> List[str]:
    """The ids one platform conversation may be stored under. A WhatsApp
    thread started from an order's number (+52...) gets its reply from the
    wa_id (521...), so each form of the number counts; elsewhere the id is
    the id."""
    if channel_type != WHATSAPP:
        return [external_conversation_id]
    return [to_wa_id(p) for p in whatsapp_equivalents(external_conversation_id)] or [external_conversation_id]


class ChannelConversationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_active(self, channel_account_id: UUID, external_conversation_id: str) -> Optional[ChannelConversation]:
        """Latest conversation row for a platform conversation whose session
        is still open/transferred. Returns None when a new session is needed."""
        return self.get_active_any(channel_account_id, (external_conversation_id,))

    def get_active_any(self, channel_account_id: UUID,
                       external_conversation_ids: Iterable[str]) -> Optional[ChannelConversation]:
        """get_active for a platform conversation known under several ids
        (a WhatsApp number's written and wa_id forms)."""
        wanted = [i for i in dict.fromkeys(external_conversation_ids) if i]
        if not wanted:
            return None
        try:
            return (
                self.db.query(ChannelConversation)
                .join(SessionToAgent, ChannelConversation.session_id == SessionToAgent.session_id)
                .filter(
                    ChannelConversation.channel_account_id == channel_account_id,
                    ChannelConversation.external_conversation_id.in_(wanted),
                    SessionToAgent.status != SessionStatus.CLOSED,
                )
                .order_by(ChannelConversation.created_at.desc())
                .first()
            )
        except Exception as e:
            logger.error(f"Error getting active channel conversation: {str(e)}")
            return None

    def get_by_session(self, session_id: UUID) -> Optional[ChannelConversation]:
        """Conversation row for a session — the outbound dispatcher's lookup."""
        try:
            if isinstance(session_id, str):
                session_id = UUID(session_id)
            return (
                self.db.query(ChannelConversation)
                .filter(ChannelConversation.session_id == session_id)
                .order_by(ChannelConversation.created_at.desc())
                .first()
            )
        except Exception as e:
            logger.error(f"Error getting channel conversation by session: {str(e)}")
            return None

    def get_latest(self, channel_account_id: UUID, external_conversation_id) -> Optional[ChannelConversation]:
        """Most recent conversation row regardless of session status — used for
        interactions (rating taps, feedback) that arrive after the chat closed.
        Takes one id or several (external_ids: a WhatsApp number's forms)."""
        wanted = [external_conversation_id] if isinstance(external_conversation_id, str) \
            else [i for i in dict.fromkeys(external_conversation_id) if i]
        if not wanted:
            return None
        try:
            return (
                self.db.query(ChannelConversation)
                .filter(
                    ChannelConversation.channel_account_id == channel_account_id,
                    ChannelConversation.external_conversation_id.in_(wanted),
                )
                .order_by(ChannelConversation.created_at.desc())
                .first()
            )
        except Exception as e:
            logger.error(f"Error getting latest channel conversation: {str(e)}")
            return None

    def merge_extra(self, conversation: ChannelConversation, updates: dict,
                    remove: Iterable[str] = ()) -> Optional[dict]:
        """Set and drop keys in the conversation's extra JSON (per-conversation
        state such as email threading headers). Re-reads the row under a lock
        first, so an inbound and a send updating different keys at once can't
        overwrite each other's. Returns the extra as it was just before this
        update (None on failure) — what a caller checks to claim a flag."""
        try:
            # Anything pending on the instance would be discarded by the re-read
            self.db.flush()
            current = (
                self.db.query(ChannelConversation)
                .filter(ChannelConversation.id == conversation.id)
                .with_for_update()
                .populate_existing()
                .one()
            )
            previous = dict(current.extra or {})
            extra = {**previous, **updates}
            for key in remove:
                extra.pop(key, None)
            current.extra = extra
            self.db.commit()
            return previous
        except Exception as e:
            logger.error(f"Error updating conversation extra: {str(e)}")
            self.db.rollback()
            return None

    # Sentinel: "created in response to an inbound message" (the default).
    # None is a meaningful value — an outbound-started conversation has no
    # inbound yet, so no 24h delivery window is open — so it can't be the default.
    _INBOUND_NOW = object()

    def create(
        self,
        channel_account_id: UUID,
        channel_type: str,
        external_conversation_id: str,
        external_user_id: str,
        session_id: UUID,
        organization_id: UUID,
        agent_id: Optional[UUID] = None,
        customer_id: Optional[UUID] = None,
        extra: Optional[dict] = None,
        last_inbound_at: Optional[datetime] = _INBOUND_NOW,
    ) -> ChannelConversation:
        try:
            if last_inbound_at is self._INBOUND_NOW:
                last_inbound_at = datetime.now(timezone.utc)
            conversation = ChannelConversation(
                channel_account_id=channel_account_id,
                channel_type=channel_type,
                external_conversation_id=external_conversation_id,
                external_user_id=external_user_id,
                session_id=session_id,
                organization_id=organization_id,
                agent_id=agent_id,
                customer_id=customer_id,
                last_inbound_at=last_inbound_at,
                extra=extra or {},
            )
            self.db.add(conversation)
            self.db.commit()
            self.db.refresh(conversation)
            return conversation
        except Exception as e:
            logger.error(f"Error creating channel conversation: {str(e)}")
            self.db.rollback()
            raise

    def touch_inbound(self, conversation: ChannelConversation) -> None:
        """Record a fresh customer message; drives delivery-window checks."""
        try:
            conversation.last_inbound_at = datetime.now(timezone.utc)
            self.db.commit()
        except Exception as e:
            logger.error(f"Error updating conversation inbound timestamp: {str(e)}")
            self.db.rollback()

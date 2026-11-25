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
from typing import Optional

from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.models.session_to_agent import SessionStatus
from app.repositories.channels import ChannelConversationRepository
from app.repositories.user import UserRepository
from app.services.notifications import ChatNotificationEvent, notify_chat_event

logger = get_logger(__name__)

# A brand-new chat belongs to nobody, so recipients are whoever could actually
# open it from the inbox. Anything narrower (e.g. the agent's groups) misses
# new chats, which usually have no group at all.
UNASSIGNED_CHAT_VIEWERS = (
    "view_all_chats",
    "manage_all_chats",
    "view_unassigned_chats",
    "super_admin",
)

CHANNEL_LABELS = {
    "web": "the web widget",
    "whatsapp": "WhatsApp",
    "telegram": "Telegram",
    "messenger": "Messenger",
    "instagram": "Instagram",
    "email": "email",
}


async def notify_new_chat(db: Session, session) -> None:
    """Tell the team a customer started a new conversation.

    Never raises — chat creation must not fail because a push did.
    """
    try:
        if session is None or not session.organization_id:
            return

        users = UserRepository(db).get_users_with_any_permission(
            session.organization_id, UNASSIGNED_CHAT_VIEWERS
        )
        if not users:
            return

        channel = CHANNEL_LABELS.get(session.channel, session.channel or "chat")
        await notify_chat_event(
            db=db,
            user_ids=[user.id for user in users],
            event=ChatNotificationEvent.NEW_CHAT,
            title="New chat",
            message=f"A new conversation started on {channel}.",
            metadata={"session_id": str(session.session_id)},
        )
    except Exception as e:
        logger.error(f"Error notifying new chat: {e}")


# channel_conversations.extra flag. A thread is created with it False and it
# turns True once the team has been told. A thread with no flag at all predates
# it and was announced when it was created, so it is never announced again.
TEAM_NOTIFIED = "team_notified"


def team_not_yet_notified() -> dict:
    """The extra a new channel thread starts with."""
    return {TEAM_NOTIFIED: False}


async def notify_new_channel_chat_once(db: Session, session, conversation) -> bool:
    """notify_new_chat for a channel thread, at most once. A thread can start
    without needing the team — an external app answered it, or the business
    sent the first message — so the moment to tell them is the first time it
    actually reaches the AI or the inbox, not when it was created.

    The flag is claimed under the conversation's row lock, so two first
    messages processed at once page the team once. A thread a human already
    holds is marked without paging anyone. Returns whether the team was
    paged."""
    if conversation is None or (conversation.extra or {}).get(TEAM_NOTIFIED) is not False:
        return False
    previous = ChannelConversationRepository(db).merge_extra(conversation, {TEAM_NOTIFIED: True})
    if (previous or {}).get(TEAM_NOTIFIED) is not False:
        return False  # another process claimed it first
    if getattr(session, 'user_id', None) is not None:
        return False
    await notify_new_chat(db, session)
    return True


async def notify_team_chat_waits(db: Session, session, announced: bool) -> None:
    """An open chat nobody holds, whose agent doesn't answer with AI (Offline,
    AI replies off, or no agent): it is the team's now. Stamps when it was
    handed to them, which starts its wait and keeps it out of "resolved by
    AI", and pages them once. The stamp is the "told" mark: a chat switched
    Offline mid-conversation pages on its next message, not on every one.
    `announced` is True when the same message already paged them as a new chat.

    Never raises — the customer's message must still be stored."""
    try:
        if (session is None or session.user_id is not None or session.handed_over_at is not None
                or session.status != SessionStatus.OPEN):
            return
        session.handed_over_at = datetime.now(timezone.utc)
        db.commit()
        if not announced:
            await notify_new_chat(db, session)
    except Exception as e:
        logger.error(f"Error telling the team a chat waits: {e}")


async def notify_chat_assigned(db: Session, session, user_id, assigned_by: Optional[str] = None) -> None:
    """Tell a user a colleague handed them a conversation.

    Never raises, and no-ops when someone claims a chat for themselves.
    """
    try:
        if not user_id or (assigned_by and str(assigned_by) == str(user_id)):
            return

        await notify_chat_event(
            db=db,
            user_ids=[user_id],
            event=ChatNotificationEvent.CHAT_ASSIGNED,
            title="Chat assigned to you",
            message="A conversation has been assigned to you.",
            metadata={"session_id": str(session.session_id)},
        )
    except Exception as e:
        logger.error(f"Error notifying chat assignment: {e}")

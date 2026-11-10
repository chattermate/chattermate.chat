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

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.channels.constants import MessageSource
from app.core.logger import get_logger
from app.models.session_to_agent import SessionStatus
from app.repositories.chat import ChatRepository
from app.repositories.group import GroupRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.repositories.user import UserRepository
from app.services.chat_notifications import UNASSIGNED_CHAT_VIEWERS
from app.services.message_delivery import deliver_to_customer
from app.services.notifications import ChatNotificationEvent, notify_chat_event

logger = get_logger(__name__)

# The widget shows handover state in its own UI, so only external channels need
# a message spelling out what just happened.
WEB_CHANNEL = 'web'

# Sent when a chat is queued for the team but nobody has picked it up yet. The
# widget composes an availability-aware line of its own; channels get this.
QUEUED_FOR_HUMAN_NOTICE = (
    "I'm passing this to a member of our team. Someone will reply here shortly."
)

# First reply on an agent whose AI is switched off. Deliberately says nothing
# about transferring or passing anything on — there was no AI in the
# conversation to hand it over. It exists so the visitor is not left staring at
# an empty thread wondering whether the message arrived.
HUMAN_ONLY_ACK = (
    "Thanks for your message. Someone from our team will reply here shortly."
)


async def notify_customer(
    db: Session,
    session,
    message: str,
    user_id: Optional[str] = None,
    channels_only: bool = True,
    attributes: Optional[dict] = None,
) -> None:
    """Record a message in the thread and push it to the customer.

    Best-effort: a failed notice must never fail the action that triggered it.
    Skips the widget by default, which renders handover state in its own UI —
    pass channels_only=False for a message the visitor should actually read.
    """
    if channels_only and getattr(session, 'channel', None) in (None, WEB_CHANNEL):
        return
    try:
        stored = ChatRepository(db).create_message({
            'message': message,
            'message_type': 'agent' if user_id else 'bot',
            'session_id': str(session.session_id),
            'organization_id': str(session.organization_id),
            'agent_id': str(session.agent_id) if session.agent_id else None,
            'customer_id': str(session.customer_id) if session.customer_id else None,
            'user_id': user_id,
            'attributes': {
                'channel': session.channel, 'handover_notice': True,
                'source': MessageSource.SYSTEM.value, **(attributes or {}),
            },
        })
        result = await deliver_to_customer(db, session, {
            'message': message,
            'type': 'chat_response',
        }, message_id=stored.id, source=MessageSource.SYSTEM)
        if not result.ok:
            logger.warning(
                f"Handover notice not delivered on {session.channel}: {result.reason}")
    except Exception as e:
        logger.error(f"Failed sending handover notice: {str(e)}")


def _transfer_recipients(db: Session, session, group_id) -> list:
    """Who to tell that a chat is waiting.

    A group queue notifies that group; without one the chat belongs to nobody,
    so it goes to whoever could actually open it from the inbox.
    """
    if group_id:
        group = GroupRepository(db).get_group_with_users(str(group_id))
        users = group.users if group else []
    else:
        users = UserRepository(db).get_users_with_any_permission(
            session.organization_id, UNASSIGNED_CHAT_VIEWERS
        )
    return [user.id for user in users]


async def route_session_to_human(
    db: Session,
    session,
    *,
    reason: Optional[str] = None,
    description: Optional[str] = None,
    group_id: Optional[str | UUID] = None,
    notify: bool = True,
) -> bool:
    """Take the AI out of a conversation and queue it for the team.

    `TRANSFERRED` with no assignee is the state every AI path already checks:
    the widget stops calling the model and answers with an availability line,
    and channels relay straight to the dashboard. So this needs no new status —
    it puts the session into the one the guards already understand.

    Returns False without touching anything when there is nothing to route: a
    human already holds it, it is closed, or it is queued already. That makes
    the call idempotent, so a double click cannot double-notify the team or
    send the customer the holding message twice.
    """
    if session is None:
        return False
    if session.user_id is not None:
        return False
    if session.status in (SessionStatus.CLOSED, SessionStatus.TRANSFERRED):
        return False

    updates = {
        'status': SessionStatus.TRANSFERRED,
        'transfer_reason': reason,
        'transfer_description': description,
    }
    # Only when a queue was named: passing None would clear a group the AI's
    # own transfer had already set.
    if group_id:
        updates['group_id'] = group_id

    if not SessionToAgentRepository(db).update_session(session.session_id, updates):
        return False

    if notify:
        recipients = _transfer_recipients(db, session, group_id or session.group_id)
        if recipients:
            await notify_chat_event(
                db=db,
                user_ids=recipients,
                event=ChatNotificationEvent.CHAT_TRANSFER,
                title="Chat waiting for a human",
                message=description or "A chat is waiting for someone to take it over.",
                metadata={
                    "session_id": str(session.session_id),
                    "transfer_reason": reason,
                    "transfer_description": description,
                },
            )

    await notify_customer(db, session, QUEUED_FOR_HUMAN_NOTICE)
    return True

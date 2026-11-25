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

from app.core.auth import has_any_permission
from app.core.logger import get_logger
from app.core.socketio import sio
from app.repositories.user import UserRepository
from app.services.chat_notifications import UNASSIGNED_CHAT_VIEWERS
from app.services.widget_presence import PRESENCE_EVENT, presence_room, widget_presence

logger = get_logger(__name__)

# Per-organization room every inbox page joins (see handle_join_room), for
# updates about any of the org's conversations — including AI-owned ones,
# which have no handling agent to address.
ORG_INBOX_ROOM_PREFIX = "org_inbox_"


# chat_reply `type`s the inbox appends to a conversation
USER_MESSAGE = 'user_message'
BOT_MESSAGE = 'bot'


def org_inbox_room(organization_id) -> str:
    return f"{ORG_INBOX_ROOM_PREFIX}{organization_id}"


def is_org_inbox_room(room: str) -> bool:
    return room.startswith(ORG_INBOX_ROOM_PREFIX)


def may_join_org_inbox(db: Session, socket_session: dict, room: str) -> bool:
    """Whether a dashboard socket may join an org inbox room: its own
    organization's, and only for people who can see chats nobody owns."""
    if str(socket_session.get('organization_id')) != room.removeprefix(ORG_INBOX_ROOM_PREFIX):
        return False
    user_id = socket_session.get('user_id')
    user = UserRepository(db).get_user(user_id) if user_id else None
    return (user is not None and user.is_active
            and has_any_permission(user, UNASSIGNED_CHAT_VIEWERS))


async def emit_to_session_agents(event: str, payload: dict, session_id,
                                 user_id: Optional[object] = None) -> None:
    """Push a live update to the dashboard for one conversation.

    The inbox listens on the handling agent's personal room (user_<id>); the
    session room reaches anyone who joined that conversation explicitly.
    """
    if user_id is not None:
        await sio.emit(event, payload, room=f"user_{user_id}", namespace='/agent')
    await sio.emit(event, payload, room=str(session_id), namespace='/agent')


async def emit_to_org_inbox(event: str, payload: dict, organization_id,
                            user_id: Optional[object] = None) -> None:
    """Push a live update to every inbox open on the organization, and to the
    handling agent's personal room (where a chat they own is listening)."""
    await sio.emit(event, payload, room=org_inbox_room(organization_id), namespace='/agent')
    if user_id is not None:
        await sio.emit(event, payload, room=f"user_{user_id}", namespace='/agent')


async def relay_stored_message(session_record, stored, message_type: str) -> None:
    """Push a stored message into the dashboard conversation live, the way
    the widget's chat_reply events do — a customer message, or one sent from
    outside the inbox (e.g. by an external app) into a chat a human holds."""
    session_id = str(session_record.session_id)
    payload = {
        'message': stored.message,
        'message_id': stored.id,
        'type': message_type,
        'transfer_to_human': False,
        'session_id': session_id,
        # The inbox appends the message live off this field; without it the
        # handler builds an invalid Date and the message only shows on refetch.
        'created_at': (stored.created_at or datetime.now(timezone.utc)).isoformat(),
        # Carries e.g. the button-reply marker, so tags show live too
        'attributes': stored.attributes or {},
    }
    await emit_to_session_agents('chat_reply', payload, session_id, session_record.user_id)


async def announce_presence(agent) -> None:
    """Tell the agent's open widgets what their header should say now.
    Never raises: the setting that changed is saved either way, and a widget
    that misses this reads presence again when it reconnects."""
    try:
        await sio.emit(PRESENCE_EVENT, widget_presence(agent),
                       room=presence_room(agent.id), namespace='/widget')
    except Exception as e:
        logger.error(f"Could not push presence for agent {agent.id}: {e}")

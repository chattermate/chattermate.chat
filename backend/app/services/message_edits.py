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

Editing a reply a person sent, after it went out.

Only their own reply, while the conversation is open and for EDIT_WINDOW
after sending: past that the customer has read it, and a correction belongs
in a new message. The customer's copy changes too: in the widget (it updates
the message in place), or on a platform that lets a sent message change
(ChannelAdapter.supports_edit: Telegram, Slack). Where the platform can't
(WhatsApp, Messenger, Instagram, SMS, email) the inbox doesn't offer it.

The first text is kept (original_message); attributes.edited_at says when.
"""

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.channels import get_adapter
from app.core.logger import get_logger
from app.core.socketio import sio
from app.models.chat_history import ChatHistory
from app.models.session_to_agent import SessionStatus, SessionToAgent
from app.models.user import User
from app.repositories.channels import ChannelAccountRepository, ChannelConversationRepository
from app.services.agent_rooms import emit_to_org_inbox
from app.services.message_delivery import WEB_CHANNEL

logger = get_logger(__name__)

EDIT_WINDOW = timedelta(minutes=15)
EDITED_AT = 'edited_at'


@dataclass
class EditRefused(Exception):
    status_code: int
    detail: str


def _as_channel(channel: Optional[str]) -> str:
    return channel if isinstance(channel, str) and channel else WEB_CHANNEL


def _channel(session: SessionToAgent) -> str:
    return _as_channel(getattr(session, 'channel', None))


def edit_window_minutes(channel: Optional[str]) -> Optional[int]:
    """How long after sending a reply on this channel it can be edited; None
    where the customer's copy can't change (the inbox then offers no Edit)."""
    channel = _as_channel(channel)
    if channel == WEB_CHANNEL:
        return int(EDIT_WINDOW.total_seconds() // 60)
    adapter = get_adapter(channel)
    return int(EDIT_WINDOW.total_seconds() // 60) if adapter is not None and adapter.supports_edit else None


def _as_utc(moment: datetime) -> datetime:
    return moment if moment.tzinfo else moment.replace(tzinfo=timezone.utc)


def _check(session: SessionToAgent, message: ChatHistory, user: User, now: datetime) -> None:
    if message.message_type != 'agent' or message.user_id != user.id:
        raise EditRefused(403, "You can only edit a reply you sent")
    if session.status == SessionStatus.CLOSED:
        raise EditRefused(400, "This chat is closed")
    if edit_window_minutes(_channel(session)) is None:
        raise EditRefused(400, "This channel can't change a message once it's sent")
    if message.created_at is None or now - _as_utc(message.created_at) > EDIT_WINDOW:
        raise EditRefused(400, f"Replies can be edited for {int(EDIT_WINDOW.total_seconds() // 60)} minutes after sending")


async def _change_channel_copy(db: Session, session: SessionToAgent, message: ChatHistory, text: str) -> None:
    """The platform's copy first: if it won't change, nothing does."""
    adapter = get_adapter(_channel(session))
    conversation = ChannelConversationRepository(db).get_by_session(session.session_id)
    account = ChannelAccountRepository(db).get_by_id(conversation.channel_account_id) if conversation else None
    if not message.external_message_id or account is None or not account.is_active:
        raise EditRefused(409, "This message can't be changed on the channel any more")
    result = await adapter.edit_text(account, conversation, message.external_message_id, adapter.format_outbound(text))
    if not result.ok:
        logger.warning(f"Channel edit refused for message {message.id}: {result.error}")
        raise EditRefused(502, "The channel didn't accept the change. The message is as it was")


async def edit_sent_reply(db: Session, session: SessionToAgent, message: ChatHistory, user: User,
                          text: str) -> ChatHistory:
    """Change a person's sent reply everywhere it shows, or raise EditRefused."""
    now = datetime.now(timezone.utc)
    _check(session, message, user, now)
    if text == message.message:
        return message
    if _channel(session) != WEB_CHANNEL:
        await _change_channel_copy(db, session, message, text)

    if message.original_message is None:
        message.original_message = message.message
    message.message = text
    message.attributes = {**(message.attributes or {}), EDITED_AT: now.isoformat()}
    db.commit()
    db.refresh(message)

    edit = {'message_id': message.id, 'message': text, EDITED_AT: now.isoformat(),
            'session_id': str(session.session_id)}
    # The widget changes it in place; the other inboxes refetch
    await sio.emit('message_edited', edit, room=str(session.session_id), namespace='/widget')
    await emit_to_org_inbox('room_event', {'type': 'message_edited', 'session_id': str(session.session_id)},
                            session.organization_id, session.user_id)
    return message

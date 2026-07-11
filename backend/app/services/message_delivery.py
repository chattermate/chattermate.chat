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

from dataclasses import dataclass
from typing import Optional

from sqlalchemy.orm import Session

from app.core.socketio import sio
from app.channels import get_adapter, WindowStatus
from app.models.session_to_agent import SessionToAgent
from app.repositories.channels import ChannelAccountRepository, ChannelConversationRepository
from app.core.logger import get_logger

logger = get_logger(__name__)

WEB_CHANNEL = 'web'


@dataclass
class DeliveryResult:
    ok: bool
    reason: Optional[str] = None
    # A WhatsApp template message could reopen the conversation
    can_template: bool = False


async def deliver_to_customer(db: Session, session_record: SessionToAgent, payload: dict) -> DeliveryResult:
    """Route a reply (human or bot) to wherever the customer is.

    Widget sessions keep the existing Socket.IO emit unchanged; external
    channel sessions are delivered through their ChannelAdapter. The widget
    emit also fires for channel sessions so any live dashboard viewers of
    the session room stay consistent.
    """
    session_id = str(session_record.session_id)
    channel = getattr(session_record, 'channel', None)
    if not isinstance(channel, str) or not channel:
        channel = WEB_CHANNEL

    if channel == WEB_CHANNEL:
        await sio.emit('chat_response', payload, room=session_id, namespace='/widget')
        return DeliveryResult(ok=True)

    result = await _deliver_to_channel(db, session_record, channel, payload)
    await sio.emit('chat_response', payload, room=session_id, namespace='/widget')
    return result


async def _deliver_to_channel(db: Session, session_record: SessionToAgent,
                              channel: str, payload: dict) -> DeliveryResult:
    session_id = str(session_record.session_id)

    adapter = get_adapter(channel)
    if adapter is None:
        logger.error(f"No adapter registered for channel '{channel}' (session {session_id})")
        return DeliveryResult(ok=False, reason='unknown_channel')

    conversation = ChannelConversationRepository(db).get_by_session(session_record.session_id)
    if conversation is None:
        logger.error(f"No channel conversation for {channel} session {session_id}")
        return DeliveryResult(ok=False, reason='no_channel_conversation')

    account = ChannelAccountRepository(db).get_by_id(conversation.channel_account_id)
    if account is None or not account.is_active:
        return DeliveryResult(ok=False, reason='account_inactive')

    window = adapter.check_delivery_window(conversation)
    if window is WindowStatus.TEMPLATE_REQUIRED:
        return DeliveryResult(ok=False, reason='window_expired', can_template=True)
    if window is WindowStatus.UNDELIVERABLE:
        return DeliveryResult(ok=False, reason='window_expired')

    text = payload.get('message') or ''
    if not text.strip():
        # Nothing textual to forward (e.g. attachment-only payloads until
        # media support lands) — not a failure.
        return DeliveryResult(ok=True)

    send_result = await adapter.send_text(account, conversation, adapter.format_outbound(text))
    if not send_result.ok:
        logger.error(f"Failed delivering to {channel} session {session_id}: {send_result.error}")
        return DeliveryResult(ok=False, reason=send_result.error or 'send_failed',
                              can_template=send_result.can_template)
    return DeliveryResult(ok=True)

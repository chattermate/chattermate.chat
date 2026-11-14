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

from dataclasses import dataclass, replace
from typing import Optional

from sqlalchemy.orm import Session

from app.core.socketio import sio
from app.channels import ChannelAdapter, SendResult, get_adapter, WindowStatus
from app.channels.app_hooks import OutboundRecord, emit_channel_event, outbound_event
from app.channels.base import InteractiveMessage
from app.channels.constants import MessageSource
from app.channels.interactive import (
    DEFAULT_CHOICES_BODY, to_text_fallback, validate_interactive,
)
from app.channels.interactive_limits import InteractiveLimits
from app.channels.sent_choices import SENT_CHOICES_ATTRIBUTE, encode_sent_choices
from app.models.channels import ChannelAccount, ChannelConversation
from app.models.session_to_agent import SessionToAgent
from app.repositories.channels import ChannelAccountRepository, ChannelConversationRepository
from app.repositories.chat import ChatRepository
from app.services.business_message import forget_business_message
from app.services.channel_status import record_sent
from app.core.logger import get_logger

logger = get_logger(__name__)

WEB_CHANNEL = 'web'


@dataclass
class DeliveryResult:
    ok: bool
    reason: Optional[str] = None
    # A WhatsApp template message could reopen the conversation
    can_template: bool = False
    # The channel's id for the sent message (WhatsApp wamid), for callers that
    # report it on (the external-app send API)
    external_message_id: Optional[str] = None


@dataclass
class _Sent:
    """What one reply actually went out as."""
    result: SendResult
    # The choices that went with it, and whether they had to go as text
    choices: Optional[InteractiveMessage] = None
    as_text: bool = False
    # A reply too long to carry its choices went out first on its own
    lead: Optional[SendResult] = None


async def deliver_to_customer(db: Session, session_record: SessionToAgent, payload: dict,
                              message_id: Optional[int] = None,
                              interactive: Optional[InteractiveMessage] = None,
                              *, source: MessageSource) -> DeliveryResult:
    """Route a reply (human or bot) to wherever the customer is.

    Widget sessions keep the existing Socket.IO emit unchanged; external
    channel sessions are delivered through their ChannelAdapter. The widget
    emit also fires for channel sessions so any live dashboard viewers of
    the session room stay consistent.

    `message_id` is the stored chat_history row being delivered: the
    platform's id for the send is recorded on exactly that row, so delivery
    receipts land on the right message. `interactive` offers choices with the
    reply (its body is the reply text) — buttons where the channel has them, a
    numbered list otherwise; what actually went out is recorded on that row.
    `source` is who wrote the message; channel sends are announced to
    extensions as `outbound` events with it.
    """
    session_id = str(session_record.session_id)
    channel = getattr(session_record, 'channel', None)
    if not isinstance(channel, str) or not channel:
        channel = WEB_CHANNEL

    if channel == WEB_CHANNEL:
        await sio.emit('chat_response', payload, room=session_id, namespace='/widget')
        return DeliveryResult(ok=True)

    result = await _deliver_to_channel(db, session_record, channel, payload,
                                       message_id, interactive, source)
    await sio.emit('chat_response', payload, room=session_id, namespace='/widget')
    return result


async def _deliver_to_channel(db: Session, session_record: SessionToAgent,
                              channel: str, payload: dict, message_id: Optional[int],
                              interactive: Optional[InteractiveMessage],
                              source: MessageSource) -> DeliveryResult:
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

    sent = await _send_reply(adapter, account, conversation, text, interactive)
    ChannelAccountRepository(db).track_send_result(account, sent.result)
    if not sent.result.ok:
        logger.error(f"Failed delivering to {channel} session {session_id}: {sent.result.error}")
        return DeliveryResult(ok=False, reason=sent.result.error or 'send_failed',
                              can_template=sent.result.can_template)
    if message_id is not None:
        await _record_delivery(db, adapter, account, message_id, sent)
    if source == MessageSource.HUMAN:
        # A person has taken the conversation from there; the AI no longer
        # reads it as a reply to the business's last own message
        forget_business_message(db, conversation)
    customer_id = str(session_record.customer_id) if session_record.customer_id else None
    # Each platform message is announced: the reply sent on its own first,
    # then the one carrying the choices
    announced = ([(sent.lead, text, None), (sent.result, sent.choices.body, sent.choices)]
                 if sent.lead is not None else [(sent.result, text, sent.choices)])
    for result, announced_text, choices in announced:
        await emit_channel_event(outbound_event(
            organization_id=account.organization_id, channel_account_id=account.id,
            session_id=session_id, customer_id=customer_id,
            record=OutboundRecord(message_id=message_id, external_message_id=result.external_message_id,
                                  source=source, text=announced_text, interactive=choices),
        ))
    return DeliveryResult(ok=True, external_message_id=sent.result.external_message_id)


async def _record_delivery(db: Session, adapter: ChannelAdapter, account: ChannelAccount,
                           message_id: int, sent: _Sent) -> None:
    """Note on the stored row what went out and under which platform id.
    Bookkeeping only: the message is already with the customer, so a failure
    here is logged, never reported as a failed delivery."""
    try:
        if sent.choices is not None:
            ChatRepository(db).update_message_attributes(message_id, {
                SENT_CHOICES_ATTRIBUTE: encode_sent_choices(
                    sent.choices, sent.as_text,
                    numbered=bool(adapter.interactive_limits and adapter.interactive_limits.options_in_text)),
            })
        external_message_id = sent.result.external_message_id
        if adapter.reports_delivery_status and external_message_id:
            await record_sent(db, message_id, account.id, external_message_id)
        elif external_message_id and (sent.choices is not None or adapter.supports_edit):
            # A tap is matched back to the message that offered it; an edit
            # changes the platform's copy by this id
            ChatRepository(db).set_external_message_id(message_id, external_message_id)
    except Exception as e:
        logger.error(f"Could not record delivery of message {message_id}: {e}")


def _shown_length(message: InteractiveMessage, limits: InteractiveLimits) -> int:
    """How long the message's text is as sent: with the choices written in
    too where the channel shows them that way."""
    return len(to_text_fallback(message) if limits.options_in_text else message.body)


async def _send_reply(adapter: ChannelAdapter, account: ChannelAccount,
                      conversation: ChannelConversation, text: str,
                      interactive: Optional[InteractiveMessage]) -> _Sent:
    """Send the reply, with its choices as native buttons when the channel
    supports them and they fit; otherwise as a numbered list in the text, so
    the choices are never silently lost.

    A reply too long to be an interactive body goes out as text first, then
    the choices under a short prompt — the choices carry the platform id, as
    a tap replies to them.
    """
    if interactive is None:
        result = await adapter.send_text(account, conversation, adapter.format_outbound(text))
        return _Sent(result=result)

    choices = interactive
    lead = None
    if adapter.supports_interactive:
        limits = adapter.interactive_limits
        if _shown_length(interactive, limits) > limits.body_max:
            lead = await adapter.send_text(account, conversation, adapter.format_outbound(text))
            if not lead.ok:
                return _Sent(result=lead)
            choices = replace(interactive, body=DEFAULT_CHOICES_BODY)
        errors = validate_interactive(choices, limits)
        if errors:
            logger.warning(f"Choices not sendable as interactive on {adapter.channel_type}, "
                           f"sending as text: {'; '.join(errors)}")
        else:
            result = await adapter.send_interactive(account, conversation, choices)
            if result.ok:
                return _Sent(result=result, choices=choices, lead=lead)
            logger.warning(f"Interactive send failed on {adapter.channel_type}, "
                           f"falling back to text: {result.error}")
    fallback = to_text_fallback(choices, adapter.max_text_length)
    result = await adapter.send_text(account, conversation, adapter.format_outbound(fallback))
    if not result.ok and lead is not None:
        # The reply itself reached the customer; only its choices didn't
        logger.warning(f"Choices undelivered on {adapter.channel_type} after the reply was "
                       f"sent: {result.error}")
        return _Sent(result=lead)
    return _Sent(result=result, choices=choices, as_text=True, lead=lead)

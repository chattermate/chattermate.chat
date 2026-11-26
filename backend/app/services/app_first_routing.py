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

Letting an installed extension answer a channel message before the AI does
(see app.channels.app_hooks), and announcing every inbound message to it.
"""

import asyncio
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.channels.app_hooks import (
    ChannelEvent, EventKind, HandledBy, InboundContext, emit_channel_event,
    button_handler_for, inbound_event_id, inbound_handler, text_handlers,
)
from app.channels.base import InboundMessage
from app.core.logger import get_logger
from app.models.channels import ChannelAccount
from app.models.session_to_agent import SessionStatus

logger = get_logger(__name__)

# How long the customer's message waits on the extension before the AI (or
# inbox) takes it. The extension answers synchronously, so this is added to
# every reply the AI then gives — kept short.
APP_HANDLER_TIMEOUT_SECONDS = 4.0
# A text handler (a sign-up code) may read the store; past this it's skipped
TEXT_HANDLER_TIMEOUT_SECONDS = 10.0
# A button handler only records the tap and queues the work
BUTTON_HANDLER_TIMEOUT_SECONDS = 4.0


def _context(account: ChannelAccount, session_record, customer_id: str, inbound: InboundMessage,
             received_at: datetime) -> InboundContext:
    return InboundContext(
        event_id=inbound_event_id(account.id, inbound.external_message_id),
        organization_id=account.organization_id,
        channel_account_id=account.id,
        channel_type=account.channel_type,
        session_id=str(session_record.session_id),
        customer_id=customer_id,
        inbound=inbound,
        received_at=received_at,
    )


async def text_reply(db: Session, account: ChannelAccount, session_record, customer_id: str,
                     inbound: InboundMessage, received_at: datetime) -> Optional[str]:
    """The business's own answer to a code or keyword in the message (see
    app_hooks.register_text_handler), whoever holds the chat; None when no
    handler takes it. A failing or slow handler counts as not taking it."""
    handlers = text_handlers()
    if not handlers or not (inbound.text or "").strip():
        return None
    db.commit()
    context = _context(account, session_record, customer_id, inbound, received_at)
    for handler in handlers:
        try:
            reply = await asyncio.wait_for(handler(context), TEXT_HANDLER_TIMEOUT_SECONDS)
        except asyncio.TimeoutError:
            logger.warning(f"Text handler timed out on {inbound.external_message_id}")
            continue
        except Exception as e:
            logger.error(f"Text handler failed on {inbound.external_message_id}: {e}")
            continue
        if isinstance(reply, str):
            return reply
    return None


async def button_reply(db: Session, account: ChannelAccount, session_record, customer_id: str,
                       inbound: InboundMessage, received_at: datetime) -> Optional[str]:
    """The business's answer to a tap on a button it owns (see
    app_hooks.register_button_handler), whoever holds the chat; None when no
    handler owns the button. A claimed tap stays claimed when its handler
    fails or is slow: its payload means nothing to the AI or a person, so it
    answers nothing rather than reach them."""
    tap = inbound.interactive
    handler = button_handler_for(tap.id if tap is not None else None)
    if handler is None:
        return None
    db.commit()
    context = _context(account, session_record, customer_id, inbound, received_at)
    try:
        reply = await asyncio.wait_for(handler(context), BUTTON_HANDLER_TIMEOUT_SECONDS)
    except asyncio.TimeoutError:
        logger.error(f"Button handler timed out on {inbound.external_message_id}")
        return ""
    except Exception as e:
        logger.error(f"Button handler failed on {inbound.external_message_id}: {e}")
        return ""
    return reply if isinstance(reply, str) else ""


async def app_claims(db: Session, account: ChannelAccount, session_record, customer_id: str,
                     inbound: InboundMessage, received_at: datetime) -> bool:
    """Offer the message to the extension; True when it has dealt with it.

    Only a conversation nobody holds is offered — once a human has it, or a
    transfer is pending, the human answers. A timeout or a failing extension
    counts as "not handled", so the customer is never left waiting on it.
    """
    handler = inbound_handler()
    if handler is None or not _open_and_unheld(session_record):
        return False
    # Nothing may sit in an open transaction while an outside service thinks
    db.commit()
    context = _context(account, session_record, customer_id, inbound, received_at)
    try:
        # Exactly True: anything else (a stray truthy string, a forgotten
        # await) must not silence the AI
        return await asyncio.wait_for(handler(context), APP_HANDLER_TIMEOUT_SECONDS) is True
    except asyncio.TimeoutError:
        logger.warning(f"Extension did not answer {inbound.external_message_id} within "
                       f"{APP_HANDLER_TIMEOUT_SECONDS}s; continuing without it")
    except Exception as e:
        logger.error(f"Extension failed on {inbound.external_message_id}; continuing without it: {e}")
    return False


async def announce_inbound(account: ChannelAccount, session_record, customer_id: str,
                           inbound: InboundMessage, handled_by: HandledBy,
                           received_at: Optional[datetime] = None) -> None:
    """Tell listeners about an inbound message and who is answering it. Sent
    once per message on every path, before any AI reply, under an id derived
    from the message so a redelivered webhook can't announce it twice."""
    await emit_channel_event(ChannelEvent(
        kind=EventKind.INBOUND,
        event_id=inbound_event_id(account.id, inbound.external_message_id),
        organization_id=account.organization_id,
        channel_account_id=account.id,
        occurred_at=received_at or datetime.now(timezone.utc),
        session_id=str(session_record.session_id),
        customer_id=customer_id,
        inbound=inbound,
        handled_by=handled_by,
    ))


def _open_and_unheld(session_record) -> bool:
    return session_record.user_id is None and session_record.status == SessionStatus.OPEN

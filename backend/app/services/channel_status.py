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

Channel delivery receipts (sent / delivered / read / failed) applied to the
stored messages they belong to.
"""

import json
from datetime import datetime, timezone
from typing import List, Set
from uuid import UUID

from sqlalchemy.orm import Session

from app.channels.app_hooks import ChannelEvent, EventKind, emit_channel_event, status_event_id
from app.channels.base import DeliveryState, StatusEvent
from app.core.logger import get_logger
from app.core.redis import get_redis
from app.database import SessionLocal
from app.models.chat_history import ChatHistory
from app.repositories.channels import ChannelAccountRepository
from app.repositories.chat import ChatRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services.agent_rooms import emit_to_org_inbox

logger = get_logger(__name__)

# A receipt can arrive before the send that produced it has stored the
# message id (the Graph response and the webhook race). It waits here until
# record_sent picks it up; long enough to cover the race, short enough that a
# receipt for a message we never stored doesn't linger.
PENDING_KEY = "channel_status_pending:{account_id}:{message_id}"
PENDING_TTL_SECONDS = 600

# Receipts can arrive out of order and more than once, so a status only
# replaces one it outranks. FAILED replaces sent/delivered but never READ:
# a message the customer read was delivered, whatever arrives after.
# Keyed by the stored value (chat_history.channel_status).
_RANK = {DeliveryState.SENT.value: 0, DeliveryState.DELIVERED.value: 1, DeliveryState.READ.value: 2}


def replaceable_by(new: DeliveryState) -> Set[str]:
    """The stored statuses receipt `new` may overwrite (no status at all is
    always overwritten)."""
    if new == DeliveryState.FAILED:
        return {DeliveryState.SENT.value, DeliveryState.DELIVERED.value}
    return {state for state, rank in _RANK.items() if rank < _RANK[new.value]}


async def process_status_event(account_id: UUID, event: StatusEvent) -> None:
    """Apply one receipt from a channel webhook. Runs from a BackgroundTask
    with its own DB session."""
    db = SessionLocal()
    try:
        account = ChannelAccountRepository(db).get_by_id(account_id)
        if account is None:
            return
        ChannelAccountRepository(db).track_receipt(account, event)
        # Announced before matching: extensions count every receipt, including
        # ones for messages ChatterMate never stored.
        await emit_channel_event(ChannelEvent(
            kind=EventKind.STATUS,
            event_id=status_event_id(account.id, event.external_message_id, event.status.value),
            organization_id=account.organization_id,
            channel_account_id=account.id,
            occurred_at=event.timestamp or datetime.now(timezone.utc),
            status=event,
        ))
        chat_repo = ChatRepository(db)
        message = chat_repo.get_by_external_message_id(
            account.organization_id, event.external_message_id)
        if message is None:
            _park(account_id, event)
            # record_sent may have stored the id and drained the queue between
            # the lookup and the park; look again so the receipt isn't stranded.
            message = chat_repo.get_by_external_message_id(
                account.organization_id, event.external_message_id)
            if message is None:
                return
            for parked in _take_parked(account_id, event.external_message_id):
                await _apply(db, message, parked)
            return
        await _apply(db, message, event)
    except Exception as e:
        logger.error(f"Error processing channel status event: {e}", exc_info=True)
    finally:
        db.close()


async def record_sent(db: Session, message_id: int, account_id: UUID,
                      external_message_id: str) -> None:
    """Store the platform id of a message we just sent, then apply any
    receipts that arrived before it."""
    message = ChatRepository(db).set_external_message_id(message_id, external_message_id)
    if message is None:
        return
    for event in _take_parked(account_id, external_message_id):
        await _apply(db, message, event)


async def _apply(db: Session, message: ChatHistory, event: StatusEvent) -> None:
    chat_repo = ChatRepository(db)
    advanced = chat_repo.advance_channel_status(
        message.id, event.status.value, event.timestamp or datetime.now(timezone.utc),
        replaceable_by(event.status))
    if not advanced:
        return
    db.refresh(message)
    if event.status == DeliveryState.FAILED:
        # Meta can accept a send and fail it later; this is the only place
        # that failure becomes visible.
        chat_repo.mark_delivery_failed(message.id, event.error)
    session = SessionToAgentRepository(db).get_session(message.session_id)
    await emit_to_org_inbox('message_status', {
        'session_id': str(message.session_id),
        'message_id': message.id,
        'external_message_id': message.external_message_id,
        'channel_status': message.channel_status,
        'delivery_status': (message.attributes or {}).get('delivery_status'),
    }, message.organization_id, session.user_id if session else None)


def _pending_key(account_id: UUID, external_message_id: str) -> str:
    return PENDING_KEY.format(account_id=account_id, message_id=external_message_id)


def _park(account_id: UUID, event: StatusEvent) -> None:
    redis = get_redis()
    if redis is None:
        return
    key = _pending_key(account_id, event.external_message_id)
    try:
        pipe = redis.pipeline()
        pipe.rpush(key, _serialize(event))
        pipe.expire(key, PENDING_TTL_SECONDS)
        pipe.execute()
    except Exception as e:
        logger.warning(f"Could not park channel status event: {e}")


def _take_parked(account_id: UUID, external_message_id: str) -> List[StatusEvent]:
    redis = get_redis()
    if redis is None:
        return []
    key = _pending_key(account_id, external_message_id)
    try:
        pipe = redis.pipeline()
        pipe.lrange(key, 0, -1)
        pipe.delete(key)
        raw_events, _ = pipe.execute()
    except Exception as e:
        logger.warning(f"Could not read parked channel status events: {e}")
        return []
    return [_deserialize(raw, external_message_id) for raw in raw_events or []]


def _serialize(event: StatusEvent) -> str:
    # Only what _apply uses — no recipient number or pricing sits in Redis
    return json.dumps({
        'status': event.status.value,
        'timestamp': event.timestamp.isoformat() if event.timestamp else None,
        'error': event.error,
    })


def _deserialize(raw: str, external_message_id: str) -> StatusEvent:
    data = json.loads(raw)
    return StatusEvent(
        external_account_id="",
        external_message_id=external_message_id,
        recipient_id="",
        status=DeliveryState(data['status']),
        timestamp=datetime.fromisoformat(data['timestamp']) if data['timestamp'] else None,
        error=data.get('error'),
    )

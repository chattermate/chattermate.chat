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

Extension points on the channel pipeline.

An extension can see every channel message in and out and every delivery
receipt (event listeners), and can claim an inbound message before the AI
answers it (the inbound handler). Nothing here knows who the extension is:
load_extensions imports whatever is installed, and the extension registers
itself. Without one, every hook is a no-op.

Hooks receive plain ids and values, never ORM objects or credentials.
"""

import asyncio
import enum
import importlib
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Awaitable, Callable, List, Optional
from uuid import UUID, uuid4

from app.channels.base import InboundMessage, InteractiveMessage, StatusEvent
from app.channels.constants import MessageSource
from app.core.logger import get_logger

logger = get_logger(__name__)

# The installed extension's hook module, imported (if present) by
# load_extensions. Importing it registers its hooks.
EXTENSION_HOOKS_MODULE = "app.enterprise.hooks"
_EXTENSION_PACKAGE = EXTENSION_HOOKS_MODULE.rsplit(".", 1)[0]

# Listeners run inline on the message, delivery and receipt paths, so each
# gets this long; they are meant to enqueue work, not do it.
LISTENER_TIMEOUT_SECONDS = 1.0


class EventKind(str, enum.Enum):
    INBOUND = "inbound"
    STATUS = "status"
    OUTBOUND = "outbound"


class HandledBy(str, enum.Enum):
    APP = "app"
    AI = "ai"
    HUMAN = "human"


@dataclass
class InboundContext:
    """An inbound message an extension may claim. `event_id` is the id of the
    `inbound` event that follows for the same message, so a synchronous call
    and that event can be told apart from two different messages."""
    event_id: str
    organization_id: UUID
    channel_account_id: UUID
    channel_type: str
    session_id: str
    customer_id: str
    inbound: InboundMessage
    received_at: datetime


@dataclass
class OutboundRecord:
    """A message the business sent on a channel."""
    message_id: Optional[int]
    external_message_id: Optional[str]
    source: MessageSource
    text: str
    interactive: Optional[InteractiveMessage] = None


@dataclass
class ChannelEvent:
    """Something that happened on a channel conversation. `event_id` is
    deterministic, so a retried webhook or send yields the same id."""
    kind: EventKind
    event_id: str
    organization_id: UUID
    channel_account_id: UUID
    occurred_at: datetime
    session_id: Optional[str] = None
    customer_id: Optional[str] = None
    inbound: Optional[InboundMessage] = None
    handled_by: Optional[HandledBy] = None
    status: Optional[StatusEvent] = None
    outbound: Optional[OutboundRecord] = None


InboundHandler = Callable[[InboundContext], Awaitable[bool]]
EventListener = Callable[[ChannelEvent], Awaitable[None]]

_inbound_handler: Optional[InboundHandler] = None
_event_listeners: List[EventListener] = []
_extensions_loaded = False


def register_inbound_handler(handler: InboundHandler) -> None:
    """Let an extension claim inbound messages first. One slot: the handler
    returns True (exactly) when it has dealt with the message and the AI
    must not.

    The contract a handler has to live with:
    - it is cancelled after app_first_routing.APP_HANDLER_TIMEOUT_SECONDS
      and the AI answers instead, so its own outbound calls must time out
      sooner — or the customer can get both answers;
    - it must only do async I/O (blocking work can't be cancelled);
    - it can see the same message twice (webhook redelivery when dedupe is
      unavailable) — dedupe on InboundContext.event_id;
    - it is not the durable record: every inbound message is also announced
      as an `inbound` event (same event_id), whatever the handler did."""
    global _inbound_handler
    _inbound_handler = handler


def register_event_listener(listener: EventListener) -> None:
    if listener not in _event_listeners:
        _event_listeners.append(listener)


def inbound_handler() -> Optional[InboundHandler]:
    return _inbound_handler


async def emit_channel_event(event: ChannelEvent) -> None:
    """Tell every listener. A failing or slow listener is logged and skipped —
    an extension can never break or stall message handling."""
    for listener in list(_event_listeners):
        try:
            await asyncio.wait_for(listener(event), LISTENER_TIMEOUT_SECONDS)
        except asyncio.TimeoutError:
            logger.error(f"Channel event listener timed out on {event.kind.value} {event.event_id}")
        except Exception:
            logger.exception(f"Channel event listener failed on {event.kind.value} {event.event_id}")


def load_extensions() -> None:
    """Import the installed extension's hooks, once. Called at startup by the
    API, by every worker that sends on channels, and before the knowledge
    manager looks up a source reader (app.knowledge.source_readers) —
    explicitly, so a process that never calls it (a migration, a script)
    never loads an extension."""
    global _extensions_loaded
    if _extensions_loaded:
        return
    _extensions_loaded = True
    try:
        importlib.import_module(EXTENSION_HOOKS_MODULE)
    except ModuleNotFoundError as e:
        if e.name not in (EXTENSION_HOOKS_MODULE, _EXTENSION_PACKAGE):
            logger.exception("Channel extension failed to load")  # installed but broken
            return
        logger.debug("No channel extension installed")
    except Exception:
        logger.exception("Channel extension failed to load")


def reset() -> None:
    """Forget every registration (tests)."""
    global _inbound_handler, _extensions_loaded
    _inbound_handler = None
    _event_listeners.clear()
    _extensions_loaded = False


def inbound_event_id(channel_account_id, external_message_id: str) -> str:
    return f"{channel_account_id}:{external_message_id}"


def status_event_id(channel_account_id, external_message_id: str, status: str) -> str:
    return f"{channel_account_id}:{external_message_id}:{status}"


def outbound_event(*, organization_id, channel_account_id, session_id: Optional[str],
                   customer_id: Optional[str], record: OutboundRecord) -> ChannelEvent:
    # Keyed by the platform's id when there is one, else the stored row; a
    # send with neither is unrepeatable anyway.
    key = record.external_message_id or (f"row{record.message_id}" if record.message_id else None)
    return ChannelEvent(
        kind=EventKind.OUTBOUND,
        event_id=f"{channel_account_id}:out:{key}" if key else str(uuid4()),
        organization_id=organization_id,
        channel_account_id=channel_account_id,
        occurred_at=datetime.now(timezone.utc),
        session_id=session_id,
        customer_id=customer_id,
        outbound=record,
    )

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

A conversation got a new message: tell the inboxes open on its organization.

A chat a person holds already streams its messages to them as chat_reply. One
nobody holds (the AI answering it, or waiting in the queue) streamed nothing,
so a thread open on it sat stale until reopened. Every message row is written
through one model, so this hooks the commit rather than each of the many paths
that store a message (the AI, workflows, the queue notice, channels, apps).

The event carries only the conversation's id; an inbox open on it refetches.
"""

import asyncio
from typing import Coroutine, Optional

from sqlalchemy import event
from sqlalchemy.orm import Session, object_session

from app.core.logger import get_logger
from app.models.chat_history import ChatHistory
from app.services.agent_rooms import emit_to_org_inbox

logger = get_logger(__name__)

EVENT = 'conversation_activity'

# Conversations that got a message in a session's open transaction
_PENDING = 'conversation_activity_pending'

# The server's event loop: messages are also stored from worker threads, which
# have none of their own. Unset (tests, background workers) means no one is
# listening here, and nothing is sent.
_loop: Optional[asyncio.AbstractEventLoop] = None
# Sends in flight, held so they can't be garbage-collected mid-run
_sending: set = set()


def bind_loop(loop: asyncio.AbstractEventLoop) -> None:
    """Called once at startup, from the server's loop."""
    global _loop
    _loop = loop


def _schedule(coro: Coroutine) -> None:
    loop = _loop
    if loop is None or loop.is_closed():
        coro.close()
        return
    try:
        running = asyncio.get_running_loop()
    except RuntimeError:
        running = None
    if running is loop:
        task = loop.create_task(coro)
        _sending.add(task)
        task.add_done_callback(_sending.discard)
    elif loop.is_running():
        asyncio.run_coroutine_threadsafe(coro, loop)
    else:
        coro.close()


async def _announce(session_id: str, organization_id: str) -> None:
    try:
        await emit_to_org_inbox(EVENT, {'session_id': session_id}, organization_id)
    except Exception as e:  # a missed refresh must never break storing a message
        logger.warning(f"Could not announce activity on {session_id}: {e}")


@event.listens_for(ChatHistory, 'after_insert')
def _message_written(_mapper, _connection, message: ChatHistory) -> None:
    session = object_session(message)
    if session is not None and message.session_id and message.organization_id:
        session.info.setdefault(_PENDING, set()).add((str(message.session_id), str(message.organization_id)))


@event.listens_for(Session, 'after_commit')
def _committed(session: Session) -> None:
    for session_id, organization_id in session.info.pop(_PENDING, ()):
        _schedule(_announce(session_id, organization_id))


@event.listens_for(Session, 'after_rollback')
def _rolled_back(session: Session) -> None:
    session.info.pop(_PENDING, None)

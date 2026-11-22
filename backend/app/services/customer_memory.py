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

What the agent may know of a returning customer from their earlier
conversations, asked when a conversation's agent is built.

The memory itself (what is kept, for whom, and how long) belongs to a provider
installed at startup. Without one nothing is remembered: every call here is a
no-op, and a provider that fails is treated the same way, so memory can never
stop a reply.

The core only says when a conversation got a message (`note_activity`) and
asks for the context at agent build (`recall`). Who counts as the same customer
is the provider's call, and it must answer only for an identity the
conversation proved: a recalled past handed to someone who typed another
person's email would leak that person's conversations.
"""

import asyncio
import hashlib
import time
from collections import OrderedDict
from dataclasses import dataclass
from typing import Optional, Protocol, Tuple

from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.services import email_proof

logger = get_logger(__name__)

# Socket session key: the widget conversation's recalled context, worked out
# once per conversation and proof (a proven email may recall more)
SESSION_KEY = 'customer_memory'

# A channel message has no socket session to keep the context in: it is kept
# here per conversation, for this long, for at most this many conversations
CHANNEL_CONTEXT_SECONDS = 30 * 60
CHANNEL_CONTEXTS = 10_000


@dataclass(frozen=True)
class Conversation:
    """The conversation an agent is being built for."""
    organization_id: str
    agent_id: str
    customer_id: str
    session_id: str
    channel: str
    # The widget token scope (conversation_token); None off the widget
    conversation_scope: Optional[str] = None


class CustomerMemory(Protocol):
    def enabled(self, organization_id: str) -> bool:
        """Cheap, no I/O: whether memory is on for the organization at all."""
        ...

    def recall(self, db: Session, conversation: Conversation) -> Optional[str]:
        """Blocking. The context for the agent, fenced as untrusted data, or None."""
        ...

    def note_activity(self, session_id: str, organization_id: str) -> None:
        """A message was stored on the conversation. Called from the committing
        Session's after_commit on every message, so it must be cheap and must not
        use that Session (no query, no commit)."""
        ...


_provider: Optional[CustomerMemory] = None
# session_id -> (expires at, on the monotonic clock; context)
_channel_contexts: "OrderedDict[str, Tuple[float, Optional[str]]]" = OrderedDict()


def install(provider: Optional[CustomerMemory]) -> None:
    global _provider
    _provider = provider
    _channel_contexts.clear()


def enabled(organization_id: str) -> bool:
    provider = _provider
    if provider is None:
        return False
    try:
        return bool(provider.enabled(str(organization_id)))
    except Exception as e:
        logger.warning(f"Customer memory could not tell whether it is on for {organization_id}: {e}")
        return False


def recall(db: Session, conversation: Conversation) -> Optional[str]:
    """Blocking. The returning customer's context, or None."""
    provider = _provider
    if provider is None or not enabled(conversation.organization_id):
        return None
    try:
        return provider.recall(db, conversation) or None
    except Exception as e:  # memory is extra context: a failure must never stop a reply
        logger.warning(f"Customer memory recall failed for {conversation.session_id}: {e}")
        return None


async def recall_off_loop(db: Session, conversation: Conversation) -> Optional[str]:
    """`recall` in a worker thread. `db` is used by that thread alone until it
    returns, so the caller must not touch it meanwhile, not even when cancelled:
    a cancel waits for the thread before it goes on to the caller's cleanup."""
    if not enabled(conversation.organization_id):
        return None
    running = asyncio.ensure_future(asyncio.to_thread(recall, db, conversation))
    try:
        return await asyncio.shield(running)
    except asyncio.CancelledError:
        # However often it is cancelled meanwhile, the thread is waited for
        while not running.done():
            try:
                await asyncio.wait({running})
            except asyncio.CancelledError:
                continue
        raise


async def channel_context(db: Session, conversation: Conversation) -> Optional[str]:
    """`recall_off_loop` once per channel conversation: its later messages get
    the same context (the earlier conversation does not change) without
    another lookup."""
    now = time.monotonic()
    cached = _channel_contexts.get(conversation.session_id)
    if cached is not None and cached[0] > now:
        _channel_contexts.move_to_end(conversation.session_id)
        return cached[1]
    context = await recall_off_loop(db, conversation)
    _channel_contexts[conversation.session_id] = (now + CHANNEL_CONTEXT_SECONDS, context)
    _channel_contexts.move_to_end(conversation.session_id)
    while len(_channel_contexts) > CHANNEL_CONTEXTS:
        _channel_contexts.popitem(last=False)
    return context


def note_activity(session_id: str, organization_id: str) -> None:
    provider = _provider
    if provider is None:
        return
    try:
        provider.note_activity(session_id, organization_id)
    except Exception as e:  # never break storing a message
        logger.warning(f"Customer memory could not note activity on {session_id}: {e}")


def widget_conversation(socket_session: dict) -> Optional[Conversation]:
    """The widget socket's conversation, or None without a full identity."""
    keys = ('org_id', 'agent_id', 'customer_id', 'session_id')
    if not all(socket_session.get(k) for k in keys):
        return None
    return Conversation(
        organization_id=str(socket_session['org_id']),
        agent_id=str(socket_session['agent_id']),
        customer_id=str(socket_session['customer_id']),
        session_id=str(socket_session['session_id']),
        channel='web',
        conversation_scope=socket_session.get('conversation_scope'),
    )


def _proof_marker(conversation: Conversation) -> Optional[str]:
    """Blocking. Stands for the email this conversation proved, if any, so a new
    proof works the context out again. A digest: the socket session never holds
    the address."""
    proven = email_proof.verified_email(conversation.session_id, conversation.customer_id)
    return hashlib.sha256(proven.lower().encode()).hexdigest()[:16] if proven else None


async def prepare_widget(db: Session, socket_session: dict) -> bool:
    """Work out the widget conversation's context and keep it in the socket
    session, where `widget_context` reads it at agent build. Again only when the
    conversation or its proof changed. True when the socket session changed and
    the caller should save it."""
    conversation = widget_conversation(socket_session)
    if conversation is None or not enabled(conversation.organization_id):
        return False
    try:
        proof = await asyncio.to_thread(_proof_marker, conversation)
    except Exception as e:  # unknown proof: recall as if none, never more
        logger.warning(f"Customer memory could not read the proof on {conversation.session_id}: {e}")
        proof = None
    saved = socket_session.get(SESSION_KEY)
    if isinstance(saved, dict) and saved.get('session_id') == conversation.session_id \
            and saved.get('proof') == proof:
        return False
    context = await recall_off_loop(db, conversation)
    socket_session[SESSION_KEY] = {'session_id': conversation.session_id, 'proof': proof, 'context': context}
    return True


def widget_context(socket_session: dict) -> Optional[str]:
    """The context `prepare_widget` kept for the socket's current conversation."""
    saved = socket_session.get(SESSION_KEY)
    if isinstance(saved, dict) and saved.get('session_id') == str(socket_session.get('session_id')):
        return saved.get('context')
    return None

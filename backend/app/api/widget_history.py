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

The visitor's own conversations (the redesigned widget's "Your conversations"):
  list_conversations {cursor?}         -> conversations {items, next_cursor, total}
  get_conversation {id, before?}       -> conversation {id, open, messages, before}
  search_conversations {q}             -> conversation_search {q, items, capped}
  continue_conversation {id}           -> conversation_continued {title}
Every event answers only from the socket's own scope (visitor_history.py). A
conversation that is not the visitor's answers exactly like one that does not exist.
"""

from app.api.widget_actions import authenticated_session
from app.core.logger import get_logger
from app.core.socketio import sio
from app.database import close_session, session_off_loop
from app.services import visitor_history
from app.services.socket_rate_limit import socket_rate_limit
from app.services.widget_reply import WIDGET_NAMESPACE

logger = get_logger(__name__)

NOT_FOUND = {'error': 'That conversation is not available.', 'type': 'conversation_not_found'}


def _field(data, name: str):
    return data.get(name) if isinstance(data, dict) else None


async def _run(sid: str, work):
    """The authenticated socket session and a database connection for `work`."""
    session = await authenticated_session(sid)
    if session is None:
        return None, None
    db = await session_off_loop()
    try:
        return session, work(db, session)
    except Exception as e:
        logger.error(f"Conversation history failed: {e}")
        return session, None
    finally:
        close_session(db)


@sio.on('list_conversations', namespace=WIDGET_NAMESPACE)
@socket_rate_limit(namespace=WIDGET_NAMESPACE)
async def handle_list_conversations(sid, data=None):
    session, page = await _run(sid, lambda db, s: visitor_history.list_conversations(db, s, _field(data, 'cursor')))
    if session is not None:
        await sio.emit('conversations', page or {'items': [], 'next_cursor': None, 'total': 0},
                       to=sid, namespace=WIDGET_NAMESPACE)


@sio.on('get_conversation', namespace=WIDGET_NAMESPACE)
@socket_rate_limit(namespace=WIDGET_NAMESPACE)
async def handle_get_conversation(sid, data):
    session, conversation = await _run(sid, lambda db, s: visitor_history.get_conversation(
        db, s, _field(data, 'id'), _field(data, 'before')))
    if session is None:
        return
    if conversation is None:
        await sio.emit('error', NOT_FOUND, to=sid, namespace=WIDGET_NAMESPACE)
        return
    await sio.emit('conversation', conversation, to=sid, namespace=WIDGET_NAMESPACE)


@sio.on('search_conversations', namespace=WIDGET_NAMESPACE)
@socket_rate_limit(namespace=WIDGET_NAMESPACE)
async def handle_search_conversations(sid, data):
    q = _field(data, 'q')
    session, result = await _run(sid, lambda db, s: visitor_history.search_conversations(db, s, q))
    if session is not None:
        await sio.emit('conversation_search', {'q': q if isinstance(q, str) else '', **(result or {'items': [], 'capped': False})},
                       to=sid, namespace=WIDGET_NAMESPACE)


@sio.on('continue_conversation', namespace=WIDGET_NAMESPACE)
@socket_rate_limit(namespace=WIDGET_NAMESPACE)
async def handle_continue_conversation(sid, data):
    session, continued = await _run(sid, lambda db, s: visitor_history.continue_conversation(db, s, _field(data, 'id')))
    if session is None:
        return
    if continued is None:
        await sio.emit('error', NOT_FOUND, to=sid, namespace=WIDGET_NAMESPACE)
        return
    session[visitor_history.CONTINUED_KEY] = continued['context']
    await sio.save_session(sid, session, namespace=WIDGET_NAMESPACE)
    await sio.emit('conversation_continued', {'title': continued['title']}, to=sid, namespace=WIDGET_NAMESPACE)

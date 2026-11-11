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

A widget visitor's own past conversations: listed, opened read-only, searched,
and continued. Every read goes through `own_sessions`, the same rule as the
socket's own conversation (SessionToAgentRepository.get_widget_session): the
socket's customer, under the socket's token scope, with this widget's agent, on
the widget channels. Nothing here takes a customer id or an email from the
client, and a socket with no scope sees nothing.

Messages are encrypted at rest, so titles, snippets and search are worked out
here after loading, never in SQL.
"""

import base64
import json
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Query, Session, joinedload

from app.models.chat_history import ChatHistory
from app.models.session_to_agent import ACTIVE_STATUSES, SessionToAgent
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services.conversation_token import is_account_key
from app.services.visitor_payload import visitor_message
from app.services.widget_reply import CONTINUED_CONTEXT_KEY

PAGE_SIZE = 20
MESSAGES_PAGE = 50
SEARCH_SESSIONS = 200
SEARCH_MIN, SEARCH_MAX = 2, 80
TITLE_MAX = 60
SNIPPET_MAX = 120
DEFAULT_TITLE = 'Conversation'


def _as_uuid(value: Any) -> Optional[UUID]:
    try:
        return value if isinstance(value, UUID) else UUID(str(value))
    except (TypeError, ValueError):
        return None


def own_sessions(db: Session, socket_session: dict) -> Optional[Query]:
    """The socket visitor's widget conversations with this agent, or None when the
    socket has no usable identity or scope (fail closed). The dashboard's own
    support chat (an account-key scope) has no history here."""
    scope = socket_session.get('conversation_scope')
    customer_id = _as_uuid(socket_session.get('customer_id'))
    agent_id = _as_uuid(socket_session.get('agent_id'))
    org_id = _as_uuid(socket_session.get('org_id'))
    if not scope or is_account_key(scope) or not customer_id or not agent_id or not org_id:
        return None
    return SessionToAgentRepository(db).widget_sessions(customer_id, scope, agent_id, org_id)


def own_session(db: Session, socket_session: dict, session_id: Any) -> Optional[SessionToAgent]:
    """One of the visitor's own conversations, or None (another's looks like none)."""
    wanted = _as_uuid(session_id)
    query = own_sessions(db, socket_session)
    if wanted is None or query is None:
        return None
    return query.filter(SessionToAgent.session_id == wanted).first()


# ---- Cursors: opaque to the widget, keyset underneath (never an offset) ----

def _encode_cursor(at: datetime, key: Any) -> str:
    return base64.urlsafe_b64encode(json.dumps([at.isoformat(), str(key)]).encode()).decode()


def _decode_cursor(cursor: Any) -> Optional[Tuple[datetime, str]]:
    if not isinstance(cursor, str) or not cursor or len(cursor) > 200:
        return None
    try:
        at, key = json.loads(base64.urlsafe_b64decode(cursor.encode()))
        return datetime.fromisoformat(at), str(key)
    except (ValueError, TypeError):
        return None


# ---- Titles and snippets ----

def _shorten(text: Optional[str], limit: int) -> str:
    flat = ' '.join(str(text or '').split())
    return flat if len(flat) <= limit else flat[:limit - 1].rstrip() + '…'


def _first_and_last(db: Session, session_ids: List[UUID]) -> Dict[UUID, Tuple[Optional[ChatHistory], Optional[ChatHistory]]]:
    """Each conversation's first visitor message (its title) and its latest message."""
    if not session_ids:
        return {}
    first_rank = func.row_number().over(partition_by=ChatHistory.session_id,
                                        order_by=(ChatHistory.created_at.asc(), ChatHistory.id.asc()))
    last_rank = func.row_number().over(partition_by=ChatHistory.session_id,
                                       order_by=(ChatHistory.created_at.desc(), ChatHistory.id.desc()))
    first_ids = db.query(ChatHistory.id.label('id'), first_rank.label('rank')).filter(
        ChatHistory.session_id.in_(session_ids), ChatHistory.message_type == 'user').subquery()
    last_ids = db.query(ChatHistory.id.label('id'), last_rank.label('rank')).filter(
        ChatHistory.session_id.in_(session_ids)).subquery()
    wanted = [row.id for row in db.query(first_ids.c.id).filter(first_ids.c.rank == 1)]
    wanted += [row.id for row in db.query(last_ids.c.id).filter(last_ids.c.rank == 1)]
    rows = {row.id: row for row in db.query(ChatHistory).filter(ChatHistory.id.in_(wanted))}
    found: Dict[UUID, list] = {sid: [None, None] for sid in session_ids}
    for row in rows.values():
        pair = found[row.session_id]
        if row.message_type == 'user' and (pair[0] is None or (row.created_at, row.id) < (pair[0].created_at, pair[0].id)):
            pair[0] = row
        if pair[1] is None or (row.created_at, row.id) > (pair[1].created_at, pair[1].id):
            pair[1] = row
    return {sid: (pair[0], pair[1]) for sid, pair in found.items()}


def _item(conversation: SessionToAgent, last_at: datetime, first: Optional[ChatHistory],
          last: Optional[ChatHistory], current_id: Optional[UUID]) -> dict:
    person = conversation.user
    return {
        'id': str(conversation.session_id),
        'title': _shorten(first.message if first else None, TITLE_MAX) or DEFAULT_TITLE,
        'last_message': _shorten(last.message if last else None, SNIPPET_MAX),
        'last_from_visitor': bool(last and last.message_type == 'user'),
        'last_at': last_at.isoformat() if last_at else None,
        'open': conversation.status in ACTIVE_STATUSES,
        'current': conversation.session_id == current_id,
        'resolved_by': {'name': person.full_name, 'avatar_url': person.profile_pic} if person else None,
    }


def list_conversations(db: Session, socket_session: dict, cursor: Any = None) -> dict:
    """A page of the visitor's conversations that have messages, newest first."""
    base = own_sessions(db, socket_session)
    if base is None:
        return {'items': [], 'next_cursor': None, 'total': 0}
    latest = db.query(ChatHistory.session_id.label('session_id'),
                      func.max(ChatHistory.created_at).label('last_at')) \
        .group_by(ChatHistory.session_id).subquery()
    query = base.join(latest, latest.c.session_id == SessionToAgent.session_id) \
        .add_columns(latest.c.last_at).options(joinedload(SessionToAgent.user))
    total = query.count()
    after = _decode_cursor(cursor)
    if after is not None:
        at, key = after
        key_uuid = _as_uuid(key)
        query = query.filter((latest.c.last_at < at) | ((latest.c.last_at == at) & (SessionToAgent.session_id < key_uuid)))
    rows = query.order_by(latest.c.last_at.desc(), SessionToAgent.session_id.desc()).limit(PAGE_SIZE + 1).all()
    page, more = rows[:PAGE_SIZE], len(rows) > PAGE_SIZE
    ends = _first_and_last(db, [conversation.session_id for conversation, _ in page])
    current_id = _as_uuid(socket_session.get('session_id'))
    items = [_item(c, at, *ends.get(c.session_id, (None, None)), current_id) for c, at in page]
    next_cursor = _encode_cursor(page[-1][1], page[-1][0].session_id) if more and page else None
    return {'items': items, 'next_cursor': next_cursor, 'total': total}


def get_conversation(db: Session, socket_session: dict, session_id: Any, before: Any = None) -> Optional[dict]:
    """One of the visitor's conversations, read-only: its latest messages (older
    ones by cursor), visitor-safe. None when it is not theirs."""
    conversation = own_session(db, socket_session, session_id)
    if conversation is None:
        return None
    query = db.query(ChatHistory).options(joinedload(ChatHistory.user), joinedload(ChatHistory.agent),
                                          joinedload(ChatHistory.attachments)) \
        .filter(ChatHistory.session_id == conversation.session_id)
    after = _decode_cursor(before)
    if after is not None and after[1].isdigit():
        at, key = after[0], int(after[1])
        query = query.filter((ChatHistory.created_at < at) | ((ChatHistory.created_at == at) & (ChatHistory.id < key)))
    rows = query.order_by(ChatHistory.created_at.desc(), ChatHistory.id.desc()).limit(MESSAGES_PAGE + 1).all()
    page, more = rows[:MESSAGES_PAGE], len(rows) > MESSAGES_PAGE
    page.reverse()
    return {
        'id': str(conversation.session_id),
        'open': conversation.status in ACTIVE_STATUSES,
        'messages': [visitor_message(m) for m in page],
        'before': _encode_cursor(page[0].created_at, page[0].id) if more and page else None,
    }


def _snippet(text: str, at: int, length: int) -> str:
    start = max(0, at - 40)
    piece = text[start:start + SNIPPET_MAX]
    return ('…' if start else '') + ' '.join(piece.split()) + ('…' if start + SNIPPET_MAX < len(text) else '')


def search_conversations(db: Session, socket_session: dict, q: Any) -> dict:
    """The visitor's conversations whose title or messages contain `q` (case
    blind), newest first, with a snippet around the first hit. Only the newest
    SEARCH_SESSIONS conversations are searched; `capped` says when there were more."""
    text = ' '.join(str(q or '').split())
    base = own_sessions(db, socket_session)
    if base is None or not (SEARCH_MIN <= len(text) <= SEARCH_MAX):
        return {'items': [], 'capped': False}
    needle = text.casefold()
    latest = db.query(ChatHistory.session_id.label('session_id'),
                      func.max(ChatHistory.created_at).label('last_at')) \
        .group_by(ChatHistory.session_id).subquery()
    ranked = base.join(latest, latest.c.session_id == SessionToAgent.session_id) \
        .add_columns(latest.c.last_at).options(joinedload(SessionToAgent.user)) \
        .order_by(latest.c.last_at.desc(), SessionToAgent.session_id.desc())
    sessions = ranked.limit(SEARCH_SESSIONS + 1).all()
    capped = len(sessions) > SEARCH_SESSIONS
    sessions = sessions[:SEARCH_SESSIONS]
    by_id = {c.session_id: (c, at) for c, at in sessions}
    hits: Dict[UUID, str] = {}
    messages = db.query(ChatHistory).filter(ChatHistory.session_id.in_(list(by_id))) \
        .order_by(ChatHistory.created_at.asc(), ChatHistory.id.asc()).yield_per(500)
    for message in messages:
        if message.session_id in hits:
            continue
        body = str(message.message or '')
        at = body.casefold().find(needle)
        if at >= 0:
            hits[message.session_id] = _snippet(body, at, len(needle))
    current_id = _as_uuid(socket_session.get('session_id'))
    newest = [(c, at) for c, at in sessions if c.session_id in hits][:PAGE_SIZE]
    ends = _first_and_last(db, [c.session_id for c, _ in newest])
    items = []
    for conversation, at in newest:
        if conversation.session_id in hits:
            item = _item(conversation, at, *ends.get(conversation.session_id, (None, None)), current_id)
            items.append({**item, 'snippet': hits[conversation.session_id]})
    return {'items': items, 'capped': capped}


# ---- Continuing a past conversation in the current one ----

# Socket session key: the earlier conversation's context for the agent (widget_reply.py)
CONTINUED_KEY = CONTINUED_CONTEXT_KEY
CONTEXT_MESSAGES = 6
_SPEAKER = {'user': 'Customer', 'bot': 'You', 'assistant': 'You', 'agent': 'Teammate'}


def _context(title: str, messages: List[ChatHistory]) -> str:
    lines = [f"{_SPEAKER.get(m.message_type, 'Note')}: {_shorten(m.message, 400)}" for m in messages
             if m.message_type in _SPEAKER and m.message]
    return (f'The customer is continuing an earlier conversation, "{title}". Its last messages:\n'
            + '\n'.join(lines) + '\nPick up from there; do not repeat what was already said.')


def continue_conversation(db: Session, socket_session: dict, session_id: Any) -> Optional[dict]:
    """Carry one of the visitor's earlier conversations into the current one: the
    agent gets its last messages as context, and the current conversation gets a
    note saying where it continues from. None when it is not theirs, or is the
    current one."""
    earlier = own_session(db, socket_session, session_id)
    current_id = _as_uuid(socket_session.get('session_id'))
    current = own_session(db, socket_session, current_id) if current_id else None
    if earlier is None or current is None or earlier.session_id == current.session_id:
        return None
    first, _ = _first_and_last(db, [earlier.session_id]).get(earlier.session_id, (None, None))
    title = _shorten(first.message if first else None, TITLE_MAX) or DEFAULT_TITLE
    recent = db.query(ChatHistory).filter(ChatHistory.session_id == earlier.session_id) \
        .order_by(ChatHistory.created_at.desc(), ChatHistory.id.desc()).limit(CONTEXT_MESSAGES).all()
    db.add(ChatHistory(
        message=f'Continued from "{title}"', message_type='system', session_id=current.session_id,
        organization_id=current.organization_id, agent_id=current.agent_id, customer_id=current.customer_id,
        attributes={'source': 'system', 'continued_from': str(earlier.session_id)},
    ))
    db.commit()
    return {'title': title, 'context': _context(title, list(reversed(recent)))}

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

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from sqlalchemy import String, and_, cast, false, or_
from sqlalchemy.sql.elements import ColumnElement

from app.models.agent import Agent
from app.models.customer import Customer
from app.models.session_to_agent import SessionStatus, SessionToAgent

NEGATIVE_SENTIMENT = 'negative'


class InboxView(str, Enum):
    """The inbox's saved views. Each is one condition on a session (with its
    agent joined), shared by the list and its counts so a view's count is
    always the number of rows the view lists."""
    MINE = 'mine'
    WAITING = 'waiting'
    OPEN = 'open'
    AI = 'ai'
    RESOLVED_BY_AI = 'resolved_by_ai'
    CLOSED = 'closed'
    NEGATIVE = 'negative'


class InboxSort(str, Enum):
    NEWEST = 'newest'
    WAITING_LONGEST = 'waiting_longest'


def not_closed() -> ColumnElement:
    return SessionToAgent.status != SessionStatus.CLOSED


def waiting_for_human() -> ColumnElement:
    """Nobody holds it and no AI reply is coming: handed over, queued for a
    group, or the agent never answers with AI. Mirrors chatHandler() in the
    frontend's utils/chatState.ts."""
    return and_(
        SessionToAgent.user_id.is_(None),
        or_(
            SessionToAgent.status == SessionStatus.TRANSFERRED,
            SessionToAgent.group_id.isnot(None),
            Agent.ai_replies_enabled.is_(False),
        ),
    )


def ai_handling() -> ColumnElement:
    """The exact complement of waiting_for_human among unheld chats: the AI is
    answering. IS NOT FALSE keeps an agent row with no setting on the AI side,
    as the waiting test's IS FALSE leaves it."""
    return and_(
        SessionToAgent.user_id.is_(None),
        SessionToAgent.status == SessionStatus.OPEN,
        SessionToAgent.group_id.is_(None),
        Agent.ai_replies_enabled.isnot(False),
    )


def resolved_by_ai(since: datetime) -> ColumnElement:
    """Closed since `since` with no person ever involved: never handed over
    and never held. Sessions closed before closed_at existed have none and
    never match."""
    return and_(
        SessionToAgent.status == SessionStatus.CLOSED,
        SessionToAgent.closed_at >= since,
        SessionToAgent.user_id.is_(None),
        SessionToAgent.handed_over_at.is_(None),
    )


def negative_sentiment() -> ColumnElement:
    return SessionToAgent.sentiment_label == NEGATIVE_SENTIMENT


def mine(current_user_id: Optional[UUID]) -> ColumnElement:
    return SessionToAgent.user_id == current_user_id if current_user_id else false()


def view_clause(view: InboxView, current_user_id: Optional[UUID], today_start: datetime) -> ColumnElement:
    """The condition a session meets to be listed in `view`."""
    if view == InboxView.MINE:
        return and_(not_closed(), mine(current_user_id))
    if view == InboxView.WAITING:
        return and_(not_closed(), waiting_for_human())
    if view == InboxView.OPEN:
        return not_closed()
    if view == InboxView.AI:
        return and_(not_closed(), ai_handling())
    if view == InboxView.RESOLVED_BY_AI:
        return resolved_by_ai(today_start)
    if view == InboxView.CLOSED:
        return SessionToAgent.status == SessionStatus.CLOSED
    if view == InboxView.NEGATIVE:
        return and_(not_closed(), negative_sentiment())
    raise ValueError(f"Unknown inbox view: {view}")


def _like_pattern(term: str) -> str:
    """A substring pattern with the term's own LIKE wildcards taken literally."""
    escaped = term.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')
    return f'%{escaped}%'


def search_clause(term: str) -> ColumnElement:
    """Customer name, email, phone, or a value the site passed about them
    (custom_data: an order number, an account id) containing `term`.

    Messages and titles are encrypted at rest, so SQL cannot search them; the
    customer's contact fields and custom data are stored plain.
    """
    pattern = _like_pattern(term)
    return or_(
        Customer.full_name.ilike(pattern, escape='\\'),
        Customer.email.ilike(pattern, escape='\\'),
        Customer.phone.ilike(pattern, escape='\\'),
        cast(Customer.meta_data, String).ilike(pattern, escape='\\'),
    )

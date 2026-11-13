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

A visitor's thumbs up or down on one AI reply, stored on the reply's own row
as attributes.visitor_feedback. The visitor may only rate replies in the
conversation their socket belongs to.
"""

from typing import Any, Optional

from sqlalchemy.orm import Session

from app.models.chat_history import ChatHistory
from app.repositories.session_to_agent import SessionToAgentRepository

FEEDBACK_KEY = 'visitor_feedback'
FEEDBACK_VALUES = frozenset({'up', 'down'})


def valid_feedback(message_id: Any, value: Any) -> bool:
    """A row id and 'up', 'down' or None (taking the thumb back)."""
    id_ok = isinstance(message_id, int) and not isinstance(message_id, bool) and message_id > 0
    return id_ok and (value is None or value in FEEDBACK_VALUES)


def save_visitor_feedback(db: Session, session: dict, message_id: int, value: Optional[str]) -> bool:
    """Store the visitor's thumb on an AI reply of their own conversation.
    False when the conversation or the reply is not theirs."""
    conversation = SessionToAgentRepository(db).get_widget_session(
        session.get('session_id'), session.get('customer_id'),
        session.get('conversation_scope'), active_only=False)
    if conversation is None:
        return False
    row = (db.query(ChatHistory)
           .filter(ChatHistory.id == message_id,
                   ChatHistory.session_id == conversation.session_id,
                   ChatHistory.message_type == 'bot')
           .first())
    if row is None:
        return False
    attributes = dict(row.attributes or {}) if isinstance(row.attributes, dict) else {}
    if value is None:
        attributes.pop(FEEDBACK_KEY, None)
    else:
        attributes[FEEDBACK_KEY] = value
    row.attributes = attributes
    db.commit()
    return True

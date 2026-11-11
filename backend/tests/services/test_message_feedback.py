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

A visitor's thumbs on an AI reply: stored on their own conversation's replies only.
"""

from uuid import UUID, uuid4

import pytest

from app.models.chat_history import ChatHistory
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services.message_feedback import FEEDBACK_KEY, save_visitor_feedback, valid_feedback

SCOPE = "browser-key-1"


def _conversation(db, widget, customer, scope=SCOPE):
    session_id = str(uuid4())
    SessionToAgentRepository(db).create_session(
        session_id=session_id, agent_id=widget.agent_id, customer_id=customer.id,
        organization_id=widget.organization_id, conversation_key=scope)
    return session_id


def _message(db, widget, customer, session_id, message_type="bot", attributes=None):
    row = ChatHistory(message="Hello", message_type=message_type, session_id=UUID(session_id),
                      organization_id=widget.organization_id, agent_id=widget.agent_id,
                      customer_id=customer.id, attributes=attributes or {"sources": []})
    db.add(row)
    db.commit()
    return row


def _socket(widget, customer, session_id, scope=SCOPE):
    return {"session_id": session_id, "customer_id": str(customer.id), "conversation_scope": scope,
            "widget_id": str(widget.id), "org_id": str(widget.organization_id)}


@pytest.mark.parametrize("message_id,value,ok", [
    (5, "up", True), (5, "down", True), (5, None, True),
    (5, "meh", False), ("5", "up", False), (0, "up", False), (True, "up", False), (None, "up", False),
])
def test_valid_feedback(message_id, value, ok):
    assert valid_feedback(message_id, value) is ok


class TestSaveVisitorFeedback:
    def test_a_thumb_is_stored_on_the_reply(self, db, test_widget, test_customer):
        session_id = _conversation(db, test_widget, test_customer)
        reply = _message(db, test_widget, test_customer, session_id)
        assert save_visitor_feedback(db, _socket(test_widget, test_customer, session_id), reply.id, "up")
        db.refresh(reply)
        assert reply.attributes == {"sources": [], FEEDBACK_KEY: "up"}

    def test_taking_the_thumb_back_clears_it(self, db, test_widget, test_customer):
        session_id = _conversation(db, test_widget, test_customer)
        reply = _message(db, test_widget, test_customer, session_id, attributes={FEEDBACK_KEY: "down"})
        assert save_visitor_feedback(db, _socket(test_widget, test_customer, session_id), reply.id, None)
        db.refresh(reply)
        assert FEEDBACK_KEY not in reply.attributes

    def test_another_conversations_reply_is_refused(self, db, test_widget, test_customer):
        mine = _conversation(db, test_widget, test_customer)
        theirs = _conversation(db, test_widget, test_customer)
        reply = _message(db, test_widget, test_customer, theirs)
        assert not save_visitor_feedback(db, _socket(test_widget, test_customer, mine), reply.id, "up")
        db.refresh(reply)
        assert FEEDBACK_KEY not in reply.attributes

    def test_a_conversation_outside_the_tokens_scope_is_refused(self, db, test_widget, test_customer):
        session_id = _conversation(db, test_widget, test_customer, scope="another-browser")
        reply = _message(db, test_widget, test_customer, session_id)
        assert not save_visitor_feedback(db, _socket(test_widget, test_customer, session_id), reply.id, "up")

    def test_the_visitors_own_message_cannot_be_rated(self, db, test_widget, test_customer):
        session_id = _conversation(db, test_widget, test_customer)
        own = _message(db, test_widget, test_customer, session_id, message_type="user")
        assert not save_visitor_feedback(db, _socket(test_widget, test_customer, session_id), own.id, "up")

    def test_an_unknown_message_is_refused(self, db, test_widget, test_customer):
        session_id = _conversation(db, test_widget, test_customer)
        assert not save_visitor_feedback(db, _socket(test_widget, test_customer, session_id), 987654, "up")

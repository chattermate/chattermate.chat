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


A visitor's own past conversations: only theirs, under their token's scope,
paged without duplicates, searched and continued.
"""

from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

import pytest

from app.models.chat_history import ChatHistory
from app.models.customer import Customer
from app.models.session_to_agent import SessionToAgent
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services import visitor_history as history

SCOPE = "browser-key-1"
START = datetime(2026, 1, 1, tzinfo=timezone.utc)


def _conversation(db, widget, customer, messages=("Where is my parcel?",), scope=SCOPE, at=0, agent_id=None):
    session_id = uuid4()
    SessionToAgentRepository(db).create_session(
        session_id=str(session_id), agent_id=agent_id or widget.agent_id, customer_id=customer.id,
        organization_id=widget.organization_id, conversation_key=scope)
    for i, text in enumerate(messages):
        db.add(ChatHistory(message=text, message_type="user" if i % 2 == 0 else "bot", session_id=session_id,
                           organization_id=widget.organization_id, agent_id=agent_id or widget.agent_id,
                           customer_id=customer.id, attributes={"transfer_description": "internal note"},
                           created_at=START + timedelta(minutes=at, seconds=i)))
    db.commit()
    return session_id


def _socket(widget, customer, current=None, scope=SCOPE):
    return {"customer_id": str(customer.id), "agent_id": str(widget.agent_id), "org_id": str(widget.organization_id),
            "conversation_scope": scope, "session_id": str(current) if current else None}


def _other_customer(db, widget):
    other = Customer(id=uuid4(), organization_id=widget.organization_id, email="someone@example.com")
    db.add(other)
    db.commit()
    return other


class TestListing:
    def test_lists_own_conversations_newest_first_with_title_and_snippet(self, db, test_widget, test_customer):
        old = _conversation(db, test_widget, test_customer, ("My order is late", "Sorry to hear that!"), at=0)
        new = _conversation(db, test_widget, test_customer, ("Do you ship to Canada?", "Yes, we do."), at=10)
        page = history.list_conversations(db, _socket(test_widget, test_customer, current=new))
        assert [i["id"] for i in page["items"]] == [str(new), str(old)]
        first = page["items"][0]
        assert first["title"] == "Do you ship to Canada?" and first["last_message"] == "Yes, we do."
        assert first["current"] is True and page["items"][1]["current"] is False
        assert page["total"] == 2

    def test_a_conversation_without_messages_is_not_listed(self, db, test_widget, test_customer):
        _conversation(db, test_widget, test_customer, messages=())
        assert history.list_conversations(db, _socket(test_widget, test_customer))["items"] == []

    @pytest.mark.parametrize("whose", ["another visitor", "another browser", "another agent"])
    def test_nobody_elses_conversations(self, db, test_widget, test_customer, test_agent, whose):
        other = _other_customer(db, test_widget)
        if whose == "another visitor":
            _conversation(db, test_widget, other)
        elif whose == "another browser":
            _conversation(db, test_widget, test_customer, scope="browser-key-2")
        else:
            from app.models.agent import Agent
            agent = Agent(id=uuid4(), name="Other", organization_id=test_widget.organization_id,
                          agent_type="customer_support", instructions=["x"])
            db.add(agent)
            db.commit()
            _conversation(db, test_widget, test_customer, agent_id=agent.id)
        assert history.list_conversations(db, _socket(test_widget, test_customer))["items"] == []

    @pytest.mark.parametrize("scope", [None, "", "account:42"])
    def test_no_scope_or_the_dashboards_support_chat_sees_nothing(self, db, test_widget, test_customer, scope):
        _conversation(db, test_widget, test_customer, scope=None)
        socket = {**_socket(test_widget, test_customer), "conversation_scope": scope}
        assert history.list_conversations(db, socket) == {
            "items": [], "next_cursor": None, "total": 0, "other_browsers": {"email": None, "offer": False}}

    def test_pages_through_everything_without_duplicates(self, db, test_widget, test_customer):
        made = {str(_conversation(db, test_widget, test_customer, at=i)) for i in range(45)}
        socket = _socket(test_widget, test_customer)
        seen, cursor, pages = [], None, 0
        while True:
            page = history.list_conversations(db, socket, cursor)
            pages += 1
            seen += [i["id"] for i in page["items"]]
            cursor = page["next_cursor"]
            if not cursor:
                break
        assert pages == 3 and len(seen) == 45 and set(seen) == made

    @pytest.mark.parametrize("cursor", ["junk", 42, "e30=", "x" * 500])
    def test_a_bad_cursor_starts_from_the_top(self, db, test_widget, test_customer, cursor):
        _conversation(db, test_widget, test_customer)
        assert len(history.list_conversations(db, _socket(test_widget, test_customer), cursor)["items"]) == 1


class TestOpening:
    def test_opens_own_conversation_with_visitor_safe_attributes(self, db, test_widget, test_customer):
        sid = _conversation(db, test_widget, test_customer, ("Hi", "Hello!"))
        opened = history.get_conversation(db, _socket(test_widget, test_customer), str(sid))
        assert [m["message"] for m in opened["messages"]] == ["Hi", "Hello!"]
        assert all(m["attributes"] == {} for m in opened["messages"])

    def test_another_visitors_conversation_is_not_found(self, db, test_widget, test_customer):
        sid = _conversation(db, test_widget, _other_customer(db, test_widget))
        assert history.get_conversation(db, _socket(test_widget, test_customer), str(sid)) is None
        assert history.get_conversation(db, _socket(test_widget, test_customer), "not-a-uuid") is None

    def test_a_long_conversation_loads_older_messages_by_cursor(self, db, test_widget, test_customer):
        sid = _conversation(db, test_widget, test_customer, tuple(f"m{i}" for i in range(70)))
        socket = _socket(test_widget, test_customer)
        latest = history.get_conversation(db, socket, str(sid))
        assert len(latest["messages"]) == 50 and latest["messages"][-1]["message"] == "m69"
        older = history.get_conversation(db, socket, str(sid), latest["before"])
        assert [m["message"] for m in older["messages"]] == [f"m{i}" for i in range(20)] and older["before"] is None


class TestSearch:
    def test_finds_own_conversations_with_a_snippet(self, db, test_widget, test_customer):
        _conversation(db, test_widget, test_customer, ("Hello", "We ship worldwide in 3 days."))
        _conversation(db, test_widget, _other_customer(db, test_widget), ("Do you ship worldwide?",))
        found = history.search_conversations(db, _socket(test_widget, test_customer), "WORLDWIDE")
        assert len(found["items"]) == 1 and "worldwide" in found["items"][0]["snippet"]

    @pytest.mark.parametrize("q", ["a", "", None, "x" * 81])
    def test_too_short_or_long_finds_nothing(self, db, test_widget, test_customer, q):
        _conversation(db, test_widget, test_customer, ("a" * 100,))
        assert history.search_conversations(db, _socket(test_widget, test_customer), q)["items"] == []

    def test_says_when_only_the_newest_were_searched(self, db, test_widget, test_customer, monkeypatch):
        monkeypatch.setattr(history, "SEARCH_SESSIONS", 3)
        for i in range(5):
            _conversation(db, test_widget, test_customer, ("needle here",), at=i)
        found = history.search_conversations(db, _socket(test_widget, test_customer), "needle")
        assert found["capped"] is True and len(found["items"]) == 3


class TestContinue:
    def test_continues_an_earlier_conversation_into_the_current_one(self, db, test_widget, test_customer):
        earlier = _conversation(db, test_widget, test_customer, ("Order 1042 is late", "Checking now."), at=0)
        current = _conversation(db, test_widget, test_customer, messages=(), at=10)
        continued = history.continue_conversation(db, _socket(test_widget, test_customer, current=current), str(earlier))
        assert continued["title"] == "Order 1042 is late"
        context = continued["context"]
        assert context["session_id"] == str(current)
        assert "UNTRUSTED EARLIER_CONVERSATION" in context["context"]
        assert "Customer: Order 1042 is late" in context["context"] and "You: Checking now." in context["context"]
        note = db.query(ChatHistory).filter(ChatHistory.session_id == current).one()
        assert note.message_type == "system" and note.message == 'Continued from "Order 1042 is late"'
        # Asking again adds no second note
        history.continue_conversation(db, _socket(test_widget, test_customer, current=current), str(earlier))
        assert db.query(ChatHistory).filter(ChatHistory.session_id == current).count() == 1

    def test_cannot_continue_another_visitors_or_the_current_conversation(self, db, test_widget, test_customer):
        current = _conversation(db, test_widget, test_customer, messages=())
        theirs = _conversation(db, test_widget, _other_customer(db, test_widget))
        socket = _socket(test_widget, test_customer, current=current)
        assert history.continue_conversation(db, socket, str(theirs)) is None
        assert history.continue_conversation(db, socket, str(current)) is None



class TestKeylessScope:
    def test_a_verified_visitor_sees_keyless_chats_only_from_after_keys_existed(self, db, test_widget, test_customer):
        recent = _conversation(db, test_widget, test_customer, scope=None)
        old = _conversation(db, test_widget, test_customer, scope=None)
        from app.models.session_to_agent import SessionToAgent
        db.query(SessionToAgent).filter(SessionToAgent.session_id == old).update(
            {"assigned_at": history.KEYS_INTRODUCED - timedelta(days=30)})
        db.commit()
        socket = _socket(test_widget, test_customer, scope="verified")
        assert [i["id"] for i in history.list_conversations(db, socket)["items"]] == [str(recent)]
        assert history.get_conversation(db, socket, str(old)) is None


class TestResolvedBy:
    def test_only_the_teammate_who_answered_a_finished_chat(self, db, test_widget, test_customer, test_user):
        sid = _conversation(db, test_widget, test_customer, ("Help",))
        db.add(ChatHistory(message="Sorted!", message_type="agent", session_id=sid, user_id=test_user.id,
                           organization_id=test_widget.organization_id, agent_id=test_widget.agent_id,
                           customer_id=test_customer.id, created_at=START + timedelta(minutes=5)))
        db.commit()
        socket = _socket(test_widget, test_customer)
        assert history.list_conversations(db, socket)["items"][0]["resolved_by"] is None  # still open
        SessionToAgentRepository(db).close_session(session_id=str(sid))
        item = history.list_conversations(db, socket)["items"][0]
        assert item["resolved_by"]["name"] == test_user.full_name


class TestOtherBrowsers:
    """After the visitor proves an email with a code, the chats where the same
    email was proved, from any browser; never chats where it was only typed."""

    EMAIL = "jane@acme.com"

    @pytest.fixture(autouse=True)
    def _keys_old_enough(self, monkeypatch):
        monkeypatch.setattr(history, "KEYS_INTRODUCED", START - timedelta(days=1))

    def _prove(self, monkeypatch, email=EMAIL):
        monkeypatch.setattr(history.email_check, "verified_email", lambda session_id, customer_id=None: email)

    def _phone(self, db, widget, email=EMAIL, text="Chat from my phone"):
        """A chat in another browser (another customer row, another token scope)."""
        phone = _other_customer(db, widget)
        session_id = _conversation(db, widget, phone, (text,), scope="phone-key", at=5)
        if email:
            history.link_proven_email(db, _socket(widget, phone, current=session_id, scope="phone-key"), email)
        return session_id

    def test_a_proven_email_shows_the_other_browsers_chats(self, db, test_widget, test_customer, monkeypatch):
        mine = _conversation(db, test_widget, test_customer)
        phone = self._phone(db, test_widget)
        self._prove(monkeypatch)
        page = history.list_conversations(db, _socket(test_widget, test_customer))
        assert {i["id"] for i in page["items"]} == {str(mine), str(phone)}
        assert page["other_browsers"] == {"email": "j•••@acme.com", "offer": False}
        opened = history.get_conversation(db, _socket(test_widget, test_customer), str(phone))
        assert opened["messages"][0]["message"] == "Chat from my phone"
        found = history.search_conversations(db, _socket(test_widget, test_customer), "phone")["items"]
        assert [i["id"] for i in found] == [str(phone)]

    def test_without_the_proof_they_stay_hidden(self, db, test_widget, test_customer, monkeypatch):
        self._phone(db, test_widget)
        monkeypatch.setattr(history.email_check, "verified_email", lambda *a, **k: None)
        monkeypatch.setattr(history.email_check, "available", lambda: True)
        page = history.list_conversations(db, _socket(test_widget, test_customer))
        assert page["items"] == [] and page["other_browsers"] == {"email": None, "offer": True}

    @pytest.mark.parametrize("phone_email", [None, "someone.else@acme.com"])
    def test_a_chat_never_proved_or_proved_by_another_email(self, db, test_widget, test_customer, monkeypatch, phone_email):
        self._phone(db, test_widget, email=phone_email)
        self._prove(monkeypatch)
        assert history.list_conversations(db, _socket(test_widget, test_customer))["items"] == []

    def test_a_typed_email_is_not_a_proof(self, db, test_widget, test_customer, monkeypatch):
        """A customer whose email field holds the address, but who never proved it."""
        other = Customer(id=uuid4(), organization_id=test_widget.organization_id, email=self.EMAIL)
        db.add(other)
        db.commit()
        _conversation(db, test_widget, other, scope="typed-key")
        self._prove(monkeypatch)
        assert history.list_conversations(db, _socket(test_widget, test_customer))["items"] == []

    def test_only_this_agents_chats(self, db, test_widget, test_customer, monkeypatch):
        from app.models.agent import Agent
        agent = Agent(id=uuid4(), name="Other", organization_id=test_widget.organization_id,
                      agent_type="customer_support", instructions=["x"])
        db.add(agent)
        db.commit()
        phone = _other_customer(db, test_widget)
        chat = _conversation(db, test_widget, phone, scope="phone-key", agent_id=agent.id)
        socket = {**_socket(test_widget, phone, current=chat, scope="phone-key"), "agent_id": str(agent.id)}
        history.link_proven_email(db, socket, self.EMAIL)
        self._prove(monkeypatch)
        assert history.list_conversations(db, _socket(test_widget, test_customer))["items"] == []

    def test_linking_takes_only_the_chat_where_it_was_proved_and_keeps_an_earlier_email(
            self, db, test_widget, test_customer):
        """On a shared computer this browser's earlier chats may be someone else's."""
        earlier = _conversation(db, test_widget, test_customer, at=3)
        current = _conversation(db, test_widget, test_customer, at=6)
        socket = _socket(test_widget, test_customer, current=current)
        assert history.link_proven_email(db, socket, "first@acme.com") == 1
        assert history.link_proven_email(db, socket, "second@acme.com") == 0
        rows = {r.session_id: r.verified_email_key for r in db.query(SessionToAgent)}
        assert rows[current] == history.email_check.email_key("first@acme.com", test_widget.organization_id)
        assert rows[earlier] is None

    def test_another_visitors_chat_is_never_linked(self, db, test_widget, test_customer):
        someone = _conversation(db, test_widget, _other_customer(db, test_widget))
        socket = _socket(test_widget, test_customer, current=someone)
        assert history.link_proven_email(db, socket, self.EMAIL) == 0
        assert db.get(SessionToAgent, someone).verified_email_key is None

    def test_a_keyless_chat_from_before_conversation_keys_is_never_linked(self, db, test_widget, test_customer,
                                                                         monkeypatch):
        monkeypatch.setattr(history, "KEYS_INTRODUCED", START + timedelta(days=1))
        old = _conversation(db, test_widget, test_customer, scope=None)
        db.query(SessionToAgent).filter(SessionToAgent.session_id == old).update(
            {SessionToAgent.assigned_at: START}, synchronize_session=False)
        db.commit()
        socket = {**_socket(test_widget, test_customer, current=old), "conversation_scope": "verified"}
        assert history.link_proven_email(db, socket, self.EMAIL) == 0

    def test_the_stored_key_is_not_the_email_and_differs_by_organization(self, db, test_widget, test_customer):
        org = test_widget.organization_id
        key = history.email_check.email_key(" Jane@Acme.com ", org)
        assert key == history.email_check.email_key("jane@acme.com", org)
        assert key != history.email_check.email_key("jane@acme.com", uuid4())
        assert "jane" not in key and len(key) == 64

    def test_once_the_proof_is_gone_so_are_they(self, db, test_widget, test_customer, monkeypatch):
        phone = self._phone(db, test_widget)
        self._prove(monkeypatch)
        socket = _socket(test_widget, test_customer)
        assert [i["id"] for i in history.list_conversations(db, socket)["items"]] == [str(phone)]
        monkeypatch.setattr(history.email_check, "verified_email", lambda *a, **k: None)
        assert history.list_conversations(db, socket)["items"] == []
        assert history.get_conversation(db, socket, str(phone)) is None

    def test_the_proof_is_read_for_this_conversation_and_customer(self, db, test_widget, test_customer, monkeypatch):
        asked = {}

        def verified_email(session_id, customer_id=None):
            asked["args"] = (session_id, customer_id)
            return None

        monkeypatch.setattr(history.email_check, "verified_email", verified_email)
        history.list_conversations(db, _socket(test_widget, test_customer, current="c-1"))
        assert asked["args"] == ("c-1", str(test_customer.id))

    def test_the_dashboards_support_chat_never_links(self, db, test_widget, test_customer):
        _conversation(db, test_widget, test_customer, scope=None)
        socket = {**_socket(test_widget, test_customer), "conversation_scope": "account:42"}
        assert history.link_proven_email(db, socket, self.EMAIL) == 0

    def test_continuing_a_chat_from_the_other_browser(self, db, test_widget, test_customer, monkeypatch):
        current = _conversation(db, test_widget, test_customer, at=20)
        phone = self._phone(db, test_widget)
        self._prove(monkeypatch)
        result = history.continue_conversation(db, _socket(test_widget, test_customer, current=current), str(phone))
        assert result["title"] == "Chat from my phone"


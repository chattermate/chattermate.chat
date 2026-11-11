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

Customer-identity capture on native ticket creation: the email/name the
customer states in chat must be validated, folded onto the (usually anonymous)
customer, and surfaced to the investigator — the …@noemail.com placeholder must
never be presented as a real identity.
"""

from contextlib import nullcontext
from types import SimpleNamespace
from unittest.mock import patch
from uuid import uuid4

import json

import pytest

from app.models.customer import Customer
from app.models.session_to_agent import SessionStatus, SessionToAgent
from app.models.ticket import Ticket
from app.tools.ticket_toolkit import TicketTools, _clean_email, _clean_name


class TestCleanEmail:
    def test_normalizes_and_lowercases(self):
        assert _clean_email("  Admin@ChatterMate.Chat ") == "admin@chattermate.chat"

    def test_rejects_junk(self):
        for bad in (None, "", "not-an-email", "no@domain", "@no-local.com", "a b@c.com"):
            assert _clean_email(bad) is None


class TestCleanName:
    def test_trims(self):
        assert _clean_name("  Arun  ") == "Arun"

    def test_empty_is_none(self):
        assert _clean_name(None) is None
        assert _clean_name("   ") is None


class TestCustomerIdentitySection:
    """The worker's trusted identity block fed to the investigator."""

    def _section(self, **customer_fields):
        from app.workers.ticket_investigator import _customer_identity_section

        fields = {"full_name": None, "email": None, "phone": None, "meta_data": None}
        fields.update(customer_fields)
        customer = SimpleNamespace(**fields)
        ticket = SimpleNamespace(customer=customer)
        return _customer_identity_section(ticket)

    def test_none_without_customer(self):
        from app.workers.ticket_investigator import _customer_identity_section

        assert _customer_identity_section(SimpleNamespace(customer=None)) is None

    def test_real_identity_included(self):
        section = self._section(
            full_name="Arun Kumar", email="admin@chattermate.chat", phone="+441234567890"
        )
        assert section is not None
        assert "admin@chattermate.chat" in section
        assert "Arun Kumar" in section
        assert "+441234567890" in section

    def test_placeholder_email_omitted(self):
        # Anonymous widget visitor with no real identity -> no section at all.
        assert self._section(email="1784547346351@noemail.com") is None

    def test_placeholder_email_but_real_name_keeps_name_only(self):
        section = self._section(
            full_name="Arun", email="1784547346351@noemail.com"
        )
        assert section is not None
        assert "Arun" in section
        assert "noemail.com" not in section

    def test_meta_data_identifiers_included(self):
        section = self._section(
            full_name="Arun", meta_data={"account_id": "acc_991", "plan": "pro"}
        )
        assert "acc_991" in section



@pytest.fixture
def ticket_tools_db(db):
    """TicketTools opens its own SessionLocal; hand it the test database."""
    with patch("app.tools.ticket_toolkit.SessionLocal", return_value=nullcontext(db)), \
         patch("app.services.ticket.embed_ticket_text", return_value=None):
        yield db


class TestCreateTicketIdentity:
    """A ticket only carries the identity of a customer the conversation belongs to:
    a visitor bound to a customer by an email they typed must not hand the
    investigator that customer's records."""

    def _conversation(self, db, org_id, agent_id, session_key, customer_key, email=None, name=None):
        customer = Customer(email=email or f"{uuid4().hex}@noemail.com", full_name=name,
                            organization_id=org_id, conversation_key=customer_key)
        db.add(customer); db.commit(); db.refresh(customer)
        session = SessionToAgent(session_id=uuid4(), customer_id=customer.id, agent_id=agent_id,
                                 organization_id=org_id, status=SessionStatus.OPEN,
                                 conversation_key=session_key)
        db.add(session); db.commit()
        return customer, session

    def _create(self, db, org_id, agent_id, session, **identity) -> Ticket:
        TicketTools(str(agent_id), str(org_id), str(session.session_id)).create_ticket(
            summary="Login fails", description="Every attempt errors.", **identity)
        return db.query(Ticket).filter(Ticket.organization_id == org_id).order_by(Ticket.created_at.desc()).first()

    def test_the_customers_own_conversation_names_them(self, ticket_tools_db, test_organization_id, test_agent):
        db = ticket_tools_db
        customer, session = self._conversation(db, test_organization_id, test_agent.id, "browser-a", "browser-a")

        ticket = self._create(db, test_organization_id, test_agent.id, session, customer_name="Own Name")

        db.refresh(customer)
        assert ticket.customer_id == customer.id
        assert customer.full_name == "Own Name"

    def test_a_claimed_customer_is_left_off_the_ticket(self, ticket_tools_db, test_organization_id, test_agent):
        db = ticket_tools_db
        victim, session = self._conversation(db, test_organization_id, test_agent.id, "browser-b", "browser-a",
                                             email="victim@acme.com", name="Victim")

        ticket = self._create(db, test_organization_id, test_agent.id, session,
                              customer_email="victim@acme.com", customer_name="Someone Else")

        db.refresh(victim)
        assert ticket.customer_id is None
        assert victim.full_name == "Victim"

    def test_a_typed_email_never_resolves_to_another_customer(self, ticket_tools_db, test_organization_id, test_agent):
        db = ticket_tools_db
        other = Customer(email="other@acme.com", organization_id=test_organization_id)
        db.add(other); db.commit()
        _, session = self._conversation(db, test_organization_id, test_agent.id, "browser-b", "browser-a")

        ticket = self._create(db, test_organization_id, test_agent.id, session, customer_email="other@acme.com")

        assert ticket.customer_id is None



class TestTicketCards:
    """The redesign's ticket card: for this conversation's own ticket only."""

    def _session(self, db, org_id, agent_id):
        customer = Customer(email=f"{uuid4().hex}@example.com", organization_id=org_id, conversation_key="k")
        db.add(customer); db.commit(); db.refresh(customer)
        session = SessionToAgent(session_id=uuid4(), customer_id=customer.id, agent_id=agent_id,
                                 organization_id=org_id, status=SessionStatus.OPEN, conversation_key="k")
        db.add(session); db.commit()
        return session

    def _tools(self, org_id, agent_id, session):
        from app.cards.turn_cards import TurnCards
        tools = TicketTools(str(agent_id), str(org_id), str(session.session_id))
        tools.turn_cards = TurnCards()
        return tools

    def test_creating_a_ticket_shows_its_card(self, ticket_tools_db, test_organization_id, test_agent):
        session = self._session(ticket_tools_db, test_organization_id, test_agent.id)
        tools = self._tools(test_organization_id, test_agent.id, session)
        tools.create_ticket(summary="Login fails", description="Every attempt errors.")
        [card] = tools.turn_cards.payload()
        assert card["kind"] == "ticket" and card["status"]["label"] in ("Received", "Looking into it")
        assert "Login fails" not in repr(card)

    def test_another_conversations_ticket_shows_no_card(self, ticket_tools_db, test_organization_id, test_agent):
        db = ticket_tools_db
        theirs = self._session(db, test_organization_id, test_agent.id)
        mine = self._session(db, test_organization_id, test_agent.id)
        TicketTools(str(test_agent.id), str(test_organization_id), str(theirs.session_id)).create_ticket(
            summary="Their problem", description="Private.")
        from app.repositories.ticket import TicketRepository
        number = TicketRepository(db).get_by_session(theirs.session_id).display_number
        tools = self._tools(test_organization_id, test_agent.id, mine)
        result = json.loads(tools.get_ticket_status(number))
        assert result["exists"] is True and tools.turn_cards.payload() == []

    def test_asking_after_its_own_ticket_shows_the_card(self, ticket_tools_db, test_organization_id, test_agent):
        session = self._session(ticket_tools_db, test_organization_id, test_agent.id)
        TicketTools(str(test_agent.id), str(test_organization_id), str(session.session_id)).create_ticket(
            summary="Login fails", description="Every attempt errors.")
        tools = self._tools(test_organization_id, test_agent.id, session)
        tools.get_ticket_status()
        assert [c["kind"] for c in tools.turn_cards.payload()] == ["ticket"]

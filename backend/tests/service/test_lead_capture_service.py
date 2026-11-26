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

import pytest
from uuid import uuid4

from app.models.customer import Customer, LeadStage
from app.models.session_to_agent import SessionStatus, SessionToAgent
from app.services.conversation_token import VERIFIED_SCOPE
from app.models.lead_capture import LeadCaptureConfig, LeadCaptureResponse
from app.services.lead_capture import (
    has_captured_lead, record_lead_capture, _valid_email,
)


@pytest.fixture
def config(db, test_agent):
    """A lead-capture config with the standard fields enabled + consent required."""
    cfg = LeadCaptureConfig(
        agent_id=test_agent.id,
        enabled=True,
        require_consent=True,
        fields=[
            {"key": "email", "standard": True, "enabled": True, "required": True},
            {"key": "name", "standard": True, "enabled": True, "required": False},
            {"key": "company", "standard": True, "enabled": True, "required": False},
        ],
    )
    db.add(cfg)
    db.commit()
    db.refresh(cfg)
    return cfg


def _anon(db, org_id, email=None):
    c = Customer(email=email or f"{uuid4().hex}@noemail.com", organization_id=org_id)
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


def test_valid_email():
    assert _valid_email("jane@acme.com")
    assert not _valid_email("arun.com")
    assert not _valid_email("")
    assert not _valid_email(None)
    assert not _valid_email("no-at-sign")


def test_has_captured_lead(db, test_agent, test_organization_id, config):
    customer = _anon(db, test_organization_id)
    assert has_captured_lead(db, customer.id, test_agent.id) is False
    record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=customer.id, session_id=None,
        lead_data={"email": "jane@acme.com"}, summary="s", consent=True,
        scope=VERIFIED_SCOPE,
    )
    assert has_captured_lead(db, customer.id, test_agent.id) is True


def test_no_capture_when_disabled(db, test_agent, test_organization_id, config):
    config.enabled = False
    db.commit()
    customer = _anon(db, test_organization_id)
    resp = record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=customer.id, session_id=None,
        lead_data={"email": "jane@acme.com"}, summary="s", consent=True,
        scope=VERIFIED_SCOPE,
    )
    assert resp is None
    assert has_captured_lead(db, customer.id, test_agent.id) is False


def test_no_capture_for_authenticated_customer(db, test_agent, test_organization_id, config):
    # Integration-authenticated customer (identified via generate-token) — never a lead.
    authed = Customer(email="portal@acme.com", organization_id=test_organization_id,
                      is_authenticated=True,
                      meta_data={"student_name": "Sam", "center_name": "MMCA"})
    db.add(authed); db.commit(); db.refresh(authed)
    resp = record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=authed.id, session_id=None,
        lead_data={"email": "portal@acme.com"}, summary="s", consent=True,
        scope=VERIFIED_SCOPE,
    )
    assert resp is None
    assert has_captured_lead(db, authed.id, test_agent.id) is False


def test_capture_for_customer_with_meta_data_but_not_authenticated(db, test_agent, test_organization_id, config):
    # meta_data present but not authenticated (e.g. UTM data on an organic visitor) —
    # must still be captured as a lead (regression: meta_data alone must not block).
    from app.models.customer import Customer as _Customer
    visitor = _Customer(email="anon@acme.com", organization_id=test_organization_id,
                        meta_data={"utm": "google"})
    db.add(visitor); db.commit(); db.refresh(visitor)
    resp = record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=visitor.id, session_id=None,
        lead_data={"email": "lead@acme.com"}, summary="s", consent=True,
        scope=VERIFIED_SCOPE,
    )
    assert resp is not None
    assert has_captured_lead(db, resp.customer_id, test_agent.id) is True


def test_record_requires_valid_email(db, test_agent, test_organization_id, config):
    customer = _anon(db, test_organization_id)
    resp = record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=customer.id, session_id=None,
        lead_data={"email": "not-an-email"}, summary=None, consent=True,
        scope=VERIFIED_SCOPE,
    )
    assert resp is None


def test_record_requires_consent_when_configured(db, test_agent, test_organization_id, config):
    customer = _anon(db, test_organization_id)
    resp = record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=customer.id, session_id=None,
        lead_data={"email": "jane@acme.com"}, summary=None, consent=False,
        scope=VERIFIED_SCOPE,
    )
    assert resp is None


def test_record_happy_path_promotes_and_stores(db, test_agent, test_organization_id, config):
    customer = _anon(db, test_organization_id)
    resp = record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=customer.id, session_id=None,
        lead_data={"email": "jane@acme.com", "name": "Jane", "company": "Acme"},
        summary="Interested in a demo", consent=True, page_url="https://x.com/pricing",
        scope=VERIFIED_SCOPE,
    )
    assert resp is not None
    assert resp.field_values["email"] == "jane@acme.com"
    assert resp.qualified is True
    db.refresh(customer)
    assert customer.lead_stage == LeadStage.LEAD
    assert customer.lead_qualified_at is not None
    assert (customer.lead_source or {}).get("page_url") == "https://x.com/pricing"


def test_record_filters_unconfigured_fields(db, test_agent, test_organization_id, config):
    customer = _anon(db, test_organization_id)
    resp = record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=customer.id, session_id=None,
        lead_data={"email": "jane@acme.com", "ssn": "leak"}, summary=None, consent=True,
        scope=VERIFIED_SCOPE,
    )
    assert resp is not None
    assert "ssn" not in (resp.field_values or {})


def test_record_no_consent_required(db, test_agent, test_organization_id):
    cfg = LeadCaptureConfig(
        agent_id=test_agent.id, enabled=True, require_consent=False,
        fields=[{"key": "email", "standard": True, "enabled": True, "required": True}],
    )
    db.add(cfg); db.commit(); db.refresh(cfg)
    customer = _anon(db, test_organization_id)
    resp = record_lead_capture(
        db, cfg, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=customer.id, session_id=None,
        lead_data={"email": "bob@corp.com"}, summary=None, consent=False,
        scope=VERIFIED_SCOPE,
    )
    assert resp is not None  # consent not required → records anyway


def test_record_merges_into_existing_customer(db, test_agent, test_organization_id, config):
    """A visitor giving an email that already belongs to another customer merges."""
    existing = Customer(email="dupe@acme.com", organization_id=test_organization_id,
                        full_name="Existing")
    db.add(existing); db.commit(); db.refresh(existing)
    anon = _anon(db, test_organization_id)

    resp = record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=anon.id, session_id=None,
        lead_data={"email": "dupe@acme.com"}, summary=None, consent=True,
        scope=VERIFIED_SCOPE,
    )
    assert resp is not None
    assert resp.customer_id == existing.id  # lead attached to the existing customer
    db.refresh(anon)
    assert anon.merged_into_customer_id == existing.id
    assert anon.is_active is False


def test_merge_moves_phone_to_the_survivor(db, test_agent, test_organization_id, config):
    """Identifiers union on merge — and the phone MOVES rather than copies,
    because two rows holding one phone would violate the (org, phone) unique
    index at commit."""
    from app.repositories.customer import CustomerRepository
    from app.services.lead_capture import record_lead_capture

    repo = CustomerRepository(db)
    identified = repo.create_customer(
        email="priya@example.com", organization_id=test_organization_id,
        full_name="Priya")
    anonymous = repo.create_customer(
        email="911234567890@whatsapp.channel", organization_id=test_organization_id,
        phone="+911234567890")

    # The WhatsApp person tells the AI an email that already belongs to Priya.
    record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=anonymous.id, session_id=None,
        lead_data={"email": "priya@example.com"}, summary=None, consent=True,
        scope=VERIFIED_SCOPE,)

    db.refresh(identified)
    db.refresh(anonymous)
    assert anonymous.merged_into_customer_id == identified.id
    assert identified.phone == "+911234567890"   # carried to the survivor
    assert anonymous.phone is None               # moved, not copied


def test_merge_never_leaves_a_live_number_on_the_tombstone(
        db, test_agent, test_organization_id, config):
    """The branch the move test doesn't reach: when BOTH rows have a phone
    there is nowhere to move the source's to. It must still be cleared —
    a merged row is invisible in People, but phone lookup is the first thing
    every inbound WhatsApp message does, so a number left on it would capture
    that conversation onto a row nobody can see or edit."""
    from app.repositories.customer import CustomerRepository
    from app.services.lead_capture import record_lead_capture

    repo = CustomerRepository(db)
    identified = repo.create_customer(
        email="priya@example.com", organization_id=test_organization_id,
        full_name="Priya", phone="+447700900111")     # work mobile
    anonymous = repo.create_customer(
        email="911234567890@whatsapp.channel", organization_id=test_organization_id,
        phone="+911234567890")                        # personal mobile

    record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=anonymous.id, session_id=None,
        lead_data={"email": "priya@example.com"}, summary=None, consent=True,
        scope=VERIFIED_SCOPE,)

    db.refresh(identified)
    db.refresh(anonymous)
    assert anonymous.merged_into_customer_id == identified.id
    assert identified.phone == "+447700900111"   # survivor keeps theirs
    assert anonymous.phone is None               # dropped, not left live
    # And the dropped number resolves to nobody, rather than to a tombstone.
    assert repo.get_customer_by_phone("+911234567890", test_organization_id) is None


# --- a widget visitor may only merge or edit a customer its own browser created ---

def _session(db, customer, org_id, key):
    db.add(SessionToAgent(session_id=uuid4(), customer_id=customer.id, organization_id=org_id,
                          status=SessionStatus.OPEN, conversation_key=key))
    db.commit()


def _visitor(db, org_id, key):
    """An anonymous customer the widget created for the browser holding `key`."""
    c = Customer(email=f"{uuid4().hex}@noemail.com", organization_id=org_id, conversation_key=key)
    db.add(c); db.commit(); db.refresh(c)
    _session(db, c, org_id, key)
    return c


def test_a_widget_visitor_becomes_a_lead_on_their_own_row(db, test_agent, test_organization_id, config):
    visitor = _visitor(db, test_organization_id, "browser-a")

    resp = record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=visitor.id, session_id=None,
        lead_data={"email": "new@acme.com", "name": "New"}, summary=None, consent=True,
        scope="browser-a",
    )

    assert resp.customer_id == visitor.id
    db.refresh(visitor)
    assert visitor.email == "new@acme.com" and visitor.full_name == "New"
    assert visitor.lead_stage == LeadStage.LEAD


def test_a_widget_visitor_is_not_merged_into_a_customer_who_already_existed(
    db, test_agent, test_organization_id, config
):
    """A typed email is no proof of being that customer, and a merge would hand
    the visitor's name and phone to the real one."""
    existing = Customer(email="known@acme.com", organization_id=test_organization_id)
    db.add(existing); db.commit(); db.refresh(existing)
    visitor = _visitor(db, test_organization_id, "browser-a")

    resp = record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=visitor.id, session_id=None,
        lead_data={"email": "known@acme.com", "name": "Visitor"}, summary=None, consent=True,
        scope="browser-a",
    )

    assert resp.customer_id == visitor.id
    db.refresh(visitor); db.refresh(existing)
    assert visitor.merged_into_customer_id is None
    assert existing.full_name is None


def test_a_claimed_customer_is_not_merged_away(db, test_agent, test_organization_id, config):
    """Bound to a known customer by a typed email, a visitor gives their own
    address: merging would move the real customer's conversations to them."""
    victim = Customer(email="victim@acme.com", full_name="Victim", organization_id=test_organization_id)
    attacker = Customer(email="attacker@evil.com", organization_id=test_organization_id)
    db.add_all([victim, attacker]); db.commit(); db.refresh(victim); db.refresh(attacker)
    _session(db, victim, test_organization_id, "attacker-browser")

    resp = record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=victim.id, session_id=None,
        lead_data={"email": "attacker@evil.com", "name": "Attacker"}, summary=None, consent=True,
        scope="attacker-browser",
    )

    assert resp is None
    assert has_captured_lead(db, victim.id, test_agent.id) is False  # the real customer is still asked
    db.refresh(victim)
    assert victim.merged_into_customer_id is None
    assert victim.full_name == "Victim"
    assert victim.lead_stage != LeadStage.LEAD


def test_a_customer_with_no_conversations_is_not_owned_by_whoever_arrives(
    db, test_agent, test_organization_id, config
):
    """A ticket or an import creates customers with no conversations; the first
    browser to claim one must not get to rename it."""
    known = Customer(email="ticket@acme.com", full_name="Ticket Person", organization_id=test_organization_id)
    db.add(known); db.commit(); db.refresh(known)

    record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=known.id, session_id=None,
        lead_data={"email": "ticket@acme.com", "name": "Someone Else"}, summary=None, consent=True,
        scope="browser-a",
    )

    db.refresh(known)
    assert known.full_name == "Ticket Person"


def test_a_visitor_without_a_scope_changes_nothing(db, test_agent, test_organization_id, config):
    anon = _anon(db, test_organization_id)

    resp = record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=anon.id, session_id=None,
        lead_data={"email": "someone@acme.com", "name": "Someone"}, summary=None, consent=True,
        scope=None,
    )

    assert resp is None
    db.refresh(anon)
    assert anon.full_name is None
    assert anon.email.endswith("@noemail.com")


def _channel_customer(db, org_id, name="Line user U56cf1f8"):
    c = Customer(email=f"U{uuid4().hex}@line.channel", full_name=name, organization_id=org_id)
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


def test_a_lead_names_a_placeholder_channel_customer(db, test_agent, test_organization_id, config):
    customer = _channel_customer(db, test_organization_id)
    record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=customer.id, session_id=None,
        lead_data={"email": "somchai@example.com", "name": "Somchai P"}, summary="s", consent=True,
        scope=VERIFIED_SCOPE,
    )
    db.refresh(customer)
    assert customer.full_name == "Somchai P"


def test_a_lead_never_renames_a_customer_who_has_a_real_name(db, test_agent, test_organization_id, config):
    customer = _channel_customer(db, test_organization_id, name="Somchai Prasert")
    record_lead_capture(
        db, config, organization_id=test_organization_id, agent_id=test_agent.id,
        customer_id=customer.id, session_id=None,
        lead_data={"email": "somchai@example.com", "name": "Som"}, summary="s", consent=True,
        scope=VERIFIED_SCOPE,
    )
    db.refresh(customer)
    assert customer.full_name == "Somchai Prasert"


class TestNameWithoutALead:
    """The customer gave a name but no email yet: no lead, but the contact
    stops being 'Line user U56c…'."""

    def name(self, db, config, customer, **kw):
        from app.services.lead_capture import name_customer_from_lead
        kw.setdefault("consent", True)
        kw.setdefault("scope", VERIFIED_SCOPE)
        result = name_customer_from_lead(db, config, customer.id, "Somchai P", **kw)
        db.refresh(customer)
        return result

    def test_fills_a_placeholder(self, db, test_organization_id, config):
        customer = _channel_customer(db, test_organization_id)
        assert self.name(db, config, customer) is True
        assert customer.full_name == "Somchai P"

    def test_keeps_a_real_name(self, db, test_organization_id, config):
        customer = _channel_customer(db, test_organization_id, name="Somchai Prasert")
        assert self.name(db, config, customer) is False
        assert customer.full_name == "Somchai Prasert"

    def test_needs_consent_where_the_agent_requires_it(self, db, test_organization_id, config):
        customer = _channel_customer(db, test_organization_id)
        assert self.name(db, config, customer, consent=False) is False
        assert customer.full_name == "Line user U56cf1f8"

    def test_not_for_a_visitor_without_a_scope(self, db, test_organization_id, config):
        customer = _channel_customer(db, test_organization_id)
        assert self.name(db, config, customer, scope=None) is False
        assert customer.full_name == "Line user U56cf1f8"

    def test_not_for_an_authenticated_customer(self, db, test_organization_id, config):
        customer = _channel_customer(db, test_organization_id)
        customer.is_authenticated = True
        db.commit()
        assert self.name(db, config, customer) is False

    def test_runs_when_the_response_records_no_lead(self, db, test_agent, test_organization_id, config,
                                                   monkeypatch):
        """The wiring: request_lead_capture with a name and no email names the customer."""
        from types import SimpleNamespace
        from app.services import lead_capture
        monkeypatch.setattr(lead_capture, "plan_feature_on", lambda *a: True)
        customer = _channel_customer(db, test_organization_id)
        response = SimpleNamespace(request_lead_capture=True, lead_name="Somchai P", lead_consent=True)
        assert lead_capture.record_lead_from_response(
            db, response, test_organization_id, test_agent.id, customer.id, None,
            channel="line", scope=VERIFIED_SCOPE) is None
        db.refresh(customer)
        assert customer.full_name == "Somchai P"

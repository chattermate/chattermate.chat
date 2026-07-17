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
from app.models.lead_capture import LeadCaptureResponse
from app.models.chat_history import ChatHistory
from app.repositories.people import PeopleRepository


@pytest.fixture
def repo(db):
    return PeopleRepository(db)


def _customer(db, org_id, chatted=True, **kw):
    """Create a customer. By default also adds a chat message so it counts as
    'engaged' (People only shows people who actually chatted). Pass chatted=False
    to simulate an empty widget-load."""
    c = Customer(email=kw.pop("email", f"{uuid4().hex}@noemail.com"),
                 organization_id=org_id, **kw)
    db.add(c); db.commit(); db.refresh(c)
    if chatted:
        db.add(ChatHistory(organization_id=org_id, customer_id=c.id,
                           message="hi", message_type="user"))
        db.commit()
    return c


def _response(db, org_id, customer_id, agent_id, field_values):
    r = LeadCaptureResponse(
        organization_id=org_id, agent_id=agent_id, customer_id=customer_id,
        field_values=field_values, summary="qualified", consent=True, qualified=True,
    )
    db.add(r); db.commit(); db.refresh(r)
    return r


def test_list_and_stats(repo, db, test_organization_id, test_agent):
    lead = _customer(db, test_organization_id, email="lead@acme.com",
                     full_name="Lead One", lead_stage=LeadStage.LEAD)
    _response(db, test_organization_id, lead.id, test_agent.id, {"email": "lead@acme.com"})
    _customer(db, test_organization_id)  # anonymous visitor

    # Identity split: the default view holds identified people only; the
    # anonymous browser session lives behind view="anonymous".
    items, total = repo.list_people(test_organization_id)
    assert total == 1
    assert items[0]["email"] == "lead@acme.com"

    anon_items, anon_total = repo.list_people(test_organization_id, view="anonymous")
    assert anon_total == 1
    assert anon_items[0]["is_anonymous"] is True

    # stage filter
    leads, lead_total = repo.list_people(test_organization_id, stage="lead")
    assert lead_total == 1
    assert leads[0]["qualified"] is True

    # search
    found, found_total = repo.list_people(test_organization_id, search="Lead One")
    assert found_total == 1

    stats = repo.get_stats(test_organization_id)
    assert stats["total_people"] == 1
    assert stats["anonymous"] == 1


def test_anonymous_falls_back_to_captured_email(repo, db, test_organization_id, test_agent):
    """A captured lead whose email couldn't be written to the customer row still
    shows the captured email (not 'anonymous')."""
    anon = _customer(db, test_organization_id, lead_stage=LeadStage.LEAD)
    _response(db, test_organization_id, anon.id, test_agent.id, {"email": "hidden@acme.com"})
    items, _ = repo.list_people(test_organization_id, stage="lead")
    row = next(i for i in items if i["id"] == anon.id)
    assert row["email"] == "hidden@acme.com"
    assert row["is_anonymous"] is False


def test_get_detail_and_mark_customer(repo, db, test_organization_id, test_agent):
    person = _customer(db, test_organization_id, email="d@acme.com",
                       full_name="Detail", lead_stage=LeadStage.LEAD)
    _response(db, test_organization_id, person.id, test_agent.id,
              {"email": "d@acme.com", "company": "Acme"})

    detail = repo.get_detail(test_organization_id, person.id)
    assert detail is not None
    assert detail["email"] == "d@acme.com"
    assert detail["captured_attributes"].get("company") == "Acme"
    assert detail["summary"] == "qualified"

    updated = repo.mark_customer(test_organization_id, person.id)
    assert updated.lead_stage == LeadStage.CUSTOMER


def test_get_detail_missing_returns_none(repo, test_organization_id):
    assert repo.get_detail(test_organization_id, uuid4()) is None


def test_unengaged_widget_loads_excluded(repo, db, test_organization_id):
    """A customer that never chatted (empty widget-load) is excluded from People."""
    _customer(db, test_organization_id, email="chatted@acme.com", chatted=True,
              lead_stage=LeadStage.LEAD)
    _customer(db, test_organization_id, chatted=False)  # loaded widget, never messaged

    items, total = repo.list_people(test_organization_id)
    assert total == 1
    assert items[0]["email"] == "chatted@acme.com"
    assert repo.get_stats(test_organization_id)["total_people"] == 1


def test_authenticated_customers_excluded(repo, db, test_organization_id):
    """Integration-authenticated people (identified via generate-token) are the
    business's existing customers, not leads — excluded from People + stats.

    Having meta_data must NOT by itself exclude a customer: meta_data is orthogonal
    to authentication (and is stored as JSON null when empty, so the old
    `meta_data IS NULL` test hid every organic visitor)."""
    # Organic lead that happens to carry meta_data (e.g. UTM) — must still show.
    _customer(db, test_organization_id, email="organic@acme.com",
              full_name="Organic", lead_stage=LeadStage.LEAD,
              meta_data={"utm": "google"})
    # Integration-authenticated customer — excluded.
    _customer(db, test_organization_id, email="portal@acme.com", full_name="Portal User",
              is_authenticated=True,
              meta_data={"student_name": "Sam", "center_name": "MMCA"})

    items, total = repo.list_people(test_organization_id)
    emails = {i["email"] for i in items}
    assert "organic@acme.com" in emails      # meta_data alone no longer excludes
    assert "portal@acme.com" not in emails   # authenticated flag excludes
    assert total == 1

    stats = repo.get_stats(test_organization_id)
    assert stats["total_people"] == 1  # the authenticated customer is not counted


def test_merged_rows_hidden_and_resolved(repo, db, test_organization_id):
    target = _customer(db, test_organization_id, email="t@acme.com", full_name="Target",
                       lead_stage=LeadStage.LEAD)
    merged = _customer(db, test_organization_id, lead_stage=LeadStage.LEAD)
    merged.merged_into_customer_id = target.id
    db.commit()

    # Merged row is excluded from the list.
    items, total = repo.list_people(test_organization_id)
    ids = {i["id"] for i in items}
    assert merged.id not in ids
    assert target.id in ids

    # Requesting the merged row resolves to the surviving target.
    detail = repo.get_detail(test_organization_id, merged.id)
    assert detail["id"] == target.id


def test_phone_identifies_and_is_searchable(repo, db, test_organization_id):
    """A phone alone identifies a person (WhatsApp/SMS contacts have no real
    email), and decorated search terms match on digits."""
    person = _customer(db, test_organization_id,
                       email="916366602824@whatsapp.channel",
                       full_name="Whatsapp user 91636660", phone="+916366602824")

    items, total = repo.list_people(test_organization_id)
    assert total == 1 and items[0]["id"] == person.id
    assert items[0]["phone"] == "+916366602824"

    for term in ["+91 63666 02824", "9163666", "63666 02824"]:
        _, found = repo.list_people(test_organization_id, search=term)
        assert found == 1, term

    # A non-numeric search must not explode on the phone clause
    _, none_found = repo.list_people(test_organization_id, search="nobody")
    assert none_found == 0


def test_update_person_edits_and_guards(repo, db, test_organization_id):
    person = _customer(db, test_organization_id)
    other = _customer(db, test_organization_id, phone="+15550001111")

    # Set + correct (overwrite is allowed here — it's the explicit human path)
    updated, error = repo.update_person(test_organization_id, person.id,
                                        full_name="Priya", phone="+91 63666 02824")
    assert error is None
    assert updated.full_name == "Priya" and updated.phone == "+916366602824"

    updated, error = repo.update_person(test_organization_id, person.id, phone="+919999999999")
    assert error is None and updated.phone == "+919999999999"

    # Someone else's number is refused, not reassigned
    _, error = repo.update_person(test_organization_id, person.id, phone="+15550001111")
    assert "another person" in error
    db.refresh(person)
    assert person.phone == "+919999999999"

    # National-format digits are refused, not guessed at
    _, error = repo.update_person(test_organization_id, person.id, phone="6366602824")
    assert "international format" in error

    # Clearing via empty string
    updated, error = repo.update_person(test_organization_id, person.id, phone="")
    assert error is None and updated.phone is None

    missing, _ = repo.update_person(test_organization_id, uuid4(), full_name="x")
    assert missing is None


def test_mark_customer_is_gated_on_identity(repo, db, test_organization_id):
    anon = _customer(db, test_organization_id)
    assert repo.is_identified(anon) is False
    # Identify via phone → the gate opens
    repo.update_person(test_organization_id, anon.id, phone="+916366602824")
    db.refresh(anon)
    assert repo.is_identified(anon) is True

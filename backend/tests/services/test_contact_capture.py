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

Handoff contact capture: which fields the form asks for, and what happens to an
address the customer row is not allowed to take.
"""

import pytest

from app.models.customer import Customer
from app.repositories.customer import CustomerRepository
from app.services.contact_capture import (
    CONTACT_EMAIL_META_KEY,
    build_handoff_contact_form,
    retain_unstored_email,
)


def _anon(db, org_id, email="1786455337798@noemail.com"):
    c = Customer(organization_id=org_id, email=email)
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


# ---------- which fields the form asks for ----------

@pytest.mark.parametrize("email,name,expected", [
    (None, None, ["email", "name"]),                       # nothing known
    ("abc@noemail.com", None, ["email", "name"]),          # anonymous placeholder
    ("123@telegram.channel", None, ["email", "name"]),     # synthesized channel key
    ("abc@noemail.com", "Arun", ["email"]),                # name already known
    ("real@acme.com", None, ["name"]),                     # address already known
])
def test_form_asks_only_for_what_is_missing(email, name, expected):
    from types import SimpleNamespace
    form = build_handoff_contact_form(
        SimpleNamespace(email=email, full_name=name), collect_email=True, collect_name=True
    )
    assert [f["name"] for f in form["fields"]] == expected


def test_no_form_when_nothing_is_missing():
    from types import SimpleNamespace
    assert build_handoff_contact_form(
        SimpleNamespace(email="real@acme.com", full_name="Arun"), True, True
    ) is None


def test_no_form_when_both_toggles_are_off():
    from types import SimpleNamespace
    assert build_handoff_contact_form(
        SimpleNamespace(email=None, full_name=None), collect_email=False, collect_name=False
    ) is None


# ---------- an address the customer row cannot take ----------

def test_email_owned_by_another_customer_is_kept_on_meta_data(db, test_organization):
    """The reported bug. A returning anonymous visitor (or a shared team inbox)
    submits an address another customer in the org already owns; update_contact
    refuses it for the unique constraint, and it used to be dropped on the floor
    — the visitor asked to be contacted and nothing recorded how."""
    _anon(db, test_organization.id, email="taken@acme.com")
    visitor = _anon(db, test_organization.id)
    repo = CustomerRepository(db)

    result = repo.update_contact(visitor.id, email="taken@acme.com", full_name=None)
    assert result["email_updated"] is False          # constraint held, as designed

    assert retain_unstored_email(repo, visitor.id, "taken@acme.com", result) is True

    db.refresh(visitor)
    assert visitor.meta_data[CONTACT_EMAIL_META_KEY] == "taken@acme.com"


def test_name_only_submission_still_retains_the_dropped_email(db, test_organization):
    """Submitting a name too made the panel visibly change, which is what made
    this look name-dependent — the email was being lost either way."""
    _anon(db, test_organization.id, email="taken2@acme.com")
    visitor = _anon(db, test_organization.id)
    repo = CustomerRepository(db)

    result = repo.update_contact(visitor.id, email="taken2@acme.com", full_name="Runix")
    assert result["email_updated"] is False
    assert result["name_updated"] is True

    assert retain_unstored_email(repo, visitor.id, "taken2@acme.com", result) is True
    db.refresh(visitor)
    assert visitor.full_name == "Runix"
    assert visitor.meta_data[CONTACT_EMAIL_META_KEY] == "taken2@acme.com"


def test_a_normal_capture_writes_no_metadata(db, test_organization):
    """The address landed on the customer, so there is nothing to retain and the
    panel shouldn't grow a duplicate line."""
    visitor = _anon(db, test_organization.id)
    repo = CustomerRepository(db)

    result = repo.update_contact(visitor.id, email="fresh@acme.com", full_name=None)
    assert result["email_updated"] is True

    assert retain_unstored_email(repo, visitor.id, "fresh@acme.com", result) is False
    db.refresh(visitor)
    assert not (visitor.meta_data or {}).get(CONTACT_EMAIL_META_KEY)


def test_resubmitting_the_address_already_on_file_is_a_no_op(db, test_organization):
    visitor = _anon(db, test_organization.id, email="mine@acme.com")
    repo = CustomerRepository(db)

    result = repo.update_contact(visitor.id, email="mine@acme.com", full_name=None)

    assert retain_unstored_email(repo, visitor.id, "mine@acme.com", result) is False
    db.refresh(visitor)
    assert not (visitor.meta_data or {}).get(CONTACT_EMAIL_META_KEY)


def test_retaining_preserves_existing_meta_data(db, test_organization):
    """Integrator-supplied custom_data must survive — update_meta_data merges."""
    _anon(db, test_organization.id, email="taken3@acme.com")
    visitor = _anon(db, test_organization.id)
    visitor.meta_data = {"student_name": "Priya"}
    db.commit()
    repo = CustomerRepository(db)

    result = repo.update_contact(visitor.id, email="taken3@acme.com", full_name=None)
    retain_unstored_email(repo, visitor.id, "taken3@acme.com", result)

    db.refresh(visitor)
    assert visitor.meta_data["student_name"] == "Priya"
    assert visitor.meta_data[CONTACT_EMAIL_META_KEY] == "taken3@acme.com"


# ---------- the offline message's form: email only ----------

@pytest.mark.asyncio
@pytest.mark.parametrize("offline, fields, title", [
    (True, {"email"}, "Leave your email"),
    (False, {"email", "name"}, "Before we connect you to a teammate"),
])
async def test_the_offline_form_asks_only_for_the_email(db, test_organization, test_agent, offline, fields, title):
    """After the offline message: just the email, in its own words, whatever the
    handoff settings say; a handoff asks for what they say."""
    from unittest.mock import AsyncMock, patch
    from app.services import widget_reply

    test_agent.handoff_collect_email = False
    test_agent.handoff_collect_name = True
    if not offline:
        test_agent.handoff_collect_email = True
    db.commit()
    customer = _anon(db, test_organization.id)
    session = {"session_id": "s1", "agent_id": test_agent.id, "customer_id": customer.id}

    with patch.object(widget_reply, "sio") as sio:
        sio.emit = AsyncMock()
        await widget_reply.send_handoff_contact_form(session, db, offline=offline)
    form = sio.emit.await_args.args[1]["form_data"]
    assert {field["name"] for field in form["fields"]} == fields
    assert form["title"] == title

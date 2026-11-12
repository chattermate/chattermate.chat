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

import uuid

from app.models.customer import Customer
from app.models.lead_capture import LeadCaptureResponse
from app.models.organization import Organization
from app.models.ticket import Ticket
from app.services import customer_erasure
from tests.erasure_footprint import remaining, seed_footprint


def _other_org(db):
    org = Organization(name="Other", domain="other.com", timezone="UTC")
    db.add(org)
    db.commit()
    return org


class TestFindCustomerIds:
    def test_email_matches_case_insensitively(self, db, test_organization, test_agent):
        fp = seed_footprint(db, test_organization.id, test_agent.id, email="Ada@Example.com")

        found = customer_erasure.find_customer_ids(db, test_organization.id, " ada@example.COM ", None)

        assert found == [fp.customer_id]

    def test_phone_matches_in_canonical_form(self, db, test_organization, test_agent):
        fp = seed_footprint(db, test_organization.id, test_agent.id,
                            email="anon-1@visitor.invalid", phone="+447700900123")

        found = customer_erasure.find_customer_ids(db, test_organization.id, None, "+44 7700 900-123")

        assert found == [fp.customer_id]

    def test_nothing_to_match_on_finds_nobody(self, db, test_organization, test_agent):
        """An empty email must never turn into 'every customer'."""
        seed_footprint(db, test_organization.id, test_agent.id, email="ada@example.com")

        assert customer_erasure.find_customer_ids(db, test_organization.id, "", None) == []
        assert customer_erasure.find_customer_ids(db, test_organization.id, None, "not a phone") == []
        assert customer_erasure.find_customer_ids(db, test_organization.id, "   ", "") == []

    def test_another_organizations_customer_is_not_found(self, db, test_organization, test_agent):
        other = _other_org(db)
        seed_footprint(db, other.id, test_agent.id, email="ada@example.com")

        assert customer_erasure.find_customer_ids(db, test_organization.id, "ada@example.com", None) == []

    def test_records_merged_into_the_customer_are_the_same_person(self, db, test_organization, test_agent):
        fp = seed_footprint(db, test_organization.id, test_agent.id, email="ada@example.com")
        visitor = seed_footprint(db, test_organization.id, test_agent.id, email="anon-2@visitor.invalid")
        earlier = seed_footprint(db, test_organization.id, test_agent.id, email="anon-3@visitor.invalid")
        db.get(Customer, visitor.customer_id).merged_into_customer_id = fp.customer_id
        db.get(Customer, earlier.customer_id).merged_into_customer_id = visitor.customer_id
        db.commit()

        found = customer_erasure.find_customer_ids(db, test_organization.id, "ada@example.com", None)

        assert set(found) == {fp.customer_id, visitor.customer_id, earlier.customer_id}


class TestEraseCustomers:
    def test_every_record_of_the_customer_goes(self, db, test_organization, test_agent):
        fp = seed_footprint(db, test_organization.id, test_agent.id, email="ada@example.com")

        result = customer_erasure.erase_customers(db, [fp.customer_id])
        db.commit()

        assert remaining(db, fp) == {}
        assert result.attachment_urls == [fp.attachment_url]
        assert result.counts["chat_history"] == 2
        assert result.counts["customers"] == 1

    def test_other_customers_are_untouched(self, db, test_organization, test_agent):
        fp = seed_footprint(db, test_organization.id, test_agent.id, email="ada@example.com")
        bystander = seed_footprint(db, test_organization.id, test_agent.id, email="grace@example.com")
        before = remaining(db, bystander)

        customer_erasure.erase_customers(db, [fp.customer_id])
        db.commit()

        assert remaining(db, bystander) == before

    def test_merged_records_are_erased_together(self, db, test_organization, test_agent):
        fp = seed_footprint(db, test_organization.id, test_agent.id, email="ada@example.com")
        visitor = seed_footprint(db, test_organization.id, test_agent.id, email="anon@visitor.invalid")
        db.get(Customer, visitor.customer_id).merged_into_customer_id = fp.customer_id
        db.commit()

        ids = customer_erasure.find_customer_ids(db, test_organization.id, "ada@example.com", None)
        customer_erasure.erase_customers(db, ids)
        db.commit()

        assert remaining(db, fp) == {}
        assert remaining(db, visitor) == {}

    def test_a_ticket_folded_into_theirs_keeps_its_content(self, db, test_organization, test_agent):
        fp = seed_footprint(db, test_organization.id, test_agent.id, email="ada@example.com")
        other_ticket = Ticket(ticket_number=2, organization_id=test_organization.id,
                              title="Someone else's", duplicate_of_ticket_id=fp.ticket_id)
        db.add(other_ticket)
        db.commit()

        customer_erasure.erase_customers(db, [fp.customer_id])
        db.commit()

        kept = db.get(Ticket, other_ticket.id)
        assert kept.title == "Someone else's"
        assert kept.duplicate_of_ticket_id is None

    def test_a_second_pass_finds_nothing(self, db, test_organization, test_agent):
        fp = seed_footprint(db, test_organization.id, test_agent.id, email="ada@example.com")
        customer_erasure.erase_customers(db, [fp.customer_id])
        db.commit()

        again = customer_erasure.erase_customers(db, [fp.customer_id])

        assert again.counts == {}
        assert again.attachment_urls == []

    def test_a_record_merged_into_theirs_but_kept_loses_only_the_pointer(
            self, db, test_organization, test_agent):
        """shop/redact can erase a person's storefront record while a record
        merged into it stays; the self-reference must not block the delete."""
        fp = seed_footprint(db, test_organization.id, test_agent.id, email="ada@example.com")
        kept = seed_footprint(db, test_organization.id, test_agent.id, email="anon@visitor.invalid")
        db.get(Customer, kept.customer_id).merged_into_customer_id = fp.customer_id
        db.commit()

        customer_erasure.erase_customers(db, [fp.customer_id])
        db.commit()

        assert remaining(db, fp) == {}
        db.expire_all()
        assert db.get(Customer, kept.customer_id).merged_into_customer_id is None

    def test_large_erasures_run_in_batches(self, db, test_organization, test_agent, monkeypatch):
        monkeypatch.setattr(customer_erasure, "BATCH_SIZE", 2)
        footprints = [seed_footprint(db, test_organization.id, test_agent.id, email=f"p{i}@example.com")
                      for i in range(5)]

        result = customer_erasure.erase_customers(db, [fp.customer_id for fp in footprints])
        db.commit()

        assert all(remaining(db, fp) == {} for fp in footprints)
        assert result.counts["customers"] == 5
        assert result.counts["chat_history"] == 10
        assert len(result.attachment_urls) == 5

    def test_no_ids_is_a_no_op(self, db):
        assert customer_erasure.erase_customers(db, []).counts == {}
        assert customer_erasure.erase_sessions(db, []).counts == {}


class TestEraseSessions:
    def test_the_customer_and_their_lead_outlive_one_conversation(self, db, test_organization, test_agent):
        """shop/redact removes storefront conversations; the person is only
        erased once nothing else of theirs is left."""
        fp = seed_footprint(db, test_organization.id, test_agent.id, email="ada@example.com")

        customer_erasure.erase_sessions(db, fp.session_ids)
        db.commit()

        left = remaining(db, fp)
        assert "session_to_agents" not in left and "chat_history" not in left
        assert left["customers"] == 1
        lead = db.query(LeadCaptureResponse).filter_by(customer_id=fp.customer_id).one()
        assert lead.session_id is None

    def test_orphaned_customer_ids_lists_only_those_without_conversations(self, db, test_organization, test_agent):
        gone = seed_footprint(db, test_organization.id, test_agent.id, email="ada@example.com")
        stays = seed_footprint(db, test_organization.id, test_agent.id, email="grace@example.com")
        customer_erasure.erase_sessions(db, gone.session_ids)
        db.flush()

        orphans = customer_erasure.orphaned_customer_ids(db, [gone.customer_id, stays.customer_id])

        assert orphans == [gone.customer_id]
        assert customer_erasure.orphaned_customer_ids(db, []) == []

    def test_agno_transcripts_are_skipped_off_postgres(self, db):
        """agno's table only exists on Postgres; elsewhere there is nothing to do."""
        assert customer_erasure._delete_agno_sessions(db, [uuid.uuid4()]) == 0

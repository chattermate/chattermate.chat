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

from unittest.mock import patch
from uuid import uuid4

import pytest

from app.models.session_to_agent import SessionStatus, SessionToAgent
from app.models.ticket import (
    Ticket,
    TicketPriority,
    TicketSource,
    TicketStatus,
)
from app.models.ticket_activity import TicketActivity, TicketActivityType, TicketActorType
from app.services.ticket import NATIVE_INTEGRATION_TYPE, TicketService, render_customer_template


@pytest.fixture(autouse=True)
def no_embeddings():
    """Embeddings hit the local FastEmbed model — irrelevant to these tests."""
    with patch("app.services.ticket.embed_ticket_text", return_value=None):
        yield


@pytest.fixture
def service(db):
    return TicketService(db)


@pytest.fixture
def test_session(db, test_organization, test_customer, test_agent) -> SessionToAgent:
    session = SessionToAgent(
        session_id=uuid4(),
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        agent_id=test_agent.id,
        status=SessionStatus.OPEN,
        channel="web",
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def make_ticket(service, db, org, **overrides) -> Ticket:
    kwargs = dict(
        organization_id=org.id,
        title="Payout delayed for merchant #8842",
        description="Batch stuck in processing.",
        priority=TicketPriority.HIGH,
        source=TicketSource.MANUAL,
    )
    kwargs.update(overrides)
    ticket, _dupes = service.create_ticket(**kwargs)
    db.commit()
    db.refresh(ticket)
    return ticket


class TestTicketCreation:
    def test_numbers_are_sequential_per_org(self, service, db, test_organization):
        first = make_ticket(service, db, test_organization)
        second = make_ticket(service, db, test_organization)
        assert first.ticket_number == 1
        assert second.ticket_number == 2
        assert second.display_number == "TKT-2"

    def test_create_links_session_and_mirrors_columns(
        self, service, db, test_organization, test_session
    ):
        ticket = make_ticket(
            service, db, test_organization,
            session_id=test_session.session_id, source=TicketSource.CHAT_AI,
        )
        db.refresh(test_session)
        assert test_session.ticket_id == ticket.display_number
        assert test_session.integration_type == NATIVE_INTEGRATION_TYPE
        assert test_session.ticket_status == TicketStatus.OPEN.value
        assert service.repo.get_by_session(test_session.session_id).id == ticket.id
        # Customer/agent inherited from the session
        assert ticket.customer_id == test_session.customer_id
        assert ticket.agent_id == test_session.agent_id

    def test_create_enqueues_triage_run(self, service, db, test_organization):
        ticket = make_ticket(service, db, test_organization)
        runs = service.run_repo.list_for_ticket(ticket.id)
        assert len(runs) == 1
        assert runs[0].run_type == "triage"
        assert runs[0].status == "pending"

    def test_create_without_auto_investigate(self, service, db, test_organization):
        settings = service.settings_repo.get_or_create(test_organization.id)
        settings.auto_investigate_on_create = False
        db.commit()
        ticket = make_ticket(service, db, test_organization)
        assert service.run_repo.list_for_ticket(ticket.id) == []

    def test_creation_writes_audit_activity(self, service, db, test_organization):
        ticket = make_ticket(service, db, test_organization)
        activities = service.activity_repo.list_for_ticket(ticket.id)
        assert activities[0].activity_type == TicketActivityType.STATUS_CHANGE.value
        assert activities[0].activity_metadata["to"] == TicketStatus.OPEN.value


class TestOrgIsolation:
    def test_foreign_session_rejected(self, service, db, test_organization, test_session):
        """A session belonging to another org must not be linkable (it would
        mutate that org's session row and message its customer)."""
        from app.models.organization import Organization
        other_org = Organization(name="Other Org", domain="other.example", timezone="UTC")
        db.add(other_org)
        db.commit()
        with pytest.raises(ValueError, match="Session not found"):
            service.create_ticket(
                organization_id=other_org.id,
                title="Sneaky cross-org ticket",
                session_id=test_session.session_id,
            )

    def test_jira_linked_session_not_clobbered(
        self, service, db, test_organization, test_session
    ):
        """An explicit Jira linkage on the session survives native ticket
        creation — JiraTools reads ticket_id as a Jira issue key."""
        test_session.ticket_id = "SUP-123"
        test_session.integration_type = "JIRA"
        db.commit()
        make_ticket(
            service, db, test_organization, session_id=test_session.session_id
        )
        db.refresh(test_session)
        assert test_session.ticket_id == "SUP-123"
        assert test_session.integration_type == "JIRA"


class TestSearchEscaping:
    def test_literal_percent_does_not_wildcard(self, service, db, test_organization):
        make_ticket(service, db, test_organization, title="CPU at 100% on ingest")
        make_ticket(service, db, test_organization, title="Login broken")
        tickets, total = service.repo.list(test_organization.id, search="100% on")
        assert total == 1
        # A bare '%' must not match everything.
        _t, total_all = service.repo.list(test_organization.id, search="%")
        assert total_all == 1


class TestTriagePriorityValidation:
    def test_invalid_llm_priority_is_ignored(self, service, db, test_organization):
        from app.models.schemas.investigation import TriageResult
        from app.workers.ticket_investigator import _apply_triage
        ticket = make_ticket(service, db, test_organization)
        result = TriageResult(
            title=ticket.title, priority="P1-Critical", intent="bug_report",
            summary="something broke", confidence=0.9,
        )
        _apply_triage(service, ticket, result)
        assert str(ticket.priority) == "high"  # unchanged

    def test_valid_llm_priority_applies(self, service, db, test_organization):
        from app.models.schemas.investigation import TriageResult
        from app.workers.ticket_investigator import _apply_triage
        ticket = make_ticket(service, db, test_organization)
        result = TriageResult(
            title=ticket.title, priority="Urgent", intent="outage",
            summary="prod down", confidence=0.95,
        )
        _apply_triage(service, ticket, result)
        assert str(ticket.priority) == "urgent"


class TestStatusMachine:
    def test_legal_transition(self, service, db, test_organization):
        ticket = make_ticket(service, db, test_organization)
        service.transition_status(ticket, TicketStatus.IN_PROGRESS)
        assert ticket.status == TicketStatus.IN_PROGRESS

    def test_illegal_transition_raises(self, service, db, test_organization):
        ticket = make_ticket(service, db, test_organization)
        service.transition_status(ticket, TicketStatus.CLOSED)
        with pytest.raises(ValueError, match="Illegal status transition"):
            service.transition_status(ticket, TicketStatus.IN_PROGRESS)

    def test_resolved_sets_timestamps_and_actor(self, service, db, test_organization):
        ticket = make_ticket(service, db, test_organization)
        service.transition_status(ticket, TicketStatus.RESOLVED, actor_type=TicketActorType.AI)
        assert ticket.resolved_at is not None
        assert ticket.resolved_by_actor == "ai"

    def test_reopen_clears_resolution_state(self, service, db, test_organization):
        ticket = make_ticket(service, db, test_organization)
        service.transition_status(ticket, TicketStatus.RESOLVED)
        service.reopen(ticket, reason="Customer says still broken")
        assert ticket.status == TicketStatus.REOPENED
        assert ticket.resolved_at is None
        assert ticket.resolved_by_actor is None
        assert ticket.reopened_count == 1

    def test_transition_writes_audit_row(self, service, db, test_organization):
        ticket = make_ticket(service, db, test_organization)
        service.transition_status(ticket, TicketStatus.IN_PROGRESS)
        activities = service.activity_repo.list_for_ticket(ticket.id)
        last = activities[-1]
        assert last.activity_metadata == {
            "from": TicketStatus.OPEN.value,
            "to": TicketStatus.IN_PROGRESS.value,
        }


class TestComments:
    def test_customer_visible_comment_sets_first_response(self, service, db, test_organization):
        ticket = make_ticket(service, db, test_organization)
        assert ticket.first_response_at is None
        service.add_comment(ticket, "Looking into it", is_internal=False)
        assert ticket.first_response_at is not None

    def test_internal_note_does_not_set_first_response(self, service, db, test_organization):
        ticket = make_ticket(service, db, test_organization)
        service.add_comment(ticket, "internal note", is_internal=True)
        assert ticket.first_response_at is None


class TestAiState:
    def test_active_run_means_investigating(self, service, db, test_organization):
        ticket = make_ticket(service, db, test_organization)
        assert service.ai_state(ticket) == "investigating"

    def test_no_run_means_human(self, service, db, test_organization):
        settings = service.settings_repo.get_or_create(test_organization.id)
        settings.auto_investigate_on_create = False
        db.commit()
        ticket = make_ticket(service, db, test_organization)
        assert service.ai_state(ticket) == "human"

    def test_ai_resolution_means_resolved(self, service, db, test_organization):
        settings = service.settings_repo.get_or_create(test_organization.id)
        settings.auto_investigate_on_create = False
        db.commit()
        ticket = make_ticket(service, db, test_organization)
        service.transition_status(ticket, TicketStatus.RESOLVED, actor_type=TicketActorType.AI)
        assert service.ai_state(ticket) == "resolved"


class TestRunGuards:
    def test_only_one_active_run_per_ticket(self, service, db, test_organization):
        ticket = make_ticket(service, db, test_organization)
        # Auto-created triage run is still pending — a second enqueue is refused.
        assert service.enqueue_run(ticket) is None


class TestStats:
    def test_stats_counts(self, service, db, test_organization):
        make_ticket(service, db, test_organization)
        ticket = make_ticket(service, db, test_organization)
        service.transition_status(ticket, TicketStatus.AWAITING_APPROVAL)
        db.commit()
        stats = service.stats(test_organization.id)
        assert stats["open"] == 2
        assert stats["awaiting_approval"] == 1


class TestTemplates:
    def test_placeholders_render(self):
        rendered = render_customer_template("Hi [customer] — [ticket] is open.", "Ada", "TKT-7")
        assert rendered == "Hi Ada — TKT-7 is open."

    def test_missing_customer_name_falls_back(self):
        rendered = render_customer_template("Hi [customer]!", None, "TKT-7")
        assert rendered == "Hi there!"

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

Phase 4: autonomy L2/L3 (proposals, hard guards), alert parsing, Jira
escalation policy.
"""

from types import SimpleNamespace
from unittest.mock import patch
from uuid import uuid4

import pytest

from app.api.ticket_webhooks import _parse_alert
from app.models.investigation import ProposalStatus, TicketProposal
from app.models.ticket import Ticket, TicketPriority, TicketSource, TicketStatus
from app.models.ticket_activity import TicketActivity, TicketActivityType
from app.services.ticket import TicketService
from app.services.ticket_jira import should_escalate
from app.workers.ticket_investigator import _apply_autonomy


@pytest.fixture(autouse=True)
def no_embeddings():
    with patch("app.services.ticket.embed_ticket_text", return_value=None):
        yield


@pytest.fixture
def service(db):
    return TicketService(db)


@pytest.fixture
def ticket(db, service, test_organization):
    # No auto triage run — its pending row would trip the one-active-run
    # guard when tests re-enqueue investigations.
    settings_row = service.settings_repo.get_or_create(test_organization.id)
    settings_row.auto_investigate_on_create = False
    t, _ = service.create_ticket(
        organization_id=test_organization.id,
        title="Payout stuck",
        description="No payout since yesterday",
        source=TicketSource.MANUAL,
    )
    db.commit()
    return t


def _fake_rca(confidence=0.95, remediation="Restart the LDAP service.", customer="All fixed."):
    return SimpleNamespace(
        confidence=confidence,
        remediation=remediation,
        conclusion="Root cause: LDAP.",
        summary="LDAP outage",
        customer_summary=customer,
    )


def _validated_hypotheses():
    return [SimpleNamespace(status="validated")]


class TestProposals:
    def test_create_proposal_sets_awaiting_approval(self, db, service, ticket):
        proposal = service.create_proposal(ticket, None, "Do X", "We fixed it", 0.9)
        db.commit()
        assert proposal.status == ProposalStatus.PENDING.value
        assert str(ticket.status) == TicketStatus.AWAITING_APPROVAL.value
        activity_types = [
            str(a.activity_type)
            for a in db.query(TicketActivity).filter_by(ticket_id=ticket.id)
        ]
        assert TicketActivityType.AI_RESOLUTION_PROPOSED.value in activity_types

    def test_new_proposal_supersedes_pending(self, db, service, ticket):
        first = service.create_proposal(ticket, None, "v1", None, 0.7)
        second = service.create_proposal(ticket, None, "v2", None, 0.8)
        db.commit()
        db.refresh(first)
        assert first.status == ProposalStatus.SUPERSEDED.value
        assert second.status == ProposalStatus.PENDING.value
        assert service.pending_proposal(ticket.id).id == second.id

    @pytest.mark.asyncio
    async def test_approve_resolves_as_ai(self, db, service, ticket, test_user):
        proposal = service.create_proposal(ticket, None, "Do X", "Fixed for you", 0.9)
        await service.approve_proposal(ticket, proposal, test_user.id)
        db.commit()
        assert proposal.status == ProposalStatus.APPROVED.value
        assert proposal.decided_by_user_id == test_user.id
        assert str(ticket.status) == TicketStatus.RESOLVED_PENDING_CONFIRMATION.value
        assert ticket.resolved_by_actor == "ai"
        assert ticket.resolution_summary == "Do X"
        assert ticket.customer_resolution_message == "Fixed for you"

    def test_reject_returns_ticket_to_open_and_reinvestigates(self, db, service, ticket, test_user):
        proposal = service.create_proposal(ticket, None, "Do X", None, 0.9)
        run = service.reject_proposal(
            ticket, proposal, test_user.id, "Wrong root cause", reinvestigate=True
        )
        db.commit()
        assert proposal.status == ProposalStatus.REJECTED.value
        assert proposal.reject_reason == "Wrong root cause"
        assert str(ticket.status) == TicketStatus.OPEN.value
        assert run is not None
        assert run.context_note == "Wrong root cause"
        assert str(run.trigger) == "rejection_feedback"

    def test_reject_without_reinvestigate(self, db, service, ticket, test_user):
        proposal = service.create_proposal(ticket, None, "Do X", None, 0.9)
        run = service.reject_proposal(ticket, proposal, test_user.id, None, reinvestigate=False)
        db.commit()
        assert run is None


class TestAutonomy:
    def _run(self, ticket):
        return SimpleNamespace(id=uuid4(), ticket_id=ticket.id)

    @pytest.mark.asyncio
    async def test_l1_does_nothing(self, db, service, ticket):
        settings_row = service.settings_repo.get_or_create(ticket.organization_id)
        settings_row.autonomy_level = 1
        action = await _apply_autonomy(
            service, ticket, self._run(ticket), _fake_rca(), _validated_hypotheses(),
            settings_row, partial=False,
        )
        assert action == "none"
        assert str(ticket.status) == TicketStatus.OPEN.value

    @pytest.mark.asyncio
    async def test_l2_proposes(self, db, service, ticket):
        settings_row = service.settings_repo.get_or_create(ticket.organization_id)
        settings_row.autonomy_level = 2
        action = await _apply_autonomy(
            service, ticket, SimpleNamespace(id=None), _fake_rca(),
            _validated_hypotheses(), settings_row, partial=False,
        )
        assert action == "proposed"
        assert str(ticket.status) == TicketStatus.AWAITING_APPROVAL.value

    @pytest.mark.asyncio
    async def test_l3_auto_resolves_when_guards_pass(self, db, service, ticket, test_customer):
        ticket.customer_id = test_customer.id
        db.commit()
        settings_row = service.settings_repo.get_or_create(ticket.organization_id)
        settings_row.autonomy_level = 3
        settings_row.min_confidence_to_auto_resolve = 0.85
        with patch.object(service, "can_notify_customer", return_value=True):
            action = await _apply_autonomy(
                service, ticket, SimpleNamespace(id=None), _fake_rca(confidence=0.9),
                _validated_hypotheses(), settings_row, partial=False,
            )
        assert action == "auto_resolved"
        assert str(ticket.status) == TicketStatus.RESOLVED_PENDING_CONFIRMATION.value
        assert ticket.resolved_by_actor == "ai"

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "kwargs",
        [
            {"rca_confidence": 0.5},           # below threshold
            {"partial": True},                  # incomplete run
            {"validated": False},               # nothing validated
            {"can_notify": False},              # unreachable customer
        ],
    )
    async def test_l3_hard_guards_fall_back_to_proposal(self, db, service, ticket, kwargs):
        settings_row = service.settings_repo.get_or_create(ticket.organization_id)
        settings_row.autonomy_level = 3
        settings_row.min_confidence_to_auto_resolve = 0.85
        hypotheses = (
            _validated_hypotheses()
            if kwargs.get("validated", True)
            else [SimpleNamespace(status="inconclusive")]
        )
        with patch.object(
            service, "can_notify_customer", return_value=kwargs.get("can_notify", True)
        ):
            action = await _apply_autonomy(
                service, ticket, SimpleNamespace(id=None),
                _fake_rca(confidence=kwargs.get("rca_confidence", 0.95)),
                hypotheses, settings_row, partial=kwargs.get("partial", False),
            )
        assert action == "proposed"
        assert str(ticket.status) == TicketStatus.AWAITING_APPROVAL.value

    @pytest.mark.asyncio
    async def test_no_rca_means_no_action(self, db, service, ticket):
        settings_row = service.settings_repo.get_or_create(ticket.organization_id)
        settings_row.autonomy_level = 3
        action = await _apply_autonomy(
            service, ticket, SimpleNamespace(id=None), None, [], settings_row, False
        )
        assert action == "none"


class TestRunChaining:
    def test_enqueue_sees_unflushed_terminal_state(self, db, service, ticket):
        """Regression: with autoflush off, completing a run and immediately
        enqueueing the next one in the same session must work — the guard
        has to flush before checking for active runs."""
        from app.models.investigation import (
            InvestigationRun,
            InvestigationRunStatus,
            InvestigationRunType,
        )

        first = service.enqueue_run(ticket, run_type=InvestigationRunType.TRIAGE)
        db.commit()
        # Simulate the worker finishing the run WITHOUT flushing/committing.
        first.status = InvestigationRunStatus.COMPLETED
        chained = service.enqueue_run(ticket, run_type=InvestigationRunType.INVESTIGATION)
        assert chained is not None
        db.commit()
        assert str(chained.run_type) == "investigation"


class TestAlertParsing:
    def test_grafana_shape(self):
        title, description, severity = _parse_alert(
            {
                "title": "High 5xx on /login",
                "message": "error ratio 0.34",
                "commonLabels": {"severity": "critical"},
            }
        )
        assert title == "High 5xx on /login"
        assert "0.34" in description
        assert severity == "critical"

    def test_alertmanager_shape(self):
        title, _d, severity = _parse_alert(
            {
                "commonAnnotations": {"summary": "DB down"},
                "commonLabels": {"severity": "warning"},
            }
        )
        assert title == "DB down"
        assert severity == "warning"

    def test_generic_and_fallbacks(self):
        title, description, severity = _parse_alert({})
        assert title == "Infrastructure alert"
        assert description == ""
        assert severity is None


class TestJiraEscalationPolicy:
    def _settings(self, enabled=True, minimum="high"):
        return SimpleNamespace(
            jira_escalation_enabled=enabled, jira_escalation_priority=minimum
        )

    def _ticket(self, priority="urgent", external_ref_id=None):
        return SimpleNamespace(priority=priority, external_ref_id=external_ref_id)

    def test_escalates_at_or_above_threshold(self):
        assert should_escalate(self._ticket("urgent"), self._settings(minimum="high"))
        assert should_escalate(self._ticket("high"), self._settings(minimum="high"))
        assert not should_escalate(self._ticket("medium"), self._settings(minimum="high"))

    def test_disabled_or_already_escalated(self):
        assert not should_escalate(self._ticket("urgent"), self._settings(enabled=False))
        assert not should_escalate(
            self._ticket("urgent", external_ref_id="PROJ-1"), self._settings()
        )

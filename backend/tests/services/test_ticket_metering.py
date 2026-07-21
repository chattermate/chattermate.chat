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

Investigation metering: per-period llm_call counting, the enqueue budget gate,
and per-run token capture. The billable unit is one LLM call, mirroring FAQ
generation; only hosted-model (metered) runs count against the message budget.
"""

from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import patch

import pytest

from app.models.investigation import InvestigationRun, InvestigationRunType, InvestigationTrigger
from app.models.ticket import Ticket, TicketPriority, TicketSource, TicketStatus
from app.models.ticket_activity import TicketActivity
from app.repositories.ticket import InvestigationRepository
from app.services.ticket import TicketService


def _make_ticket(db, org) -> Ticket:
    t = Ticket(
        organization_id=org.id,
        ticket_number=1,
        title="Payout stuck",
        description="No payout since yesterday.",
        status=TicketStatus.OPEN,
        priority=TicketPriority.HIGH,
        source=TicketSource.MANUAL,
    )
    db.add(t)
    db.commit()
    return t


def _add_run(db, ticket, *, llm_calls, metered, created_at=None) -> InvestigationRun:
    r = InvestigationRun(
        ticket_id=ticket.id,
        organization_id=ticket.organization_id,
        run_type="investigation",
        status="completed",
        llm_calls=llm_calls,
        metered=metered,
    )
    db.add(r)
    db.commit()
    if created_at is not None:
        # created_at has a server default; override after insert for the window test.
        r.created_at = created_at
        db.commit()
    return r


class TestCountLlmCallsForPeriod:
    def _window(self):
        now = datetime.now(timezone.utc)
        return now - timedelta(days=30), now + timedelta(days=1)

    def test_sums_metered_runs(self, db, test_organization):
        ticket = _make_ticket(db, test_organization)
        _add_run(db, ticket, llm_calls=5, metered=True)
        _add_run(db, ticket, llm_calls=7, metered=True)
        start, end = self._window()
        total = InvestigationRepository(db).count_llm_calls_for_period(
            test_organization.id, start, end
        )
        assert total == 12

    def test_excludes_unmetered(self, db, test_organization):
        ticket = _make_ticket(db, test_organization)
        _add_run(db, ticket, llm_calls=5, metered=True)
        _add_run(db, ticket, llm_calls=100, metered=False)  # own-key run
        start, end = self._window()
        total = InvestigationRepository(db).count_llm_calls_for_period(
            test_organization.id, start, end
        )
        assert total == 5

    def test_excludes_out_of_window(self, db, test_organization):
        ticket = _make_ticket(db, test_organization)
        _add_run(db, ticket, llm_calls=5, metered=True)
        _add_run(
            db, ticket, llm_calls=9, metered=True,
            created_at=datetime.now(timezone.utc) - timedelta(days=60),
        )
        start, end = self._window()
        total = InvestigationRepository(db).count_llm_calls_for_period(
            test_organization.id, start, end
        )
        assert total == 5

    def test_zero_when_none(self, db, test_organization):
        start, end = self._window()
        assert InvestigationRepository(db).count_llm_calls_for_period(
            test_organization.id, start, end
        ) == 0


class TestEnqueueBudgetGate:
    """Investigations are blocked when a hosted-model org is out of credits;
    triage never is, and own-key / unlimited orgs never are."""

    def _service(self, db):
        return TicketService(db)

    def _patch(self, hosted, remaining):
        return (
            patch("app.services.usage_metering.is_hosted_model", return_value=hosted),
            patch("app.services.usage_metering.remaining_message_credits", return_value=remaining),
        )

    def test_investigation_blocked_when_out_of_credits(self, db, test_organization):
        ticket = _make_ticket(db, test_organization)
        service = self._service(db)
        p1, p2 = self._patch(hosted=True, remaining=0)
        with p1, p2:
            run = service.enqueue_run(ticket, run_type=InvestigationRunType.INVESTIGATION)
        assert run is None
        # A visible activity records why nothing happened.
        acts = db.query(TicketActivity).filter(TicketActivity.ticket_id == ticket.id).all()
        assert any("message credits" in (a.body or "") for a in acts)
        assert any((a.activity_metadata or {}).get("reason") == "message_limit_reached" for a in acts)

    def test_triage_never_blocked(self, db, test_organization):
        ticket = _make_ticket(db, test_organization)
        service = self._service(db)
        p1, p2 = self._patch(hosted=True, remaining=0)
        with p1, p2:
            run = service.enqueue_run(ticket, run_type=InvestigationRunType.TRIAGE)
        assert run is not None

    def test_investigation_allowed_with_credits(self, db, test_organization):
        ticket = _make_ticket(db, test_organization)
        service = self._service(db)
        p1, p2 = self._patch(hosted=True, remaining=50)
        with p1, p2:
            run = service.enqueue_run(ticket, run_type=InvestigationRunType.INVESTIGATION)
        assert run is not None

    def test_own_key_org_never_blocked(self, db, test_organization):
        ticket = _make_ticket(db, test_organization)
        service = self._service(db)
        # is_hosted_model False → gate short-circuits, remaining irrelevant.
        p1, p2 = self._patch(hosted=False, remaining=0)
        with p1, p2:
            run = service.enqueue_run(ticket, run_type=InvestigationRunType.INVESTIGATION)
        assert run is not None

    def test_unlimited_plan_never_blocked(self, db, test_organization):
        ticket = _make_ticket(db, test_organization)
        service = self._service(db)
        # remaining None = unlimited / self-host / metering error.
        p1, p2 = self._patch(hosted=True, remaining=None)
        with p1, p2:
            run = service.enqueue_run(ticket, run_type=InvestigationRunType.INVESTIGATION)
        assert run is not None


class TestTokenCapture:
    """The agent accumulates token usage across phases from agno's metrics."""

    def _agent(self):
        from app.agents.ticket_investigator import TicketInvestigatorAgent
        return TicketInvestigatorAgent(api_key="x", model_name="m", model_type="openai")

    def test_reads_session_metrics(self):
        agent = self._agent()
        fake = SimpleNamespace(session_metrics=SimpleNamespace(input_tokens=100, output_tokens=40))
        agent._capture_usage(fake, response=SimpleNamespace(metrics=None))
        assert agent.input_tokens == 100
        assert agent.output_tokens == 40

    def test_accumulates_across_calls(self):
        agent = self._agent()
        for _ in range(3):
            fake = SimpleNamespace(session_metrics=SimpleNamespace(input_tokens=10, output_tokens=5))
            agent._capture_usage(fake, response=SimpleNamespace(metrics=None))
        assert agent.input_tokens == 30
        assert agent.output_tokens == 15

    def test_falls_back_to_response_metrics(self):
        agent = self._agent()
        # No session_metrics → sum the per-message lists on response.metrics.
        fake_agent = SimpleNamespace(session_metrics=None)
        resp = SimpleNamespace(metrics={"input_tokens": [3, 4], "output_tokens": [1, 2]})
        agent._capture_usage(fake_agent, resp)
        assert agent.input_tokens == 7
        assert agent.output_tokens == 3

    def test_never_raises(self):
        agent = self._agent()
        # Garbage metrics must not break a run.
        agent._capture_usage(SimpleNamespace(session_metrics="bad"), SimpleNamespace(metrics="bad"))
        assert agent.input_tokens == 0

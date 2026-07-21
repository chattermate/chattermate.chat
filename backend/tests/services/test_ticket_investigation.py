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

Phase 3 investigation engine: evidence recording, hypothesis loop, budgets,
RCA synthesis/versioning.
"""

from unittest.mock import patch

import pytest

from app.models.investigation import (
    HypothesisStatus,
    InvestigationEvent,
    InvestigationHypothesis,
    InvestigationRun,
    RCADocument,
)
from app.models.schemas.investigation import (
    HypothesisPlan,
    HypothesisSpec,
    HypothesisVerdict,
    RCAResult,
    RCATimelineEntry,
)
from app.models.ticket import Ticket, TicketPriority, TicketSource, TicketStatus
from app.services.ticket_investigation import (
    EvidenceRecorder,
    redact_snippet,
    run_investigation_phases,
    synthesize_and_store_rca,
)


class _SessionShim:
    """Stands in for SessionLocal so recorder writes land in the test session
    (and the shared session is never closed)."""

    def __init__(self, db):
        self.db = db

    def __call__(self):
        return self

    def __enter__(self):
        return self.db

    def __exit__(self, *args):
        return False


@pytest.fixture
def ticket(db, test_organization) -> Ticket:
    t = Ticket(
        organization_id=test_organization.id,
        ticket_number=1,
        title="Payout stuck for merchant",
        description="Merchant reports payout not arriving since yesterday.",
        status=TicketStatus.OPEN,
        priority=TicketPriority.HIGH,
        source=TicketSource.MANUAL,
    )
    db.add(t)
    db.commit()
    return t


@pytest.fixture
def run(db, ticket) -> InvestigationRun:
    r = InvestigationRun(
        ticket_id=ticket.id,
        organization_id=ticket.organization_id,
        run_type="investigation",
        status="running",
    )
    db.add(r)
    db.commit()
    return r


@pytest.fixture
def recorder(db, run, ticket) -> EvidenceRecorder:
    with patch("app.services.ticket_investigation.SessionLocal", _SessionShim(db)):
        yield EvidenceRecorder(run.id, ticket.id)


class _FakeAgent:
    """Deterministic stand-in for TicketInvestigatorAgent."""

    def __init__(self, plan=None, verdict=None, rca=None):
        self.plan = plan
        self.verdict = verdict
        self.rca = rca
        self.test_calls = 0

    async def generate_hypotheses(self, context):
        return self.plan

    async def test_hypothesis(self, context, title, rationale, **kwargs):
        self.test_calls += 1
        return self.verdict

    async def synthesize_rca(self, context, hypotheses_digest, evidence_digest, partial=False):
        return self.rca


class TestRedaction:
    def test_redacts_pii_and_truncates(self):
        text = "customer email is jane.doe@example.com " + "x" * 5000
        snippet = redact_snippet(text, 200)
        assert "jane.doe@example.com" not in snippet
        assert "[EMAIL_REDACTED]" in snippet
        assert len(snippet) <= 200

    def test_empty(self):
        assert redact_snippet("", 100) == ""


class TestEvidenceRecorder:
    @pytest.mark.asyncio
    async def test_tool_hook_records_call(self, db, recorder, run):
        async def next_func(**kwargs):
            return {"hits": 3, "contact": "bob@corp.io"}

        result = await recorder.tool_hook("search_logs", next_func, {"query": "payout error"})
        assert result["hits"] == 3
        assert recorder.tool_calls == 1

        events = db.query(InvestigationEvent).filter_by(run_id=run.id).all()
        assert len(events) == 1
        event = events[0]
        assert event.tool_name == "search_logs"
        assert "payout error" in event.tool_input
        assert "bob@corp.io" not in (event.tool_result or "")
        assert event.duration_ms is not None
        assert event.error is None

    @pytest.mark.asyncio
    async def test_tool_hook_records_error_and_reraises(self, db, recorder, run):
        async def next_func(**kwargs):
            raise RuntimeError("connection refused")

        with pytest.raises(RuntimeError):
            await recorder.tool_hook("query_metrics", next_func, {"q": "cpu"})
        event = db.query(InvestigationEvent).filter_by(run_id=run.id).one()
        assert "connection refused" in event.error

    @pytest.mark.asyncio
    async def test_json_capture_tool_is_not_evidence(self, db, recorder, run):
        async def next_func(**kwargs):
            return "ok"

        await recorder.tool_hook("json", next_func, {"status": "validated"})
        assert recorder.tool_calls == 0
        assert db.query(InvestigationEvent).filter_by(run_id=run.id).count() == 0

    def test_phase_events(self, db, recorder, run):
        recorder.record_phase("Generating hypotheses")
        event = db.query(InvestigationEvent).filter_by(run_id=run.id).one()
        assert event.event_type == "phase"
        assert event.label == "Generating hypotheses"


class TestInvestigationPhases:
    @pytest.mark.asyncio
    async def test_hypotheses_created_and_verdicts_applied(self, db, run, ticket, recorder):
        agent = _FakeAgent(
            plan=HypothesisPlan(
                hypotheses=[
                    HypothesisSpec(title="Fraud filter hold", rationale="pattern matches"),
                    HypothesisSpec(title="Webhook timeout", rationale="delayed acks"),
                ]
            ),
            verdict=HypothesisVerdict(
                status="validated", confidence=0.9, conclusion="Logs confirm the hold."
            ),
        )
        hypotheses, budget_exhausted = await run_investigation_phases(
            db, run, ticket, agent, "context", [], recorder
        )
        assert len(hypotheses) == 2
        assert budget_exhausted is False
        rows = db.query(InvestigationHypothesis).filter_by(run_id=run.id).order_by(
            InvestigationHypothesis.idx
        ).all()
        assert [r.idx for r in rows] == [1, 2]
        assert all(r.status == "validated" for r in rows)
        assert rows[0].confidence == 0.9

    @pytest.mark.asyncio
    async def test_unparseable_verdict_is_inconclusive(self, db, run, ticket, recorder):
        agent = _FakeAgent(
            plan=HypothesisPlan(hypotheses=[HypothesisSpec(title="H", rationale="r")]),
            verdict=None,
        )
        hypotheses, _ = await run_investigation_phases(db, run, ticket, agent, "ctx", [], recorder)
        assert hypotheses[0].status == HypothesisStatus.INCONCLUSIVE.value

    @pytest.mark.asyncio
    async def test_invalid_verdict_status_whitelisted(self, db, run, ticket, recorder):
        agent = _FakeAgent(
            plan=HypothesisPlan(hypotheses=[HypothesisSpec(title="H", rationale="r")]),
            verdict=HypothesisVerdict(status="TOTALLY_SURE", confidence=1.0, conclusion="?"),
        )
        hypotheses, _ = await run_investigation_phases(db, run, ticket, agent, "ctx", [], recorder)
        assert hypotheses[0].status == HypothesisStatus.INCONCLUSIVE.value

    @pytest.mark.asyncio
    async def test_tool_budget_exhausted_skips_testing(self, db, run, ticket, recorder):
        run.max_tool_calls = 0
        db.commit()
        agent = _FakeAgent(
            plan=HypothesisPlan(
                hypotheses=[
                    HypothesisSpec(title="A", rationale="r"),
                    HypothesisSpec(title="B", rationale="r"),
                ]
            ),
        )
        # A non-empty tool list makes the budget meaningful.
        hypotheses, budget_exhausted = await run_investigation_phases(
            db, run, ticket, agent, "ctx", [object()], recorder
        )
        assert budget_exhausted is True
        assert agent.test_calls == 0
        assert all(h.status == HypothesisStatus.INCONCLUSIVE.value for h in hypotheses)
        assert "budget" in hypotheses[0].conclusion

    @pytest.mark.asyncio
    async def test_no_plan_raises(self, db, run, ticket, recorder):
        with pytest.raises(RuntimeError):
            await run_investigation_phases(
                db, run, ticket, _FakeAgent(plan=None), "ctx", [], recorder
            )


class TestRcaSynthesis:
    def _agent(self):
        return _FakeAgent(
            rca=RCAResult(
                summary="Fraud filter held the payout.",
                impact="One merchant, 26 hours.",
                timeline=[RCATimelineEntry(time="T0", event="payout initiated")],
                contributing_factors=["stale allowlist"],
                conclusion="Root cause: fraud hold [H1 · 0.92].",
                remediation="Release the hold.",
                prevention="Alert on holds older than 4h.",
                customer_summary="Your payout was delayed by a safety check and is on its way.",
                confidence=0.9,
            )
        )

    @pytest.mark.asyncio
    async def test_rca_stored_and_versioned(self, db, run, ticket, recorder):
        rca1 = await synthesize_and_store_rca(
            db, run, ticket, self._agent(), "ctx", [], recorder, partial=False
        )
        assert rca1.version == 1
        assert rca1.is_partial is False
        rca2 = await synthesize_and_store_rca(
            db, run, ticket, self._agent(), "ctx", [], recorder, partial=True
        )
        assert rca2.version == 2
        assert rca2.is_partial is True
        assert db.query(RCADocument).filter_by(ticket_id=ticket.id).count() == 2

    @pytest.mark.asyncio
    async def test_unparseable_rca_returns_none(self, db, run, ticket, recorder):
        result = await synthesize_and_store_rca(
            db, run, ticket, _FakeAgent(rca=None), "ctx", [], recorder, partial=False
        )
        assert result is None
        assert db.query(RCADocument).count() == 0

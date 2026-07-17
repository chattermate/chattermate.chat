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

Phase 3 investigation engine: hypothesis-driven root-cause analysis with every
tool call captured as a first-class InvestigationEvent row (the glass box).
Orchestrated here, executed by the ticket_investigator worker.
"""

import asyncio
import json
import time
from typing import List, Optional, Tuple
from uuid import UUID

from app.core.logger import get_logger
from app.database import SessionLocal
from app.models.investigation import (
    HypothesisStatus,
    InvestigationEvent,
    InvestigationEventType,
    InvestigationHypothesis,
    InvestigationRun,
    InvestigationRunStatus,
    RCADocument,
)
from app.models.ticket import Ticket
from app.utils.guardrails import GuardrailAction, PIIDetector

logger = get_logger(__name__)

# Per-hypothesis tool budget; the run-level max_tool_calls caps the total.
HYPOTHESIS_TOOL_CALL_LIMIT = 6
# Truncation applied at capture time — raw payloads never land in the DB.
MAX_EVENT_INPUT_CHARS = 2000
MAX_EVENT_RESULT_CHARS = 4000
# Bounded time for the final RCA synthesis (outside the main wall clock so a
# timed-out investigation can still produce a partial RCA).
RCA_SYNTHESIS_TIMEOUT_SECONDS = 180

VALID_VERDICT_STATUSES = {
    HypothesisStatus.VALIDATED.value,
    HypothesisStatus.INVALIDATED.value,
    HypothesisStatus.INCONCLUSIVE.value,
}


def redact_snippet(text: str, max_chars: int) -> str:
    """PII-redact and truncate a tool payload before it is persisted."""
    if not text:
        return ""
    result = PIIDetector.detect(text[: max_chars * 2], action=GuardrailAction.REDACT)
    redacted = result.redacted_text if result.redacted_text is not None else text
    redacted = redacted[:max_chars]
    return redacted


class EvidenceRecorder:
    """Writes InvestigationEvent rows as the investigator works.

    Each write uses its own short-lived session so evidence is visible live
    (the glass-box UI polls during active runs) and survives a failed run.
    Also the run's tool-call meter: the budget check reads self.tool_calls.
    """

    def __init__(self, run_id: UUID, ticket_id: UUID):
        self.run_id = run_id
        self.ticket_id = ticket_id
        self.seq = 0
        self.tool_calls = 0
        self.hypothesis_id: Optional[UUID] = None
        # tool function name -> configured connector (MCP server) name.
        self.connector_by_function: dict = {}
        # In-memory digest for RCA synthesis, mirroring the persisted rows.
        self.evidence_lines: List[str] = []

    def map_connectors(self, mcp_tools: list) -> None:
        for tool in mcp_tools or []:
            connector = getattr(tool, "_connector_name", None) or "MCP"
            for function_name in getattr(tool, "functions", {}) or {}:
                self.connector_by_function[function_name] = connector

    def _write(self, **fields) -> None:
        self.seq += 1
        try:
            with SessionLocal() as db:
                db.add(
                    InvestigationEvent(
                        run_id=self.run_id,
                        ticket_id=self.ticket_id,
                        hypothesis_id=self.hypothesis_id,
                        seq=self.seq,
                        **fields,
                    )
                )
                db.commit()
        except Exception as e:
            logger.error(f"Failed to record investigation event: {e}")

    def record_phase(self, label: str) -> None:
        """Phase marker — powers the live ticker line in the UI."""
        self._write(event_type=InvestigationEventType.PHASE, label=label[:300])

    async def tool_hook(self, function_name: str, function, arguments: dict):
        """agno tool hook: times the call and captures redacted input/result.
        Registered on the hypothesis-testing agents only."""
        # The Groq structured-output capture tool is plumbing, not evidence.
        if function_name == "json":
            return await function(**arguments)
        started = time.monotonic()
        error: Optional[str] = None
        result = None
        try:
            result = await function(**arguments)
            return result
        except Exception as e:
            error = str(e)
            raise
        finally:
            self.tool_calls += 1
            duration_ms = int((time.monotonic() - started) * 1000)
            try:
                input_text = json.dumps(arguments, default=str)
            except Exception:
                input_text = str(arguments)
            input_snippet = redact_snippet(input_text, MAX_EVENT_INPUT_CHARS)
            result_snippet = redact_snippet(str(result), MAX_EVENT_RESULT_CHARS) if result is not None else None
            self._write(
                event_type=InvestigationEventType.TOOL_CALL,
                tool_name=function_name[:200],
                connector_name=self.connector_by_function.get(function_name, "MCP")[:200],
                tool_input=input_snippet,
                tool_result=result_snippet,
                duration_ms=duration_ms,
                error=error[:2000] if error else None,
            )
            self.evidence_lines.append(
                f"[E{self.seq}] {function_name}({input_snippet[:300]}) -> "
                + (f"ERROR: {error[:200]}" if error else (result_snippet or "")[:500])
            )


def hypotheses_digest(hypotheses: List[InvestigationHypothesis]) -> str:
    lines = []
    for h in hypotheses:
        lines.append(
            f"H{h.idx}: {h.title} — {h.status} (confidence {h.confidence if h.confidence is not None else 'n/a'})\n"
            f"    {h.conclusion or h.rationale or ''}"
        )
    return "\n".join(lines)


async def run_investigation_phases(
    db,
    run: InvestigationRun,
    ticket: Ticket,
    agent,
    context_message: str,
    mcp_tools: list,
    recorder: EvidenceRecorder,
) -> Tuple[List[InvestigationHypothesis], bool]:
    """Generate hypotheses, then test each within the run's tool budget.
    Mutates hypothesis rows (committed per step so the UI streams progress).
    Returns (hypotheses, budget_exhausted)."""
    recorder.record_phase("Generating hypotheses")
    plan = await agent.generate_hypotheses(context_message)
    if plan is None or not plan.hypotheses:
        raise RuntimeError("Hypothesis generation produced no result")

    hypotheses: List[InvestigationHypothesis] = []
    for i, spec in enumerate(plan.hypotheses, start=1):
        hypothesis = InvestigationHypothesis(
            run_id=run.id,
            ticket_id=ticket.id,
            idx=i,
            title=spec.title[:300],
            rationale=spec.rationale,
            status=HypothesisStatus.PENDING,
        )
        db.add(hypothesis)
        hypotheses.append(hypothesis)
    db.commit()

    budget_exhausted = False
    max_tool_calls = run.max_tool_calls if run.max_tool_calls is not None else 25
    for hypothesis in hypotheses:
        remaining_budget = max(0, max_tool_calls - recorder.tool_calls)
        if remaining_budget <= 0 and mcp_tools:
            budget_exhausted = True
            hypothesis.status = HypothesisStatus.INCONCLUSIVE
            hypothesis.confidence = 0.0
            hypothesis.conclusion = "Not tested — the run's tool-call budget was exhausted."
            db.commit()
            continue

        recorder.hypothesis_id = hypothesis.id
        recorder.record_phase(f"Testing H{hypothesis.idx}: {hypothesis.title}")
        hypothesis.status = HypothesisStatus.TESTING
        db.commit()

        verdict = await agent.test_hypothesis(
            context_message,
            hypothesis.title,
            hypothesis.rationale,
            mcp_tools=mcp_tools,
            tool_call_limit=min(HYPOTHESIS_TOOL_CALL_LIMIT, remaining_budget) if mcp_tools else None,
            tool_hooks=[recorder.tool_hook],
        )
        if verdict is not None and verdict.status in VALID_VERDICT_STATUSES:
            hypothesis.status = verdict.status
            hypothesis.confidence = max(0.0, min(1.0, verdict.confidence))
            hypothesis.conclusion = verdict.conclusion
        else:
            hypothesis.status = HypothesisStatus.INCONCLUSIVE
            hypothesis.confidence = 0.0
            hypothesis.conclusion = "The tester produced no parseable verdict."
        db.commit()
    recorder.hypothesis_id = None
    return hypotheses, budget_exhausted


async def synthesize_and_store_rca(
    db,
    run: InvestigationRun,
    ticket: Ticket,
    agent,
    context_message: str,
    hypotheses: List[InvestigationHypothesis],
    recorder: EvidenceRecorder,
    partial: bool,
) -> Optional[RCADocument]:
    """Write the versioned RCA document from whatever evidence exists."""
    from app.repositories.ticket import InvestigationRepository

    recorder.record_phase("Writing root-cause analysis")
    try:
        result = await asyncio.wait_for(
            agent.synthesize_rca(
                context_message,
                hypotheses_digest(hypotheses),
                "\n".join(recorder.evidence_lines[-60:]),
                partial=partial,
            ),
            timeout=RCA_SYNTHESIS_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        logger.error(f"RCA synthesis timed out for {ticket.display_number}")
        return None
    if result is None:
        return None

    rca = RCADocument(
        ticket_id=ticket.id,
        run_id=run.id,
        version=InvestigationRepository(db).next_rca_version(ticket.id),
        summary=result.summary,
        impact=result.impact,
        timeline=[entry.model_dump() for entry in result.timeline],
        investigation_log=result.investigation_log,
        contributing_factors=result.contributing_factors,
        conclusion=result.conclusion,
        remediation=result.remediation,
        prevention=result.prevention,
        customer_summary=result.customer_summary,
        confidence=max(0.0, min(1.0, result.confidence)),
        is_partial=partial,
        generated_by="ai",
    )
    db.add(rca)
    db.commit()
    return rca

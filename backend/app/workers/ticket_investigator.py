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

AI ticket worker: processes pending runs (triage + hypothesis-driven
investigation with MCP evidence gathering) and runs lifecycle hygiene
(confirmation-timeout close + CSAT). Runs as its own container:
`python -m app.workers.ticket_investigator`.
"""

import asyncio
from datetime import datetime, timedelta, timezone
from uuid import UUID

from app.core.config import settings
from app.core.logger import get_logger
from app.core.security import decrypt_api_key
from app.database import SessionLocal
from app.models.investigation import (
    InvestigationRun,
    InvestigationRunStatus,
    InvestigationRunType,
    InvestigationTrigger,
)
from app.models.ticket import ResolutionOutcome, Ticket, TicketStatus
from app.models.ticket_activity import TicketActivityType, TicketActorType
from app.repositories.ai_config import AIConfigRepository
from app.repositories.ticket import InvestigationRepository, TicketRepository
from app.services.ticket import TicketService, embed_ticket_text
from app.services.ticket_events import emit_ticket_update

logger = get_logger(__name__)

RUN_POLL_INTERVAL_SECONDS = 15
LIFECYCLE_POLL_INTERVAL_SECONDS = 300
TRIAGE_WALL_SECONDS = 120


async def _build_triage_context(db, service: TicketService, ticket: Ticket):
    """Transcript of the linked conversation + similar past resolved tickets."""
    transcript = None
    session_record = service._primary_session(ticket)
    if session_record is not None:
        try:
            transcript = await service.build_session_transcript(
                session_record.session_id, max_messages=15, line_chars=400
            )
        except Exception as e:
            logger.error(f"Transcript build failed for {ticket.display_number}: {e}")

    similar = []
    embedding = ticket.embedding
    if embedding is None:
        # CPU-bound local model — keep it off the worker's event loop so
        # concurrent runs aren't serialized behind inference.
        embedding = await asyncio.to_thread(
            embed_ticket_text, ticket.title, ticket.description
        )
    if embedding is not None:
        for other, score in service.repo.find_similar(
            ticket.organization_id, list(embedding), limit=5,
            exclude_ticket_id=ticket.id, min_similarity=0.70,
        ):
            resolution = other.resolution_summary or other.resolution_outcome or "unresolved"
            similar.append(
                f"{other.display_number} [{other.status}] {other.title} — resolution: {resolution}"
            )
    return transcript, similar


async def process_run(run_id: UUID) -> None:
    """Run one pending investigation run to a terminal state."""
    with SessionLocal() as db:
        run_repo = InvestigationRepository(db)
        run = run_repo.get_by_id(run_id)
        if run is None or run.status != InvestigationRunStatus.PENDING.value:
            return

        service = TicketService(db)
        ticket = TicketRepository(db).get_by_id(run.ticket_id)
        if ticket is None:
            run.status = InvestigationRunStatus.FAILED
            run.error = "Ticket no longer exists"
            run.finished_at = datetime.now(timezone.utc)
            db.commit()
            return

        run.status = InvestigationRunStatus.RUNNING
        run.started_at = datetime.now(timezone.utc)
        previous_status = str(ticket.status)
        is_investigation = str(run.run_type) == InvestigationRunType.INVESTIGATION.value
        if is_investigation:
            if previous_status in (
                TicketStatus.OPEN.value, TicketStatus.TRIAGING.value,
                TicketStatus.REOPENED.value, TicketStatus.IN_PROGRESS.value,
            ):
                ticket.status = TicketStatus.INVESTIGATING
        elif previous_status == TicketStatus.OPEN.value:
            ticket.status = TicketStatus.TRIAGING
        db.commit()
        await emit_ticket_update(
            ticket.organization_id, ticket.id, "run",
            {"status": "running", "run_type": str(run.run_type)},
        )

        try:
            config = AIConfigRepository(db).get_active_config(ticket.organization_id)
            if config is None:
                raise RuntimeError("Organization has no active AI configuration")

            from app.agents.ticket_investigator import TicketInvestigatorAgent
            agent = TicketInvestigatorAgent(
                api_key=decrypt_api_key(config.encrypted_api_key),
                model_name=config.model_name,
                model_type=config.model_type.value if hasattr(config.model_type, "value") else str(config.model_type),
            )
            run.model_name = config.model_name

            def count_call():
                run.llm_calls = (run.llm_calls or 0) + 1
            agent.on_llm_call = count_call

            if is_investigation:
                await _process_investigation(db, run, service, ticket, agent, previous_status)
            else:
                await _process_triage(db, run, service, ticket, agent, previous_status)
        except asyncio.TimeoutError:
            _fail_run(db, run, ticket, previous_status, "AI run timed out")
        except Exception as e:
            logger.error(f"Investigation run {run_id} failed: {e}")
            try:
                db.rollback()
            except Exception:
                pass
            _fail_run(db, run, ticket, previous_status, str(e))


async def _process_triage(db, run, service: TicketService, ticket: Ticket, agent, previous_status: str) -> None:
    transcript, similar = await _build_triage_context(db, service, ticket)
    result = await asyncio.wait_for(
        agent.triage(ticket.title, ticket.description, transcript, similar),
        timeout=TRIAGE_WALL_SECONDS,
    )

    if result is not None:
        _apply_triage(service, ticket, result)
    else:
        logger.warning(f"Triage produced no result for {ticket.display_number}")

    # Triage done — the ticket goes back to plain open unless a human
    # already moved it.
    if str(ticket.status) == TicketStatus.TRIAGING.value:
        ticket.status = previous_status
    run.status = InvestigationRunStatus.COMPLETED
    run.finished_at = datetime.now(timezone.utc)

    # Auto-chain: tickets created with auto-investigate on flow straight into
    # a full investigation when the org has connectors configured.
    settings_row = service.settings_repo.get_or_create(ticket.organization_id)
    if (
        str(run.trigger) == InvestigationTrigger.AUTO_ON_CREATE.value
        and settings_row.auto_investigate_on_create
        and (settings_row.investigation_mcp_tool_ids or [])
    ):
        service.enqueue_run(
            ticket,
            run_type=InvestigationRunType.INVESTIGATION,
            trigger=InvestigationTrigger.AUTO_ON_CREATE,
            settings=settings_row,
        )
    db.commit()
    await emit_ticket_update(
        ticket.organization_id, ticket.id, "triage",
        {"status": str(ticket.status), "priority": str(ticket.priority)},
    )


async def _process_investigation(db, run, service: TicketService, ticket: Ticket, agent, previous_status: str) -> None:
    """Hypothesis-driven investigation: connect the org's MCP connectors,
    generate + test hypotheses (evidence recorded per tool call), then write
    the RCA document. MCP init and cleanup happen in this same task — the
    anyio cancel-scope requirement."""
    from app.repositories.ticket import InvestigationRepository
    from app.services.ticket_investigation import (
        EvidenceRecorder,
        run_investigation_phases,
        synthesize_and_store_rca,
    )
    from app.tools.mcp_manager import MCPToolsManager

    settings_row = service.settings_repo.get_or_create(ticket.organization_id)
    recorder = EvidenceRecorder(run.id, ticket.id)

    service._add_activity(
        ticket,
        TicketActivityType.AI_INVESTIGATION_STARTED,
        actor_type=TicketActorType.AI,
        body="AI investigation started",
        metadata={"run_id": str(run.id), "trigger": str(run.trigger)},
    )
    db.commit()

    transcript, similar = await _build_triage_context(db, service, ticket)
    extra_sections = []
    if ticket.ai_summary:
        extra_sections.append(f"TRIAGE SUMMARY: {ticket.ai_summary} (intent: {ticket.intent})")
    if run.context_note:
        # e.g. the human's rejection reason feeding a refined run.
        extra_sections.append(f"REVIEWER FEEDBACK ON THE PREVIOUS RUN:\n{run.context_note[:2000]}")
    context_message = agent.build_context_message(
        ticket.title, ticket.description, transcript, similar, extra_sections=extra_sections
    )

    manager = MCPToolsManager()
    mcp_tools = []
    hypotheses = []
    partial = False
    try:
        tool_ids = settings_row.investigation_mcp_tool_ids or []
        if tool_ids:
            recorder.record_phase("Connecting investigation connectors")
            mcp_tools = await manager.initialize_mcp_tools_by_ids(
                str(ticket.organization_id), tool_ids
            )
            recorder.map_connectors(mcp_tools)
        try:
            hypotheses, budget_exhausted = await asyncio.wait_for(
                run_investigation_phases(
                    db, run, ticket, agent, context_message, mcp_tools, recorder
                ),
                timeout=run.max_wall_seconds or 600,
            )
            partial = budget_exhausted
        except asyncio.TimeoutError:
            partial = True
            try:
                db.rollback()
            except Exception:
                pass
            hypotheses = InvestigationRepository(db).list_hypotheses(run.id)
            for hypothesis in hypotheses:
                if str(hypothesis.status) in ("pending", "testing"):
                    hypothesis.status = "inconclusive"
                    hypothesis.conclusion = "Not completed — the run's wall-clock budget was reached."
            db.commit()
    finally:
        await manager.cleanup_mcp_tools()

    run.tool_calls_used = recorder.tool_calls
    rca = await synthesize_and_store_rca(
        db, run, ticket, agent, context_message, hypotheses, recorder, partial
    )

    validated = sum(1 for h in hypotheses if str(h.status) == "validated")
    service._add_activity(
        ticket,
        TicketActivityType.AI_INVESTIGATION_COMPLETED,
        actor_type=TicketActorType.AI,
        body=(rca.summary if rca else "Investigation finished without an RCA document"),
        metadata={
            "run_id": str(run.id),
            "hypotheses": len(hypotheses),
            "validated": validated,
            "rca_version": rca.version if rca else None,
            "partial": partial,
        },
    )

    if str(ticket.status) == TicketStatus.INVESTIGATING.value:
        restore = previous_status
        if restore in (TicketStatus.TRIAGING.value, TicketStatus.INVESTIGATING.value):
            restore = TicketStatus.OPEN.value
        ticket.status = restore
    run.status = (
        InvestigationRunStatus.BUDGET_EXCEEDED if partial else InvestigationRunStatus.COMPLETED
    )
    run.finished_at = datetime.now(timezone.utc)
    service._sync_linked_sessions(ticket)
    db.commit()
    await emit_ticket_update(
        ticket.organization_id, ticket.id, "run",
        {"status": str(run.status), "rca": rca is not None},
    )


def _apply_triage(service: TicketService, ticket: Ticket, result) -> None:
    """Apply the triage classification and record the activity."""
    from app.models.ticket import TicketPriority

    changes = {}
    if result.title and result.title.strip() and result.title.strip() != ticket.title:
        if ticket.original_title is None:
            ticket.original_title = ticket.title
        ticket.title = result.title.strip()[:500]
        changes["title"] = ticket.title
    # The LLM's priority is untrusted output — anything outside the enum
    # ('Medium', 'P1', ...) would 500 every later read of the ticket.
    priority = (result.priority or "").strip().lower()
    if priority in {p.value for p in TicketPriority} and str(ticket.priority) != priority:
        changes["priority"] = {"from": str(ticket.priority), "to": priority}
        ticket.priority = priority
    if result.severity is not None and ticket.severity is None:
        ticket.severity = result.severity
        changes["severity"] = result.severity
    ticket.intent = result.intent
    ticket.ai_summary = result.summary
    ticket.triage_confidence = result.confidence
    if result.tags and not ticket.tags:
        ticket.tags = [t.strip().lower()[:30] for t in result.tags[:2] if t.strip()]

    service._add_activity(
        ticket,
        TicketActivityType.AI_TRIAGE,
        actor_type=TicketActorType.AI,
        body=result.summary,
        metadata={
            "intent": result.intent,
            "confidence": result.confidence,
            "changes": changes,
        },
    )
    service._sync_linked_sessions(ticket)


def _fail_run(db, run: InvestigationRun, ticket: Ticket, previous_status: str, error: str) -> None:
    run.status = InvestigationRunStatus.FAILED
    run.error = error[:2000]
    run.finished_at = datetime.now(timezone.utc)
    transient = (TicketStatus.TRIAGING.value, TicketStatus.INVESTIGATING.value)
    if ticket is not None and str(ticket.status) in transient:
        ticket.status = previous_status if previous_status not in transient else TicketStatus.OPEN.value
    db.commit()


async def run_ticket_investigator() -> None:
    """Single pass: process every pending run (bounded concurrency)."""
    with SessionLocal() as db:
        pending_ids = InvestigationRepository(db).get_pending_ids(limit=50)
    if not pending_ids:
        return
    semaphore = asyncio.Semaphore(max(1, settings.MAX_CONCURRENT_INVESTIGATIONS))

    async def process_with_semaphore(run_id: UUID):
        async with semaphore:
            await process_run(run_id)

    await asyncio.gather(*[process_with_semaphore(rid) for rid in pending_ids])


async def run_ticket_lifecycle() -> None:
    """Close resolved-pending-confirmation tickets past the org's timeout
    (customer never replied). The close fires the CSAT request when enabled."""
    with SessionLocal() as db:
        service = TicketService(db)
        now = datetime.now(timezone.utc)
        candidates = (
            db.query(Ticket)
            .filter(
                Ticket.status == TicketStatus.RESOLVED_PENDING_CONFIRMATION.value,
                Ticket.confirmation_requested_at.isnot(None),
            )
            .limit(500)
            .all()
        )
        for ticket in candidates:
            try:
                org_settings = service.settings_repo.get_or_create(ticket.organization_id)
                requested = ticket.confirmation_requested_at
                if requested.tzinfo is None:
                    requested = requested.replace(tzinfo=timezone.utc)
                deadline = requested + timedelta(hours=org_settings.confirmation_timeout_hours)
                if now < deadline:
                    continue
                await service.close(
                    ticket,
                    actor_type=TicketActorType.SYSTEM,
                    reason=(
                        "Closed automatically — no customer response within "
                        f"{org_settings.confirmation_timeout_hours}h of resolution."
                    ),
                )
                db.commit()
                await emit_ticket_update(
                    ticket.organization_id, ticket.id, "status",
                    {"status": TicketStatus.CLOSED.value},
                )
            except Exception as e:
                logger.error(f"Lifecycle close failed for ticket {ticket.id}: {e}")
                try:
                    db.rollback()
                except Exception:
                    pass


def reap_orphaned_runs() -> None:
    try:
        with SessionLocal() as db:
            reaped = InvestigationRepository(db).reap_orphaned_runs()
        if reaped:
            logger.warning(f"Reaped {reaped} orphaned investigation run(s) on startup")
    except Exception as e:
        logger.error(f"Investigation orphan reap failed (non-fatal): {e}")


async def run_ticket_investigator_loop(poll_interval: int = RUN_POLL_INTERVAL_SECONDS):
    while True:
        try:
            await run_ticket_investigator()
        except Exception as e:
            logger.error(f"Error in ticket investigator loop: {e}")
        await asyncio.sleep(poll_interval)


async def run_ticket_lifecycle_loop(poll_interval: int = LIFECYCLE_POLL_INTERVAL_SECONDS):
    while True:
        try:
            await run_ticket_lifecycle()
        except Exception as e:
            logger.error(f"Error in ticket lifecycle loop: {e}")
        await asyncio.sleep(poll_interval)


async def main():
    # Route socket emits through the Redis manager (when enabled) so
    # ticket_update frames from this process reach dashboard clients connected
    # to the web containers. Without Redis the frontend's poll fallback covers.
    from app.core.socketio import configure_socketio
    configure_socketio()
    reap_orphaned_runs()
    await asyncio.gather(
        run_ticket_investigator_loop(),
        run_ticket_lifecycle_loop(),
    )


if __name__ == "__main__":
    logger.info("Starting ticket investigator service")
    asyncio.run(main())

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

AI ticket worker: processes pending investigation runs (Phase 2: triage) and
runs lifecycle hygiene (confirmation-timeout close + CSAT). Runs as its own
container: `python -m app.workers.ticket_investigator`.
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
        if previous_status == TicketStatus.OPEN.value:
            ticket.status = TicketStatus.TRIAGING
        db.commit()
        await emit_ticket_update(ticket.organization_id, ticket.id, "run", {"status": "running"})

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
            # already moved it (investigation runs come with Phase 3).
            if str(ticket.status) == TicketStatus.TRIAGING.value:
                ticket.status = previous_status
            run.status = InvestigationRunStatus.COMPLETED
            run.finished_at = datetime.now(timezone.utc)
            db.commit()
            await emit_ticket_update(
                ticket.organization_id, ticket.id, "triage",
                {"status": str(ticket.status), "priority": str(ticket.priority)},
            )
        except asyncio.TimeoutError:
            _fail_run(db, run, ticket, previous_status, "Triage timed out")
        except Exception as e:
            logger.error(f"Investigation run {run_id} failed: {e}")
            try:
                db.rollback()
            except Exception:
                pass
            _fail_run(db, run, ticket, previous_status, str(e))


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
    if ticket is not None and str(ticket.status) == TicketStatus.TRIAGING.value:
        ticket.status = previous_status
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

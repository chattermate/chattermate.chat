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

from datetime import datetime, timedelta, timezone
from typing import List, Optional, Tuple
from uuid import UUID

from sqlalchemy import and_, func, or_, text
from sqlalchemy.orm import Session, joinedload

from app.core.logger import get_logger
from app.models.investigation import (
    ACTIVE_RUN_STATUSES,
    InvestigationEvent,
    InvestigationHypothesis,
    InvestigationRun,
    InvestigationRunStatus,
    InvestigationRunType,
    RCADocument,
)
from app.models.ticket import (
    OPEN_TICKET_STATUSES,
    Ticket,
    TicketSequence,
    TicketSession,
    TicketStatus,
)
from app.models.ticket_activity import TicketActivity
from app.models.ticket_settings import OrganizationTicketSettings

logger = get_logger(__name__)

# Safety cap for the in-Python SLA-breach computation over open tickets.
MAX_OPEN_TICKETS_FOR_STATS = 5000


class TicketRepository:
    def __init__(self, db: Session):
        self.db = db

    def allocate_ticket_number(self, organization_id: UUID) -> int:
        """Allocate the next per-org display number. Locks the sequence row
        (SELECT ... FOR UPDATE) so concurrent creates can't collide; must be
        committed in the same transaction as the ticket row."""
        if self.db.bind is not None and self.db.bind.dialect.name == "postgresql":
            # FOR UPDATE can't lock a row that doesn't exist yet: two
            # concurrent first tickets would both insert and one would die on
            # the PK. Upsert the row race-free, then lock it.
            self.db.execute(
                text(
                    "INSERT INTO ticket_sequences (organization_id, next_number) "
                    "VALUES (:org, 1) ON CONFLICT (organization_id) DO NOTHING"
                ),
                {"org": str(organization_id)},
            )
        seq = (
            self.db.query(TicketSequence)
            .filter(TicketSequence.organization_id == organization_id)
            .with_for_update()
            .first()
        )
        if seq is None:  # non-postgres (sqlite tests)
            seq = TicketSequence(organization_id=organization_id, next_number=1)
            self.db.add(seq)
            self.db.flush()
        number = seq.next_number
        seq.next_number = number + 1
        self.db.flush()
        return number

    def create(self, ticket: Ticket) -> Ticket:
        ticket.ticket_number = self.allocate_ticket_number(ticket.organization_id)
        self.db.add(ticket)
        self.db.flush()
        return ticket

    def get_by_id(self, ticket_id: UUID, organization_id: Optional[UUID] = None) -> Optional[Ticket]:
        query = self.db.query(Ticket).filter(Ticket.id == ticket_id)
        if organization_id is not None:
            query = query.filter(Ticket.organization_id == organization_id)
        return query.first()

    def get_by_number(self, organization_id: UUID, ticket_number: int) -> Optional[Ticket]:
        return (
            self.db.query(Ticket)
            .filter(
                Ticket.organization_id == organization_id,
                Ticket.ticket_number == ticket_number,
            )
            .first()
        )

    def get_by_session(self, session_id: UUID) -> Optional[Ticket]:
        """The native ticket linked to a chat session (at most one)."""
        return (
            self.db.query(Ticket)
            .join(TicketSession, TicketSession.ticket_id == Ticket.id)
            .filter(TicketSession.session_id == session_id)
            .order_by(Ticket.created_at.desc())
            .first()
        )

    def link_session(self, ticket_id: UUID, session_id: UUID) -> None:
        exists = (
            self.db.query(TicketSession)
            .filter(
                TicketSession.ticket_id == ticket_id,
                TicketSession.session_id == session_id,
            )
            .first()
        )
        if not exists:
            self.db.add(TicketSession(ticket_id=ticket_id, session_id=session_id))
            self.db.flush()

    def get_session_ids(self, ticket_id: UUID) -> List[UUID]:
        rows = (
            self.db.query(TicketSession.session_id)
            .filter(TicketSession.ticket_id == ticket_id)
            .order_by(TicketSession.linked_at)
            .all()
        )
        return [r[0] for r in rows]

    def _ai_state_condition(self, ai_state: str):
        """SQL condition matching the derived AI-state used by the list filter.
        Mirrors TicketService.ai_state()."""
        from sqlalchemy import exists
        active_run = exists().where(
            and_(
                InvestigationRun.ticket_id == Ticket.id,
                InvestigationRun.status.in_(ACTIVE_RUN_STATUSES),
            )
        )
        resolved_states = [
            TicketStatus.RESOLVED.value,
            TicketStatus.CLOSED.value,
            TicketStatus.RESOLVED_PENDING_CONFIRMATION.value,
        ]
        is_resolved = Ticket.status.in_(resolved_states)
        # Resolution wins over a stale not-yet-processed run (mirrors ai_state()).
        investigating = and_(
            ~is_resolved,
            or_(
                active_run,
                Ticket.status.in_([TicketStatus.TRIAGING.value, TicketStatus.INVESTIGATING.value]),
            ),
        )
        awaiting = and_(
            Ticket.status == TicketStatus.AWAITING_APPROVAL.value, ~active_run
        )
        ai_resolved = and_(is_resolved, Ticket.resolved_by_actor == "ai")
        if ai_state == "investigating":
            return investigating
        if ai_state == "awaiting":
            return awaiting
        if ai_state == "resolved":
            return ai_resolved
        if ai_state == "human":
            return and_(~investigating, ~awaiting, ~ai_resolved)
        return None

    def list(
        self,
        organization_id: UUID,
        status: Optional[List[str]] = None,
        priority: Optional[str] = None,
        assignee_user_id: Optional[UUID] = None,
        group_id: Optional[UUID] = None,
        unassigned: bool = False,
        ai_state: Optional[str] = None,
        search: Optional[str] = None,
        sort: str = "updated",
        page: int = 1,
        page_size: int = 25,
    ) -> Tuple[List[Ticket], int]:
        query = (
            self.db.query(Ticket)
            .options(joinedload(Ticket.assignee))
            .filter(Ticket.organization_id == organization_id)
        )
        if status:
            query = query.filter(Ticket.status.in_(status))
        if ai_state:
            condition = self._ai_state_condition(ai_state)
            if condition is not None:
                query = query.filter(condition)
        if priority:
            query = query.filter(Ticket.priority == priority)
        if assignee_user_id is not None:
            query = query.filter(Ticket.assignee_user_id == assignee_user_id)
        if unassigned:
            query = query.filter(Ticket.assignee_user_id.is_(None))
        if group_id is not None:
            query = query.filter(Ticket.group_id == group_id)
        if search:
            # Escape LIKE metacharacters so a literal '%'/'_' in the search
            # text doesn't become a wildcard.
            escaped = (
                search.strip()
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_")
            )
            term = f"%{escaped}%"
            filters = [
                Ticket.title.ilike(term, escape="\\"),
                Ticket.description.ilike(term, escape="\\"),
            ]
            # "TKT-123" / "123" searches match the display number.
            digits = search.strip().upper().removeprefix("TKT-")
            if digits.isdigit():
                filters.append(Ticket.ticket_number == int(digits))
            query = query.filter(or_(*filters))

        total = query.count()

        if sort == "priority":
            # urgent < high < medium < low by enum position.
            priority_order = {"urgent": 0, "high": 1, "medium": 2, "low": 3}
            whens = [(Ticket.priority == value, rank) for value, rank in priority_order.items()]
            from sqlalchemy import case
            query = query.order_by(case(*whens, else_=99), Ticket.updated_at.desc())
        elif sort == "created":
            query = query.order_by(Ticket.created_at.desc())
        else:
            query = query.order_by(Ticket.updated_at.desc())

        tickets = query.offset((page - 1) * page_size).limit(page_size).all()
        return tickets, total

    def find_similar(
        self,
        organization_id: UUID,
        embedding: List[float],
        limit: int = 5,
        exclude_ticket_id: Optional[UUID] = None,
        only_open: bool = False,
        min_similarity: float = 0.0,
    ) -> List[Tuple[Ticket, float]]:
        """kNN cosine search over ticket embeddings. Postgres-only (pgvector);
        returns [] on other dialects (sqlite tests) or on error."""
        if self.db.bind is None or self.db.bind.dialect.name != "postgresql":
            return []
        try:
            from sqlalchemy import bindparam

            vec = "[" + ",".join(f"{v:.8f}" for v in embedding) + "]"
            conditions = ["organization_id = :org_id", "embedding IS NOT NULL"]
            params = {"org_id": str(organization_id), "vec": vec, "limit": limit}
            if exclude_ticket_id is not None:
                conditions.append("id != :exclude_id")
                params["exclude_id"] = str(exclude_ticket_id)
            if only_open:
                conditions.append("status IN :statuses")
                params["statuses"] = list(OPEN_TICKET_STATUSES)
            sql = text(
                "SELECT id, 1 - (embedding <=> :vec) AS similarity FROM tickets "
                f"WHERE {' AND '.join(conditions)} "
                "ORDER BY embedding <=> :vec LIMIT :limit"
            )
            if only_open:
                sql = sql.bindparams(bindparam("statuses", expanding=True))
            rows = self.db.execute(sql, params).fetchall()
            similarities = {
                row[0]: float(row[1]) for row in rows if float(row[1]) >= min_similarity
            }
            if not similarities:
                return []
            # One IN query instead of a round-trip per row.
            tickets = (
                self.db.query(Ticket).filter(Ticket.id.in_(similarities.keys())).all()
            )
            results = [(t, similarities[t.id]) for t in tickets]
            results.sort(key=lambda pair: pair[1], reverse=True)
            return results
        except Exception as e:
            logger.error(f"Ticket similarity search failed: {e}")
            return []

    def active_run_ticket_ids(self, ticket_ids: List[UUID]) -> set:
        """Which of the given tickets have an active investigation run."""
        if not ticket_ids:
            return set()
        rows = (
            self.db.query(InvestigationRun.ticket_id)
            .filter(
                InvestigationRun.ticket_id.in_(ticket_ids),
                InvestigationRun.status.in_(ACTIVE_RUN_STATUSES),
            )
            .all()
        )
        return {r[0] for r in rows}

    def count_by_status(self, organization_id: UUID) -> dict:
        rows = (
            self.db.query(Ticket.status, func.count(Ticket.id))
            .filter(Ticket.organization_id == organization_id)
            .group_by(Ticket.status)
            .all()
        )
        return {status: count for status, count in rows}

    def open_ticket_sla_fields(self, organization_id: UUID) -> List[Tuple[str, object]]:
        """(priority, created_at) of open tickets — all the SLA-breach stat
        needs; avoids hydrating full rows (embedding + text) per poll."""
        return (
            self.db.query(Ticket.priority, Ticket.created_at)
            .filter(
                Ticket.organization_id == organization_id,
                Ticket.status.in_(OPEN_TICKET_STATUSES),
            )
            .limit(MAX_OPEN_TICKETS_FOR_STATS)
            .all()
        )

    def resolved_counts_7d(self, organization_id: UUID) -> Tuple[int, int]:
        """(ai_resolved, total_resolved) over the trailing 7 days."""
        since = datetime.now(timezone.utc) - timedelta(days=7)
        base = self.db.query(func.count(Ticket.id)).filter(
            Ticket.organization_id == organization_id,
            Ticket.resolved_at.isnot(None),
            Ticket.resolved_at >= since,
        )
        total = base.scalar() or 0
        ai = base.filter(Ticket.resolved_by_actor == "ai").scalar() or 0
        return ai, total


class TicketActivityRepository:
    def __init__(self, db: Session):
        self.db = db

    def add(self, activity: TicketActivity) -> TicketActivity:
        self.db.add(activity)
        self.db.flush()
        return activity

    def list_for_ticket(self, ticket_id: UUID, limit: int = 200) -> List[TicketActivity]:
        return (
            self.db.query(TicketActivity)
            .options(joinedload(TicketActivity.actor_user))
            .filter(TicketActivity.ticket_id == ticket_id)
            .order_by(TicketActivity.created_at)
            .limit(limit)
            .all()
        )


class TicketSettingsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, organization_id: UUID) -> Optional[OrganizationTicketSettings]:
        return (
            self.db.query(OrganizationTicketSettings)
            .filter(OrganizationTicketSettings.organization_id == organization_id)
            .first()
        )

    def get_or_create(self, organization_id: UUID) -> OrganizationTicketSettings:
        settings = self.get(organization_id)
        if settings is None:
            settings = OrganizationTicketSettings(organization_id=organization_id)
            self.db.add(settings)
            self.db.commit()
            self.db.refresh(settings)
        return settings


class InvestigationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, run_id: UUID) -> Optional[InvestigationRun]:
        return self.db.query(InvestigationRun).filter(InvestigationRun.id == run_id).first()

    def get_active_for_ticket(self, ticket_id: UUID) -> Optional[InvestigationRun]:
        return (
            self.db.query(InvestigationRun)
            .filter(
                InvestigationRun.ticket_id == ticket_id,
                InvestigationRun.status.in_(ACTIVE_RUN_STATUSES),
            )
            .first()
        )

    def count_for_ticket(self, ticket_id: UUID, run_type: Optional[str] = None) -> int:
        query = self.db.query(func.count(InvestigationRun.id)).filter(
            InvestigationRun.ticket_id == ticket_id
        )
        if run_type:
            query = query.filter(InvestigationRun.run_type == run_type)
        return query.scalar() or 0

    def list_for_ticket(self, ticket_id: UUID) -> List[InvestigationRun]:
        return (
            self.db.query(InvestigationRun)
            .filter(InvestigationRun.ticket_id == ticket_id)
            .order_by(InvestigationRun.created_at.desc())
            .all()
        )

    def enqueue(self, run: InvestigationRun) -> Optional[InvestigationRun]:
        """Insert a pending run unless the ticket already has an active one
        (double-guarded by uq_investigation_runs_one_active in Postgres)."""
        # Sessions run with autoflush=False: the caller may have just moved
        # the previous run to a terminal state in this same session, and
        # without a flush the guard query would still see the stale row and
        # silently refuse the enqueue (bit the triage -> investigation chain).
        self.db.flush()
        if self.get_active_for_ticket(run.ticket_id) is not None:
            return None
        self.db.add(run)
        self.db.flush()
        return run

    def get_pending_ids(self, limit: int = 10) -> List[UUID]:
        rows = (
            self.db.query(InvestigationRun.id)
            .filter(InvestigationRun.status == InvestigationRunStatus.PENDING)
            .order_by(InvestigationRun.created_at)
            .limit(limit)
            .all()
        )
        return [r[0] for r in rows]

    def latest_run_of_type(self, ticket_id: UUID, run_type: str) -> Optional[InvestigationRun]:
        return (
            self.db.query(InvestigationRun)
            .filter(
                InvestigationRun.ticket_id == ticket_id,
                InvestigationRun.run_type == run_type,
            )
            .order_by(InvestigationRun.created_at.desc())
            .first()
        )

    def list_hypotheses(self, run_id: UUID) -> List[InvestigationHypothesis]:
        return (
            self.db.query(InvestigationHypothesis)
            .filter(InvestigationHypothesis.run_id == run_id)
            .order_by(InvestigationHypothesis.idx)
            .all()
        )

    def list_events(self, run_id: UUID, limit: int = 500) -> List[InvestigationEvent]:
        return (
            self.db.query(InvestigationEvent)
            .filter(InvestigationEvent.run_id == run_id)
            .order_by(InvestigationEvent.seq)
            .limit(limit)
            .all()
        )

    def latest_rca(self, ticket_id: UUID) -> Optional[RCADocument]:
        return (
            self.db.query(RCADocument)
            .filter(RCADocument.ticket_id == ticket_id)
            .order_by(RCADocument.version.desc())
            .first()
        )

    def next_rca_version(self, ticket_id: UUID) -> int:
        current = (
            self.db.query(func.max(RCADocument.version))
            .filter(RCADocument.ticket_id == ticket_id)
            .scalar()
        )
        return (current or 0) + 1

    def reap_orphaned_runs(self) -> int:
        """Fail 'running' rows left behind by a dead worker (startup pass), and
        un-stick their tickets. Without the ticket reset a crash mid-run leaves
        the ticket in triaging/investigating with no active run — its ai_state
        would read 'investigating' forever (nothing else recovers it)."""
        orphaned = (
            self.db.query(InvestigationRun)
            .filter(InvestigationRun.status == InvestigationRunStatus.RUNNING)
            .all()
        )
        transient = (TicketStatus.TRIAGING.value, TicketStatus.INVESTIGATING.value)
        for run in orphaned:
            run.status = InvestigationRunStatus.FAILED
            run.error = "Worker restarted while run was in progress"
            run.finished_at = datetime.now(timezone.utc)
            # NB: self is InvestigationRepository — query the Ticket directly,
            # not self.get_by_id (that resolves run ids).
            ticket = self.db.query(Ticket).filter(Ticket.id == run.ticket_id).first()
            if ticket is not None and str(ticket.status) in transient:
                ticket.status = TicketStatus.OPEN.value
        if orphaned:
            self.db.commit()
        return len(orphaned)

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

from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.models.investigation import (
    InvestigationRun,
    InvestigationRunType,
    InvestigationTrigger,
)
from app.models.session_to_agent import SessionToAgent
from app.models.ticket import (
    OPEN_TICKET_STATUSES,
    TICKET_STATUS_TRANSITIONS,
    Ticket,
    TicketPriority,
    TicketSource,
    TicketStatus,
)
from app.models.ticket_activity import TicketActivity, TicketActivityType, TicketActorType
from app.models.ticket_settings import (
    DEFAULT_CREATED_TEMPLATE,
    DEFAULT_RESOLVED_TEMPLATE,
    DEFAULT_SLA_TARGETS,
    OrganizationTicketSettings,
)
from app.repositories.session_to_agent import SessionToAgentRepository
from app.repositories.ticket import (
    InvestigationRepository,
    TicketActivityRepository,
    TicketRepository,
    TicketSettingsRepository,
)

logger = get_logger(__name__)

# Open tickets whose title+description embed this close to an existing open
# ticket are flagged as possible duplicates.
DUPLICATE_SIMILARITY_THRESHOLD = 0.90

# Denormalized mirror value on session_to_agents.integration_type for native
# tickets (Jira sessions keep 'JIRA').
NATIVE_INTEGRATION_TYPE = "NATIVE"

_embedder = None


def _get_embedder():
    """Lazy module-level FastEmbed embedder (local model, no API cost)."""
    global _embedder
    if _embedder is None:
        from agno.embedder.fastembed import FastEmbedEmbedder
        _embedder = FastEmbedEmbedder()
    return _embedder


def embed_ticket_text(title: str, description: Optional[str]) -> Optional[List[float]]:
    try:
        content = title if not description else f"{title}\n\n{description}"
        return _get_embedder().get_embedding(content[:4000])
    except Exception as e:
        logger.error(f"Ticket embedding failed: {e}")
        return None


def render_customer_template(template: str, customer_name: Optional[str], display_number: str) -> str:
    return (
        template.replace("[customer]", customer_name or "there")
        .replace("[ticket]", display_number)
    )


class TicketService:
    """Ticket lifecycle. Every mutation writes a TicketActivity row — the
    activity table is the audit trail, never bypass it."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = TicketRepository(db)
        self.activity_repo = TicketActivityRepository(db)
        self.settings_repo = TicketSettingsRepository(db)
        self.run_repo = InvestigationRepository(db)

    # ---------- creation ----------

    def create_ticket(
        self,
        organization_id: UUID,
        title: str,
        description: Optional[str] = None,
        priority: str = TicketPriority.MEDIUM,
        severity: Optional[int] = None,
        tags: Optional[List[str]] = None,
        source: str = TicketSource.MANUAL,
        customer_id: Optional[UUID] = None,
        customer_email: Optional[str] = None,
        customer_name: Optional[str] = None,
        session_id: Optional[UUID] = None,
        agent_id: Optional[UUID] = None,
        assignee_user_id: Optional[UUID] = None,
        group_id: Optional[UUID] = None,
        created_by_user_id: Optional[UUID] = None,
    ) -> Tuple[Ticket, List[Tuple[Ticket, float]]]:
        """Create a ticket, link its session, mirror the legacy session
        columns, and enqueue triage. Returns (ticket, possible_duplicates).
        Caller commits.

        customer_email (manual tickets): resolved to an existing customer in
        the org or a new record — the direct-email notification path."""
        settings = self.settings_repo.get_or_create(organization_id)

        if customer_id is None and customer_email:
            from app.repositories.customer import CustomerRepository
            customer = CustomerRepository(self.db).get_or_create_customer(
                email=customer_email.strip().lower(),
                organization_id=organization_id,
                full_name=(customer_name or "").strip() or None,
            )
            customer_id = customer.id

        session_record = None
        if session_id is not None:
            session_record = SessionToAgentRepository(self.db).get_session(session_id)
            # Cross-org guard: linking mutates the session row and messages its
            # customer, so a foreign session must be rejected, not ignored.
            if session_record is None or str(session_record.organization_id) != str(organization_id):
                raise ValueError("Session not found in this organization")
            if customer_id is None:
                customer_id = session_record.customer_id
            if agent_id is None:
                agent_id = session_record.agent_id

        embedding = embed_ticket_text(title, description)

        ticket = Ticket(
            organization_id=organization_id,
            customer_id=customer_id,
            title=title,
            description=description,
            priority=priority,
            severity=severity,
            tags=tags,
            source=source,
            status=TicketStatus.OPEN,
            agent_id=agent_id,
            assignee_user_id=assignee_user_id,
            group_id=group_id,
            created_by_user_id=created_by_user_id,
            embedding=embedding,
        )
        self.repo.create(ticket)

        possible_duplicates: List[Tuple[Ticket, float]] = []
        if embedding is not None:
            possible_duplicates = self.repo.find_similar(
                organization_id,
                embedding,
                limit=3,
                exclude_ticket_id=ticket.id,
                only_open=True,
                min_similarity=DUPLICATE_SIMILARITY_THRESHOLD,
            )

        actor_type = TicketActorType.AI if source == TicketSource.CHAT_AI else (
            TicketActorType.USER if created_by_user_id else TicketActorType.SYSTEM
        )
        self._add_activity(
            ticket,
            TicketActivityType.STATUS_CHANGE,
            actor_type=actor_type,
            actor_user_id=created_by_user_id,
            body=(
                f"Ticket created from conversation" if session_id else "Ticket created"
            ),
            metadata={"to": TicketStatus.OPEN.value, "source": source},
        )

        if session_record is not None:
            self.repo.link_session(ticket.id, session_record.session_id)
            self._mirror_session_columns(session_record, ticket)

        if settings.auto_investigate_on_create:
            self.enqueue_run(
                ticket,
                run_type=InvestigationRunType.TRIAGE,
                trigger=InvestigationTrigger.AUTO_ON_CREATE,
                settings=settings,
            )

        return ticket, possible_duplicates

    def _mirror_session_columns(self, session_record: SessionToAgent, ticket: Ticket) -> None:
        """Keep the deprecated session_to_agents.ticket_* columns in sync so
        existing session/widget consumers keep working. Never clobbers an
        explicit Jira linkage — JiraTools reads ticket_id as a Jira issue key."""
        if session_record.integration_type not in (None, NATIVE_INTEGRATION_TYPE):
            return
        try:
            session_record.ticket_id = ticket.display_number
            session_record.ticket_status = str(ticket.status)
            session_record.ticket_summary = ticket.title[:255]
            session_record.ticket_description = (ticket.description or "")[:1000]
            session_record.integration_type = NATIVE_INTEGRATION_TYPE
            session_record.ticket_priority = str(ticket.priority)
            self.db.flush()
        except Exception as e:
            logger.error(f"Failed to mirror ticket columns onto session: {e}")

    def _sync_linked_sessions(self, ticket: Ticket) -> None:
        session_repo = SessionToAgentRepository(self.db)
        for sid in self.repo.get_session_ids(ticket.id):
            record = session_repo.get_session(sid)
            if record is not None and record.integration_type == NATIVE_INTEGRATION_TYPE:
                record.ticket_status = str(ticket.status)
                record.ticket_priority = str(ticket.priority)
        self.db.flush()

    async def build_session_transcript(
        self, session_id, max_messages: int = 15, line_chars: int = 400
    ) -> Optional[str]:
        """Plain-text transcript of a session's recent messages — shared by the
        create-modal draft endpoint and the triage context builder."""
        from app.repositories.chat import ChatRepository
        messages = (await ChatRepository(self.db).get_session_history(session_id))[-max_messages:]
        lines = []
        for m in messages:
            who = "Customer" if m.message_type == "user" else "Agent"
            text = (m.message or "").strip()
            if text:
                lines.append(f"{who}: {text[:line_chars]}")
        return "\n".join(lines) or None

    # ---------- lifecycle ----------

    def transition_status(
        self,
        ticket: Ticket,
        new_status: TicketStatus,
        actor_type: str = TicketActorType.USER,
        actor_user_id: Optional[UUID] = None,
        reason: Optional[str] = None,
    ) -> Ticket:
        current = TicketStatus(ticket.status)
        new_status = TicketStatus(new_status)
        if new_status == current:
            return ticket
        allowed = TICKET_STATUS_TRANSITIONS.get(current, set())
        if new_status not in allowed:
            raise ValueError(f"Illegal status transition {current.value} -> {new_status.value}")

        ticket.status = new_status
        now = datetime.now(timezone.utc)
        if new_status == TicketStatus.RESOLVED and ticket.resolved_at is None:
            ticket.resolved_at = now
            if ticket.resolved_by_actor is None:
                ticket.resolved_by_actor = "ai" if actor_type == TicketActorType.AI else "user"
        if new_status == TicketStatus.RESOLVED_PENDING_CONFIRMATION:
            ticket.confirmation_requested_at = now
        if new_status == TicketStatus.CLOSED:
            ticket.closed_at = now
            if ticket.resolved_at is None:
                ticket.resolved_at = now
            if ticket.resolved_by_actor is None:
                ticket.resolved_by_actor = "ai" if actor_type == TicketActorType.AI else "user"

        self._add_activity(
            ticket,
            TicketActivityType.STATUS_CHANGE,
            actor_type=actor_type,
            actor_user_id=actor_user_id,
            body=reason or f"Status changed {current.value} → {new_status.value}",
            metadata={"from": current.value, "to": new_status.value},
        )
        self._sync_linked_sessions(ticket)
        return ticket

    def assign(
        self,
        ticket: Ticket,
        assignee_user_id: Optional[UUID],
        group_id: Optional[UUID],
        actor_user_id: Optional[UUID] = None,
    ) -> Ticket:
        ticket.assignee_user_id = assignee_user_id
        ticket.group_id = group_id
        self._add_activity(
            ticket,
            TicketActivityType.ASSIGNMENT,
            actor_type=TicketActorType.USER if actor_user_id else TicketActorType.SYSTEM,
            actor_user_id=actor_user_id,
            metadata={
                "assignee_user_id": str(assignee_user_id) if assignee_user_id else None,
                "group_id": str(group_id) if group_id else None,
            },
        )
        return ticket

    def set_priority(
        self,
        ticket: Ticket,
        priority: TicketPriority,
        actor_type: str = TicketActorType.USER,
        actor_user_id: Optional[UUID] = None,
    ) -> Ticket:
        old = ticket.priority
        if str(old) == str(priority):
            return ticket
        ticket.priority = priority
        self._add_activity(
            ticket,
            TicketActivityType.PRIORITY_CHANGE,
            actor_type=actor_type,
            actor_user_id=actor_user_id,
            metadata={"from": str(old), "to": str(priority)},
        )
        self._sync_linked_sessions(ticket)
        return ticket

    def add_comment(
        self,
        ticket: Ticket,
        body: str,
        is_internal: bool = True,
        actor_type: str = TicketActorType.USER,
        actor_user_id: Optional[UUID] = None,
    ) -> TicketActivity:
        activity = self._add_activity(
            ticket,
            TicketActivityType.COMMENT,
            actor_type=actor_type,
            actor_user_id=actor_user_id,
            body=body,
            is_internal=is_internal,
        )
        if ticket.first_response_at is None and actor_type in (
            TicketActorType.USER, TicketActorType.AI
        ) and not is_internal:
            ticket.first_response_at = datetime.now(timezone.utc)
        return activity

    async def resolve(
        self,
        ticket: Ticket,
        outcome: str,
        resolution_summary: Optional[str] = None,
        customer_message: Optional[str] = None,
        actor_type: str = TicketActorType.USER,
        actor_user_id: Optional[UUID] = None,
    ) -> Ticket:
        """Resolve pending customer confirmation. Notifies the customer with
        the plain-language message; the lifecycle worker closes it after the
        confirmation timeout."""
        ticket.resolution_outcome = outcome
        if resolution_summary:
            ticket.resolution_summary = resolution_summary
        if customer_message:
            ticket.customer_resolution_message = customer_message
        ticket.resolved_by_actor = "ai" if actor_type == TicketActorType.AI else "user"
        self.transition_status(
            ticket,
            TicketStatus.RESOLVED_PENDING_CONFIRMATION,
            actor_type=actor_type,
            actor_user_id=actor_user_id,
        )
        await self.notify_customer_resolved(ticket)
        return ticket

    async def close(
        self,
        ticket: Ticket,
        actor_type: str = TicketActorType.SYSTEM,
        actor_user_id: Optional[UUID] = None,
        reason: Optional[str] = None,
    ) -> Ticket:
        self.transition_status(
            ticket, TicketStatus.CLOSED, actor_type=actor_type,
            actor_user_id=actor_user_id, reason=reason,
        )
        settings = self.settings_repo.get_or_create(ticket.organization_id)
        if settings.csat_enabled:
            await self.request_csat(ticket)
        return ticket

    def reopen(
        self,
        ticket: Ticket,
        reason: Optional[str] = None,
        actor_type: str = TicketActorType.USER,
        actor_user_id: Optional[UUID] = None,
    ) -> Ticket:
        ticket.reopened_count = (ticket.reopened_count or 0) + 1
        ticket.resolved_at = None
        ticket.closed_at = None
        ticket.confirmation_requested_at = None
        ticket.resolved_by_actor = None
        ticket.status = TicketStatus.REOPENED
        self._add_activity(
            ticket,
            TicketActivityType.REOPENED,
            actor_type=actor_type,
            actor_user_id=actor_user_id,
            body=reason,
        )
        self._sync_linked_sessions(ticket)
        return ticket

    # ---------- AI runs ----------

    def enqueue_run(
        self,
        ticket: Ticket,
        run_type: str = InvestigationRunType.TRIAGE,
        trigger: str = InvestigationTrigger.MANUAL,
        requested_by_user_id: Optional[UUID] = None,
        context_note: Optional[str] = None,
        settings: Optional[OrganizationTicketSettings] = None,
    ) -> Optional[InvestigationRun]:
        settings = settings or self.settings_repo.get_or_create(ticket.organization_id)
        if run_type == InvestigationRunType.INVESTIGATION:
            done = self.run_repo.count_for_ticket(ticket.id, InvestigationRunType.INVESTIGATION)
            if done >= settings.max_runs_per_ticket:
                logger.info(f"Ticket {ticket.display_number}: max investigation runs reached")
                return None
        run = self.run_repo.enqueue(
            InvestigationRun(
                ticket_id=ticket.id,
                organization_id=ticket.organization_id,
                run_type=run_type,
                trigger=trigger,
                requested_by_user_id=requested_by_user_id,
                context_note=context_note,
                max_tool_calls=settings.max_tool_calls_per_run,
            )
        )
        return run

    # ---------- customer communications ----------

    async def notify_customer_created(
        self, ticket: Ticket, settings: Optional[OrganizationTicketSettings] = None
    ) -> None:
        settings = settings or self.settings_repo.get_or_create(ticket.organization_id)
        template = settings.created_template or DEFAULT_CREATED_TEMPLATE
        message = render_customer_template(
            template, self._customer_name(ticket), ticket.display_number
        )
        await self.send_customer_message(ticket, message)

    async def notify_customer_resolved(
        self, ticket: Ticket, settings: Optional[OrganizationTicketSettings] = None
    ) -> None:
        settings = settings or self.settings_repo.get_or_create(ticket.organization_id)
        template = settings.resolved_template or DEFAULT_RESOLVED_TEMPLATE
        message = render_customer_template(
            template, self._customer_name(ticket), ticket.display_number
        )
        if ticket.customer_resolution_message:
            message = f"{message}\n\n{ticket.customer_resolution_message}"
        await self.send_customer_message(ticket, message)

    async def request_csat(self, ticket: Ticket) -> None:
        session_record = self._primary_session(ticket)
        if session_record is None:
            return
        try:
            from app.services.message_delivery import deliver_to_customer
            await deliver_to_customer(self.db, session_record, {
                "message": (
                    f"How did we do on ticket {ticket.display_number}? "
                    "Your feedback helps us improve — you can rate this conversation."
                ),
                "type": "chat_response",
                "request_rating": True,
            })
            self._add_activity(
                ticket, TicketActivityType.CSAT_REQUESTED,
                actor_type=TicketActorType.SYSTEM,
                metadata={"session_id": str(session_record.session_id)},
            )
        except Exception as e:
            logger.error(f"CSAT request failed for {ticket.display_number}: {e}")

    def can_notify_customer(self, ticket: Ticket) -> bool:
        """Whether any outbound path to the customer exists: a linked
        conversation, or a customer with an email for direct sending."""
        if self.repo.get_session_ids(ticket.id):
            return True
        return bool(ticket.customer and ticket.customer.email)

    async def send_customer_message(
        self, ticket: Ticket, message: str, record_activity: bool = True
    ) -> None:
        """Deliver a ticket message to the customer: through the linked
        conversation's channel (widget socket or email/WhatsApp/... adapter)
        when one exists, by direct email otherwise (manual tickets).
        record_activity=False when the caller already wrote its own activity
        row (customer-visible comments)."""
        session_record = self._primary_session(ticket)
        if session_record is None:
            await self._send_direct_email(ticket, message, record_activity)
            return
        try:
            from app.services.message_delivery import deliver_to_customer
            from app.repositories.chat import ChatRepository
            await deliver_to_customer(self.db, session_record, {
                "message": message,
                "type": "chat_response",
                "session_id": str(session_record.session_id),
            })
            ChatRepository(self.db).create_message({
                "message": message,
                "message_type": "bot",
                "session_id": session_record.session_id,
                "organization_id": ticket.organization_id,
                "agent_id": session_record.agent_id,
                "customer_id": session_record.customer_id,
                "attributes": {"ticket_number": ticket.display_number},
            })
            if ticket.first_response_at is None:
                ticket.first_response_at = datetime.now(timezone.utc)
            if not record_activity:
                return
            self._add_activity(
                ticket, TicketActivityType.CUSTOMER_NOTIFIED,
                actor_type=TicketActorType.SYSTEM,
                body=message,
                metadata={
                    "session_id": str(session_record.session_id),
                    "channel": getattr(session_record, "channel", "web"),
                },
            )
        except Exception as e:
            logger.error(f"Customer notification failed for {ticket.display_number}: {e}")

    async def _send_direct_email(
        self, ticket: Ticket, message: str, record_activity: bool
    ) -> None:
        """Email fallback for tickets with no linked conversation."""
        to_email = ticket.customer.email if ticket.customer else None
        if not to_email:
            logger.info(
                f"Ticket {ticket.display_number}: no linked session or customer email to notify"
            )
            return
        from app.services.ticket_email import send_ticket_email
        sent = await send_ticket_email(
            self.db,
            ticket.organization_id,
            to_email,
            subject=f"[{ticket.display_number}] {ticket.title}",
            body=message,
        )
        if not sent:
            return
        if ticket.first_response_at is None:
            ticket.first_response_at = datetime.now(timezone.utc)
        if not record_activity:
            return
        self._add_activity(
            ticket, TicketActivityType.CUSTOMER_NOTIFIED,
            actor_type=TicketActorType.SYSTEM,
            body=message,
            metadata={"channel": "email", "to": to_email},
        )

    def _primary_session(self, ticket: Ticket) -> Optional[SessionToAgent]:
        session_ids = self.repo.get_session_ids(ticket.id)
        if not session_ids:
            return None
        return SessionToAgentRepository(self.db).get_session(session_ids[0])

    def _customer_name(self, ticket: Ticket) -> Optional[str]:
        try:
            return ticket.customer.full_name if ticket.customer else None
        except Exception:
            return None

    # ---------- derived fields ----------

    def ai_state(self, ticket: Ticket, has_active_run: Optional[bool] = None) -> str:
        """Derived UI field: investigating / awaiting / human / resolved.
        Resolution wins over a stale not-yet-processed run."""
        status = str(ticket.status)
        resolved_states = (
            TicketStatus.RESOLVED, TicketStatus.CLOSED,
            TicketStatus.RESOLVED_PENDING_CONFIRMATION,
        )
        if status in resolved_states:
            return "resolved" if ticket.resolved_by_actor == "ai" else "human"
        if has_active_run is None:
            has_active_run = self.run_repo.get_active_for_ticket(ticket.id) is not None
        if status in (TicketStatus.TRIAGING, TicketStatus.INVESTIGATING) or has_active_run:
            return "investigating"
        if status == TicketStatus.AWAITING_APPROVAL:
            return "awaiting"
        return "human"

    @staticmethod
    def _resolution_due(
        priority: str, created_at, settings: OrganizationTicketSettings
    ) -> Optional[datetime]:
        targets = settings.sla_targets or DEFAULT_SLA_TARGETS
        target = targets.get(str(priority))
        if not target or not created_at:
            return None
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        return created_at + timedelta(minutes=target["resolution_minutes"])

    def sla_due_at(
        self, ticket: Ticket, settings: Optional[OrganizationTicketSettings] = None
    ) -> Optional[datetime]:
        """Resolution SLA deadline from the org's per-priority targets."""
        if str(ticket.status) not in OPEN_TICKET_STATUSES:
            return None
        settings = settings or self.settings_repo.get_or_create(ticket.organization_id)
        return self._resolution_due(ticket.priority, ticket.created_at, settings)

    def stats(self, organization_id: UUID) -> dict:
        counts = self.repo.count_by_status(organization_id)
        open_count = sum(counts.get(s, 0) for s in OPEN_TICKET_STATUSES)
        awaiting = counts.get(TicketStatus.AWAITING_APPROVAL.value, 0)

        settings = self.settings_repo.get_or_create(organization_id)
        now = datetime.now(timezone.utc)
        breaching = 0
        for priority, created_at in self.repo.open_ticket_sla_fields(organization_id):
            due = self._resolution_due(priority, created_at, settings)
            if due is not None and due <= now + timedelta(minutes=30):
                breaching += 1

        ai_resolved, total_resolved = self.repo.resolved_counts_7d(organization_id)
        pct = round(100.0 * ai_resolved / total_resolved, 1) if total_resolved else None
        return {
            "open": open_count,
            "awaiting_approval": awaiting,
            "sla_breaching": breaching,
            "ai_resolved_pct_7d": pct,
        }

    # ---------- internals ----------

    def _add_activity(
        self,
        ticket: Ticket,
        activity_type: str,
        actor_type: str = TicketActorType.SYSTEM,
        actor_user_id: Optional[UUID] = None,
        body: Optional[str] = None,
        is_internal: bool = True,
        metadata: Optional[dict] = None,
    ) -> TicketActivity:
        return self.activity_repo.add(
            TicketActivity(
                ticket_id=ticket.id,
                activity_type=activity_type,
                actor_type=actor_type,
                actor_user_id=actor_user_id,
                body=body,
                is_internal=is_internal,
                activity_metadata=metadata,
            )
        )

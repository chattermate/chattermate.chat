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

Erasing a customer's personal data.

A customer's data is spread over many tables: the messages, the sessions and
what hangs off them (ratings, ticket links, channel threads, guardrail
excerpts, action-call payloads, agno's own transcript copy), lead captures and
their CRM jobs, journey progress, attachments and tickets. Everything is
deleted explicitly, child before parent, instead of relying on ON DELETE
CASCADE: several of these links have no cascade (chat_history.session_id,
lead_capture_responses.session_id, customers.merged_into_customer_id), and
the session/customer FKs that do say SET NULL would leave the content behind.

The functions here only stage deletes; the caller commits. Attachment objects
live in S3, which is not transactional, so their URLs are returned for the
caller to delete once the database commit has gone through.
"""

from dataclasses import dataclass, field
from typing import Callable, Dict, Iterable, List, Optional, Set
from uuid import UUID

from sqlalchemy import bindparam, func, or_, select, text
from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.models.agent_action import AgentActionCall
from app.models.channels.channel_conversation import ChannelConversation
from app.models.chat_history import ChatHistory
from app.models.crm import CrmCustomerSync, CrmSyncJob
from app.models.customer import Customer
from app.models.file_attachment import FileAttachment
from app.models.guardrail_event import GuardrailEvent
from app.models.investigation import (
    InvestigationEvent, InvestigationHypothesis, InvestigationRun, RCADocument, TicketProposal,
)
from app.models.journey import JourneyProgress, JourneyStepProgress
from app.models.lead_capture import LeadCaptureResponse
from app.models.rating import Rating
from app.models.session_to_agent import SessionToAgent
from app.models.ticket import Ticket, TicketSession
from app.models.ticket_activity import TicketActivity
from app.utils.phone import normalize_phone

logger = get_logger(__name__)

# agno's session store (see app.agents.chat_agent). Not a SQLAlchemy model of
# ours, and only present on Postgres.
AGNO_SESSIONS_TABLE = "ai.agent_sessions"

# Ids per statement. A store's shop/redact can cover thousands of sessions, and
# Postgres refuses a statement with more than 65535 bind parameters.
BATCH_SIZE = 500

# Tables hanging off a ticket. Postgres cascades them, but they hold the
# customer's words and AI analysis of them, so they go explicitly like the rest.
# Ordered so nothing is deleted while a row still points at it.
TICKET_CHILDREN = (
    TicketActivity, TicketSession, InvestigationEvent, TicketProposal, RCADocument,
    InvestigationHypothesis, InvestigationRun,
)


@dataclass
class ErasureResult:
    """Row counts per table, and attachment URLs still to delete from storage."""
    counts: Dict[str, int] = field(default_factory=dict)
    attachment_urls: List[str] = field(default_factory=list)
    # Anything else worth keeping in the request's record (never personal data).
    details: Dict[str, object] = field(default_factory=dict)

    def record(self) -> Dict[str, object]:
        """What the compliance record stores: row counts and any details."""
        return {**self.counts, **self.details}

    def add(self, table: str, deleted: int) -> None:
        if deleted:
            self.counts[table] = self.counts.get(table, 0) + deleted

    def merge(self, other: "ErasureResult") -> None:
        for table, deleted in other.counts.items():
            self.add(table, deleted)
        self.attachment_urls.extend(other.attachment_urls)


def find_customer_ids(
    db: Session, organization_id: UUID, email: Optional[str], phone: Optional[str]
) -> List[UUID]:
    """Customers in one organization matching an email or phone, plus every
    anonymous record that was merged into them (those are the same person).

    Email compares case-insensitively; phone in canonical E.164, the form the
    customers table stores. Neither given, nothing matches — never the whole org.
    """
    conditions = []
    if email and email.strip():
        conditions.append(func.lower(Customer.email) == email.strip().lower())
    canonical_phone = normalize_phone(phone)
    if canonical_phone:
        conditions.append(Customer.phone == canonical_phone)
    if not conditions:
        return []

    matched = {
        row.id for row in db.query(Customer.id)
        .filter(Customer.organization_id == organization_id, or_(*conditions))
    }
    return list(_with_merged_records(db, matched))


def _with_merged_records(db: Session, customer_ids: Set[UUID]) -> Set[UUID]:
    """Follow merged_into_customer_id backwards until no new record turns up."""
    found = set(customer_ids)
    frontier = set(customer_ids)
    while frontier:
        frontier = {
            row.id for row in db.query(Customer.id)
            .filter(Customer.merged_into_customer_id.in_(frontier))
        } - found
        found |= frontier
    return found


def erase_sessions(db: Session, session_ids: Iterable[UUID]) -> ErasureResult:
    """Delete conversations and everything recorded about them."""
    return _in_batches(db, session_ids, _erase_session_batch)


def erase_customers(db: Session, customer_ids: Iterable[UUID]) -> ErasureResult:
    """Delete customers outright, with their conversations, leads and tickets."""
    return _in_batches(db, customer_ids, _erase_customer_batch)


def _erase_session_batch(db: Session, session_ids: List[UUID]) -> ErasureResult:
    result = ErasureResult()
    messages = select(ChatHistory.id).where(ChatHistory.session_id.in_(session_ids))
    result.merge(_erase_attachments(db, FileAttachment.chat_history_id.in_(messages)))
    result.add("chat_history", _delete(db, ChatHistory, ChatHistory.session_id.in_(session_ids)))
    result.add("ratings", _delete(db, Rating, Rating.session_id.in_(session_ids)))
    result.add("ticket_sessions", _delete(db, TicketSession, TicketSession.session_id.in_(session_ids)))
    result.add("channel_conversations", _delete(
        db, ChannelConversation, ChannelConversation.session_id.in_(session_ids)))
    result.add("guardrail_events", _delete(db, GuardrailEvent, GuardrailEvent.session_id.in_(session_ids)))
    result.add("agent_action_calls", _delete(db, AgentActionCall, AgentActionCall.session_id.in_(session_ids)))
    _detach_lead_captures(db, session_ids)
    result.add("agent_sessions", _delete_agno_sessions(db, session_ids))
    result.add("session_to_agents", _delete(
        db, SessionToAgent, SessionToAgent.session_id.in_(session_ids)))
    return result


def _erase_customer_batch(db: Session, customer_ids: List[UUID]) -> ErasureResult:
    result = ErasureResult()
    session_ids = [
        row.session_id for row in db.query(SessionToAgent.session_id)
        .filter(SessionToAgent.customer_id.in_(customer_ids))
    ]
    result.merge(erase_sessions(db, session_ids))

    # Messages and uploads not tied to one of their sessions (a session can be
    # reassigned, an upload can precede its message).
    result.merge(_erase_attachments(db, FileAttachment.uploaded_by_customer_id.in_(customer_ids)))
    result.add("chat_history", _delete(db, ChatHistory, ChatHistory.customer_id.in_(customer_ids)))
    result.add("ratings", _delete(db, Rating, Rating.customer_id.in_(customer_ids)))
    result.add("channel_conversations", _delete(
        db, ChannelConversation, ChannelConversation.customer_id.in_(customer_ids)))

    leads = select(LeadCaptureResponse.id).where(LeadCaptureResponse.customer_id.in_(customer_ids))
    result.add("crm_sync_jobs", _delete(db, CrmSyncJob, CrmSyncJob.lead_response_id.in_(leads)))
    result.add("lead_capture_responses", _delete(
        db, LeadCaptureResponse, LeadCaptureResponse.customer_id.in_(customer_ids)))
    result.add("crm_customer_syncs", _delete(
        db, CrmCustomerSync, CrmCustomerSync.customer_id.in_(customer_ids)))

    progress = select(JourneyProgress.id).where(JourneyProgress.customer_id.in_(customer_ids))
    result.add("journey_step_progress", _delete(
        db, JourneyStepProgress, JourneyStepProgress.progress_id.in_(progress)))
    result.add("journey_progress", _delete(
        db, JourneyProgress, JourneyProgress.customer_id.in_(customer_ids)))

    result.merge(_erase_tickets(db, customer_ids))

    # Any record merged into one of these — erased with it or not (shop/redact
    # erases only some of a person's records) — loses the pointer first, or
    # the self-referencing foreign key refuses the delete.
    db.query(Customer).filter(Customer.merged_into_customer_id.in_(customer_ids)).update(
        {Customer.merged_into_customer_id: None}, synchronize_session=False)
    result.add("customers", _delete(db, Customer, Customer.id.in_(customer_ids)))
    return result


def _in_batches(db: Session, ids: Iterable[UUID],
                erase: Callable[[Session, List[UUID]], ErasureResult]) -> ErasureResult:
    result = ErasureResult()
    ids = list(dict.fromkeys(ids))
    for start in range(0, len(ids), BATCH_SIZE):
        result.merge(erase(db, ids[start:start + BATCH_SIZE]))
    return result


def orphaned_customer_ids(db: Session, customer_ids: Iterable[UUID]) -> List[UUID]:
    """Of these customers, the ones with no conversation left anywhere."""
    customer_ids = list(dict.fromkeys(customer_ids))
    still_talking: Set[UUID] = set()
    for start in range(0, len(customer_ids), BATCH_SIZE):
        batch = customer_ids[start:start + BATCH_SIZE]
        still_talking.update(
            row.customer_id for row in db.query(SessionToAgent.customer_id)
            .filter(SessionToAgent.customer_id.in_(batch))
        )
    return [cid for cid in customer_ids if cid not in still_talking]


def _erase_tickets(db: Session, customer_ids: List[UUID]) -> ErasureResult:
    result = ErasureResult()
    tickets = select(Ticket.id).where(Ticket.customer_id.in_(customer_ids))
    for model in TICKET_CHILDREN:
        result.add(model.__tablename__, _delete(db, model, model.ticket_id.in_(tickets)))
    # A ticket of someone else's that was folded into one of these keeps its
    # own content; only the pointer goes.
    db.query(Ticket).filter(Ticket.duplicate_of_ticket_id.in_(tickets)).update(
        {Ticket.duplicate_of_ticket_id: None}, synchronize_session=False)
    result.add("tickets", _delete(db, Ticket, Ticket.customer_id.in_(customer_ids)))
    return result


def _erase_attachments(db: Session, condition) -> ErasureResult:
    result = ErasureResult()
    rows = db.query(FileAttachment.id, FileAttachment.file_url).filter(condition).all()
    if not rows:
        return result
    result.attachment_urls.extend(row.file_url for row in rows)
    result.add("file_attachments", _delete(
        db, FileAttachment, FileAttachment.id.in_([row.id for row in rows])))
    return result


def _detach_lead_captures(db: Session, session_ids: List[UUID]) -> None:
    """A lead capture belongs to the customer, not the conversation: when only
    a session goes (shop/redact), the customer erasure decides its fate. The
    session pointer has no cascade, so it is cleared here."""
    db.query(LeadCaptureResponse).filter(LeadCaptureResponse.session_id.in_(session_ids)).update(
        {LeadCaptureResponse.session_id: None}, synchronize_session=False)


def _delete_agno_sessions(db: Session, session_ids: List[UUID]) -> int:
    """agno keeps its own copy of each transcript, keyed by our session id."""
    if db.get_bind().dialect.name != "postgresql":
        return 0
    exists = db.execute(text("SELECT to_regclass(:table)"), {"table": AGNO_SESSIONS_TABLE}).scalar()
    if not exists:
        return 0
    statement = text(
        f"DELETE FROM {AGNO_SESSIONS_TABLE} WHERE session_id IN :ids"
    ).bindparams(bindparam("ids", expanding=True))
    return db.execute(statement, {"ids": [str(sid) for sid in session_ids]}).rowcount or 0


def _delete(db: Session, model, condition) -> int:
    return db.query(model).filter(condition).delete(synchronize_session=False)

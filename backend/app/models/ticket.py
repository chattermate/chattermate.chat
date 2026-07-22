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

import enum
import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

# Display prefix for ticket numbers (TKT-1024). Also mirrored into
# session_to_agents.ticket_id so existing session/widget consumers keep working.
TICKET_NUMBER_PREFIX = "TKT"

# FastEmbed model used for dedup/similarity embeddings. The dimension is baked
# into the tickets.embedding column — changing models requires a re-embed
# migration.
TICKET_EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"
TICKET_EMBEDDING_DIM = 384


class _ValueStrEnum(str, enum.Enum):
    """str-enum whose str() is the value — so in-memory enum instances and
    refreshed-from-DB plain strings render identically (session mirroring,
    ai_state comparisons, API payloads)."""

    def __str__(self) -> str:  # pragma: no cover - trivial
        return self.value


class TicketStatus(_ValueStrEnum):
    OPEN = "open"
    TRIAGING = "triaging"                # AI triage running
    INVESTIGATING = "investigating"      # investigation run active
    AWAITING_APPROVAL = "awaiting_approval"  # L2: resolution proposed
    IN_PROGRESS = "in_progress"          # human working it
    RESOLVED_PENDING_CONFIRMATION = "resolved_pending_confirmation"
    RESOLVED = "resolved"
    CLOSED = "closed"
    REOPENED = "reopened"


class TicketPriority(_ValueStrEnum):
    URGENT = "urgent"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TicketSource(_ValueStrEnum):
    CHAT_AI = "chat_ai"
    HUMAN_AGENT = "human_agent"
    MANUAL = "manual"
    API = "api"


class ResolutionOutcome(_ValueStrEnum):
    FIXED = "fixed"
    WORKAROUND = "workaround"
    NOT_A_BUG = "not_a_bug"
    DUPLICATE = "duplicate"
    CANNOT_REPRODUCE = "cannot_reproduce"
    CUSTOMER_UNRESPONSIVE = "customer_unresponsive"
    ESCALATED_EXTERNAL = "escalated_external"


# Statuses that count as "still open" — derived so a future status defaults to
# open rather than silently escaping open-ticket queries and dedup checks.
TERMINAL_TICKET_STATUSES = {TicketStatus.RESOLVED, TicketStatus.CLOSED}
OPEN_TICKET_STATUSES = [s.value for s in TicketStatus if s not in TERMINAL_TICKET_STATUSES]

# Legal status transitions, enforced centrally in TicketService.transition_status.
TICKET_STATUS_TRANSITIONS = {
    TicketStatus.OPEN: {
        TicketStatus.TRIAGING, TicketStatus.INVESTIGATING, TicketStatus.AWAITING_APPROVAL,
        TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED_PENDING_CONFIRMATION,
        TicketStatus.RESOLVED, TicketStatus.CLOSED,
    },
    TicketStatus.TRIAGING: {
        TicketStatus.OPEN, TicketStatus.INVESTIGATING, TicketStatus.IN_PROGRESS,
        TicketStatus.AWAITING_APPROVAL, TicketStatus.RESOLVED, TicketStatus.CLOSED,
    },
    TicketStatus.INVESTIGATING: {
        TicketStatus.OPEN, TicketStatus.AWAITING_APPROVAL, TicketStatus.IN_PROGRESS,
        TicketStatus.RESOLVED_PENDING_CONFIRMATION, TicketStatus.RESOLVED, TicketStatus.CLOSED,
    },
    TicketStatus.AWAITING_APPROVAL: {
        TicketStatus.OPEN, TicketStatus.INVESTIGATING, TicketStatus.IN_PROGRESS,
        TicketStatus.RESOLVED_PENDING_CONFIRMATION, TicketStatus.RESOLVED, TicketStatus.CLOSED,
    },
    TicketStatus.IN_PROGRESS: {
        TicketStatus.OPEN, TicketStatus.INVESTIGATING, TicketStatus.AWAITING_APPROVAL,
        TicketStatus.RESOLVED_PENDING_CONFIRMATION, TicketStatus.RESOLVED, TicketStatus.CLOSED,
    },
    TicketStatus.RESOLVED_PENDING_CONFIRMATION: {
        TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.REOPENED,
    },
    TicketStatus.RESOLVED: {TicketStatus.CLOSED, TicketStatus.REOPENED},
    TicketStatus.CLOSED: {TicketStatus.REOPENED},
    TicketStatus.REOPENED: {
        TicketStatus.TRIAGING, TicketStatus.INVESTIGATING, TicketStatus.AWAITING_APPROVAL,
        TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED_PENDING_CONFIRMATION,
        TicketStatus.RESOLVED, TicketStatus.CLOSED,
    },
}


class Ticket(Base):
    """A native support ticket — the aggregate root of the AI-first ticketing
    feature. Decoupled from chat sessions: a ticket may aggregate 0..n linked
    sessions via TicketSession; a session spawns at most one native ticket.

    Status/priority/source/outcome columns are plain strings (values from the
    str enums above, mirroring faq_generation_jobs) so new values never need an
    ALTER TYPE migration.
    """
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Per-org monotonically increasing display number (TKT-{n}), allocated from
    # ticket_sequences with SELECT ... FOR UPDATE in the same transaction that
    # commits the ticket.
    ticket_number = Column(Integer, nullable=False)
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Nullable: manual/internal tickets may have no customer.
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)

    title = Column(String(500), nullable=False)
    # Preserved when AI triage rewrites the title.
    original_title = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)

    status = Column(String, nullable=False, default=TicketStatus.OPEN, index=True)
    priority = Column(String, nullable=False, default=TicketPriority.MEDIUM)
    # SEV-1..3 (1 = worst). Nullable — set by triage or humans, not required.
    severity = Column(Integer, nullable=True)
    source = Column(String, nullable=False, default=TicketSource.MANUAL)

    # AI triage output.
    intent = Column(String, nullable=True)
    triage_confidence = Column(Float, nullable=True)
    ai_summary = Column(Text, nullable=True)
    # ["payments", "ledger"] — rendered as the "payments · ledger" sub-line.
    tags = Column(JSON, nullable=True)

    # Assignment. All nullable: an unassigned open ticket with an active
    # investigation run is "AI-owned" in the UI.
    assignee_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id", ondelete="SET NULL"), nullable=True)
    # Which chat agent created it (source=chat_ai).
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="SET NULL"), nullable=True)

    # Dedup: cosine similarity over FastEmbed embeddings (pgvector).
    duplicate_of_ticket_id = Column(UUID(as_uuid=True), ForeignKey("tickets.id", ondelete="SET NULL"), nullable=True)
    embedding = Column(Vector(TICKET_EMBEDDING_DIM), nullable=True)

    # Resolution. resolution_summary is internal; customer_resolution_message
    # is the separate plain-language text sent to the customer.
    resolution_outcome = Column(String, nullable=True)
    resolution_summary = Column(Text, nullable=True)
    customer_resolution_message = Column(Text, nullable=True)
    # Who resolved it ('ai' | 'user') — powers the AI-resolved stat and the
    # AI-state list column without scanning activities.
    resolved_by_actor = Column(String, nullable=True)

    # SLA timestamps.
    first_response_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    closed_at = Column(DateTime(timezone=True), nullable=True)
    confirmation_requested_at = Column(DateTime(timezone=True), nullable=True)
    reopened_count = Column(Integer, nullable=False, default=0, server_default="0")

    # CSAT. The ask goes out on close (csat_requested_at); the score arrives
    # later, when the customer rates the linked conversation — see
    # app/services/ticket_csat.py for the capture path and why it is
    # conversation-only.
    csat_requested_at = Column(DateTime(timezone=True), nullable=True)
    csat_score = Column(Integer, nullable=True)
    csat_rating_id = Column(UUID(as_uuid=True), ForeignKey("ratings.id", ondelete="SET NULL"), nullable=True)
    csat_responded_at = Column(DateTime(timezone=True), nullable=True)

    # Optional one-way escalation reference (e.g. 'JIRA' + issue key + URL).
    external_ref_type = Column(String, nullable=True)
    external_ref_id = Column(String, nullable=True)
    external_ref_url = Column(String, nullable=True)

    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    organization = relationship("Organization")
    customer = relationship("Customer")
    assignee = relationship("User", foreign_keys=[assignee_user_id])
    created_by = relationship("User", foreign_keys=[created_by_user_id])
    group = relationship("UserGroup")
    agent = relationship("Agent")
    duplicate_of = relationship("Ticket", remote_side=[id])
    sessions = relationship("TicketSession", back_populates="ticket", cascade="all, delete-orphan")
    activities = relationship(
        "TicketActivity",
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="TicketActivity.created_at",
    )

    __table_args__ = (
        UniqueConstraint("organization_id", "ticket_number", name="uq_tickets_org_number"),
        Index("ix_tickets_org_status", "organization_id", "status"),
        Index("ix_tickets_org_assignee", "organization_id", "assignee_user_id"),
        Index("ix_tickets_org_created", "organization_id", "created_at"),
        # Drives the CSAT stat (AI- vs human-resolved averages over a window).
        Index("ix_tickets_org_csat", "organization_id", "csat_responded_at"),
        # NOTE: production also has an HNSW cosine index on embedding — it
        # lives only in the migration (sqlite tests can't compile it).
    )

    @property
    def display_number(self) -> str:
        return f"{TICKET_NUMBER_PREFIX}-{self.ticket_number}"


class TicketSequence(Base):
    """Per-org allocator for ticket display numbers. Read with
    SELECT ... FOR UPDATE and committed together with the ticket row.
    """
    __tablename__ = "ticket_sequences"

    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        primary_key=True,
    )
    next_number = Column(Integer, nullable=False, default=1)


class TicketSession(Base):
    """Link table between tickets and chat sessions. A link table (rather than
    an FK on session_to_agents) so merged/duplicate tickets can aggregate
    sessions. The legacy session_to_agents.ticket_* columns are kept as a
    denormalized mirror for existing consumers.
    """
    __tablename__ = "ticket_sessions"

    ticket_id = Column(UUID(as_uuid=True), ForeignKey("tickets.id", ondelete="CASCADE"), primary_key=True)
    session_id = Column(
        UUID(as_uuid=True),
        ForeignKey("session_to_agents.session_id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    )
    linked_at = Column(DateTime(timezone=True), server_default=func.now())

    ticket = relationship("Ticket", back_populates="sessions")
    session = relationship("SessionToAgent")

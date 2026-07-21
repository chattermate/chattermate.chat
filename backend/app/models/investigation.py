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

from sqlalchemy import (
    BigInteger,
    Boolean,
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
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import expression, func

from app.database import Base


from app.models.ticket import _ValueStrEnum


class InvestigationRunType(_ValueStrEnum):
    TRIAGE = "triage"
    INVESTIGATION = "investigation"


class InvestigationRunStatus(_ValueStrEnum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    BUDGET_EXCEEDED = "budget_exceeded"


class InvestigationTrigger(_ValueStrEnum):
    AUTO_ON_CREATE = "auto_on_create"
    MANUAL = "manual"
    RETRY = "retry"
    REJECTION_FEEDBACK = "rejection_feedback"


# Derived like ACTIVE_FAQ_JOB_STATUSES: a future status defaults to "active"
# rather than silently escaping the worker poll and duplicate-run guards.
TERMINAL_RUN_STATUSES = {
    InvestigationRunStatus.COMPLETED,
    InvestigationRunStatus.FAILED,
    InvestigationRunStatus.CANCELLED,
    InvestigationRunStatus.BUDGET_EXCEEDED,
}
ACTIVE_RUN_STATUSES = [s.value for s in InvestigationRunStatus if s not in TERMINAL_RUN_STATUSES]


class InvestigationRun(Base):
    """One AI triage/investigation pass over a ticket. Doubles as the worker
    queue table — the ticket_investigator worker polls status='pending' rows,
    mirroring the faq_generation_jobs pattern.
    """
    __tablename__ = "investigation_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    run_type = Column(String, nullable=False, default=InvestigationRunType.TRIAGE)
    status = Column(String, nullable=False, default=InvestigationRunStatus.PENDING)
    trigger = Column(String, nullable=False, default=InvestigationTrigger.AUTO_ON_CREATE)
    requested_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    # Free-text context for the run, e.g. the human's rejection reason feeding
    # a refined investigation.
    context_note = Column(Text, nullable=True)

    # Budgets and actuals (cost tracking mirrors FAQGenerationJob.llm_calls).
    max_tool_calls = Column(Integer, nullable=False, default=25, server_default="25")
    max_wall_seconds = Column(Integer, nullable=False, default=600, server_default="600")
    tool_calls_used = Column(Integer, nullable=False, default=0, server_default="0")
    llm_calls = Column(Integer, nullable=False, default=0, server_default="0")
    input_tokens = Column(BigInteger, nullable=False, default=0, server_default="0")
    output_tokens = Column(BigInteger, nullable=False, default=0, server_default="0")
    model_name = Column(String, nullable=True)
    # True when this run's LLM usage counts against the org's message budget —
    # set only for the platform-hosted model (own-key orgs pay their provider
    # directly). Mirrors FAQGenerationJob.metered; summed by the enterprise
    # message-limit check.
    metered = Column(Boolean, nullable=False, default=False, server_default="false")

    error = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    ticket = relationship("Ticket")

    __table_args__ = (
        # Keeps the worker's poll O(active rows) as terminal rows accumulate.
        Index(
            "ix_investigation_runs_active",
            "status",
            postgresql_where=(status.in_(ACTIVE_RUN_STATUSES)),
        ),
    )


class HypothesisStatus(_ValueStrEnum):
    PENDING = "pending"
    TESTING = "testing"
    VALIDATED = "validated"
    INVALIDATED = "invalidated"
    INCONCLUSIVE = "inconclusive"


class InvestigationHypothesis(Base):
    """One hypothesis (H1..Hn) of an investigation run. Each is tested with
    bounded tool calls and marked validated/invalidated/inconclusive with a
    confidence — the glass-box UI renders these as cards."""
    __tablename__ = "investigation_hypotheses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(
        UUID(as_uuid=True),
        ForeignKey("investigation_runs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    ticket_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # 1-based display order (H1, H2, ...).
    idx = Column(Integer, nullable=False, default=1)
    title = Column(String(300), nullable=False)
    rationale = Column(Text, nullable=True)
    status = Column(String, nullable=False, default=HypothesisStatus.PENDING)
    confidence = Column(Float, nullable=True)
    # What testing showed, written after the verdict.
    conclusion = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class InvestigationEventType(_ValueStrEnum):
    # A phase marker ("Generating hypotheses", "Testing H2") — powers the
    # live ticker line.
    PHASE = "phase"
    TOOL_CALL = "tool_call"


class InvestigationEvent(Base):
    """Evidence is a first-class row, never just markdown: every tool call the
    investigator makes is captured here (query, result snippet, timing) via
    agno tool_hooks. RCA citations and the glass-box UI derive from these."""
    __tablename__ = "investigation_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(
        UUID(as_uuid=True),
        ForeignKey("investigation_runs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    ticket_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    hypothesis_id = Column(
        UUID(as_uuid=True),
        ForeignKey("investigation_hypotheses.id", ondelete="SET NULL"),
        nullable=True,
    )
    # Monotonic order within the run.
    seq = Column(Integer, nullable=False, default=0)
    event_type = Column(String, nullable=False, default=InvestigationEventType.TOOL_CALL)
    # Human-readable line for phase events / the ticker.
    label = Column(String(300), nullable=True)
    tool_name = Column(String(200), nullable=True)
    # Which configured connector (MCP server) served the call.
    connector_name = Column(String(200), nullable=True)
    # PII-redacted and truncated at capture time — raw payloads never land.
    tool_input = Column(Text, nullable=True)
    tool_result = Column(Text, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (Index("ix_investigation_events_run_seq", "run_id", "seq"),)


class ProposalStatus(_ValueStrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUPERSEDED = "superseded"


class TicketProposal(Base):
    """Autonomy L2: a resolution the AI proposes and a human decides on.
    Approval resolves the ticket and notifies the customer; a rejection can
    feed a refined investigation run (the reason becomes its context_note).
    ChatterMate never executes infrastructure changes — approval records the
    decision, humans/runbooks perform any mutation."""
    __tablename__ = "ticket_proposals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    run_id = Column(
        UUID(as_uuid=True),
        ForeignKey("investigation_runs.id", ondelete="SET NULL"),
        nullable=True,
    )
    # Internal proposal: what the AI believes resolves the ticket and why.
    summary = Column(Text, nullable=False)
    # Plain-language message sent to the customer on approval.
    customer_message = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)
    status = Column(String, nullable=False, default=ProposalStatus.PENDING)
    decided_by_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    decided_at = Column(DateTime(timezone=True), nullable=True)
    reject_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    decided_by = relationship("User", foreign_keys=[decided_by_user_id])


class RCADocument(Base):
    """Structured, versioned root-cause analysis generated from captured
    evidence. customer_summary is the plain-language section a human edits and
    sends; reviewed_by_user_id powers the "reviewed by" byline."""
    __tablename__ = "rca_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    run_id = Column(
        UUID(as_uuid=True),
        ForeignKey("investigation_runs.id", ondelete="SET NULL"),
        nullable=True,
    )
    version = Column(Integer, nullable=False, default=1)

    summary = Column(Text, nullable=True)
    impact = Column(Text, nullable=True)
    # [{"time": "...", "event": "..."}] — ISO timestamps or relative labels.
    timeline = Column(JSON, nullable=True)
    investigation_log = Column(Text, nullable=True)
    # ["...", ...]
    contributing_factors = Column(JSON, nullable=True)
    # Cites hypotheses/evidence inline as [H1 · 0.92].
    conclusion = Column(Text, nullable=True)
    remediation = Column(Text, nullable=True)
    prevention = Column(Text, nullable=True)
    customer_summary = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)
    # Set when the investigation ended early (wall-clock/tool budget).
    is_partial = Column(Boolean, nullable=False, default=False, server_default=expression.false())

    generated_by = Column(String, nullable=False, default="ai", server_default="ai")
    reviewed_by_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    reviewed_by = relationship("User", foreign_keys=[reviewed_by_user_id])

    __table_args__ = (
        UniqueConstraint("ticket_id", "version", name="uq_rca_documents_ticket_version"),
    )

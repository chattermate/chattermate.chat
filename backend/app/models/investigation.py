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

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

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

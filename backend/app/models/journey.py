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
    Boolean, Column, DateTime, ForeignKey, Index, Integer, JSON, String, UniqueConstraint, func, text,
)
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class JourneyStatus(str, enum.Enum):
    DRAFT = "draft"
    LIVE = "live"
    PAUSED = "paused"

    def __str__(self) -> str:  # pragma: no cover - trivial
        return self.value


class ProgressStatus(str, enum.Enum):
    ACTIVE = "active"
    FINISHED = "finished"
    DISMISSED = "dismissed"

    def __str__(self) -> str:  # pragma: no cover - trivial
        return self.value


class Journey(Base):
    """A step-by-step path an agent guides the customer's users through.

    `definition` holds the audience, start trigger and steps, validated by
    app.models.schemas.journey.JourneyDefinition; the editor saves it whole.
    """

    __tablename__ = "journeys"
    __table_args__ = (UniqueConstraint("agent_id", "key", name="uq_journeys_agent_key"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True)
    key = Column(String(64), nullable=False)
    name = Column(String(120), nullable=False)
    status = Column(String(16), nullable=False, default=JourneyStatus.DRAFT.value, server_default=JourneyStatus.DRAFT.value)
    # Lower runs first when several journeys match one user.
    priority = Column(Integer, nullable=False, default=0, server_default="0")
    # Open the chat panel by itself once per step.
    auto_open = Column(Boolean, nullable=False, default=False, server_default="false")
    # A host event that counts as "goal reached" in the funnel.
    goal_event = Column(String(64), nullable=True)
    version = Column(Integer, nullable=False, default=1, server_default="1")
    template_key = Column(String(64), nullable=True)
    definition = Column(JSON, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class JourneyProgress(Base):
    """One user's way through one journey."""

    __tablename__ = "journey_progress"
    __table_args__ = (
        UniqueConstraint("journey_id", "customer_id", name="uq_journey_progress_journey_customer"),
        # One active journey per user per agent.
        Index(
            "uq_journey_progress_one_active", "agent_id", "customer_id", unique=True,
            postgresql_where=text("status = 'active'"), sqlite_where=text("status = 'active'"),
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    journey_id = Column(UUID(as_uuid=True), ForeignKey("journeys.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    journey_version = Column(Integer, nullable=False)
    status = Column(String(16), nullable=False, default=ProgressStatus.ACTIVE.value, server_default=ProgressStatus.ACTIVE.value)
    current_step_id = Column(String(64), nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    goal_at = Column(DateTime(timezone=True), nullable=True)
    last_seen_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class JourneyStepProgress(Base):
    """When one user reached, finished or skipped one step: what the funnel counts."""

    __tablename__ = "journey_step_progress"

    progress_id = Column(UUID(as_uuid=True), ForeignKey("journey_progress.id", ondelete="CASCADE"), primary_key=True)
    step_id = Column(String(64), primary_key=True)
    reached_at = Column(DateTime(timezone=True), nullable=True)
    done_at = Column(DateTime(timezone=True), nullable=True)
    skipped_at = Column(DateTime(timezone=True), nullable=True)
    # What finished it: action:<name>, event:<name>, ctx:<field>, or skip.
    done_by = Column(String(80), nullable=True)
    # The opening message was shown for this step (it is shown once).
    shown_at = Column(DateTime(timezone=True), nullable=True)


class AgentContextKey(Base):
    """A context field a page sent for an agent, for the editor's variable list."""

    __tablename__ = "agent_context_keys"

    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), primary_key=True)
    key = Column(String(48), primary_key=True)
    source = Column(String(16), nullable=False)  # token | context
    last_seen_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

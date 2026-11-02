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
    Boolean, Column, DateTime, ForeignKey, Index, Integer, JSON, String, Text,
    UniqueConstraint, false, func, true,
)
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class ActionConfirmPolicy(str, enum.Enum):
    """When the visitor must approve an action before the host page runs it.

    Stored as a plain string (not a DB enum) so a new policy never needs a
    migration. The widget enforces it, so the model cannot skip it.
    """

    NEVER = "never"
    ALWAYS = "always"
    WHEN_OVERWRITING = "when_overwriting"

    def __str__(self) -> str:  # pragma: no cover - trivial
        return self.value


class ActionCallStatus(str, enum.Enum):
    """Lifecycle of one call the model asked the host page to make."""

    PENDING = "pending"
    OK = "ok"
    ERROR = "error"
    DECLINED = "declined"
    TIMEOUT = "timeout"
    SKIPPED = "skipped"
    ABANDONED = "abandoned"

    def __str__(self) -> str:  # pragma: no cover - trivial
        return self.value


class AgentAction(Base):
    """Something an agent may ask the customer's web app to do for the visitor.

    The customer declares it here; their page supplies the code with
    `ChatterMate.registerActions`. Only actions that are declared, enabled and
    registered on the current page are offered to the model.
    """

    __tablename__ = "agent_actions"
    __table_args__ = (
        UniqueConstraint("agent_id", "name", name="uq_agent_actions_agent_name"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String(64), nullable=False)
    label = Column(String(80), nullable=False)
    # What the action does, written for the model (it reads this to decide).
    description = Column(Text, nullable=False)
    # JSON Schema (type: object) for the arguments, validated on write.
    parameters = Column(JSON, nullable=False)
    confirm = Column(String(24), nullable=False, default=ActionConfirmPolicy.NEVER.value, server_default=ActionConfirmPolicy.NEVER.value)
    timeout_s = Column(Integer, nullable=False)
    # Opens a host form for IDs, bank or health details; never takes them as arguments.
    sensitive_form = Column(Boolean, nullable=False, default=False, server_default=false())
    enabled = Column(Boolean, nullable=False, default=True, server_default=true())
    # Last time a page registered code for this action (shown as "Seen").
    last_registered_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AgentActionCall(Base):
    """One call the model made to a host action, kept for auditing and so a
    paused run can resume on any worker. Never stores raw arguments: only a
    hash plus an encrypted copy, because they may hold visitor data; the copy is
    what lets a later call be sent, or a call be replayed after a reconnect."""

    __tablename__ = "agent_action_calls"
    __table_args__ = (
        Index("ix_agent_action_calls_session_status", "session_id", "status"),
        Index("ix_agent_action_calls_run", "run_id"),
        UniqueConstraint("run_id", "tool_call_id", name="uq_agent_action_calls_run_tool_call"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    action_id = Column(UUID(as_uuid=True), ForeignKey("agent_actions.id", ondelete="SET NULL"), nullable=True)
    action_name = Column(String(64), nullable=False)
    session_id = Column(UUID(as_uuid=True), nullable=False)
    run_id = Column(String(64), nullable=False)
    # The model's tool-call id. Only unique within a run (some providers reuse
    # ids like call_0), so the widget is given this row's id instead.
    tool_call_id = Column(String(128), nullable=False)
    seq = Column(Integer, nullable=False)
    status = Column(String(16), nullable=False, default=ActionCallStatus.PENDING.value, server_default=ActionCallStatus.PENDING.value)
    confirmed = Column(Boolean, nullable=True)
    args_hash = Column(String(64), nullable=False)
    args_ciphertext = Column(Text, nullable=True)
    # What the model will read for this call (encrypted; may echo visitor data).
    result_ciphertext = Column(Text, nullable=True)
    error_code = Column(String(48), nullable=True)
    latency_ms = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

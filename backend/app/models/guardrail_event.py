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

import uuid

from sqlalchemy import (
    JSON,
    TIMESTAMP,
    Boolean,
    Column,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    UUID,
    func,
)

from app.core.encryption import EncryptedText
from app.database import Base


class GuardrailEvent(Base):
    """One row per guardrail trigger across every surface (widget, channels,
    workflow, help center).

    Append-only: this is the record that answers "is off-topic abuse actually
    material?" and "is a rule wrongly refusing real customers?" — the review
    gate before any detection rule is promoted from counting to blocking. Rows
    are never updated; erasing a conversation removes its rows with it.

    `matched` holds rule ids / short match tokens ONLY — the column is plain
    JSON (unencrypted), so raw visitor text must never land in it. The
    reviewable text lives in `excerpt`, which is encrypted at rest exactly
    like ChatHistory.message.
    """

    __tablename__ = "guardrail_events"
    __table_args__ = (
        # Declared here as well as in the migration so autogenerate never
        # proposes dropping them and the sqlite test schema matches Postgres.
        Index("ix_guardrail_events_org_created", "organization_id", "created_at"),
        Index("ix_guardrail_events_rule_created", "rule", "created_at"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=True,
    )
    agent_id = Column(
        UUID(as_uuid=True), ForeignKey("agents.id", ondelete="SET NULL"), nullable=True
    )
    # No FK: a help-center /ask event has no chat session at all.
    session_id = Column(UUID(as_uuid=True), nullable=True)
    # widget | channel | workflow | help_center
    surface = Column(String(20), nullable=False)
    # inbound | output
    layer = Column(String(16), nullable=False)
    # Stable rule id, e.g. injection.frame_tokens, offtopic.model_refused
    rule = Column(String(64), nullable=False)
    # blocked | counted | replaced
    action = Column(String(16), nullable=False)
    score = Column(Float, nullable=True)
    # Rule ids / short match tokens only — NEVER raw visitor text (plain JSON).
    matched = Column(JSON, default=None, nullable=True)
    # Input length so wasted-token cost is estimable (~ char_len / 4).
    char_len = Column(Integer, nullable=True)
    # First 300 chars of the offending text, encrypted at rest; gated by
    # GUARDRAIL_STORE_EXCERPT.
    excerpt = Column(EncryptedText, nullable=True)
    # Review workflow: precision denominator for the strict-mode decision.
    reviewed = Column(Boolean, default=False, nullable=False)
    false_positive = Column(Boolean, default=False, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

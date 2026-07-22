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

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

# Reuse the ORM enums so the API contract can never drift from the DB.
from app.models.investigation import InvestigationRunStatus, InvestigationRunType
from app.models.ticket import ResolutionOutcome, TicketPriority, TicketSource, TicketStatus
from app.models.ticket_activity import TicketActivityType, TicketActorType
from app.models.schemas.pagination import Pagination

MAX_TITLE_LENGTH = 500
MAX_DESCRIPTION_LENGTH = 20000
MAX_COMMENT_LENGTH = 10000
MAX_TAGS = 5


class TicketCreate(BaseModel):
    title: str = Field(min_length=1, max_length=MAX_TITLE_LENGTH)
    description: Optional[str] = Field(default=None, max_length=MAX_DESCRIPTION_LENGTH)
    priority: TicketPriority = TicketPriority.MEDIUM
    severity: Optional[int] = Field(default=None, ge=1, le=3)
    tags: Optional[List[str]] = Field(default=None, max_length=MAX_TAGS)
    customer_id: Optional[UUID] = None
    # Manual tickets: resolve/create the customer by email so direct-email
    # notifications have somewhere to go. Ignored when customer_id is set.
    customer_email: Optional[EmailStr] = None
    customer_name: Optional[str] = Field(default=None, max_length=200)
    session_id: Optional[UUID] = None
    assignee_user_id: Optional[UUID] = None
    group_id: Optional[UUID] = None

    @field_validator("title")
    @classmethod
    def _strip_title(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("must not be blank")
        return v


class TicketUpdate(BaseModel):
    """Partial update — omitted fields keep their current values (apply with
    model_dump(exclude_unset=True))."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=MAX_TITLE_LENGTH)
    description: Optional[str] = Field(default=None, max_length=MAX_DESCRIPTION_LENGTH)
    # Set/replace the ticket's customer by email (find-or-create in the org).
    customer_email: Optional[EmailStr] = None
    customer_name: Optional[str] = Field(default=None, max_length=200)
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    severity: Optional[int] = Field(default=None, ge=1, le=3)
    tags: Optional[List[str]] = Field(default=None, max_length=MAX_TAGS)
    assignee_user_id: Optional[UUID] = None
    group_id: Optional[UUID] = None
    resolution_outcome: Optional[ResolutionOutcome] = None
    resolution_summary: Optional[str] = Field(default=None, max_length=MAX_DESCRIPTION_LENGTH)
    customer_resolution_message: Optional[str] = Field(default=None, max_length=MAX_DESCRIPTION_LENGTH)


class TicketCommentCreate(BaseModel):
    body: str = Field(min_length=1, max_length=MAX_COMMENT_LENGTH)
    is_internal: bool = True

    @field_validator("body")
    @classmethod
    def _strip_body(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("must not be blank")
        return v


class TicketReopen(BaseModel):
    reason: Optional[str] = Field(default=None, max_length=MAX_COMMENT_LENGTH)


class TicketResolve(BaseModel):
    outcome: ResolutionOutcome = ResolutionOutcome.FIXED
    resolution_summary: Optional[str] = Field(default=None, max_length=MAX_DESCRIPTION_LENGTH)
    customer_message: Optional[str] = Field(default=None, max_length=MAX_DESCRIPTION_LENGTH)


class TicketUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    full_name: Optional[str] = None
    email: Optional[str] = None


class TicketCustomerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    email: Optional[str] = None
    full_name: Optional[str] = None


class TicketActivityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    activity_type: TicketActivityType
    actor_type: TicketActorType
    actor_user_id: Optional[UUID] = None
    actor_name: Optional[str] = None
    body: Optional[str] = None
    is_internal: bool = True
    activity_metadata: Optional[dict] = None
    created_at: Optional[datetime] = None


class InvestigationRunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    run_type: InvestigationRunType
    status: InvestigationRunStatus
    trigger: str
    error: Optional[str] = None
    tool_calls_used: int = 0
    max_tool_calls: int = 25
    model_name: Optional[str] = None
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


class HypothesisOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    idx: int
    title: str
    rationale: Optional[str] = None
    status: str
    confidence: Optional[float] = None
    conclusion: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class InvestigationEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    hypothesis_id: Optional[UUID] = None
    seq: int
    event_type: str
    label: Optional[str] = None
    tool_name: Optional[str] = None
    connector_name: Optional[str] = None
    tool_input: Optional[str] = None
    tool_result: Optional[str] = None
    duration_ms: Optional[int] = None
    error: Optional[str] = None
    created_at: Optional[datetime] = None


class RCADocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    run_id: Optional[UUID] = None
    version: int
    summary: Optional[str] = None
    impact: Optional[str] = None
    timeline: Optional[list] = None
    investigation_log: Optional[str] = None
    contributing_factors: Optional[list] = None
    conclusion: Optional[str] = None
    remediation: Optional[str] = None
    prevention: Optional[str] = None
    customer_summary: Optional[str] = None
    confidence: Optional[float] = None
    is_partial: bool = False
    generated_by: str = "ai"
    reviewed_by_user_id: Optional[UUID] = None
    reviewed_by_name: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ProposalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    run_id: Optional[UUID] = None
    summary: str
    customer_message: Optional[str] = None
    confidence: Optional[float] = None
    status: str
    decided_by_user_id: Optional[UUID] = None
    decided_by_name: Optional[str] = None
    decided_at: Optional[datetime] = None
    reject_reason: Optional[str] = None
    created_at: Optional[datetime] = None


class ProposalRejectRequest(BaseModel):
    reason: Optional[str] = Field(default=None, max_length=MAX_COMMENT_LENGTH)
    # Re-enqueue a refined investigation with the reason as context.
    reinvestigate: bool = False


class InvestigationDetailResponse(BaseModel):
    """Glass-box payload for the ticket detail page: the (latest or requested)
    investigation run with its hypotheses, evidence events and RCA document."""
    run: Optional[InvestigationRunOut] = None
    hypotheses: List[HypothesisOut] = []
    events: List[InvestigationEventOut] = []
    rca: Optional[RCADocumentOut] = None
    # Latest proposal (any status) — drives the approval banner.
    proposal: Optional[ProposalOut] = None


class RcaUpdate(BaseModel):
    customer_summary: Optional[str] = Field(default=None, max_length=MAX_DESCRIPTION_LENGTH)
    # Stamp the caller as reviewer ("generated by AI · reviewed by …").
    mark_reviewed: bool = False


class InvestigateRequest(BaseModel):
    run_type: InvestigationRunType = InvestigationRunType.INVESTIGATION
    # Free-text context for the run, e.g. what to focus on this time.
    context_note: Optional[str] = Field(default=None, max_length=4000)


class TicketOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    ticket_number: int
    display_number: str
    organization_id: UUID
    customer_id: Optional[UUID] = None
    title: str
    original_title: Optional[str] = None
    description: Optional[str] = None
    status: TicketStatus
    priority: TicketPriority
    severity: Optional[int] = None
    source: TicketSource
    intent: Optional[str] = None
    triage_confidence: Optional[float] = None
    ai_summary: Optional[str] = None
    tags: Optional[List[str]] = None
    assignee_user_id: Optional[UUID] = None
    group_id: Optional[UUID] = None
    agent_id: Optional[UUID] = None
    duplicate_of_ticket_id: Optional[UUID] = None
    resolution_outcome: Optional[ResolutionOutcome] = None
    resolution_summary: Optional[str] = None
    customer_resolution_message: Optional[str] = None
    first_response_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    confirmation_requested_at: Optional[datetime] = None
    reopened_count: int = 0
    csat_requested_at: Optional[datetime] = None
    csat_score: Optional[int] = None
    csat_responded_at: Optional[datetime] = None
    external_ref_type: Optional[str] = None
    external_ref_id: Optional[str] = None
    external_ref_url: Optional[str] = None
    created_by_user_id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    # Derived UI fields.
    ai_state: Optional[str] = None
    sla_due_at: Optional[datetime] = None
    assignee: Optional[TicketUserOut] = None
    customer: Optional[TicketCustomerOut] = None


class TicketListItem(BaseModel):
    """Slim row for the list view."""
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    ticket_number: int
    display_number: str
    title: str
    status: TicketStatus
    priority: TicketPriority
    tags: Optional[List[str]] = None
    assignee_user_id: Optional[UUID] = None
    assignee_name: Optional[str] = None
    ai_state: Optional[str] = None
    sla_due_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class TicketListResponse(BaseModel):
    tickets: List[TicketListItem]
    pagination: Pagination


class TicketDetailResponse(BaseModel):
    ticket: TicketOut
    activities: List[TicketActivityOut]
    runs: List[InvestigationRunOut]
    linked_session_ids: List[UUID]
    possible_duplicates: List[TicketListItem] = []
    # Whether any outbound path to the customer exists (linked conversation or
    # customer email) — gates the "send to customer" affordances in the UI.
    can_notify_customer: bool = False


class TicketStats(BaseModel):
    open: int
    awaiting_approval: int
    sla_breaching: int
    ai_resolved_pct_7d: Optional[float] = None
    # CSAT over the trailing csat_window_days, overall and split by resolver.
    csat_avg: Optional[float] = None
    csat_ai_avg: Optional[float] = None
    csat_human_avg: Optional[float] = None
    csat_responses: int = 0
    csat_window_days: int = 30


class SlaTarget(BaseModel):
    first_response_minutes: int = Field(gt=0, le=60 * 24 * 30)
    resolution_minutes: int = Field(gt=0, le=60 * 24 * 90)


class TicketSettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    autonomy_level: int
    auto_investigate_on_create: bool
    min_confidence_to_auto_resolve: float
    confirmation_timeout_hours: int
    csat_enabled: bool
    sla_targets: Optional[dict] = None
    created_template: Optional[str] = None
    resolved_template: Optional[str] = None
    jira_escalation_enabled: bool
    jira_escalation_priority: Optional[str] = None
    investigation_mcp_tool_ids: Optional[List[int]] = None
    alert_webhook_enabled: bool
    # Only exposed to settings managers; forms the intake URL path.
    alert_webhook_secret: Optional[str] = None
    max_tool_calls_per_run: int
    max_runs_per_ticket: int


class TicketSettingsUpdate(BaseModel):
    autonomy_level: Optional[int] = Field(default=None, ge=1, le=3)
    auto_investigate_on_create: Optional[bool] = None
    min_confidence_to_auto_resolve: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    confirmation_timeout_hours: Optional[int] = Field(default=None, ge=1, le=24 * 30)
    csat_enabled: Optional[bool] = None
    sla_targets: Optional[dict] = None
    created_template: Optional[str] = Field(default=None, max_length=2000)
    resolved_template: Optional[str] = Field(default=None, max_length=2000)
    jira_escalation_enabled: Optional[bool] = None
    jira_escalation_priority: Optional[TicketPriority] = None
    investigation_mcp_tool_ids: Optional[List[int]] = None
    alert_webhook_enabled: Optional[bool] = None
    max_tool_calls_per_run: Optional[int] = Field(default=None, ge=1, le=100)
    max_runs_per_ticket: Optional[int] = Field(default=None, ge=1, le=10)

    @field_validator("sla_targets")
    @classmethod
    def _validate_sla(cls, v: Optional[dict]) -> Optional[dict]:
        if v is None:
            return v
        for priority, target in v.items():
            if priority not in [p.value for p in TicketPriority]:
                raise ValueError(f"unknown priority '{priority}'")
            SlaTarget.model_validate(target)
        return v

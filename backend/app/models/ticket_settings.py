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

from sqlalchemy import JSON, Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import expression, func

from app.database import Base

# Staged autonomy levels — enforced in code (TicketService/worker), never just
# in the prompt.
AUTONOMY_INVESTIGATE_ONLY = 1   # L1: investigate + summarize
AUTONOMY_PROPOSE_APPROVE = 2    # L2: propose resolution, human approves
AUTONOMY_AUTO_RESOLVE = 3       # L3: auto-resolve + notify customer

# Default customer message templates. [customer]/[ticket] placeholders are
# substituted at send time.
DEFAULT_CREATED_TEMPLATE = (
    "Hi [customer] — we've opened ticket [ticket] about your issue and our "
    "team is on it. We'll keep you posted."
)
DEFAULT_RESOLVED_TEMPLATE = (
    "Good news [customer] — ticket [ticket] is resolved. Here's what happened "
    "and what we did to fix it. Reply if anything's still off."
)

# Default SLA targets in minutes, keyed by priority value.
DEFAULT_SLA_TARGETS = {
    "urgent": {"first_response_minutes": 15, "resolution_minutes": 120},
    "high": {"first_response_minutes": 30, "resolution_minutes": 240},
    "medium": {"first_response_minutes": 120, "resolution_minutes": 1440},
    "low": {"first_response_minutes": 480, "resolution_minutes": 4320},
}


class OrganizationTicketSettings(Base):
    """Per-org AI ticketing policy: autonomy level, SLA targets, customer
    comms templates and investigation budgets. One row per organization,
    created lazily with defaults on first read.
    """
    __tablename__ = "organization_ticket_settings"

    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        primary_key=True,
    )

    autonomy_level = Column(Integer, nullable=False, default=AUTONOMY_INVESTIGATE_ONLY, server_default="1")
    auto_investigate_on_create = Column(Boolean, nullable=False, default=True, server_default=expression.true())
    min_confidence_to_auto_resolve = Column(Float, nullable=False, default=0.85)
    # resolved_pending_confirmation -> closed after this many hours without a
    # customer reply.
    confirmation_timeout_hours = Column(Integer, nullable=False, default=72, server_default="72")
    csat_enabled = Column(Boolean, nullable=False, default=True, server_default=expression.true())

    # {"urgent": {"first_response_minutes": 15, "resolution_minutes": 120}, ...}
    sla_targets = Column(JSON, nullable=True)
    # Customer message templates with [customer]/[ticket] placeholders.
    created_template = Column(Text, nullable=True)
    resolved_template = Column(Text, nullable=True)

    # Jira escalation (one-way sync). jira_escalation_priority is the minimum
    # priority value that also syncs to Jira.
    jira_escalation_enabled = Column(Boolean, nullable=False, default=False, server_default=expression.false())
    jira_escalation_priority = Column(String, nullable=True)

    # Ticket-scoped MCP connector selection (list of mcp_tools.id) —
    # deliberately separate from the chat-facing MCPToolToAgent m2m so
    # observability connectors are never handed to the customer-facing agent.
    investigation_mcp_tool_ids = Column(JSON, nullable=True)
    # Alert-webhook intake: Grafana/Datadog/CloudWatch alerts auto-open
    # tickets via POST /tickets/webhooks/alerts/{org_id}/{secret}.
    alert_webhook_enabled = Column(Boolean, nullable=False, default=False, server_default=expression.false())
    # URL-path token authenticating alert posts; rotated by re-enabling.
    alert_webhook_secret = Column(String(64), nullable=True)

    # Investigation budgets.
    max_tool_calls_per_run = Column(Integer, nullable=False, default=25, server_default="25")
    max_runs_per_ticket = Column(Integer, nullable=False, default=3, server_default="3")
    monthly_investigation_cap = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    organization = relationship("Organization")

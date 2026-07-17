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

One-way Jira escalation for native tickets: when enabled, tickets at or
above the configured priority get a mirrored Jira issue (external_ref_*).
Native ChatterMate stays the source of truth — nothing syncs back.
"""

from typing import Optional

from app.core.logger import get_logger
from app.models.jira import AgentJiraConfig, JiraToken
from app.models.organization import Organization
from app.models.ticket import Ticket
from app.models.ticket_activity import TicketActivityType, TicketActorType

logger = get_logger(__name__)

_PRIORITY_ORDER = {"urgent": 0, "high": 1, "medium": 2, "low": 3}


def _find_project_config(db, ticket: Ticket) -> Optional[AgentJiraConfig]:
    """Project/issue-type to escalate into: the ticket's agent's Jira config
    when enabled, else any enabled agent config in the organization."""
    from app.models.agent import Agent

    if ticket.agent_id is not None:
        config = (
            db.query(AgentJiraConfig)
            .filter(
                AgentJiraConfig.agent_id == str(ticket.agent_id),
                AgentJiraConfig.enabled == True,  # noqa: E712
                AgentJiraConfig.project_key.isnot(None),
            )
            .first()
        )
        if config is not None:
            return config
    return (
        db.query(AgentJiraConfig)
        .join(Agent, Agent.id == AgentJiraConfig.agent_id.cast(Agent.id.type))
        .filter(
            Agent.organization_id == ticket.organization_id,
            AgentJiraConfig.enabled == True,  # noqa: E712
            AgentJiraConfig.project_key.isnot(None),
        )
        .first()
    )


def should_escalate(ticket: Ticket, settings_row) -> bool:
    if not settings_row.jira_escalation_enabled:
        return False
    if ticket.external_ref_id:  # already escalated — one-way, never re-synced
        return False
    minimum = str(settings_row.jira_escalation_priority or "urgent")
    return _PRIORITY_ORDER.get(str(ticket.priority), 99) <= _PRIORITY_ORDER.get(minimum, 0)


async def maybe_escalate_to_jira(db, service, ticket: Ticket, settings_row) -> bool:
    """Escalate when policy matches and the org has Jira connected. Failures
    are logged, never raised — escalation must not break ticket flows."""
    if not should_escalate(ticket, settings_row):
        return False
    try:
        token = (
            db.query(JiraToken)
            .filter(JiraToken.organization_id == ticket.organization_id)
            .first()
        )
        if token is None:
            return False
        config = _find_project_config(db, ticket)
        if config is None:
            logger.info(
                f"{ticket.display_number}: Jira escalation enabled but no agent "
                "has a Jira project configured"
            )
            return False

        from app.api.jira import CreateJiraIssueModel
        from app.services.jira import JiraService

        description_parts = [
            f"Escalated from ChatterMate ticket {ticket.display_number} "
            f"(priority: {ticket.priority}, severity: {ticket.severity or 'n/a'}).",
        ]
        if ticket.ai_summary:
            description_parts.append(f"AI summary: {ticket.ai_summary}")
        if ticket.description:
            description_parts.append(ticket.description[:4000])

        organization = db.query(Organization).filter(
            Organization.id == ticket.organization_id
        ).first()
        result = await JiraService().create_issue(
            organization,
            db,
            CreateJiraIssueModel(
                projectKey=config.project_key,
                issueTypeId=config.issue_type_id,
                summary=f"[{ticket.display_number}] {ticket.title}"[:250],
                description="\n\n".join(description_parts),
            ),
        )
        issue_key = result.get("key")
        if not issue_key:
            return False
        ticket.external_ref_type = "jira"
        ticket.external_ref_id = issue_key
        ticket.external_ref_url = f"{token.site_url}/browse/{issue_key}"
        service._add_activity(
            ticket,
            TicketActivityType.JIRA_ESCALATED,
            actor_type=TicketActorType.SYSTEM,
            body=f"Escalated to Jira as {issue_key}",
            metadata={"issue_key": issue_key, "url": ticket.external_ref_url},
        )
        return True
    except Exception as e:
        logger.error(f"Jira escalation failed for {ticket.display_number}: {e}")
        return False

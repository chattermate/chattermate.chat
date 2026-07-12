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

import json
from typing import Optional
from uuid import UUID

from agno.tools import Toolkit

from app.core.exceptions import JiraAuthError
from app.core.logger import get_logger
from app.database import SessionLocal
from app.models.jira import AgentJiraConfig
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services.jira import JiraClient, get_credentials
from app.services.jira.config import DEFAULT_PRIORITY_ID, PRIORITY_NAME_TO_ID

logger = get_logger(__name__)


def _fail(message: str) -> str:
    return json.dumps({"success": False, "message": message})


class JiraTools(Toolkit):
    """Agent tools for raising and tracking Jira tickets from a conversation.

    Registered on a ChatAgent when the agent has Jira enabled. The tool methods
    are synchronous (agno calls them directly); all Jira I/O goes through the
    shared `app.services.jira` client and token manager."""

    def __init__(self, agent_id: str, org_id: str, session_id: str):
        super().__init__(name="jira_tools")
        self.agent_id = str(agent_id)
        self.org_id = str(org_id)
        self.session_id = str(session_id)
        self.register(self.create_jira_ticket)
        self.register(self.get_ticket_status)
        self.register(self.check_existing_ticket)

    def check_existing_ticket(self) -> str:
        """Check whether a Jira ticket already exists for the current session.

        Returns:
            str: JSON — {"exists": bool, "ticket_id": str, "ticket_status": str}.
        """
        try:
            with SessionLocal() as db:
                session = SessionToAgentRepository(db).get_session(self.session_id)
                if session and session.ticket_id:
                    return json.dumps({
                        "exists": True,
                        "ticket_id": session.ticket_id,
                        "ticket_status": session.ticket_status,
                    })
                return json.dumps({"exists": False})
        except Exception as e:
            logger.error(f"Error checking existing Jira ticket: {e}")
            return json.dumps({"exists": False, "message": str(e)})

    def create_jira_ticket(self, summary: str, description: str,
                           priority: Optional[str] = "Medium") -> str:
        """Create a Jira ticket for the current session, or append to the one that
        already exists (as a comment).

        Args:
            summary (str): Ticket title.
            description (str): Detailed description / the update to append.
            priority (str, optional): Highest, High, Medium, Low or Lowest.

        Returns:
            str: JSON with success, ticket_id, ticket_url and was_updated.
        """
        try:
            with SessionLocal() as db:
                config_row = db.query(AgentJiraConfig).filter(
                    AgentJiraConfig.agent_id == self.agent_id).first()
                if not config_row or not config_row.enabled:
                    return _fail("Jira integration is not enabled for this agent")
                if not config_row.project_key or not config_row.issue_type_id:
                    return _fail("Jira project or issue type is not configured for this agent")

                try:
                    creds = get_credentials(db, UUID(self.org_id))
                except JiraAuthError as e:
                    return _fail(str(e))

                client = JiraClient(creds.access_token, creds.cloud_id, creds.site_url)
                session_repo = SessionToAgentRepository(db)
                session = session_repo.get_session(self.session_id)
                existing_key = session.ticket_id if session else None

                try:
                    if existing_key:
                        client.add_comment(existing_key, description)
                        key, action = existing_key, "updated"
                    else:
                        priority_id = PRIORITY_NAME_TO_ID.get(priority or "Medium", DEFAULT_PRIORITY_ID)
                        result = client.create_issue(
                            config_row.project_key, config_row.issue_type_id,
                            summary, description, priority_id)
                        key, action = result["key"], "created"
                except JiraAuthError as e:
                    return _fail(str(e))

                ticket_url = f"{creds.site_url.rstrip('/')}/browse/{key}" if creds.site_url else None
                session_repo.update_session(self.session_id, {
                    "ticket_id": key,
                    "ticket_status": "Updated" if existing_key else "Created",
                    "ticket_summary": summary,
                    "ticket_description": description,
                    "integration_type": "JIRA",
                    "ticket_priority": priority,
                })
                return json.dumps({
                    "success": True,
                    "message": f"Ticket {action} successfully: {key}",
                    "ticket_id": key,
                    "ticket_url": ticket_url,
                    "was_updated": bool(existing_key),
                })
        except Exception as e:
            logger.error(f"Error creating/updating Jira ticket: {e}")
            return _fail(f"Error creating Jira ticket: {e}")

    def get_ticket_status(self, ticket_id: Optional[str] = None) -> str:
        """Get the status of a Jira ticket.

        Args:
            ticket_id (str, optional): Ticket key to check. Defaults to the ticket
                associated with the current session.

        Returns:
            str: JSON with status, priority, summary and ticket_url.
        """
        try:
            with SessionLocal() as db:
                if not ticket_id:
                    session = SessionToAgentRepository(db).get_session(self.session_id)
                    if not session or not session.ticket_id:
                        return json.dumps({
                            "exists": False,
                            "message": "No ticket is associated with this session",
                        })
                    ticket_id = session.ticket_id

                try:
                    creds = get_credentials(db, UUID(self.org_id))
                    client = JiraClient(creds.access_token, creds.cloud_id, creds.site_url)
                    issue = client.get_issue(ticket_id)
                except JiraAuthError as e:
                    return _fail(str(e))

                fields = issue.get("fields", {})
                ticket_url = f"{creds.site_url.rstrip('/')}/browse/{ticket_id}" if creds.site_url else None
                return json.dumps({
                    "success": True,
                    "exists": True,
                    "ticket_id": ticket_id,
                    "status": (fields.get("status") or {}).get("name", "Unknown"),
                    "priority": (fields.get("priority") or {}).get("name"),
                    "summary": fields.get("summary"),
                    "ticket_url": ticket_url,
                })
        except Exception as e:
            logger.error(f"Error getting Jira ticket status: {e}")
            return _fail(f"Error getting ticket status: {e}")

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
from contextlib import contextmanager
from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest

from app.models.jira import AgentJiraConfig
from app.models.session_to_agent import SessionToAgent
from app.services.jira.tokens import JiraCredentials
from app.tools.jira_toolkit import JiraTools

CREDS = JiraCredentials(access_token="tok", cloud_id="cloud1", site_url="https://x.atlassian.net")


@pytest.fixture
def session_row(db, test_organization, test_agent, test_customer):
    """An open session for the agent, with a Jira-enabled agent config."""
    db.add(AgentJiraConfig(
        agent_id=str(test_agent.id), enabled=True,
        project_key="PROJ", issue_type_id="10001"))
    session = SessionToAgent(
        session_id=uuid4(),
        customer_id=test_customer.id,
        agent_id=test_agent.id,
        organization_id=test_organization.id,
    )
    db.add(session)
    db.commit()
    return session


@pytest.fixture
def use_test_db(db):
    """Make the toolkit's `with SessionLocal()` use the test session."""
    @contextmanager
    def _factory():
        yield db
    with patch("app.tools.jira_toolkit.SessionLocal", _factory):
        yield


def _tools(session_row, test_agent, test_organization):
    return JiraTools(
        agent_id=str(test_agent.id),
        org_id=str(test_organization.id),
        session_id=str(session_row.session_id),
    )


def test_create_ticket_creates_when_none_exists(use_test_db, session_row, test_agent, test_organization, db):
    client = MagicMock()
    client.create_issue.return_value = {"key": "PROJ-1"}
    with patch("app.tools.jira_toolkit.get_credentials", return_value=CREDS), \
         patch("app.tools.jira_toolkit.JiraClient", return_value=client):
        result = json.loads(_tools(session_row, test_agent, test_organization)
                            .create_jira_ticket("Summary", "Body", "High"))

    assert result["success"] and result["ticket_id"] == "PROJ-1" and result["was_updated"] is False
    client.create_issue.assert_called_once()
    db.refresh(session_row)
    assert session_row.ticket_id == "PROJ-1"


def test_create_ticket_appends_comment_when_exists(use_test_db, session_row, test_agent, test_organization, db):
    session_row.ticket_id = "PROJ-9"
    db.commit()
    client = MagicMock()
    with patch("app.tools.jira_toolkit.get_credentials", return_value=CREDS), \
         patch("app.tools.jira_toolkit.JiraClient", return_value=client):
        result = json.loads(_tools(session_row, test_agent, test_organization)
                            .create_jira_ticket("Summary", "More detail"))

    assert result["success"] and result["was_updated"] is True
    client.add_comment.assert_called_once_with("PROJ-9", "More detail")
    client.create_issue.assert_not_called()


def test_create_ticket_blocked_when_disabled(use_test_db, session_row, test_agent, test_organization, db):
    config = db.query(AgentJiraConfig).filter(
        AgentJiraConfig.agent_id == str(test_agent.id)).first()
    config.enabled = False
    db.commit()
    result = json.loads(_tools(session_row, test_agent, test_organization)
                        .create_jira_ticket("S", "B"))
    assert result["success"] is False and "not enabled" in result["message"]


def test_check_existing_ticket_reflects_session(use_test_db, session_row, test_agent, test_organization, db):
    tools = _tools(session_row, test_agent, test_organization)
    assert json.loads(tools.check_existing_ticket())["exists"] is False
    session_row.ticket_id = "PROJ-5"
    db.commit()
    found = json.loads(tools.check_existing_ticket())
    assert found["exists"] is True and found["ticket_id"] == "PROJ-5"


def test_get_ticket_status_uses_session_ticket(use_test_db, session_row, test_agent, test_organization, db):
    session_row.ticket_id = "PROJ-7"
    db.commit()
    client = MagicMock()
    client.get_issue.return_value = {"fields": {
        "status": {"name": "In Progress"}, "priority": {"name": "High"}, "summary": "Sum"}}
    with patch("app.tools.jira_toolkit.get_credentials", return_value=CREDS), \
         patch("app.tools.jira_toolkit.JiraClient", return_value=client):
        result = json.loads(_tools(session_row, test_agent, test_organization).get_ticket_status())

    assert result["status"] == "In Progress" and result["ticket_id"] == "PROJ-7"
    client.get_issue.assert_called_once_with("PROJ-7")

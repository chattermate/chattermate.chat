"""
ChatterMate - Test Jira Toolkit
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from app.tools.jira_toolkit import JiraTools
from app.models.jira import AgentJiraConfig, JiraToken
from app.models.organization import Organization
from app.models.agent import Agent
from app.models.session_to_agent import SessionToAgent
from uuid import UUID

@pytest.fixture
def mock_db():
    db = MagicMock()
    
    # Mock agent
    agent = MagicMock()
    agent.id = UUID("00000000-0000-0000-0000-000000000001")
    agent.organization_id = UUID("00000000-0000-0000-0000-000000000002")
    
    # Mock organization
    org = MagicMock()
    org.id = UUID("00000000-0000-0000-0000-000000000002")
    
    # Mock Jira config
    jira_config = MagicMock()
    jira_config.enabled = True
    jira_config.project_key = "TEST"
    jira_config.issue_type_id = "10001"
    
    # Mock Jira token
    jira_token = MagicMock()
    jira_token.organization_id = UUID("00000000-0000-0000-0000-000000000002")
    jira_token.access_token = "test_access_token"
    jira_token.refresh_token = "test_refresh_token"
    jira_token.cloud_id = "test_cloud_id"
    
    # Mock session
    session = MagicMock()
    session.id = "test_session_id"
    session.ticket_id = None
    
    # Setup query results
    db.query.return_value.filter.return_value.first.side_effect = [
        agent,  # For Agent query
        org,    # For Organization query
        jira_config,  # For AgentJiraConfig query
        jira_token,   # For JiraToken query
    ]
    
    return db

@pytest.fixture
def mock_session_repo():
    repo = MagicMock()
    repo.get_session.return_value = None
    repo.update_session.return_value = True
    return repo

@pytest.fixture
def mock_jira_service():
    service = AsyncMock()
    service.create_issue.return_value = {
        "key": "TEST-123",
        "status": {"name": "Open"},
        "self": "https://example.atlassian.net/rest/api/3/issue/TEST-123"
    }
    service.validate_token.return_value = True
    return service

@pytest.mark.asyncio
async def test_create_jira_ticket(mock_db, mock_jira_service):
    # Arrange
    with patch("app.tools.jira_toolkit.JiraService", return_value=mock_jira_service):
        with patch("app.tools.jira_toolkit.SessionToAgentRepository", return_value=MagicMock()) as mock_session_repo_class:
            with patch("asyncio.run", side_effect=lambda x: x) as mock_asyncio_run:
                mock_session_repo = mock_session_repo_class.return_value
                mock_session_repo.get_session.return_value = None
                
                jira_tools = JiraTools(
                    agent_id="00000000-0000-0000-0000-000000000001",
                    org_id="00000000-0000-0000-0000-000000000002",
                    session_id="test_session_id"
                )
                jira_tools.db = mock_db
                
                # Mock the _check_existing_ticket method
                jira_tools._check_existing_ticket = AsyncMock(return_value={"exists": False})
                
                # Act
                result = jira_tools.create_jira_ticket(
                    summary="Test ticket",
                    description="This is a test ticket",
                    priority="High"
                )
                
                # Assert
                assert result["success"] is True
                assert result["ticket_id"] == "TEST-123"
                assert result["ticket_status"] == "Open"
                mock_jira_service.create_issue.assert_called_once()
                mock_session_repo.update_session.assert_called_once_with(
                    "test_session_id",
                    {
                        "ticket_id": "TEST-123",
                        "ticket_status": "Open",
                        "ticket_summary": "Test ticket",
                        "ticket_description": "This is a test ticket",
                        "integration_type": "JIRA",
                        "ticket_priority": "High"
                    }
                )

def test_check_existing_ticket_none(mock_db, mock_jira_service):
    # Arrange
    with patch("app.tools.jira_toolkit.JiraService", return_value=mock_jira_service):
        with patch("app.tools.jira_toolkit.SessionToAgentRepository", return_value=MagicMock()) as mock_session_repo_class:
            with patch("asyncio.run", side_effect=lambda x: x) as mock_asyncio_run:
                mock_session_repo = mock_session_repo_class.return_value
                mock_session_repo.get_session.return_value = None
                
                jira_tools = JiraTools(
                    agent_id="00000000-0000-0000-0000-000000000001",
                    org_id="00000000-0000-0000-0000-000000000002",
                    session_id="test_session_id"
                )
                jira_tools.db = mock_db
                
                # Mock the _check_existing_ticket method
                jira_tools._check_existing_ticket = AsyncMock(return_value={"exists": False, "message": "No ticket found for this session"})
                
                # Act
                result = jira_tools.check_existing_ticket()
                
                # Assert
                assert result["exists"] is False
                assert "No ticket found" in result["message"]

def test_check_existing_ticket_exists(mock_db, mock_jira_service):
    # Arrange
    with patch("app.tools.jira_toolkit.JiraService", return_value=mock_jira_service):
        with patch("app.tools.jira_toolkit.SessionToAgentRepository", return_value=MagicMock()) as mock_session_repo_class:
            with patch("asyncio.run", side_effect=lambda x: x) as mock_asyncio_run:
                mock_session_repo = mock_session_repo_class.return_value
                mock_session = MagicMock()
                mock_session.ticket_id = "TEST-123"
                mock_session.ticket_status = "Open"
                mock_session.ticket_summary = "Test ticket"
                mock_session.ticket_description = "This is a test ticket"
                mock_session.ticket_priority = "High"
                mock_session_repo.get_session.return_value = mock_session
                
                jira_tools = JiraTools(
                    agent_id="00000000-0000-0000-0000-000000000001",
                    org_id="00000000-0000-0000-0000-000000000002",
                    session_id="test_session_id"
                )
                jira_tools.db = mock_db
                
                # Mock the _check_existing_ticket method
                jira_tools._check_existing_ticket = AsyncMock(return_value={
                    "exists": True,
                    "ticket_id": "TEST-123",
                    "ticket_status": "In Progress",
                    "ticket_summary": "Test ticket",
                    "ticket_description": "This is a test ticket",
                    "ticket_priority": "High",
                    "ticket_url": "https://example.atlassian.net/rest/api/3/issue/TEST-123",
                    "message": "Ticket exists"
                })
                
                # Act
                result = jira_tools.check_existing_ticket()
                
                # Assert
                assert result["exists"] is True
                assert result["ticket_id"] == "TEST-123"
                assert result["ticket_status"] == "In Progress"

def test_get_ticket_status(mock_db, mock_jira_service):
    # Arrange
    with patch("app.tools.jira_toolkit.JiraService", return_value=mock_jira_service):
        with patch("app.tools.jira_toolkit.SessionToAgentRepository", return_value=MagicMock()) as mock_session_repo_class:
            with patch("asyncio.run", side_effect=lambda x: x) as mock_asyncio_run:
                mock_session_repo = mock_session_repo_class.return_value
                mock_session = MagicMock()
                mock_session.ticket_id = "TEST-123"
                mock_session_repo.get_session.return_value = mock_session
                
                # Mock requests.get
                mock_response = MagicMock()
                mock_response.status_code = 200
                mock_response.json.return_value = {
                    "id": "10000",
                    "key": "TEST-123",
                    "self": "https://example.atlassian.net/rest/api/3/issue/TEST-123",
                    "fields": {
                        "summary": "Test ticket",
                        "description": "This is a test ticket",
                        "status": {"name": "In Progress"},
                        "priority": {"name": "High"}
                    }
                }
                
                with patch("requests.get", return_value=mock_response):
                    jira_tools = JiraTools(
                        agent_id="00000000-0000-0000-0000-000000000001",
                        org_id="00000000-0000-0000-0000-000000000002",
                        session_id="test_session_id"
                    )
                    jira_tools.db = mock_db
                    
                    # Act
                    result = jira_tools.get_ticket_status("TEST-123")
                    
                    # Assert
                    assert result["success"] is True
                    assert result["ticket_id"] == "TEST-123"
                    assert result["ticket_status"] == "In Progress"
                    assert result["ticket_summary"] == "Test ticket"
                    assert result["ticket_priority"] == "High" 
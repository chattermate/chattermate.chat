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

import pytest
import os
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.jira import JiraService
from app.models.jira import JiraToken
from app.core.exceptions import JiraAuthError


@pytest.fixture
def jira_service():
    """Create a JiraService instance for testing."""
    with patch.dict(os.environ, {
        "JIRA_CLIENT_ID": "test_client_id",
        "JIRA_CLIENT_SECRET": "test_client_secret",
        "JIRA_REDIRECT_URI": "https://example.com/callback"
    }):
        return JiraService()


@pytest.fixture
def mock_token():
    """Create a mock JiraToken for testing."""
    token = MagicMock(spec=JiraToken)
    token.access_token = "test_access_token"
    token.refresh_token = "test_refresh_token"
    token.expires_at = datetime.utcnow() + timedelta(hours=1)
    token.cloud_id = "test_cloud_id"
    return token


@pytest.fixture
def expired_token():
    """Create a mock expired JiraToken for testing."""
    token = MagicMock(spec=JiraToken)
    token.access_token = "test_access_token"
    token.refresh_token = "test_refresh_token"
    token.expires_at = datetime.utcnow() - timedelta(hours=1)
    token.cloud_id = "test_cloud_id"
    return token


def test_get_authorization_url(jira_service):
    """Test generating the authorization URL."""
    state = "test_state"
    url = jira_service.get_authorization_url(state)
    
    # Check that the URL contains all required parameters
    assert "auth.atlassian.com/authorize" in url
    assert "client_id=test_client_id" in url
    assert "redirect_uri=https%3A%2F%2Fexample.com%2Fcallback" in url
    assert f"state={state}" in url
    assert "response_type=code" in url
    assert "scope=" in url


def test_validate_token_valid(jira_service, mock_token):
    """Test validating a valid token."""
    assert jira_service.validate_token(mock_token) is True


def test_validate_token_expired(jira_service, expired_token):
    """Test validating an expired token."""
    assert jira_service.validate_token(expired_token) is False


def test_validate_token_none(jira_service):
    """Test validating a None token."""
    assert jira_service.validate_token(None) is False


@pytest.mark.asyncio
async def test_exchange_code_for_token_success(jira_service):
    """Test exchanging code for token successfully."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "access_token": "new_access_token",
        "refresh_token": "new_refresh_token",
        "token_type": "Bearer",
        "expires_in": 3600
    }
    
    with patch("requests.post", return_value=mock_response):
        result = await jira_service.exchange_code_for_token("test_code")
        
        assert result["access_token"] == "new_access_token"
        assert result["refresh_token"] == "new_refresh_token"
        assert result["token_type"] == "Bearer"
        assert "expires_at" in result


@pytest.mark.asyncio
async def test_exchange_code_for_token_failure(jira_service):
    """Test exchanging code for token with failure."""
    mock_response = MagicMock()
    mock_response.status_code = 400
    mock_response.text = "Invalid code"
    
    with patch("requests.post", return_value=mock_response):
        with pytest.raises(JiraAuthError, match="Failed to exchange code for token"):
            await jira_service.exchange_code_for_token("invalid_code")


@pytest.mark.asyncio
async def test_refresh_token_success(jira_service):
    """Test refreshing token successfully."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "access_token": "new_access_token",
        "refresh_token": "new_refresh_token",
        "token_type": "Bearer",
        "expires_in": 3600
    }
    
    with patch("requests.post", return_value=mock_response):
        result = await jira_service.refresh_token("test_refresh_token")
        
        assert result["access_token"] == "new_access_token"
        assert result["refresh_token"] == "new_refresh_token"
        assert result["token_type"] == "Bearer"
        assert "expires_at" in result


@pytest.mark.asyncio
async def test_refresh_token_without_new_refresh_token(jira_service):
    """Test refreshing token when no new refresh token is provided."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "access_token": "new_access_token",
        "token_type": "Bearer",
        "expires_in": 3600
    }
    
    with patch("requests.post", return_value=mock_response):
        result = await jira_service.refresh_token("test_refresh_token")
        
        assert result["access_token"] == "new_access_token"
        assert result["refresh_token"] == "test_refresh_token"  # Should keep the old refresh token
        assert result["token_type"] == "Bearer"
        assert "expires_at" in result


@pytest.mark.asyncio
async def test_refresh_token_failure(jira_service):
    """Test refreshing token with failure."""
    mock_response = MagicMock()
    mock_response.status_code = 400
    mock_response.text = "Invalid refresh token"
    
    with patch("requests.post", return_value=mock_response):
        with pytest.raises(JiraAuthError, match="Failed to refresh token"):
            await jira_service.refresh_token("invalid_refresh_token")


@pytest.mark.asyncio
async def test_get_cloud_id_success(jira_service):
    """Test getting cloud ID successfully."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = [
        {
            "id": "test_cloud_id",
            "url": "https://example.atlassian.net"
        }
    ]
    
    with patch("requests.get", return_value=mock_response):
        result = await jira_service.get_cloud_id("test_access_token")
        
        assert result["cloud_id"] == "test_cloud_id"
        assert result["site_url"] == "https://example.atlassian.net"


@pytest.mark.asyncio
async def test_get_cloud_id_failure(jira_service):
    """Test getting cloud ID with failure."""
    mock_response = MagicMock()
    mock_response.status_code = 401
    mock_response.text = "Unauthorized"
    
    with patch("requests.get", return_value=mock_response):
        with pytest.raises(JiraAuthError, match="Failed to get Jira Cloud ID"):
            await jira_service.get_cloud_id("invalid_access_token")


@pytest.mark.asyncio
async def test_get_cloud_id_empty_resources(jira_service):
    """Test getting cloud ID with empty resources."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = []
    
    with patch("requests.get", return_value=mock_response):
        with pytest.raises(JiraAuthError, match="No Jira Cloud instances found"):
            await jira_service.get_cloud_id("test_access_token")


@pytest.mark.asyncio
async def test_get_projects_success(jira_service):
    """Test getting projects successfully."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = [
        {
            "id": "10000",
            "key": "TEST",
            "name": "Test Project"
        },
        {
            "id": "10001",
            "key": "DEMO",
            "name": "Demo Project"
        }
    ]
    
    with patch("requests.get", return_value=mock_response):
        result = await jira_service.get_projects("test_access_token", "test_cloud_id")
        
        assert len(result) == 2
        assert result[0]["id"] == "10000"
        assert result[0]["key"] == "TEST"
        assert result[0]["name"] == "Test Project"
        assert result[1]["id"] == "10001"
        assert result[1]["key"] == "DEMO"
        assert result[1]["name"] == "Demo Project"


@pytest.mark.asyncio
async def test_get_projects_failure(jira_service):
    """Test getting projects with failure."""
    mock_response = MagicMock()
    mock_response.status_code = 401
    mock_response.text = "Unauthorized"
    
    with patch("requests.get", return_value=mock_response):
        with pytest.raises(JiraAuthError, match="Failed to get Jira projects"):
            await jira_service.get_projects("invalid_access_token", "test_cloud_id")


@pytest.mark.asyncio
async def test_get_issue_types_success(jira_service):
    """Test getting issue types successfully."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "id": "10000",
        "key": "TEST",
        "name": "Test Project",
        "issueTypes": [
            {
                "id": "10001",
                "name": "Bug",
                "description": "A bug in the system",
                "iconUrl": "https://example.com/bug.png",
                "subtask": False
            },
            {
                "id": "10002",
                "name": "Task",
                "description": "A task to be completed",
                "iconUrl": "https://example.com/task.png",
                "subtask": False
            },
            {
                "id": "10003",
                "name": "Sub-task",
                "description": "A sub-task",
                "iconUrl": "https://example.com/subtask.png",
                "subtask": True
            }
        ]
    }
    
    with patch("requests.get", return_value=mock_response):
        result = await jira_service.get_issue_types("test_access_token", "test_cloud_id", "TEST")
        
        assert len(result) == 2  # Should exclude the sub-task
        assert result[0]["id"] == "10001"
        assert result[0]["name"] == "Bug"
        assert result[1]["id"] == "10002"
        assert result[1]["name"] == "Task"


@pytest.mark.asyncio
async def test_get_issue_types_failure(jira_service):
    """Test getting issue types with failure."""
    mock_response = MagicMock()
    mock_response.status_code = 404
    mock_response.text = "Project not found"
    
    with patch("requests.get", return_value=mock_response):
        with pytest.raises(JiraAuthError, match="Failed to get Jira project"):
            await jira_service.get_issue_types("test_access_token", "test_cloud_id", "INVALID")


@pytest.mark.asyncio
async def test_create_issue_success(jira_service):
    """Test creating an issue successfully."""
    # Mock organization and db
    organization = MagicMock()
    organization.id = "test_org_id"
    
    db = MagicMock()
    token = MagicMock(spec=JiraToken)
    token.organization_id = "test_org_id"
    token.access_token = "test_access_token"
    token.refresh_token = "test_refresh_token"
    token.cloud_id = "test_cloud_id"
    token.expires_at = datetime.utcnow() + timedelta(hours=1)
    
    db.query.return_value.filter.return_value.first.return_value = token
    
    # Mock issue data
    issue_data = MagicMock()
    issue_data.projectKey = "TEST"
    issue_data.issueTypeId = "10001"
    issue_data.summary = "Test Issue"
    issue_data.description = "This is a test issue"
    issue_data.priority = "High"
    
    # Mock create_issue_internal
    with patch.object(jira_service, "create_issue_internal", new_callable=AsyncMock) as mock_create_internal:
        mock_create_internal.return_value = {
            "id": "10000",
            "key": "TEST-123",
            "self": "https://example.atlassian.net/rest/api/3/issue/TEST-123"
        }
        
        result = await jira_service.create_issue(organization, db, issue_data)
        
        assert result["id"] == "10000"
        assert result["key"] == "TEST-123"
        
        # Verify create_issue_internal was called with correct parameters
        mock_create_internal.assert_called_once_with(
            "test_access_token",
            "test_cloud_id",
            "TEST",
            "10001",
            "Test Issue",
            "This is a test issue",
            "High"
        )


@pytest.mark.asyncio
async def test_create_issue_no_token(jira_service):
    """Test creating an issue when no token is found."""
    # Mock organization and db
    organization = MagicMock()
    organization.id = "test_org_id"
    
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None
    
    # Mock issue data
    issue_data = MagicMock()
    
    with pytest.raises(JiraAuthError, match="No Jira connection found"):
        await jira_service.create_issue(organization, db, issue_data)


@pytest.mark.asyncio
async def test_create_issue_expired_token(jira_service):
    """Test creating an issue with an expired token that gets refreshed."""
    # Mock organization and db
    organization = MagicMock()
    organization.id = "test_org_id"
    
    db = MagicMock()
    token = MagicMock(spec=JiraToken)
    token.organization_id = "test_org_id"
    token.access_token = "old_access_token"
    token.refresh_token = "test_refresh_token"
    token.cloud_id = "test_cloud_id"
    token.expires_at = datetime.utcnow() - timedelta(hours=1)  # Expired
    
    db.query.return_value.filter.return_value.first.return_value = token
    
    # Mock issue data
    issue_data = MagicMock()
    issue_data.projectKey = "TEST"
    issue_data.issueTypeId = "10001"
    issue_data.summary = "Test Issue"
    issue_data.description = "This is a test issue"
    issue_data.priority = "High"
    
    # Mock refresh_token
    with patch.object(jira_service, "refresh_token", new_callable=AsyncMock) as mock_refresh:
        mock_refresh.return_value = {
            "access_token": "new_access_token",
            "refresh_token": "new_refresh_token",
            "token_type": "Bearer",
            "expires_at": datetime.utcnow() + timedelta(hours=1)
        }
        
        # Mock create_issue_internal
        with patch.object(jira_service, "create_issue_internal", new_callable=AsyncMock) as mock_create_internal:
            mock_create_internal.return_value = {
                "id": "10000",
                "key": "TEST-123",
                "self": "https://example.atlassian.net/rest/api/3/issue/TEST-123"
            }
            
            result = await jira_service.create_issue(organization, db, issue_data)
            
            assert result["id"] == "10000"
            assert result["key"] == "TEST-123"
            
            # Verify refresh_token was called
            mock_refresh.assert_called_once_with("test_refresh_token")
            
            # Verify create_issue_internal was called with the new access token
            mock_create_internal.assert_called_once_with(
                "new_access_token",
                "test_cloud_id",
                "TEST",
                "10001",
                "Test Issue",
                "This is a test issue",
                "High"
            )
            
            # Verify db.commit was called to save the new token
            db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_create_issue_refresh_failure(jira_service):
    """Test creating an issue when token refresh fails."""
    # Mock organization and db
    organization = MagicMock()
    organization.id = "test_org_id"
    
    db = MagicMock()
    token = MagicMock(spec=JiraToken)
    token.organization_id = "test_org_id"
    token.access_token = "old_access_token"
    token.refresh_token = "test_refresh_token"
    token.cloud_id = "test_cloud_id"
    token.expires_at = datetime.utcnow() - timedelta(hours=1)  # Expired
    
    db.query.return_value.filter.return_value.first.return_value = token
    
    # Mock issue data
    issue_data = MagicMock()
    
    # Mock refresh_token to raise an exception
    with patch.object(jira_service, "refresh_token", new_callable=AsyncMock) as mock_refresh:
        mock_refresh.side_effect = JiraAuthError("Failed to refresh token")
        
        with pytest.raises(JiraAuthError, match="Jira token expired and could not be refreshed"):
            await jira_service.create_issue(organization, db, issue_data)


@pytest.mark.asyncio
async def test_create_issue_internal_success(jira_service):
    """Test creating an issue internally successfully."""
    mock_response = MagicMock()
    mock_response.status_code = 201
    mock_response.json.return_value = {
        "id": "10000",
        "key": "TEST-123",
        "self": "https://example.atlassian.net/rest/api/3/issue/TEST-123"
    }
    
    # Mock is_priority_available to return True
    with patch.object(jira_service, "is_priority_available", new_callable=AsyncMock) as mock_priority_check:
        mock_priority_check.return_value = True
        
        with patch("requests.post", return_value=mock_response):
            result = await jira_service.create_issue_internal(
                "test_access_token",
                "test_cloud_id",
                "TEST",
                "10001",
                "Test Issue",
                "This is a test issue",
                "P1"
            )
            
            assert result["id"] == "10000"
            assert result["key"] == "TEST-123"
            
            # Verify is_priority_available was called
            mock_priority_check.assert_called_once_with(
                "test_access_token",
                "test_cloud_id",
                "TEST",
                "10001"
            )


@pytest.mark.asyncio
async def test_create_issue_internal_priority_not_available(jira_service):
    """Test creating an issue when priority field is not available."""
    mock_response = MagicMock()
    mock_response.status_code = 201
    mock_response.json.return_value = {
        "id": "10000",
        "key": "TEST-123",
        "self": "https://example.atlassian.net/rest/api/3/issue/TEST-123"
    }
    
    # Mock is_priority_available to return False
    with patch.object(jira_service, "is_priority_available", new_callable=AsyncMock) as mock_priority_check:
        mock_priority_check.return_value = False
        
        with patch("requests.post", return_value=mock_response):
            result = await jira_service.create_issue_internal(
                "test_access_token",
                "test_cloud_id",
                "TEST",
                "10001",
                "Test Issue",
                "This is a test issue",
                "P1"
            )
            
            assert result["id"] == "10000"
            assert result["key"] == "TEST-123"
            
            # Verify is_priority_available was called
            mock_priority_check.assert_called_once_with(
                "test_access_token",
                "test_cloud_id",
                "TEST",
                "10001"
            )


@pytest.mark.asyncio
async def test_create_issue_internal_failure(jira_service):
    """Test creating an issue internally with failure."""
    mock_response = MagicMock()
    mock_response.status_code = 400
    mock_response.text = "Invalid project key"
    
    # Mock is_priority_available to return True
    with patch.object(jira_service, "is_priority_available", new_callable=AsyncMock) as mock_priority_check:
        mock_priority_check.return_value = True
        
        with patch("requests.post", return_value=mock_response):
            with pytest.raises(JiraAuthError, match="Failed to create Jira issue"):
                await jira_service.create_issue_internal(
                    "test_access_token",
                    "test_cloud_id",
                    "INVALID",
                    "10001",
                    "Test Issue",
                    "This is a test issue",
                    "P1"
                )


@pytest.mark.asyncio
async def test_get_priorities_success(jira_service):
    """Test getting priorities successfully."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = [
        {
            "id": "1",
            "name": "Highest",
            "description": "Highest priority",
            "iconUrl": "https://example.com/highest.png"
        },
        {
            "id": "2",
            "name": "High",
            "description": "High priority",
            "iconUrl": "https://example.com/high.png"
        }
    ]
    
    with patch("requests.get", return_value=mock_response):
        result = await jira_service.get_priorities("test_access_token", "test_cloud_id")
        
        assert len(result) == 2
        assert result[0]["id"] == "1"
        assert result[0]["name"] == "Highest"
        assert result[1]["id"] == "2"
        assert result[1]["name"] == "High"


@pytest.mark.asyncio
async def test_get_priorities_failure(jira_service):
    """Test getting priorities with failure."""
    mock_response = MagicMock()
    mock_response.status_code = 401
    mock_response.text = "Unauthorized"
    
    with patch("requests.get", return_value=mock_response):
        with pytest.raises(JiraAuthError, match="Failed to get Jira priorities"):
            await jira_service.get_priorities("invalid_access_token", "test_cloud_id")


@pytest.mark.asyncio
async def test_check_field_availability_success(jira_service):
    """Test checking field availability successfully."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "projects": [
            {
                "issuetypes": [
                    {
                        "fields": {
                            "priority": {
                                "allowedValues": [
                                    {"name": "Highest"},
                                    {"name": "High"}
                                ]
                            }
                        }
                    }
                ]
            }
        ]
    }
    
    with patch("requests.get", return_value=mock_response):
        result = await jira_service.check_field_availability(
            "test_access_token",
            "test_cloud_id",
            "TEST",
            "10001",
            "priority"
        )
        
        assert result is True


@pytest.mark.asyncio
async def test_check_field_availability_field_not_found(jira_service):
    """Test checking field availability when field is not found."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "projects": [
            {
                "issuetypes": [
                    {
                        "fields": {
                            "summary": {},
                            "description": {}
                        }
                    }
                ]
            }
        ]
    }
    
    with patch("requests.get", return_value=mock_response):
        result = await jira_service.check_field_availability(
            "test_access_token",
            "test_cloud_id",
            "TEST",
            "10001",
            "priority"
        )
        
        assert result is False


@pytest.mark.asyncio
async def test_check_field_availability_no_projects(jira_service):
    """Test checking field availability when no projects are found."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "projects": []
    }
    
    with patch("requests.get", return_value=mock_response):
        result = await jira_service.check_field_availability(
            "test_access_token",
            "test_cloud_id",
            "TEST",
            "10001",
            "priority"
        )
        
        assert result is False


@pytest.mark.asyncio
async def test_check_field_availability_no_issue_types(jira_service):
    """Test checking field availability when no issue types are found."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "projects": [
            {
                "issuetypes": []
            }
        ]
    }
    
    with patch("requests.get", return_value=mock_response):
        result = await jira_service.check_field_availability(
            "test_access_token",
            "test_cloud_id",
            "TEST",
            "10001",
            "priority"
        )
        
        assert result is False


@pytest.mark.asyncio
async def test_check_field_availability_api_error(jira_service):
    """Test checking field availability when API returns an error."""
    mock_response = MagicMock()
    mock_response.status_code = 404
    mock_response.text = "Project not found"
    
    with patch("requests.get", return_value=mock_response):
        result = await jira_service.check_field_availability(
            "test_access_token",
            "test_cloud_id",
            "INVALID",
            "10001",
            "priority"
        )
        
        assert result is False


@pytest.mark.asyncio
async def test_is_priority_available(jira_service):
    """Test checking if priority field is available."""
    with patch.object(jira_service, "check_field_availability", new_callable=AsyncMock) as mock_check:
        mock_check.return_value = True
        
        result = await jira_service.is_priority_available(
            "test_access_token",
            "test_cloud_id",
            "TEST",
            "10001"
        )
        
        assert result is True
        mock_check.assert_called_once_with(
            "test_access_token",
            "test_cloud_id",
            "TEST",
            "10001",
            "priority"
        ) 
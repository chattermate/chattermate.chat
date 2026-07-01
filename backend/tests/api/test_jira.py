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
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock
from app.database import get_db
from fastapi import FastAPI
from app.models.user import User
from app.models.organization import Organization
from app.models.role import Role
from app.models.permission import Permission, role_permissions
from app.models.jira import JiraToken, AgentJiraConfig
from app.models.agent import Agent, AgentType
from uuid import UUID, uuid4
from datetime import datetime, timedelta
from app.api import jira as jira_router
from app.core.auth import get_current_user, get_current_organization, require_permissions
from app.core.exceptions import JiraAuthError
from tests.conftest import engine, TestingSessionLocal, create_tables, Base
from app.core.config import settings

# Create a test FastAPI app
app = FastAPI()
app.include_router(
    jira_router.router,
    prefix="/api/v1/jira",  # Match the prefix in main.py
    tags=["jira"]
)

# Override the dependencies
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test."""
    # Drop all tables first
    Base.metadata.drop_all(bind=engine)
    # Create tables except enterprise ones
    create_tables()
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_permissions(db) -> list[Permission]:
    """Create test permissions"""
    permissions = []
    for name in ["manage_organization", "view_organization"]:
        perm = Permission(
            name=name,
            description=f"Test permission for {name}"
        )
        db.add(perm)
        permissions.append(perm)
    db.commit()
    for p in permissions:
        db.refresh(p)
    return permissions

@pytest.fixture
def test_role(db, test_permissions) -> Role:
    """Create a test role with required permissions"""
    role = Role(
        id=1,
        name="Test Role",
        description="Test Role Description",
        is_default=True
    )
    db.add(role)
    db.commit()

    # Associate permissions with role
    for perm in test_permissions:
        db.execute(
            role_permissions.insert().values(
                role_id=role.id,
                permission_id=perm.id
            )
        )
    db.commit()
    db.refresh(role)
    return role

@pytest.fixture
def test_organization(db) -> Organization:
    """Create a test organization"""
    org = Organization(
        id=uuid4(),
        name="Test Organization",
        domain="test.com",
        timezone="UTC",
        business_hours={"monday": {"start": "09:00", "end": "17:00"}}
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org

@pytest.fixture
def test_user(db, test_organization, test_role) -> User:
    """Create a test user"""
    user = User(
        id=uuid4(),
        email="test@test.com",
        hashed_password="hashed_password",
        full_name="Test User",
        is_active=True,
        organization_id=test_organization.id,
        role_id=test_role.id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_agent(db, test_organization) -> Agent:
    """Create a test agent"""
    agent = Agent(
        id=uuid4(),
        name="Test Agent",
        organization_id=test_organization.id,
        instructions="Test instructions",
        is_active=True,
        is_default=False,
        agent_type=AgentType.GENERAL
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

@pytest.fixture
def test_jira_token(db, test_organization) -> JiraToken:
    """Create a test Jira token"""
    token = JiraToken(
        organization_id=test_organization.id,
        access_token="test_access_token",
        refresh_token="test_refresh_token",
        token_type="Bearer",
        expires_at=datetime.utcnow() + timedelta(hours=1),
        cloud_id="test_cloud_id",
        site_url="https://test.atlassian.net"
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token

@pytest.fixture
def test_expired_jira_token(db, test_organization) -> JiraToken:
    """Create a test expired Jira token"""
    token = JiraToken(
        organization_id=test_organization.id,
        access_token="test_access_token",
        refresh_token="test_refresh_token",
        token_type="Bearer",
        expires_at=datetime.utcnow() - timedelta(hours=1),
        cloud_id="test_cloud_id",
        site_url="https://test.atlassian.net"
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token

@pytest.fixture
def test_agent_jira_config(db, test_agent) -> AgentJiraConfig:
    """Create a test agent Jira config"""
    config = AgentJiraConfig(
        agent_id=str(test_agent.id),
        enabled=True,
        project_key="TEST",
        issue_type_id="10001"
    )
    db.add(config)
    db.commit()
    db.refresh(config)
    return config

@pytest.fixture
def client(db, test_user, test_organization):
    """Create a test client with dependencies overridden"""
    app.dependency_overrides[get_db] = override_get_db
    
    # Override auth dependencies
    def override_get_current_user():
        return test_user
    
    def override_get_current_organization():
        return test_organization
    
    def override_require_permissions(*permissions):
        def _require_permissions():
            return test_user
        return _require_permissions
    
    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_current_organization] = override_get_current_organization
    app.dependency_overrides[require_permissions] = override_require_permissions
    
    return TestClient(app)

def test_jira_status_connected(client, test_jira_token):
    """Test getting Jira status when connected"""
    with patch('app.api.jira.jira_service.validate_token', return_value=True):
        response = client.get("/api/v1/jira/status")
        assert response.status_code == 200
        assert response.json() == {
            "connected": True,
            "site_url": "https://test.atlassian.net"
        }

def test_jira_status_not_connected(client, db):
    """Test getting Jira status when not connected"""
    response = client.get("/api/v1/jira/status")
    assert response.status_code == 200
    assert response.json() == {
        "connected": False
    }

def test_jira_status_expired_token_refresh_success(client, test_expired_jira_token):
    """Test getting Jira status with expired token that gets refreshed successfully"""
    with patch('app.api.jira.jira_service.validate_token', return_value=False):
        with patch('app.api.jira.jira_service.refresh_token', new_callable=AsyncMock) as mock_refresh:
            mock_refresh.return_value = {
                "access_token": "new_access_token",
                "refresh_token": "new_refresh_token",
                "token_type": "Bearer",
                "expires_at": datetime.utcnow() + timedelta(hours=1)
            }
            
            response = client.get("/api/v1/jira/status")
            assert response.status_code == 200
            assert response.json() == {
                "connected": True,
                "site_url": "https://test.atlassian.net"
            }
            mock_refresh.assert_called_once_with("test_refresh_token")

def test_jira_status_expired_token_refresh_failure(client, test_expired_jira_token):
    """Test getting Jira status with expired token that fails to refresh"""
    with patch('app.api.jira.jira_service.validate_token', return_value=False):
        with patch('app.api.jira.jira_service.refresh_token', new_callable=AsyncMock) as mock_refresh:
            mock_refresh.side_effect = Exception("Failed to refresh token")
            
            response = client.get("/api/v1/jira/status")
            assert response.status_code == 200
            assert response.json() == {
                "connected": False,
                "site_url": None
            }
            mock_refresh.assert_called_once_with("test_refresh_token")

def test_disconnect_jira_success(client, test_jira_token, test_agent_jira_config):
    """Test disconnecting Jira successfully"""
    response = client.delete("/api/v1/jira/disconnect")
    assert response.status_code == 200
    assert response.json() == {"message": "Jira disconnected successfully"}

def test_disconnect_jira_not_connected(client):
    """Test disconnecting Jira when not connected"""
    response = client.delete("/api/v1/jira/disconnect")
    assert response.status_code == 404
    assert response.json() == {"detail": "No Jira connection found"}

@pytest.mark.skip(reason="OAuth redirect tests don't work with test client")
def test_authorize_jira(client):
    """Test authorizing Jira"""
    with patch('app.api.jira.jira_service.get_authorization_url') as mock_auth_url:
        mock_auth_url.return_value = "https://auth.atlassian.com/authorize?client_id=test"
        
        response = client.get("/api/v1/jira/authorize")
        assert response.status_code == 307  # Temporary redirect
        assert response.headers["location"] == "https://auth.atlassian.com/authorize?client_id=test"
        
        # Check that a state was generated and stored
        assert len(jira_router.oauth_states) == 1

@pytest.mark.skip(reason="OAuth redirect tests don't work with test client")
def test_jira_oauth_callback_success(client, db, test_organization):
    """Test successful Jira OAuth callback"""
    # Setup state
    state = "test_state"
    jira_router.oauth_states[state] = str(test_organization.id)
    
    with patch('app.api.jira.jira_service.exchange_code_for_token', new_callable=AsyncMock) as mock_exchange:
        mock_exchange.return_value = {
            "access_token": "new_access_token",
            "refresh_token": "new_refresh_token",
            "token_type": "Bearer",
            "expires_at": datetime.utcnow() + timedelta(hours=1)
        }
        
        with patch('app.api.jira.jira_service.get_cloud_id', new_callable=AsyncMock) as mock_cloud_id:
            mock_cloud_id.return_value = {
                "cloud_id": "test_cloud_id",
                "site_url": "https://test.atlassian.net"
            }
            
            response = client.get(f"/api/v1/jira/callback?code=test_code&state={state}")
            assert response.status_code == 307  # Temporary redirect
            assert response.headers["location"] == f"{settings.FRONTEND_URL}/settings/integrations?status=success"
            
            # Check that state was cleaned up
            assert state not in jira_router.oauth_states
            
            # Check that token was stored in database
            token = db.query(JiraToken).filter(JiraToken.organization_id == test_organization.id).first()
            assert token is not None
            assert token.access_token == "new_access_token"
            assert token.refresh_token == "new_refresh_token"

@pytest.mark.skip(reason="OAuth redirect tests don't work with test client")
def test_jira_oauth_callback_error(client):
    """Test Jira OAuth callback with error"""
    response = client.get("/api/v1/jira/callback?error=access_denied&error_description=User%20denied%20access")
    assert response.status_code == 307  # Temporary redirect
    assert "status=failure" in response.headers["location"]
    assert "reason=access_denied" in response.headers["location"]

@pytest.mark.skip(reason="OAuth redirect tests don't work with test client")
def test_jira_oauth_callback_invalid_state(client):
    """Test Jira OAuth callback with invalid state"""
    response = client.get("/api/v1/jira/callback?code=test_code&state=invalid_state")
    assert response.status_code == 307  # Temporary redirect
    assert "status=failure" in response.headers["location"]
    assert "reason=invalid_state" in response.headers["location"]

@pytest.mark.skip(reason="OAuth redirect tests don't work with test client")
def test_jira_oauth_callback_exception(client):
    """Test Jira OAuth callback with exception"""
    # Setup state
    state = "test_state"
    jira_router.oauth_states[state] = "test_org_id"
    
    with patch('app.api.jira.jira_service.exchange_code_for_token', new_callable=AsyncMock) as mock_exchange:
        mock_exchange.side_effect = Exception("Test exception")
        
        response = client.get(f"/api/v1/jira/callback?code=test_code&state={state}")
        assert response.status_code == 307  # Temporary redirect
        assert "status=failure" in response.headers["location"]
        assert "reason=Test_exception" in response.headers["location"]
        
        # Check that state was cleaned up
        assert state not in jira_router.oauth_states

def test_refresh_jira_token_success(client, test_jira_token):
    """Test refreshing Jira token successfully"""
    with patch('app.api.jira.jira_service.refresh_token', new_callable=AsyncMock) as mock_refresh:
        mock_refresh.return_value = {
            "access_token": "new_access_token",
            "refresh_token": "new_refresh_token",
            "token_type": "Bearer",
            "expires_at": datetime.utcnow() + timedelta(hours=1)
        }
        
        response = client.get("/api/v1/jira/refresh")
        assert response.status_code == 200
        assert response.json() == {"message": "Token refreshed successfully"}
        mock_refresh.assert_called_once_with("test_refresh_token")

def test_refresh_jira_token_not_found(client):
    """Test refreshing Jira token when not found"""
    response = client.get("/api/v1/jira/refresh")
    assert response.status_code == 404
    assert response.json() == {"detail": "No Jira token found"}

def test_refresh_jira_token_error(client, test_jira_token):
    """Test refreshing Jira token with error"""
    with patch('app.api.jira.jira_service.refresh_token', new_callable=AsyncMock) as mock_refresh:
        mock_refresh.side_effect = Exception("Failed to refresh token")
        
        response = client.get("/api/v1/jira/refresh")
        assert response.status_code == 400
        assert response.json() == {"detail": "Failed to refresh token"}

def test_get_jira_projects_success(client, test_jira_token):
    """Test getting Jira projects successfully"""
    with patch('app.api.jira.jira_service.validate_token', return_value=True):
        with patch('app.api.jira.jira_service.get_projects', new_callable=AsyncMock) as mock_projects:
            mock_projects.return_value = [
                {"id": "10000", "key": "TEST", "name": "Test Project"},
                {"id": "10001", "key": "DEMO", "name": "Demo Project"}
            ]
            
            response = client.get("/api/v1/jira/projects")
            assert response.status_code == 200
            assert response.json() == [
                {"id": "10000", "key": "TEST", "name": "Test Project"},
                {"id": "10001", "key": "DEMO", "name": "Demo Project"}
            ]

def test_get_jira_projects_not_connected(client):
    """Test getting Jira projects when not connected"""
    response = client.get("/api/v1/jira/projects")
    assert response.status_code == 404
    assert response.json() == {"detail": "No Jira connection found"}

def test_get_jira_projects_expired_token_refresh_success(client, test_expired_jira_token):
    """Test getting Jira projects with expired token that gets refreshed successfully"""
    with patch('app.api.jira.jira_service.validate_token', return_value=False):
        with patch('app.api.jira.jira_service.refresh_token', new_callable=AsyncMock) as mock_refresh:
            mock_refresh.return_value = {
                "access_token": "new_access_token",
                "refresh_token": "new_refresh_token",
                "token_type": "Bearer",
                "expires_at": datetime.utcnow() + timedelta(hours=1)
            }
            
            with patch('app.api.jira.jira_service.get_projects', new_callable=AsyncMock) as mock_projects:
                mock_projects.return_value = [
                    {"id": "10000", "key": "TEST", "name": "Test Project"}
                ]
                
                response = client.get("/api/v1/jira/projects")
                assert response.status_code == 200
                assert response.json() == [
                    {"id": "10000", "key": "TEST", "name": "Test Project"}
                ]

def test_get_jira_projects_expired_token_refresh_failure(client, test_expired_jira_token):
    """Test getting Jira projects with expired token that fails to refresh"""
    with patch('app.api.jira.jira_service.validate_token', return_value=False):
        with patch('app.api.jira.jira_service.refresh_token', new_callable=AsyncMock) as mock_refresh:
            mock_refresh.side_effect = Exception("Failed to refresh token")
            
            response = client.get("/api/v1/jira/projects")
            assert response.status_code == 401
            assert response.json() == {"detail": "Jira token expired and could not be refreshed"}

def test_get_jira_projects_error(client, test_jira_token):
    """Test getting Jira projects with error"""
    with patch('app.api.jira.jira_service.validate_token', return_value=True):
        with patch('app.api.jira.jira_service.get_projects', new_callable=AsyncMock) as mock_projects:
            mock_projects.side_effect = Exception("Failed to get projects")
            
            response = client.get("/api/v1/jira/projects")
            assert response.status_code == 500
            assert response.json() == {"detail": "Failed to get Jira projects"}

def test_get_jira_issue_types_success(client, test_jira_token):
    """Test getting Jira issue types successfully"""
    with patch('app.api.jira.jira_service.validate_token', return_value=True):
        with patch('app.api.jira.jira_service.get_issue_types', new_callable=AsyncMock) as mock_issue_types:
            mock_issue_types.return_value = [
                {"id": "10001", "name": "Bug", "description": "A bug"},
                {"id": "10002", "name": "Task", "description": "A task"}
            ]
            
            response = client.get("/api/v1/jira/projects/TEST/issue-types")
            assert response.status_code == 200
            assert response.json() == [
                {"id": "10001", "name": "Bug", "description": "A bug"},
                {"id": "10002", "name": "Task", "description": "A task"}
            ]

def test_get_jira_priorities_success(client, test_jira_token):
    """Test getting Jira priorities successfully"""
    with patch('app.api.jira.jira_service.validate_token', return_value=True):
        with patch('app.api.jira.jira_service.get_priorities', new_callable=AsyncMock) as mock_priorities:
            mock_priorities.return_value = [
                {"id": "1", "name": "Highest", "description": "Highest priority", "iconUrl": "https://example.com/highest.png"},
                {"id": "2", "name": "High", "description": "High priority", "iconUrl": "https://example.com/high.png"}
            ]
            
            response = client.get("/api/v1/jira/priorities")
            assert response.status_code == 200
            assert response.json() == [
                {"id": "1", "name": "Highest", "description": "Highest priority", "iconUrl": "https://example.com/highest.png"},
                {"id": "2", "name": "High", "description": "High priority", "iconUrl": "https://example.com/high.png"}
            ]

def test_check_priority_availability_success(client, test_jira_token):
    """Test checking priority availability successfully"""
    with patch('app.api.jira.jira_service.validate_token', return_value=True):
        with patch('app.api.jira.jira_service.is_priority_available', new_callable=AsyncMock) as mock_priority:
            mock_priority.return_value = True
            
            response = client.get("/api/v1/jira/projects/TEST/issue-types/10001/has-priority")
            assert response.status_code == 200
            assert response.json() == {"hasPriority": True}

def test_create_jira_issue_success(client, test_jira_token):
    """Test creating a Jira issue successfully"""
    with patch('app.api.jira.jira_service.create_issue', new_callable=AsyncMock) as mock_create:
        mock_create.return_value = {
            "id": "10000",
            "key": "TEST-123",
            "self": "https://test.atlassian.net/rest/api/3/issue/TEST-123"
        }
        
        response = client.post(
            "/api/v1/jira/issues",
            json={
                "projectKey": "TEST",
                "issueTypeId": "10001",
                "summary": "Test Issue",
                "description": "This is a test issue",
                "priority": "High"
            }
        )
        assert response.status_code == 200
        assert response.json() == {
            "id": "10000",
            "key": "TEST-123",
            "self": "https://test.atlassian.net/rest/api/3/issue/TEST-123"
        }

def test_create_jira_issue_auth_error(client, test_jira_token):
    """Test creating a Jira issue with authentication error"""
    with patch('app.api.jira.jira_service.create_issue', new_callable=AsyncMock) as mock_create:
        mock_create.side_effect = JiraAuthError("Jira authentication failed")
        
        response = client.post(
            "/api/v1/jira/issues",
            json={
                "projectKey": "TEST",
                "issueTypeId": "10001",
                "summary": "Test Issue",
                "description": "This is a test issue"
            }
        )
        assert response.status_code == 401
        assert response.json() == {"detail": "Jira authentication failed"}

def test_create_jira_issue_error(client, test_jira_token):
    """Test creating a Jira issue with error"""
    with patch('app.api.jira.jira_service.create_issue', new_callable=AsyncMock) as mock_create:
        mock_create.side_effect = Exception("Failed to create issue")
        
        response = client.post(
            "/api/v1/jira/issues",
            json={
                "projectKey": "TEST",
                "issueTypeId": "10001",
                "summary": "Test Issue",
                "description": "This is a test issue"
            }
        )
        assert response.status_code == 500
        assert response.json() == {"detail": "Failed to create Jira issue"}

def test_save_agent_jira_config_success(client, test_agent, test_jira_token):
    """Test saving agent Jira config successfully"""
    response = client.post(
        f"/api/v1/jira/agent-config/{test_agent.id}",
        json={
            "enabled": True,
            "projectKey": "TEST",
            "issueTypeId": "10001"
        }
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Agent Jira configuration saved successfully"}

def test_save_agent_jira_config_update_existing(client, test_agent, test_agent_jira_config, test_jira_token):
    """Test updating existing agent Jira config"""
    response = client.post(
        f"/api/v1/jira/agent-config/{test_agent.id}",
        json={
            "enabled": False,
            "projectKey": "DEMO",
            "issueTypeId": "10002"
        }
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Agent Jira configuration saved successfully"}

def test_save_agent_jira_config_no_jira_connection(client, test_agent):
    """Test saving agent Jira config with no Jira connection"""
    response = client.post(
        f"/api/v1/jira/agent-config/{test_agent.id}",
        json={
            "enabled": True,
            "projectKey": "TEST",
            "issueTypeId": "10001"
        }
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Cannot enable Jira integration: Jira is not connected"}

def test_get_agent_jira_config_exists(client, test_agent, test_agent_jira_config):
    """Test getting agent Jira config when it exists"""
    response = client.get(f"/api/v1/jira/agent-config/{test_agent.id}")
    assert response.status_code == 200
    assert response.json() == {
        "enabled": True,
        "projectKey": "TEST",
        "issueTypeId": "10001"
    }

def test_get_agent_jira_config_not_exists(client, test_agent):
    """Test getting agent Jira config when it doesn't exist"""
    response = client.get(f"/api/v1/jira/agent-config/{test_agent.id}")
    assert response.status_code == 200
    assert response.json() == {
        "enabled": False,
        "projectKey": None,
        "issueTypeId": None
    } 
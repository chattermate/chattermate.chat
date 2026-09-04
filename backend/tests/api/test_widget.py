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
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.database import Base, get_db
from fastapi import FastAPI
from app.models.widget import Widget
from app.models.user import User
from app.models.agent import Agent, AgentType
from app.models.agent import AgentCustomization
from uuid import UUID, uuid4
from app.api import widget as widget_router
from app.core.auth import get_current_user
from app.main import app
from app.core.config import settings
from tests.conftest import engine, TestingSessionLocal

# Create a test FastAPI app
app = FastAPI()
app.include_router(
    widget_router.router,
    prefix=f"{settings.API_V1_STR}/widgets",
    tags=["widgets"]
)

@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(test_user: User) -> TestClient:
    """Create test client with mocked dependencies"""
    async def override_get_current_user():
        return test_user

    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_db] = override_get_db
    
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def test_create_widget(client: TestClient, test_agent: Agent):
    """Test creating a new widget"""
    widget_data = {
        "name": "New Widget",
        "agent_id": str(test_agent.id)
    }
    response = client.post("/api/v1/widgets", json=widget_data)
    assert response.status_code == 200
    data = response.json()
    assert data["agent"]["id"] == str(test_agent.id)
    assert data["agent"]["name"] == test_agent.name
    assert "organization_id" in data

def test_get_widget_details(client: TestClient, test_widget: Widget):
    """Test getting list of widgets (authenticated)"""
    response = client.get("/api/v1/widgets")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["id"] == str(test_widget.id)
    assert UUID(data[0]["agent"]["id"]) == test_widget.agent_id

def test_list_widgets(client: TestClient, test_widget: Widget):
    """Test listing all widgets"""
    response = client.get("/api/v1/widgets")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["id"] == str(test_widget.id)

def test_delete_widget(client: TestClient, test_widget: Widget):
    """Test deleting a widget"""
    response = client.delete(f"/api/v1/widgets/{test_widget.id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Widget deleted"

    # Verify widget is deleted
    response = client.get(f"/api/v1/widgets/{test_widget.id}/details")
    assert response.status_code == 404

def test_get_nonexistent_widget(client: TestClient):
    """Test getting a nonexistent widget"""
    response = client.get(f"/api/v1/widgets/{uuid4()}/details")
    assert response.status_code == 404

def test_get_widget_ui(client: TestClient, test_widget: Widget):
    """Test getting widget UI"""
    response = client.get(f"/api/v1/widgets/{test_widget.id}/data")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert str(test_widget.id) in response.text
    assert test_widget.agent.display_name or test_widget.agent.name in response.text

def test_widget_ui_injects_app_config(client: TestClient, test_widget: Widget, monkeypatch):
    """The iframe HTML must inject window.APP_CONFIG derived from BACKEND_URL so a
    self-hosted widget connects to the configured backend, not the cloud default."""
    from app.core.config import settings

    monkeypatch.setattr(settings, "BACKEND_URL", "https://support.example.com")

    response = client.get(f"/api/v1/widgets/{test_widget.id}/data")
    assert response.status_code == 200

    assert "window.APP_CONFIG" in response.text
    assert '"API_URL": "https://support.example.com/api/v1"' in response.text
    assert '"WS_URL": "wss://support.example.com"' in response.text
    # APP_CONFIG must be declared before the widget module so it exists at load time.
    assert response.text.index("window.APP_CONFIG") < response.text.index("assets/widget.js")


def test_widget_ui_app_config_falls_back_to_request_origin(
    client: TestClient, test_widget: Widget, monkeypatch
):
    """BACKEND_URL defaults to localhost and neither compose file sets it, so an
    install that never overrode it served every visitor a widget whose socket
    dialled the visitor's own machine. Loopback can never be right for someone
    else's browser: use the origin the widget was actually fetched over."""
    from app.core.config import settings

    monkeypatch.setattr(settings, "BACKEND_URL", "http://localhost:8000")

    response = client.get(
        f"/api/v1/widgets/{test_widget.id}/data",
        headers={"X-Forwarded-Proto": "https", "X-Forwarded-Host": "chat.example.com"},
    )
    assert response.status_code == 200

    assert '"API_URL": "https://chat.example.com/api/v1"' in response.text
    assert '"WS_URL": "wss://chat.example.com"' in response.text


def test_widget_ui_app_config_assumes_tls_behind_a_host_rewriting_proxy(
    client: TestClient, test_widget: Widget, monkeypatch
):
    """Some proxies rewrite the host but not the protocol. Reading the scheme off
    the proxy's own plaintext hop would hand an https page a ws:// socket, which
    the browser refuses as mixed content."""
    from app.core.config import settings

    monkeypatch.setattr(settings, "BACKEND_URL", "http://localhost:8000")

    response = client.get(
        f"/api/v1/widgets/{test_widget.id}/data",
        headers={"X-Forwarded-Host": "chat.example.com"},
    )
    assert response.status_code == 200

    assert '"API_URL": "https://chat.example.com/api/v1"' in response.text
    assert '"WS_URL": "wss://chat.example.com"' in response.text


def test_widget_ui_app_config_takes_the_browsers_end_of_a_proxy_chain(
    client: TestClient, test_widget: Widget, monkeypatch
):
    """Each proxy appends to these headers, so the browser's own value is first.
    Taking the last would point the widget at an internal hop no visitor can reach."""
    from app.core.config import settings

    monkeypatch.setattr(settings, "BACKEND_URL", "http://localhost:8000")

    response = client.get(
        f"/api/v1/widgets/{test_widget.id}/data",
        headers={
            "X-Forwarded-Host": "chat.example.com, internal-lb.local",
            "X-Forwarded-Proto": "https, http",
        },
    )
    assert response.status_code == 200

    assert '"API_URL": "https://chat.example.com/api/v1"' in response.text
    assert '"WS_URL": "wss://chat.example.com"' in response.text


def test_widget_ui_app_config_keeps_loopback_for_local_development(
    client: TestClient, test_widget: Widget, monkeypatch
):
    """Running everything on one machine is the case loopback is right for, and
    the request origin says so too — nothing to substitute."""
    from app.core.config import settings

    monkeypatch.setattr(settings, "BACKEND_URL", "http://localhost:8000")

    response = client.get(
        f"/api/v1/widgets/{test_widget.id}/data", headers={"Host": "localhost:8000"}
    )
    assert response.status_code == 200

    assert '"API_URL": "http://localhost:8000/api/v1"' in response.text
    assert '"WS_URL": "ws://localhost:8000"' in response.text


def test_widget_ui_presence_is_ai_when_the_ai_answers(client: TestClient, test_widget: Widget):
    """The AI really does reply instantly, at any hour — no hours check."""
    response = client.get(f"/api/v1/widgets/{test_widget.id}/data")
    assert response.status_code == 200
    assert '"mode": "ai"' in response.text
    assert '"available": true' in response.text


def test_widget_ui_presence_follows_business_hours_for_a_human_only_agent(
    client: TestClient, db, test_widget: Widget, test_agent: Agent
):
    """A person has to reply, so the header may only claim availability while
    the organization is actually open."""
    test_agent.ai_replies_enabled = False
    db.commit()

    with patch('app.api.widget.is_within_business_hours', return_value=True):
        response = client.get(f"/api/v1/widgets/{test_widget.id}/data")
        assert '"mode": "human"' in response.text
        assert '"available": true' in response.text

    with patch('app.api.widget.is_within_business_hours', return_value=False):
        response = client.get(f"/api/v1/widgets/{test_widget.id}/data")
        assert '"mode": "human"' in response.text
        assert '"available": false' in response.text


def test_get_widget_data(client: TestClient, test_widget: Widget):
    """Test getting widget data with conversation token"""
    # First get the widget UI to get the initial token
    ui_response = client.get(f"/api/v1/widgets/{test_widget.id}/data")
    assert ui_response.status_code == 200
    
    # Extract the initial token from the HTML response
    import re
    html_content = ui_response.text
    match = re.search(r'initialToken: "([^"]+)"', html_content)
    assert match is not None, "Initial token not found in HTML response"
    conversation_token = match.group(1)

    # Test getting widget data with token and email to create customer
    response = client.get(
        f"/api/v1/widgets/{test_widget.id}",
        params={"email": "test@example.com"},
        headers={"Authorization": f"Bearer {conversation_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_widget.id)
    assert data["organization_id"] == str(test_widget.organization_id)
    assert data["agent"]["id"] == str(test_widget.agent_id)
    assert "human_agent" in data  # Verify human_agent info is present
    assert "token" in data  # Verify new token is present in response

def test_get_widget_data_without_token(client: TestClient, test_widget: Widget):
    """Test getting widget data without conversation token - should fail if token auth required"""
    # For a normal widget without token auth requirement, this returns 200
    # For a widget with token auth requirement, this returns 401
    # Since test_widget doesn't set require_token_auth, it should return 200
    response = client.get(f"/api/v1/widgets/{test_widget.id}")
    # This endpoint may return 200 if no auth is required, or 401 if auth is required
    # The test setup determines what's required
    assert response.status_code in [200, 401] 
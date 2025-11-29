"""
ChatterMate - Test Slack API Endpoints
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
import json
import hmac
import hashlib
import time
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient
from fastapi import FastAPI
from uuid import uuid4

from app.api import slack as slack_router
from app.database import get_db
from app.core.auth import get_current_organization
from app.core.config import settings
from tests.conftest import engine, TestingSessionLocal, create_tables
from app.database import Base

# Create a test FastAPI app
app = FastAPI()
app.include_router(
    slack_router.router,
    prefix=f"{settings.API_V1_STR}/slack",
    tags=["slack"]
)


def generate_slack_signature(body: bytes, timestamp: str, signing_secret: str = "test_signing_secret") -> str:
    """Generate a valid Slack signature for testing"""
    sig_basestring = f"v0:{timestamp}:{body.decode('utf-8')}"
    return "v0=" + hmac.new(
        signing_secret.encode('utf-8'),
        sig_basestring.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()


@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test."""
    Base.metadata.drop_all(bind=engine)
    create_tables()
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db):
    """Create a test client"""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


class TestSlackEventsEndpoint:
    """Tests for /api/v1/slack/events endpoint"""

    def test_url_verification(self, client):
        """Test Slack URL verification challenge"""
        body = {
            "type": "url_verification",
            "challenge": "test_challenge_123"
        }

        response = client.post(
            "/api/v1/slack/events",
            json=body
        )

        assert response.status_code == 200
        assert response.json()["challenge"] == "test_challenge_123"

    def test_events_invalid_signature(self, client):
        """Test events endpoint rejects invalid signature"""
        body = json.dumps({"type": "event_callback", "event": {}}).encode()
        timestamp = str(int(time.time()))

        with patch('app.services.slack.slack_service.verify_signature', return_value=False):
            response = client.post(
                "/api/v1/slack/events",
                content=body,
                headers={
                    "Content-Type": "application/json",
                    "X-Slack-Request-Timestamp": timestamp,
                    "X-Slack-Signature": "v0=invalid"
                }
            )

        assert response.status_code == 401

    def test_events_valid_event(self, client):
        """Test events endpoint accepts valid event"""
        body = json.dumps({
            "type": "event_callback",
            "team_id": "T12345",
            "event": {
                "type": "message",
                "channel_type": "im",
                "user": "U12345",
                "text": "Hello"
            }
        }).encode()
        timestamp = str(int(time.time()))

        with patch('app.services.slack.slack_service.verify_signature', return_value=True), \
             patch('app.services.slack_chat.process_slack_event', new_callable=AsyncMock):
            response = client.post(
                "/api/v1/slack/events",
                content=body,
                headers={
                    "Content-Type": "application/json",
                    "X-Slack-Request-Timestamp": timestamp,
                    "X-Slack-Signature": "v0=test"
                }
            )

        assert response.status_code == 200


class TestSlackCommandsEndpoint:
    """Tests for /api/v1/slack/commands endpoint"""

    def test_commands_help(self, client):
        """Test /chattermate help command"""
        body = "command=/chattermate&text=help&team_id=T12345&channel_id=C12345&user_id=U12345"
        timestamp = str(int(time.time()))

        with patch('app.services.slack.slack_service.verify_signature', return_value=True):
            response = client.post(
                "/api/v1/slack/commands",
                content=body.encode(),
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Slack-Request-Timestamp": timestamp,
                    "X-Slack-Signature": "v0=test"
                }
            )

        assert response.status_code == 200
        data = response.json()
        assert "response_type" in data
        assert data["response_type"] == "ephemeral"
        assert "Commands" in data["text"] or "commands" in data["text"].lower()

    def test_commands_invalid_signature(self, client):
        """Test commands endpoint rejects invalid signature"""
        body = "command=/chattermate&text=test&team_id=T12345"
        timestamp = str(int(time.time()))

        with patch('app.services.slack.slack_service.verify_signature', return_value=False):
            response = client.post(
                "/api/v1/slack/commands",
                content=body.encode(),
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Slack-Request-Timestamp": timestamp,
                    "X-Slack-Signature": "v0=invalid"
                }
            )

        assert response.status_code == 401

    def test_commands_question(self, client):
        """Test /chattermate with a question"""
        body = "command=/chattermate&text=What is the weather?&team_id=T12345&channel_id=C12345&user_id=U12345&response_url=https://hooks.slack.com/commands/123"
        timestamp = str(int(time.time()))

        with patch('app.services.slack.slack_service.verify_signature', return_value=True), \
             patch('app.services.slack_chat.process_slash_command', new_callable=AsyncMock):
            response = client.post(
                "/api/v1/slack/commands",
                content=body.encode(),
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Slack-Request-Timestamp": timestamp,
                    "X-Slack-Signature": "v0=test"
                }
            )

        assert response.status_code == 200
        data = response.json()
        assert data["response_type"] == "ephemeral"
        assert "Processing" in data["text"]


class TestSlackInteractionsEndpoint:
    """Tests for /api/v1/slack/interactions endpoint"""

    def test_interactions_invalid_signature(self, client):
        """Test interactions endpoint rejects invalid signature"""
        payload = json.dumps({"type": "block_actions"})
        body = f"payload={payload}"
        timestamp = str(int(time.time()))

        with patch('app.services.slack.slack_service.verify_signature', return_value=False):
            response = client.post(
                "/api/v1/slack/interactions",
                content=body.encode(),
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Slack-Request-Timestamp": timestamp,
                    "X-Slack-Signature": "v0=invalid"
                }
            )

        assert response.status_code == 401

    def test_interactions_block_action(self, client):
        """Test block action interaction"""
        payload = json.dumps({
            "type": "block_actions",
            "team": {"id": "T12345"},
            "actions": [{"action_id": "test_action"}]
        })
        body = f"payload={payload}"
        timestamp = str(int(time.time()))

        with patch('app.services.slack.slack_service.verify_signature', return_value=True), \
             patch('app.services.slack_chat.process_slack_interaction', new_callable=AsyncMock):
            response = client.post(
                "/api/v1/slack/interactions",
                content=body.encode(),
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Slack-Request-Timestamp": timestamp,
                    "X-Slack-Signature": "v0=test"
                }
            )

        assert response.status_code == 200


class TestSlackDataDeletionEndpoint:
    """Tests for /api/v1/slack/data-deletion endpoint"""

    def test_data_deletion_invalid_signature(self, client):
        """Test data deletion endpoint rejects invalid signature"""
        body = json.dumps({"team_id": "T12345"}).encode()
        timestamp = str(int(time.time()))

        with patch('app.services.slack.slack_service.verify_signature', return_value=False):
            response = client.post(
                "/api/v1/slack/data-deletion",
                content=body,
                headers={
                    "Content-Type": "application/json",
                    "X-Slack-Request-Timestamp": timestamp,
                    "X-Slack-Signature": "v0=invalid"
                }
            )

        assert response.status_code == 401

    def test_data_deletion_missing_team_id(self, client):
        """Test data deletion requires team_id"""
        body = json.dumps({}).encode()
        timestamp = str(int(time.time()))

        with patch('app.services.slack.slack_service.verify_signature', return_value=True):
            response = client.post(
                "/api/v1/slack/data-deletion",
                content=body,
                headers={
                    "Content-Type": "application/json",
                    "X-Slack-Request-Timestamp": timestamp,
                    "X-Slack-Signature": "v0=test"
                }
            )

        assert response.status_code == 400

    def test_data_deletion_workspace(self, client, db):
        """Test workspace data deletion"""
        body = json.dumps({"team_id": "T12345"}).encode()
        timestamp = str(int(time.time()))

        with patch('app.services.slack.slack_service.verify_signature', return_value=True), \
             patch('app.api.slack.SlackRepository') as mock_repo_class:

            mock_repo = MagicMock()
            mock_repo.delete_workspace_data.return_value = {"deleted": True}
            mock_repo_class.return_value = mock_repo

            response = client.post(
                "/api/v1/slack/data-deletion",
                content=body,
                headers={
                    "Content-Type": "application/json",
                    "X-Slack-Request-Timestamp": timestamp,
                    "X-Slack-Signature": "v0=test"
                }
            )

        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True


class TestSlackStatusEndpoint:
    """Tests for /api/v1/slack/status endpoint"""

    def test_status_not_connected(self, client, db):
        """Test status when not connected"""
        mock_org = MagicMock()
        mock_org.id = uuid4()

        async def override_get_current_organization():
            return mock_org

        app.dependency_overrides[get_current_organization] = override_get_current_organization

        with patch('app.api.slack.SlackRepository') as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.get_token_by_org.return_value = None
            mock_repo_class.return_value = mock_repo

            response = client.get("/api/v1/slack/status")

        assert response.status_code == 200
        data = response.json()
        assert data["connected"] is False

    def test_status_connected(self, client, db):
        """Test status when connected"""
        mock_org = MagicMock()
        mock_org.id = uuid4()

        async def override_get_current_organization():
            return mock_org

        app.dependency_overrides[get_current_organization] = override_get_current_organization

        mock_token = MagicMock()
        mock_token.access_token = "xoxb-test"
        mock_token.team_id = "T12345"
        mock_token.team_name = "Test Team"
        mock_token.bot_user_id = "B12345"

        with patch('app.api.slack.SlackRepository') as mock_repo_class, \
             patch('app.api.slack.slack_service.auth_test', new_callable=AsyncMock) as mock_auth:

            mock_repo = MagicMock()
            mock_repo.get_token_by_org.return_value = mock_token
            mock_repo_class.return_value = mock_repo

            mock_auth.return_value = {"ok": True}

            response = client.get("/api/v1/slack/status")

        assert response.status_code == 200
        data = response.json()
        assert data["connected"] is True
        assert data["team_id"] == "T12345"
        assert data["team_name"] == "Test Team"


class TestSlackChannelsEndpoint:
    """Tests for /api/v1/slack/channels endpoint"""

    def test_channels_not_connected(self, client, db):
        """Test channels when not connected"""
        mock_org = MagicMock()
        mock_org.id = uuid4()

        async def override_get_current_organization():
            return mock_org

        app.dependency_overrides[get_current_organization] = override_get_current_organization

        with patch('app.api.slack.SlackRepository') as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.get_token_by_org.return_value = None
            mock_repo_class.return_value = mock_repo

            response = client.get("/api/v1/slack/channels")

        assert response.status_code == 404

    def test_channels_list(self, client, db):
        """Test getting channels list"""
        mock_org = MagicMock()
        mock_org.id = uuid4()

        async def override_get_current_organization():
            return mock_org

        app.dependency_overrides[get_current_organization] = override_get_current_organization

        mock_token = MagicMock()
        mock_token.access_token = "xoxb-test"

        mock_channels = [
            {"id": "C12345", "name": "general", "is_private": False, "is_member": True},
            {"id": "C67890", "name": "random", "is_private": False, "is_member": True}
        ]

        with patch('app.api.slack.SlackRepository') as mock_repo_class, \
             patch('app.api.slack.slack_service.get_conversations_list', new_callable=AsyncMock) as mock_channels_api:

            mock_repo = MagicMock()
            mock_repo.get_token_by_org.return_value = mock_token
            mock_repo_class.return_value = mock_repo

            mock_channels_api.return_value = mock_channels

            response = client.get("/api/v1/slack/channels")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["name"] == "general"


class TestSlackPrivacyEndpoint:
    """Tests for /api/v1/slack/privacy endpoint"""

    def test_privacy_redirect(self, client):
        """Test privacy endpoint redirects"""
        with patch('app.core.config.settings') as mock_settings:
            mock_settings.FRONTEND_URL = "https://app.chattermate.chat"

            response = client.get(
                "/api/v1/slack/privacy",
                follow_redirects=False
            )

        assert response.status_code == 307
        assert "privacy" in response.headers.get("location", "").lower() or \
               response.headers.get("location", "").startswith("https://")

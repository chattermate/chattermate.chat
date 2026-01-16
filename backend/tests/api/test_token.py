"""
ChatterMate - Test Token API
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
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch, AsyncMock
from uuid import uuid4
from datetime import datetime, timezone
import jwt

from app.api import token as token_router
from app.api.token import (
    validate_api_key,
    GenerateTokenRequest,
    RevokeTokenRequest,
    RevokeByEmailRequest,
)
from app.database import get_db
from app.core.security import CONVERSATION_SECRET_KEY, ALGORITHM


# Create test app
app = FastAPI()
app.include_router(token_router.router, prefix="/api/v1")


@pytest.fixture
def mock_db():
    """Create a mock database session."""
    db = MagicMock()
    return db


@pytest.fixture
def mock_widget_app():
    """Create a mock widget app."""
    widget_app = MagicMock()
    widget_app.id = uuid4()
    widget_app.organization_id = uuid4()
    widget_app.is_active = True
    return widget_app


@pytest.fixture
def mock_widget(mock_widget_app):
    """Create a mock widget."""
    widget = MagicMock()
    widget.id = str(uuid4())
    widget.organization_id = mock_widget_app.organization_id
    widget.name = "Test Widget"
    return widget


@pytest.fixture
def mock_customer(mock_widget):
    """Create a mock customer."""
    customer = MagicMock()
    customer.id = uuid4()
    customer.email = "test@example.com"
    customer.full_name = "Test User"
    customer.organization_id = mock_widget.organization_id
    return customer


@pytest.fixture
def valid_api_key():
    """Return a valid API key."""
    return "wak_test_api_key_12345678901234567890"


class TestValidateApiKey:
    """Tests for API key validation."""

    def test_missing_authorization_header(self, mock_db):
        """Test missing Authorization header."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db
        client = TestClient(app)

        response = client.post(
            "/api/v1/generate-token",
            json={"widget_id": "test-widget"}
        )

        assert response.status_code == 401
        assert "Missing or invalid Authorization header" in response.json()["detail"]

        app.dependency_overrides.clear()

    def test_invalid_authorization_format(self, mock_db):
        """Test invalid Authorization header format."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db
        client = TestClient(app)

        response = client.post(
            "/api/v1/generate-token",
            json={"widget_id": "test-widget"},
            headers={"Authorization": "Basic invalid"}
        )

        assert response.status_code == 401
        assert "Missing or invalid Authorization header" in response.json()["detail"]

        app.dependency_overrides.clear()

    def test_empty_api_key(self, mock_db):
        """Test empty API key."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db
        client = TestClient(app)

        response = client.post(
            "/api/v1/generate-token",
            json={"widget_id": "test-widget"},
            headers={"Authorization": "Bearer "}
        )

        assert response.status_code == 401
        assert "API key cannot be empty" in response.json()["detail"]

        app.dependency_overrides.clear()

    def test_invalid_api_key(self, mock_db):
        """Test invalid API key."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        with patch('app.api.token.WidgetAppRepository') as MockRepo:
            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = None
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.post(
                "/api/v1/generate-token",
                json={"widget_id": "test-widget"},
                headers={"Authorization": "Bearer invalid_key"}
            )

            assert response.status_code == 401
            assert "Invalid API key" in response.json()["detail"]

        app.dependency_overrides.clear()


class TestGenerateToken:
    """Tests for token generation endpoint."""

    def test_generate_token_success(self, mock_db, mock_widget_app, mock_widget, mock_customer, valid_api_key):
        """Test successful token generation."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        # Mock the query chain
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = mock_widget
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.get_existing_valid_token_jti', return_value=None), \
             patch('app.api.token._store_token_in_redis'):

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            # Mock customer creation
            mock_db.add = MagicMock()
            mock_db.commit = MagicMock()
            mock_db.refresh = MagicMock(side_effect=lambda x: setattr(x, 'id', uuid4()))

            client = TestClient(app)

            response = client.post(
                "/api/v1/generate-token",
                json={
                    "widget_id": mock_widget.id,
                    "customer_email": "test@example.com",
                    "customer_name": "Test User",
                    "ttl_seconds": 3600
                },
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 201
            data = response.json()
            assert data["success"] is True
            assert "token" in data["data"]
            assert data["data"]["widget_id"] == mock_widget.id

        app.dependency_overrides.clear()

    def test_generate_token_widget_not_found(self, mock_db, mock_widget_app, valid_api_key):
        """Test token generation with non-existent widget."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = None  # Widget not found
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        with patch('app.api.token.WidgetAppRepository') as MockRepo:
            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.post(
                "/api/v1/generate-token",
                json={"widget_id": "non-existent-widget"},
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 404
            assert "not found" in response.json()["detail"]

        app.dependency_overrides.clear()

    def test_generate_token_invalid_ttl(self, mock_db, mock_widget_app, mock_widget, valid_api_key):
        """Test token generation with invalid TTL."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = mock_widget
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        with patch('app.api.token.WidgetAppRepository') as MockRepo:
            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            # Mock customer query to return None (new customer)
            mock_db.add = MagicMock()
            mock_db.commit = MagicMock()
            mock_db.refresh = MagicMock(side_effect=lambda x: setattr(x, 'id', uuid4()))

            client = TestClient(app)

            # Test TTL too small
            response = client.post(
                "/api/v1/generate-token",
                json={
                    "widget_id": mock_widget.id,
                    "customer_email": "test@example.com",
                    "ttl_seconds": 10  # Less than 60
                },
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 400
            assert "ttl_seconds must be between" in response.json()["detail"]

        app.dependency_overrides.clear()

    def test_generate_token_anonymous_customer(self, mock_db, mock_widget_app, mock_widget, valid_api_key):
        """Test token generation for anonymous customer."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = mock_widget
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.get_existing_valid_token_jti', return_value=None), \
             patch('app.api.token._store_token_in_redis'):

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            mock_db.add = MagicMock()
            mock_db.commit = MagicMock()
            mock_db.refresh = MagicMock(side_effect=lambda x: setattr(x, 'id', uuid4()))

            client = TestClient(app)

            # No customer_email provided
            response = client.post(
                "/api/v1/generate-token",
                json={
                    "widget_id": mock_widget.id,
                    "ttl_seconds": 3600
                },
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 201
            assert response.json()["success"] is True

        app.dependency_overrides.clear()

    def test_generate_token_existing_customer(self, mock_db, mock_widget_app, mock_widget, mock_customer, valid_api_key):
        """Test token generation for existing customer."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        # First call returns widget, second returns customer
        mock_widget_filter = MagicMock()
        mock_widget_filter.first.return_value = mock_widget

        mock_customer_filter = MagicMock()
        mock_customer_filter.first.return_value = mock_customer

        mock_query = MagicMock()
        mock_query.filter.side_effect = [mock_widget_filter, mock_customer_filter]
        mock_db.query.return_value = mock_query

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.get_existing_valid_token_jti', return_value=None), \
             patch('app.api.token._store_token_in_redis'):

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            mock_db.commit = MagicMock()

            client = TestClient(app)

            response = client.post(
                "/api/v1/generate-token",
                json={
                    "widget_id": mock_widget.id,
                    "customer_email": mock_customer.email,
                    "customer_name": "Updated Name",
                    "ttl_seconds": 3600
                },
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 201
            assert response.json()["success"] is True

        app.dependency_overrides.clear()

    def test_generate_token_reuse_existing_jti(self, mock_db, mock_widget_app, mock_widget, mock_customer, valid_api_key):
        """Test token generation reuses existing JTI."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        # First query returns widget, second query returns existing customer
        mock_widget_filter = MagicMock()
        mock_widget_filter.first.return_value = mock_widget

        # Create a proper mock customer with string values
        existing_customer = MagicMock()
        existing_customer.id = uuid4()
        existing_customer.email = "test@example.com"
        existing_customer.full_name = "Test User"  # String, not MagicMock
        existing_customer.organization_id = mock_widget.organization_id

        mock_customer_filter = MagicMock()
        mock_customer_filter.first.return_value = existing_customer

        mock_query = MagicMock()
        mock_query.filter.side_effect = [mock_widget_filter, mock_customer_filter]
        mock_db.query.return_value = mock_query

        existing_jti = str(uuid4())

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.get_existing_valid_token_jti', return_value=existing_jti), \
             patch('app.api.token._store_token_in_redis'):

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            mock_db.commit = MagicMock()

            client = TestClient(app)

            response = client.post(
                "/api/v1/generate-token",
                json={
                    "widget_id": mock_widget.id,
                    "customer_email": "test@example.com",
                    "ttl_seconds": 3600
                },
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 201
            # Decode token and verify JTI is reused
            token = response.json()["data"]["token"]
            payload = jwt.decode(token, CONVERSATION_SECRET_KEY, algorithms=[ALGORITHM])
            assert payload["jti"] == existing_jti

        app.dependency_overrides.clear()


class TestVerifyToken:
    """Tests for token verification endpoint."""

    def test_verify_token_success(self, mock_db, mock_widget_app, valid_api_key):
        """Test successful token verification."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        widget_id = "test-widget-123"

        # Create a valid token
        token_payload = {
            "sub": str(uuid4()),
            "widget_id": widget_id,
            "customer_email": "test@example.com",
            "jti": str(uuid4()),
            "iat": int(datetime.now(timezone.utc).timestamp()),
            "exp": int(datetime.now(timezone.utc).timestamp()) + 3600,
            "type": "conversation"
        }
        token = jwt.encode(token_payload, CONVERSATION_SECRET_KEY, algorithm=ALGORITHM)

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.verify_conversation_token', return_value=token_payload):

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.post(
                f"/api/v1/verify-token?token={token}&widget_id={widget_id}",
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 200
            assert response.json()["valid"] is True

        app.dependency_overrides.clear()

    def test_verify_token_invalid(self, mock_db, mock_widget_app, valid_api_key):
        """Test verification of invalid token."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.verify_conversation_token', return_value=None):

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.post(
                "/api/v1/verify-token?token=invalid_token&widget_id=test-widget",
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 400
            assert "invalid or has been revoked" in response.json()["detail"]

        app.dependency_overrides.clear()

    def test_verify_token_widget_mismatch(self, mock_db, mock_widget_app, valid_api_key):
        """Test verification with mismatched widget_id."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        token_payload = {
            "sub": str(uuid4()),
            "widget_id": "widget-A",
            "jti": str(uuid4()),
        }

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.verify_conversation_token', return_value=token_payload):

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.post(
                "/api/v1/verify-token?token=some_token&widget_id=widget-B",
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 400
            assert "does not match" in response.json()["detail"]

        app.dependency_overrides.clear()


class TestRevokeToken:
    """Tests for token revocation endpoint."""

    def test_revoke_token_success(self, mock_db, mock_widget_app, valid_api_key):
        """Test successful token revocation."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        # Create a valid token with JTI
        jti = str(uuid4())
        token_payload = {
            "sub": str(uuid4()),
            "widget_id": "test-widget",
            "jti": jti,
            "iat": int(datetime.now(timezone.utc).timestamp()),
            "exp": int(datetime.now(timezone.utc).timestamp()) + 3600,
        }
        token = jwt.encode(token_payload, CONVERSATION_SECRET_KEY, algorithm=ALGORITHM)

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.security_revoke_token') as mock_revoke:

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.post(
                "/api/v1/revoke-token",
                json={"token": token, "reason": "User logout"},
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 200
            assert response.json()["success"] is True
            mock_revoke.assert_called_once_with(jti)

        app.dependency_overrides.clear()

    def test_revoke_token_empty(self, mock_db, mock_widget_app, valid_api_key):
        """Test revocation with empty token."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        with patch('app.api.token.WidgetAppRepository') as MockRepo:
            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.post(
                "/api/v1/revoke-token",
                json={"token": ""},
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 400
            assert "cannot be empty" in response.json()["detail"]

        app.dependency_overrides.clear()

    def test_revoke_token_invalid_format(self, mock_db, mock_widget_app, valid_api_key):
        """Test revocation with invalid token format."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        with patch('app.api.token.WidgetAppRepository') as MockRepo:
            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.post(
                "/api/v1/revoke-token",
                json={"token": "not-a-valid-jwt"},
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 400
            assert "Invalid token format" in response.json()["detail"]

        app.dependency_overrides.clear()

    def test_revoke_token_missing_jti(self, mock_db, mock_widget_app, valid_api_key):
        """Test revocation of token without JTI."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        # Create token without JTI
        token_payload = {
            "sub": str(uuid4()),
            "widget_id": "test-widget",
            "iat": int(datetime.now(timezone.utc).timestamp()),
            "exp": int(datetime.now(timezone.utc).timestamp()) + 3600,
        }
        token = jwt.encode(token_payload, CONVERSATION_SECRET_KEY, algorithm=ALGORITHM)

        with patch('app.api.token.WidgetAppRepository') as MockRepo:
            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.post(
                "/api/v1/revoke-token",
                json={"token": token},
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 400
            assert "missing JTI claim" in response.json()["detail"]

        app.dependency_overrides.clear()


class TestRevokeByEmail:
    """Tests for revoke by email endpoint."""

    def test_revoke_by_email_success(self, mock_db, mock_widget_app, valid_api_key):
        """Test successful session revocation by email."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.security_get_user_active_sessions', return_value=["jti1", "jti2"]), \
             patch('app.api.token.security_revoke_user_sessions') as mock_revoke:

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.post(
                "/api/v1/revoke-by-email",
                json={"email": "test@example.com", "reason": "Account terminated"},
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 200
            assert response.json()["success"] is True
            assert response.json()["revoked_count"] == 2
            mock_revoke.assert_called_once_with("test@example.com")

        app.dependency_overrides.clear()

    def test_revoke_by_email_with_widget(self, mock_db, mock_widget_app, valid_api_key):
        """Test session revocation by email for specific widget."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.security_get_user_active_sessions', return_value=["jti1"]), \
             patch('app.api.token.security_revoke_user_sessions_by_widget') as mock_revoke:

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.post(
                "/api/v1/revoke-by-email",
                json={
                    "email": "test@example.com",
                    "widget_id": "widget-123",
                    "reason": "Removed from widget"
                },
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 200
            assert response.json()["success"] is True
            mock_revoke.assert_called_once_with("test@example.com", "widget-123")

        app.dependency_overrides.clear()

    def test_revoke_by_email_invalid_format(self, mock_db, mock_widget_app, valid_api_key):
        """Test revocation with invalid email format."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        with patch('app.api.token.WidgetAppRepository') as MockRepo:
            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.post(
                "/api/v1/revoke-by-email",
                json={"email": "invalid-email"},
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 400
            assert "Invalid email format" in response.json()["detail"]

        app.dependency_overrides.clear()

    def test_revoke_by_email_no_sessions(self, mock_db, mock_widget_app, valid_api_key):
        """Test revocation when no sessions exist."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.security_get_user_active_sessions', return_value=[]), \
             patch('app.api.token.security_revoke_user_sessions') as mock_revoke:

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.post(
                "/api/v1/revoke-by-email",
                json={"email": "test@example.com"},
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 200
            assert response.json()["success"] is True
            assert response.json()["revoked_count"] == 0

        app.dependency_overrides.clear()


class TestActiveSessions:
    """Tests for active sessions endpoint."""

    def test_get_active_sessions_success(self, mock_db, mock_widget_app, valid_api_key):
        """Test getting all active sessions."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        mock_sessions = {
            "user1@example.com": ["jti1", "jti2"],
            "user2@example.com": ["jti3"]
        }

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.security_get_all_active_sessions', return_value=mock_sessions):

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.get(
                "/api/v1/active-sessions",
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["total_users"] == 2
            assert data["total_sessions"] == 3

        app.dependency_overrides.clear()

    def test_get_active_sessions_empty(self, mock_db, mock_widget_app, valid_api_key):
        """Test getting active sessions when none exist."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.security_get_all_active_sessions', return_value={}):

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.get(
                "/api/v1/active-sessions",
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["total_users"] == 0
            assert data["total_sessions"] == 0

        app.dependency_overrides.clear()


class TestErrorHandling:
    """Tests for error handling in token endpoints."""

    def test_generate_token_internal_error(self, mock_db, mock_widget_app, valid_api_key):
        """Test internal error during token generation."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        with patch('app.api.token.WidgetAppRepository') as MockRepo:
            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            # Make query raise an exception
            mock_db.query.side_effect = Exception("Database error")

            client = TestClient(app)

            response = client.post(
                "/api/v1/generate-token",
                json={"widget_id": "test-widget"},
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 500
            assert "Failed to generate token" in response.json()["detail"]

        app.dependency_overrides.clear()

    def test_verify_token_internal_error(self, mock_db, mock_widget_app, valid_api_key):
        """Test internal error during token verification."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.verify_conversation_token', side_effect=Exception("Error")):

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.post(
                "/api/v1/verify-token?token=test&widget_id=test",
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 500
            assert "Failed to verify token" in response.json()["detail"]

        app.dependency_overrides.clear()

    def test_revoke_token_internal_error(self, mock_db, mock_widget_app, valid_api_key):
        """Test internal error during token revocation."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        # Create a valid token with JTI
        token_payload = {
            "sub": str(uuid4()),
            "jti": str(uuid4()),
        }
        token = jwt.encode(token_payload, CONVERSATION_SECRET_KEY, algorithm=ALGORITHM)

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.security_revoke_token', side_effect=Exception("Redis error")):

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.post(
                "/api/v1/revoke-token",
                json={"token": token},
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 500
            assert "Failed to revoke token" in response.json()["detail"]

        app.dependency_overrides.clear()

    def test_revoke_by_email_internal_error(self, mock_db, mock_widget_app, valid_api_key):
        """Test internal error during email revocation."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.security_get_user_active_sessions', side_effect=Exception("Error")):

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.post(
                "/api/v1/revoke-by-email",
                json={"email": "test@example.com"},
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 500
            assert "Failed to revoke sessions" in response.json()["detail"]

        app.dependency_overrides.clear()

    def test_active_sessions_internal_error(self, mock_db, mock_widget_app, valid_api_key):
        """Test internal error during active sessions retrieval."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.security_get_all_active_sessions', side_effect=Exception("Error")):

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            client = TestClient(app)

            response = client.get(
                "/api/v1/active-sessions",
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 500
            assert "Failed to retrieve active sessions" in response.json()["detail"]

        app.dependency_overrides.clear()


class TestTokenCustomData:
    """Tests for custom data in tokens."""

    def test_generate_token_with_custom_data(self, mock_db, mock_widget_app, mock_widget, valid_api_key):
        """Test token generation with custom data."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        # First query returns widget, second query returns None (new customer)
        mock_widget_filter = MagicMock()
        mock_widget_filter.first.return_value = mock_widget

        mock_customer_filter = MagicMock()
        mock_customer_filter.first.return_value = None  # New customer

        mock_query = MagicMock()
        mock_query.filter.side_effect = [mock_widget_filter, mock_customer_filter]
        mock_db.query.return_value = mock_query

        custom_data = {"plan": "premium", "features": ["chat", "voice"]}

        with patch('app.api.token.WidgetAppRepository') as MockRepo, \
             patch('app.api.token.get_existing_valid_token_jti', return_value=None), \
             patch('app.api.token._store_token_in_redis'):

            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            # Properly mock customer creation - set full_name to a string on new customer
            def refresh_customer(customer):
                customer.id = uuid4()
                customer.full_name = customer.full_name if hasattr(customer, 'full_name') and customer.full_name else "Test User"

            mock_db.add = MagicMock()
            mock_db.commit = MagicMock()
            mock_db.refresh = MagicMock(side_effect=refresh_customer)

            client = TestClient(app)

            response = client.post(
                "/api/v1/generate-token",
                json={
                    "widget_id": mock_widget.id,
                    "customer_email": "test@example.com",
                    "customer_name": "Custom User",  # Provide explicit name
                    "custom_data": custom_data,
                    "ttl_seconds": 3600
                },
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 201
            # Decode token and verify custom data
            token = response.json()["data"]["token"]
            payload = jwt.decode(token, CONVERSATION_SECRET_KEY, algorithms=[ALGORITHM])
            assert payload["custom_data"] == custom_data

        app.dependency_overrides.clear()

    def test_generate_token_ttl_too_large(self, mock_db, mock_widget_app, mock_widget, valid_api_key):
        """Test token generation with TTL too large."""
        def override_get_db():
            yield mock_db

        app.dependency_overrides[get_db] = override_get_db

        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = mock_widget
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        with patch('app.api.token.WidgetAppRepository') as MockRepo:
            mock_repo = MagicMock()
            mock_repo.validate_api_key.return_value = mock_widget_app
            MockRepo.return_value = mock_repo

            mock_db.add = MagicMock()
            mock_db.commit = MagicMock()
            mock_db.refresh = MagicMock(side_effect=lambda x: setattr(x, 'id', uuid4()))

            client = TestClient(app)

            # Test TTL too large (more than 24 hours)
            response = client.post(
                "/api/v1/generate-token",
                json={
                    "widget_id": mock_widget.id,
                    "customer_email": "test@example.com",
                    "ttl_seconds": 100000  # More than 86400
                },
                headers={"Authorization": f"Bearer {valid_api_key}"}
            )

            assert response.status_code == 400
            assert "ttl_seconds must be between" in response.json()["detail"]

        app.dependency_overrides.clear()

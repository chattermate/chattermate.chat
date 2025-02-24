"""
ChatterMate - Test Ai Setup
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
from fastapi.testclient import TestClient
from fastapi import FastAPI
from app.models.user import User
from app.models.ai_config import AIConfig
from app.models.role import Role
from app.models.permission import Permission, role_permissions
from uuid import uuid4
from app.api import ai_setup as ai_setup_router
from app.core.auth import get_current_user, require_permissions
from app.models.schemas.ai_config import AIConfigCreate
from pydantic import SecretStr
from app.database import get_db

# Create a test FastAPI app
app = FastAPI()
app.include_router(
    ai_setup_router.router,
    prefix="/api/ai",
    tags=["ai"]
)

@pytest.fixture
def test_permissions(db) -> list[Permission]:
    """Create test permissions"""
    permissions = []
    for name in ["manage_ai_config", "view_ai_config"]:
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
def test_role(db, test_organization_id, test_permissions) -> Role:
    """Create a test role with required permissions"""
    role = Role(
        name="Test Role",
        description="Test Role Description",
        organization_id=test_organization_id,
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
def test_user(db, test_organization_id, test_role) -> User:
    """Create a test user with required permissions"""
    user = User(
        id=uuid4(),
        email="test@example.com",
        hashed_password="hashed_password",
        is_active=True,
        organization_id=test_organization_id,
        full_name="Test User",
        role_id=test_role.id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_ai_config(db, test_user) -> AIConfig:
    """Create a test AI configuration"""
    config = AIConfig(
        organization_id=test_user.organization_id,
        model_type="OPENAI",
        model_name="gpt-4",
        encrypted_api_key="test_api_key",
        is_active=True
    )
    db.add(config)
    db.commit()
    db.refresh(config)
    return config

@pytest.fixture
def client(db, test_user) -> TestClient:
    """Create test client with mocked dependencies"""
    async def override_get_current_user():
        return test_user

    async def override_require_permissions(*args, **kwargs):
        return test_user

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[require_permissions] = override_require_permissions
    app.dependency_overrides[get_db] = override_get_db
    
    return TestClient(app)

# Mock for ChatAgent.test_api_key
async def mock_test_api_key(api_key: str, model_type: str, model_name: str) -> bool:
    """Mock implementation of test_api_key"""
    if api_key == "invalid_key":
        raise Exception("Invalid API key")
    return True

# Patch ChatAgent.test_api_key for tests
ai_setup_router.ChatAgent.test_api_key = mock_test_api_key

# Test cases
def test_setup_ai_success(client, db, test_user):
    """Test successful AI setup"""
    config_data = {
        "model_type": "OPENAI",
        "model_name": "gpt-4",
        "api_key": "test_valid_key"
    }
    
    response = client.post(
        "/api/ai/setup",
        json=config_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "AI configuration completed successfully"
    assert data["config"]["model_type"] == config_data["model_type"]
    assert data["config"]["model_name"] == config_data["model_name"]

def test_setup_ai_invalid_key(client, db, test_user):
    """Test AI setup with invalid API key"""
    config_data = {
        "model_type": "OPENAI",
        "model_name": "gpt-4",
        "api_key": "invalid_key"
    }
    
    response = client.post(
        "/api/ai/setup",
        json=config_data
    )
    assert response.status_code == 400
    data = response.json()
    assert "error" in data["detail"]
    assert data["detail"]["type"] == "api_key_validation_error"

def test_setup_ai_ollama(client, db, test_user):
    """Test AI setup with Ollama (no API key required)"""
    config_data = {
        "model_type": "OLLAMA",
        "model_name": "llama2",
        "api_key": ""
    }
    
    response = client.post(
        "/api/ai/setup",
        json=config_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["config"]["model_type"] == "OLLAMA"
    assert data["config"]["model_name"] == "llama2"

def test_get_ai_config_success(client, db, test_user, test_ai_config):
    """Test getting AI configuration"""
    response = client.get("/api/ai/config")
    assert response.status_code == 200
    data = response.json()
    assert data["model_type"] == test_ai_config.model_type
    assert data["model_name"] == test_ai_config.model_name

def test_get_ai_config_not_found(client, db, test_user):
    """Test getting AI configuration when none exists"""
    response = client.get("/api/ai/config")
    assert response.status_code == 404
    assert response.json()["detail"] == "No active AI configuration found" 
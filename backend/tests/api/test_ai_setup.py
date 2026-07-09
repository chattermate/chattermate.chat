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
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import FastAPI
from app.models.user import User
from app.models.ai_config import AIConfig, AIModelType
from app.models.role import Role
from app.models.permission import Permission, role_permissions
from uuid import uuid4
from app.api import ai_setup as ai_setup_router
from app.core.auth import get_current_user, require_permissions
from app.models.schemas.ai_config import AIConfigCreate, AIConfigUpdate
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
        model_name="gpt-4o-mini",
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
    elif api_key == "failed_validation":
        return False
    return True

# Patch ChatAgent.test_api_key for tests
ai_setup_router.ChatAgent.test_api_key = mock_test_api_key

# Also patch the validate_model_selection function
original_validate = ai_setup_router.validate_model_selection

def mock_validate_model_selection(model_type: str, model_name: str):
    if model_type.upper() == "INVALID_MODEL":
        raise ai_setup_router.HTTPException(
            status_code=400,
            detail={
                "error": "Unsupported provider",
                "type": "invalid_provider",
                "details": "Currently only these providers are supported: GROQ, OPENAI, CHATTERMATE"
            }
        )
    return original_validate(model_type, model_name)

ai_setup_router.validate_model_selection = mock_validate_model_selection

# Test cases
def test_setup_ai_success(client, db, test_user):
    """Test successful AI setup"""
    config_data = {
        "model_type": "OPENAI",
        "model_name": "gpt-4o-mini",
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
        "model_name": "gpt-4o-mini",
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

def test_setup_ai_failed_validation(client, db, test_user):
    """Test AI setup with failed API key validation"""
    config_data = {
        "model_type": "OPENAI",
        "model_name": "gpt-4o-mini",
        "api_key": "failed_validation"
    }
    
    response = client.post(
        "/api/ai/setup",
        json=config_data
    )
    assert response.status_code == 400
    data = response.json()
    assert "error" in data["detail"]
    assert data["detail"]["type"] == "invalid_api_key"

def test_setup_ai_invalid_model(client, db, test_user):
    """A model ID that fails the live API-key/model test is rejected.

    Model IDs are no longer statically allowlisted (orgs may enter custom ones), so
    an unusable model is caught by the live test returning False, not by validation.
    """
    config_data = {
        "model_type": "OPENAI",
        "model_name": "nonexistent-model",
        "api_key": "failed_validation"  # mock_test_api_key returns False for this key
    }

    response = client.post(
        "/api/ai/setup",
        json=config_data
    )
    assert response.status_code == 400
    data = response.json()
    assert "error" in data["detail"]
    assert data["detail"]["type"] == "invalid_api_key"

def test_setup_ai_custom_model_id_succeeds(client, db, test_user):
    """A custom (non-catalog) model ID with a working key is accepted."""
    config_data = {
        "model_type": "OPENAI",
        "model_name": "gpt-some-future-model",
        "api_key": "test_valid_key"
    }

    response = client.post(
        "/api/ai/setup",
        json=config_data
    )
    assert response.status_code == 200

def test_setup_ai_invalid_provider(client, db, test_user):
    """Test AI setup with invalid provider"""
    config_data = {
        "model_type": "INVALID_MODEL",
        "model_name": "test-model",
        "api_key": "test_valid_key"
    }
    
    response = client.post(
        "/api/ai/setup",
        json=config_data
    )
    assert response.status_code == 422  # Pydantic validation error returns 422
    data = response.json()
    assert "detail" in data
    # Pydantic validation errors have a different format
    assert any("model_type" in str(err).lower() for err in data["detail"])

def test_setup_ai_groq(client, db, test_user):
    """Test AI setup with Groq"""
    config_data = {
        "model_type": "GROQ",
        "model_name": "llama-3.3-70b-versatile",
        "api_key": "test_valid_key"
    }
    
    response = client.post(
        "/api/ai/setup",
        json=config_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["config"]["model_type"] == "GROQ"
    assert data["config"]["model_name"] == "llama-3.3-70b-versatile"

@patch.dict(os.environ, {
    'CHATTERMATE_API_KEY': 'test_chattermate_key',
    'CHATTERMATE_MODEL_NAME': 'gpt-4o-mini'
})
@patch('app.api.ai_setup.HAS_ENTERPRISE', True)
def test_setup_ai_chattermate_success(client, db, test_user):
    """Test successful ChatterMate AI setup"""
    config_data = {
        "model_type": "CHATTERMATE",
        "model_name": "chattermate",
        "api_key": "any_key"  # This will be ignored for ChatterMate
    }
    
    response = client.post(
        "/api/ai/setup",
        json=config_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "AI configuration completed successfully"
    assert data["config"]["model_type"] == "CHATTERMATE"
    assert data["config"]["model_name"] == "gpt-4o-mini"

@patch.dict(os.environ, {}, clear=True)  # Clear environment variables
@patch('app.api.ai_setup.HAS_ENTERPRISE', True)
def test_setup_ai_chattermate_missing_key(client, db, test_user):
    """Test ChatterMate AI setup with missing API key"""
    config_data = {
        "model_type": "CHATTERMATE",
        "model_name": "chattermate",
        "api_key": "any_key"
    }
    
    response = client.post(
        "/api/ai/setup",
        json=config_data
    )
    assert response.status_code == 500
    assert "ChatterMate API configuration missing" in response.json()["detail"]

def test_setup_ai_general_exception(client, db, test_user):
    """Test setup AI with general exception"""
    config_data = {
        "model_type": "OPENAI",
        "model_name": "gpt-4o-mini",
        "api_key": "test_valid_key"
    }
    
    # Mock the repository to raise an exception
    with patch('app.repositories.ai_config.AIConfigRepository.create_config') as mock_create:
        mock_create.side_effect = Exception("Database error")
        
        response = client.post(
            "/api/ai/setup",
            json=config_data
        )
        assert response.status_code == 500
        assert response.json()["detail"] == "Failed to setup AI configuration"

def test_get_providers(client, db, test_user):
    """The /providers endpoint returns the catalog of selectable providers."""
    response = client.get("/api/ai/providers")
    assert response.status_code == 200
    data = response.json()
    providers = {p["value"]: p for p in data["providers"]}
    # Newly enabled providers are present alongside OpenAI/Groq
    for expected in ("OPENAI", "GROQ", "ANTHROPIC", "GOOGLE", "MISTRAL", "XAI", "DEEPSEEK"):
        assert expected in providers, f"{expected} missing from /providers"
    # ChatterMate (managed) is not a user-selectable BYO-key provider
    assert "CHATTERMATE" not in providers
    # Each provider exposes suggested models and BYO-key metadata
    openai = providers["OPENAI"]
    assert openai["requires_api_key"] is True
    assert openai["custom_allowed"] is True
    assert len(openai["models"]) > 0
    assert all("value" in m and "label" in m for m in openai["models"])
    # Every provider exposes a console URL for obtaining an API key
    for p in data["providers"]:
        assert p["api_key_url"].startswith("https://"), f"{p['value']} missing api_key_url"

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

def test_get_ai_config_exception(client, db, test_user):
    """Test getting AI config with database exception"""
    with patch('app.repositories.ai_config.AIConfigRepository.get_active_config') as mock_get:
        mock_get.side_effect = Exception("Database error")
        
        response = client.get("/api/ai/config")
        assert response.status_code == 500
        assert response.json()["detail"] == "Failed to get AI configuration"

def test_update_ai_config_success(client, db, test_user, test_ai_config):
    """Test successful AI config update"""
    update_data = {
        "model_type": "OPENAI",
        "model_name": "o1-mini",
        "api_key": "new_valid_key"
    }
    
    response = client.put(
        "/api/ai/config",
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "AI configuration updated successfully"
    assert data["config"]["model_name"] == update_data["model_name"]

def test_update_ai_config_not_found(client, db, test_user):
    """Test updating AI config when none exists"""
    update_data = {
        "model_type": "OPENAI",
        "model_name": "gpt-4o-mini",
        "api_key": "test_valid_key"
    }
    
    response = client.put(
        "/api/ai/config",
        json=update_data
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "No active AI configuration found to update"

def test_update_ai_config_without_api_key(client, db, test_user, test_ai_config):
    """Test updating AI config without providing new API key"""
    update_data = {
        "model_type": "OPENAI",
        "model_name": "o1-mini"
        # No api_key provided
    }
    
    # Mock the repository to handle None API key properly
    with patch('app.repositories.ai_config.AIConfigRepository.update_config') as mock_update:
        mock_update.return_value = test_ai_config
        response = client.put(
            "/api/ai/config",
            json=update_data
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "AI configuration updated successfully"
        # Verify that update_config was called with None for api_key (no change)
        mock_update.assert_called_once()
        call_args = mock_update.call_args
        assert call_args[1]['api_key'] is None  # None indicates no change

def test_update_ai_config_failed_validation(client, db, test_user, test_ai_config):
    """Test update AI config with failed API key validation"""
    update_data = {
        "model_type": "OPENAI",
        "model_name": "gpt-4o-mini",
        "api_key": "failed_validation"
    }
    
    response = client.put(
        "/api/ai/config",
        json=update_data
    )
    assert response.status_code == 400
    data = response.json()
    # The mock returns False, which triggers the InvalidAPI exception that gets caught and re-raised as validation error
    assert data["detail"]["type"] == "api_key_validation_error"

def test_update_ai_config_validation_exception(client, db, test_user, test_ai_config):
    """Test update AI config with validation exception"""
    update_data = {
        "model_type": "OPENAI",
        "model_name": "gpt-4o-mini",
        "api_key": "invalid_key"
    }
    
    response = client.put(
        "/api/ai/config",
        json=update_data
    )
    assert response.status_code == 400
    data = response.json()
    assert data["detail"]["type"] == "api_key_validation_error"

@patch.dict(os.environ, {
    'CHATTERMATE_API_KEY': 'test_chattermate_key',
    'CHATTERMATE_MODEL_NAME': 'gpt-4o-mini'
})
@patch('app.api.ai_setup.HAS_ENTERPRISE', True)
def test_update_ai_config_chattermate_success(client, db, test_user, test_ai_config):
    """Test successful ChatterMate AI config update"""
    update_data = {
        "model_type": "CHATTERMATE",
        "model_name": "chattermate"
    }
    
    response = client.put(
        "/api/ai/config",
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "AI configuration updated successfully"
    assert data["config"]["model_type"] == "CHATTERMATE"

@patch.dict(os.environ, {}, clear=True)
@patch('app.api.ai_setup.HAS_ENTERPRISE', True)
def test_update_ai_config_chattermate_missing_key(client, db, test_user, test_ai_config):
    """Test ChatterMate AI config update with missing API key"""
    update_data = {
        "model_type": "CHATTERMATE",
        "model_name": "chattermate"
    }
    
    response = client.put(
        "/api/ai/config",
        json=update_data
    )
    assert response.status_code == 500
    assert "ChatterMate API configuration missing" in response.json()["detail"]

def test_update_ai_config_general_exception(client, db, test_user, test_ai_config):
    """Test update AI config with general exception"""
    update_data = {
        "model_type": "OPENAI",
        "model_name": "gpt-4o-mini",
        "api_key": "test_valid_key"
    }
    
    with patch('app.repositories.ai_config.AIConfigRepository.update_config') as mock_update:
        mock_update.side_effect = Exception("Database error")
        
        response = client.put(
            "/api/ai/config",
            json=update_data
        )
        assert response.status_code == 500
        assert response.json()["detail"] == "Failed to update AI configuration"

def test_validate_model_selection_chattermate():
    """Test validate_model_selection with ChatterMate"""
    # Should not raise any exception
    ai_setup_router.validate_model_selection("CHATTERMATE", "chattermate")
    ai_setup_router.validate_model_selection("chattermate", "CHATTERMATE")

def test_validate_model_selection_groq_valid():
    """Test validate_model_selection with valid Groq model"""
    # Should not raise any exception
    ai_setup_router.validate_model_selection("GROQ", "llama-3.3-70b-versatile")

def test_validate_model_selection_custom_model_allowed():
    """Custom (non-catalog) model IDs are allowed for any known provider.

    Model IDs are no longer a hard allowlist — orgs may type their own; the live
    API-key test is what rejects a bad model ID.
    """
    # Should not raise — custom model IDs are permitted for known providers
    ai_setup_router.validate_model_selection("GROQ", "some-custom-groq-model")
    ai_setup_router.validate_model_selection("OPENAI", "gpt-custom-preview")

def test_validate_model_selection_openai_valid():
    """Test validate_model_selection with valid OpenAI model"""
    # Should not raise any exception
    ai_setup_router.validate_model_selection("OPENAI", "gpt-4o-mini")
    ai_setup_router.validate_model_selection("OPENAI", "o1-mini")

def test_validate_model_selection_empty_model_name():
    """A known provider still requires a non-empty model ID."""
    with pytest.raises(ai_setup_router.HTTPException) as exc_info:
        ai_setup_router.validate_model_selection("OPENAI", "   ")

    assert exc_info.value.status_code == 400
    assert "Invalid model selection" in exc_info.value.detail["error"]
    assert "invalid_model" in exc_info.value.detail["type"]

def test_validate_model_selection_newly_enabled_providers():
    """Providers added to the catalog (Anthropic, Google, etc.) now validate."""
    # Should not raise — these are known providers in the catalog now
    ai_setup_router.validate_model_selection("ANTHROPIC", "claude-sonnet-5")
    ai_setup_router.validate_model_selection("GOOGLE", "gemini-2.5-flash")
    ai_setup_router.validate_model_selection("MISTRAL", "mistral-large-latest")
    ai_setup_router.validate_model_selection("XAI", "grok-4")

def test_validate_model_selection_unsupported_provider():
    """Test validate_model_selection with a provider that is not in the catalog"""
    with pytest.raises(ai_setup_router.HTTPException) as exc_info:
        ai_setup_router.validate_model_selection("FAKE_PROVIDER", "some-model")

    assert exc_info.value.status_code == 400
    assert "Unsupported provider" in exc_info.value.detail["error"]
    assert "invalid_provider" in exc_info.value.detail["type"]

def test_setup_ai_unsupported_model_type(client, db, test_user):
    """Test setup AI with unsupported model type for API key validation"""
    config_data = {
        "model_type": "CHATTERMATE", 
        "model_name": "some-model",  # Invalid model name for ChatterMate
        "api_key": "test_valid_key"
    }
    
    # When HAS_ENTERPRISE is False, ChatterMate should be rejected by validation
    with patch('app.api.ai_setup.HAS_ENTERPRISE', False):
        response = client.post(
            "/api/ai/setup",
            json=config_data
        )
        # Should fail validation because CHATTERMATE with non-"chattermate" model name is invalid
        assert response.status_code == 400
        data = response.json()
        assert "error" in data["detail"] 
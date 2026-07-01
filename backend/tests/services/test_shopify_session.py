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
import jwt
import time
import uuid
from unittest.mock import MagicMock, patch, AsyncMock
from fastapi import HTTPException, Request
from sqlalchemy.orm import Session

from app.services.shopify_session import (
    ShopifySessionService,
    require_shopify_session,
    require_shopify_or_jwt_auth
)


class TestShopifySessionService:
    """Test cases for ShopifySessionService"""

    def test_get_session_token_from_request_authorization_header(self):
        """Test extracting session token from Authorization header"""
        # Arrange
        mock_request = MagicMock(spec=Request)
        mock_request.headers = {"authorization": "Bearer test_token_123"}
        mock_request.query_params = {}
        
        # Act
        token = ShopifySessionService.get_session_token_from_request(mock_request)
        
        # Assert
        assert token == "test_token_123"

    def test_get_session_token_from_request_query_param(self):
        """Test extracting session token from URL query parameter"""
        # Arrange
        mock_request = MagicMock(spec=Request)
        mock_request.headers = {}
        mock_request.query_params = {"id_token": "query_token_456"}
        
        # Act
        token = ShopifySessionService.get_session_token_from_request(mock_request)
        
        # Assert
        assert token == "query_token_456"

    def test_get_session_token_from_request_authorization_header_priority(self):
        """Test that Authorization header takes priority over query param"""
        # Arrange
        mock_request = MagicMock(spec=Request)
        mock_request.headers = {"authorization": "Bearer header_token"}
        mock_request.query_params = {"id_token": "query_token"}
        
        # Act
        token = ShopifySessionService.get_session_token_from_request(mock_request)
        
        # Assert
        assert token == "header_token"

    def test_get_session_token_from_request_no_token(self):
        """Test when no token is present"""
        # Arrange
        mock_request = MagicMock(spec=Request)
        mock_request.headers = {}
        mock_request.query_params = {}
        
        # Act
        token = ShopifySessionService.get_session_token_from_request(mock_request)
        
        # Assert
        assert token is None

    def test_get_session_token_from_request_empty_bearer(self):
        """Test when Authorization header has empty Bearer token"""
        # Arrange
        mock_request = MagicMock(spec=Request)
        mock_request.headers = {"authorization": "Bearer "}
        mock_request.query_params = {"id_token": "fallback_token"}
        
        # Act
        token = ShopifySessionService.get_session_token_from_request(mock_request)
        
        # Assert
        assert token == "fallback_token"

    def test_get_session_token_from_request_malformed_auth_header(self):
        """Test when Authorization header is malformed"""
        # Arrange
        mock_request = MagicMock(spec=Request)
        mock_request.headers = {"authorization": "Basic some_token"}
        mock_request.query_params = {"id_token": "fallback_token"}
        
        # Act
        token = ShopifySessionService.get_session_token_from_request(mock_request)
        
        # Assert
        assert token == "fallback_token"

    @patch('app.services.shopify_session.settings')
    def test_validate_session_token_success(self, mock_settings):
        """Test successful session token validation"""
        # Arrange
        mock_settings.SHOPIFY_API_SECRET = "test_secret"
        mock_settings.SHOPIFY_API_KEY = "test_key"
        
        # Create a valid JWT token
        payload = {
            'dest': 'https://test-shop.myshopify.com',
            'aud': 'test_key',
            'exp': int(time.time()) + 3600,  # 1 hour from now
            'nbf': int(time.time()) - 60,    # 1 minute ago
            'iat': int(time.time()),
            'sub': 'test_user'
        }
        token = jwt.encode(payload, "test_secret", algorithm="HS256")
        
        # Act
        decoded = ShopifySessionService.validate_session_token(token)
        
        # Assert
        assert decoded['dest'] == 'https://test-shop.myshopify.com'
        assert decoded['aud'] == 'test_key'
        assert 'exp' in decoded
        assert 'nbf' in decoded

    @patch('app.services.shopify_session.settings')
    def test_validate_session_token_expired(self, mock_settings):
        """Test validation of expired session token"""
        # Arrange
        mock_settings.SHOPIFY_API_SECRET = "test_secret"
        mock_settings.SHOPIFY_API_KEY = "test_key"
        
        # Create an expired JWT token
        payload = {
            'dest': 'https://test-shop.myshopify.com',
            'aud': 'test_key',
            'exp': int(time.time()) - 3600,  # 1 hour ago (expired)
            'nbf': int(time.time()) - 7200,  # 2 hours ago
            'iat': int(time.time()) - 7200
        }
        token = jwt.encode(payload, "test_secret", algorithm="HS256")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            ShopifySessionService.validate_session_token(token)
        
        assert exc_info.value.status_code == 401
        assert "expired" in str(exc_info.value.detail).lower()
        assert exc_info.value.headers.get("X-Shopify-Retry-Invalid-Session-Request") == "1"

    @patch('app.services.shopify_session.settings')
    def test_validate_session_token_not_yet_valid(self, mock_settings):
        """Test validation of session token that's not yet valid (nbf in future)"""
        # Arrange
        mock_settings.SHOPIFY_API_SECRET = "test_secret"
        mock_settings.SHOPIFY_API_KEY = "test_key"
        
        # Create a JWT token that's not yet valid
        payload = {
            'dest': 'https://test-shop.myshopify.com',
            'aud': 'test_key',
            'exp': int(time.time()) + 7200,  # 2 hours from now
            'nbf': int(time.time()) + 3600,  # 1 hour from now (not yet valid)
            'iat': int(time.time())
        }
        token = jwt.encode(payload, "test_secret", algorithm="HS256")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            ShopifySessionService.validate_session_token(token)
        
        assert exc_info.value.status_code == 401
        assert "Invalid session token" in str(exc_info.value.detail)

    @patch('app.services.shopify_session.settings')
    def test_validate_session_token_invalid_signature(self, mock_settings):
        """Test validation of token with invalid signature"""
        # Arrange
        mock_settings.SHOPIFY_API_SECRET = "test_secret"
        mock_settings.SHOPIFY_API_KEY = "test_key"
        
        # Create a JWT token with wrong secret
        payload = {
            'dest': 'https://test-shop.myshopify.com',
            'aud': 'test_key',
            'exp': int(time.time()) + 3600,
            'nbf': int(time.time()) - 60,
            'iat': int(time.time())
        }
        token = jwt.encode(payload, "wrong_secret", algorithm="HS256")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            ShopifySessionService.validate_session_token(token)
        
        assert exc_info.value.status_code == 401
        assert "Invalid session token" in str(exc_info.value.detail)
        assert exc_info.value.headers.get("X-Shopify-Retry-Invalid-Session-Request") == "1"

    def test_validate_session_token_malformed_token(self):
        """Test validation of malformed token"""
        # Arrange
        malformed_token = "not.a.valid.jwt.token"
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            ShopifySessionService.validate_session_token(malformed_token)
        
        assert exc_info.value.status_code == 401
        assert "Invalid session token" in str(exc_info.value.detail)

    def test_is_document_request_no_auth_header(self):
        """Test document request detection when no Authorization header"""
        # Arrange
        mock_request = MagicMock(spec=Request)
        mock_request.headers = {}
        
        # Act
        is_document = ShopifySessionService.is_document_request(mock_request)
        
        # Assert
        assert is_document is True

    def test_is_document_request_with_auth_header(self):
        """Test document request detection when Authorization header present"""
        # Arrange
        mock_request = MagicMock(spec=Request)
        mock_request.headers = {"authorization": "Bearer token"}
        
        # Act
        is_document = ShopifySessionService.is_document_request(mock_request)
        
        # Assert
        assert is_document is False


class TestRequireShopifySession:
    """Test cases for require_shopify_session dependency"""

    @pytest.mark.asyncio
    @patch('app.repositories.shopify_shop_repository.ShopifyShopRepository')
    @patch('app.services.shopify_session.ShopifySessionService.validate_session_token')
    @patch('app.services.shopify_session.ShopifySessionService.get_session_token_from_request')
    async def test_require_shopify_session_success(
        self, mock_get_token, mock_validate_token, mock_shop_repo
    ):
        """Test successful session validation with shop lookup"""
        # Arrange
        mock_request = MagicMock(spec=Request)
        mock_db = MagicMock(spec=Session)
        
        shop_id = str(uuid.uuid4())
        org_id = str(uuid.uuid4())
        
        mock_get_token.return_value = "valid_token"
        mock_validate_token.return_value = {
            'dest': 'https://test-shop.myshopify.com',
            'aud': 'test_key',
            'exp': int(time.time()) + 3600
        }
        
        # Mock shop repository
        mock_shop_repo_instance = MagicMock()
        mock_shop_repo.return_value = mock_shop_repo_instance
        
        mock_shop = MagicMock()
        mock_shop.id = shop_id
        mock_shop.organization_id = org_id
        mock_shop.is_installed = True
        mock_shop_repo_instance.get_shop_by_domain.return_value = mock_shop
        
        # Act
        result = await require_shopify_session(mock_request, mock_db)
        
        # Assert
        assert result['shop_id'] == shop_id
        assert result['organization_id'] == org_id
        assert result['db_shop'] == mock_shop
        assert result['dest'] == 'https://test-shop.myshopify.com'
        mock_shop_repo_instance.get_shop_by_domain.assert_called_once_with('test-shop.myshopify.com')

    @pytest.mark.asyncio
    @patch('app.services.shopify_session.ShopifySessionService.get_session_token_from_request')
    async def test_require_shopify_session_no_token(self, mock_get_token):
        """Test when no session token is provided"""
        # Arrange
        mock_request = MagicMock(spec=Request)
        mock_db = MagicMock(spec=Session)
        mock_get_token.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await require_shopify_session(mock_request, mock_db)
        
        assert exc_info.value.status_code == 401
        assert "Session token required" in str(exc_info.value.detail)
        assert exc_info.value.headers.get("X-Shopify-Retry-Invalid-Session-Request") == "1"

    @pytest.mark.asyncio
    @patch('app.repositories.shopify_shop_repository.ShopifyShopRepository')
    @patch('app.services.shopify_session.ShopifySessionService.validate_session_token')
    @patch('app.services.shopify_session.ShopifySessionService.get_session_token_from_request')
    async def test_require_shopify_session_shop_not_found(
        self, mock_get_token, mock_validate_token, mock_shop_repo
    ):
        """Test when shop is not found in database"""
        # Arrange
        mock_request = MagicMock(spec=Request)
        mock_db = MagicMock(spec=Session)
        
        mock_get_token.return_value = "valid_token"
        mock_validate_token.return_value = {
            'dest': 'https://nonexistent-shop.myshopify.com'
        }
        
        mock_shop_repo_instance = MagicMock()
        mock_shop_repo.return_value = mock_shop_repo_instance
        mock_shop_repo_instance.get_shop_by_domain.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await require_shopify_session(mock_request, mock_db)
        
        assert exc_info.value.status_code == 403
        assert "Shop not installed or not found" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    @patch('app.repositories.shopify_shop_repository.ShopifyShopRepository')
    @patch('app.services.shopify_session.ShopifySessionService.validate_session_token')
    @patch('app.services.shopify_session.ShopifySessionService.get_session_token_from_request')
    async def test_require_shopify_session_shop_not_installed(
        self, mock_get_token, mock_validate_token, mock_shop_repo
    ):
        """Test when shop exists but is not installed"""
        # Arrange
        mock_request = MagicMock(spec=Request)
        mock_db = MagicMock(spec=Session)
        
        mock_get_token.return_value = "valid_token"
        mock_validate_token.return_value = {
            'dest': 'https://test-shop.myshopify.com'
        }
        
        mock_shop_repo_instance = MagicMock()
        mock_shop_repo.return_value = mock_shop_repo_instance
        
        mock_shop = MagicMock()
        mock_shop.is_installed = False  # Not installed
        mock_shop_repo_instance.get_shop_by_domain.return_value = mock_shop
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await require_shopify_session(mock_request, mock_db)
        
        assert exc_info.value.status_code == 403
        assert "Shop not installed or not found" in str(exc_info.value.detail)


class TestRequireShopifyOrJwtAuth:
    """Test cases for require_shopify_or_jwt_auth hybrid dependency"""

    @pytest.mark.asyncio
    @patch('app.repositories.shopify_shop_repository.ShopifyShopRepository')
    @patch('app.services.shopify_session.ShopifySessionService.validate_session_token')
    @patch('app.services.shopify_session.ShopifySessionService.get_session_token_from_request')
    async def test_require_shopify_or_jwt_auth_shopify_success(
        self, mock_get_token, mock_validate_token, mock_shop_repo
    ):
        """Test successful Shopify session token authentication"""
        # Arrange
        mock_request = MagicMock(spec=Request)
        mock_db = MagicMock(spec=Session)
        
        shop_id = str(uuid.uuid4())
        org_id = str(uuid.uuid4())
        
        mock_get_token.return_value = "valid_token"
        mock_validate_token.return_value = {
            'dest': 'https://test-shop.myshopify.com',
            'aud': 'test_key'
        }
        
        # Mock shop repository
        mock_shop_repo_instance = MagicMock()
        mock_shop_repo.return_value = mock_shop_repo_instance
        
        mock_shop = MagicMock()
        mock_shop.id = shop_id
        mock_shop.organization_id = org_id
        mock_shop.is_installed = True
        mock_shop_repo_instance.get_shop_by_domain.return_value = mock_shop
        
        # Act
        result = await require_shopify_or_jwt_auth(mock_request, mock_db)
        
        # Assert
        assert result['auth_type'] == 'shopify_session'
        assert result['shop_id'] == shop_id
        assert result['organization_id'] == org_id
        assert result['user_id'] is None
        assert result['db_shop'] == mock_shop

    @pytest.mark.asyncio
    @patch('app.core.auth.get_current_user')
    @patch('app.services.shopify_session.ShopifySessionService.get_session_token_from_request')
    async def test_require_shopify_or_jwt_auth_jwt_fallback(
        self, mock_get_token, mock_get_current_user
    ):
        """Test fallback to JWT authentication when no Shopify token"""
        # Arrange
        mock_request = MagicMock(spec=Request)
        mock_db = MagicMock(spec=Session)
        
        user_id = str(uuid.uuid4())
        org_id = str(uuid.uuid4())
        
        mock_get_token.return_value = None  # No Shopify token
        
        # Mock JWT user
        mock_user = MagicMock()
        mock_user.id = user_id
        mock_user.organization_id = org_id
        mock_get_current_user.return_value = mock_user
        
        # Act
        result = await require_shopify_or_jwt_auth(mock_request, mock_db)
        
        # Assert
        assert result['auth_type'] == 'jwt'
        assert result['user_id'] == user_id
        assert result['organization_id'] == org_id
        assert result['current_user'] == mock_user

    @pytest.mark.asyncio
    @patch('app.core.auth.get_current_user')
    @patch('app.services.shopify_session.ShopifySessionService.validate_session_token')
    @patch('app.services.shopify_session.ShopifySessionService.get_session_token_from_request')
    async def test_require_shopify_or_jwt_auth_shopify_fails_jwt_success(
        self, mock_get_token, mock_validate_token, mock_get_current_user
    ):
        """Test fallback to JWT when Shopify token validation fails"""
        # Arrange
        mock_request = MagicMock(spec=Request)
        mock_db = MagicMock(spec=Session)
        
        user_id = str(uuid.uuid4())
        org_id = str(uuid.uuid4())
        
        mock_get_token.return_value = "invalid_token"
        mock_validate_token.side_effect = HTTPException(status_code=401, detail="Invalid token")
        
        # Mock JWT user
        mock_user = MagicMock()
        mock_user.id = user_id
        mock_user.organization_id = org_id
        mock_get_current_user.return_value = mock_user
        
        # Act
        result = await require_shopify_or_jwt_auth(mock_request, mock_db)
        
        # Assert
        assert result['auth_type'] == 'jwt'
        assert result['user_id'] == user_id
        assert result['organization_id'] == org_id

    @pytest.mark.asyncio
    @patch('app.core.auth.get_current_user')
    @patch('app.services.shopify_session.ShopifySessionService.get_session_token_from_request')
    async def test_require_shopify_or_jwt_auth_both_fail(
        self, mock_get_token, mock_get_current_user
    ):
        """Test when both Shopify and JWT authentication fail"""
        # Arrange
        mock_request = MagicMock(spec=Request)
        mock_db = MagicMock(spec=Session)
        
        mock_get_token.return_value = None  # No Shopify token
        mock_get_current_user.side_effect = HTTPException(status_code=401, detail="Not authenticated")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await require_shopify_or_jwt_auth(mock_request, mock_db)
        
        assert exc_info.value.status_code == 401
        assert "Authentication required" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    @patch('app.repositories.shopify_shop_repository.ShopifyShopRepository')
    @patch('app.core.auth.get_current_user')
    @patch('app.services.shopify_session.ShopifySessionService.validate_session_token')
    @patch('app.services.shopify_session.ShopifySessionService.get_session_token_from_request')
    async def test_require_shopify_or_jwt_auth_shopify_shop_not_linked(
        self, mock_get_token, mock_validate_token, mock_get_current_user, mock_shop_repo
    ):
        """Test fallback to JWT when Shopify shop is not linked to organization"""
        # Arrange
        mock_request = MagicMock(spec=Request)
        mock_db = MagicMock(spec=Session)
        
        user_id = str(uuid.uuid4())
        org_id = str(uuid.uuid4())
        
        mock_get_token.return_value = "valid_token"
        mock_validate_token.return_value = {
            'dest': 'https://test-shop.myshopify.com'
        }
        
        # Mock shop repository - shop exists but no organization_id
        mock_shop_repo_instance = MagicMock()
        mock_shop_repo.return_value = mock_shop_repo_instance
        
        mock_shop = MagicMock()
        mock_shop.is_installed = True
        mock_shop.organization_id = None  # Not linked to organization
        mock_shop_repo_instance.get_shop_by_domain.return_value = mock_shop
        
        # Mock JWT user
        mock_user = MagicMock()
        mock_user.id = user_id
        mock_user.organization_id = org_id
        mock_get_current_user.return_value = mock_user
        
        # Act
        result = await require_shopify_or_jwt_auth(mock_request, mock_db)
        
        # Assert
        assert result['auth_type'] == 'jwt'
        assert result['user_id'] == user_id
        assert result['organization_id'] == org_id

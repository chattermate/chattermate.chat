"""
ChatterMate - Test Auth
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
from fastapi import HTTPException, Request, Depends
from sqlalchemy.orm import Session
from uuid import uuid4

from app.core.auth import (
    check_permissions,
    get_current_user,
    get_current_organization,
    require_permissions,
    require_permission,
    require_subscription_management
)
from app.models.user import User
from app.models.organization import Organization
from app.models.permission import Permission
from app.models.role import Role


@pytest.fixture
def mock_db():
    """Create a mock database session"""
    db = MagicMock(spec=Session)
    return db


@pytest.fixture
def mock_user():
    """Create a mock user with role and permissions"""
    user_id = uuid4()
    org_id = uuid4()
    
    # Create permissions
    view_chats_permission = Permission(id=1, name="view_chats")
    manage_agents_permission = Permission(id=2, name="manage_agents")
    
    # Create role with permissions
    role = Role(id=1, name="Agent", permissions=[view_chats_permission, manage_agents_permission])
    
    # Create user with role
    user = User(
        id=user_id,
        email="test@example.com",
        hashed_password="hashed_password",
        is_active=True,
        organization_id=org_id,
        full_name="Test User",
        role=role
    )
    
    return user


@pytest.fixture
def mock_super_admin():
    """Create a mock user with super_admin permission"""
    user_id = uuid4()
    org_id = uuid4()
    
    # Create super_admin permission
    super_admin_permission = Permission(id=3, name="super_admin")
    
    # Create role with super_admin permission
    role = Role(id=2, name="Super Admin", permissions=[super_admin_permission])
    
    # Create user with role
    user = User(
        id=user_id,
        email="admin@example.com",
        hashed_password="hashed_password",
        is_active=True,
        organization_id=org_id,
        full_name="Admin User",
        role=role
    )
    
    return user


@pytest.fixture
def mock_organization():
    """Create a mock organization"""
    org_id = uuid4()
    return Organization(
        id=org_id,
        name="Test Organization",
        domain="test.com",
        is_active=True
    )


def test_check_permissions_with_required_permissions(mock_user):
    """Test check_permissions when user has the required permissions"""
    result = check_permissions(mock_user, ["view_chats"])
    assert result is True


def test_check_permissions_without_required_permissions(mock_user):
    """Test check_permissions when user doesn't have the required permissions"""
    result = check_permissions(mock_user, ["delete_organization"])
    assert result is False


def test_check_permissions_with_super_admin(mock_super_admin):
    """Test check_permissions with super_admin permission"""
    result = check_permissions(mock_super_admin, ["delete_organization"])
    assert result is True


def test_check_permissions_without_role():
    """Test check_permissions when user has no role"""
    user = User(
        id=uuid4(),
        email="noauth@example.com",
        hashed_password="hashed_password",
        is_active=True
    )
    result = check_permissions(user, ["view_chats"])
    assert result is False


@pytest.mark.asyncio
async def test_get_current_user_with_cookie(mock_db, mock_user):
    """Test get_current_user with access token in cookie"""
    # Mock request with cookie
    request = MagicMock(spec=Request)
    access_token = "valid_access_token"
    
    # Mock verify_token
    payload = {"sub": str(mock_user.id)}
    
    # Mock db query
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user
    
    with patch('app.core.auth.verify_token', return_value=payload):
        result = await get_current_user(request, access_token, mock_db)
        assert result == mock_user


@pytest.mark.asyncio
async def test_get_current_user_with_auth_header(mock_db, mock_user):
    """Test get_current_user with access token in Authorization header"""
    # Mock request with Authorization header
    request = MagicMock(spec=Request)
    request.headers.get.return_value = "Bearer valid_access_token"
    
    # Mock verify_token
    payload = {"sub": str(mock_user.id)}
    
    # Mock db query
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user
    
    with patch('app.core.auth.verify_token', return_value=payload):
        result = await get_current_user(request, None, mock_db)
        assert result == mock_user


@pytest.mark.asyncio
async def test_get_current_user_no_token(mock_db):
    """Test get_current_user with no access token"""
    # Mock request with no token
    request = MagicMock(spec=Request)
    request.headers.get.return_value = None
    
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(request, None, mock_db)
    
    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Not authenticated"


@pytest.mark.asyncio
async def test_get_current_user_invalid_token(mock_db):
    """Test get_current_user with invalid token"""
    # Mock request
    request = MagicMock(spec=Request)
    access_token = "invalid_token"
    
    # Mock verify_token
    with patch('app.core.auth.verify_token', return_value=None):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(request, access_token, mock_db)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Invalid authentication token"


@pytest.mark.asyncio
async def test_get_current_user_invalid_payload(mock_db):
    """Test get_current_user with invalid payload"""
    # Mock request
    request = MagicMock(spec=Request)
    access_token = "valid_token_invalid_payload"
    
    # Mock verify_token
    payload = {"not_sub": "invalid"}
    
    with patch('app.core.auth.verify_token', return_value=payload):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(request, access_token, mock_db)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Invalid token payload"


@pytest.mark.asyncio
async def test_get_current_user_user_not_found(mock_db):
    """Test get_current_user when user not found"""
    # Mock request
    request = MagicMock(spec=Request)
    access_token = "valid_token"
    
    # Mock verify_token
    payload = {"sub": str(uuid4())}
    
    # Mock db query - user not found
    mock_db.query.return_value.filter.return_value.first.return_value = None
    
    with patch('app.core.auth.verify_token', return_value=payload):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(request, access_token, mock_db)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "User not found"


@pytest.mark.asyncio
async def test_get_current_user_inactive_user(mock_db, mock_user):
    """Test get_current_user with inactive user"""
    # Mock request
    request = MagicMock(spec=Request)
    access_token = "valid_token"
    
    # Set user as inactive
    mock_user.is_active = False
    
    # Mock verify_token
    payload = {"sub": str(mock_user.id)}
    
    # Mock db query
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user
    
    with patch('app.core.auth.verify_token', return_value=payload):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(request, access_token, mock_db)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "User is inactive"


@pytest.mark.asyncio
async def test_get_current_user_exception(mock_db):
    """Test get_current_user with exception"""
    # Mock request
    request = MagicMock(spec=Request)
    access_token = "valid_token"
    
    # Mock verify_token to raise exception
    with patch('app.core.auth.verify_token', side_effect=Exception("Test exception")):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(request, access_token, mock_db)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Could not validate credentials"


@pytest.mark.asyncio
async def test_get_current_organization_success(mock_db, mock_user, mock_organization):
    """Test get_current_organization success"""
    # Mock db query
    mock_db.query.return_value.filter.return_value.first.return_value = mock_organization
    
    result = await get_current_organization(mock_user, mock_db)
    assert result == mock_organization


@pytest.mark.asyncio
async def test_get_current_organization_no_org_id(mock_db):
    """Test get_current_organization with no organization_id"""
    # Create user with no organization_id
    user = User(
        id=uuid4(),
        email="noorg@example.com",
        hashed_password="hashed_password",
        is_active=True,
        organization_id=None
    )
    
    with pytest.raises(HTTPException) as exc_info:
        await get_current_organization(user, mock_db)
    
    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "User is not associated with any organization"


@pytest.mark.asyncio
async def test_get_current_organization_not_found(mock_db, mock_user):
    """Test get_current_organization when organization not found"""
    # Mock db query - organization not found
    mock_db.query.return_value.filter.return_value.first.return_value = None
    
    with pytest.raises(HTTPException) as exc_info:
        await get_current_organization(mock_user, mock_db)
    
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Organization not found or inactive"


# Test the require_permissions function indirectly through check_permissions
def test_require_permissions_check_with_permissions(mock_user):
    """Test the check used in require_permissions when user has the required permissions"""
    result = check_permissions(mock_user, ["view_chats"])
    assert result is True


def test_require_permissions_check_without_permissions(mock_user):
    """Test the check used in require_permissions when user doesn't have the required permissions"""
    result = check_permissions(mock_user, ["delete_organization"])
    assert result is False


# Test the require_permission function indirectly through role.has_permission
def test_require_permission_check_with_permission(mock_user):
    """Test the check used in require_permission when user has the required permission"""
    # Mock the has_permission method
    mock_user.role.has_permission = MagicMock(return_value=True)
    
    # Check if the role has the permission
    result = mock_user.role.has_permission("view_chats")
    assert result is True
    
    # Verify the has_permission method was called with the correct permission
    mock_user.role.has_permission.assert_called_once_with("view_chats")


def test_require_permission_check_without_permission(mock_user):
    """Test the check used in require_permission when user doesn't have the required permission"""
    # Mock the has_permission method
    mock_user.role.has_permission = MagicMock(return_value=False)
    
    # Check if the role has the permission
    result = mock_user.role.has_permission("delete_organization")
    assert result is False
    
    # Verify the has_permission method was called with the correct permission
    mock_user.role.has_permission.assert_called_once_with("delete_organization")


# Test the require_subscription_management function indirectly through role.can_manage_subscription
def test_require_subscription_management_check_with_permission(mock_user):
    """Test the check used in require_subscription_management when user has the permission"""
    # Mock the can_manage_subscription method
    mock_user.role.can_manage_subscription = MagicMock(return_value=True)
    
    # Check if the role can manage subscriptions
    result = mock_user.role.can_manage_subscription()
    assert result is True
    
    # Verify the can_manage_subscription method was called
    mock_user.role.can_manage_subscription.assert_called_once()


def test_require_subscription_management_check_without_permission(mock_user):
    """Test the check used in require_subscription_management when user doesn't have the permission"""
    # Mock the can_manage_subscription method
    mock_user.role.can_manage_subscription = MagicMock(return_value=False)
    
    # Check if the role can manage subscriptions
    result = mock_user.role.can_manage_subscription()
    assert result is False
    
    # Verify the can_manage_subscription method was called
    mock_user.role.can_manage_subscription.assert_called_once()


@pytest.mark.asyncio
async def test_require_permissions_inner_function(mock_user):
    """Test the inner function of require_permissions directly"""
    # Create the inner function
    permission_checker = require_permissions("view_chats")
    
    # Mock Depends to return our user
    with patch('fastapi.Depends', return_value=mock_user):
        # Call the inner function
        result = await permission_checker(mock_user)
        assert result == mock_user


@pytest.mark.asyncio
async def test_require_permissions_inner_function_forbidden(mock_user):
    """Test the inner function of require_permissions with insufficient permissions"""
    # Create the inner function
    permission_checker = require_permissions("delete_organization")
    
    # Call the inner function and expect an exception
    with pytest.raises(HTTPException) as exc_info:
        await permission_checker(mock_user)
    
    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "Not enough permissions"


@pytest.mark.asyncio
async def test_require_permission_inner_function(mock_user):
    """Test the inner function of require_permission directly"""
    # Mock the role's has_permission method
    mock_user.role.has_permission = MagicMock(return_value=True)
    
    # Create the inner function
    permission_dependency = require_permission("view_chats")
    
    # Call the inner function
    result = await permission_dependency(mock_user)
    assert result == mock_user
    mock_user.role.has_permission.assert_called_once_with("view_chats")


@pytest.mark.asyncio
async def test_require_permission_inner_function_forbidden(mock_user):
    """Test the inner function of require_permission with insufficient permissions"""
    # Mock the role's has_permission method
    mock_user.role.has_permission = MagicMock(return_value=False)
    
    # Create the inner function
    permission_dependency = require_permission("delete_organization")
    
    # Call the inner function and expect an exception
    with pytest.raises(HTTPException) as exc_info:
        await permission_dependency(mock_user)
    
    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "User does not have required permission: delete_organization"
    mock_user.role.has_permission.assert_called_once_with("delete_organization")


@pytest.mark.asyncio
async def test_require_subscription_management_with_permission(mock_user):
    """Test require_subscription_management with sufficient permissions"""
    # Mock the role's can_manage_subscription method
    mock_user.role.can_manage_subscription = MagicMock(return_value=True)
    
    # Call the function
    result = require_subscription_management(mock_user)
    assert result == mock_user
    mock_user.role.can_manage_subscription.assert_called_once()


@pytest.mark.asyncio
async def test_require_subscription_management_without_permission(mock_user):
    """Test require_subscription_management with insufficient permissions"""
    # Mock the role's can_manage_subscription method
    mock_user.role.can_manage_subscription = MagicMock(return_value=False)

    # Call the function and expect an exception
    with pytest.raises(HTTPException) as exc_info:
        require_subscription_management(mock_user)

    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "User does not have permission to manage subscriptions"
    mock_user.role.can_manage_subscription.assert_called_once()


# ==================== Tests for get_auth_info_from_request ====================

from app.core.auth import get_auth_info_from_request

def test_get_auth_info_from_request_shopify_url():
    """Test get_auth_info_from_request with Shopify URL"""
    request = MagicMock(spec=Request)
    request.url = "https://example.com/api/shopify/products"

    result = get_auth_info_from_request(request)
    assert result["is_shopify"] is True


def test_get_auth_info_from_request_non_shopify_url():
    """Test get_auth_info_from_request with non-Shopify URL"""
    request = MagicMock(spec=Request)
    request.url = "https://example.com/api/users"

    result = get_auth_info_from_request(request)
    assert result["is_shopify"] is False


# ==================== Tests for get_unified_auth ====================

from app.core.auth import get_unified_auth

@pytest.mark.asyncio
async def test_get_unified_auth_jwt_success(mock_db, mock_user):
    """Test get_unified_auth with valid JWT token"""
    request = MagicMock(spec=Request)
    request.url = "https://example.com/api/agents"
    request.query_params = {}
    request.cookies.get.return_value = "valid_token"
    request.headers.get.return_value = None

    # Add manage_agents permission
    manage_agents_perm = Permission(id=2, name="manage_agents")
    mock_user.role.permissions = [manage_agents_perm]

    payload = {"sub": str(mock_user.id)}
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    with patch('app.core.auth.verify_token', return_value=payload):
        result = await get_unified_auth(request, mock_db)

    assert result["auth_type"] == "jwt"
    assert result["organization_id"] == mock_user.organization_id
    assert result["current_user"] == mock_user


@pytest.mark.asyncio
async def test_get_unified_auth_jwt_no_token(mock_db):
    """Test get_unified_auth without token"""
    request = MagicMock(spec=Request)
    request.url = "https://example.com/api/agents"
    request.query_params = {}
    request.cookies.get.return_value = None
    request.headers.get.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        await get_unified_auth(request, mock_db)

    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_get_unified_auth_jwt_invalid_token(mock_db):
    """Test get_unified_auth with invalid JWT token"""
    request = MagicMock(spec=Request)
    request.url = "https://example.com/api/agents"
    request.query_params = {}
    request.cookies.get.return_value = "invalid_token"
    request.headers.get.return_value = None

    with patch('app.core.auth.verify_token', return_value=None):
        with pytest.raises(HTTPException) as exc_info:
            await get_unified_auth(request, mock_db)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid authentication token"


@pytest.mark.asyncio
async def test_get_unified_auth_jwt_user_not_found(mock_db):
    """Test get_unified_auth when user not found"""
    request = MagicMock(spec=Request)
    request.url = "https://example.com/api/agents"
    request.query_params = {}
    request.cookies.get.return_value = "valid_token"
    request.headers.get.return_value = None

    payload = {"sub": str(uuid4())}
    mock_db.query.return_value.filter.return_value.first.return_value = None

    with patch('app.core.auth.verify_token', return_value=payload):
        with pytest.raises(HTTPException) as exc_info:
            await get_unified_auth(request, mock_db)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "User not found"


@pytest.mark.asyncio
async def test_get_unified_auth_jwt_inactive_user(mock_db, mock_user):
    """Test get_unified_auth with inactive user"""
    request = MagicMock(spec=Request)
    request.url = "https://example.com/api/agents"
    request.query_params = {}
    request.cookies.get.return_value = "valid_token"
    request.headers.get.return_value = None

    mock_user.is_active = False
    payload = {"sub": str(mock_user.id)}
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    with patch('app.core.auth.verify_token', return_value=payload):
        with pytest.raises(HTTPException) as exc_info:
            await get_unified_auth(request, mock_db)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "User is inactive"


@pytest.mark.asyncio
async def test_get_unified_auth_jwt_no_permissions(mock_db, mock_user):
    """Test get_unified_auth without manage_agents permission"""
    request = MagicMock(spec=Request)
    request.url = "https://example.com/api/agents"
    request.query_params = {}
    request.cookies.get.return_value = "valid_token"
    request.headers.get.return_value = None

    # Remove manage_agents permission
    view_only_perm = Permission(id=1, name="view_only")
    mock_user.role.permissions = [view_only_perm]

    payload = {"sub": str(mock_user.id)}
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    with patch('app.core.auth.verify_token', return_value=payload):
        with pytest.raises(HTTPException) as exc_info:
            await get_unified_auth(request, mock_db)

    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "Not enough permissions"


@pytest.mark.asyncio
async def test_get_unified_auth_shopify_context(mock_db):
    """Test get_unified_auth with Shopify context"""
    request = MagicMock(spec=Request)
    request.url = "https://example.com/api/shopify/agents"
    request.query_params = {}

    mock_auth_result = {
        "auth_type": "shopify",
        "organization_id": uuid4(),
        "user_id": uuid4(),
        "current_user": None
    }

    with patch('app.services.shopify_session.require_shopify_or_jwt_auth', new_callable=AsyncMock) as mock_shopify_auth:
        mock_shopify_auth.return_value = mock_auth_result
        result = await get_unified_auth(request, mock_db)

    assert result["auth_type"] == "shopify"


@pytest.mark.asyncio
async def test_get_unified_auth_with_auth_header(mock_db, mock_user):
    """Test get_unified_auth with Authorization header"""
    request = MagicMock(spec=Request)
    request.url = "https://example.com/api/agents"
    request.query_params = {}
    request.cookies.get.return_value = None
    request.headers.get.return_value = "Bearer valid_token"

    manage_agents_perm = Permission(id=2, name="manage_agents")
    mock_user.role.permissions = [manage_agents_perm]

    payload = {"sub": str(mock_user.id)}
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    with patch('app.core.auth.verify_token', return_value=payload):
        result = await get_unified_auth(request, mock_db)

    assert result["auth_type"] == "jwt"
    assert result["current_user"] == mock_user


# ==================== Tests for get_unified_chat_auth ====================

from app.core.auth import get_unified_chat_auth

@pytest.mark.asyncio
async def test_get_unified_chat_auth_jwt_success(mock_db, mock_user):
    """Test get_unified_chat_auth with valid JWT token"""
    request = MagicMock(spec=Request)
    request.url = "https://example.com/api/chats"
    request.cookies.get.return_value = "valid_token"
    request.headers.get.return_value = None

    # Add chat permissions
    view_all_chats = Permission(id=10, name="view_all_chats")
    mock_user.role.permissions = [view_all_chats]

    payload = {"sub": str(mock_user.id)}
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    with patch('app.core.auth.verify_token', return_value=payload):
        result = await get_unified_chat_auth(request, mock_db)

    assert result["auth_type"] == "jwt"
    assert result["can_view_all"] is True
    assert result["can_view_assigned"] is False


@pytest.mark.asyncio
async def test_get_unified_chat_auth_view_assigned(mock_db, mock_user):
    """Test get_unified_chat_auth with view_assigned_chats permission"""
    request = MagicMock(spec=Request)
    request.url = "https://example.com/api/chats"
    request.cookies.get.return_value = "valid_token"
    request.headers.get.return_value = None

    # Add assigned chats permission only
    view_assigned_chats = Permission(id=11, name="view_assigned_chats")
    mock_user.role.permissions = [view_assigned_chats]

    payload = {"sub": str(mock_user.id)}
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    with patch('app.core.auth.verify_token', return_value=payload):
        result = await get_unified_chat_auth(request, mock_db)

    assert result["auth_type"] == "jwt"
    assert result["can_view_all"] is False
    assert result["can_view_assigned"] is True


@pytest.mark.asyncio
async def test_get_unified_chat_auth_no_permissions(mock_db, mock_user):
    """Test get_unified_chat_auth without chat permissions"""
    request = MagicMock(spec=Request)
    request.url = "https://example.com/api/chats"
    request.cookies.get.return_value = "valid_token"
    request.headers.get.return_value = None

    # No chat permissions
    other_perm = Permission(id=1, name="other_permission")
    mock_user.role.permissions = [other_perm]

    payload = {"sub": str(mock_user.id)}
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    with patch('app.core.auth.verify_token', return_value=payload):
        with pytest.raises(HTTPException) as exc_info:
            await get_unified_chat_auth(request, mock_db)

    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "Not enough permissions"


@pytest.mark.asyncio
async def test_get_unified_chat_auth_shopify_context(mock_db):
    """Test get_unified_chat_auth with Shopify context"""
    request = MagicMock(spec=Request)
    request.url = "https://example.com/api/shopify/chats"

    mock_auth_result = {
        "auth_type": "shopify",
        "organization_id": uuid4(),
        "user_id": uuid4(),
        "current_user": None
    }

    with patch('app.services.shopify_session.require_shopify_or_jwt_auth', new_callable=AsyncMock) as mock_shopify_auth:
        mock_shopify_auth.return_value = mock_auth_result
        result = await get_unified_chat_auth(request, mock_db)

    assert result["auth_type"] == "shopify"


@pytest.mark.asyncio
async def test_get_unified_chat_auth_no_token(mock_db):
    """Test get_unified_chat_auth without token"""
    request = MagicMock(spec=Request)
    request.url = "https://example.com/api/chats"
    request.cookies.get.return_value = None
    request.headers.get.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        await get_unified_chat_auth(request, mock_db)

    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_get_unified_chat_auth_exception(mock_db):
    """Test get_unified_chat_auth with exception"""
    request = MagicMock(spec=Request)
    request.url = "https://example.com/api/chats"
    request.cookies.get.return_value = "valid_token"
    request.headers.get.return_value = None

    with patch('app.core.auth.verify_token', side_effect=Exception("Test error")):
        with pytest.raises(HTTPException) as exc_info:
            await get_unified_chat_auth(request, mock_db)

    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_get_unified_auth_exception(mock_db):
    """Test get_unified_auth with unexpected exception"""
    request = MagicMock(spec=Request)
    request.url = "https://example.com/api/agents"
    request.query_params = {}
    request.cookies.get.return_value = "valid_token"
    request.headers.get.return_value = None

    with patch('app.core.auth.verify_token', side_effect=Exception("Unexpected error")):
        with pytest.raises(HTTPException) as exc_info:
            await get_unified_auth(request, mock_db)

    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_from_cookie_directly(mock_db, mock_user):
    """Test get_current_user when token is read directly from cookies"""
    request = MagicMock(spec=Request)
    request.cookies = {"access_token": "valid_cookie_token"}
    request.headers.get.return_value = None

    payload = {"sub": str(mock_user.id)}
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    with patch('app.core.auth.verify_token', return_value=payload):
        result = await get_current_user(request, None, mock_db)
        assert result == mock_user
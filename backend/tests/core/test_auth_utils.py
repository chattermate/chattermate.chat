"""
ChatterMate - Test Auth Utils
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
from app.core.auth_utils import refresh_access_token, authenticate_socket, authenticate_socket_conversation_token
from app.models.user import User
from app.models.widget import Widget
from uuid import uuid4
import http.cookies
from datetime import datetime, timezone
from app.core.security import verify_token, verify_conversation_token, create_access_token, create_conversation_token

@pytest.fixture
def mock_db():
    """Create a mock database session"""
    db = MagicMock()
    return db

@pytest.fixture
def mock_user():
    """Create a mock user"""
    user_id = uuid4()
    org_id = uuid4()
    return User(
        id=user_id,
        email="test@example.com",
        hashed_password="hashed_password",
        is_active=True,
        organization_id=org_id,
        full_name="Test User"
    )

@pytest.fixture
def mock_widget():
    """Create a mock widget"""
    widget_id = uuid4()
    org_id = uuid4()
    return Widget(
        id=str(widget_id),
        organization_id=org_id,
        name="Test Widget"
    )

@pytest.mark.asyncio
async def test_refresh_access_token_success(mock_db, mock_user):
    """Test successful access token refresh"""
    # Setup
    refresh_token = "valid_refresh_token"
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user
    
    with patch('app.core.auth_utils.verify_token') as mock_verify, \
         patch('app.core.auth_utils.create_access_token') as mock_create:
        # Configure mocks
        mock_verify.return_value = {
            "type": "refresh",
            "sub": str(mock_user.id),
            "org": str(mock_user.organization_id)
        }
        mock_create.return_value = "new_access_token"
        
        # Execute
        result = await refresh_access_token(refresh_token, mock_db)
        
        # Assert
        assert result == "new_access_token"
        mock_verify.assert_called_once_with(refresh_token)
        mock_create.assert_called_once_with({
            "sub": str(mock_user.id),
            "org": str(mock_user.organization_id)
        })

@pytest.mark.asyncio
async def test_refresh_access_token_invalid_token(mock_db):
    """Test access token refresh with invalid token"""
    refresh_token = "invalid_token"
    
    with patch('app.core.auth_utils.verify_token') as mock_verify:
        mock_verify.return_value = None
        result = await refresh_access_token(refresh_token, mock_db)
        assert result is None

@pytest.mark.asyncio
async def test_refresh_access_token_inactive_user(mock_db, mock_user):
    """Test access token refresh with inactive user"""
    refresh_token = "valid_refresh_token"
    mock_user.is_active = False
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user
    
    with patch('app.core.auth_utils.verify_token') as mock_verify:
        mock_verify.return_value = {
            "type": "refresh",
            "sub": str(mock_user.id),
            "org": str(mock_user.organization_id)
        }
        result = await refresh_access_token(refresh_token, mock_db)
        assert result is None

@pytest.mark.asyncio
async def test_authenticate_socket_success(mock_db):
    """Test successful socket authentication"""
    # Setup
    sid = "test_sid"
    access_token = "valid_access_token"
    user_id = str(uuid4())
    org_id = str(uuid4())
    
    # Create mock environ with cookies
    cookies = http.cookies.SimpleCookie()
    cookies['access_token'] = access_token
    environ = {'HTTP_COOKIE': cookies.output(header='', sep=';')}
    
    with patch('app.core.auth_utils.verify_token') as mock_verify:
        mock_verify.return_value = {
            "sub": user_id,
            "org": org_id
        }
        
        # Execute
        result_token, result_user_id, result_org_id = await authenticate_socket(sid, environ)
        
        # Assert
        assert result_token == access_token
        assert result_user_id == user_id
        assert result_org_id == org_id

@pytest.mark.asyncio
async def test_authenticate_socket_with_refresh(mock_db, mock_user):
    """Test socket authentication with token refresh"""
    # Setup
    sid = "test_sid"
    refresh_token = "valid_refresh_token"
    new_access_token = "new_access_token"
    
    # Create mock environ with cookies
    cookies = http.cookies.SimpleCookie()
    cookies['refresh_token'] = refresh_token
    environ = {'HTTP_COOKIE': cookies.output(header='', sep=';')}
    
    with patch('app.core.auth_utils.verify_token') as mock_verify, \
         patch('app.core.auth_utils.refresh_access_token') as mock_refresh, \
         patch('app.core.socketio.sio.emit') as mock_emit:
        mock_refresh.return_value = new_access_token
        mock_verify.return_value = {
            "sub": str(mock_user.id),
            "org": str(mock_user.organization_id)
        }
        
        # Execute
        result_token, result_user_id, result_org_id = await authenticate_socket(sid, environ)
        
        # Assert
        assert result_token == new_access_token
        assert result_user_id == str(mock_user.id)
        assert result_org_id == str(mock_user.organization_id)
        mock_emit.assert_called_once_with('cookie_set', {
            'access_token': new_access_token
        }, to=sid)

@pytest.mark.asyncio
async def test_authenticate_socket_conversation_token_success(mock_db, mock_widget):
    """Test successful widget socket authentication"""
    # Setup
    sid = "test_sid"
    conversation_token = "valid_conversation_token"
    customer_id = str(uuid4())
    
    # Create auth data
    auth = {'conversation_token': conversation_token}
    
    mock_db.query.return_value.filter.return_value.first.return_value = mock_widget
    
    with patch('app.core.auth_utils.verify_conversation_token') as mock_verify, \
         patch('app.core.auth_utils.get_db') as mock_get_db:
        mock_verify.return_value = {
            "widget_id": str(mock_widget.id),
            "sub": customer_id,
            "type": "conversation"
        }
        mock_get_db.return_value.__next__.return_value = mock_db
        
        # Execute
        result_widget_id, result_org_id, result_customer_id, result_token = await authenticate_socket_conversation_token(sid, auth)
        
        # Assert
        assert result_widget_id == str(mock_widget.id)
        assert result_org_id == mock_widget.organization_id
        assert result_customer_id == customer_id
        assert result_token == conversation_token

@pytest.mark.asyncio
async def test_authenticate_socket_conversation_token_invalid(mock_db):
    """Test widget socket authentication with invalid token"""
    # Setup
    sid = "test_sid"
    conversation_token = "invalid_token"
    
    # Create auth data
    auth = {'conversation_token': conversation_token}
    
    with patch('app.core.auth_utils.verify_conversation_token') as mock_verify:
        mock_verify.return_value = None
        
        # Execute
        result = await authenticate_socket_conversation_token(sid, auth)
        
        # Assert
        assert result == (None, None, None, None)

@pytest.mark.asyncio
async def test_authenticate_socket_conversation_token_missing_widget(mock_db):
    """Test widget socket authentication with missing widget"""
    # Setup
    sid = "test_sid"
    conversation_token = "valid_conversation_token"
    customer_id = str(uuid4())
    widget_id = str(uuid4())
    
    # Create auth data
    auth = {'conversation_token': conversation_token}
    
    mock_db.query.return_value.filter.return_value.first.return_value = None
    
    with patch('app.core.auth_utils.verify_conversation_token') as mock_verify, \
         patch('app.core.auth_utils.get_db') as mock_get_db:
        mock_verify.return_value = {
            "widget_id": widget_id,
            "sub": customer_id,
            "type": "conversation"
        }
        mock_get_db.return_value.__next__.return_value = mock_db
        
        # Execute
        result = await authenticate_socket_conversation_token(sid, auth)
        
        # Assert
        assert result == (None, None, None, None)

@pytest.mark.asyncio
async def test_authenticate_socket_conversation_token_wrong_type(mock_db, mock_widget):
    """Test widget socket authentication with wrong token type"""
    # Setup
    sid = "test_sid"
    conversation_token = "wrong_type_token"
    customer_id = str(uuid4())
    
    # Create auth data
    auth = {'conversation_token': conversation_token}
    
    mock_db.query.return_value.filter.return_value.first.return_value = mock_widget
    
    with patch('app.core.auth_utils.verify_conversation_token') as mock_verify, \
         patch('app.core.auth_utils.get_db') as mock_get_db:
        mock_verify.return_value = {
            "widget_id": str(mock_widget.id),
            "sub": customer_id,
            "type": "access"  # Wrong token type
        }
        mock_get_db.return_value.__next__.return_value = mock_db
        
        # Execute
        result = await authenticate_socket_conversation_token(sid, auth)
        
        # Assert
        assert result == (None, None, None, None)

@pytest.mark.asyncio
async def test_authenticate_socket_no_cookies(mock_db):
    """Test socket authentication with no cookies"""
    # Setup
    sid = "test_sid"
    environ = {}
    
    # Execute
    result_token, result_user_id, result_org_id = await authenticate_socket(sid, environ)
    
    # Assert
    assert result_token is None
    assert result_user_id is None
    assert result_org_id is None

@pytest.mark.asyncio
async def test_authenticate_socket_invalid_token_format(mock_db):
    """Test socket authentication with invalid token format"""
    # Setup
    sid = "test_sid"
    access_token = "invalid_format_token"
    
    # Create mock environ with cookies
    cookies = http.cookies.SimpleCookie()
    cookies['access_token'] = access_token
    environ = {'HTTP_COOKIE': cookies.output(header='', sep=';')}
    
    with patch('app.core.auth_utils.verify_token') as mock_verify:
        mock_verify.side_effect = Exception("Invalid token format")
        
        # Execute
        result_token, result_user_id, result_org_id = await authenticate_socket(sid, environ)
        
        # Assert
        assert result_token is None
        assert result_user_id is None
        assert result_org_id is None 
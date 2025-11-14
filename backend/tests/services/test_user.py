"""
ChatterMate - User Service Tests
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
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from uuid import uuid4

from app.services.user import send_fcm_notification
from app.models.user import User
from app.models.notification import Notification, NotificationType


@pytest.fixture
def mock_db():
    """Create a mock database session"""
    return Mock()


@pytest.fixture
def sample_user():
    """Create a sample user with FCM token"""
    user = Mock(spec=User)
    user.id = uuid4()
    user.email = "test@example.com"
    user.full_name = "Test User"
    user.fcm_token_web = "test_fcm_token_123"
    return user


@pytest.fixture
def sample_user_no_token():
    """Create a sample user without FCM token"""
    user = Mock(spec=User)
    user.id = uuid4()
    user.email = "test@example.com"
    user.full_name = "Test User"
    user.fcm_token_web = None
    return user


@pytest.fixture
def sample_notification():
    """Create a sample notification"""
    notification = Mock(spec=Notification)
    notification.id = 1
    notification.type = NotificationType.KNOWLEDGE_PROCESSED
    notification.title = "Test Notification"
    notification.message = "This is a test notification"
    notification.notification_metadata = {"key": "value"}
    return notification


@pytest.mark.asyncio
async def test_send_fcm_notification_success(mock_db, sample_user, sample_notification):
    """Test successful FCM notification sending"""
    # Setup mock database query
    mock_query = Mock()
    mock_query.filter.return_value.first.return_value = sample_user
    mock_db.query.return_value = mock_query
    
    # Mock Firebase messaging
    with patch('app.services.user.messaging') as mock_messaging:
        mock_messaging.Message = Mock()
        mock_messaging.Notification = Mock()
        mock_messaging.send.return_value = "message_id_123"
        
        # Call the function
        await send_fcm_notification(str(sample_user.id), sample_notification, mock_db)
        
        # Verify database query was called correctly
        mock_db.query.assert_called_once_with(User)
        mock_query.filter.assert_called_once()
        mock_query.filter.return_value.first.assert_called_once()
        
        # Verify Firebase message was created correctly
        mock_messaging.Message.assert_called_once()
        mock_messaging.Notification.assert_called_once_with(
            title=sample_notification.title,
            body=sample_notification.message,
        )
        
        # Verify message was sent
        mock_messaging.send.assert_called_once()


@pytest.mark.asyncio
async def test_send_fcm_notification_user_not_found(mock_db, sample_notification):
    """Test FCM notification when user doesn't exist"""
    # Setup mock database query to return None
    mock_query = Mock()
    mock_query.filter.return_value.first.return_value = None
    mock_db.query.return_value = mock_query
    
    # Mock Firebase messaging
    with patch('app.services.user.messaging') as mock_messaging:
        # Call the function
        await send_fcm_notification("non_existent_user_id", sample_notification, mock_db)
        
        # Verify database query was called
        mock_db.query.assert_called_once_with(User)
        
        # Verify Firebase messaging was not called since user doesn't exist
        mock_messaging.Message.assert_not_called()
        mock_messaging.send.assert_not_called()


@pytest.mark.asyncio
async def test_send_fcm_notification_no_fcm_token(mock_db, sample_user_no_token, sample_notification):
    """Test FCM notification when user has no FCM token"""
    # Setup mock database query
    mock_query = Mock()
    mock_query.filter.return_value.first.return_value = sample_user_no_token
    mock_db.query.return_value = mock_query
    
    # Mock Firebase messaging
    with patch('app.services.user.messaging') as mock_messaging:
        # Call the function
        await send_fcm_notification(str(sample_user_no_token.id), sample_notification, mock_db)
        
        # Verify database query was called
        mock_db.query.assert_called_once_with(User)
        
        # Verify Firebase messaging was not called since user has no FCM token
        mock_messaging.Message.assert_not_called()
        mock_messaging.send.assert_not_called()


@pytest.mark.asyncio
async def test_send_fcm_notification_firebase_exception(mock_db, sample_user, sample_notification):
    """Test FCM notification error handling when Firebase throws an exception"""
    # Setup mock database query
    mock_query = Mock()
    mock_query.filter.return_value.first.return_value = sample_user
    mock_db.query.return_value = mock_query
    
    # Mock Firebase messaging to raise an exception
    with patch('app.services.user.messaging') as mock_messaging:
        mock_messaging.Message = Mock()
        mock_messaging.Notification = Mock()
        mock_messaging.send.side_effect = Exception("Firebase error")
        
        # Mock logger to verify error logging
        with patch('app.services.user.logger') as mock_logger:
            # Call the function
            await send_fcm_notification(str(sample_user.id), sample_notification, mock_db)
            
            # Verify error was logged
            mock_logger.error.assert_called_once()
            assert "Failed to send FCM notification" in str(mock_logger.error.call_args)


@pytest.mark.asyncio
async def test_send_fcm_notification_message_structure(mock_db, sample_user, sample_notification):
    """Test that FCM message is structured correctly"""
    # Setup mock database query
    mock_query = Mock()
    mock_query.filter.return_value.first.return_value = sample_user
    mock_db.query.return_value = mock_query
    
    # Mock Firebase messaging
    with patch('app.services.user.messaging') as mock_messaging:
        mock_message_instance = Mock()
        mock_messaging.Message.return_value = mock_message_instance
        mock_messaging.send.return_value = "message_id_123"
        
        # Call the function
        await send_fcm_notification(str(sample_user.id), sample_notification, mock_db)
        
        # Verify message was created with correct parameters
        mock_messaging.Message.assert_called_once_with(
            notification=mock_messaging.Notification.return_value,
            data={
                'type': sample_notification.type,
                'notification_id': str(sample_notification.id),
                'metadata': str(sample_notification.notification_metadata)
            },
            token=sample_user.fcm_token_web,
        )


@pytest.mark.asyncio
async def test_send_fcm_notification_with_none_metadata(mock_db, sample_user):
    """Test FCM notification when notification metadata is None"""
    # Create notification with None metadata
    notification = Mock(spec=Notification)
    notification.id = 1
    notification.type = NotificationType.SYSTEM
    notification.title = "Test Notification"
    notification.message = "This is a test notification"
    notification.notification_metadata = None
    
    # Setup mock database query
    mock_query = Mock()
    mock_query.filter.return_value.first.return_value = sample_user
    mock_db.query.return_value = mock_query
    
    # Mock Firebase messaging
    with patch('app.services.user.messaging') as mock_messaging:
        mock_messaging.Message = Mock()
        mock_messaging.Notification = Mock()
        mock_messaging.send.return_value = "message_id_123"
        
        # Call the function
        await send_fcm_notification(str(sample_user.id), notification, mock_db)
        
        # Verify message was created with correct data (metadata should be '{}')
        call_args = mock_messaging.Message.call_args
        assert call_args[1]['data']['metadata'] == str({})


@pytest.mark.asyncio
async def test_send_fcm_notification_different_notification_types(mock_db, sample_user):
    """Test FCM notification with different notification types"""
    notification_types = [
        NotificationType.KNOWLEDGE_PROCESSED,
        NotificationType.KNOWLEDGE_FAILED,
        NotificationType.SYSTEM,
        NotificationType.CHAT
    ]
    
    # Setup mock database query
    mock_query = Mock()
    mock_query.filter.return_value.first.return_value = sample_user
    mock_db.query.return_value = mock_query
    
    for notification_type in notification_types:
        # Create notification with specific type
        notification = Mock(spec=Notification)
        notification.id = 1
        notification.type = notification_type
        notification.title = f"Test {notification_type.value}"
        notification.message = f"This is a {notification_type.value} notification"
        notification.notification_metadata = {"type": notification_type.value}
        
        # Mock Firebase messaging
        with patch('app.services.user.messaging') as mock_messaging:
            mock_messaging.Message = Mock()
            mock_messaging.Notification = Mock()
            mock_messaging.send.return_value = "message_id_123"
            
            # Call the function
            await send_fcm_notification(str(sample_user.id), notification, mock_db)
            
            # Verify message was created with correct type
            call_args = mock_messaging.Message.call_args
            assert call_args[1]['data']['type'] == notification_type


@pytest.mark.asyncio
async def test_send_fcm_notification_database_exception(sample_notification):
    """Test FCM notification when database query throws an exception"""
    # Create mock database that raises an exception
    mock_db = Mock()
    mock_db.query.side_effect = Exception("Database connection error")
    
    # Mock logger to verify error logging
    with patch('app.services.user.logger') as mock_logger:
        # Call the function
        await send_fcm_notification("test_user_id", sample_notification, mock_db)
        
        # Verify error was logged
        mock_logger.error.assert_called_once()
        assert "Failed to send FCM notification" in str(mock_logger.error.call_args)


@pytest.mark.asyncio
async def test_send_fcm_notification_success_logging(mock_db, sample_user, sample_notification):
    """Test that successful FCM notification sending is logged"""
    # Setup mock database query
    mock_query = Mock()
    mock_query.filter.return_value.first.return_value = sample_user
    mock_db.query.return_value = mock_query
    
    # Mock Firebase messaging
    with patch('app.services.user.messaging') as mock_messaging:
        mock_messaging.Message = Mock()
        mock_messaging.Notification = Mock()
        mock_messaging.send.return_value = "message_id_123"
        
        # Mock logger to verify success logging
        with patch('app.services.user.logger') as mock_logger:
            # Call the function
            await send_fcm_notification(str(sample_user.id), sample_notification, mock_db)
            
            # Verify success was logged
            mock_logger.info.assert_called_once()
            assert "Successfully sent FCM notification" in str(mock_logger.info.call_args)
            assert "message_id_123" in str(mock_logger.info.call_args)

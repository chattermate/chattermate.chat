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
from unittest.mock import patch, MagicMock, call, create_autospec
from app.services.firebase import initialize_firebase, send_firebase_notification
from firebase_admin import messaging, credentials
from app.models.notification import Notification
from uuid import uuid4
import json
import os
from firebase_admin.exceptions import FirebaseError

@pytest.fixture
def mock_db():
    """Create a mock database session"""
    db = MagicMock()
    return db

@pytest.fixture
def mock_notification():
    """Create a mock notification"""
    user_id = uuid4()
    return Notification(
        id=uuid4(),
        user_id=user_id,
        title="Test Notification",
        message="This is a test notification",
        type="test",
        metadata={"key": "value"}
    )

@pytest.fixture
def mock_user_repo():
    """Create a mock user repository"""
    repo = MagicMock()
    repo.get_user_fcm_token.return_value = "test_fcm_token"
    return repo

@pytest.fixture(autouse=True)
def mock_logger():
    """Mock logger for all tests"""
    with patch('app.services.firebase.logger') as mock_log:
        yield mock_log

@pytest.fixture
def mock_credential():
    """Create a mock Firebase credential"""
    mock_cred = MagicMock(spec=credentials.Base)
    return mock_cred

def test_initialize_firebase_success(mock_logger, mock_credential):
    """Test successful Firebase initialization"""
    with patch('app.services.firebase.credentials.Certificate', return_value=mock_credential) as mock_cert, \
         patch('app.services.firebase.initialize_app') as mock_init, \
         patch('firebase_admin._apps', new={}), \
         patch('app.services.firebase.get_app', side_effect=[ValueError(), None]), \
         patch('os.path.isfile', return_value=True), \
         patch('app.core.config.settings.FIREBASE_CREDENTIALS', 'path/to/creds.json'):
        
        # Execute
        initialize_firebase()
        
        # Assert
        mock_cert.assert_called_once()
        mock_init.assert_called_once_with(mock_credential)
        mock_logger.info.assert_has_calls([
            call("Initializing Firebase..."),
            call("Loading Firebase credentials from file path/to/creds.json"),
            call("Firebase initialized successfully")
        ])

def test_initialize_firebase_development_mode(mock_logger, mock_credential):
    """Test Firebase initialization in development mode when credentials file is missing"""
    with patch('app.services.firebase.credentials.Certificate', return_value=mock_credential) as mock_cert, \
         patch('app.services.firebase.initialize_app') as mock_init, \
         patch('firebase_admin._apps', new={}), \
         patch('app.services.firebase.get_app', side_effect=[ValueError(), None]), \
         patch('os.path.isfile', return_value=False), \
         patch('app.core.config.settings.FIREBASE_CREDENTIALS', 'nonexistent/path.json'):
        
        # Execute
        initialize_firebase()
        
        # Assert
        mock_cert.assert_called_once()
        cert_args = mock_cert.call_args[0][0]
        assert cert_args['project_id'] == 'demo-project'
        assert cert_args['type'] == 'service_account'
        mock_init.assert_called_once_with(mock_credential)
        mock_logger.warning.assert_called_once_with(
            "Firebase credentials not found at nonexistent/path.json. Running in development mode."
        )

def test_initialize_firebase_already_initialized(mock_logger):
    """Test Firebase initialization when already initialized"""
    with patch('firebase_admin._apps', new={'[DEFAULT]': MagicMock()}), \
         patch('app.services.firebase.get_app', return_value=MagicMock()):
        # Execute
        initialize_firebase()
        # Assert
        mock_logger.info.assert_called_once_with("Firebase already initialized")

def test_initialize_firebase_failure(mock_logger):
    """Test Firebase initialization failure"""
    with patch('app.services.firebase.credentials.Certificate') as mock_cert, \
         patch('firebase_admin._apps', new={}), \
         patch('app.services.firebase.get_app', side_effect=ValueError()):
        
        # Configure mock to raise exception
        error_msg = "Failed to initialize"
        mock_cert.side_effect = Exception(error_msg)
        
        # Execute - function should handle exception gracefully, not raise it
        initialize_firebase()
        
        # Assert that error was logged but function continued without raising
        mock_logger.error.assert_called_with(f"Error initializing Firebase: {error_msg}")
        mock_logger.warning.assert_called_with("Continuing without Firebase initialization")

@pytest.mark.asyncio
async def test_send_firebase_notification_success(mock_db, mock_notification, mock_user_repo, mock_logger):
    """Test successful sending of Firebase notification"""
    with patch('app.services.firebase.UserRepository') as mock_user_repo_class, \
         patch('firebase_admin.messaging.send') as mock_send:
        
        # Configure mocks
        mock_user_repo_class.return_value = mock_user_repo
        mock_send.return_value = "message_id"
        
        # Execute
        await send_firebase_notification(mock_notification, mock_db)
        
        # Assert
        mock_user_repo.get_user_fcm_token.assert_called_once_with(mock_notification.user_id)
        mock_send.assert_called_once()
        mock_logger.info.assert_called_once_with(
            f"Successfully sent notification {mock_notification.id} to user {mock_notification.user_id}: message_id"
        )
        
        # Verify the message structure
        call_args = mock_send.call_args[0][0]
        assert isinstance(call_args, messaging.Message)
        assert call_args.token == "test_fcm_token"
        assert call_args.notification.title == mock_notification.title
        assert call_args.notification.body == mock_notification.message
        assert call_args.data["type"] == mock_notification.type
        assert call_args.data["id"] == str(mock_notification.id)
        assert json.loads(call_args.data["metadata"]) == mock_notification.metadata

@pytest.mark.asyncio
async def test_send_firebase_notification_no_token(mock_db, mock_notification, mock_user_repo, mock_logger):
    """Test sending Firebase notification when user has no FCM token"""
    with patch('app.services.firebase.UserRepository') as mock_user_repo_class, \
         patch('firebase_admin.messaging.send') as mock_send:
        
        # Configure mock to return no token
        mock_user_repo.get_user_fcm_token.return_value = None
        mock_user_repo_class.return_value = mock_user_repo
        
        # Execute
        await send_firebase_notification(mock_notification, mock_db)
        
        # Assert
        mock_user_repo.get_user_fcm_token.assert_called_once_with(mock_notification.user_id)
        mock_send.assert_not_called()
        mock_logger.warning.assert_called_once_with(
            f"No FCM token found for user {mock_notification.user_id}"
        )

@pytest.mark.asyncio
async def test_send_firebase_notification_failure(mock_db, mock_notification, mock_user_repo, mock_logger):
    """Test handling of Firebase notification sending failure"""
    with patch('app.services.firebase.UserRepository') as mock_user_repo_class, \
         patch('firebase_admin.messaging.send') as mock_send:

        # Configure mocks
        mock_user_repo_class.return_value = mock_user_repo
        error_msg = "Failed to send message"
        
        def raise_error(*args, **kwargs):
            raise FirebaseError(code='messaging/failed', message=error_msg)
        
        mock_send.side_effect = raise_error

        # Execute
        await send_firebase_notification(mock_notification, mock_db)

        # Assert
        mock_user_repo.get_user_fcm_token.assert_called_once_with(mock_notification.user_id)
        mock_send.assert_called_once()
        mock_logger.error.assert_called_once_with(
            f"Firebase API error while sending notification {mock_notification.id}: {error_msg}"
        ) 
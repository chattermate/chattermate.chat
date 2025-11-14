"""
ChatterMate - File Upload API Tests
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
import os
import tempfile
import io
from unittest.mock import patch, Mock, MagicMock
from fastapi.testclient import TestClient
from fastapi import FastAPI, status
from sqlalchemy.orm import Session

from app.api.file_upload import router, get_cors_headers, get_current_user_or_widget
from app.models.user import User
from app.models.organization import Organization
from app.core.config import settings
from tests.conftest import TestingSessionLocal, create_tables, engine
from app.database import Base


# Create test FastAPI app
test_app = FastAPI()
test_app.include_router(router, prefix="/api/v1/files")


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(test_app)


@pytest.fixture
def db_session():
    """Create database session for testing"""
    create_tables()
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_organization(db_session):
    """Create test organization"""
    org = Organization(
        name="Test Organization",
        domain="test.com",
        timezone="UTC"
    )
    db_session.add(org)
    db_session.commit()
    db_session.refresh(org)
    return org


@pytest.fixture
def test_user(db_session, test_organization):
    """Create test user"""
    user = User(
        email="test@example.com",
        full_name="Test User",
        hashed_password="dummy_hash",
        is_active=True,
        organization_id=test_organization.id
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def mock_request():
    """Create mock request object"""
    request = Mock()
    request.headers = {"origin": "https://example.com"}
    return request


class TestCORSHeaders:
    """Test CORS headers functionality"""
    
    def test_get_cors_headers_with_origin(self):
        """Test CORS headers with origin"""
        request = Mock()
        request.headers = {"origin": "https://example.com"}
        
        headers = get_cors_headers(request)
        
        assert headers["Access-Control-Allow-Origin"] == "https://example.com"
        assert headers["Access-Control-Allow-Credentials"] == "true"
        assert headers["Access-Control-Allow-Methods"] == "GET, POST, PUT, DELETE, OPTIONS"
        assert headers["Access-Control-Allow-Headers"] == "Content-Type, Authorization, X-Conversation-Token"
        assert headers["Access-Control-Max-Age"] == "3600"
    
    def test_get_cors_headers_without_origin(self):
        """Test CORS headers without origin"""
        request = Mock()
        request.headers = {}
        
        headers = get_cors_headers(request)
        
        assert headers["Access-Control-Allow-Origin"] == "*"


class TestGetCurrentUserOrWidget:
    """Test authentication helper function"""
    
    @pytest.mark.asyncio
    async def test_get_current_user_success(self, db_session, test_user):
        """Test successful user authentication"""
        request = Mock()
        
        with patch('app.api.file_upload.get_current_user') as mock_get_user:
            mock_get_user.return_value = test_user
            
            result = await get_current_user_or_widget(request, db_session)
            
            assert result["type"] == "user"
            assert result["user_id"] == str(test_user.id)
            assert result["org_id"] == str(test_user.organization_id)
    
    @pytest.mark.asyncio
    async def test_get_current_user_widget_token(self, db_session):
        """Test widget authentication with conversation token"""
        request = Mock()
        
        with patch('app.api.file_upload.get_current_user') as mock_get_user, \
             patch('app.api.file_upload.verify_conversation_token') as mock_verify_token:
            
            # Mock user auth failure
            from fastapi import HTTPException
            mock_get_user.side_effect = HTTPException(status_code=401)
            
            # Mock successful token verification
            mock_verify_token.return_value = {
                "widget_id": "widget_123",
                "org_id": "org_456",
                "customer_id": "customer_789"
            }
            
            result = await get_current_user_or_widget(
                request, db_session, x_conversation_token="valid_token"
            )
            
            assert result["type"] == "widget"
            assert result["widget_id"] == "widget_123"
            assert result["org_id"] == "org_456"
            assert result["customer_id"] == "customer_789"
    
    @pytest.mark.asyncio
    async def test_get_current_user_no_auth(self, db_session):
        """Test authentication failure"""
        request = Mock()
        
        with patch('app.api.file_upload.get_current_user') as mock_get_user:
            from fastapi import HTTPException
            mock_get_user.side_effect = HTTPException(status_code=401)
            
            with pytest.raises(HTTPException) as exc_info:
                await get_current_user_or_widget(request, db_session)
            
            assert exc_info.value.status_code == 401
            assert "Authentication required" in str(exc_info.value.detail)


class TestDownloadFileLocal:
    """Test file download from local storage"""
    
    def test_download_file_local_success(self, client):
        """Test successful file download from local storage"""
        # Create a temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as temp_file:
            temp_file.write("Test file content")
            temp_file_path = temp_file.name
        
        try:
            # Mock settings to use local storage
            with patch.object(settings, 'S3_FILE_STORAGE', False), \
                 patch('app.api.file_upload.get_current_user_or_widget') as mock_auth, \
                 patch('os.path.exists') as mock_exists, \
                 patch('builtins.open', create=True) as mock_open:
                
                mock_auth.return_value = {"type": "user", "user_id": "123"}
                mock_exists.return_value = True
                mock_open.return_value.__enter__.return_value.read.return_value = b"Test file content"
                
                response = client.get("/api/v1/files/download/test/file.txt")
                
                assert response.status_code == 200
                assert response.headers["content-type"] == "text/plain; charset=utf-8"
        finally:
            # Clean up
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    def test_download_file_local_not_found(self, client):
        """Test file download when local file doesn't exist"""
        with patch.object(settings, 'S3_FILE_STORAGE', False), \
             patch('app.api.file_upload.get_current_user_or_widget') as mock_auth, \
             patch('os.path.exists') as mock_exists:
            
            mock_auth.return_value = {"type": "user", "user_id": "123"}
            mock_exists.return_value = False
            
            response = client.get("/api/v1/files/download/nonexistent/file.txt")
            
            assert response.status_code == 404
            assert "File not found" in response.json()["detail"]
    
    def test_download_file_local_without_auth(self, client):
        """Test file download without authentication (should still work)"""
        with patch.object(settings, 'S3_FILE_STORAGE', False), \
             patch('app.api.file_upload.get_current_user_or_widget') as mock_auth, \
             patch('os.path.exists') as mock_exists, \
             patch('builtins.open', create=True) as mock_open:
            
            # Mock auth failure but file should still be served
            from fastapi import HTTPException
            mock_auth.side_effect = HTTPException(status_code=401)
            mock_exists.return_value = True
            mock_open.return_value.__enter__.return_value.read.return_value = b"Test file content"
            
            response = client.get("/api/v1/files/download/test/file.txt")
            
            assert response.status_code == 200


class TestDownloadFileS3:
    """Test file download from S3 storage"""
    
    def test_download_file_s3_success(self, client):
        """Test successful file download from S3"""
        with patch.object(settings, 'S3_FILE_STORAGE', True), \
             patch.object(settings, 'S3_BUCKET', 'test-bucket'), \
             patch('app.api.file_upload.get_current_user_or_widget') as mock_auth, \
             patch('app.core.s3.get_s3_client') as mock_s3_client:
            
            mock_auth.return_value = {"type": "user", "user_id": "123"}
            
            # Mock S3 client
            mock_client = Mock()
            mock_s3_client.return_value = mock_client
            
            # Mock successful head_object (file exists)
            mock_client.head_object.return_value = {}
            
            # Mock successful get_object
            mock_response = {
                'Body': Mock(),
                'ContentType': 'text/plain'
            }
            mock_response['Body'].read.side_effect = [b"Test content", b""]  # First chunk, then empty
            mock_client.get_object.return_value = mock_response
            
            response = client.get("/api/v1/files/download/test/file.txt")
            
            assert response.status_code == 200
            mock_client.head_object.assert_called_once_with(Bucket='test-bucket', Key='test/file.txt')
            mock_client.get_object.assert_called_once_with(Bucket='test-bucket', Key='test/file.txt')
    
    def test_download_file_s3_not_found(self, client):
        """Test S3 file download when file doesn't exist"""
        with patch.object(settings, 'S3_FILE_STORAGE', True), \
             patch.object(settings, 'S3_BUCKET', 'test-bucket'), \
             patch('app.api.file_upload.get_current_user_or_widget') as mock_auth, \
             patch('app.core.s3.get_s3_client') as mock_s3_client:
            
            mock_auth.return_value = {"type": "user", "user_id": "123"}
            
            # Mock S3 client
            mock_client = Mock()
            mock_s3_client.return_value = mock_client
            
            # Mock NoSuchKey exception
            from botocore.exceptions import ClientError
            no_such_key_error = ClientError(
                error_response={'Error': {'Code': 'NoSuchKey'}},
                operation_name='HeadObject'
            )
            mock_client.exceptions = Mock()
            mock_client.exceptions.NoSuchKey = ClientError
            mock_client.head_object.side_effect = no_such_key_error
            
            response = client.get("/api/v1/files/download/nonexistent/file.txt")
            
            assert response.status_code == 404
            assert "File not found" in response.json()["detail"]
    
    def test_download_file_s3_client_error(self, client):
        """Test S3 file download with client creation error"""
        with patch.object(settings, 'S3_FILE_STORAGE', True), \
             patch('app.api.file_upload.get_current_user_or_widget') as mock_auth, \
             patch('app.core.s3.get_s3_client') as mock_s3_client:
            
            mock_auth.return_value = {"type": "user", "user_id": "123"}
            mock_s3_client.side_effect = Exception("S3 client creation failed")
            
            response = client.get("/api/v1/files/download/test/file.txt")
            
            assert response.status_code == 500
            assert "Failed to create S3 client" in response.json()["detail"]
    
    def test_download_file_s3_get_object_error(self, client):
        """Test S3 file download with get_object error"""
        with patch.object(settings, 'S3_FILE_STORAGE', True), \
             patch.object(settings, 'S3_BUCKET', 'test-bucket'), \
             patch('app.api.file_upload.get_current_user_or_widget') as mock_auth, \
             patch('app.core.s3.get_s3_client') as mock_s3_client:
            
            mock_auth.return_value = {"type": "user", "user_id": "123"}
            
            # Mock S3 client
            mock_client = Mock()
            mock_s3_client.return_value = mock_client
            
            # Mock successful head_object but failed get_object
            mock_client.head_object.return_value = {}
            
            # Mock exceptions properly
            from botocore.exceptions import ClientError
            mock_client.exceptions = Mock()
            mock_client.exceptions.NoSuchKey = ClientError
            mock_client.get_object.side_effect = Exception("S3 get_object failed")
            
            response = client.get("/api/v1/files/download/test/file.txt")
            
            assert response.status_code == 500
            assert "Failed to retrieve file from S3" in response.json()["detail"]


class TestDownloadFilePathHandling:
    """Test file path handling in download endpoint"""
    
    def test_download_file_path_with_uploads_prefix(self, client):
        """Test file path handling with /uploads/ prefix"""
        with patch.object(settings, 'S3_FILE_STORAGE', True), \
             patch.object(settings, 'S3_BUCKET', 'test-bucket'), \
             patch('app.api.file_upload.get_current_user_or_widget') as mock_auth, \
             patch('app.core.s3.get_s3_client') as mock_s3_client:
            
            mock_auth.return_value = {"type": "user", "user_id": "123"}
            
            # Mock S3 client
            mock_client = Mock()
            mock_s3_client.return_value = mock_client
            mock_client.head_object.return_value = {}
            
            # Mock successful get_object
            mock_response = {
                'Body': Mock(),
                'ContentType': 'image/jpeg'
            }
            mock_response['Body'].read.side_effect = [b"image data", b""]
            mock_client.get_object.return_value = mock_response
            
            response = client.get("/api/v1/files/download//uploads/chat_attachments/org-id/image.jpg")
            
            assert response.status_code == 200
            # Path is "/uploads/chat_attachments/org-id/image.jpg", should remove "/uploads/" prefix
            mock_client.head_object.assert_called_once_with(
                Bucket='test-bucket', 
                Key='chat_attachments/org-id/image.jpg'
            )
    
    def test_download_file_path_without_uploads_prefix(self, client):
        """Test file path handling without /uploads/ prefix"""
        with patch.object(settings, 'S3_FILE_STORAGE', True), \
             patch.object(settings, 'S3_BUCKET', 'test-bucket'), \
             patch('app.api.file_upload.get_current_user_or_widget') as mock_auth, \
             patch('app.core.s3.get_s3_client') as mock_s3_client:
            
            mock_auth.return_value = {"type": "user", "user_id": "123"}
            
            # Mock S3 client
            mock_client = Mock()
            mock_s3_client.return_value = mock_client
            mock_client.head_object.return_value = {}
            
            # Mock successful get_object
            mock_response = {
                'Body': Mock(),
                'ContentType': 'application/pdf'
            }
            mock_response['Body'].read.side_effect = [b"pdf data", b""]
            mock_client.get_object.return_value = mock_response
            
            response = client.get("/api/v1/files/download/chat_attachments/org-id/document.pdf")
            
            assert response.status_code == 200
            # Should use path as-is for S3 key
            mock_client.head_object.assert_called_once_with(
                Bucket='test-bucket', 
                Key='chat_attachments/org-id/document.pdf'
            )


class TestDownloadFileAuthentication:
    """Test authentication scenarios for file download"""
    
    def test_download_file_with_jwt_auth(self, client):
        """Test file download with JWT authentication"""
        with patch.object(settings, 'S3_FILE_STORAGE', False), \
             patch('app.api.file_upload.get_current_user_or_widget') as mock_auth, \
             patch('os.path.exists') as mock_exists, \
             patch('builtins.open', create=True) as mock_open:
            
            mock_auth.return_value = {
                "type": "user", 
                "user_id": "123",
                "org_id": "org_456"
            }
            mock_exists.return_value = True
            mock_open.return_value.__enter__.return_value.read.return_value = b"Test content"
            
            headers = {"Authorization": "Bearer valid_jwt_token"}
            response = client.get("/api/v1/files/download/test/file.txt", headers=headers)
            
            assert response.status_code == 200
    
    def test_download_file_with_conversation_token(self, client):
        """Test file download with conversation token"""
        with patch.object(settings, 'S3_FILE_STORAGE', False), \
             patch('app.api.file_upload.get_current_user_or_widget') as mock_auth, \
             patch('os.path.exists') as mock_exists, \
             patch('builtins.open', create=True) as mock_open:
            
            mock_auth.return_value = {
                "type": "widget",
                "widget_id": "widget_123",
                "org_id": "org_456",
                "customer_id": "customer_789"
            }
            mock_exists.return_value = True
            mock_open.return_value.__enter__.return_value.read.return_value = b"Test content"
            
            headers = {"X-Conversation-Token": "valid_conversation_token"}
            response = client.get("/api/v1/files/download/test/file.txt", headers=headers)
            
            assert response.status_code == 200


class TestDownloadFileContentTypes:
    """Test content type handling in file download"""
    
    def test_download_file_image_content_type(self, client):
        """Test image file download with correct content type"""
        with patch.object(settings, 'S3_FILE_STORAGE', False), \
             patch('app.api.file_upload.get_current_user_or_widget') as mock_auth, \
             patch('os.path.exists') as mock_exists, \
             patch('builtins.open', create=True) as mock_open, \
             patch('mimetypes.guess_type') as mock_guess_type:
            
            mock_auth.return_value = {"type": "user", "user_id": "123"}
            mock_exists.return_value = True
            mock_open.return_value.__enter__.return_value.read.return_value = b"fake image data"
            mock_guess_type.return_value = ("image/jpeg", None)
            
            response = client.get("/api/v1/files/download/test/image.jpg")
            
            assert response.status_code == 200
            assert response.headers["content-type"] == "image/jpeg"
    
    def test_download_file_unknown_content_type(self, client):
        """Test file download with unknown content type"""
        with patch.object(settings, 'S3_FILE_STORAGE', False), \
             patch('app.api.file_upload.get_current_user_or_widget') as mock_auth, \
             patch('os.path.exists') as mock_exists, \
             patch('builtins.open', create=True) as mock_open, \
             patch('mimetypes.guess_type') as mock_guess_type:
            
            mock_auth.return_value = {"type": "user", "user_id": "123"}
            mock_exists.return_value = True
            mock_open.return_value.__enter__.return_value.read.return_value = b"unknown file data"
            mock_guess_type.return_value = (None, None)
            
            response = client.get("/api/v1/files/download/test/unknown.xyz")
            
            assert response.status_code == 200
            assert response.headers["content-type"] == "application/octet-stream"


class TestDownloadFileErrorHandling:
    """Test error handling in file download"""
    
    def test_download_file_general_exception(self, client):
        """Test file download with unexpected exception"""
        with patch.object(settings, 'S3_FILE_STORAGE', False), \
             patch('os.path.exists') as mock_exists:
            
            # Mock os.path.exists to raise an exception
            mock_exists.side_effect = Exception("Unexpected error")
            
            response = client.get("/api/v1/files/download/test/file.txt")
            
            assert response.status_code == 500
            assert "Failed to download file" in response.json()["detail"]
    
    def test_download_file_s3_head_object_general_error(self, client):
        """Test S3 head_object with general error (not NoSuchKey)"""
        with patch.object(settings, 'S3_FILE_STORAGE', True), \
             patch.object(settings, 'S3_BUCKET', 'test-bucket'), \
             patch('app.api.file_upload.get_current_user_or_widget') as mock_auth, \
             patch('app.core.s3.get_s3_client') as mock_s3_client:
            
            mock_auth.return_value = {"type": "user", "user_id": "123"}
            
            # Mock S3 client
            mock_client = Mock()
            mock_s3_client.return_value = mock_client
            
            # Mock exceptions properly
            from botocore.exceptions import ClientError
            mock_client.exceptions = Mock()
            mock_client.exceptions.NoSuchKey = ClientError
            
            # Mock general exception in head_object (should continue to get_object)
            mock_client.head_object.side_effect = Exception("General S3 error")
            
            # Mock successful get_object
            mock_response = {
                'Body': Mock(),
                'ContentType': 'text/plain'
            }
            mock_response['Body'].read.side_effect = [b"Test content", b""]
            mock_client.get_object.return_value = mock_response
            
            response = client.get("/api/v1/files/download/test/file.txt")
            
            # Should still succeed because get_object works
            assert response.status_code == 200

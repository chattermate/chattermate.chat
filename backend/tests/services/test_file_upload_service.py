"""
ChatterMate - File Upload Service Tests
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
import base64
import os
import tempfile
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from uuid import uuid4

from app.services.file_upload_service import (
    FileUploadService,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_DOCUMENT_TYPES,
    ALLOWED_FILE_TYPES,
    MAX_FILE_SIZE,
    MAX_IMAGE_SIZE
)


class TestFileUploadServiceValidation:
    """Test file validation methods"""
    
    def test_validate_file_type_allowed_image(self):
        """Test validation of allowed image types"""
        for content_type in ALLOWED_IMAGE_TYPES:
            assert FileUploadService.validate_file_type(content_type) is True
    
    def test_validate_file_type_allowed_document(self):
        """Test validation of allowed document types"""
        for content_type in ALLOWED_DOCUMENT_TYPES:
            assert FileUploadService.validate_file_type(content_type) is True
    
    def test_validate_file_type_disallowed(self):
        """Test validation of disallowed file types"""
        disallowed_types = [
            'video/mp4',
            'audio/mp3',
            'application/x-executable',
            'text/html',
            'application/javascript'
        ]
        for content_type in disallowed_types:
            assert FileUploadService.validate_file_type(content_type) is False
    
    def test_validate_file_size_image_within_limit(self):
        """Test image file size validation within limits"""
        # Test image under image size limit
        image_size = MAX_IMAGE_SIZE - 1000  # 1KB under limit
        is_valid, error = FileUploadService.validate_file_size(image_size, 'image/jpeg')
        assert is_valid is True
        assert error is None
    
    def test_validate_file_size_image_exceeds_image_limit(self):
        """Test image file size validation exceeding image limit"""
        # Test image over image size limit
        image_size = MAX_IMAGE_SIZE + 1000  # 1KB over image limit
        is_valid, error = FileUploadService.validate_file_size(image_size, 'image/jpeg')
        assert is_valid is False
        assert "Image file size exceeds maximum" in error
        assert "5.0MB" in error
    
    def test_validate_file_size_document_within_limit(self):
        """Test document file size validation within limits"""
        # Test document under general size limit
        doc_size = MAX_FILE_SIZE - 1000  # 1KB under limit
        is_valid, error = FileUploadService.validate_file_size(doc_size, 'application/pdf')
        assert is_valid is True
        assert error is None
    
    def test_validate_file_size_document_exceeds_limit(self):
        """Test document file size validation exceeding limit"""
        # Test document over general size limit
        doc_size = MAX_FILE_SIZE + 1000  # 1KB over limit
        is_valid, error = FileUploadService.validate_file_size(doc_size, 'application/pdf')
        assert is_valid is False
        assert "File size exceeds maximum" in error
        assert "10.0MB" in error
    
    def test_validate_file_size_image_exceeds_general_limit(self):
        """Test image file size validation exceeding general limit"""
        # Test image over general size limit (but under image limit is irrelevant)
        image_size = MAX_FILE_SIZE + 1000  # 1KB over general limit
        is_valid, error = FileUploadService.validate_file_size(image_size, 'image/png')
        assert is_valid is False
        # The service checks image size limit first, so we get image-specific error
        assert "Image file size exceeds maximum" in error
        assert "5.0MB" in error


class TestFileUploadServiceUpload:
    """Test file upload functionality"""
    
    @pytest.fixture
    def sample_file_data(self):
        """Create sample file data for testing"""
        content = b"This is a test file content"
        encoded_content = base64.b64encode(content).decode('utf-8')
        return {
            'content': encoded_content,
            'filename': 'test_file.txt',
            'content_type': 'text/plain',
            'size': len(content)
        }
    
    @pytest.fixture
    def sample_image_data(self):
        """Create sample image data for testing"""
        # Simple fake image content
        content = b"fake_image_data_" * 100  # Small image
        encoded_content = base64.b64encode(content).decode('utf-8')
        return {
            'content': encoded_content,
            'filename': 'test_image.jpg',
            'content_type': 'image/jpeg',
            'size': len(content)
        }
    
    @pytest.fixture
    def large_file_data(self):
        """Create large file data that exceeds size limits"""
        content = b"x" * (MAX_FILE_SIZE + 1000)  # Exceeds max file size
        encoded_content = base64.b64encode(content).decode('utf-8')
        return {
            'content': encoded_content,
            'filename': 'large_file.pdf',
            'content_type': 'application/pdf',
            'size': len(content)
        }
    
    @pytest.mark.asyncio
    async def test_upload_file_s3_success(self, sample_file_data):
        """Test successful file upload to S3"""
        org_id = str(uuid4())
        user_id = str(uuid4())
        
        with patch('app.services.file_upload_service.settings') as mock_settings, \
             patch('app.services.file_upload_service.upload_file_to_s3') as mock_s3_upload, \
             patch('app.services.file_upload_service.get_s3_signed_url') as mock_signed_url, \
             patch('uuid.uuid4') as mock_uuid:
            
            # Configure mocks
            mock_settings.S3_FILE_STORAGE = True
            mock_uuid.return_value = Mock()
            mock_uuid.return_value.__str__ = Mock(return_value='test-uuid-123')
            
            mock_s3_upload.return_value = 'https://s3.amazonaws.com/bucket/chat_attachments/org123/test-uuid-123.txt'
            mock_signed_url.return_value = 'https://s3.amazonaws.com/bucket/signed-url'
            
            result = await FileUploadService.upload_file(
                file_data=sample_file_data,
                org_id=org_id,
                user_id=user_id
            )
            
            # Verify S3 upload was called
            mock_s3_upload.assert_called_once()
            call_args = mock_s3_upload.call_args
            assert call_args[1]['folder'] == f'chat_attachments/{org_id}'
            assert call_args[1]['filename'] == 'test-uuid-123.txt'
            assert call_args[1]['content_type'] == 'text/plain'
            
            # Verify signed URL was generated
            mock_signed_url.assert_called_once()
            
            # Verify result
            assert result['file_url'] == 'https://s3.amazonaws.com/bucket/chat_attachments/org123/test-uuid-123.txt'
            assert result['signed_url'] == 'https://s3.amazonaws.com/bucket/signed-url'
            assert result['filename'] == 'test_file.txt'
            assert result['content_type'] == 'text/plain'
            assert result['size'] == len(base64.b64decode(sample_file_data['content']))
    
    @pytest.mark.asyncio
    async def test_upload_file_local_success(self, sample_file_data):
        """Test successful file upload to local storage"""
        org_id = str(uuid4())
        customer_id = str(uuid4())
        
        with patch('app.services.file_upload_service.settings') as mock_settings, \
             patch('uuid.uuid4') as mock_uuid, \
             patch('os.makedirs') as mock_makedirs, \
             patch('builtins.open', create=True) as mock_open:
            
            # Configure mocks
            mock_settings.S3_FILE_STORAGE = False
            mock_uuid.return_value = Mock()
            mock_uuid.return_value.__str__ = Mock(return_value='test-uuid-456')
            
            # Mock file operations
            mock_file = MagicMock()
            mock_open.return_value.__enter__.return_value = mock_file
            
            result = await FileUploadService.upload_file(
                file_data=sample_file_data,
                org_id=org_id,
                customer_id=customer_id
            )
            
            # Verify directory creation
            mock_makedirs.assert_called_once_with(f'uploads/chat_attachments/{org_id}', exist_ok=True)
            
            # Verify file write
            mock_open.assert_called_once_with(f'uploads/chat_attachments/{org_id}/test-uuid-456.txt', 'wb')
            mock_file.write.assert_called_once()
            
            # Verify result
            assert result['file_url'] == f'/uploads/chat_attachments/{org_id}/test-uuid-456.txt'
            assert result['signed_url'] == f'/uploads/chat_attachments/{org_id}/test-uuid-456.txt'
            assert result['filename'] == 'test_file.txt'
            assert result['content_type'] == 'text/plain'
    
    @pytest.mark.asyncio
    async def test_upload_file_missing_content(self):
        """Test upload with missing content"""
        file_data = {
            'filename': 'test.txt',
            'content_type': 'text/plain'
            # Missing 'content'
        }
        
        with pytest.raises(ValueError) as exc_info:
            await FileUploadService.upload_file(
                file_data=file_data,
                org_id=str(uuid4())
            )
        
        assert "Missing required file data" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_upload_file_missing_filename(self):
        """Test upload with missing filename"""
        file_data = {
            'content': base64.b64encode(b"test content").decode('utf-8'),
            'content_type': 'text/plain'
            # Missing 'filename'
        }
        
        with pytest.raises(ValueError) as exc_info:
            await FileUploadService.upload_file(
                file_data=file_data,
                org_id=str(uuid4())
            )
        
        assert "Missing required file data" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_upload_file_invalid_type(self, sample_file_data):
        """Test upload with invalid file type"""
        # Modify to invalid type
        sample_file_data['content_type'] = 'video/mp4'
        
        with pytest.raises(ValueError) as exc_info:
            await FileUploadService.upload_file(
                file_data=sample_file_data,
                org_id=str(uuid4())
            )
        
        assert "File type video/mp4 not allowed" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_upload_file_invalid_base64(self):
        """Test upload with invalid base64 content"""
        file_data = {
            'content': 'Z',  # Invalid base64 - single character that can't be decoded properly
            'filename': 'test.txt',
            'content_type': 'text/plain'
        }
        
        with pytest.raises(ValueError) as exc_info:
            await FileUploadService.upload_file(
                file_data=file_data,
                org_id=str(uuid4())
            )
        
        assert "Invalid file content encoding" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_upload_file_size_exceeds_limit(self, large_file_data):
        """Test upload with file size exceeding limits"""
        with pytest.raises(ValueError) as exc_info:
            await FileUploadService.upload_file(
                file_data=large_file_data,
                org_id=str(uuid4())
            )
        
        assert "File size exceeds maximum" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_upload_file_image_size_exceeds_limit(self):
        """Test upload with image size exceeding image limits"""
        # Create large image that exceeds image size limit
        content = b"x" * (MAX_IMAGE_SIZE + 1000)
        encoded_content = base64.b64encode(content).decode('utf-8')
        
        file_data = {
            'content': encoded_content,
            'filename': 'large_image.jpg',
            'content_type': 'image/jpeg'
        }
        
        with pytest.raises(ValueError) as exc_info:
            await FileUploadService.upload_file(
                file_data=file_data,
                org_id=str(uuid4())
            )
        
        assert "Image file size exceeds maximum" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_upload_file_s3_upload_failure(self, sample_file_data):
        """Test handling of S3 upload failure"""
        with patch('app.services.file_upload_service.settings') as mock_settings, \
             patch('app.services.file_upload_service.upload_file_to_s3') as mock_s3_upload:
            
            mock_settings.S3_FILE_STORAGE = True
            mock_s3_upload.side_effect = Exception("S3 upload failed")
            
            with pytest.raises(ValueError) as exc_info:
                await FileUploadService.upload_file(
                    file_data=sample_file_data,
                    org_id=str(uuid4())
                )
            
            assert "Failed to upload file" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_upload_file_local_write_failure(self, sample_file_data):
        """Test handling of local file write failure"""
        with patch('app.services.file_upload_service.settings') as mock_settings, \
             patch('os.makedirs') as mock_makedirs, \
             patch('builtins.open', create=True) as mock_open:
            
            mock_settings.S3_FILE_STORAGE = False
            mock_open.side_effect = OSError("Permission denied")
            
            with pytest.raises(ValueError) as exc_info:
                await FileUploadService.upload_file(
                    file_data=sample_file_data,
                    org_id=str(uuid4())
                )
            
            assert "Failed to upload file" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_upload_file_default_content_type(self):
        """Test upload with default content type when not provided"""
        content = b"test content"
        file_data = {
            'content': base64.b64encode(content).decode('utf-8'),
            'filename': 'test.txt'
            # No content_type provided - will default to 'application/octet-stream' which is not allowed
        }
        
        # Should raise error because default content type is not allowed
        with pytest.raises(ValueError) as exc_info:
            await FileUploadService.upload_file(
                file_data=file_data,
                org_id=str(uuid4())
            )
        
        assert "File type application/octet-stream not allowed" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_upload_file_folder_structure_user(self, sample_file_data):
        """Test folder structure for user uploads"""
        org_id = str(uuid4())
        user_id = str(uuid4())
        
        with patch('app.services.file_upload_service.settings') as mock_settings, \
             patch('app.services.file_upload_service.upload_file_to_s3') as mock_s3_upload, \
             patch('app.services.file_upload_service.get_s3_signed_url') as mock_signed_url:
            
            mock_settings.S3_FILE_STORAGE = True
            mock_s3_upload.return_value = 'https://s3.amazonaws.com/bucket/file.txt'
            mock_signed_url.return_value = 'https://s3.amazonaws.com/bucket/signed'
            
            await FileUploadService.upload_file(
                file_data=sample_file_data,
                org_id=org_id,
                user_id=user_id
            )
            
            # Verify folder structure
            call_args = mock_s3_upload.call_args
            assert call_args[1]['folder'] == f'chat_attachments/{org_id}'
    
    @pytest.mark.asyncio
    async def test_upload_file_folder_structure_customer(self, sample_file_data):
        """Test folder structure for customer uploads"""
        org_id = str(uuid4())
        customer_id = str(uuid4())
        
        with patch('app.services.file_upload_service.settings') as mock_settings, \
             patch('app.services.file_upload_service.upload_file_to_s3') as mock_s3_upload, \
             patch('app.services.file_upload_service.get_s3_signed_url') as mock_signed_url:
            
            mock_settings.S3_FILE_STORAGE = True
            mock_s3_upload.return_value = 'https://s3.amazonaws.com/bucket/file.txt'
            mock_signed_url.return_value = 'https://s3.amazonaws.com/bucket/signed'
            
            await FileUploadService.upload_file(
                file_data=sample_file_data,
                org_id=org_id,
                customer_id=customer_id
            )
            
            # Verify folder structure (same as user for now)
            call_args = mock_s3_upload.call_args
            assert call_args[1]['folder'] == f'chat_attachments/{org_id}'
    
    @pytest.mark.asyncio
    async def test_upload_file_unique_filename_generation(self, sample_file_data):
        """Test that unique filenames are generated"""
        org_id = str(uuid4())
        
        with patch('app.services.file_upload_service.settings') as mock_settings, \
             patch('app.services.file_upload_service.upload_file_to_s3') as mock_s3_upload, \
             patch('app.services.file_upload_service.get_s3_signed_url') as mock_signed_url, \
             patch('uuid.uuid4') as mock_uuid:
            
            mock_settings.S3_FILE_STORAGE = True
            mock_s3_upload.return_value = 'https://s3.amazonaws.com/bucket/file.txt'
            mock_signed_url.return_value = 'https://s3.amazonaws.com/bucket/signed'
            
            # Mock UUID generation
            mock_uuid.return_value = Mock()
            mock_uuid.return_value.__str__ = Mock(return_value='unique-id-789')
            
            await FileUploadService.upload_file(
                file_data=sample_file_data,
                org_id=org_id
            )
            
            # Verify unique filename was generated
            call_args = mock_s3_upload.call_args
            assert call_args[1]['filename'] == 'unique-id-789.txt'
    
    @pytest.mark.asyncio
    async def test_upload_file_no_extension(self):
        """Test upload with filename that has no extension"""
        content = b"test content"
        file_data = {
            'content': base64.b64encode(content).decode('utf-8'),
            'filename': 'test_file_no_extension',
            'content_type': 'text/plain'
        }
        
        with patch('app.services.file_upload_service.settings') as mock_settings, \
             patch('app.services.file_upload_service.upload_file_to_s3') as mock_s3_upload, \
             patch('app.services.file_upload_service.get_s3_signed_url') as mock_signed_url, \
             patch('uuid.uuid4') as mock_uuid:
            
            mock_settings.S3_FILE_STORAGE = True
            mock_s3_upload.return_value = 'https://s3.amazonaws.com/bucket/file'
            mock_signed_url.return_value = 'https://s3.amazonaws.com/bucket/signed'
            
            mock_uuid.return_value = Mock()
            mock_uuid.return_value.__str__ = Mock(return_value='no-ext-id')
            
            await FileUploadService.upload_file(
                file_data=file_data,
                org_id=str(uuid4())
            )
            
            # Verify filename without extension
            call_args = mock_s3_upload.call_args
            assert call_args[1]['filename'] == 'no-ext-id'  # No extension added


class TestFileUploadServiceConstants:
    """Test service constants and configurations"""
    
    def test_allowed_file_types_combination(self):
        """Test that ALLOWED_FILE_TYPES is correct combination"""
        expected_types = ALLOWED_IMAGE_TYPES | ALLOWED_DOCUMENT_TYPES
        assert ALLOWED_FILE_TYPES == expected_types
    
    def test_file_size_constants(self):
        """Test file size constants are reasonable"""
        assert MAX_FILE_SIZE == 10 * 1024 * 1024  # 10MB
        assert MAX_IMAGE_SIZE == 5 * 1024 * 1024   # 5MB
        assert MAX_IMAGE_SIZE < MAX_FILE_SIZE       # Image limit should be smaller
    
    def test_allowed_image_types_content(self):
        """Test allowed image types include common formats"""
        expected_image_types = {
            'image/jpeg', 'image/jpg', 'image/png', 
            'image/gif', 'image/webp', 'image/svg+xml'
        }
        assert ALLOWED_IMAGE_TYPES == expected_image_types
    
    def test_allowed_document_types_content(self):
        """Test allowed document types include common formats"""
        expected_doc_types = {
            'application/pdf', 
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain', 
            'text/csv', 
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
        assert ALLOWED_DOCUMENT_TYPES == expected_doc_types

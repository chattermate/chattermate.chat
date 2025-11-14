"""
ChatterMate - S3 Storage Tests
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
from fastapi import UploadFile, HTTPException
from io import BytesIO
from app.core.s3 import get_s3_client, get_s3_signed_url, upload_file_to_s3, delete_file_from_s3
from app.core.config import settings
from botocore.exceptions import ClientError


def test_get_s3_client():
    """Test the get_s3_client function"""
    with patch('boto3.client') as mock_boto3_client:
        mock_client = MagicMock()
        mock_boto3_client.return_value = mock_client
        
        client = get_s3_client()
        
        # Verify boto3.client was called with correct parameters
        mock_boto3_client.assert_called_once_with(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.S3_REGION
        )
        
        assert client == mock_client


@pytest.mark.asyncio
async def test_get_s3_signed_url_with_s3_storage_enabled():
    """Test get_s3_signed_url when S3 storage is enabled"""
    test_s3_url = f"https://{settings.S3_BUCKET}.s3.{settings.S3_REGION}.amazonaws.com/test/file.jpg"
    expected_signed_url = "https://signed-url.example.com"
    
    with patch('app.core.s3.settings.S3_FILE_STORAGE', True), \
         patch('app.core.s3.get_s3_client') as mock_get_client:
        
        mock_client = MagicMock()
        mock_client.generate_presigned_url.return_value = expected_signed_url
        mock_get_client.return_value = mock_client
        
        result = await get_s3_signed_url(test_s3_url)
        
        # Verify the client was called correctly
        mock_client.generate_presigned_url.assert_called_once_with(
            'get_object',
            Params={
                'Bucket': settings.S3_BUCKET,
                'Key': 'test/file.jpg'
            },
            ExpiresIn=2592000  # Default 30 days
        )
        
        assert result == expected_signed_url


@pytest.mark.asyncio
async def test_get_s3_signed_url_with_s3_storage_disabled():
    """Test get_s3_signed_url when S3 storage is disabled"""
    test_s3_url = "https://example.com/test/file.jpg"
    
    with patch('app.core.s3.settings.S3_FILE_STORAGE', False):
        result = await get_s3_signed_url(test_s3_url)
        assert result == test_s3_url


@pytest.mark.asyncio
async def test_get_s3_signed_url_with_exception():
    """Test get_s3_signed_url when an exception occurs"""
    test_s3_url = f"https://{settings.S3_BUCKET}.s3.{settings.S3_REGION}.amazonaws.com/test/file.jpg"
    
    with patch('app.core.s3.settings.S3_FILE_STORAGE', True), \
         patch('app.core.s3.get_s3_client') as mock_get_client:
        
        mock_client = MagicMock()
        mock_client.generate_presigned_url.side_effect = Exception("Test exception")
        mock_get_client.return_value = mock_client
        
        result = await get_s3_signed_url(test_s3_url)
        
        # Should return the original URL on error
        assert result == test_s3_url


@pytest.mark.asyncio
async def test_upload_file_to_s3_success():
    """Test successful file upload to S3"""
    # File content as bytes (the function now expects bytes directly)
    file_content = b"test file content"
    
    folder = "test-folder"
    filename = "test-file.txt"
    content_type = "text/plain"
    
    expected_url = f"https://{settings.S3_BUCKET}.s3.{settings.S3_REGION}.amazonaws.com/{folder}/{filename}"
    
    with patch('app.core.s3.get_s3_client') as mock_get_client:
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        
        result = await upload_file_to_s3(file_content, folder, filename, content_type)
        
        # Verify S3 client was called correctly
        mock_client.put_object.assert_called_once_with(
            Bucket=settings.S3_BUCKET,
            Key=f"{folder}/{filename}",
            Body=file_content,
            ContentType=content_type
        )
        
        assert result == expected_url


@pytest.mark.asyncio
async def test_upload_file_to_s3_without_content_type():
    """Test file upload to S3 without specifying content type"""
    file_content = b"test file content"
    
    folder = "test-folder"
    filename = "test-file.txt"
    
    with patch('app.core.s3.get_s3_client') as mock_get_client:
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        
        await upload_file_to_s3(file_content, folder, filename)
        
        # Verify S3 client was called without ContentType
        mock_client.put_object.assert_called_once_with(
            Bucket=settings.S3_BUCKET,
            Key=f"{folder}/{filename}",
            Body=file_content
        )


@pytest.mark.asyncio
async def test_upload_file_to_s3_client_error():
    """Test file upload to S3 with ClientError - should fallback to local storage"""
    file_content = b"test content"
    
    with patch('app.core.s3.get_s3_client') as mock_get_client, \
         patch('app.core.s3._save_file_locally') as mock_save_locally:
        mock_client = MagicMock()
        mock_client.put_object.side_effect = ClientError(
            {'Error': {'Code': 'TestException', 'Message': 'Test error message'}},
            'PutObject'
        )
        mock_get_client.return_value = mock_client
        mock_save_locally.return_value = "/uploads/folder/file.txt"
        
        result = await upload_file_to_s3(file_content, "folder", "file.txt")
        
        # Should fallback to local storage and return local URL
        assert result == "/uploads/folder/file.txt"


@pytest.mark.asyncio
async def test_upload_file_to_s3_general_exception():
    """Test file upload to S3 with a general exception - should fallback to local storage"""
    file_content = b"test content"
    
    with patch('app.core.s3.get_s3_client') as mock_get_client, \
         patch('app.core.s3._save_file_locally') as mock_save_locally:
        mock_client = MagicMock()
        mock_client.put_object.side_effect = Exception("Test exception")
        mock_get_client.return_value = mock_client
        mock_save_locally.return_value = "/uploads/folder/file.txt"
        
        result = await upload_file_to_s3(file_content, "folder", "file.txt")
        
        # Should fallback to local storage and return local URL
        assert result == "/uploads/folder/file.txt"


@pytest.mark.asyncio
async def test_delete_file_from_s3_success():
    """Test successful file deletion from S3"""
    test_s3_url = f"https://{settings.S3_BUCKET}.s3.{settings.S3_REGION}.amazonaws.com/test/file.jpg"
    
    with patch('app.core.s3.get_s3_client') as mock_get_client:
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        
        result = await delete_file_from_s3(test_s3_url)
        
        # Verify S3 client was called correctly
        mock_client.delete_object.assert_called_once_with(
            Bucket=settings.S3_BUCKET,
            Key="test/file.jpg"
        )
        
        assert result is True


@pytest.mark.asyncio
async def test_delete_file_from_s3_exception():
    """Test file deletion from S3 with an exception"""
    test_s3_url = f"https://{settings.S3_BUCKET}.s3.{settings.S3_REGION}.amazonaws.com/test/file.jpg"
    
    with patch('app.core.s3.get_s3_client') as mock_get_client:
        mock_client = MagicMock()
        mock_client.delete_object.side_effect = Exception("Test exception")
        mock_get_client.return_value = mock_client
        
        result = await delete_file_from_s3(test_s3_url)
        
        assert result is False 
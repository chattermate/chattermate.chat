"""
ChatterMate - File Upload Service
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

import base64
import os
import uuid
from typing import Dict, Optional
from app.core.config import settings
from app.core.s3 import upload_file_to_s3, get_s3_signed_url
from app.core.logger import get_logger

logger = get_logger(__name__)

# Allowed file types and size limits
ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'}
ALLOWED_DOCUMENT_TYPES = {'application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'text/plain', 'text/csv', 'application/vnd.ms-excel',
                          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
ALLOWED_FILE_TYPES = ALLOWED_IMAGE_TYPES | ALLOWED_DOCUMENT_TYPES

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB


class FileUploadService:
    """Service for handling file uploads to S3 or local storage"""
    
    @staticmethod
    def validate_file_type(content_type: str) -> bool:
        """Validate if the file type is allowed"""
        return content_type in ALLOWED_FILE_TYPES
    
    @staticmethod
    def validate_file_size(file_size: int, content_type: str) -> tuple[bool, Optional[str]]:
        """
        Validate file size based on content type
        Returns: (is_valid, error_message)
        """
        if content_type in ALLOWED_IMAGE_TYPES and file_size > MAX_IMAGE_SIZE:
            return False, f"Image file size exceeds maximum allowed size of {MAX_IMAGE_SIZE / (1024*1024)}MB"
        
        if file_size > MAX_FILE_SIZE:
            return False, f"File size exceeds maximum allowed size of {MAX_FILE_SIZE / (1024*1024)}MB"
        
        return True, None
    
    @staticmethod
    async def upload_file(
        file_data: dict,
        org_id: str,
        customer_id: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, any]:
        """
        Upload a file to S3 or local storage
        
        Args:
            file_data: Dict with 'content' (base64), 'filename', 'content_type', 'size'
            org_id: Organization ID
            customer_id: Optional customer ID (for widget users)
            user_id: Optional user ID (for authenticated users)
        
        Returns:
            Dict with 'file_url', 'signed_url', 'filename', 'content_type', 'size'
        
        Raises:
            ValueError: If validation fails or upload fails
        """
        try:
            # Validate file data
            if not file_data.get('content') or not file_data.get('filename'):
                raise ValueError("Missing required file data: content and filename")
            
            content_type = file_data.get('content_type', 'application/octet-stream')
            
            # Validate file type
            if not FileUploadService.validate_file_type(content_type):
                raise ValueError(f"File type {content_type} not allowed. Allowed types: images and documents.")
            
            # Decode base64 content
            try:
                file_content = base64.b64decode(file_data['content'])
            except Exception as e:
                logger.error(f"Error decoding base64 content: {str(e)}")
                raise ValueError("Invalid file content encoding")
            
            file_size = len(file_content)
            
            # Validate file size
            is_valid, error_message = FileUploadService.validate_file_size(file_size, content_type)
            if not is_valid:
                raise ValueError(error_message)
            
            # Generate unique filename
            file_extension = os.path.splitext(file_data['filename'])[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            
            # Determine folder based on auth type
            if user_id:
                folder = f"chat_attachments/{org_id}"
            else:
                folder = f"chat_attachments/{org_id}"
            
            # Upload to S3 if enabled, otherwise save locally
            if settings.S3_FILE_STORAGE:
                file_url = await upload_file_to_s3(
                    file_content=file_content,
                    folder=folder,
                    filename=unique_filename,
                    content_type=content_type
                )
                # Generate signed URL for S3 object
                signed_url = await get_s3_signed_url(file_url)
            else:
                # Save locally
                upload_dir = os.path.join("uploads", folder)
                os.makedirs(upload_dir, exist_ok=True)
                
                file_path = os.path.join(upload_dir, unique_filename)
                with open(file_path, "wb") as f:
                    f.write(file_content)
                
                file_url = f"/uploads/{folder}/{unique_filename}"
                signed_url = file_url
            
            logger.info(f"Successfully uploaded file: {file_data['filename']} -> {file_url}")
            
            return {
                'file_url': file_url,
                'signed_url': signed_url,
                'filename': file_data['filename'],
                'content_type': content_type,
                'size': file_size
            }
            
        except ValueError:
            # Re-raise validation errors
            raise
        except Exception as e:
            logger.error(f"Error in FileUploadService.upload_file: {str(e)}", exc_info=True)
            raise ValueError(f"Failed to upload file: {str(e)}")


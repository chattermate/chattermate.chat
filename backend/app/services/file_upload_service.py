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
from typing import Dict, Optional, List, Set
from app.core.config import settings
from app.core.s3 import upload_file_to_s3, get_s3_signed_url
from app.core.logger import get_logger

logger = get_logger(__name__)

# Allowed file types and size limits
ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'}
ALLOWED_DOCUMENT_TYPES = {'application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'text/plain', 'text/csv', 'application/vnd.ms-excel',
                          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
ALLOWED_FILE_TYPES = ALLOWED_IMAGE_TYPES | ALLOWED_DOCUMENT_TYPES

# Security: SVG removed from default allowed types due to XSS risks
# Can be enabled per-agent if needed with proper sanitization

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB

# Magic byte signatures for file type validation
# This prevents MIME type spoofing attacks
MAGIC_BYTES = {
    # Images
    'image/jpeg': [
        (b'\xff\xd8\xff\xe0', 0),  # JPEG JFIF
        (b'\xff\xd8\xff\xe1', 0),  # JPEG EXIF
        (b'\xff\xd8\xff\xe2', 0),  # JPEG ICC
        (b'\xff\xd8\xff\xe8', 0),  # JPEG SPIFF
        (b'\xff\xd8\xff\xdb', 0),  # JPEG DQT
        (b'\xff\xd8\xff\xee', 0),  # JPEG Adobe
    ],
    'image/jpg': [
        (b'\xff\xd8\xff\xe0', 0),
        (b'\xff\xd8\xff\xe1', 0),
        (b'\xff\xd8\xff\xe2', 0),
        (b'\xff\xd8\xff\xe8', 0),
        (b'\xff\xd8\xff\xdb', 0),
        (b'\xff\xd8\xff\xee', 0),
    ],
    'image/png': [
        (b'\x89PNG\r\n\x1a\n', 0),
    ],
    'image/gif': [
        (b'GIF87a', 0),
        (b'GIF89a', 0),
    ],
    'image/webp': [
        (b'RIFF', 0),  # WebP starts with RIFF, then has WEBP at offset 8
    ],
    # Documents
    'application/pdf': [
        (b'%PDF-', 0),
    ],
    'application/msword': [
        (b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1', 0),  # OLE Compound File (DOC)
    ],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        (b'PK\x03\x04', 0),  # ZIP-based (DOCX)
    ],
    'application/vnd.ms-excel': [
        (b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1', 0),  # OLE Compound File (XLS)
    ],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        (b'PK\x03\x04', 0),  # ZIP-based (XLSX)
    ],
    'text/plain': [],  # Text files don't have magic bytes, validated by content
    'text/csv': [],  # CSV files don't have magic bytes, validated by content
}

# File extension to MIME type mapping for validation
EXTENSION_TO_MIME = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

# Category labels for display
FILE_TYPE_CATEGORIES = {
    'images': {'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'},
    'documents': {'application/pdf'},
    'office': {'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
               'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'},
    'text': {'text/plain', 'text/csv'},
}


class FileUploadService:
    """Service for handling file uploads to S3 or local storage with enhanced security"""
    
    @staticmethod
    def validate_magic_bytes(file_content: bytes, claimed_content_type: str) -> tuple[bool, Optional[str]]:
        """
        Validate file content against magic byte signatures to prevent MIME type spoofing.
        
        Args:
            file_content: The raw binary content of the file
            claimed_content_type: The MIME type claimed by the client
            
        Returns:
            (is_valid, error_message)
        """
        if claimed_content_type not in MAGIC_BYTES:
            logger.warning(f"Unknown content type for magic byte validation: {claimed_content_type}")
            return False, f"File type '{claimed_content_type}' is not allowed"
        
        signatures = MAGIC_BYTES[claimed_content_type]
        
        # Text files don't have magic bytes - validate as text content
        if not signatures:
            if claimed_content_type in {'text/plain', 'text/csv'}:
                # Check if content is valid text (not binary)
                try:
                    # Try to decode as UTF-8, allowing for some common encodings
                    sample = file_content[:8192]  # Check first 8KB
                    sample.decode('utf-8')
                    return True, None
                except UnicodeDecodeError:
                    try:
                        sample.decode('latin-1')
                        return True, None
                    except UnicodeDecodeError:
                        return False, "File content does not appear to be valid text"
            return True, None
        
        # Check for WebP special case (has WEBP at offset 8)
        if claimed_content_type == 'image/webp':
            if len(file_content) >= 12:
                if file_content[:4] == b'RIFF' and file_content[8:12] == b'WEBP':
                    return True, None
            return False, "File content does not match WebP format signature"
        
        # Check against all possible signatures for this MIME type
        for signature, offset in signatures:
            end_offset = offset + len(signature)
            if len(file_content) >= end_offset:
                if file_content[offset:end_offset] == signature:
                    return True, None
        
        return False, f"File content does not match the claimed type '{claimed_content_type}'. The file may be corrupted or mislabeled."
    
    @staticmethod
    def validate_extension(filename: str, claimed_content_type: str) -> tuple[bool, Optional[str]]:
        """
        Validate that file extension matches the claimed content type.
        
        Args:
            filename: The name of the file
            claimed_content_type: The MIME type claimed by the client
            
        Returns:
            (is_valid, error_message)
        """
        ext = os.path.splitext(filename.lower())[1]
        
        if not ext:
            return False, "File must have an extension"
        
        if ext not in EXTENSION_TO_MIME:
            return False, f"File extension '{ext}' is not allowed. Allowed extensions: {', '.join(sorted(EXTENSION_TO_MIME.keys()))}"
        
        expected_mime = EXTENSION_TO_MIME[ext]
        
        # Handle jpg/jpeg equivalence
        if claimed_content_type in {'image/jpeg', 'image/jpg'} and expected_mime in {'image/jpeg', 'image/jpg'}:
            return True, None
        
        if expected_mime != claimed_content_type:
            return False, f"File extension '{ext}' does not match content type '{claimed_content_type}'"
        
        return True, None
    
    @staticmethod
    def validate_file_type(content_type: str, allowed_types: Optional[Set[str]] = None) -> bool:
        """
        Validate if the file type is allowed.
        
        Args:
            content_type: The MIME type to validate
            allowed_types: Optional set of allowed MIME types. If None, uses default ALLOWED_FILE_TYPES.
        """
        types_to_check = allowed_types if allowed_types is not None else ALLOWED_FILE_TYPES
        return content_type in types_to_check
    
    @staticmethod
    def get_allowed_types_for_agent(agent_allowed_types: Optional[List[str]] = None) -> Set[str]:
        """
        Get the set of allowed file types for an agent.
        
        Args:
            agent_allowed_types: List of category names like ['images', 'documents', 'office', 'text']
                                 If None or empty, returns all default allowed types.
        
        Returns:
            Set of MIME types that are allowed
        """
        if not agent_allowed_types:
            return ALLOWED_FILE_TYPES
        
        allowed = set()
        for category in agent_allowed_types:
            category_lower = category.lower()
            if category_lower in FILE_TYPE_CATEGORIES:
                allowed.update(FILE_TYPE_CATEGORIES[category_lower])
        
        # If no valid categories found, return default
        if not allowed:
            return ALLOWED_FILE_TYPES
        
        return allowed
    
    @staticmethod
    def validate_file_size(file_size: int, content_type: str) -> tuple[bool, Optional[str]]:
        """
        Validate file size based on content type
        Returns: (is_valid, error_message)
        """
        if content_type in ALLOWED_IMAGE_TYPES and file_size > MAX_IMAGE_SIZE:
            return False, f"Image file size exceeds maximum allowed size of {MAX_IMAGE_SIZE / (1024*1024):.1f}MB"
        
        if file_size > MAX_FILE_SIZE:
            return False, f"File size exceeds maximum allowed size of {MAX_FILE_SIZE / (1024*1024):.1f}MB"
        
        return True, None
    
    @staticmethod
    def get_friendly_allowed_types_message(allowed_types: Optional[Set[str]] = None) -> str:
        """Generate a user-friendly message listing allowed file types."""
        types_to_use = allowed_types if allowed_types is not None else ALLOWED_FILE_TYPES
        
        extensions = []
        for ext, mime in EXTENSION_TO_MIME.items():
            if mime in types_to_use:
                extensions.append(ext.upper().replace('.', ''))
        
        return ', '.join(sorted(set(extensions)))
    
    @staticmethod
    async def upload_file(
        file_data: dict,
        org_id: str,
        customer_id: Optional[str] = None,
        user_id: Optional[str] = None,
        allowed_types: Optional[Set[str]] = None
    ) -> Dict[str, any]:
        """
        Upload a file to S3 or local storage with enhanced security validation.
        
        Args:
            file_data: Dict with 'content' (base64), 'filename', 'content_type', 'size'
            org_id: Organization ID
            customer_id: Optional customer ID (for widget users)
            user_id: Optional user ID (for authenticated users)
            allowed_types: Optional set of allowed MIME types for this upload
        
        Returns:
            Dict with 'file_url', 'signed_url', 'filename', 'content_type', 'size'
        
        Raises:
            ValueError: If validation fails or upload fails
        """
        try:
            filename = file_data.get('filename', '')
            content_type = file_data.get('content_type', 'application/octet-stream')
            
            # Validate file data
            if not file_data.get('content') or not filename:
                raise ValueError("Missing required file data: content and filename")
            
            # Determine which types are allowed
            types_allowed = allowed_types if allowed_types is not None else ALLOWED_FILE_TYPES
            friendly_types = FileUploadService.get_friendly_allowed_types_message(types_allowed)
            
            # Step 1: Validate extension matches claimed content type
            is_valid, error = FileUploadService.validate_extension(filename, content_type)
            if not is_valid:
                logger.warning(f"Extension validation failed for {filename}: {error}")
                raise ValueError(error)
            
            # Step 2: Validate file type is allowed
            if not FileUploadService.validate_file_type(content_type, types_allowed):
                raise ValueError(f"File type '{content_type}' is not allowed. Allowed types: {friendly_types}")
            
            # Step 3: Decode base64 content
            try:
                file_content = base64.b64decode(file_data['content'])
            except Exception as e:
                logger.error(f"Error decoding base64 content: {str(e)}")
                raise ValueError("Invalid file content encoding")
            
            file_size = len(file_content)
            
            # Step 4: Validate file size
            is_valid, error_message = FileUploadService.validate_file_size(file_size, content_type)
            if not is_valid:
                raise ValueError(error_message)
            
            # Step 5: SECURITY - Validate magic bytes to prevent MIME spoofing
            is_valid, magic_error = FileUploadService.validate_magic_bytes(file_content, content_type)
            if not is_valid:
                logger.warning(f"Magic byte validation failed for {filename}: {magic_error}")
                raise ValueError(f"Security check failed: {magic_error}")
            
            logger.info(f"File validation passed for {filename}: type={content_type}, size={file_size}")
            
            # Generate unique filename with sanitized extension
            file_extension = os.path.splitext(filename)[1].lower()
            # Additional sanitization: only allow known extensions
            if file_extension not in EXTENSION_TO_MIME:
                raise ValueError(f"File extension '{file_extension}' is not allowed")
            
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            
            # Determine folder based on auth type
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
            
            logger.info(f"Successfully uploaded file: {filename} -> {file_url}")
            
            return {
                'file_url': file_url,
                'signed_url': signed_url,
                'filename': filename,
                'content_type': content_type,
                'size': file_size
            }
            
        except ValueError:
            # Re-raise validation errors
            raise
        except Exception as e:
            logger.error(f"Error in FileUploadService.upload_file: {str(e)}", exc_info=True)
            raise ValueError(f"Failed to upload file: {str(e)}")


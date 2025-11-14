"""
ChatterMate - File Upload API
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

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status, Header, Request
from fastapi.responses import JSONResponse
from typing import Optional
import uuid
import os
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.s3 import upload_file_to_s3, get_s3_signed_url
from app.core.logger import get_logger
from app.core.security import verify_conversation_token
from app.models import User
from app.core.auth import get_current_user
from app.database import get_db

logger = get_logger(__name__)

router = APIRouter()

# Allowed file types and size limits
ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'}
ALLOWED_DOCUMENT_TYPES = {'application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'text/plain', 'text/csv', 'application/vnd.ms-excel',
                          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
ALLOWED_FILE_TYPES = ALLOWED_IMAGE_TYPES | ALLOWED_DOCUMENT_TYPES

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB


def get_cors_headers(request: Request) -> dict:
    """
    Get CORS headers for responses with credentials support
    """
    origin = request.headers.get('origin', '*')
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Conversation-Token',
        'Access-Control-Max-Age': '3600'
    }


async def get_current_user_or_widget(
    request: Request,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
    x_conversation_token: Optional[str] = Header(None)
) -> dict:
    """
    Get current user from JWT token, cookies, or widget conversation token
    Returns dict with user info or widget info
    """
    # Try to get user from cookies or Authorization header (admin/agent users)
    try:
        # Call get_current_user with the request - it handles both cookies and headers
        user = await get_current_user(request, None, db)
        if user:
            return {
                "type": "user",
                "user_id": str(user.id),
                "org_id": str(user.organization_id)
            }
    except HTTPException:
        # User auth failed, continue to try other methods
        pass
    except Exception as e:
        logger.error(f"Error authenticating user: {str(e)}")
    
    # Try to get widget info from conversation token
    if x_conversation_token:
        try:
            payload = verify_conversation_token(x_conversation_token)
            if payload:
                return {
                    "type": "widget",
                    "widget_id": payload.get("widget_id"),
                    "org_id": payload.get("org_id"),
                    "customer_id": payload.get("customer_id")
                }
        except Exception as e:
            logger.error(f"Error verifying conversation token: {str(e)}")
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required"
    )


@router.get("/download/{file_path:path}")
async def download_file(
    file_path: str,
    request: Request,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
    x_conversation_token: Optional[str] = Header(None)
):
    """
    Download/serve a file from AWS S3 or local storage
    
    Usage: GET /api/v1/files/download/chat_attachments/org-id/filename.jpg
    """
    try:
        from fastapi.responses import StreamingResponse
        from app.core.s3 import get_s3_client
        import io
        
        # Try to authenticate
        try:
            auth_info = await get_current_user_or_widget(request, db, authorization, x_conversation_token)
        except Exception:
            auth_info = None
        
        if not settings.S3_FILE_STORAGE:
            # Serve local file
            import os
            # file_path already includes the full path like /uploads/chat_attachments/org-id/filename.png
            # Remove leading slash if present
            clean_path = file_path.lstrip('/')
            local_file_path = clean_path if clean_path.startswith('uploads/') else os.path.join("uploads", clean_path)
            
            if os.path.exists(local_file_path):
                with open(local_file_path, "rb") as f:
                    file_content = f.read()
                
                import mimetypes
                content_type, _ = mimetypes.guess_type(local_file_path)
                content_type = content_type or "application/octet-stream"
                
                return StreamingResponse(
                    io.BytesIO(file_content),
                    media_type=content_type,
                    headers={"Content-Disposition": f"inline; filename={os.path.basename(file_path)}"}
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"File not found: {local_file_path}"
                )
        
        # For AWS S3 - stream file from S3
        try:
            s3_client = get_s3_client()
        except Exception as client_err:
            logger.error(f"Failed to create S3 client: {str(client_err)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create S3 client"
            )
        
        # For S3, remove /uploads/ prefix if present since S3 keys don't include it
        s3_key = file_path.lstrip('/').replace('uploads/', '') if file_path.startswith('/uploads/') else file_path.lstrip('/')
        bucket = settings.S3_BUCKET
        
        # Check if the file exists
        try:
            s3_client.head_object(Bucket=bucket, Key=s3_key)
        except s3_client.exceptions.NoSuchKey:
            logger.warning(f"File not found in S3: {s3_key}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        except Exception as head_err:
            logger.error(f"Error checking file in S3: {str(head_err)}", exc_info=True)
        
        # Get the object from S3
        try:
            response = s3_client.get_object(Bucket=bucket, Key=s3_key)
        except s3_client.exceptions.NoSuchKey:
            logger.warning(f"File not found in S3: {s3_key}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        except Exception as s3_err:
            logger.error(f"S3 error: {str(s3_err)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve file from S3"
            )
        
        # Stream the file back to client
        def generate():
            while True:
                chunk = response['Body'].read(8192)
                if not chunk:
                    break
                yield chunk
        
        # Determine content type
        content_type = response.get('ContentType', 'application/octet-stream')
        
        # Extract filename from path
        filename = file_path.split('/')[-1]
        
        logger.info(f"Streaming file from S3: {filename}, content-type: {content_type}")
        return StreamingResponse(
            generate(),
            media_type=content_type,
            headers={"Content-Disposition": f"inline; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading file {file_path}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download file: {str(e)}"
        )









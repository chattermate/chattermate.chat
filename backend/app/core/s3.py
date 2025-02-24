"""
S3 Storage Utilities
"""
import boto3
from botocore.exceptions import ClientError
from app.core.config import settings
from app.core.logger import get_logger
from fastapi import HTTPException, UploadFile
from typing import Optional

logger = get_logger(__name__)

def get_s3_client():
    """Get boto3 S3 client"""
    return boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.S3_REGION
    )

async def get_s3_signed_url(s3_url: str, expiration: int = 3600) -> str:
    """
    Generate a signed URL for an S3 object
    Args:
        s3_url: The S3 URL of the object
        expiration: URL expiration time in seconds (default 1 hour)
    Returns:
        Signed URL for the object
    """
    try:
        if not settings.S3_FILE_STORAGE or not s3_url:
            return s3_url
            
        # Extract key from URL
        key = s3_url.split(f"{settings.S3_BUCKET}.s3.{settings.S3_REGION}.amazonaws.com/")[1]
        
        s3_client = get_s3_client()
        signed_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': settings.S3_BUCKET,
                'Key': key
            },
            ExpiresIn=expiration
        )
        return signed_url
    except Exception as e:
        logger.error(f"Error generating signed URL: {str(e)}")
        return s3_url

async def upload_file_to_s3(
    file: UploadFile,
    folder: str,
    filename: str,
    content_type: Optional[str] = None
) -> str:
    """
    Upload file to S3 bucket
    Returns the S3 URL of the uploaded file
    """
    try:
        s3_client = get_s3_client()
        file_content = await file.read()
        
        # Construct S3 key (path)
        s3_key = f"{folder}/{filename}"
        
        # Upload to S3
        extra_args = {}
        if content_type:
            extra_args['ContentType'] = content_type
            
        s3_client.put_object(
            Bucket=settings.S3_BUCKET,
            Key=s3_key,
            Body=file_content,
            **extra_args
        )
        
        # Generate S3 URL
        url = f"https://{settings.S3_BUCKET}.s3.{settings.S3_REGION}.amazonaws.com/{s3_key}"
        return url
        
    except ClientError as e:
        logger.error(f"Error uploading to S3: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload file to S3")
    except Exception as e:
        logger.error(f"Unexpected error uploading to S3: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload file")

async def delete_file_from_s3(s3_url: str) -> bool:
    """Delete file from S3 bucket"""
    try:
        s3_client = get_s3_client()
        
        # Extract key from URL
        key = s3_url.split(f"{settings.S3_BUCKET}.s3.{settings.S3_REGION}.amazonaws.com/")[1]
        
        s3_client.delete_object(
            Bucket=settings.S3_BUCKET,
            Key=key
        )
        return True
        
    except Exception as e:
        logger.error(f"Error deleting from S3: {str(e)}")
        return False 
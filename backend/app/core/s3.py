"""
S3 Storage Utilities
"""
import traceback
import boto3
from botocore.exceptions import ClientError
from app.core.config import settings
from app.core.logger import get_logger
from fastapi import HTTPException, UploadFile
from typing import Optional
from urllib.parse import urlparse

logger = get_logger(__name__)

def get_s3_client():
    """Get boto3 S3 client"""
    return boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.S3_REGION
    )

async def get_s3_signed_url(s3_url: str, expiration: int = 2592000) -> str:
    """
    Generate a signed URL for an S3 object
    Args:
        s3_url: The S3 URL of the object
        expiration: URL expiration time in seconds (default 30 days)
    Returns:
        Signed URL for the object
    """
    try:
        if not settings.S3_FILE_STORAGE or not s3_url:
            return s3_url

        
        
        # Parse the URL
        parsed_url = urlparse(s3_url)
        path_parts = parsed_url.path.strip('/').split('/')
        
        # Handle different S3 URL formats
        if parsed_url.netloc == 's3.amazonaws.com':
            # Format: https://s3.amazonaws.com/bucket/key
            key = '/'.join(path_parts[1:])
        else:
            # Format: https://bucket.s3.region.amazonaws.com/key
            key = '/'.join(path_parts)
            
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
        traceback.print_exc()
        logger.error(f"Error generating signed URL: {str(e)}")
        return s3_url

async def upload_file_to_s3(
    file_content: bytes,
    folder: str,
    filename: str,
    content_type: Optional[str] = None
) -> str:
    """
    Upload file to S3 bucket
    Args:
        file_content: The file content as bytes
        folder: The S3 folder path
        filename: The filename to save as
        content_type: Optional MIME type
    Returns:
        The S3 URL of the uploaded file
    Falls back to local storage if S3 fails
    """
    try:
        s3_client = get_s3_client()
        
        # Construct S3 key (path)
        s3_key = f"{folder}/{filename}"
        
        # Try to create the bucket if it doesn't exist
        try:
            s3_client.head_bucket(Bucket=settings.S3_BUCKET)
            logger.debug(f"Bucket {settings.S3_BUCKET} already exists")
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code in ('404', 'NoSuchBucket'):
                # Bucket doesn't exist, try to create it
                try:
                       # For AWS, use LocationConstraint for non-us-east-1 regions
                    if settings.S3_REGION != 'us-east-1':
                        s3_client.create_bucket(
                                Bucket=settings.S3_BUCKET,
                                CreateBucketConfiguration={'LocationConstraint': settings.S3_REGION}
                        )
                    else:
                        s3_client.create_bucket(Bucket=settings.S3_BUCKET)
                    logger.info(f"Created S3 bucket: {settings.S3_BUCKET}")
                except Exception as create_err:
                    logger.warning(f"Could not create S3 bucket: {str(create_err)}. Falling back to local storage.")
                    return await _save_file_locally(file_content, folder, filename)
            else:
                # Different error, log and continue
                logger.warning(f"Error checking bucket {settings.S3_BUCKET}: {error_code} - {str(e)}")
        
        # Upload to S3
        extra_args = {}
        if content_type:
            extra_args['ContentType'] = content_type
        
        logger.info(f"Putting object to S3: bucket={settings.S3_BUCKET}, key={s3_key}, size={len(file_content)} bytes")
        s3_client.put_object(
            Bucket=settings.S3_BUCKET,
            Key=s3_key,
            Body=file_content,
            **extra_args
        )
        # Verify file was written
        for attempt in range(3):
            try:
                s3_client.head_object(Bucket=settings.S3_BUCKET, Key=s3_key)
                break
            except Exception as verify_err:
                if attempt < 2:
                    import time
                    time.sleep(0.5)
                else:
                    logger.error(f"File verification failed after retries: {s3_key} - {str(verify_err)}")
                    raise HTTPException(
                        status_code=500,
                        detail="File upload verification failed"
                    )
        
        # Generate AWS S3 URL
        url = f"https://{settings.S3_BUCKET}.s3.{settings.S3_REGION}.amazonaws.com/{s3_key}"
        
        logger.info(f"Successfully uploaded file to S3")
        return url
        
    except ClientError as e:
        logger.warning(f"S3 upload failed with ClientError: {str(e)}. Falling back to local storage.")
        return await _save_file_locally(file_content, folder, filename)
    except Exception as e:
        logger.error(f"S3 upload failed with unexpected error: {str(e)}")
        traceback.print_exc()
        logger.warning(f"Falling back to local storage.")
        return await _save_file_locally(file_content, folder, filename)


async def _save_file_locally(
    file_content: bytes,
    folder: str,
    filename: str
) -> str:
    """
    Fallback function to save file locally when S3 fails
    """
    try:
        import os
        upload_dir = os.path.join("uploads", folder)
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, filename)
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        file_url = f"/uploads/{folder}/{filename}"
        
        return file_url
    except Exception as e:
        logger.error(f"Failed to save file locally: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save file")

async def delete_file_from_s3(s3_url: str) -> bool:
    """Delete file from S3 bucket"""
    try:
        s3_client = get_s3_client()
        
        # Extract key from URL using the same parsing logic as get_s3_signed_url
        parsed_url = urlparse(s3_url)
        path_parts = parsed_url.path.strip('/').split('/')
        
        if parsed_url.netloc == 's3.amazonaws.com':
            # Format: https://s3.amazonaws.com/bucket/key
            key = '/'.join(path_parts[1:])
        else:
            # Format: https://bucket.s3.region.amazonaws.com/key
            key = '/'.join(path_parts)
        
        s3_client.delete_object(
            Bucket=settings.S3_BUCKET,
            Key=key
        )
        return True
        
    except Exception as e:
        logger.error(f"Error deleting from S3: {str(e)}")
        return False 
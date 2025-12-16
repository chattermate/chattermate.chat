"""
ChatterMate - Security
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

from datetime import datetime, timedelta
from typing import Optional, Dict
import uuid
from jose import JWTError, jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet
from app.core.config import  settings
from app.core.logger import get_logger
import base64
import os

logger = get_logger(__name__)

# Constants
SECRET_KEY = settings.SECRET_KEY
CONVERSATION_SECRET_KEY = settings.CONVERSATION_SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_or_create_key():
    """Get encryption key from environment variable or generate a new one"""
    env_key = os.getenv('ENCRYPTION_KEY')
    if env_key:
        try:
            # Try to decode the base64 key
            return base64.b64decode(env_key)
        except Exception as e:
            logger.error(f"Invalid encryption key format: {str(e)}")
    
    # Generate new key if not found in env
    key = Fernet.generate_key()
    # Convert to base64 string for easy env var storage
    env_key = base64.b64encode(key).decode()
    logger.info(f"Generated new encryption key. Please set ENCRYPTION_KEY={env_key} in your environment")
    return key

# Initialize Fernet with key
ENCRYPTION_KEY = get_or_create_key()
fernet = Fernet(ENCRYPTION_KEY)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
    
def verify_conversation_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, CONVERSATION_SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def encrypt_api_key(api_key: str) -> str:
    """Encrypt API key before storing in database"""
    try:
        return fernet.encrypt(api_key.encode()).decode()
    except Exception as e:
        logger.error(f"Encryption error: {str(e)}")
        raise ValueError("Failed to encrypt API key")


def decrypt_api_key(encrypted_key: str) -> str:
    """Decrypt API key from database"""
    try:
        return fernet.decrypt(encrypted_key.encode()).decode()
    except Exception as e:
        logger.error(f"Decryption error: {str(e)}")
        raise ValueError("Failed to decrypt API key")


def create_conversation_token(widget_id: str, customer_id: Optional[str] = None, customer_email: Optional[str] = None, **extra_data) -> str:
    """
    Create a JWT token for widget conversations with revocation support via Redis
    
    Includes a JTI (JWT ID) claim for revocation. Token is stored in Redis with TTL.
    Optionally stores customer email for session tracking and bulk revocation.
    
    Args:
        widget_id: The widget ID
        customer_id: Optional customer ID
        customer_email: Optional customer email for session management
        **extra_data: Additional data to include in token
    """
    jti = str(uuid.uuid4())
    data = {
        "sub": customer_id,  # Keep as None if not provided, don't convert to string "None"
        "widget_id": widget_id,
        "type": "conversation",
        "jti": jti
    }
    
    # Add email to token if provided
    if customer_email:
        data["email"] = customer_email
    
    # Add any extra data to the token
    data.update(extra_data)
    
    # Set expiration to 30 days
    expire = datetime.utcnow() + timedelta(days=30)
    data.update({"exp": expire})

    token = jwt.encode(data, CONVERSATION_SECRET_KEY, algorithm=ALGORITHM)
    
    # Store token JTI in Redis with TTL and optional email mapping (with widget_id)
    _store_token_in_redis(jti, int((expire - datetime.utcnow()).total_seconds()), customer_email, widget_id)
    
    return token


def verify_conversation_token(token: str) -> Optional[dict]:
    """
    Verify conversation token signature and check if revoked
    
    Returns:
        Token payload dict if valid and not revoked, None otherwise
    """
    try:
        payload = jwt.decode(token, CONVERSATION_SECRET_KEY,
                             algorithms=[ALGORITHM])
        if payload.get("type") != "conversation":
            return None
        
        # Check if token JTI exists in Redis (if revoked, it won't exist)
        jti = payload.get("jti")
        if jti and not _is_token_in_redis(jti):
            logger.warning(f"Token revoked or expired: jti={jti[:8]}...")
            return None
        
        return payload
    except JWTError:
        return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


# ============================================================================
# TOKEN STORAGE IN REDIS - Minimal approach
# ============================================================================

def _store_token_in_redis(jti: str, ttl_seconds: int, email: Optional[str] = None, widget_id: Optional[str] = None) -> bool:
    """
    Store token JTI in Redis with TTL and optionally store email/widget_id mapping
    
    Args:
        jti: JWT ID for the token
        ttl_seconds: Time to live in seconds
        email: Optional email to store for session tracking
        widget_id: Optional widget ID for widget-specific session tracking
    """
    try:
        from app.core.redis import redis_client
        if redis_client:
            # Store the token JTI
            redis_client.setex(f"token:{jti}", ttl_seconds, "1")
            
            # Store email mapping if provided (key: user_sessions:email, value: set of JTIs)
            if email:
                redis_client.sadd(f"user_sessions:{email}", jti)
                # Set same TTL for email->JTI mapping
                redis_client.expire(f"user_sessions:{email}", ttl_seconds)
                
                # If widget_id provided, also store widget-specific sessions
                if widget_id:
                    redis_client.sadd(f"user_sessions:{email}:widget:{widget_id}", jti)
                    redis_client.expire(f"user_sessions:{email}:widget:{widget_id}", ttl_seconds)
            
            return True
    except Exception as e:
        logger.warning(f"Failed to store token in Redis: {str(e)}")
    return False


def _is_token_in_redis(jti: str) -> bool:
    """Check if token JTI exists in Redis"""
    try:
        from app.core.redis import redis_client
        if redis_client:
            return redis_client.exists(f"token:{jti}") > 0
    except Exception as e:
        logger.debug(f"Failed to check token in Redis: {str(e)}")
    # If Redis unavailable, assume valid (don't block requests)
    return True


def revoke_token(jti: str) -> bool:
    """Revoke token by deleting JTI from Redis"""
    try:
        from app.core.redis import redis_client
        if redis_client:
            redis_client.delete(f"token:{jti}")
            logger.info(f"Token revoked: {jti[:8]}...")
            return True
    except Exception as e:
        logger.error(f"Failed to revoke token: {str(e)}")
    return False


def revoke_user_sessions(email: str) -> bool:
    """
    Revoke all sessions for a user by email.
    
    Args:
        email: The user's email address
    
    Returns:
        True if successful, False otherwise
    """
    try:
        from app.core.redis import redis_client
        if redis_client:
            # Get all JTIs for this email across all widgets
            jti_set = redis_client.smembers(f"user_sessions:{email}")
            
            if jti_set:
                # Delete each JTI
                for jti in jti_set:
                    redis_client.delete(f"token:{jti.decode() if isinstance(jti, bytes) else jti}")
                
                # Delete the email mapping
                redis_client.delete(f"user_sessions:{email}")
                
                # Also delete all widget-specific mappings using the reverse index set
                widget_keys_set = f"user_sessions:{email}:widget_keys"
                widget_keys = redis_client.smembers(widget_keys_set)
                if widget_keys:
                    for key in widget_keys:
                        redis_client.delete(key.decode() if isinstance(key, bytes) else key)
                    redis_client.delete(widget_keys_set)
                # NOTE: When creating or deleting widget-specific session keys elsewhere,
                # be sure to add/remove the key from the widget_keys_set for this user.
                
                logger.info(f"Revoked {len(jti_set)} sessions for user: {email}")
                return True
            else:
                logger.info(f"No active sessions found for user: {email}")
                return True
    except Exception as e:
        logger.error(f"Failed to revoke user sessions: {str(e)}")
    return False


def revoke_user_sessions_by_widget(email: str, widget_id: str) -> bool:
    """
    Revoke all sessions for a user in a specific widget.
    
    Args:
        email: The user's email address
        widget_id: The widget ID to revoke sessions for
    
    Returns:
        True if successful, False otherwise
    """
    try:
        from app.core.redis import redis_client
        if redis_client:
            # Get all JTIs for this email in this specific widget
            jti_set = redis_client.smembers(f"user_sessions:{email}:widget:{widget_id}")
            
            if jti_set:
                # Delete each JTI
                for jti in jti_set:
                    jti_str = jti.decode() if isinstance(jti, bytes) else jti
                    redis_client.delete(f"token:{jti_str}")
                    # Also remove from general user_sessions set
                    redis_client.srem(f"user_sessions:{email}", jti_str)
                
                # Delete the widget-specific mapping
                redis_client.delete(f"user_sessions:{email}:widget:{widget_id}")
                
                logger.info(f"Revoked {len(jti_set)} sessions for user: {email} in widget: {widget_id}")
                return True
            else:
                logger.info(f"No active sessions found for user: {email} in widget: {widget_id}")
                return True
    except Exception as e:
        logger.error(f"Failed to revoke user sessions by widget: {str(e)}")
    return False


def get_user_active_sessions(email: str, widget_id: Optional[str] = None) -> list:
    """
    Get all active session JTIs for a user by email.
    
    Args:
        email: The user's email address
        widget_id: Optional widget ID to get sessions only for that widget
    
    Returns:
        List of active JTI strings for the user (filtered by widget if provided)
    """
    try:
        from app.core.redis import redis_client
        if redis_client:
            if widget_id:
                # Get sessions only for this specific widget
                jti_set = redis_client.smembers(f"user_sessions:{email}:widget:{widget_id}")
            else:
                # Get all sessions for this user across all widgets
                jti_set = redis_client.smembers(f"user_sessions:{email}")
            
            return [jti.decode() if isinstance(jti, bytes) else jti for jti in jti_set]
    except Exception as e:
        logger.error(f"Failed to get user sessions: {str(e)}")
    return []


def get_all_active_sessions() -> Dict[str, list]:
    """
    Get all active sessions across all users.
    
    Returns:
        Dictionary with email as key and list of JTI strings as value
    """
    try:
        from app.core.redis import redis_client
        if redis_client:
            # Find all keys matching the user_sessions pattern
            all_sessions = {}
            cursor = 0
            pattern = "user_sessions:*"
            
            while True:
                cursor, keys = redis_client.scan(cursor, match=pattern)
                
                for key in keys:
                    key_str = key.decode() if isinstance(key, bytes) else key
                    # Extract email from key (user_sessions:email@example.com)
                    email = key_str.replace("user_sessions:", "", 1)
                    
                    # Get JTIs for this email
                    jti_set = redis_client.smembers(key_str)
                    jti_list = [jti.decode() if isinstance(jti, bytes) else jti for jti in jti_set]
                    
                    if jti_list:
                        all_sessions[email] = jti_list
                
                if cursor == 0:
                    break
            
            return all_sessions
    except Exception as e:
        logger.error(f"Failed to get all sessions: {str(e)}")
    return {}


def get_existing_valid_token(email: str, widget_id: str, customer_id: str) -> Optional[str]:
    """
    Check if there's an existing valid token for this customer/widget combination.
    
    This prevents token multiplication when the same user refreshes the page multiple times.
    
    Args:
        email: Customer email
        widget_id: Widget ID
        customer_id: Customer ID
    
    Returns:
        The JTI (JWT ID) string of an existing valid token if found, None otherwise
    """
    try:
        from app.core.redis import redis_client
        if not redis_client:
            return None
        
        # Get all active JTIs for this email in this widget
        jti_set = redis_client.smembers(f"user_sessions:{email}:widget:{widget_id}")
        
        if not jti_set:
            logger.debug(f"No existing sessions found for {email} in widget {widget_id}")
            return None
        
        # If we have active tokens, return the first valid one
        # In a typical flow, there should only be one per widget per user
        for jti in jti_set:
            jti_str = jti.decode() if isinstance(jti, bytes) else jti
            # Check if the token still exists in Redis (not revoked)
            if redis_client.exists(f"token:{jti_str}") > 0:
                logger.info(f"Found existing valid token for {email} in widget {widget_id}, reusing it")
                return jti_str
        
        logger.debug(f"Active sessions found for {email} in widget {widget_id}, but none are valid in Redis")
        return None
        
    except Exception as e:
        logger.error(f"Error checking existing tokens: {str(e)}")
        return None


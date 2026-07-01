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

import functools
from fastapi import HTTPException, Request
from app.core.config import settings
from app.core.logger import get_logger
from app.core.redis import get_redis
from typing import Optional, Callable

logger = get_logger(__name__)

class RateLimitConfig:
    """Configuration class for rate limiting settings"""
    
    # Rate limits for instruction generation
    INSTRUCTION_GEN_LIMIT = 10  # requests
    INSTRUCTION_GEN_WINDOW = 86400  # 24 hours in seconds
    INSTRUCTION_GEN_PREFIX = "gen_instruct"
    
    # Add more rate limit configurations here as needed
    # Example:
    # CHAT_MESSAGE_LIMIT = 100
    # CHAT_MESSAGE_WINDOW = 3600  # 1 hour
    # CHAT_MESSAGE_PREFIX = "chat_msg"

def format_time_remaining(seconds: int) -> str:
    """Format remaining time into a human-readable string"""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = seconds % 60
    
    if hours > 0:
        time_msg = f"{hours} hours"
        if minutes > 0:
            time_msg += f" and {minutes} minutes"
    elif minutes > 0:
        time_msg = f"{minutes} minutes"
        if seconds > 0:
            time_msg += f" and {seconds} seconds"
    else:
        time_msg = f"{seconds} seconds"
    
    return time_msg

def check_rate_limit(
    redis_client: Optional[object],
    key: str,
    limit: int,
    window: int
) -> None:
    """
    Check rate limit for a given key
    
    Args:
        redis_client: Redis client instance
        key: Redis key for rate limiting
        limit: Maximum number of requests allowed
        window: Time window in seconds
        
    Raises:
        HTTPException: If rate limit is exceeded
    """
    if not redis_client:
        return
        
    # Get current count
    current = redis_client.get(key)
    
    if current is None:
        # First request, set initial count
        redis_client.setex(key, window, 1)
    else:
        current = int(current)
        if current >= limit:
            # Calculate time until reset
            ttl = redis_client.ttl(key)
            time_msg = format_time_remaining(ttl)
            
            logger.warning(f"Rate limit exceeded for key: {key}")
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. You can try again in {time_msg}."
            )
        
        # Increment counter
        redis_client.incr(key)

def rate_limit(limit: int, window: int, key_prefix: str):
    """
    Rate limiting decorator that uses Redis to track request counts.
    
    Args:
        limit (int): Maximum number of requests allowed within the window
        window (int): Time window in seconds
        key_prefix (str): Prefix for the Redis key (e.g., 'gen_instruct', 'api_call')
    
    Returns:
        function: Decorated function with rate limiting
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            redis_client = get_redis()
            if not settings.REDIS_ENABLED or not redis_client:
                return await func(*args, **kwargs)

            # Get request object from kwargs
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            if not request and 'request' in kwargs:
                request = kwargs['request']

            # Get client IP
            client_ip = request.client.host if request and request.client else "unknown"
            
            # Get organization ID from kwargs
            org_id = kwargs.get('current_user', {}).organization_id
            if not org_id:
                logger.warning("No organization ID found for rate limiting")
                return await func(*args, **kwargs)

            # Create a key specific to this organization and IP
            rate_key = f"{key_prefix}:{org_id}:{client_ip}"
            
            # Check rate limit
            check_rate_limit(redis_client, rate_key, limit, window)

            return await func(*args, **kwargs)
        return wrapper
    return decorator

def limit_instruction_generation(func: Callable):
    """
    Specific rate limiting decorator for instruction generation.
    Limits to 10 requests per day per organization/IP.
    
    Args:
        func: The function to be decorated
        
    Returns:
        function: Decorated function with rate limiting
    """
    return rate_limit(
        limit=RateLimitConfig.INSTRUCTION_GEN_LIMIT,
        window=RateLimitConfig.INSTRUCTION_GEN_WINDOW,
        key_prefix=RateLimitConfig.INSTRUCTION_GEN_PREFIX
    )(func)

# Add more specific rate limiting decorators here as needed
# Example:
# def limit_chat_messages(func: Callable):
#     """Rate limiting decorator for chat messages"""
#     return rate_limit(
#         limit=RateLimitConfig.CHAT_MESSAGE_LIMIT,
#         window=RateLimitConfig.CHAT_MESSAGE_WINDOW,
#         key_prefix=RateLimitConfig.CHAT_MESSAGE_PREFIX
#     )(func) 
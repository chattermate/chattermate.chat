"""
ChatterMate - Rate Limit Utility
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

from fastapi import HTTPException, status, Request
from datetime import datetime, timedelta
import redis
from app.core.config import settings
from app.core.logger import get_logger
from functools import wraps

logger = get_logger(__name__)

# Initialize Redis client
redis_client = redis.from_url(settings.REDIS_URL) if settings.REDIS_ENABLED else None

class RateLimitExceeded(HTTPException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail
        )

def rate_limit(key_prefix: str, max_requests: int, window_seconds: int):
    """
    Rate limiting decorator
    :param key_prefix: Prefix for Redis key
    :param max_requests: Maximum number of requests allowed in the window
    :param window_seconds: Time window in seconds
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if not settings.REDIS_ENABLED or not redis_client:
                logger.warning("Redis not enabled, skipping rate limit check")
                return await func(*args, **kwargs)

            # Get request object from args or kwargs
            request = next((arg for arg in args if isinstance(arg, Request)), 
                         kwargs.get('request'))
            
            if not request:
                logger.error("No request object found for rate limiting")
                return await func(*args, **kwargs)

            # Get client IP
            client_ip = request.client.host
            key = f"{key_prefix}:{client_ip}"

            try:
                # Get current count
                current = redis_client.get(key)
                
                if current is None:
                    # First request, set initial count
                    redis_client.setex(key, window_seconds, 1)
                else:
                    current = int(current)
                    if current >= max_requests:
                        # Calculate time until reset
                        ttl = redis_client.ttl(key)
                        minutes = ttl // 60
                        seconds = ttl % 60
                        time_msg = f"{minutes} minutes" if minutes > 0 else f"{seconds} seconds"
                        
                        raise RateLimitExceeded(
                            f"Too many requests. Please try again in {time_msg}."
                        )
                    
                    # Increment counter
                    redis_client.incr(key)

                return await func(*args, **kwargs)

            except RateLimitExceeded:
                logger.error(f"Rate limit exceeded for {key}")
                raise
            except Exception as e:
                logger.error(f"Rate limit error: {str(e)}")
                # Fail open if Redis is having issues
                return await func(*args, **kwargs)

        return wrapper
    return decorator 
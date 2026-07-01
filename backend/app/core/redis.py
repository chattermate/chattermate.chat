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

import redis
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

redis_client = None

def init_redis():
    """Initialize Redis connection"""
    global redis_client
    
    if not settings.REDIS_ENABLED:
        logger.info("Redis is disabled")
        return None
        
    redis_url = settings.REDIS_URL
    if redis_url and redis_url.startswith("redis://") and ".cache.amazonaws.com" in redis_url:
        redis_url = "rediss://" + redis_url[8:]
        logger.info(f"Using TLS for Redis connection: {redis_url}")

    try:
        redis_client = redis.from_url(
            redis_url,
            socket_timeout=5.0,
            socket_connect_timeout=5.0,
            decode_responses=True  # Automatically decode responses to Python strings
        )
        
        # Test connection immediately
        redis_client.ping()
        logger.info("Redis connection successful")
        return redis_client
    except Exception as e:
        logger.error(f"Failed to initialize Redis client: {str(e)}")
        return None

def get_redis():
    """Get Redis client instance"""
    global redis_client
    
    if not redis_client and settings.REDIS_ENABLED:
        redis_client = init_redis()
    
    return redis_client 
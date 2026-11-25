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

import asyncio
import math
import redis
import functools
from app.core.config import settings
from app.core.logger import get_logger
from app.core.socketio import sio

logger = get_logger(__name__)

# Redis client setup
redis_client = None
logger.info(f"Redis enabled: {settings.REDIS_ENABLED}")
if settings.REDIS_ENABLED:
    redis_url = settings.REDIS_URL
    if redis_url and redis_url.startswith("redis://") and ".cache.amazonaws.com" in redis_url:
        redis_url = "rediss://" + redis_url[8:]
        logger.info(f"Using TLS for Redis connection: {redis_url}")

    try:
        redis_client = redis.from_url(
            redis_url, 
            socket_timeout=5.0, 
            socket_connect_timeout=5.0,
        ) 
        
        # Test connection immediately
        if redis_client:
            logger.info("Testing Redis connection...")
            redis_client.ping()
            logger.info("Redis connection successful")
    except Exception as e:
        logger.error(f"Failed to initialize Redis client: {str(e)}")
        redis_client = None


def rate_window(requests_per_sec):
    """Return (window_seconds, max_requests) for a requests-per-second setting.

    Redis expiry must be a whole number of seconds >= 1. Rates below 1/sec widen the
    window (0.5/sec -> 1 request per 2s); rates of 1/sec or more allow that many
    requests (rounded up) in a 1s window (10/sec -> 10, 1.9/sec -> 2 requests per 1s).
    """
    if not requests_per_sec or requests_per_sec <= 0:
        return 1, 1
    if requests_per_sec < 1:
        return math.ceil(1 / requests_per_sec), 1
    return 1, math.ceil(requests_per_sec)


# Atomic fixed-window counter: INCR, and (re)apply the expiry when the key is new or has
# lost its TTL, so a key can never outlive its window and block a visitor forever.
_HIT_COUNTER_LUA = """
local count = redis.call('INCR', KEYS[1])
if count == 1 or redis.call('TTL', KEYS[1]) < 0 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return count
"""


def hit_counter(key, window_seconds):
    """Count one request against `key` for `window_seconds` and return the new count."""
    return int(redis_client.eval(_HIT_COUNTER_LUA, 1, key, window_seconds))


def seconds_phrase(seconds):
    """'1 second' / '5 seconds', so the visitor never reads '1 seconds'."""
    return f"{seconds} second" if seconds == 1 else f"{seconds} seconds"


def socket_rate_limit(namespace='/widget', read_only=False):
    """
    Socket rate limiting decorator for socketio event handlers
    
    This decorator checks if rate limiting is enabled for the agent associated with the session
    and applies rate limiting based on the agent's configuration.
    
    Rate limiting is implemented with two strategies:
    1. Daily limit: Maximum number of requests allowed per IP address per day (overall_limit_per_ip)
    2. Rate limit: Maximum requests per second (requests_per_sec)
    
    :param namespace: The socketio namespace to use (default: '/widget')
    :param read_only: Read-only events (history, state lookups) skip the per-second counter so
        they don't use up the budget for chat messages; the daily per-IP limit still applies.
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(sid, *args, **kwargs):
            try:
                
                # Get session data
                session = await sio.get_session(sid, namespace=namespace)
                
                # Check if rate limiting is enabled for this agent
                if not session.get('enable_rate_limiting', False) or not settings.REDIS_ENABLED or not redis_client:
                    # Rate limiting not enabled, proceed with the handler
                    logger.info(f"Rate limiting not enabled, proceeding with the handler")
                    return await func(sid, *args, **kwargs)
                
                # Get rate limiting parameters from session
                overall_limit = session.get('overall_limit_per_ip', 100)
                requests_per_sec = session.get('requests_per_sec', 1.0)
                
                # Get client IP from socket request with load balancer support
                environ = sio.get_environ(sid, namespace=namespace)
                
                # Try different headers that might contain the real client IP
                client_ip = None
                
                # Check X-Forwarded-For first
                forwarded_for = environ.get('HTTP_X_FORWARDED_FOR')
                if forwarded_for:
                    # Get the first IP in the chain (original client)
                    client_ip = forwarded_for.split(',')[0].strip()
                
                # If no X-Forwarded-For, try other headers
                if not client_ip:
                    client_ip = (
                        environ.get('HTTP_X_REAL_IP') or
                        environ.get('HTTP_CF_CONNECTING_IP') or
                        environ.get('HTTP_X_CLIENT_IP') or
                        environ.get('REMOTE_ADDR', 'unknown')
                    )
                
                logger.debug(f"Detected client IP: {client_ip}")
                
                # Skip rate limiting for localhost
                if client_ip in ["127.0.0.1", "localhost", "::1"]:
                    logger.info(f"Skipping rate limit for localhost: {client_ip}")
                    return await func(sid, *args, **kwargs)
                
                # Create a key specific to this agent and IP
                agent_id = session.get('agent_id', 'unknown')
                
                try:
                    # Get current count with timeout
                    loop = asyncio.get_event_loop()
                    
                    # Check overall limit (total requests per IP)
                    overall_key = f"overall:{agent_id}:{client_ip}"
                    overall_current = await asyncio.wait_for(
                        loop.run_in_executor(None, redis_client.get, overall_key),
                        timeout=5.0
                    )
                    
                    
                    # Set window to 24 hours (86400 seconds) for overall limit - reset daily
                    overall_window = 86400
                    
                    if overall_current is None:
                        # First request, set initial count
                        await asyncio.wait_for(
                            loop.run_in_executor(None, redis_client.setex, overall_key, overall_window, 1),
                            timeout=5.0
                        )
                    else:
                        overall_current = int(overall_current)
                        if overall_current >= overall_limit:
                            # Calculate time until reset
                            ttl = await asyncio.wait_for(
                                loop.run_in_executor(None, redis_client.ttl, overall_key),
                                timeout=5.0
                            )
                            hours = ttl // 3600
                            minutes = (ttl % 3600) // 60
                            seconds = ttl % 60
                            
                            # Format a more user-friendly time message
                            if hours > 0:
                                time_msg = f"{hours} hours"
                                if minutes > 0:
                                    time_msg += f" and {minutes} minutes"
                            elif minutes > 0:
                                time_msg = f"{minutes} minutes"
                                if seconds > 0 and minutes < 5:  # Only show seconds for short waits
                                    time_msg += f" and {seconds} seconds"
                            else:
                                time_msg = seconds_phrase(seconds)
                            
                            logger.warning(f"Rate limit exceeded for {client_ip} - daily limit of {overall_limit} requests")
                            await sio.emit('error', {
                                'error': f"Daily request limit reached. Please try again in {time_msg}.",
                                'type': 'rate_limit_error'
                            }, to=sid, namespace=namespace)
                            return None
                        
                        # Increment counter
                        await asyncio.wait_for(
                            loop.run_in_executor(None, redis_client.incr, overall_key),
                            timeout=5.0
                        )
                    
                    # Check rate limit (requests per second)
                    if not read_only:
                        window_seconds, max_requests = rate_window(requests_per_sec)
                        rate_key = f"rate:{agent_id}:{client_ip}"
                    
                        rate_count = await asyncio.wait_for(
                            loop.run_in_executor(None, hit_counter, rate_key, window_seconds),
                            timeout=5.0
                        )

                        if rate_count > max_requests:
                            ttl = await asyncio.wait_for(
                                loop.run_in_executor(None, redis_client.ttl, rate_key),
                                timeout=5.0
                            )
                            ttl = max(ttl, 1)

                            logger.warning(f"Rate limit exceeded for {client_ip} - frequency limit of {requests_per_sec} req/sec")
                            await sio.emit('error', {
                                'error': f"You're sending messages too quickly. Please wait {seconds_phrase(ttl)} before sending another message.",
                                'type': 'rate_limit_error'
                            }, to=sid, namespace=namespace)
                            return None
                
                except asyncio.TimeoutError:
                    logger.error("Redis operation timed out; rate limit failing open")
                except (redis.ConnectionError, redis.TimeoutError) as e:
                    logger.error(f"Redis operation error; rate limit failing open: {str(e)}")
                except Exception as e:
                    logger.error(f"Unexpected error in rate limit; failing open: {str(e)}", exc_info=True)
                
                # If we get here, rate limiting passed or was skipped
                return await func(sid, *args, **kwargs)
            
            except Exception as e:
                logger.error(f"Error in socket_rate_limit decorator: {str(e)}", exc_info=True)
                # Fall back to calling the original function
                return await func(sid, *args, **kwargs)
        
        return wrapper
    
    return decorator 
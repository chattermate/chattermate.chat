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


def socket_rate_limit(namespace='/widget'):
    """
    Socket rate limiting decorator for socketio event handlers
    
    This decorator checks if rate limiting is enabled for the agent associated with the session
    and applies rate limiting based on the agent's configuration.
    
    Rate limiting is implemented with two strategies:
    1. Daily limit: Maximum number of requests allowed per IP address per day (overall_limit_per_ip)
    2. Rate limit: Maximum requests per second (requests_per_sec)
    
    :param namespace: The socketio namespace to use (default: '/widget')
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
                                time_msg = f"{seconds} seconds"
                            
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
                    # Convert to window in seconds (e.g., 1 req/sec = 1 req per 1 second window)
                    rate_window = int(1 / requests_per_sec) if requests_per_sec > 0 else 1
                    rate_key = f"rate:{agent_id}:{client_ip}"
                    
                    rate_current = await asyncio.wait_for(
                        loop.run_in_executor(None, redis_client.get, rate_key),
                        timeout=5.0
                    )
                    

                    if rate_current is None:
                        # First request, set initial count
                        await asyncio.wait_for(
                            loop.run_in_executor(None, redis_client.setex, rate_key, rate_window, 1),
                            timeout=5.0
                        )
                    else:
                        rate_current = int(rate_current)
                        if rate_current >= 1:  # Only 1 request allowed per rate window
                            # Calculate time until reset
                            ttl = await asyncio.wait_for(
                                loop.run_in_executor(None, redis_client.ttl, rate_key),
                                timeout=5.0
                            )
                            
                            logger.warning(f"Rate limit exceeded for {client_ip} - frequency limit of {requests_per_sec} req/sec")
                            await sio.emit('error', {
                                'error': f"You're sending messages too quickly. Please wait {ttl} seconds before sending another message.",
                                'type': 'rate_limit_error'
                            }, to=sid, namespace=namespace)
                            return None
                        
                        # Increment counter
                        await asyncio.wait_for(
                            loop.run_in_executor(None, redis_client.incr, rate_key),
                            timeout=5.0
                        )
                
                except asyncio.TimeoutError:
                    logger.error("Redis operation timed out")
                except (redis.ConnectionError, redis.TimeoutError) as e:
                    logger.error(f"Redis operation error: {str(e)}")
                except Exception as e:
                    logger.error(f"Unexpected error in rate limit: {str(e)}", exc_info=True)
                
                # If we get here, rate limiting passed or was skipped
                return await func(sid, *args, **kwargs)
            
            except Exception as e:
                logger.error(f"Error in socket_rate_limit decorator: {str(e)}", exc_info=True)
                # Fall back to calling the original function
                return await func(sid, *args, **kwargs)
        
        return wrapper
    
    return decorator 
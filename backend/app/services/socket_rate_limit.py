"""
ChatterMate - Socket Rate Limit Middleware
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

import asyncio
import redis
import functools
from app.core.config import settings
from app.core.logger import get_logger
from app.core.socketio import sio

logger = get_logger(__name__)

# Redis client setup
redis_client = None
if settings.REDIS_ENABLED:
    try:
        redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD,
            decode_responses=True
        )
        logger.info("Redis client initialized for rate limiting")
    except Exception as e:
        logger.error(f"Failed to initialize Redis client: {str(e)}")
        redis_client = None

async def check_redis_connection():
    """Check if Redis connection is working"""
    if not redis_client:
        return False
    
    try:
        loop = asyncio.get_event_loop()
        result = await asyncio.wait_for(
            loop.run_in_executor(None, redis_client.ping),
            timeout=5.0
        )
        return result
    except (redis.ConnectionError, redis.TimeoutError, asyncio.TimeoutError):
        logger.warning("Redis connection check failed")
        return False
    except Exception as e:
        logger.error(f"Unexpected error checking Redis connection: {str(e)}")
        return False

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
                    return await func(sid, *args, **kwargs)
                
                # Get rate limiting parameters from session
                overall_limit = session.get('overall_limit_per_ip', 100)
                requests_per_sec = session.get('requests_per_sec', 1.0)
                
                # Get client IP from socket request
                environ = sio.get_environ(sid, namespace=namespace)
                client_ip = environ.get('REMOTE_ADDR', 'unknown')
                
                # Skip rate limiting for localhost
                if client_ip == "127.0.0.1" or client_ip == "localhost":
                    logger.info(f"Skipping rate limit for localhost: {client_ip}")
                    return await func(sid, *args, **kwargs)
                
                # Create a key specific to this agent and IP
                agent_id = session.get('agent_id', 'unknown')
                key_prefix = f"agent:{agent_id}"
                
                # Check Redis connection
                is_connected = await check_redis_connection()
                if not is_connected:
                    logger.warning("Redis connection failed, skipping rate limit check")
                    return await func(sid, *args, **kwargs)
                
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
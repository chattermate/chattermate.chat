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

import pytest
import redis
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.socket_rate_limit import socket_rate_limit
from app.core.config import settings
from app.core.socketio import sio

# Test constants
TEST_SID = "test_session_id"
TEST_NAMESPACE = "/widget"
TEST_IP = "192.168.1.1"
TEST_AGENT_ID = "test_agent_123"

@pytest.fixture
def mock_redis():
    with patch('app.services.socket_rate_limit.redis_client') as mock_client:
        # Setup Redis mock to work with asyncio.wait_for
        mock_client.get = MagicMock()
        mock_client.setex = MagicMock()
        mock_client.incr = MagicMock()
        mock_client.ttl = MagicMock()
        yield mock_client

@pytest.fixture
def mock_sio():
    with patch('app.services.socket_rate_limit.sio') as mock_sio:
        # Setup session data
        mock_sio.get_session = AsyncMock(return_value={
            'enable_rate_limiting': True,
            'overall_limit_per_ip': 100,
            'requests_per_sec': 1.0,
            'agent_id': TEST_AGENT_ID
        })
        # Setup environment data with load balancer headers
        mock_sio.get_environ.return_value = {
            'REMOTE_ADDR': '10.0.0.1',  # Load balancer IP
            'HTTP_X_FORWARDED_FOR': f'{TEST_IP}, 10.0.0.1'  # Original client IP, load balancer IP
        }
        # Make emit async
        mock_sio.emit = AsyncMock()
        yield mock_sio

@pytest.mark.asyncio
async def test_socket_rate_limit_disabled():
    """Test when rate limiting is disabled"""
    # Create a mock handler function
    mock_handler = AsyncMock()
    
    # Create a mock session without rate limiting
    mock_session = {
        'enable_rate_limiting': False
    }
    
    # Mock sio.get_session
    with patch('app.services.socket_rate_limit.sio.get_session', AsyncMock(return_value=mock_session)):
        # Apply the decorator
        decorated_handler = socket_rate_limit()(mock_handler)
        
        # Call the decorated handler
        await decorated_handler('test_sid', 'test_arg')
        
        # Verify the handler was called
        mock_handler.assert_called_once_with('test_sid', 'test_arg')

@pytest.mark.asyncio
async def test_socket_rate_limit_redis_disabled():
    """Test when Redis is disabled"""
    # Create a mock handler function
    mock_handler = AsyncMock()
    
    # Create a mock session with rate limiting
    mock_session = {
        'enable_rate_limiting': True,
        'overall_limit_per_ip': 100,
        'requests_per_sec': 1.0,
        'agent_id': TEST_AGENT_ID
    }
    
    with patch('app.services.socket_rate_limit.settings.REDIS_ENABLED', False), \
         patch('app.services.socket_rate_limit.sio.get_session', AsyncMock(return_value=mock_session)):
        # Apply the decorator
        decorated_handler = socket_rate_limit()(mock_handler)
        
        # Call the decorated handler
        await decorated_handler('test_sid', 'test_arg')
        
        # Verify the handler was called
        mock_handler.assert_called_once_with('test_sid', 'test_arg')

@pytest.mark.asyncio
async def test_socket_rate_limit_with_forwarded_ip(mock_redis):
    """Test rate limiting with X-Forwarded-For header"""
    # Create a mock handler function
    mock_handler = AsyncMock()
    
    # Create a mock session with rate limiting
    mock_session = {
        'enable_rate_limiting': True,
        'overall_limit_per_ip': 100,
        'requests_per_sec': 1.0,
        'agent_id': TEST_AGENT_ID
    }
    
    # Mock environment with X-Forwarded-For
    mock_environ = {
        'HTTP_X_FORWARDED_FOR': '192.168.1.1, 10.0.0.1'
    }
    
    # Configure Redis mock
    mock_redis.get.return_value = None  # No previous requests
    mock_redis.setex.return_value = True
    mock_redis.incr.return_value = 1  # First request
    mock_redis.expire.return_value = True
    
    # Mock asyncio.wait_for to return Redis results directly
    async def mock_wait_for(coro, timeout):
        if isinstance(coro, asyncio.Future):
            return await coro
        return coro
    
    with patch('app.services.socket_rate_limit.settings.REDIS_ENABLED', True), \
         patch('app.services.socket_rate_limit.sio.get_session', AsyncMock(return_value=mock_session)), \
         patch('app.services.socket_rate_limit.sio.get_environ', return_value=mock_environ), \
         patch('asyncio.wait_for', side_effect=mock_wait_for):
        # Apply the decorator
        decorated_handler = socket_rate_limit()(mock_handler)
        
        # Call the decorated handler
        await decorated_handler('test_sid', 'test_arg')
        
        # Verify the handler was called
        mock_handler.assert_called_once_with('test_sid', 'test_arg')
        
        # Verify Redis interactions
        assert mock_redis.get.call_count >= 2  # Called for both overall and rate limits
        assert mock_redis.setex.call_count >= 2  # Called for both overall and rate limits

@pytest.mark.asyncio
async def test_socket_rate_limit_exceeded(mock_redis):
    """Test when rate limit is exceeded"""
    # Create a mock handler function
    mock_handler = AsyncMock()
    
    # Create a mock session with rate limiting
    mock_session = {
        'enable_rate_limiting': True,
        'overall_limit_per_ip': 100,
        'requests_per_sec': 1.0,
        'agent_id': TEST_AGENT_ID
    }
    
    # Mock environment
    mock_environ = {
        'REMOTE_ADDR': '192.168.1.1'
    }
    
    # Configure Redis mock to simulate exceeded limit
    mock_redis.get.return_value = b'101'  # Over the limit
    mock_redis.ttl.return_value = 3600  # 1 hour remaining
    
    # Mock asyncio.wait_for to return Redis results directly
    async def mock_wait_for(coro, timeout):
        if isinstance(coro, asyncio.Future):
            return await coro
        return coro
    
    # Mock sio.emit to capture error messages
    mock_emit = AsyncMock()
    
    with patch('app.services.socket_rate_limit.settings.REDIS_ENABLED', True), \
         patch('app.services.socket_rate_limit.sio.get_session', AsyncMock(return_value=mock_session)), \
         patch('app.services.socket_rate_limit.sio.get_environ', return_value=mock_environ), \
         patch('app.services.socket_rate_limit.sio.emit', mock_emit), \
         patch('asyncio.wait_for', side_effect=mock_wait_for):
        # Apply the decorator
        decorated_handler = socket_rate_limit()(mock_handler)
        
        # Call the decorated handler
        result = await decorated_handler('test_sid', 'test_arg')
        
        # Verify the handler was not called
        mock_handler.assert_not_called()
        
        # Verify error was emitted
        mock_emit.assert_called_once()
        args = mock_emit.call_args[0]
        assert args[0] == 'error'
        assert 'Daily request limit reached' in args[1]['error']
        assert result is None

@pytest.mark.asyncio
async def test_socket_rate_limit_with_real_ip(mock_redis):
    """Test rate limiting with X-Real-IP header"""
    # Create a mock handler function
    mock_handler = AsyncMock()
    
    # Create a mock session with rate limiting
    mock_session = {
        'enable_rate_limiting': True,
        'overall_limit_per_ip': 100,
        'requests_per_sec': 1.0,
        'agent_id': TEST_AGENT_ID
    }
    
    # Mock environment with X-Real-IP
    mock_environ = {
        'HTTP_X_REAL_IP': '192.168.1.1'
    }
    
    # Configure Redis mock
    mock_redis.get.return_value = None  # No previous requests
    mock_redis.setex.return_value = True
    mock_redis.incr.return_value = 1  # First request
    mock_redis.expire.return_value = True
    
    # Mock asyncio.wait_for to return Redis results directly
    async def mock_wait_for(coro, timeout):
        if isinstance(coro, asyncio.Future):
            return await coro
        return coro
    
    with patch('app.services.socket_rate_limit.settings.REDIS_ENABLED', True), \
         patch('app.services.socket_rate_limit.sio.get_session', AsyncMock(return_value=mock_session)), \
         patch('app.services.socket_rate_limit.sio.get_environ', return_value=mock_environ), \
         patch('asyncio.wait_for', side_effect=mock_wait_for):
        # Apply the decorator
        decorated_handler = socket_rate_limit()(mock_handler)
        
        # Call the decorated handler
        await decorated_handler('test_sid', 'test_arg')
        
        # Verify the handler was called
        mock_handler.assert_called_once_with('test_sid', 'test_arg')
        
        # Verify Redis interactions
        assert mock_redis.get.call_count >= 2  # Called for both overall and rate limits
        assert mock_redis.setex.call_count >= 2  # Called for both overall and rate limits

@pytest.mark.asyncio
async def test_socket_rate_limit_redis_error(mock_redis):
    """Test handling of Redis errors"""
    # Create a mock handler function
    mock_handler = AsyncMock()
    
    # Create a mock session with rate limiting
    mock_session = {
        'enable_rate_limiting': True,
        'overall_limit_per_ip': 100,
        'requests_per_sec': 1.0,
        'agent_id': TEST_AGENT_ID
    }
    
    # Mock environment
    mock_environ = {
        'REMOTE_ADDR': '192.168.1.1'
    }
    
    # Configure Redis mock to raise an error
    mock_redis.get.side_effect = redis.RedisError("Connection error")
    
    with patch('app.services.socket_rate_limit.settings.REDIS_ENABLED', True), \
         patch('app.services.socket_rate_limit.sio.get_session', AsyncMock(return_value=mock_session)), \
         patch('app.services.socket_rate_limit.sio.get_environ', return_value=mock_environ):
        # Apply the decorator
        decorated_handler = socket_rate_limit()(mock_handler)
        
        # Call the decorated handler
        await decorated_handler('test_sid', 'test_arg')
        
        # Verify the handler was called (should proceed on Redis error)
        mock_handler.assert_called_once_with('test_sid', 'test_arg')

@pytest.mark.asyncio
async def test_localhost_bypass(mock_redis):
    """Test that localhost requests bypass rate limiting"""
    # Test different localhost variations and headers
    test_cases = [
        # (header_name, is_list, localhost_ip)
        ('HTTP_X_FORWARDED_FOR', True, '127.0.0.1'),
        ('HTTP_X_FORWARDED_FOR', True, 'localhost'),
        ('HTTP_X_FORWARDED_FOR', True, '::1'),
        ('HTTP_X_REAL_IP', False, '127.0.0.1'),
        ('HTTP_X_REAL_IP', False, 'localhost'),
        ('HTTP_CF_CONNECTING_IP', False, '127.0.0.1'),
        ('REMOTE_ADDR', False, '127.0.0.1')
    ]
    
    mock_session = {
        'enable_rate_limiting': True,
        'overall_limit_per_ip': 100,
        'requests_per_sec': 1.0,
        'agent_id': TEST_AGENT_ID
    }
    
    for header, is_list, ip in test_cases:
        # Setup environment data
        environ = {'REMOTE_ADDR': '10.0.0.1'}  # Default remote addr
        if is_list:
            environ[header] = f"{ip}, 10.0.0.1"  # Add load balancer IP
        else:
            environ[header] = ip
        
        # Create and decorate handler
        mock_handler = AsyncMock()
        decorated_handler = socket_rate_limit()(mock_handler)
        
        with patch('app.services.socket_rate_limit.settings.REDIS_ENABLED', True), \
             patch('app.services.socket_rate_limit.sio.get_session', AsyncMock(return_value=mock_session)), \
             patch('app.services.socket_rate_limit.sio.get_environ', return_value=environ):
            # Call handler
            await decorated_handler(TEST_SID)
            
            # Verify handler was called without checking Redis
            mock_handler.assert_called_once_with(TEST_SID)
            mock_redis.get.assert_not_called()
            mock_redis.setex.assert_not_called()
            
            # Reset mocks for next iteration
            mock_handler.reset_mock()
            mock_redis.get.reset_mock()
            mock_redis.setex.reset_mock()

@pytest.mark.asyncio
async def test_redis_timeout(mock_redis):
    """Test behavior when Redis operations timeout"""
    # Create a mock handler function
    mock_handler = AsyncMock()
    
    # Create a mock session with rate limiting
    mock_session = {
        'enable_rate_limiting': True,
        'overall_limit_per_ip': 100,
        'requests_per_sec': 1.0,
        'agent_id': TEST_AGENT_ID
    }
    
    # Mock environment
    mock_environ = {
        'REMOTE_ADDR': '192.168.1.1'
    }
    
    # Configure Redis mock to timeout
    mock_redis.get.side_effect = asyncio.TimeoutError()
    
    # Mock asyncio.wait_for to raise TimeoutError
    async def mock_wait_for(coro, timeout):
        raise asyncio.TimeoutError()
    
    with patch('app.services.socket_rate_limit.settings.REDIS_ENABLED', True), \
         patch('app.services.socket_rate_limit.sio.get_session', AsyncMock(return_value=mock_session)), \
         patch('app.services.socket_rate_limit.sio.get_environ', return_value=mock_environ), \
         patch('asyncio.wait_for', side_effect=mock_wait_for):
        # Apply the decorator
        decorated_handler = socket_rate_limit()(mock_handler)
        
        # Call the decorated handler
        await decorated_handler('test_sid', 'test_arg')
        
        # Verify handler was called despite timeout
        mock_handler.assert_called_once_with('test_sid', 'test_arg')

@pytest.mark.asyncio
async def test_rate_limit_per_second_exceeded(mock_redis):
    """Test when rate limit per second is exceeded"""
    # Create a mock handler function
    mock_handler = AsyncMock()
    
    # Create a mock session with rate limiting
    mock_session = {
        'enable_rate_limiting': True,
        'overall_limit_per_ip': 100,
        'requests_per_sec': 1.0,
        'agent_id': TEST_AGENT_ID
    }
    
    # Mock environment
    mock_environ = {
        'REMOTE_ADDR': '192.168.1.1'
    }
    
    # Configure Redis mock for rate limit check
    mock_redis.get.side_effect = [b'50', b'1']  # Under overall limit but over rate limit
    mock_redis.ttl.return_value = 1  # 1 second remaining
    
    # Mock sio.emit to capture error messages
    mock_emit = AsyncMock()
    
    # Mock asyncio.wait_for to return Redis results directly
    async def mock_wait_for(coro, timeout):
        if isinstance(coro, asyncio.Future):
            return await coro
        return coro
    
    with patch('app.services.socket_rate_limit.settings.REDIS_ENABLED', True), \
         patch('app.services.socket_rate_limit.sio.get_session', AsyncMock(return_value=mock_session)), \
         patch('app.services.socket_rate_limit.sio.get_environ', return_value=mock_environ), \
         patch('app.services.socket_rate_limit.sio.emit', mock_emit), \
         patch('asyncio.wait_for', side_effect=mock_wait_for):
        # Apply the decorator
        decorated_handler = socket_rate_limit()(mock_handler)
        
        # Call the decorated handler
        result = await decorated_handler('test_sid', 'test_arg')
        
        # Verify the handler was not called
        mock_handler.assert_not_called()
        
        # Verify error was emitted
        mock_emit.assert_called_once()
        args = mock_emit.call_args[0]
        assert args[0] == 'error'
        assert 'You\'re sending messages too quickly' in args[1]['error']
        assert result is None 
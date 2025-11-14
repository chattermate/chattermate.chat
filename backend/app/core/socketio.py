"""
ChatterMate - Socketio
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

import socketio
from socketio import AsyncServer
from app.core.config import settings
from app.core.logger import get_logger
from app.core.cors import get_cors_origins

logger = get_logger(__name__)

# Initialize Socket.IO server with basic config
sio: AsyncServer = socketio.AsyncServer(
    async_mode='asgi',
    logger=True,
    engineio_logger=True,
    async_handlers=True,
    ping_timeout=60,
    ping_interval=25,
    max_http_buffer_size=15 * 1024 * 1024,  # 15MB to handle base64-encoded files (5MB image = ~6.7MB base64)
    cors_allowed_origins=list(get_cors_origins())  # Use the same CORS origins as FastAPI
)

# Create ASGI app
socket_app = socketio.ASGIApp(
    socketio_server=sio,
    socketio_path='socket.io'
)

def configure_socketio(cors_origins=None):
    """Configure Socket.IO with CORS origins and Redis if enabled"""
    if cors_origins:
        # Convert set to list if needed and ensure all origins are strings
        cors_list = list(cors_origins) if isinstance(cors_origins, (set, list)) else [cors_origins]
        
        # Set CORS origins for Socket.IO
        sio.eio.cors_allowed_origins = cors_list

    if settings.REDIS_ENABLED:
        # Use rediss:// protocol if TLS is needed (ElastiCache)
        redis_url = settings.REDIS_URL
        if redis_url and redis_url.startswith("redis://") and ".cache.amazonaws.com" in redis_url:
            redis_url = "rediss://" + redis_url[8:]
            logger.info(f"Using TLS for Redis connection: {redis_url}")
        
        logger.info(f"Redis URL: {redis_url}")
        
        try:
            # Configure Redis manager with appropriate options
            sio.client_manager = socketio.AsyncRedisManager(
                redis_url,
                write_only=False,
                channel='chattermate',
                redis_options={
                    'retry_on_timeout': True,
                    'health_check_interval': 30,
                    'socket_timeout': 5.0,
                    'socket_connect_timeout': 5.0,
                    'ssl_cert_reqs': None  # Don't verify certificate for ElastiCache
                }
            )
            logger.info("Redis manager configured successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Redis manager: {str(e)}") 
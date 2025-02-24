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
        logger.info(f"Redis URL: {settings.REDIS_URL}")
        sio.client_manager = socketio.AsyncRedisManager(
            settings.REDIS_URL,
            write_only=False,
            channel='chattermate',
            redis_options={
                'retry_on_timeout': True,
                'health_check_interval': 30,
            }
        ) 
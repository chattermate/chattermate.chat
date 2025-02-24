"""
ChatterMate - Main Application
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

# Add users import
from fastapi.staticfiles import StaticFiles
import socketio
from app.api import chat, organizations, users, ai_setup, knowledge, agent, notification, widget, widget_chat, user_groups, roles, analytics
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.services.firebase import initialize_firebase
from app.database import engine, Base
import asyncio
from app.core.logger import get_logger
from contextlib import asynccontextmanager
import os
from app.core.socketio import socket_app, configure_socketio, sio
from app.core.cors import get_cors_origins
from app.core.application import app

# Import models to ensure they're registered with SQLAlchemy
from app.models import Organization, User, Customer
try:
    from app.enterprise.models import OTP
except ImportError:
    print("Enterprise models not available")
from app.api import session_to_agent

logger = get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    initialize_firebase()
    await startup_event()
    yield
    # Shutdown
    pass

# Move the CORS setup before app instantiation
cors_origins = get_cors_origins()
logger.debug(f"CORS origins: {cors_origins}")

# Add CORS middleware to FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Configure Socket.IO on startup"""
    configure_socketio(cors_origins)

# Include routers
app.include_router(
    chat.router,
    prefix=f"{settings.API_V1_STR}/chats",
    tags=["chats"]
)

# Try to import enterprise module if available
try:
    from app.enterprise import router as enterprise_router
    app.include_router(enterprise_router, prefix=f"{settings.API_V1_STR}/enterprise", tags=["enterprise"])
except ImportError as e:
    logger.info("Enterprise module not available - running in community edition mode")
    logger.debug(f"Import error: {e}")

app.include_router(
    organizations.router,
    prefix=f"{settings.API_V1_STR}/organizations",
    tags=["organizations"]
)

app.include_router(
    users.router,
    prefix=f"{settings.API_V1_STR}/users",
    tags=["users"]
)

app.include_router(
    knowledge.router,
    prefix=f"{settings.API_V1_STR}/knowledge",
    tags=["knowledge"]
)

app.include_router(
    ai_setup.router,
    prefix=f"{settings.API_V1_STR}/ai",
    tags=["ai"]
)

app.include_router(
    agent.router,
    prefix=f"{settings.API_V1_STR}/agent",
    tags=["agent"]
)

app.include_router(
    notification.router,
    prefix=f"{settings.API_V1_STR}/notifications",
    tags=["notification"]
)

app.include_router(
    widget.router,
    prefix=f"{settings.API_V1_STR}/widgets",
    tags=["widget"]
)

app.include_router(
    user_groups.router,
    prefix=f"{settings.API_V1_STR}/groups",
    tags=["groups"]
)

app.include_router(
    roles.router,
    prefix=f"{settings.API_V1_STR}/roles",
    tags=["roles"]
)

app.include_router(
    session_to_agent.router,
    prefix=f"{settings.API_V1_STR}/sessions",
    tags=["session_to_agent"]
)

app.include_router(
    analytics.router,
    prefix=f"{settings.API_V1_STR}/analytics",
    tags=["analytics"]
)

@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "description": "Welcome to ChatterMate API"
    }

@app.api_route("/health", methods=["GET"], operation_id="get_health_check")
async def get_health_check():
    return {
        "status": "healthy",
        "version": settings.VERSION
    }

@app.api_route("/health", methods=["HEAD"], operation_id="head_health_check")
async def head_health_check():
    return {
        "status": "healthy",
        "version": settings.VERSION
    }

# Create upload directories if they don't exist
if not os.path.exists("uploads"):
    os.makedirs("uploads")
if not os.path.exists("uploads/agents"):
    os.makedirs("uploads/agents")

# Mount static files
app.mount("/api/v1/uploads", StaticFiles(directory="uploads"), name="uploads")

# Create final ASGI app
app = socketio.ASGIApp(sio, app)

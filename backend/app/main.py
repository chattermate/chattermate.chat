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

# Set environment variable to prevent tokenizer deadlock warnings
import os
os.environ.setdefault('TOKENIZERS_PARALLELISM', 'false')

# Add users import
from fastapi.staticfiles import StaticFiles
import socketio
from app.api import chat, organizations, users, ai_setup, knowledge, agent, notification, widget, widget_apps, user_groups, roles, analytics, jira, shopify, workflow, workflow_node, mcp_tool, file_upload, token, lead_capture, people, tickets
from app.api import help_center as help_center_api
from app.api import channels as channels_api
from app.api import webhooks as channel_webhooks
# Import widget_chat to register socket.io event handlers for /widget namespace
from app.api import widget_chat  # noqa: F401 - imported for side effects (socket.io handlers registration)
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
from app.core.cors import get_cors_origins, get_cors_origin_regex
from app.core.application import app, initialize_cors_listener

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

# Update the FastAPI app to use the lifespan function
app.router.lifespan_context = lifespan

# Add CORS middleware to FastAPI app. The regex covers every help-center
# subdomain (*.chattermate.help) so a newly-created slug is allowed without a
# cache refresh; explicit origins still cover org domains + custom domains.
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(cors_origins),
    allow_origin_regex=get_cors_origin_regex(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Configure Socket.IO on startup"""
    configure_socketio(cors_origins)
    
    # Start CORS listener for multi-worker synchronization
    initialize_cors_listener()
    
    # Start chat auto-closer background task, AI chat will auto close after 1 day
    from app.workers.chat_auto_closer import run_auto_closer_loop
    asyncio.create_task(run_auto_closer_loop())

# Include routers
app.include_router(
    chat.router,
    prefix=f"{settings.API_V1_STR}/chats",
    tags=["chats"]
)

app.include_router(
    channels_api.router,
    prefix=f"{settings.API_V1_STR}/channels",
    tags=["channels"]
)

app.include_router(
    tickets.router,
    prefix=f"{settings.API_V1_STR}/tickets",
    tags=["tickets"]
)

from app.api import ticket_db_connectors, ticket_webhooks
app.include_router(
    ticket_db_connectors.router,
    prefix=f"{settings.API_V1_STR}/ticket-db-connectors",
    tags=["tickets"]
)

app.include_router(
    ticket_webhooks.router,
    prefix=f"{settings.API_V1_STR}/tickets/webhooks",
    tags=["tickets"]
)

app.include_router(
    channel_webhooks.router,
    prefix=f"{settings.API_V1_STR}/webhooks",
    tags=["webhooks"]
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
    help_center_api.router,
    prefix=f"{settings.API_V1_STR}/help-center",
    tags=["help-center"]
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
    lead_capture.router,
    prefix=f"{settings.API_V1_STR}/agent",
    tags=["lead-capture"]
)

app.include_router(
    people.router,
    prefix=f"{settings.API_V1_STR}/people",
    tags=["people"]
)

app.include_router(
    mcp_tool.router,
    prefix=f"{settings.API_V1_STR}/mcp-tools",
    tags=["mcp-tools"]
)

# Proxy router moved to enterprise module

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

app.include_router(
    jira.router,
    prefix=f"{settings.API_V1_STR}/jira",
    tags=["jira"]
)

app.include_router(
    token.router,
    prefix=f"{settings.API_V1_STR}",
    tags=["token"]
)

app.include_router(
    widget_apps.router,
    prefix=f"{settings.API_V1_STR}/widget-apps",
    tags=["widget-apps"]
)

app.include_router(
    shopify.router,
    prefix=f"{settings.API_V1_STR}/shopify",
    tags=["shopify"]
)

app.include_router(
    workflow.router,
    prefix=f"{settings.API_V1_STR}/workflow",
    tags=["workflow"]
)

app.include_router(
    workflow_node.router,
    prefix=f"{settings.API_V1_STR}/workflow",
    tags=["workflow_node"]
)

app.include_router(
    file_upload.router,
    prefix=f"{settings.API_V1_STR}/files",
    tags=["files"]
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


@app.get("/health/help-center-domain", include_in_schema=False, operation_id="help_center_domain_tls_check")
async def help_center_domain_tls_check(domain: str = ""):
    """On-demand-TLS "ask" gate for the edge proxy (e.g. Caddy).

    Returns 200 only when ``domain`` is a help-center host we actually serve —
    a ``{slug}.HELP_CENTER_BASE_DOMAIN`` subdomain or a DB-verified custom
    domain — so the edge provisions a certificate for those and refuses every
    other name pointed at us. Public by design (the edge calls it
    unauthenticated) but it leaks nothing: the answer is a bare status code and
    the lookup reuses the same in-memory cache/slug check as host dispatch, so
    there is no per-request database hit.
    """
    from fastapi import Response

    from app.core.help_center_host import is_help_center_host, normalize_host

    host = normalize_host(domain)
    if host and is_help_center_host(host):
        return Response(status_code=200)
    return Response(status_code=404)


# Create upload directories if they don't exist
if not os.path.exists("uploads"):
    os.makedirs("uploads")
if not os.path.exists("uploads/agents"):
    os.makedirs("uploads/agents")

# Mount static files
app.mount("/api/v1/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/assets", StaticFiles(directory="assets"), name="assets")

# Create final ASGI app
# Public help center: requests for {slug}.<help domain> / verified custom
# domains are dispatched to the SSR help-center app before reaching the API.
from app.api.help_center_public import public_app
from app.core.help_center_host import HelpCenterHostMiddleware

app = socketio.ASGIApp(sio, HelpCenterHostMiddleware(app, public_app))

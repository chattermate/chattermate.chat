"""
ChatterMate - Slack API
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

import json
import secrets
import traceback
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks, Response
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.auth import get_current_organization, require_permissions
from app.core.config import settings
from app.core.logger import get_logger
from app.models.organization import Organization
from app.models.user import User
from app.models.slack import StorageMode
from app.models.schemas.slack import (
    SlackConnectionStatus,
    SlackChannelResponse,
    SlackWorkspaceConfigUpdate,
    SlackWorkspaceConfigResponse,
    AgentSlackConfigCreate,
    AgentSlackConfigUpdate,
    AgentSlackConfigResponse,
    AgentSlackConfigBulkCreate,
    StorageModeEnum,
)
from app.repositories.slack import SlackRepository
from app.repositories.agent import AgentRepository
from app.services.slack import slack_service, SlackAuthError, SlackAPIError
from app.core.redis import get_redis

router = APIRouter()
logger = get_logger(__name__)

# OAuth state TTL in seconds (10 minutes)
OAUTH_STATE_TTL = 600

# Fallback in-memory store for OAuth states (only used if Redis is unavailable)
_oauth_states_fallback = {}


def store_oauth_state(state: str, org_id: str) -> None:
    """Store OAuth state with organization ID in Redis (or fallback to memory)."""
    redis_client = get_redis()
    if redis_client:
        try:
            redis_client.setex(f"slack_oauth_state:{state}", OAUTH_STATE_TTL, org_id)
            logger.debug(f"Stored OAuth state in Redis: {state}")
            return
        except Exception as e:
            logger.warning(f"Failed to store OAuth state in Redis: {e}")
    # Fallback to in-memory storage
    _oauth_states_fallback[state] = org_id
    logger.debug(f"Stored OAuth state in memory (fallback): {state}")


def get_oauth_state(state: str) -> Optional[str]:
    """Get organization ID for OAuth state from Redis (or fallback)."""
    redis_client = get_redis()
    if redis_client:
        try:
            org_id = redis_client.get(f"slack_oauth_state:{state}")
            if org_id:
                return org_id
        except Exception as e:
            logger.warning(f"Failed to get OAuth state from Redis: {e}")
    # Fallback to in-memory storage
    return _oauth_states_fallback.get(state)


def delete_oauth_state(state: str) -> None:
    """Delete OAuth state from Redis (and fallback)."""
    redis_client = get_redis()
    if redis_client:
        try:
            redis_client.delete(f"slack_oauth_state:{state}")
        except Exception as e:
            logger.warning(f"Failed to delete OAuth state from Redis: {e}")
    # Also clean up fallback storage
    _oauth_states_fallback.pop(state, None)


# ==================== OAuth & Connection Endpoints ====================

@router.get("/status", response_model=SlackConnectionStatus)
async def slack_status(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Check if Slack is connected for the current organization."""
    slack_repo = SlackRepository(db)
    token = slack_repo.get_token_by_org(organization.id)

    if not token:
        return SlackConnectionStatus(connected=False)

    # Verify token is still valid by testing auth
    try:
        await slack_service.auth_test(token.access_token)
        return SlackConnectionStatus(
            connected=True,
            team_id=token.team_id,
            team_name=token.team_name,
            bot_user_id=token.bot_user_id
        )
    except SlackAuthError:
        logger.warning(f"Slack token invalid for org {organization.id}")
        return SlackConnectionStatus(connected=False)


@router.get("/authorize")
async def authorize_slack(
    request: Request,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
):
    """Start the Slack OAuth flow by redirecting to Slack's authorization page."""
    logger.info(f"Authorizing Slack for organization: {organization.id}")

    # Generate a random state for CSRF protection
    state = secrets.token_urlsafe(32)

    # Store state in Redis with organization ID
    store_oauth_state(state, str(organization.id))
    logger.info(f"Stored OAuth state: {state}")

    # Get authorization URL
    auth_url = slack_service.get_authorization_url(state)
    logger.info(f"Redirecting to Slack authorization URL")
    return RedirectResponse(url=auth_url)


@router.get("/callback")
async def slack_oauth_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Handle the OAuth callback from Slack."""
    # Handle cancellation or error from Slack
    if error or not code or not state:
        logger.warning(f"Slack OAuth flow cancelled or error: {error} - {error_description}")
        if state:
            delete_oauth_state(state)
        redirect_url = f"{settings.FRONTEND_URL}/settings/integrations?status=failure&reason={error or 'cancelled'}"
        return RedirectResponse(url=redirect_url)

    # Get organization ID from state
    org_id = get_oauth_state(state)

    if not org_id:
        logger.error(f"Invalid or expired state parameter: {state}")
        redirect_url = f"{settings.FRONTEND_URL}/settings/integrations?status=failure&reason=invalid_state"
        return RedirectResponse(url=redirect_url)

    try:
        # Exchange code for token
        token_data = await slack_service.exchange_code_for_token(code)

        slack_repo = SlackRepository(db)

        # Check if token already exists for this organization
        existing_token = slack_repo.get_token_by_org(UUID(org_id))

        if existing_token:
            # Update existing token
            slack_repo.update_token(
                existing_token.id,
                access_token=token_data["access_token"],
                bot_user_id=token_data["bot_user_id"],
                team_id=token_data["team_id"],
                team_name=token_data["team_name"],
                authed_user_id=token_data.get("authed_user_id"),
                scope=token_data.get("scope")
            )
        else:
            # Create new token
            slack_repo.create_token(
                organization_id=UUID(org_id),
                access_token=token_data["access_token"],
                bot_user_id=token_data["bot_user_id"],
                team_id=token_data["team_id"],
                team_name=token_data["team_name"],
                authed_user_id=token_data.get("authed_user_id"),
                scope=token_data.get("scope")
            )

            # Create default workspace config
            slack_repo.create_workspace_config(
                organization_id=UUID(org_id),
                team_id=token_data["team_id"],
                storage_mode=StorageMode.FULL_CONTENT
            )

        # Clean up the state
        delete_oauth_state(state)

        redirect_url = f"{settings.FRONTEND_URL}/settings/integrations?status=success&integration=slack"
        return RedirectResponse(url=redirect_url)

    except Exception as e:
        logger.error(f"Error during Slack OAuth callback: {e}")
        traceback.print_exc()
        delete_oauth_state(state)
        error_message = str(e).replace(" ", "_")[:100]
        redirect_url = f"{settings.FRONTEND_URL}/settings/integrations?status=failure&reason={error_message}"
        return RedirectResponse(url=redirect_url)


@router.delete("/disconnect")
async def disconnect_slack(
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Disconnect Slack integration for the current organization."""
    slack_repo = SlackRepository(db)
    token = slack_repo.get_token_by_org(organization.id)

    if not token:
        raise HTTPException(status_code=404, detail="No Slack connection found")

    try:
        # Revoke the token with Slack to uninstall the app from workspace
        revoked = await slack_service.auth_revoke(token.access_token)
        if revoked:
            logger.info(f"Slack token revoked for organization {organization.id}")
        else:
            logger.warning(f"Failed to revoke Slack token for organization {organization.id}, continuing with local cleanup")

        # Delete all Slack data for this organization's team
        slack_repo.delete_workspace_data(token.team_id)
        logger.info(f"Slack disconnected for organization {organization.id} by user {current_user.id}")
        return {"message": "Slack disconnected successfully"}
    except Exception as e:
        logger.error(f"Error disconnecting Slack: {e}")
        raise HTTPException(status_code=500, detail=f"Error disconnecting Slack: {str(e)}")


# ==================== Channel Endpoints ====================

@router.get("/channels", response_model=List[SlackChannelResponse])
async def get_slack_channels(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Get list of Slack channels the bot is a member of."""
    slack_repo = SlackRepository(db)
    token = slack_repo.get_token_by_org(organization.id)

    if not token:
        raise HTTPException(status_code=404, detail="No Slack connection found")

    try:
        channels = await slack_service.get_conversations_list(token.access_token)
        return [
            SlackChannelResponse(
                id=ch["id"],
                name=ch["name"],
                is_private=ch.get("is_private", False),
                is_member=ch.get("is_member", False),
                num_members=ch.get("num_members")
            )
            for ch in channels
        ]
    except SlackAPIError as e:
        logger.error(f"Failed to get Slack channels: {e}")
        raise HTTPException(status_code=500, detail="Failed to get Slack channels")


# ==================== AI Assistant Prompts Endpoint ====================

@router.post("/suggested-prompts")
async def get_suggested_prompts(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Slack calls this endpoint to get dynamic suggested prompts for the AI assistant.
    Returns all organization agents as selectable options.
    Configure URL in: Agents & AI Apps > Suggested Prompts > Dynamic
    """
    raw_body = await request.body()
    body = json.loads(raw_body.decode('utf-8'))

    # Verify Slack signature
    timestamp = request.headers.get("X-Slack-Request-Timestamp", "")
    signature = request.headers.get("X-Slack-Signature", "")

    if not slack_service.verify_signature(raw_body, timestamp, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    team_id = body.get("team_id")
    channel_context = body.get("context", {}).get("channel_id")

    slack_repo = SlackRepository(db)
    token = slack_repo.get_token_by_team(team_id)

    if not token:
        return {"prompts": []}

    # Get all agents for this organization
    agent_repo = AgentRepository(db)
    agents = agent_repo.get_org_agents(token.organization_id)

    # Build prompts - one per agent (max 4)
    prompts = []
    for agent in agents[:4]:
        prompts.append({
            "title": f"Ask {agent.name}",
            "message": f"[agent:{agent.id}] "
        })

    # If user is viewing a channel with a configured agent, prioritize it
    if channel_context:
        agent_config = slack_repo.get_config_by_channel(team_id, channel_context)
        if agent_config:
            # Move this agent to the front
            prompts = [p for p in prompts if str(agent_config.agent_id) not in p.get("message", "")]
            prompts.insert(0, {
                "title": f"Ask {agent_config.channel_name} Agent",
                "message": f"[agent:{agent_config.agent_id}] "
            })

    logger.info(f"Returning {len(prompts)} suggested prompts for team {team_id}")
    return {"prompts": prompts[:4]}


# ==================== Workspace Configuration Endpoints ====================

@router.get("/workspace-config", response_model=SlackWorkspaceConfigResponse)
async def get_workspace_config(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Get workspace configuration for the current organization."""
    slack_repo = SlackRepository(db)
    config = slack_repo.get_workspace_config_by_org(organization.id)

    if not config:
        raise HTTPException(status_code=404, detail="No Slack workspace configuration found")

    return config


@router.put("/workspace-config", response_model=SlackWorkspaceConfigResponse)
async def update_workspace_config(
    config_update: SlackWorkspaceConfigUpdate,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Update workspace configuration."""
    slack_repo = SlackRepository(db)
    config = slack_repo.get_workspace_config_by_org(organization.id)

    if not config:
        raise HTTPException(status_code=404, detail="No Slack workspace configuration found")

    # Prepare update data
    update_data = {}
    if config_update.allowed_channel_ids is not None:
        update_data["allowed_channel_ids"] = config_update.allowed_channel_ids
    if config_update.storage_mode is not None:
        update_data["storage_mode"] = StorageMode(config_update.storage_mode.value)
    if config_update.default_agent_id is not None:
        update_data["default_agent_id"] = config_update.default_agent_id

    updated_config = slack_repo.update_workspace_config(config.id, **update_data)
    return updated_config


# ==================== Agent Configuration Endpoints ====================

@router.get("/agent-config/{agent_id}", response_model=List[AgentSlackConfigResponse])
async def get_agent_slack_config(
    agent_id: str,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Get Slack configurations for an agent."""
    # Validate agent_id is a proper UUID
    if not agent_id or agent_id == "undefined" or agent_id == "null":
        return []

    try:
        agent_uuid = UUID(agent_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid agent ID format")

    slack_repo = SlackRepository(db)
    configs = slack_repo.get_configs_by_agent(agent_uuid)

    # Filter to only return configs belonging to this organization
    return [c for c in configs if c.organization_id == organization.id]


@router.post("/agent-config/{agent_id}", response_model=AgentSlackConfigResponse)
async def create_agent_slack_config(
    agent_id: str,
    config: AgentSlackConfigCreate,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Create a new Slack channel configuration for an agent."""
    slack_repo = SlackRepository(db)

    # Check if Slack is connected
    token = slack_repo.get_token_by_org(organization.id)
    if not token:
        raise HTTPException(status_code=400, detail="Slack is not connected")

    # Check if config already exists for this channel
    existing = slack_repo.get_config_by_channel(token.team_id, config.channel_id)
    if existing and existing.organization_id == organization.id:
        raise HTTPException(status_code=400, detail="Configuration already exists for this channel")

    try:
        new_config = slack_repo.create_agent_config(
            organization_id=organization.id,
            team_id=token.team_id,
            agent_id=UUID(agent_id),
            channel_id=config.channel_id,
            channel_name=config.channel_name,
            enabled=config.enabled,
            respond_to_mentions=config.respond_to_mentions,
            respond_to_reactions=config.respond_to_reactions,
            respond_to_commands=config.respond_to_commands,
            reaction_emoji=config.reaction_emoji
        )
        return new_config
    except Exception as e:
        logger.error(f"Failed to create agent Slack config: {e}")
        raise HTTPException(status_code=500, detail="Failed to create configuration")


@router.put("/agent-config/{agent_id}/{config_id}", response_model=AgentSlackConfigResponse)
async def update_agent_slack_config(
    agent_id: str,
    config_id: int,
    config_update: AgentSlackConfigUpdate,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Update an agent's Slack channel configuration."""
    slack_repo = SlackRepository(db)

    # Prepare update data
    update_data = {}
    if config_update.enabled is not None:
        update_data["enabled"] = config_update.enabled
    if config_update.respond_to_mentions is not None:
        update_data["respond_to_mentions"] = config_update.respond_to_mentions
    if config_update.respond_to_reactions is not None:
        update_data["respond_to_reactions"] = config_update.respond_to_reactions
    if config_update.respond_to_commands is not None:
        update_data["respond_to_commands"] = config_update.respond_to_commands
    if config_update.reaction_emoji is not None:
        update_data["reaction_emoji"] = config_update.reaction_emoji

    updated_config = slack_repo.update_agent_config(config_id, **update_data)

    if not updated_config:
        raise HTTPException(status_code=404, detail="Configuration not found")

    return updated_config


@router.delete("/agent-config/{agent_id}/{channel_id}")
async def delete_agent_slack_config(
    agent_id: str,
    channel_id: str,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Delete an agent's Slack channel configuration."""
    slack_repo = SlackRepository(db)
    deleted = slack_repo.delete_agent_config(organization.id, channel_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Configuration not found")

    return {"message": "Configuration deleted successfully"}


# ==================== Slack Webhook Endpoints ====================

@router.post("/events")
async def slack_events(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Handle Slack Events API.
    Must respond within 3 seconds - use background tasks for processing.
    """
    # Read body first for signature verification
    raw_body = await request.body()
    body = json.loads(raw_body.decode('utf-8'))

    # URL Verification (respond immediately - no signature check needed)
    if body.get("type") == "url_verification":
        return {"challenge": body.get("challenge")}

    # Verify signature using raw body
    timestamp = request.headers.get("X-Slack-Request-Timestamp", "")
    signature = request.headers.get("X-Slack-Signature", "")

    if not slack_service.verify_signature(raw_body, timestamp, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Acknowledge immediately, process in background
    event_type = body.get("event", {}).get("type")
    logger.info(f"Received Slack event: {event_type}")

    # Import here to avoid circular imports
    from app.services.slack_chat import process_slack_event
    background_tasks.add_task(process_slack_event, body, db)

    return Response(status_code=200)


@router.post("/commands")
async def slack_commands(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Handle Slack slash commands (/chattermate).
    Must respond within 3 seconds.
    """
    # Read body first for signature verification
    raw_body = await request.body()

    # Verify signature using raw body
    timestamp = request.headers.get("X-Slack-Request-Timestamp", "")
    signature = request.headers.get("X-Slack-Signature", "")

    if not slack_service.verify_signature(raw_body, timestamp, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Parse form data from raw body
    from urllib.parse import parse_qs
    parsed = parse_qs(raw_body.decode('utf-8'))
    form_data = {k: v[0] if len(v) == 1 else v for k, v in parsed.items()}

    command = form_data.get("command")
    text = (form_data.get("text") or "").strip()

    # Handle 'help' synchronously (fast response)
    if text.lower() == "help":
        return {
            "response_type": "ephemeral",
            "text": "*Chattermate Commands*\n"
                    "• `/chattermate [question]` - Ask Chattermate a question\n"
                    "• `/chattermate help` - Show this help message\n\n"
                    "You can also @mention Chattermate to ask questions."
        }

    # Process question in background, respond via response_url
    from app.services.slack_chat import process_slash_command
    background_tasks.add_task(
        process_slash_command,
        dict(form_data),
        db
    )

    # Immediate acknowledgment
    return {
        "response_type": "ephemeral",
        "text": "Processing your request..."
    }


@router.post("/interactions")
async def slack_interactions(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Handle Slack interactions (message shortcuts, button clicks, modal submissions).
    Must respond within 3 seconds.
    """
    # Read body first for signature verification
    body = await request.body()

    # Verify signature using the raw body
    timestamp = request.headers.get("X-Slack-Request-Timestamp", "")
    signature = request.headers.get("X-Slack-Signature", "")

    if not slack_service.verify_signature(body, timestamp, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Parse form data from body
    from urllib.parse import parse_qs
    form_data = parse_qs(body.decode('utf-8'))
    payload_str = form_data.get("payload", [None])[0]

    if not payload_str:
        raise HTTPException(status_code=400, detail="Missing payload")

    payload = json.loads(payload_str)
    interaction_type = payload.get("type")

    logger.info(f"Received Slack interaction: {interaction_type}")

    from app.services.slack_chat import process_slack_interaction, process_message_shortcut

    # Handle view submission (modal form submit) - needs immediate response
    if interaction_type == "view_submission":
        result = await process_slack_interaction(payload)
        if result:
            # Return error response to Slack
            return JSONResponse(content=result)
        return Response(status_code=200)

    # Handle block actions (button clicks) - process in background
    if interaction_type == "block_actions":
        background_tasks.add_task(process_slack_interaction, payload)
        return Response(status_code=200)

    # Handle message shortcut (right-click menu)
    if interaction_type == "message_action":
        callback_id = payload.get("callback_id")
        if callback_id == "cm_ask_about_message":
            background_tasks.add_task(process_message_shortcut, payload, db)
            return Response(status_code=200)

    # Handle other interaction types as needed
    return Response(status_code=200)


# ==================== GDPR Data Deletion Endpoint ====================

@router.post("/data-deletion")
async def slack_data_deletion(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Slack calls this endpoint when:
    1. A workspace uninstalls the app
    2. A user requests data deletion for compliance

    Configure this URL in: App Settings > App Directory > Data Deletion URL
    """
    # Read body first for signature verification
    raw_body = await request.body()

    # Verify signature using raw body
    timestamp = request.headers.get("X-Slack-Request-Timestamp", "")
    signature = request.headers.get("X-Slack-Signature", "")

    if not slack_service.verify_signature(raw_body, timestamp, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    body = json.loads(raw_body.decode('utf-8'))

    team_id = body.get("team_id")
    user_id = body.get("user_id")  # Optional - if specific user requests deletion

    if not team_id:
        raise HTTPException(status_code=400, detail="Missing team_id")

    slack_repo = SlackRepository(db)

    try:
        if user_id:
            # User-specific deletion
            results = slack_repo.delete_user_data(team_id, user_id)
            logger.info(f"Deleted user data for {user_id} in team {team_id}: {results}")
        else:
            # Full workspace uninstall - delete all data for this team
            results = slack_repo.delete_workspace_data(team_id)
            logger.info(f"Deleted workspace data for team {team_id}: {results}")

        return {"ok": True, "deleted_records": results}
    except Exception as e:
        logger.error(f"Error deleting Slack data: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete data")


@router.get("/privacy")
async def slack_privacy():
    """Redirect to privacy policy page."""
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/privacy")

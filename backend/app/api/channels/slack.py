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

import secrets
from urllib.parse import urlencode
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.api.channels.accounts import get_org_account_or_404
from app.core.auth import get_current_organization, require_permissions
from app.core.config import settings
from app.core.redis import get_redis
from app.database import get_db
from app.models.channels import ChannelType
from app.models.organization import Organization
from app.models.user import User
from app.repositories.channels import ChannelAccountRepository
from app.core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

# Bot scopes for the customer-chat use case: receive mentions + DMs, reply,
# and resolve the sender's real name (users:read) so customers aren't raw U0… ids
OAUTH_SCOPES = "app_mentions:read,chat:write,im:history,im:read,im:write,users:read"
STATE_TTL_SECONDS = 60 * 10

# In-process fallback when Redis is disabled (single-worker dev setups)
_state_fallback: dict = {}


def _store_state(state: str, org_id: str) -> None:
    redis_client = get_redis()
    if redis_client is not None:
        redis_client.set(f"slack_oauth_state:{state}", org_id, ex=STATE_TTL_SECONDS)
    else:
        _state_fallback[state] = org_id


def _pop_state(state: str) -> str | None:
    redis_client = get_redis()
    if redis_client is not None:
        key = f"slack_oauth_state:{state}"
        org_id = redis_client.get(key)
        if org_id:
            redis_client.delete(key)
        return org_id
    return _state_fallback.pop(state, None)


def _redirect_uri() -> str:
    return f"{settings.BACKEND_URL.rstrip('/')}{settings.API_V1_STR}/channels/slack/callback"


def _settings_redirect(status: str, reason: str = None) -> RedirectResponse:
    params = {"status": status, "integration": "slack"}
    if reason:
        params["reason"] = reason
    return RedirectResponse(f"{settings.FRONTEND_URL}/settings/integrations?{urlencode(params)}")


@router.get("/install")
async def install_slack(
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
):
    """Start the Slack OAuth install: redirect the browser to Slack's consent
    page with a CSRF state bound to the organization."""
    if not settings.SLACK_CLIENT_ID or not settings.SLACK_CLIENT_SECRET:
        raise HTTPException(status_code=400, detail="Slack app credentials are not configured")
    state = secrets.token_urlsafe(24)
    _store_state(state, str(organization.id))
    params = urlencode({
        "client_id": settings.SLACK_CLIENT_ID,
        "scope": OAUTH_SCOPES,
        "redirect_uri": _redirect_uri(),
        "state": state,
    })
    return RedirectResponse(f"https://slack.com/oauth/v2/authorize?{params}")


@router.get("/callback")
async def slack_oauth_callback(
    code: str = None,
    state: str = None,
    error: str = None,
    db: Session = Depends(get_db),
):
    """Complete the OAuth install: exchange the code, store the workspace as a
    channel account, and bounce back to the settings page."""
    if error:
        return _settings_redirect("failure", "cancelled" if error == "access_denied" else error)
    org_id = _pop_state(state or "")
    if org_id is None or not code:
        return _settings_redirect("failure", "invalid_state")

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post("https://slack.com/api/oauth.v2.access", data={
            "client_id": settings.SLACK_CLIENT_ID,
            "client_secret": settings.SLACK_CLIENT_SECRET,
            "code": code,
            "redirect_uri": _redirect_uri(),
        })
    data = response.json()
    if not data.get("ok"):
        logger.error(f"Slack OAuth exchange failed: {data.get('error')}")
        return _settings_redirect("failure", str(data.get("error", "oauth_failed")))

    team = data.get("team") or {}
    team_id = team.get("id", "")
    repo = ChannelAccountRepository(db)
    existing = repo.get_by_external_id(ChannelType.SLACK.value, team_id)
    credentials = {
        "access_token": data.get("access_token"),
        "bot_user_id": data.get("bot_user_id"),
    }
    if existing is not None:
        if str(existing.organization_id) != org_id:
            return _settings_redirect("failure", "workspace_connected_elsewhere")
        repo.update_credentials(existing, credentials)
        repo.set_active(existing, True)
    else:
        repo.create_account(
            organization_id=UUID(org_id),
            channel_type=ChannelType.SLACK.value,
            external_account_id=team_id,
            credentials=credentials,
            display_name=team.get("name", team_id),
        )
    logger.info(f"Connected Slack workspace {team.get('name')} for org {org_id}")
    return _settings_redirect("success")


@router.delete("/{account_id}")
async def disconnect_slack(
    account_id: UUID,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    account = get_org_account_or_404(db, account_id, organization)
    if account.channel_type != ChannelType.SLACK.value:
        raise HTTPException(status_code=404, detail="Channel account not found")
    ChannelAccountRepository(db).delete(account)
    return {"status": "disconnected"}

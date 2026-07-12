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
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy import String
from sqlalchemy.orm import Session

from app.core.auth import get_current_organization, require_permissions
from app.core.config import settings
from app.core.exceptions import DocuSignAuthError
from app.core.logger import get_logger
from app.database import get_db
from app.models.agent import Agent
from app.models.docusign import AgentDocuSignConfig
from app.models.organization import Organization
from app.models.schemas.docusign import AgentDocuSignConfigModel, DocuSignTemplate
from app.models.user import User
from app.services.docusign import (
    DocuSignClient, DocuSignOAuth, get_credentials, get_token_row, store_token,
)

router = APIRouter()
logger = get_logger(__name__)

# CSRF state store for the OAuth handshake (single-backend; swap for Redis if scaled).
oauth_states: dict = {}


def _client(db: Session, organization: Organization) -> DocuSignClient:
    try:
        creds = get_credentials(db, organization.id)
    except DocuSignAuthError as e:
        raise HTTPException(status_code=401, detail=str(e))
    return DocuSignClient(creds.access_token, creds.account_id, creds.base_uri)


@router.get("/status")
async def docusign_status(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Whether DocuSign is connected (and reachable) for the organization."""
    if get_token_row(db, organization.id) is None:
        return {"connected": False}
    try:
        get_credentials(db, organization.id)
    except DocuSignAuthError:
        return {"connected": False}
    return {"connected": True}


@router.delete("/disconnect")
async def disconnect_docusign(
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Remove the DocuSign connection and every agent's DocuSign config."""
    token = get_token_row(db, organization.id)
    if not token:
        raise HTTPException(status_code=404, detail="No DocuSign connection found")
    try:
        configs = db.query(AgentDocuSignConfig).join(
            Agent, AgentDocuSignConfig.agent_id == Agent.id.cast(String)
        ).filter(Agent.organization_id == organization.id).all()
        for config in configs:
            db.delete(config)
        db.delete(token)
        db.commit()
        logger.info(
            f"DocuSign disconnected for org {organization.id} by user {current_user.id} "
            f"({len(configs)} agent configs removed)")
    except Exception as e:
        db.rollback()
        logger.error(f"Error disconnecting DocuSign: {e}")
        raise HTTPException(status_code=500, detail="Error disconnecting DocuSign")
    return {"message": "DocuSign disconnected successfully"}


@router.get("/authorize")
async def authorize_docusign(
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
):
    """Start the DocuSign OAuth flow by redirecting to the consent page."""
    state = secrets.token_urlsafe(32)
    oauth_states[state] = str(organization.id)
    return RedirectResponse(url=DocuSignOAuth().authorization_url(state))


@router.get("/callback")
async def docusign_oauth_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Handle the DocuSign OAuth callback: exchange the code, resolve the account
    base URI, store the encrypted token, then redirect to integrations."""
    base = f"{settings.FRONTEND_URL}/settings/integrations"
    if error or not code or not state:
        oauth_states.pop(state, None)
        return RedirectResponse(url=f"{base}?status=failure&reason={error or 'cancelled'}")

    org_id = oauth_states.pop(state, None)
    if not org_id:
        return RedirectResponse(url=f"{base}?status=failure&reason=invalid_state")

    try:
        oauth = DocuSignOAuth()
        token_data = oauth.exchange_code(code)
        account = oauth.get_account(token_data["access_token"])
        store_token(db, org_id, token_data,
                    account_id=account["account_id"], base_uri=account["base_uri"])
        return RedirectResponse(url=f"{base}?status=success")
    except Exception as e:
        logger.error(f"Error during DocuSign OAuth callback: {e}")
        reason = str(e).replace(" ", "_")[:100]
        return RedirectResponse(url=f"{base}?status=failure&reason={reason}")


@router.get("/refresh")
async def refresh_docusign_token(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Force a token refresh (also happens transparently on demand)."""
    if get_token_row(db, organization.id) is None:
        raise HTTPException(status_code=404, detail="No DocuSign token found")
    try:
        get_credentials(db, organization.id)
    except DocuSignAuthError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Token refreshed successfully"}


@router.get("/templates", response_model=List[DocuSignTemplate])
async def list_docusign_templates(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """List the templates available in the connected DocuSign account."""
    try:
        return _client(db, organization).list_templates()
    except DocuSignAuthError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/agent-config/{agent_id}")
async def save_agent_docusign_config(
    agent_id: str,
    config: AgentDocuSignConfigModel,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(require_permissions("manage_organization")),
    db: Session = Depends(get_db),
):
    """Enable/disable DocuSign for an agent and set its default template."""
    if config.enabled and get_token_row(db, organization.id) is None:
        raise HTTPException(
            status_code=400,
            detail="Cannot enable DocuSign integration: DocuSign is not connected")

    existing = db.query(AgentDocuSignConfig).filter(
        AgentDocuSignConfig.agent_id == agent_id).first()
    if existing:
        existing.enabled = config.enabled
        existing.default_template_id = config.defaultTemplateId
    else:
        db.add(AgentDocuSignConfig(
            agent_id=agent_id,
            enabled=config.enabled,
            default_template_id=config.defaultTemplateId,
        ))
    db.commit()
    return {"message": "Agent DocuSign configuration saved successfully"}


@router.get("/agent-config/{agent_id}")
async def get_agent_docusign_config(
    agent_id: str,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Read an agent's DocuSign configuration."""
    config = db.query(AgentDocuSignConfig).filter(
        AgentDocuSignConfig.agent_id == agent_id).first()
    if not config:
        return {"enabled": False, "defaultTemplateId": None}
    return {"enabled": config.enabled, "defaultTemplateId": config.default_template_id}

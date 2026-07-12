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
from app.core.exceptions import JiraAuthError
from app.core.logger import get_logger
from app.database import get_db
from app.models.agent import Agent
from app.models.jira import AgentJiraConfig
from app.models.organization import Organization
from app.models.schemas.jira import (
    AgentJiraConfigModel, CreateJiraIssueModel, JiraIssueType, JiraPriority, JiraProject,
)
from app.models.user import User
from app.services.jira import JiraClient, JiraOAuth, get_credentials, get_token_row, store_token
from app.services.jira.config import DEFAULT_PRIORITY_ID, PRIORITY_NAME_TO_ID

router = APIRouter()
logger = get_logger(__name__)

# CSRF state store for the OAuth handshake. In-memory is enough for a single
# backend; swap for Redis if the API is horizontally scaled.
oauth_states: dict = {}


def _client(db: Session, organization: Organization) -> JiraClient:
    """Build a Jira client with fresh credentials, or 401/404 for the caller."""
    try:
        creds = get_credentials(db, organization.id)
    except JiraAuthError as e:
        raise HTTPException(status_code=401, detail=str(e))
    return JiraClient(creds.access_token, creds.cloud_id, creds.site_url)


@router.get("/status")
async def jira_status(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Whether Jira is connected (and reachable) for the current organization."""
    if get_token_row(db, organization.id) is None:
        return {"connected": False}
    try:
        creds = get_credentials(db, organization.id)
    except JiraAuthError:
        return {"connected": False}
    return {"connected": True, "site_url": creds.site_url}


@router.delete("/disconnect")
async def disconnect_jira(
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Remove the Jira connection and every agent's Jira config for the org."""
    token = get_token_row(db, organization.id)
    if not token:
        raise HTTPException(status_code=404, detail="No Jira connection found")
    try:
        agent_configs = db.query(AgentJiraConfig).join(
            Agent, AgentJiraConfig.agent_id == Agent.id.cast(String)
        ).filter(Agent.organization_id == organization.id).all()
        for config in agent_configs:
            db.delete(config)
        db.delete(token)
        db.commit()
        logger.info(
            f"Jira disconnected for org {organization.id} by user {current_user.id} "
            f"({len(agent_configs)} agent configs removed)")
    except Exception as e:
        db.rollback()
        logger.error(f"Error disconnecting Jira: {e}")
        raise HTTPException(status_code=500, detail="Error disconnecting Jira")
    return {"message": "Jira disconnected successfully"}


@router.get("/authorize")
async def authorize_jira(
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
):
    """Start the Jira OAuth flow by redirecting to Atlassian's consent page."""
    state = secrets.token_urlsafe(32)
    oauth_states[state] = str(organization.id)
    return RedirectResponse(url=JiraOAuth().authorization_url(state))


@router.get("/callback")
async def jira_oauth_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Handle the Atlassian OAuth callback: exchange the code, resolve the site,
    and store the encrypted token, then redirect back to the integrations page."""
    base = f"{settings.FRONTEND_URL}/settings/integrations?integration=jira"
    if error or not code or not state:
        oauth_states.pop(state, None)
        return RedirectResponse(url=f"{base}&status=failure&reason={error or 'cancelled'}")

    org_id = oauth_states.pop(state, None)
    if not org_id:
        return RedirectResponse(url=f"{base}&status=failure&reason=invalid_state")

    try:
        oauth = JiraOAuth()
        token_data = oauth.exchange_code(code)
        resources = oauth.get_accessible_resources(token_data["access_token"])
        site = resources[0]
        store_token(db, org_id, token_data, cloud_id=site["id"], site_url=site["url"])
        return RedirectResponse(url=f"{base}&status=success")
    except Exception as e:
        logger.error(f"Error during Jira OAuth callback: {e}")
        reason = str(e).replace(" ", "_")[:100]
        return RedirectResponse(url=f"{base}&status=failure&reason={reason}")


@router.get("/refresh")
async def refresh_jira_token(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Force a token refresh (also happens transparently on demand)."""
    if get_token_row(db, organization.id) is None:
        raise HTTPException(status_code=404, detail="No Jira token found")
    try:
        get_credentials(db, organization.id)
    except JiraAuthError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Token refreshed successfully"}


@router.get("/projects", response_model=List[JiraProject])
async def get_jira_projects(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """List the Jira projects available to the connected account."""
    try:
        return _client(db, organization).get_projects()
    except JiraAuthError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{project_key}/issue-types", response_model=List[JiraIssueType])
async def get_jira_issue_types(
    project_key: str,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """List selectable issue types for a project (sub-tasks excluded)."""
    try:
        return _client(db, organization).get_issue_types(project_key)
    except JiraAuthError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/priorities", response_model=List[JiraPriority])
async def get_jira_priorities(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """List the Jira priority scheme values."""
    try:
        return _client(db, organization).get_priorities()
    except JiraAuthError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{project_key}/issue-types/{issue_type_id}/has-priority")
async def check_priority_availability(
    project_key: str,
    issue_type_id: str,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Whether the priority field is on the create screen for this type."""
    has_priority = _client(db, organization).is_field_available(
        project_key, issue_type_id, "priority")
    return {"hasPriority": has_priority}


@router.post("/issues")
async def create_jira_issue(
    issue_data: CreateJiraIssueModel,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(require_permissions("manage_organization")),
    db: Session = Depends(get_db),
):
    """Create a Jira issue directly (manual API, not the agent path)."""
    priority_id = PRIORITY_NAME_TO_ID.get(issue_data.priority, DEFAULT_PRIORITY_ID) \
        if issue_data.priority else None
    try:
        result = _client(db, organization).create_issue(
            issue_data.projectKey, issue_data.issueTypeId,
            issue_data.summary, issue_data.description, priority_id)
    except JiraAuthError as e:
        raise HTTPException(status_code=502, detail=str(e))
    return {"key": result.get("key"), "id": result.get("id"), "self": result.get("self")}


@router.post("/agent-config/{agent_id}")
async def save_agent_jira_config(
    agent_id: str,
    config: AgentJiraConfigModel,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(require_permissions("manage_organization")),
    db: Session = Depends(get_db),
):
    """Enable/disable Jira for an agent and set its target project/issue type."""
    if config.enabled and get_token_row(db, organization.id) is None:
        raise HTTPException(
            status_code=400, detail="Cannot enable Jira integration: Jira is not connected")

    existing = db.query(AgentJiraConfig).filter(AgentJiraConfig.agent_id == agent_id).first()
    if existing:
        existing.enabled = config.enabled
        existing.project_key = config.projectKey
        existing.issue_type_id = config.issueTypeId
    else:
        db.add(AgentJiraConfig(
            agent_id=agent_id,
            enabled=config.enabled,
            project_key=config.projectKey,
            issue_type_id=config.issueTypeId,
        ))
    db.commit()
    return {"message": "Agent Jira configuration saved successfully"}


@router.get("/agent-config/{agent_id}")
async def get_agent_jira_config(
    agent_id: str,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Read an agent's Jira configuration."""
    config = db.query(AgentJiraConfig).filter(AgentJiraConfig.agent_id == agent_id).first()
    if not config:
        return {"enabled": False, "projectKey": None, "issueTypeId": None}
    return {
        "enabled": config.enabled,
        "projectKey": config.project_key,
        "issueTypeId": config.issue_type_id,
    }

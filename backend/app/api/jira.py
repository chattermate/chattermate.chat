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

import traceback
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import String
import secrets
import uuid

from app.database import get_db
from app.services.jira import JiraService
from app.models.jira import JiraToken, AgentJiraConfig
from app.models.agent import Agent
from app.core.auth import get_current_organization, require_permissions
from app.models.organization import Organization
from app.models.user import User
from app.core.logger import get_logger
from app.core.config import settings
from pydantic import BaseModel
from typing import Optional, List
from app.core.exceptions import JiraAuthError

router = APIRouter()
jira_service = JiraService()
logger = get_logger(__name__)

# Create a temporary in-memory store for OAuth states
# This is a simple solution that doesn't require database changes
# In production, you might want to use Redis or a database table
oauth_states = {}

class JiraProject(BaseModel):
    id: str
    key: str
    name: str

class JiraIssueType(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

class JiraPriority(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    iconUrl: Optional[str] = None

class AgentJiraConfigModel(BaseModel):
    enabled: bool
    projectKey: Optional[str] = None
    issueTypeId: Optional[str] = None

class CreateJiraIssueModel(BaseModel):
    projectKey: str
    issueTypeId: str
    summary: str
    description: str
    priority: Optional[str] = None
    chatId: Optional[str] = None

@router.get("/status")
async def jira_status(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """
    Check if Jira is connected for the current organization.
    """
    token = db.query(JiraToken).filter(
        JiraToken.organization_id == organization.id
    ).first()
    
    if not token:
        return {"connected": False}
    
    # Check if token is valid
    is_valid = jira_service.validate_token(token)
    
    # If token is expired, try to refresh it
    if not is_valid:
        try:
            token_data = await jira_service.refresh_token(token.refresh_token)
            
            # Update token in database
            for key, value in token_data.items():
                setattr(token, key, value)
            
            db.commit()
            is_valid = True
        except Exception as e:
            logger.error(f"Failed to refresh Jira token: {e}")
            is_valid = False
    
    return {
        "connected": is_valid,
        "site_url": token.site_url if is_valid else None
    }

@router.delete("/disconnect")
async def disconnect_jira(
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """
    Disconnect Jira integration for the current organization.
    """
    token = db.query(JiraToken).filter(
        JiraToken.organization_id == organization.id
    ).first()
    
    if not token:
        raise HTTPException(status_code=404, detail="No Jira connection found")
    
    # Delete all agent Jira configurations for this organization
    try:
        agent_configs = db.query(AgentJiraConfig).join(
            Agent, AgentJiraConfig.agent_id == Agent.id.cast(String)
        ).filter(
            Agent.organization_id == organization.id
        ).all()
        
        config_count = len(agent_configs)
        for config in agent_configs:
            db.delete(config)
            
        # Delete the Jira token
        db.delete(token)
        db.commit()
        
        logger.info(f"Jira disconnected for organization {organization.id} by user {current_user.id}. Deleted {config_count} agent configurations.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error disconnecting Jira: {e}")
        raise HTTPException(status_code=500, detail=f"Error disconnecting Jira: {str(e)}")
    
    return {"message": "Jira disconnected successfully"}

@router.get("/authorize")
async def authorize_jira(
    request: Request,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """
    Start the Jira OAuth flow by redirecting to Jira's authorization page.
    """
    logger.info(f"Authorizing Jira for organization: {organization.id}")
    
    # Generate a random state for CSRF protection
    state = secrets.token_urlsafe(32)
    
    # Store state in memory with organization ID
    oauth_states[state] = str(organization.id)
    logger.info(f"Stored OAuth state in memory: {state}")
    
    # Get authorization URL
    auth_url = jira_service.get_authorization_url(state)
    logger.info(f"Redirecting to Jira authorization URL: {auth_url}")
    return RedirectResponse(url=auth_url)

@router.get("/callback")
async def jira_oauth_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    Handle the OAuth callback from Jira.
    This endpoint handles both successful authentication and cancellation/errors.
    """
    # Handle cancellation or error from Jira
    if error or not code or not state:
        logger.warning(f"Jira OAuth flow cancelled or error: {error} - {error_description}")
        # Clean up the state if it exists
        if state and state in oauth_states:
            del oauth_states[state]
        # Redirect to failure page
        redirect_url = f"{settings.FRONTEND_URL}/settings/integrations?status=failure&reason={error or 'cancelled'}"
        return RedirectResponse(url=redirect_url)
    
    # Get organization ID from state
    org_id = oauth_states.get(state)
    
    if not org_id:
        logger.error(f"Invalid or expired state parameter: {state}")
        redirect_url = f"{settings.FRONTEND_URL}/settings/integrations?status=failure&reason=invalid_state"
        return RedirectResponse(url=redirect_url)
    
    try:
        # Exchange code for token
        token_data = await jira_service.exchange_code_for_token(code)
        
        # Get Jira Cloud ID and site URL
        cloud_data = await jira_service.get_cloud_id(token_data["access_token"])
        logger.info(f"Cloud data: {cloud_data}")
        # Store token in database
        jira_token = JiraToken(
            organization_id=org_id,
            access_token=token_data["access_token"],
            refresh_token=token_data["refresh_token"],
            token_type=token_data["token_type"],
            expires_at=token_data["expires_at"],
            cloud_id=cloud_data["cloud_id"],
            site_url=cloud_data["site_url"]
        )
        
        # Check if token already exists for this organization
        existing_token = db.query(JiraToken).filter(
            JiraToken.organization_id == org_id
        ).first()
        
        if existing_token:
            # Update existing token
            for key, value in token_data.items():
                setattr(existing_token, key, value)
            existing_token.cloud_id = cloud_data["cloud_id"]
            existing_token.site_url = cloud_data["site_url"]
        else:
            db.add(jira_token)
        
        db.commit()
        
        # Clean up the state
        if state in oauth_states:
            del oauth_states[state]
        
        # Redirect to success page using FRONTEND_URL from settings
        redirect_url = f"{settings.FRONTEND_URL}/settings/integrations?status=success"
        return RedirectResponse(url=redirect_url)
        
    except Exception as e:
        logger.error(f"Error during Jira OAuth callback: {e}")
        traceback.print_exc()
        # Clean up the state in case of error
        if state in oauth_states:
            del oauth_states[state]
        # Redirect to failure page with error message
        error_message = str(e).replace(" ", "_")[:100]  # Limit length and replace spaces
        redirect_url = f"{settings.FRONTEND_URL}/settings/integrations?status=failure&reason={error_message}"
        return RedirectResponse(url=redirect_url)

@router.get("/refresh")
async def refresh_jira_token(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """
    Refresh the Jira access token using the refresh token.
    """
    token = db.query(JiraToken).filter(
        JiraToken.organization_id == organization.id
    ).first()
    
    if not token:
        raise HTTPException(status_code=404, detail="No Jira token found")
    
    try:
        token_data = await jira_service.refresh_token(token.refresh_token)
        
        # Update token in database
        for key, value in token_data.items():
            setattr(token, key, value)
        
        db.commit()
        return {"message": "Token refreshed successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/projects", response_model=List[JiraProject])
async def get_jira_projects(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """
    Get all Jira projects for the current organization.
    """
    token = db.query(JiraToken).filter(
        JiraToken.organization_id == organization.id
    ).first()
    
    if not token:
        raise HTTPException(status_code=404, detail="No Jira connection found")
    
    # Check if token is valid
    is_valid = jira_service.validate_token(token)
    
    # If token is expired, try to refresh it
    if not is_valid:
        try:
            token_data = await jira_service.refresh_token(token.refresh_token)
            
            # Update token in database
            for key, value in token_data.items():
                setattr(token, key, value)
            
            db.commit()
        except Exception as e:
            logger.error(f"Failed to refresh Jira token: {e}")
            raise HTTPException(status_code=401, detail="Jira token expired and could not be refreshed")
    
    try:
        projects = await jira_service.get_projects(token.access_token, token.cloud_id)
        return projects
    except Exception as e:
        logger.error(f"Failed to get Jira projects: {e}")
        raise HTTPException(status_code=500, detail="Failed to get Jira projects")

@router.get("/projects/{project_key}/issue-types", response_model=List[JiraIssueType])
async def get_jira_issue_types(
    project_key: str,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """
    Get all issue types for a Jira project.
    """
    token = db.query(JiraToken).filter(
        JiraToken.organization_id == organization.id
    ).first()
    
    if not token:
        raise HTTPException(status_code=404, detail="No Jira connection found")
    
    # Check if token is valid
    is_valid = jira_service.validate_token(token)
    
    # If token is expired, try to refresh it
    if not is_valid:
        try:
            token_data = await jira_service.refresh_token(token.refresh_token)
            
            # Update token in database
            for key, value in token_data.items():
                setattr(token, key, value)
            
            db.commit()
        except Exception as e:
            logger.error(f"Failed to refresh Jira token: {e}")
            raise HTTPException(status_code=401, detail="Jira token expired and could not be refreshed")
    
    try:
        issue_types = await jira_service.get_issue_types(token.access_token, token.cloud_id, project_key)
        return issue_types
    except Exception as e:
        logger.error(f"Failed to get Jira issue types: {e}")
        raise HTTPException(status_code=500, detail="Failed to get Jira issue types")

@router.get("/priorities", response_model=List[JiraPriority])
async def get_jira_priorities(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """
    Get all Jira priorities.
    """
    token = db.query(JiraToken).filter(
        JiraToken.organization_id == organization.id
    ).first()
    
    if not token:
        raise HTTPException(status_code=404, detail="No Jira connection found")
    
    # Check if token is valid
    is_valid = jira_service.validate_token(token)
    
    # If token is expired, try to refresh it
    if not is_valid:
        try:
            token_data = await jira_service.refresh_token(token.refresh_token)
            
            # Update token in database
            for key, value in token_data.items():
                setattr(token, key, value)
            
            db.commit()
        except Exception as e:
            logger.error(f"Failed to refresh Jira token: {e}")
            raise HTTPException(status_code=401, detail="Jira token expired and could not be refreshed")
    
    try:
        priorities = await jira_service.get_priorities(token.access_token, token.cloud_id)
        return priorities
    except Exception as e:
        logger.error(f"Failed to get Jira priorities: {e}")
        raise HTTPException(status_code=500, detail="Failed to get Jira priorities")

@router.get("/projects/{project_key}/issue-types/{issue_type_id}/has-priority")
async def check_priority_availability(
    project_key: str,
    issue_type_id: str,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """
    Check if priority field is available for a specific project and issue type.
    """
    token = db.query(JiraToken).filter(
        JiraToken.organization_id == organization.id
    ).first()
    
    if not token:
        raise HTTPException(status_code=404, detail="No Jira connection found")
    
    # Check if token is valid
    is_valid = jira_service.validate_token(token)
    
    # If token is expired, try to refresh it
    if not is_valid:
        try:
            token_data = await jira_service.refresh_token(token.refresh_token)
            
            # Update token in database
            for key, value in token_data.items():
                setattr(token, key, value)
            
            db.commit()
        except Exception as e:
            logger.error(f"Failed to refresh Jira token: {e}")
            raise HTTPException(status_code=401, detail="Jira token expired and could not be refreshed")
    
    try:
        has_priority = await jira_service.is_priority_available(
            token.access_token, 
            token.cloud_id, 
            project_key, 
            issue_type_id
        )
        return {"hasPriority": has_priority}
    except Exception as e:
        logger.error(f"Failed to check priority availability: {e}")
        raise HTTPException(status_code=500, detail="Failed to check priority availability")

@router.post("/issues")
async def create_jira_issue(
    issue_data: CreateJiraIssueModel,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(require_permissions("manage_organization")),
    db: Session = Depends(get_db)
):
    """
    Create a new Jira issue.
    """
    try:
        # Create the issue using the wrapper method
        result = await jira_service.create_issue(
            organization=organization,
            db=db,
            issue_data=issue_data
        )
        
        # Return the issue key and URL
        return {
            "key": result.get("key"),
            "id": result.get("id"),
            "self": result.get("self")
        }
    except JiraAuthError as e:
        logger.error(f"Jira authentication error: {e}")
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create Jira issue: {e}")
        raise HTTPException(status_code=500, detail="Failed to create Jira issue")

@router.post("/agent-config/{agent_id}")
async def save_agent_jira_config(
    agent_id: str,
    config: AgentJiraConfigModel,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(require_permissions("manage_organization")),
    db: Session = Depends(get_db)
):
    """
    Save Jira configuration for an agent.
    """
    # Check if agent belongs to the organization
    # This would typically be done with a query to your agent table
    
    # Check if Jira is connected
    token = db.query(JiraToken).filter(
        JiraToken.organization_id == organization.id
    ).first()
    
    if not token and config.enabled:
        raise HTTPException(status_code=400, detail="Cannot enable Jira integration: Jira is not connected")
    
    # Check if config already exists
    existing_config = db.query(AgentJiraConfig).filter(
        AgentJiraConfig.agent_id == agent_id
    ).first()
    
    if existing_config:
        # Update existing config
        existing_config.enabled = config.enabled
        existing_config.project_key = config.projectKey
        existing_config.issue_type_id = config.issueTypeId
    else:
        # Create new config
        new_config = AgentJiraConfig(
            agent_id=agent_id,
            enabled=config.enabled,
            project_key=config.projectKey,
            issue_type_id=config.issueTypeId
        )
        db.add(new_config)
    
    db.commit()
    
    return {"message": "Agent Jira configuration saved successfully"}

@router.get("/agent-config/{agent_id}")
async def get_agent_jira_config(
    agent_id: str,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """
    Get Jira configuration for an agent.
    """
    # Check if agent belongs to the organization
    # This would typically be done with a query to your agent table
    
    config = db.query(AgentJiraConfig).filter(
        AgentJiraConfig.agent_id == agent_id
    ).first()
    
    if not config:
        return {
            "enabled": False,
            "projectKey": None,
            "issueTypeId": None
        }
    
    return {
        "enabled": config.enabled,
        "projectKey": config.project_key,
        "issueTypeId": config.issue_type_id
    } 
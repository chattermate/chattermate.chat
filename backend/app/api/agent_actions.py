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

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.agents.host_actions.spec import model_view
from app.core.auth import require_any_permission, require_permissions
from app.core.logger import get_logger
from app.database import get_db
from app.models.agent_action import AgentAction
from app.models.schemas.agent_action import (
    AgentActionCreate, AgentActionModelView, AgentActionResponse, AgentActionUpdate,
)
from app.models.user import User
from app.repositories.agent_action import AgentActionRepository, DuplicateActionName
from app.services.agent_action_access import check_action_quota, display_cap
from app.services.agent_ownership import get_owned_agent

router = APIRouter()
logger = get_logger(__name__)


class AgentActionListResponse(BaseModel):
    actions: List[AgentActionResponse]
    # Most actions this agent may have on the org's plan.
    cap: int


def _get_action(repo: AgentActionRepository, agent_id: UUID, action_id: UUID) -> AgentAction:
    action = repo.get(agent_id, action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    return action


def _duplicate_name(name: str) -> HTTPException:
    return HTTPException(status_code=409, detail=f"This agent already has an action named '{name}'")


def _reject_duplicate_name(repo: AgentActionRepository, agent_id: UUID, name: str, own_id: Optional[UUID] = None) -> None:
    existing = repo.get_by_name(agent_id, name)
    if existing and existing.id != own_id:
        raise _duplicate_name(name)


@router.get("/{agent_id}/actions", response_model=AgentActionListResponse)
async def list_actions(
    agent_id: UUID,
    current_user: User = Depends(require_any_permission("view_agents", "manage_agents")),
    db: Session = Depends(get_db),
):
    try:
        get_owned_agent(db, agent_id, current_user.organization_id)
        actions = AgentActionRepository(db).list_for_agent(agent_id)
        return AgentActionListResponse(
            actions=actions,
            cap=display_cap(db, current_user.organization_id),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing actions for agent {agent_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to list actions")


@router.post("/{agent_id}/actions", response_model=AgentActionResponse, status_code=status.HTTP_201_CREATED)
async def create_action(
    agent_id: UUID,
    data: AgentActionCreate,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db),
):
    try:
        # Row-lock the agent so concurrent creates count one at a time and can't
        # pass the cap together (a no-op on SQLite).
        get_owned_agent(db, agent_id, current_user.organization_id, for_update=True)
        repo = AgentActionRepository(db)
        check_action_quota(db, current_user.organization_id, repo.count_for_agent(agent_id))
        _reject_duplicate_name(repo, agent_id, data.name)
        return repo.create(current_user.organization_id, agent_id, data)
    except DuplicateActionName:
        raise _duplicate_name(data.name)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating action for agent {agent_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to create action")


@router.put("/{agent_id}/actions/{action_id}", response_model=AgentActionResponse)
async def update_action(
    agent_id: UUID,
    action_id: UUID,
    data: AgentActionUpdate,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db),
):
    try:
        get_owned_agent(db, agent_id, current_user.organization_id)
        repo = AgentActionRepository(db)
        action = _get_action(repo, agent_id, action_id)
        _reject_duplicate_name(repo, agent_id, data.name, own_id=action.id)
        return repo.update(action, data)
    except DuplicateActionName:
        raise _duplicate_name(data.name)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating action {action_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update action")


class AgentActionEnabledUpdate(BaseModel):
    enabled: bool


@router.patch("/{agent_id}/actions/{action_id}", response_model=AgentActionResponse)
async def set_action_enabled(
    agent_id: UUID,
    action_id: UUID,
    data: AgentActionEnabledUpdate,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db),
):
    """Turn an action on or off without re-validating the rest of it."""
    try:
        get_owned_agent(db, agent_id, current_user.organization_id)
        repo = AgentActionRepository(db)
        return repo.set_enabled(_get_action(repo, agent_id, action_id), data.enabled)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling action {action_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update action")


@router.delete("/{agent_id}/actions/{action_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_action(
    agent_id: UUID,
    action_id: UUID,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db),
):
    try:
        get_owned_agent(db, agent_id, current_user.organization_id)
        repo = AgentActionRepository(db)
        repo.delete(_get_action(repo, agent_id, action_id))
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting action {action_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete action")


@router.get("/{agent_id}/actions/{action_id}/model-view", response_model=AgentActionModelView)
async def get_action_model_view(
    agent_id: UUID,
    action_id: UUID,
    current_user: User = Depends(require_any_permission("view_agents", "manage_agents")),
    db: Session = Depends(get_db),
):
    """What the model is told about this action, for the dashboard preview."""
    try:
        get_owned_agent(db, agent_id, current_user.organization_id)
        return model_view(_get_action(AgentActionRepository(db), agent_id, action_id))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error building model view for action {action_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to load action preview")

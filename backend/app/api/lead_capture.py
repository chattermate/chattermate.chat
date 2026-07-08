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

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.logger import get_logger
from app.database import get_db
from app.core.auth import require_permissions
from app.models.user import User
from app.models.agent import Agent
from app.repositories.lead_capture import LeadCaptureConfigRepository
from app.models.schemas.lead_capture import (
    LeadCaptureConfigUpdate, LeadCaptureConfigResponse,
)

# Enterprise gating — Lead Capture is a paid-plan feature where the enterprise
# module is installed; OSS/community deployments are unrestricted (same shape as
# the MCP/Workflow gates).
try:
    from app.enterprise.services.feature_access import require_accessible_subscription
    HAS_ENTERPRISE = True
except ImportError:
    HAS_ENTERPRISE = False

router = APIRouter()
logger = get_logger(__name__)


def check_lead_capture_access(current_user: User, db: Session) -> None:
    """Gate Lead Capture behind an accessible (paid) subscription when the
    enterprise module is present. A dedicated 'lead_capture' plan-feature key can
    be added to the plan matrix later to differentiate tiers; until then, any
    accessible plan unlocks it."""
    if not HAS_ENTERPRISE:
        return
    # Raises 403 when the org has no accessible plan.
    require_accessible_subscription(db, current_user.organization_id)


def _get_owned_agent(agent_id: UUID, current_user: User, db: Session) -> Agent:
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    # Return 404 for both missing and cross-org agents (don't reveal existence).
    if not agent or agent.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.get("/{agent_id}/lead-capture", response_model=LeadCaptureConfigResponse)
async def get_lead_capture_config(
    agent_id: UUID,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db),
):
    """Fetch the agent's lead-capture config, lazily creating a default (OFF) row."""
    try:
        _get_owned_agent(agent_id, current_user, db)
        config = LeadCaptureConfigRepository(db).get_or_create(agent_id)
        return config
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching lead capture config: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch lead capture config")


@router.put("/{agent_id}/lead-capture", response_model=LeadCaptureConfigResponse)
async def update_lead_capture_config(
    agent_id: UUID,
    data: LeadCaptureConfigUpdate,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db),
):
    """Full-replace the agent's lead-capture config (whole tab saved at once)."""
    try:
        _get_owned_agent(agent_id, current_user, db)
        check_lead_capture_access(current_user, db)
        # Assignment target (stored-only in phase 1) must belong to this org — reject
        # cross-org user ids so the routing FK can never dangle when routing ships.
        if data.assignment_target_user_id is not None:
            target = db.query(User).filter(
                User.id == data.assignment_target_user_id,
                User.organization_id == current_user.organization_id,
            ).first()
            if not target:
                raise HTTPException(status_code=400, detail="Assignment target user not found in this organization")
        config = LeadCaptureConfigRepository(db).update(agent_id, data)
        return config
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating lead capture config: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update lead capture config")

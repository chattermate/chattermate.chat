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

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.channels.accounts import get_org_account_or_404, to_account_out
from app.core.auth import get_current_organization, require_permissions
from app.database import get_db
from app.models.organization import Organization
from app.models.schemas.channel import AgentChannelConfigRequest, ChannelAccountOut
from app.models.user import User
from app.repositories.agent import AgentRepository
from app.repositories.channels import AgentChannelConfigRepository
from app.core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.post("/{account_id}", response_model=ChannelAccountOut)
async def set_account_agent(
    account_id: UUID,
    request: AgentChannelConfigRequest,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Route a connected channel account to an AI agent."""
    account = get_org_account_or_404(db, account_id, organization)

    agent = AgentRepository(db).get_agent(request.agent_id)
    if agent is None or agent.organization_id != organization.id:
        raise HTTPException(status_code=404, detail="Agent not found")

    AgentChannelConfigRepository(db).set_agent(account.id, request.agent_id, request.is_active)
    return to_account_out(db, account)


@router.delete("/{account_id}")
async def clear_account_agent(
    account_id: UUID,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Stop routing a channel account to any agent (messages will be ignored)."""
    account = get_org_account_or_404(db, account_id, organization)
    AgentChannelConfigRepository(db).delete_by_account(account.id)
    return {"status": "cleared"}

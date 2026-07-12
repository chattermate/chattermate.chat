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

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_organization, require_permissions
from app.core.config import settings
from app.database import get_db
from app.models.channels import ChannelType
from app.models.organization import Organization
from app.models.schemas.channel import ChannelAccountOut
from app.models.user import User
from app.repositories.channels import ChannelAccountRepository, AgentChannelConfigRepository
from app.core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

# Sentinel: distinguishes "config not passed, look it up" from "no config"
_UNRESOLVED = object()


def channel_webhook_url(account) -> str | None:
    """The webhook URL the customer must configure on their provider, for the
    channels where that's a manual step. Auto-managed channels return None."""
    base = f"{settings.BACKEND_URL.rstrip('/')}{settings.API_V1_STR}/webhooks"
    if account.channel_type == ChannelType.EMAIL.value:
        return f"{base}/email/{account.id}?token={account.webhook_secret}"
    if account.channel_type == ChannelType.SMS.value:
        provider = (account.settings or {}).get("provider", "twilio")
        return f"{base}/sms/{provider}/{account.id}"
    if account.channel_type == ChannelType.TEAMS.value:
        return f"{base}/teams/{account.id}"
    return None


def get_org_account_or_404(db: Session, account_id: UUID, organization: Organization):
    """Load a channel account and enforce org ownership."""
    account = ChannelAccountRepository(db).get_by_id(account_id)
    if account is None or account.organization_id != organization.id:
        raise HTTPException(status_code=404, detail="Channel account not found")
    return account


def to_account_out(db: Session, account, config=_UNRESOLVED) -> ChannelAccountOut:
    if config is _UNRESOLVED:
        config = AgentChannelConfigRepository(db).get_by_account(account.id)
    out = ChannelAccountOut.model_validate(account)
    out.agent_id = config.agent_id if config and config.is_active else None
    out.webhook_url = channel_webhook_url(account)
    return out


@router.get("/accounts", response_model=List[ChannelAccountOut])
async def list_channel_accounts(
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """All connected channel accounts for the organization."""
    accounts = ChannelAccountRepository(db).list_by_org(organization.id)
    configs = AgentChannelConfigRepository(db).map_by_accounts([a.id for a in accounts])
    return [to_account_out(db, account, configs.get(account.id)) for account in accounts]

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

from app.core.auth import (
    INBOX_PERMISSIONS,
    check_permissions,
    get_current_organization,
    require_any_permission,
    require_permissions,
)
from app.services.meta_own_app import AUTO_WEBHOOK_SETTING, is_own_app, own_app_webhook_url
from app.core.config import webhooks_base_url
from app.database import get_db
from app.models.channels import ChannelType
from app.models.organization import Organization
from app.models.schemas.channel import ChannelAccountOut
from app.models.user import User
from app.repositories.channels import ChannelAccountRepository, AgentChannelConfigRepository
from app.repositories.channels.accounts import needs_reconnect, send_problem
from app.core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

# Sentinel: distinguishes "config not passed, look it up" from "no config"
_UNRESOLVED = object()


def channel_webhook_url(account) -> str | None:
    """The webhook URL the customer must configure on their provider, for the
    channels where that's a manual step. Auto-managed channels return None."""
    base = webhooks_base_url()
    if account.channel_type == ChannelType.EMAIL.value:
        return f"{base}/email/{account.id}?token={account.webhook_secret}"
    if account.channel_type == ChannelType.SMS.value:
        provider = (account.settings or {}).get("provider", "twilio")
        return f"{base}/sms/{provider}/{account.id}?token={account.webhook_secret}"
    if is_own_app(account):
        return own_app_webhook_url(account)
    return None


def get_org_account_or_404(db: Session, account_id: UUID, organization: Organization):
    """Load a channel account and enforce org ownership."""
    account = ChannelAccountRepository(db).get_by_id(account_id)
    if account is None or account.organization_id != organization.id:
        raise HTTPException(status_code=404, detail="Channel account not found")
    return account


def to_account_out(
    db: Session, account, config=_UNRESOLVED, include_webhook_url: bool = True
) -> ChannelAccountOut:
    """Serialise a channel account.

    Pass include_webhook_url=False for callers who are not org admins: the URL
    embeds `webhook_secret`, which is the ONLY authentication on the inbound
    email and SMS webhooks (api/webhooks/email.py, api/webhooks/sms.py).
    Handing it to an agent would let them post forged inbound messages into any
    of the org's conversations.
    """
    if config is _UNRESOLVED:
        config = AgentChannelConfigRepository(db).get_by_account(account.id)
    out = ChannelAccountOut.model_validate(account)
    out.agent_id = config.agent_id if config and config.is_active else None
    out.webhook_url = channel_webhook_url(account) if include_webhook_url else None
    out.needs_reconnect = needs_reconnect(account)
    out.send_problem = send_problem(account)
    # Meta asks for this token when the customer points their app at us
    if include_webhook_url and is_own_app(account):
        out.webhook_verify_token = account.webhook_secret
        out.webhook_auto_configured = (account.settings or {}).get(AUTO_WEBHOOK_SETTING)
    return out


@router.get("/accounts", response_model=List[ChannelAccountOut])
async def list_channel_accounts(
    # Org admins (Integrations settings) OR inbox agents: the inbox reads this
    # to know whether there is a WhatsApp number to start a conversation from,
    # so gating it admin-only hid the feature from the people it is for.
    current_user: User = Depends(
        require_any_permission("manage_organization", *INBOX_PERMISSIONS)),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """All connected channel accounts for the organization."""
    accounts = ChannelAccountRepository(db).list_by_org(organization.id)
    configs = AgentChannelConfigRepository(db).map_by_accounts([a.id for a in accounts])
    # Only the Integrations settings screen needs the webhook URL, and only an
    # org admin can act on it — see to_account_out.
    include_webhook_url = check_permissions(current_user, ["manage_organization"])
    return [
        to_account_out(db, account, configs.get(account.id), include_webhook_url)
        for account in accounts
    ]

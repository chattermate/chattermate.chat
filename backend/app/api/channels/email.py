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

import asyncio
import smtplib
from email.utils import parseaddr
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.channels.accounts import get_org_account_or_404, to_account_out
from app.channels.email import validate_smtp
from app.core.auth import get_current_organization, require_permissions
from app.core.config import settings
from app.database import get_db
from app.models.channels import ChannelType
from app.models.organization import Organization
from app.models.schemas.channel import ChannelAccountOut, EmailConnectRequest
from app.models.user import User
from app.repositories.channels import ChannelAccountRepository
from app.core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


def _webhook_url(account) -> str:
    return (f"{settings.BACKEND_URL.rstrip('/')}{settings.API_V1_STR}"
            f"/webhooks/email/{account.id}?token={account.webhook_secret}")


async def _build_smtp_credentials(request: EmailConnectRequest, address: str) -> dict:
    """Assemble (and validate) per-inbox SMTP credentials, or {} to use the
    platform SMTP settings. Raises HTTPException on invalid/unreachable SMTP."""
    if not request.smtp_host:
        return {}
    if not (request.smtp_username and request.smtp_password):
        raise HTTPException(status_code=400,
                            detail="SMTP username and password are required when an SMTP host is set")
    creds = {
        "smtp_host": request.smtp_host.strip(),
        "smtp_port": request.smtp_port or 587,
        "smtp_username": request.smtp_username,
        "smtp_password": request.smtp_password,
        "from_email": (request.from_email or address).lower(),
        "smtp_use_ssl": request.smtp_use_ssl,
    }
    cfg = {
        "host": creds["smtp_host"], "port": int(creds["smtp_port"]),
        "username": creds["smtp_username"], "password": creds["smtp_password"],
        "from_email": creds["from_email"],
        "use_ssl": int(creds["smtp_port"]) == 465 if request.smtp_use_ssl is None else bool(request.smtp_use_ssl),
    }
    try:
        await asyncio.to_thread(validate_smtp, cfg)
    except smtplib.SMTPAuthenticationError as e:
        raise HTTPException(status_code=400, detail=_auth_error_detail(cfg["host"], e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not connect to SMTP server: {e}")
    return creds


def _auth_error_detail(host: str, exc: Exception) -> str:
    """Friendlier message for an SMTP login rejection — Gmail in particular
    needs an App Password, not the account password."""
    host = (host or "").lower()
    if "gmail" in host or "google" in host:
        return ("Gmail rejected the login. Gmail requires a 16-character App Password "
                "(not your normal account password), and 2-Step Verification must be "
                "enabled — create one at myaccount.google.com/apppasswords, then paste "
                "it here with the spaces removed.")
    return f"SMTP authentication failed — check the username and password ({exc})"


@router.post("", response_model=ChannelAccountOut)
async def connect_email(
    request: EmailConnectRequest,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Connect a support inbox. The response's webhook_url must be configured
    as the inbound-parse/forwarding target on the email provider. Outbound
    replies use the inbox's own SMTP when provided, else the platform SMTP."""
    _, address = parseaddr(request.inbound_address)
    address = (address or "").lower()
    if "@" not in address:
        raise HTTPException(status_code=400, detail="Enter a valid email address")

    credentials = await _build_smtp_credentials(request, address)

    repo = ChannelAccountRepository(db)
    existing = repo.get_by_external_id(ChannelType.EMAIL.value, address)
    if existing is not None:
        if existing.organization_id != organization.id:
            raise HTTPException(status_code=409, detail="This address is already connected to another organization")
        # Only overwrite SMTP creds when new ones were supplied — reconnecting
        # to update the agent/webhook must not silently wipe stored SMTP.
        if credentials:
            repo.update_credentials(existing, credentials)
        account = repo.set_active(existing, True)
    else:
        account = repo.create_account(
            organization_id=organization.id,
            channel_type=ChannelType.EMAIL.value,
            external_account_id=address,
            credentials=credentials,  # {} => platform SMTP fallback
            display_name=request.display_name or address,
        )
    out = to_account_out(db, account)
    out.webhook_url = _webhook_url(account)
    return out


@router.get("/{account_id}/webhook-url")
async def get_email_webhook_url(
    account_id: UUID,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Re-show the inbound webhook URL for an existing email account."""
    account = get_org_account_or_404(db, account_id, organization)
    if account.channel_type != ChannelType.EMAIL.value:
        raise HTTPException(status_code=404, detail="Channel account not found")
    return {"webhook_url": _webhook_url(account)}


@router.delete("/{account_id}")
async def disconnect_email(
    account_id: UUID,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    account = get_org_account_or_404(db, account_id, organization)
    if account.channel_type != ChannelType.EMAIL.value:
        raise HTTPException(status_code=404, detail="Channel account not found")
    ChannelAccountRepository(db).delete(account)
    return {"status": "disconnected"}

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
from app.channels import telegram as telegram_api
from app.core.auth import get_current_organization, require_permissions
from app.core.config import settings
from app.database import get_db
from app.models.channels import ChannelType
from app.models.organization import Organization
from app.models.schemas.channel import ChannelAccountOut, TelegramConnectRequest
from app.models.user import User
from app.repositories.channels import ChannelAccountRepository
from app.core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


def _webhook_url(account_id) -> str:
    return f"{settings.BACKEND_URL.rstrip('/')}{settings.API_V1_STR}/webhooks/telegram/{account_id}"


@router.post("", response_model=ChannelAccountOut)
async def connect_telegram(
    request: TelegramConnectRequest,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Connect a Telegram bot: validate the token with getMe, store the
    encrypted credentials, and register our webhook with a secret token."""
    bot_token = request.bot_token.strip()
    bot = await telegram_api.get_me(bot_token)
    if bot is None:
        raise HTTPException(status_code=400, detail="Invalid bot token")

    repo = ChannelAccountRepository(db)
    existing = repo.get_by_external_id(ChannelType.TELEGRAM.value, str(bot["id"]))
    if existing is not None:
        if existing.organization_id != organization.id:
            raise HTTPException(status_code=409, detail="This bot is already connected to another organization")
        repo.update_credentials(existing, {"bot_token": bot_token})
        account = repo.set_active(existing, True)
        created = False
    else:
        account = repo.create_account(
            organization_id=organization.id,
            channel_type=ChannelType.TELEGRAM.value,
            external_account_id=str(bot["id"]),
            credentials={"bot_token": bot_token},
            display_name=f"@{bot.get('username', bot['id'])}",
        )
        created = True

    webhook_ok, webhook_error = await telegram_api.set_webhook(
        bot_token, _webhook_url(account.id), account.webhook_secret)
    if not webhook_ok:
        # Roll back only a freshly created account; keep an existing one (and
        # its conversation history) intact on a transient webhook failure.
        if created:
            repo.delete(account)
        detail = f"Failed to register Telegram webhook: {webhook_error}"
        if "https" in webhook_error.lower():
            detail += " — set BACKEND_URL to a public HTTPS URL (e.g. your ngrok domain)"
        raise HTTPException(status_code=502, detail=detail)

    logger.info(f"Connected Telegram bot @{bot.get('username')} for org {organization.id}")
    return to_account_out(db, account)


@router.delete("/{account_id}")
async def disconnect_telegram(
    account_id: UUID,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Disconnect a Telegram bot: remove the webhook and delete the account."""
    account = get_org_account_or_404(db, account_id, organization)
    if account.channel_type != ChannelType.TELEGRAM.value:
        raise HTTPException(status_code=404, detail="Channel account not found")

    repo = ChannelAccountRepository(db)
    try:
        await telegram_api.delete_webhook(repo.get_credentials(account)["bot_token"])
    except Exception as e:
        logger.warning(f"Failed to remove Telegram webhook during disconnect: {e}")
    repo.delete(account)
    return {"status": "disconnected"}

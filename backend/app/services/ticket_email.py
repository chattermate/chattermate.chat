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

Direct email delivery for ticket notifications — the fallback when a ticket
has no linked chat conversation to deliver through (manual tickets created
from the dashboard). Reuses the email channel's SMTP plumbing: the org's
connected email inbox when one exists (correct SPF/DKIM from their own
domain), platform SMTP otherwise.
"""

import asyncio
from email.message import EmailMessage
from email.utils import make_msgid
from typing import Optional

from sqlalchemy.orm import Session

from app.channels.email import _open_smtp, smtp_config
from app.core.config import settings
from app.core.logger import get_logger
from app.models.channels import ChannelAccount
from app.repositories.channels.accounts import ChannelAccountRepository

logger = get_logger(__name__)

EMAIL_CHANNEL_TYPE = "email"


def _org_email_account(db: Session, organization_id) -> Optional[ChannelAccount]:
    accounts = ChannelAccountRepository(db).list_by_org(organization_id, EMAIL_CHANNEL_TYPE)
    for account in accounts:
        if account.is_active:
            return account
    return None


def _resolve_smtp(db: Session, organization_id) -> dict:
    account = _org_email_account(db, organization_id)
    if account is not None:
        return smtp_config(account)
    return {
        "host": settings.SMTP_SERVER,
        "port": int(settings.SMTP_PORT),
        "username": settings.SMTP_USERNAME,
        "password": settings.SMTP_PASSWORD,
        "from_email": settings.FROM_EMAIL,
        "use_ssl": int(settings.SMTP_PORT) == 465,
    }


def _smtp_send(cfg: dict, message: EmailMessage) -> None:
    with _open_smtp(cfg) as smtp:
        smtp.send_message(message)


async def send_ticket_email(
    db: Session, organization_id, to_email: str, subject: str, body: str
) -> bool:
    """Send a plain-text ticket notification email. Returns False (and logs)
    on failure — ticket mutations must never fail because SMTP hiccuped."""
    try:
        cfg = _resolve_smtp(db, organization_id)
        message = EmailMessage()
        message["From"] = cfg["from_email"]
        message["To"] = to_email
        message["Subject"] = subject
        message["Message-ID"] = make_msgid()
        message.set_content(body)
        await asyncio.to_thread(_smtp_send, cfg, message)
        return True
    except Exception as e:
        logger.error(f"Ticket email to {to_email} failed: {e}")
        return False

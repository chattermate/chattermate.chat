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
import re
import secrets
from email.message import EmailMessage
from email.utils import make_msgid
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.channels.email import open_smtp, platform_smtp_config, smtp_config
from app.core.config import settings
from app.core.logger import get_logger
from app.models.channels import ChannelAccount
from app.models.ticket import TICKET_NUMBER_PREFIX
from app.repositories.channels.accounts import ChannelAccountRepository

logger = get_logger(__name__)

EMAIL_CHANNEL_TYPE = "email"

# Message-ID local part for ticket mail: 'ticket-<uuid hex>.<unique>'. The
# ticket id lives in the address itself, so a reply that quotes any of our
# Message-IDs back in References identifies its ticket with no lookup table.
# Every sent message still gets its own unique id — reusing one id across
# messages makes Gmail collapse them into a single copy.
_TICKET_MSGID_RE = re.compile(r"ticket-([0-9a-f]{32})(?:\.[^@\s>]+)?@", re.I)
# The phantom id every ticket mail references. Never sent as a message itself:
# it is the shared thread root that ties separate notifications together.
_ROOT_SUFFIX = "root"
_SUBJECT_TOKEN_RE = re.compile(rf"\[{TICKET_NUMBER_PREFIX}-(\d+)\]", re.I)

DEFAULT_MSGID_DOMAIN = "chattermate.chat"


def _msgid_domain(from_email: Optional[str] = None) -> str:
    """Right-hand side of generated Message-IDs. Cosmetic only — the parser
    matches on the local part, so mail sent from a customer's own inbox domain
    still threads back to its ticket."""
    candidate = from_email or settings.FROM_EMAIL or ""
    _, _, domain = candidate.rpartition("@")
    return domain.strip("> ").lower() or DEFAULT_MSGID_DOMAIN


def ticket_root_message_id(ticket_id, from_email: Optional[str] = None) -> str:
    """The stable per-ticket thread root, carried in References on every mail."""
    return f"<ticket-{UUID(str(ticket_id)).hex}.{_ROOT_SUFFIX}@{_msgid_domain(from_email)}>"


def new_ticket_message_id(ticket_id, from_email: Optional[str] = None) -> str:
    """A fresh Message-ID for one outbound ticket mail."""
    return (
        f"<ticket-{UUID(str(ticket_id)).hex}.{secrets.token_hex(8)}"
        f"@{_msgid_domain(from_email)}>"
    )


def build_thread_headers(
    ticket_id, in_reply_to: Optional[str] = None, from_email: Optional[str] = None
) -> dict:
    """Threading headers for one ticket notification.

    References always starts at the ticket root so every notification for a
    ticket lands in one client-side thread; In-Reply-To points at the
    customer's most recent reply when we have seen one, so their client keeps
    the conversation in order.
    """
    root = ticket_root_message_id(ticket_id, from_email)
    references: List[str] = [root]
    if in_reply_to and in_reply_to != root:
        references.append(in_reply_to)
    return {
        "Message-ID": new_ticket_message_id(ticket_id, from_email),
        "In-Reply-To": in_reply_to or root,
        "References": " ".join(references),
    }


def ticket_ids_from_references(*values: Optional[str]) -> List[UUID]:
    """Ticket ids encoded in In-Reply-To/References/Message-ID headers, most
    recently referenced first — References lists ancestors oldest-first, and
    the nearest ancestor is the better match."""
    found: List[UUID] = []
    for value in values:
        if not value:
            continue
        for hex_id in _TICKET_MSGID_RE.findall(str(value)):
            try:
                ticket_id = UUID(hex_id)
            except ValueError:
                continue
            if ticket_id not in found:
                found.append(ticket_id)
    found.reverse()
    return found


def ticket_number_from_subject(subject: Optional[str]) -> Optional[int]:
    """The [TKT-12] token a customer's client keeps in the reply subject —
    the fallback when a mail client drops the threading headers."""
    if not subject:
        return None
    match = _SUBJECT_TOKEN_RE.search(str(subject))
    return int(match.group(1)) if match else None


def _org_email_account(db: Session, organization_id) -> Optional[ChannelAccount]:
    accounts = ChannelAccountRepository(db).list_by_org(organization_id, EMAIL_CHANNEL_TYPE)
    for account in accounts:
        if account.is_active:
            return account
    return None


def resolve_org_smtp(db: Session, organization_id) -> dict:
    """The org's own email inbox when it has one, else the platform's account."""
    account = _org_email_account(db, organization_id)
    if account is not None:
        return smtp_config(account)
    return platform_smtp_config(settings.FROM_EMAIL)


def send_smtp(cfg: dict, message: EmailMessage, to_addrs: Optional[List[str]] = None) -> None:
    """Send `message`; `to_addrs` names the only recipients (else its headers do)."""
    with open_smtp(cfg) as smtp:
        smtp.send_message(message, to_addrs=to_addrs)


async def send_ticket_email(
    db: Session,
    organization_id,
    to_email: str,
    subject: str,
    body: str,
    ticket_id=None,
    in_reply_to: Optional[str] = None,
) -> bool:
    """Send a plain-text ticket notification email. Returns False (and logs)
    on failure — ticket mutations must never fail because SMTP hiccuped.

    With a ticket_id the mail carries ticket-scoped threading headers, so the
    customer's reply comes back identifiable as a reply to that ticket."""
    try:
        cfg = resolve_org_smtp(db, organization_id)
        message = EmailMessage()
        message["From"] = cfg["from_email"]
        message["To"] = to_email
        message["Subject"] = subject
        if ticket_id is not None:
            for header, value in build_thread_headers(
                ticket_id, in_reply_to, cfg["from_email"]
            ).items():
                message[header] = value
        else:
            message["Message-ID"] = make_msgid()
        message.set_content(body)
        await asyncio.to_thread(send_smtp, cfg, message)
        return True
    except Exception as e:
        logger.error(f"Ticket email to {to_email} failed: {e}")
        return False

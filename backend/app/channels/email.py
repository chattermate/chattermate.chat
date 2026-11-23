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
import hashlib
import hmac
import json
import re
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import parseaddr, make_msgid
from typing import ClassVar, List, Optional

from app.channels.base import ChannelAdapter, InboundMessage, SendResult
from app.channels.registry import register_adapter
from app.core.config import settings
from app.core.security import decrypt_api_key
from app.models.channels import ChannelAccount, ChannelConversation, ChannelType
from app.core.logger import get_logger

logger = get_logger(__name__)


def smtp_config(account: ChannelAccount) -> dict:
    """Resolve the outbound SMTP settings for an inbox.

    Uses the account's own encrypted SMTP credentials when present (so replies
    go out from the inbox's own domain with correct SPF/DKIM), otherwise falls
    back to the platform SMTP settings.
    """
    creds = {}
    if account.encrypted_credentials:
        try:
            creds = json.loads(decrypt_api_key(account.encrypted_credentials))
        except Exception as e:
            logger.error(f"Failed to read email SMTP credentials for {account.id}: {e}")

    if creds.get("smtp_host"):
        return inbox_smtp_config(creds, account.external_account_id)
    return platform_smtp_config(account.external_account_id)


def _use_ssl(port: int, use_ssl: Optional[bool]) -> bool:
    """Implicit TLS on 465 unless set explicitly; other ports try STARTTLS."""
    return port == 465 if use_ssl is None else bool(use_ssl)


def inbox_smtp_config(creds: dict, default_from: str) -> dict:
    """Connection settings from an inbox's own SMTP credentials (the stored
    smtp_* keys). `default_from` is used when no from_email was given."""
    port = int(creds.get("smtp_port") or 587)
    return {
        "host": creds["smtp_host"],
        "port": port,
        "username": creds.get("smtp_username"),
        "password": creds.get("smtp_password"),
        "from_email": creds.get("from_email") or default_from,
        "use_ssl": _use_ssl(port, creds.get("smtp_use_ssl")),
    }


def platform_smtp_config(from_email: str) -> dict:
    """Connection settings for the platform's own account (SMTP_* settings).
    With no SMTP_USERNAME there is no login, which is how local Mailpit runs."""
    port = int(settings.SMTP_PORT)
    return {
        "host": settings.SMTP_SERVER,
        "port": port,
        "username": settings.SMTP_USERNAME,
        "password": settings.SMTP_PASSWORD,
        "from_email": from_email,
        "use_ssl": _use_ssl(port, None),
    }


class _PinnedSMTP(smtplib.SMTP):
    """Dials an address checked beforehand instead of resolving the host name
    again, while TLS still checks the certificate against the host name."""

    def __init__(self, host: str, port: int, address: str, **kwargs):
        self._address = address
        super().__init__(host, port, **kwargs)

    def _get_socket(self, host, port, timeout):
        return super()._get_socket(self._address, port, timeout)


class _PinnedSMTPSSL(_PinnedSMTP, smtplib.SMTP_SSL):
    """The same, over implicit TLS (port 465)."""


def _connect(cfg: dict, context: Optional[ssl.SSLContext]) -> smtplib.SMTP:
    host, port, address = cfg["host"], cfg["port"], cfg.get("connect_address")
    if cfg["use_ssl"]:
        if address:
            return _PinnedSMTPSSL(host, port, address, context=context, timeout=SMTP_TIMEOUT_SECONDS)
        return smtplib.SMTP_SSL(host, port, context=context, timeout=SMTP_TIMEOUT_SECONDS)
    if address:
        return _PinnedSMTP(host, port, address, timeout=SMTP_TIMEOUT_SECONDS)
    return smtplib.SMTP(host, port, timeout=SMTP_TIMEOUT_SECONDS)


def open_smtp(cfg: dict) -> smtplib.SMTP:
    """A connected, logged-in SMTP session for a config built above. With
    `require_tls` set, the server must encrypt with a certificate valid for its
    name, or it is refused rather than sent the password. `connect_address`, when
    set, is the address to dial (one checked as safe), so the name can't be
    re-pointed between the check and the connection."""
    # Inboxes connected before stay as they were; new sending insists on a valid certificate
    context = ssl.create_default_context() if cfg.get("require_tls") else None
    smtp = _connect(cfg, context)
    if not cfg["use_ssl"]:
        try:
            smtp.starttls(context=context)
        except smtplib.SMTPNotSupportedError:
            if cfg.get("require_tls"):
                smtp.close()
                raise
            logger.warning("SMTP server does not support STARTTLS; sending unencrypted")
    if cfg.get("username"):
        smtp.login(cfg["username"], cfg["password"])
    return smtp


def validate_smtp(cfg: dict) -> None:
    """Open + authenticate an SMTP connection to verify per-inbox credentials.
    Raises on failure. Runs in a worker thread (smtplib is blocking)."""
    with open_smtp(cfg) as smtp:
        smtp.noop()

SMTP_TIMEOUT_SECONDS = 20.0
# Strip quoted history so the agent sees only the new content
_REPLY_MARKERS = (
    re.compile(r"^On .{5,80} wrote:\s*$", re.M),
    re.compile(r"^-{2,}\s*Original Message\s*-{2,}", re.M | re.I),
    re.compile(r"^_{10,}\s*$", re.M),
)


def strip_quoted_reply(text: str) -> str:
    """Cut the email body at the first quoted-history marker."""
    cut = len(text)
    for marker in _REPLY_MARKERS:
        match = marker.search(text)
        if match:
            cut = min(cut, match.start())
    lines = [line for line in text[:cut].splitlines() if not line.startswith(">")]
    stripped = "\n".join(lines).strip()
    # Never lose a message to over-eager stripping — fall back to the raw body
    return stripped or text.strip()


class EmailAdapter(ChannelAdapter):
    """Email as a messaging channel.

    Inbound: an inbound-parse webhook (SendGrid/Brevo-style JSON or form post
    forwarded to /webhooks/email/{account_id}?token=...). Conversations are
    keyed by the customer's address — one continuous conversation per sender
    per inbox. Outbound: platform SMTP, with In-Reply-To/References threading
    from the last inbound Message-ID kept on the conversation."""

    channel_type: ClassVar[str] = ChannelType.EMAIL.value

    async def verify_webhook(self, headers: dict, raw_body: bytes, account: Optional[ChannelAccount]) -> bool:
        # The per-account secret rides on the URL (?token=), checked in the
        # route because generic parse providers can't sign requests.
        return account is not None

    def parse_inbound(self, payload: dict) -> List[InboundMessage]:
        """Normalize a parsed-email payload. Accepts the common field names of
        SendGrid Inbound Parse (from/to/subject/text/headers) and Brevo
        (From/To/Subject/RawTextBody/MessageId). Machine-generated mail
        (autoresponders, bounces) is dropped to prevent reply loops."""
        if self._is_auto_generated(payload):
            return []
        sender = payload.get("from") or payload.get("From") or ""
        if isinstance(sender, dict):  # Brevo: {"Address": ..., "Name": ...}
            sender_name, sender_email = sender.get("Name"), sender.get("Address", "")
        else:
            sender_name, sender_email = parseaddr(str(sender))
        sender_email = (sender_email or "").lower()
        if not sender_email:
            return []

        text = payload.get("text") or payload.get("RawTextBody") or payload.get("body") or ""
        text = strip_quoted_reply(str(text))
        if not text:
            return []

        message_id = str(payload.get("MessageId") or payload.get("message_id")
                         or self._header(payload, "Message-ID") or "")
        subject = str(payload.get("subject") or payload.get("Subject") or "")

        return [InboundMessage(
            external_account_id="",  # resolved from the webhook path
            external_conversation_id=sender_email,
            external_user_id=sender_email,
            external_message_id=message_id or
                f"{sender_email}:{hashlib.sha256(text.encode()).hexdigest()[:32]}",
            text=text,
            profile={"name": sender_name or None, "email": sender_email,
                     "subject": subject, "inbound_message_id": message_id,
                     # Threading headers, kept raw — ticket reply matching
                     # reads the Message-IDs we minted back out of them.
                     "in_reply_to": self._threading_header(payload, "In-Reply-To"),
                     "references": self._threading_header(payload, "References")},
        )]

    def conversation_state(self, inbound: InboundMessage) -> dict:
        state = {}
        if inbound.profile.get("inbound_message_id"):
            state["last_message_id"] = inbound.profile["inbound_message_id"]
        if inbound.profile.get("subject"):
            state["subject"] = inbound.profile["subject"]
        return state

    async def send_text(self, account: ChannelAccount, conversation: ChannelConversation, text: str) -> SendResult:
        extra = conversation.extra or {}
        subject = extra.get("subject") or "Re: your message"
        if subject and not subject.lower().startswith("re:"):
            subject = f"Re: {subject}"

        cfg = smtp_config(account)
        message = EmailMessage()
        message["From"] = cfg["from_email"]
        message["To"] = conversation.external_conversation_id
        message["Subject"] = subject
        message["Message-ID"] = make_msgid()
        last_inbound_id = extra.get("last_message_id")
        if last_inbound_id:
            message["In-Reply-To"] = last_inbound_id
            message["References"] = last_inbound_id
        message.set_content(text)

        try:
            await asyncio.to_thread(self._smtp_send, cfg, message)
            return SendResult(ok=True, external_message_id=message["Message-ID"])
        except Exception as e:
            logger.error(f"Email send failed: {e}")
            return SendResult(ok=False, error=str(e))

    @staticmethod
    def _smtp_send(cfg: dict, message: EmailMessage) -> None:
        with open_smtp(cfg) as smtp:
            smtp.send_message(message)

    @staticmethod
    def _is_auto_generated(payload: dict) -> bool:
        """True for autoresponders/bounces (Auto-Submitted, Precedence bulk,
        X-Auto-Response-Suppress) — answering those creates mail loops."""
        headers = payload.get("headers")
        text = headers if isinstance(headers, str) else ""
        if isinstance(headers, dict):
            text = "\n".join(f"{k}: {v}" for k, v in headers.items())
        lowered = text.lower()
        if re.search(r"^auto-submitted:\s*(?!no)", lowered, re.M):
            return True
        if re.search(r"^precedence:\s*(bulk|junk|auto_reply|list)", lowered, re.M):
            return True
        if "x-auto-response-suppress:" in lowered:
            return True
        return False

    @classmethod
    def _threading_header(cls, payload: dict, name: str) -> str:
        """In-Reply-To/References, read from the raw headers the provider
        forwards (dict or string, both handled by _header). Also accepts a
        top-level lowercased field for providers that flatten headers onto the
        payload."""
        return payload.get(name.lower()) or cls._header(payload, name) or ""

    @staticmethod
    def _header(payload: dict, name: str) -> Optional[str]:
        headers = payload.get("headers")
        if isinstance(headers, dict):
            return headers.get(name) or headers.get(name.lower())
        if isinstance(headers, str):
            match = re.search(rf"^{name}:\s*(.+)$", headers, re.M | re.I)
            return match.group(1).strip() if match else None
        return None


def verify_webhook_token(account: ChannelAccount, token: str) -> bool:
    return bool(token) and hmac.compare_digest(token, account.webhook_secret or "")


register_adapter(EmailAdapter())

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

import json
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import ClassVar, Dict, List, Optional

import httpx

from app.channels.base import InboundMessage, SendResult
from app.core.security import decrypt_api_key
from app.models.channels import ChannelAccount
from app.core.logger import get_logger

logger = get_logger(__name__)

REQUEST_TIMEOUT_SECONDS = 15.0
# Carriers segment long messages; keep replies to a sane cap
MAX_MESSAGE_LENGTH = 1600

_http_client: Optional[httpx.AsyncClient] = None


def get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS)
    return _http_client


@dataclass
class SmsWebhookRequest:
    """Everything a provider needs to verify and parse an inbound webhook,
    normalized by the /webhooks/sms route so providers stay transport-agnostic."""
    headers: dict
    params: dict                     # decoded form params (repeated keys → last)
    param_pairs: List[tuple]         # form params preserving order/duplicates
    json_body: Optional[dict]        # parsed JSON body (JSON providers)
    raw_body: bytes
    url: str                         # the public webhook URL (for signatures)


@dataclass
class CredentialField:
    key: str
    label: str
    secret: bool = False
    optional: bool = False


class SmsProvider(ABC):
    """A pluggable SMS backend (Twilio, Vonage, ...). One SmsProvider per
    vendor; all share the single 'sms' channel so conversations, badges and
    agent routing stay uniform."""

    name: ClassVar[str]
    label: ClassVar[str]
    # Credential fields the connect UI collects (besides the phone number)
    credential_fields: ClassVar[List[CredentialField]] = []
    # True when the provider signs inbound webhooks and we need the raw body
    signs_webhook: ClassVar[bool] = False

    async def verify_webhook(self, req: SmsWebhookRequest, account: ChannelAccount) -> bool:
        """Authenticate an inbound webhook. Default: accept (route enforces the
        per-account URL token for unsigned providers)."""
        return True

    @abstractmethod
    def parse_inbound(self, req: SmsWebhookRequest, account: ChannelAccount) -> List[InboundMessage]:
        """Normalize an inbound SMS into InboundMessage(s)."""

    async def handle_control(self, req: SmsWebhookRequest, account: ChannelAccount) -> bool:
        """Handle non-message control callbacks (e.g. SNS subscription
        confirmation). Return True if fully handled — the route then stops."""
        return False

    @abstractmethod
    async def send(self, account: ChannelAccount, to: str, text: str) -> SendResult:
        """Send an SMS from the account's number to `to`."""

    async def validate_credentials(self, phone_number: str, credentials: dict) -> None:
        """Optionally verify credentials at connect time. Raise ValueError with
        a user-facing message on failure. Default: no check."""
        return None

    @staticmethod
    def credentials(account: ChannelAccount) -> dict:
        return json.loads(decrypt_api_key(account.encrypted_credentials))


_providers: Dict[str, SmsProvider] = {}


def register_provider(provider: SmsProvider) -> SmsProvider:
    _providers[provider.name] = provider
    return provider


def get_provider(name: str) -> Optional[SmsProvider]:
    return _providers.get(name)


def list_providers() -> List[SmsProvider]:
    return list(_providers.values())


def inbound(to: str, sender: str, text: str, message_id: str) -> InboundMessage:
    """Build a normalized InboundMessage for an SMS (conversation keyed by the
    customer's number). external_message_id is left empty when the provider
    gives none — the webhook skips dedupe rather than risk collapsing two
    legitimate identical replies (e.g. "Yes", "Yes") into one."""
    return InboundMessage(
        external_account_id=to,
        external_conversation_id=sender,
        external_user_id=sender,
        external_message_id=message_id or "",
        text=text,
        # The sender *is* the customer's number; providers vary on the leading
        # '+' (Twilio sends it, Vonage doesn't) — normalize_phone accepts both.
        profile={"phone": sender},
    )

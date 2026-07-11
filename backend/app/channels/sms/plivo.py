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

import base64
import hashlib
import hmac
from typing import ClassVar, List

from app.channels.base import InboundMessage, SendResult
from app.channels.sms.base import (
    CredentialField, SmsProvider, SmsWebhookRequest,
    get_http_client, inbound, register_provider,
)
from app.models.channels import ChannelAccount
from app.core.logger import get_logger

logger = get_logger(__name__)

PLIVO_API_BASE = "https://api.plivo.com/v1"


class PlivoProvider(SmsProvider):
    name: ClassVar[str] = "plivo"
    label: ClassVar[str] = "Plivo"
    signs_webhook: ClassVar[bool] = True
    credential_fields: ClassVar[List[CredentialField]] = [
        CredentialField("auth_id", "Auth ID"),
        CredentialField("auth_token", "Auth token", secret=True),
    ]

    async def verify_webhook(self, req: SmsWebhookRequest, account: ChannelAccount) -> bool:
        """X-Plivo-Signature-V3: base64(HMAC-SHA256(auth_token, url + nonce))."""
        auth_token = self.credentials(account).get("auth_token", "")
        signature = req.headers.get("x-plivo-signature-v3", "")
        nonce = req.headers.get("x-plivo-signature-v3-nonce", "")
        if not (auth_token and signature and nonce):
            return False
        expected = base64.b64encode(
            hmac.new(auth_token.encode(), (req.url + nonce).encode(), hashlib.sha256).digest()
        ).decode()
        # Plivo may send multiple comma-separated signatures
        return any(hmac.compare_digest(expected, s) for s in signature.split(","))

    def parse_inbound(self, req: SmsWebhookRequest, account: ChannelAccount) -> List[InboundMessage]:
        p = req.params
        sender, text = p.get("From", ""), (p.get("Text") or "").strip()
        if not sender or not text:
            return []
        return [inbound(p.get("To", ""), sender, text, p.get("MessageUUID", ""))]

    async def send(self, account: ChannelAccount, to: str, text: str) -> SendResult:
        creds = self.credentials(account)
        try:
            response = await get_http_client().post(
                f"{PLIVO_API_BASE}/Account/{creds['auth_id']}/Message/",
                auth=(creds["auth_id"], creds["auth_token"]),
                json={"src": account.external_account_id, "dst": to, "text": text},
            )
            data = response.json()
            if response.status_code >= 300:
                return SendResult(ok=False, error=str(data.get("error") or f"HTTP {response.status_code}"))
            ids = data.get("message_uuid") or []
            return SendResult(ok=True, external_message_id=ids[0] if ids else None)
        except Exception as e:
            logger.error(f"Plivo send failed: {e}")
            return SendResult(ok=False, error=str(e))

    async def validate_credentials(self, phone_number: str, credentials: dict) -> None:
        auth_id, token = credentials.get("auth_id"), credentials.get("auth_token")
        if not (auth_id and token):
            raise ValueError("Auth ID and auth token are required")
        try:
            response = await get_http_client().get(
                f"{PLIVO_API_BASE}/Account/{auth_id}/", auth=(auth_id, token))
        except Exception as e:
            raise ValueError(f"Could not reach Plivo: {e}")
        if response.status_code >= 300:
            raise ValueError("Invalid Plivo Auth ID or auth token")


register_provider(PlivoProvider())

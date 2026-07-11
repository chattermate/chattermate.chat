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

MESSAGEBIRD_API = "https://rest.messagebird.com/messages"


class MessageBirdProvider(SmsProvider):
    name: ClassVar[str] = "messagebird"
    label: ClassVar[str] = "MessageBird (Bird)"
    credential_fields: ClassVar[List[CredentialField]] = [
        CredentialField("access_key", "Access key", secret=True),
        CredentialField("signing_key", "Signing key (optional)", secret=True, optional=True),
    ]

    async def verify_webhook(self, req: SmsWebhookRequest, account: ChannelAccount) -> bool:
        signing_key = self.credentials(account).get("signing_key")
        if not signing_key:
            return True
        timestamp = req.headers.get("messagebird-request-timestamp", "")
        signature = req.headers.get("messagebird-signature", "")
        if not (timestamp and signature):
            return False
        # v1: base64(HMAC-SHA256(key, "{ts}\n{url}\n{sha256(body)}"))
        body_hash = hashlib.sha256(req.raw_body).digest()
        parts = timestamp.encode() + b"\n" + req.url.encode() + b"\n" + body_hash
        expected = base64.b64encode(hmac.new(signing_key.encode(), parts, hashlib.sha256).digest()).decode()
        return hmac.compare_digest(expected, signature)

    def parse_inbound(self, req: SmsWebhookRequest, account: ChannelAccount) -> List[InboundMessage]:
        p = req.json_body or req.params
        sender = p.get("originator") or p.get("sender") or ""
        text = (p.get("payload") or p.get("body") or "").strip()
        if not sender or not text:
            return []
        recipient = str(p.get("recipient") or account.external_account_id)
        return [inbound(recipient, sender, text, str(p.get("id", "")))]

    async def send(self, account: ChannelAccount, to: str, text: str) -> SendResult:
        creds = self.credentials(account)
        try:
            response = await get_http_client().post(
                MESSAGEBIRD_API,
                headers={"Authorization": f"AccessKey {creds['access_key']}"},
                json={"originator": account.external_account_id, "recipients": [to], "body": text},
            )
            data = response.json()
            if response.status_code >= 300:
                errors = data.get("errors") or [{}]
                return SendResult(ok=False, error=str(errors[0].get("description") or f"HTTP {response.status_code}"))
            return SendResult(ok=True, external_message_id=str(data.get("id", "")))
        except Exception as e:
            logger.error(f"MessageBird send failed: {e}")
            return SendResult(ok=False, error=str(e))

    async def validate_credentials(self, phone_number: str, credentials: dict) -> None:
        if not credentials.get("access_key"):
            raise ValueError("Access key is required")


register_provider(MessageBirdProvider())

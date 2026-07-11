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

from typing import ClassVar, List

from app.channels.base import InboundMessage, SendResult
from app.channels.sms.base import (
    CredentialField, SmsProvider, SmsWebhookRequest,
    get_http_client, inbound, register_provider,
)
from app.models.channels import ChannelAccount
from app.core.logger import get_logger

logger = get_logger(__name__)

BREVO_SMS_API = "https://api.brevo.com/v3/transactionalSMS/sms"


class BrevoProvider(SmsProvider):
    """Brevo transactional SMS. Outbound only in most plans — inbound replies
    depend on Brevo's inbound SMS support; when available they post to the
    per-account webhook URL (authenticated by its token, not a signature)."""

    name: ClassVar[str] = "brevo"
    label: ClassVar[str] = "Brevo"
    credential_fields: ClassVar[List[CredentialField]] = [
        CredentialField("api_key", "API key", secret=True),
    ]

    def parse_inbound(self, req: SmsWebhookRequest, account: ChannelAccount) -> List[InboundMessage]:
        # Brevo inbound payloads vary; accept the common field names.
        p = req.json_body or req.params
        sender = p.get("from") or p.get("sender") or p.get("msisdn") or ""
        text = (p.get("text") or p.get("message") or p.get("content") or "").strip()
        if not sender or not text:
            return []
        recipient = str(p.get("to") or account.external_account_id)
        return [inbound(recipient, sender, text, str(p.get("id") or p.get("messageId") or ""))]

    async def send(self, account: ChannelAccount, to: str, text: str) -> SendResult:
        creds = self.credentials(account)
        try:
            response = await get_http_client().post(
                BREVO_SMS_API,
                headers={"api-key": creds["api_key"], "content-type": "application/json"},
                json={"sender": account.external_account_id, "recipient": to, "content": text},
            )
            data = response.json()
            if response.status_code >= 300:
                return SendResult(ok=False, error=str(data.get("message") or f"HTTP {response.status_code}"))
            return SendResult(ok=True, external_message_id=str(data.get("messageId", "")))
        except Exception as e:
            logger.error(f"Brevo send failed: {e}")
            return SendResult(ok=False, error=str(e))

    async def validate_credentials(self, phone_number: str, credentials: dict) -> None:
        if not credentials.get("api_key"):
            raise ValueError("API key is required")


register_provider(BrevoProvider())

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

VONAGE_SMS_URL = "https://rest.nexmo.com/sms/json"


def _verify_hmac_signature(params: dict, signature_secret: str) -> bool:
    """Vonage HMAC-SHA256 signed-webhook check: HMAC-SHA256(secret) over the
    sorted params (excluding `sig`, with `&`/`=` in values replaced by `_`).

    Configure the Vonage account's signature method as "SHA-256 HMAC". The
    legacy MD5 method is intentionally not supported (weak hash).
    """
    provided = params.get("sig", "")
    if not provided:
        return False
    parts = []
    for key in sorted(k for k in params if k != "sig"):
        value = str(params[key]).replace("&", "_").replace("=", "_")
        parts.append(f"&{key}={value}")
    digest = hmac.new(
        signature_secret.encode(), "".join(parts).encode(), hashlib.sha256
    ).hexdigest().upper()
    return hmac.compare_digest(digest, provided.upper())


class VonageProvider(SmsProvider):
    name: ClassVar[str] = "vonage"
    label: ClassVar[str] = "Vonage (Nexmo)"
    credential_fields: ClassVar[List[CredentialField]] = [
        CredentialField("api_key", "API key"),
        CredentialField("api_secret", "API secret", secret=True),
        CredentialField("signature_secret", "Signature secret (optional)", secret=True, optional=True),
    ]

    async def verify_webhook(self, req: SmsWebhookRequest, account: ChannelAccount) -> bool:
        secret = self.credentials(account).get("signature_secret")
        if not secret:
            # No signature configured — rely on the unguessable per-account URL
            return True
        source = req.json_body or req.params
        return _verify_hmac_signature(source, secret)

    def parse_inbound(self, req: SmsWebhookRequest, account: ChannelAccount) -> List[InboundMessage]:
        p = req.json_body or req.params
        sender = p.get("msisdn", "")
        text = (p.get("text") or "").strip()
        if not sender or not text:
            return []
        return [inbound(p.get("to", ""), sender, text, p.get("messageId", ""))]

    async def send(self, account: ChannelAccount, to: str, text: str) -> SendResult:
        creds = self.credentials(account)
        try:
            response = await get_http_client().post(VONAGE_SMS_URL, data={
                "api_key": creds["api_key"],
                "api_secret": creds["api_secret"],
                "from": account.external_account_id,
                "to": to,
                "text": text,
            })
            data = response.json()
            message = (data.get("messages") or [{}])[0]
            if message.get("status") != "0":
                return SendResult(ok=False, error=str(message.get("error-text") or "Vonage send failed"))
            return SendResult(ok=True, external_message_id=message.get("message-id"))
        except Exception as e:
            logger.error(f"Vonage send failed: {e}")
            return SendResult(ok=False, error=str(e))

    async def validate_credentials(self, phone_number: str, credentials: dict) -> None:
        if not (credentials.get("api_key") and credentials.get("api_secret")):
            raise ValueError("API key and API secret are required")


register_provider(VonageProvider())

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

TWILIO_API_BASE = "https://api.twilio.com/2010-04-01"


def _verify_signature(auth_token: str, url: str, param_pairs, signature: str) -> bool:
    """X-Twilio-Signature: base64(HMAC-SHA1(auth_token, url + sorted concatenated
    key/values)). param_pairs preserves repeated keys."""
    if not auth_token or not signature:
        return False
    payload = url + "".join(f"{k}{v}" for k, v in sorted(param_pairs, key=lambda kv: kv[0]))
    expected = base64.b64encode(
        hmac.new(auth_token.encode(), payload.encode(), hashlib.sha1).digest()
    ).decode()
    return hmac.compare_digest(expected, signature)


class TwilioProvider(SmsProvider):
    name: ClassVar[str] = "twilio"
    label: ClassVar[str] = "Twilio"
    signs_webhook: ClassVar[bool] = True
    credential_fields: ClassVar[List[CredentialField]] = [
        CredentialField("account_sid", "Account SID"),
        CredentialField("auth_token", "Auth token", secret=True),
    ]

    async def verify_webhook(self, req: SmsWebhookRequest, account: ChannelAccount) -> bool:
        return _verify_signature(
            self.credentials(account).get("auth_token", ""),
            req.url, req.param_pairs,
            req.headers.get("x-twilio-signature", ""),
        )

    def parse_inbound(self, req: SmsWebhookRequest, account: ChannelAccount) -> List[InboundMessage]:
        p = req.params
        sender, body = p.get("From", ""), (p.get("Body") or "").strip()
        if not sender or not body:
            return []
        return [inbound(p.get("To", ""), sender, body, p.get("MessageSid", ""))]

    async def send(self, account: ChannelAccount, to: str, text: str) -> SendResult:
        creds = self.credentials(account)
        try:
            response = await get_http_client().post(
                f"{TWILIO_API_BASE}/Accounts/{creds['account_sid']}/Messages.json",
                auth=(creds["account_sid"], creds["auth_token"]),
                data={"From": account.external_account_id, "To": to, "Body": text},
            )
            data = response.json()
            if response.status_code >= 300:
                return SendResult(ok=False, error=str(data.get("message") or f"HTTP {response.status_code}"))
            return SendResult(ok=True, external_message_id=data.get("sid"))
        except Exception as e:
            logger.error(f"Twilio send failed: {e}")
            return SendResult(ok=False, error=str(e))

    async def validate_credentials(self, phone_number: str, credentials: dict) -> None:
        sid, token = credentials.get("account_sid"), credentials.get("auth_token")
        if not (sid and token):
            raise ValueError("Account SID and auth token are required")
        try:
            response = await get_http_client().get(
                f"{TWILIO_API_BASE}/Accounts/{sid}.json", auth=(sid, token))
        except Exception as e:
            raise ValueError(f"Could not reach Twilio: {e}")
        if response.status_code >= 300:
            raise ValueError("Invalid Twilio Account SID or auth token")


register_provider(TwilioProvider())

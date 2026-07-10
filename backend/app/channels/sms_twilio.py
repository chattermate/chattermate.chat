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
import json
from typing import ClassVar, List, Optional

import httpx

from app.channels.base import ChannelAdapter, InboundMessage, SendResult
from app.channels.registry import register_adapter
from app.core.security import decrypt_api_key
from app.models.channels import ChannelAccount, ChannelConversation, ChannelType
from app.core.logger import get_logger

logger = get_logger(__name__)

TWILIO_API_BASE = "https://api.twilio.com/2010-04-01"
REQUEST_TIMEOUT_SECONDS = 15.0
# Long messages are segmented by carriers; keep replies to a sane cap
MAX_MESSAGE_LENGTH = 1600

_http_client: Optional[httpx.AsyncClient] = None


def _get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS)
    return _http_client


def credentials(account: ChannelAccount) -> dict:
    return json.loads(decrypt_api_key(account.encrypted_credentials))


def verify_twilio_signature(auth_token: str, url: str, form_params, signature: str) -> bool:
    """Twilio X-Twilio-Signature: base64(HMAC-SHA1(auth_token, url + form
    key/values concatenated sorted by key)). form_params may be a dict or a
    list of (key, value) pairs — pairs preserve repeated keys."""
    if not auth_token or not signature:
        return False
    pairs = list(form_params.items()) if isinstance(form_params, dict) else list(form_params)
    payload = url + "".join(f"{k}{v}" for k, v in sorted(pairs, key=lambda kv: kv[0]))
    expected = base64.b64encode(
        hmac.new(auth_token.encode(), payload.encode(), hashlib.sha1).digest()
    ).decode()
    return hmac.compare_digest(expected, signature)


async def validate_credentials(account_sid: str, auth_token: str) -> bool:
    """Check the SID/token pair against the Twilio account endpoint."""
    try:
        response = await _get_http_client().get(
            f"{TWILIO_API_BASE}/Accounts/{account_sid}.json",
            auth=(account_sid, auth_token),
        )
        return response.status_code < 300
    except Exception as e:
        logger.error(f"Twilio credential validation failed: {e}")
        return False


class TwilioSmsAdapter(ChannelAdapter):
    """SMS via the customer's own Twilio account (webhook in, REST send out).
    Conversations are keyed by the customer's phone number."""

    channel_type: ClassVar[str] = ChannelType.SMS.value

    async def verify_webhook(self, headers: dict, raw_body: bytes, account: Optional[ChannelAccount]) -> bool:
        # Twilio signs URL + form params, so the route (which has the parsed
        # form and public URL) performs the check via verify_twilio_signature.
        return account is not None

    def parse_inbound(self, payload: dict) -> List[InboundMessage]:
        """Normalize Twilio's inbound-SMS form parameters."""
        sender = payload.get("From", "")
        body = (payload.get("Body") or "").strip()
        if not sender or not body:
            return []
        return [InboundMessage(
            external_account_id=payload.get("To", ""),
            external_conversation_id=sender,
            external_user_id=sender,
            external_message_id=payload.get("MessageSid", ""),
            text=body,
        )]

    async def send_text(self, account: ChannelAccount, conversation: ChannelConversation, text: str) -> SendResult:
        creds = credentials(account)
        try:
            response = await _get_http_client().post(
                f"{TWILIO_API_BASE}/Accounts/{creds['account_sid']}/Messages.json",
                auth=(creds["account_sid"], creds["auth_token"]),
                data={
                    "From": account.external_account_id,
                    "To": conversation.external_conversation_id,
                    "Body": text,
                },
            )
            data = response.json()
            if response.status_code >= 300:
                return SendResult(ok=False, error=str(data.get("message") or f"HTTP {response.status_code}"))
            return SendResult(ok=True, external_message_id=data.get("sid"))
        except Exception as e:
            logger.error(f"Twilio send failed: {e}")
            return SendResult(ok=False, error=str(e))

    def format_outbound(self, markdown: str) -> str:
        # SMS is plain text: drop markdown emphasis markers entirely
        plain = markdown.replace("**", "").replace("__", "")
        return plain[:MAX_MESSAGE_LENGTH]


register_adapter(TwilioSmsAdapter())

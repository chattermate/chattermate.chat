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
from datetime import datetime, timezone
from typing import ClassVar, List, Optional

import httpx

from app.channels.base import ChannelAdapter, InboundMessage, SendResult
from app.channels.registry import register_adapter
from app.core.security import decrypt_api_key
from app.models.channels import ChannelAccount, ChannelConversation, ChannelType
from app.core.logger import get_logger

logger = get_logger(__name__)

LINE_API_BASE = "https://api.line.me/v2/bot"
REQUEST_TIMEOUT_SECONDS = 15.0
# https://developers.line.biz/en/reference/messaging-api/#text-message
MAX_MESSAGE_LENGTH = 5000
# Loading-animation duration: 5–60, in multiples of 5 (auto-dismissed on reply)
LOADING_ANIMATION_SECONDS = 20

_http_client: Optional[httpx.AsyncClient] = None


def _get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS)
    return _http_client


def credentials(account: ChannelAccount) -> dict:
    return json.loads(decrypt_api_key(account.encrypted_credentials))


async def get_bot_info(channel_access_token: str) -> Optional[dict]:
    """Validate a channel access token; returns the bot info or None."""
    try:
        response = await _get_http_client().get(
            f"{LINE_API_BASE}/info",
            headers={"Authorization": f"Bearer {channel_access_token}"},
        )
        return response.json() if response.status_code < 300 else None
    except Exception as e:
        logger.error(f"LINE bot info failed: {e}")
        return None


async def set_webhook_endpoint(channel_access_token: str, url: str) -> bool:
    """Point the LINE channel's webhook at us (best-effort; can also be set in
    the LINE Developers console)."""
    try:
        response = await _get_http_client().put(
            f"{LINE_API_BASE}/channel/webhook/endpoint",
            headers={"Authorization": f"Bearer {channel_access_token}"},
            json={"endpoint": url},
        )
        return response.status_code < 300
    except Exception as e:
        logger.error(f"LINE set webhook failed: {e}")
        return False


class LineAdapter(ChannelAdapter):
    """LINE Messaging API. Conversations are keyed by the LINE userId; replies
    go out as push messages (reply tokens expire too quickly for AI latency)."""

    channel_type: ClassVar[str] = ChannelType.LINE.value

    async def verify_webhook(self, headers: dict, raw_body: bytes, account: Optional[ChannelAccount]) -> bool:
        """X-Line-Signature: base64(HMAC-SHA256(channel_secret, body))."""
        if account is None:
            return False
        signature = headers.get("x-line-signature", "")
        try:
            secret = credentials(account).get("channel_secret", "")
        except Exception as e:
            logger.error(f"LINE credential decrypt failed for {account.id}: {e}")
            return False
        if not signature or not secret:
            return False
        expected = base64.b64encode(
            hmac.new(secret.encode(), raw_body, hashlib.sha256).digest()
        ).decode()
        return hmac.compare_digest(expected, signature)

    def parse_inbound(self, payload: dict) -> List[InboundMessage]:
        """Normalize webhook events; only one-on-one text messages become
        InboundMessages."""
        messages: List[InboundMessage] = []
        for event in payload.get("events", []):
            message = event.get("message") or {}
            source = event.get("source") or {}
            if event.get("type") != "message" or message.get("type") != "text":
                continue
            user_id = source.get("userId")
            if not user_id:
                continue
            timestamp = None
            if event.get("timestamp"):
                timestamp = datetime.fromtimestamp(event["timestamp"] / 1000, tz=timezone.utc)
            messages.append(InboundMessage(
                external_account_id=str(payload.get("destination", "")),
                external_conversation_id=str(user_id),
                external_user_id=str(user_id),
                external_message_id=str(message.get("id", "")),
                text=message.get("text", ""),
                timestamp=timestamp,
            ))
        return messages

    async def send_text(self, account: ChannelAccount, conversation: ChannelConversation, text: str) -> SendResult:
        try:
            response = await _get_http_client().post(
                f"{LINE_API_BASE}/message/push",
                headers={"Authorization": f"Bearer {credentials(account)['channel_access_token']}"},
                json={
                    "to": conversation.external_conversation_id,
                    "messages": [{"type": "text", "text": text}],
                },
            )
            if response.status_code >= 300:
                try:
                    error = response.json().get("message", f"HTTP {response.status_code}")
                except Exception:
                    error = f"HTTP {response.status_code}"
                return SendResult(ok=False, error=str(error))
            return SendResult(ok=True)
        except Exception as e:
            logger.error(f"LINE send failed: {e}")
            return SendResult(ok=False, error=str(e))

    async def send_typing(self, account: ChannelAccount, conversation: ChannelConversation) -> None:
        # LINE's loading animation (1:1 chats only); auto-dismisses when the
        # reply is sent or after loadingSeconds.
        try:
            await _get_http_client().post(
                f"{LINE_API_BASE}/chat/loading/start",
                headers={"Authorization": f"Bearer {credentials(account)['channel_access_token']}"},
                json={
                    "chatId": conversation.external_conversation_id,
                    "loadingSeconds": LOADING_ANIMATION_SECONDS,
                },
            )
        except Exception as e:
            logger.debug(f"LINE loading animation failed (non-critical): {e}")

    def format_outbound(self, markdown: str) -> str:
        return markdown[:MAX_MESSAGE_LENGTH]


register_adapter(LineAdapter())

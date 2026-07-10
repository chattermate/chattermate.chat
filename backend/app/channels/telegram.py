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

import hmac
import json
from datetime import datetime, timezone
from typing import ClassVar, List, Optional

import httpx

from app.channels.base import ChannelAdapter, InboundMessage, SendResult
from app.channels.registry import register_adapter
from app.models.channels import ChannelAccount, ChannelConversation, ChannelType
from app.core.security import decrypt_api_key
from app.core.logger import get_logger

logger = get_logger(__name__)

TELEGRAM_API_BASE = "https://api.telegram.org"
# https://core.telegram.org/bots/api#sendmessage
MAX_MESSAGE_LENGTH = 4096
REQUEST_TIMEOUT_SECONDS = 15.0

# Shared client: keep-alive connection pooling to api.telegram.org instead of
# a TCP+TLS handshake per call (process-lifetime, like the DB engine).
_http_client: Optional[httpx.AsyncClient] = None


def _get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS)
    return _http_client


async def _call_api(bot_token: str, method: str, payload: Optional[dict] = None) -> dict:
    """Call a Telegram Bot API method; returns the decoded JSON envelope."""
    url = f"{TELEGRAM_API_BASE}/bot{bot_token}/{method}"
    response = await _get_http_client().post(url, json=payload or {})
    return response.json()


async def get_me(bot_token: str) -> Optional[dict]:
    """Validate a bot token; returns the bot's user object or None."""
    try:
        data = await _call_api(bot_token, "getMe")
        return data.get("result") if data.get("ok") else None
    except Exception as e:
        logger.error(f"Telegram getMe failed: {e}")
        return None


async def set_webhook(bot_token: str, url: str, secret_token: str) -> tuple[bool, str]:
    """Register our webhook with Telegram. Returns (ok, error_description) —
    the description surfaces Telegram's reason (e.g. 'an HTTPS URL must be
    provided for webhook' when BACKEND_URL points at localhost)."""
    try:
        data = await _call_api(bot_token, "setWebhook", {
            "url": url,
            "secret_token": secret_token,
            "allowed_updates": ["message"],
        })
        if data.get("ok"):
            return True, ""
        description = str(data.get("description") or "setWebhook failed")
        logger.error(f"Telegram setWebhook rejected for {url}: {description}")
        return False, description
    except Exception as e:
        logger.error(f"Telegram setWebhook failed: {e}")
        return False, str(e)


async def delete_webhook(bot_token: str) -> bool:
    try:
        data = await _call_api(bot_token, "deleteWebhook")
        return bool(data.get("ok"))
    except Exception as e:
        logger.error(f"Telegram deleteWebhook failed: {e}")
        return False


class TelegramAdapter(ChannelAdapter):
    channel_type: ClassVar[str] = ChannelType.TELEGRAM.value

    async def verify_webhook(self, headers: dict, raw_body: bytes, account: Optional[ChannelAccount]) -> bool:
        """Telegram echoes the secret_token given to setWebhook on every request."""
        if account is None:
            return False
        provided = headers.get("x-telegram-bot-api-secret-token", "")
        return hmac.compare_digest(provided, account.webhook_secret or "")

    def parse_inbound(self, payload: dict) -> List[InboundMessage]:
        """Normalize a Telegram Update. Only plain user messages become
        InboundMessages; bot echoes and service updates are ignored."""
        message = payload.get("message") or {}
        sender = message.get("from") or {}
        chat = message.get("chat") or {}
        if not message or sender.get("is_bot") or "id" not in chat:
            return []

        text = message.get("text") or message.get("caption")
        if not text:
            return []  # media-only messages until media support lands

        name = " ".join(filter(None, [sender.get("first_name"), sender.get("last_name")])) or sender.get("username")
        timestamp = None
        if message.get("date"):
            timestamp = datetime.fromtimestamp(message["date"], tz=timezone.utc)

        return [InboundMessage(
            external_account_id="",  # resolved from the webhook path, not the payload
            external_conversation_id=str(chat["id"]),
            external_user_id=str(sender.get("id", chat["id"])),
            external_message_id=str(message.get("message_id", "")),
            text=text,
            profile={"name": name, "username": sender.get("username")},
            timestamp=timestamp,
        )]

    async def send_text(self, account: ChannelAccount, conversation: ChannelConversation, text: str) -> SendResult:
        try:
            bot_token = self._bot_token(account)
            data = await _call_api(bot_token, "sendMessage", {
                "chat_id": conversation.external_conversation_id,
                "text": text,
            })
            if not data.get("ok"):
                return SendResult(ok=False, error=str(data.get("description") or "sendMessage failed"))
            return SendResult(ok=True, external_message_id=str(data["result"].get("message_id", "")))
        except Exception as e:
            logger.error(f"Telegram send failed: {e}")
            return SendResult(ok=False, error=str(e))

    def format_outbound(self, markdown: str) -> str:
        """Telegram is sent as plain text (no parse_mode) — markdown renders
        readably and escaping pitfalls are avoided. Enforce the length cap."""
        return markdown[:MAX_MESSAGE_LENGTH]

    @staticmethod
    def _bot_token(account: ChannelAccount) -> str:
        return json.loads(decrypt_api_key(account.encrypted_credentials))["bot_token"]


register_adapter(TelegramAdapter())

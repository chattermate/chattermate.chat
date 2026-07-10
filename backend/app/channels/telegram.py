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

from app.channels.base import ChannelAdapter, InboundMessage, SendResult, ChannelInteraction
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
            # message: customer texts + shared contacts; callback_query: rating taps
            "allowed_updates": ["message", "callback_query"],
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
        """Normalize a Telegram Update. Only plain user text messages become
        InboundMessages; bot echoes, shared contacts (handled as interactions)
        and service updates are ignored."""
        message = payload.get("message") or {}
        sender = message.get("from") or {}
        chat = message.get("chat") or {}
        if not message or sender.get("is_bot") or "id" not in chat:
            return []

        text = message.get("text") or message.get("caption")
        if not text:
            return []  # media / contact-only messages aren't customer text turns

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

    def parse_interaction(self, payload: dict):
        """Detect a rating-button tap (callback_query) or a shared contact
        (message.contact) — both bypass the AI pipeline."""
        callback = payload.get("callback_query")
        if callback:
            data = callback.get("data") or ""
            chat = ((callback.get("message") or {}).get("chat")) or {}
            sender = callback.get("from") or {}
            if data.startswith("rate:") and "id" in chat:
                try:
                    rating = int(data.split(":", 1)[1])
                except ValueError:
                    return None
                return ChannelInteraction(
                    type="rating",
                    external_account_id="",
                    external_conversation_id=str(chat["id"]),
                    external_user_id=str(sender.get("id", chat["id"])),
                    rating=rating,
                    callback_id=str(callback.get("id", "")),
                )
            return None

        message = payload.get("message") or {}
        contact = message.get("contact")
        chat = message.get("chat") or {}
        if contact and "id" in chat:
            sender = message.get("from") or {}
            # Only accept the sender's OWN contact (the share-phone button flow);
            # a forwarded third-party contact card has a different/absent user_id.
            if contact.get("user_id") != sender.get("id"):
                return None
            return ChannelInteraction(
                type="contact",
                external_account_id="",
                external_conversation_id=str(chat["id"]),
                external_user_id=str(sender.get("id", chat["id"])),
                phone=contact.get("phone_number"),
                profile={"name": " ".join(filter(None, [contact.get("first_name"), contact.get("last_name")]))},
            )
        return None

    async def send_text(self, account: ChannelAccount, conversation: ChannelConversation, text: str) -> SendResult:
        return await self._send_message(account, conversation.external_conversation_id, text)

    async def send_typing(self, account: ChannelAccount, conversation: ChannelConversation) -> None:
        try:
            await _call_api(self._bot_token(account), "sendChatAction", {
                "chat_id": conversation.external_conversation_id,
                "action": "typing",
            })
        except Exception as e:
            logger.debug(f"Telegram sendChatAction failed (non-critical): {e}")

    async def send_rating_prompt(self, account: ChannelAccount, conversation: ChannelConversation,
                                 text: str) -> SendResult:
        # Inline keyboard of 1–5 stars; taps arrive as callback_query "rate:N"
        keyboard = {"inline_keyboard": [[
            {"text": "⭐" * n, "callback_data": f"rate:{n}"} for n in range(1, 6)
        ]]}
        return await self._send_message(account, conversation.external_conversation_id, text,
                                        reply_markup=keyboard)

    async def request_phone(self, account: ChannelAccount, conversation: ChannelConversation,
                            text: str) -> SendResult:
        # One-time reply keyboard with a share-contact button
        keyboard = {
            "keyboard": [[{"text": "📱 Share my phone number", "request_contact": True}]],
            "resize_keyboard": True,
            "one_time_keyboard": True,
        }
        return await self._send_message(account, conversation.external_conversation_id, text,
                                        reply_markup=keyboard)

    async def acknowledge_interaction(self, account: ChannelAccount, interaction, text: str = None) -> None:
        if not getattr(interaction, "callback_id", None):
            return
        try:
            payload = {"callback_query_id": interaction.callback_id}
            if text:
                payload["text"] = text
            await _call_api(self._bot_token(account), "answerCallbackQuery", payload)
        except Exception as e:
            logger.debug(f"Telegram answerCallbackQuery failed (non-critical): {e}")

    async def _send_message(self, account: ChannelAccount, chat_id: str, text: str,
                            reply_markup: dict = None) -> SendResult:
        try:
            payload = {"chat_id": chat_id, "text": text}
            if reply_markup is not None:
                payload["reply_markup"] = reply_markup
            data = await _call_api(self._bot_token(account), "sendMessage", payload)
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

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

from app.channels.base import (
    ChannelAdapter, ChannelInteraction, InboundMessage, InteractiveKind, InteractiveMessage,
    InteractiveReply, InteractiveReplyType, SendResult,
)
from app.channels.interactive_limits import TELEGRAM_LIMITS, InteractiveLimits
from app.channels.registry import register_adapter
from app.models.channels import ChannelAccount, ChannelConversation, ChannelType
from app.core.security import decrypt_api_key
from app.core.logger import get_logger
from app.core.external_urls import external_base

logger = get_logger(__name__)

TELEGRAM_API_BASE = external_base("TELEGRAM_API_BASE", "https://api.telegram.org")
# https://core.telegram.org/bots/api#sendmessage
MAX_MESSAGE_LENGTH = TELEGRAM_LIMITS.body_max
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
            # message covers customer texts and shared contacts;
            # callback_query, taps on the choices we send
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


# A tap's message id, kept apart from message ids (which only count up per chat)
CALLBACK_ID_PREFIX = "cbq:"
PRIVATE_CHAT = "private"
TAP_NOT_TAKEN = "This choice is no longer available"


def callback_answer(payload: dict, taken: bool) -> Optional[dict]:
    """The webhook response that answers a tap — Telegram keeps the button
    spinning until a tap is answered, and accepts the answer as the reply to
    its webhook request. A tap we didn't act on (a second tap, a group chat,
    an old message) says so. None for any other update."""
    callback = payload.get("callback_query") or {}
    if not callback.get("id"):
        return None
    answer = {"method": "answerCallbackQuery", "callback_query_id": callback["id"]}
    if not taken:
        answer["text"] = TAP_NOT_TAKEN
    return answer


def dedupe_id(inbound: InboundMessage) -> str:
    """What makes an update a repeat: a tap's keyboard (one answer per
    keyboard), otherwise the message itself."""
    if inbound.interactive is not None and inbound.reply_to_message_id:
        return f"keyboard:{inbound.reply_to_message_id}"
    return inbound.external_message_id


class TelegramAdapter(ChannelAdapter):
    channel_type: ClassVar[str] = ChannelType.TELEGRAM.value
    # Choices go as an inline keyboard (buttons only)
    interactive_limits: ClassVar[Optional[InteractiveLimits]] = TELEGRAM_LIMITS
    max_text_length: ClassVar[Optional[int]] = MAX_MESSAGE_LENGTH
    supports_edit: ClassVar[bool] = True

    async def verify_webhook(self, headers: dict, raw_body: bytes, account: Optional[ChannelAccount]) -> bool:
        """Telegram echoes the secret_token given to setWebhook on every request."""
        if account is None:
            return False
        provided = headers.get("x-telegram-bot-api-secret-token", "")
        return hmac.compare_digest(provided, account.webhook_secret or "")

    def parse_inbound(self, payload: dict) -> List[InboundMessage]:
        """Normalize a Telegram Update. Plain user text messages and taps on
        our buttons become InboundMessages; bot echoes, shared contacts
        (handled as interactions) and service updates are ignored."""
        if payload.get("callback_query"):
            tap = _tap(payload["callback_query"])
            return [tap] if tap is not None else []
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
        """Detect a shared contact (message.contact) — the share-phone flow.
        Bypasses the AI pipeline."""
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

    def choice_limits_for(self, conversation: ChannelConversation) -> Optional[InteractiveLimits]:
        """Buttons only in a private chat with the bot: in a group anyone could
        tap them, so taps there are ignored (Telegram's group ids are negative)."""
        if str(conversation.external_conversation_id).startswith("-"):
            return None
        return self.interactive_limits

    async def send_interactive(self, account: ChannelAccount, conversation: ChannelConversation,
                               message: InteractiveMessage) -> SendResult:
        """The choices as an inline keyboard under the text, one per row."""
        if message.kind != InteractiveKind.BUTTONS:
            return SendResult(ok=False, error="Telegram only sends choices as buttons")
        keyboard = {"inline_keyboard": [[{"text": b.title, "callback_data": b.id}] for b in message.buttons]}
        return await self._send_message(account, conversation.external_conversation_id, message.body,
                                        reply_markup=keyboard)

    async def clear_buttons(self, account: ChannelAccount, chat_id: str, message_id: Optional[str]) -> None:
        """Take the keyboard off a message once one of its buttons was tapped.
        Best effort: a keyboard left in place is only a stale one."""
        if not message_id:
            return
        try:
            await _call_api(self._bot_token(account), "editMessageReplyMarkup", {
                "chat_id": chat_id, "message_id": int(message_id),
                "reply_markup": {"inline_keyboard": []},
            })
        except Exception as e:
            logger.debug(f"Telegram editMessageReplyMarkup failed (non-critical): {e}")

    async def send_typing(self, account: ChannelAccount, conversation: ChannelConversation) -> None:
        try:
            await _call_api(self._bot_token(account), "sendChatAction", {
                "chat_id": conversation.external_conversation_id,
                "action": "typing",
            })
        except Exception as e:
            logger.debug(f"Telegram sendChatAction failed (non-critical): {e}")

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

    async def edit_text(self, account: ChannelAccount, conversation: ChannelConversation,
                        external_message_id: str, text: str) -> SendResult:
        try:
            data = await _call_api(self._bot_token(account), "editMessageText", {
                "chat_id": conversation.external_conversation_id,
                "message_id": int(external_message_id), "text": text,
            })
            if not data.get("ok"):
                return SendResult(ok=False, error=str(data.get("description") or "editMessageText failed"))
            return SendResult(ok=True, external_message_id=external_message_id)
        except Exception as e:
            logger.error(f"Telegram edit failed: {e}")
            return SendResult(ok=False, error=str(e))

    def format_outbound(self, markdown: str) -> str:
        """Telegram is sent as plain text (no parse_mode) — markdown renders
        readably and escaping pitfalls are avoided. Enforce the length cap."""
        return markdown[:MAX_MESSAGE_LENGTH]

    @staticmethod
    def _bot_token(account: ChannelAccount) -> str:
        return json.loads(decrypt_api_key(account.encrypted_credentials))["bot_token"]


def _tap(callback: dict) -> Optional[InboundMessage]:
    """A tap on one of our buttons, in a private chat with the bot (in a
    group anyone could tap it). The tap carries only the button's id; its
    title is read from the keyboard it was on. Dropped when that message is
    gone or no longer accessible."""
    message = callback.get("message") or {}
    chat = message.get("chat") or {}
    sender = callback.get("from") or {}
    data = callback.get("data")
    if not data or not message.get("date") or chat.get("type") != PRIVATE_CHAT or "id" not in chat:
        return None
    title = _button_title(message.get("reply_markup") or {}, data)
    if title is None:
        return None
    name = " ".join(filter(None, [sender.get("first_name"), sender.get("last_name")])) or sender.get("username")
    return InboundMessage(
        external_account_id="",  # resolved from the webhook path, not the payload
        external_conversation_id=str(chat["id"]),
        external_user_id=str(sender.get("id", chat["id"])),
        external_message_id=f"{CALLBACK_ID_PREFIX}{callback['id']}",
        text=title,
        profile={"name": name, "username": sender.get("username")},
        timestamp=datetime.now(timezone.utc),
        interactive=InteractiveReply(type=InteractiveReplyType.BUTTON_REPLY, id=str(data), title=title),
        reply_to_message_id=str(message.get("message_id", "")) or None,
    )


def _button_title(reply_markup: dict, data: str) -> Optional[str]:
    for row in reply_markup.get("inline_keyboard") or []:
        for button in row:
            if button.get("callback_data") == data:
                return button.get("text")
    return None


register_adapter(TelegramAdapter())

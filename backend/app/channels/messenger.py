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

from typing import ClassVar, List, Optional

from app.channels.base import (
    InboundMessage, InteractiveKind, InteractiveMessage, InteractiveReply, InteractiveReplyType, SendResult,
)
from app.channels.interactive import to_text_fallback
from app.channels.interactive_limits import MESSENGER_LIMITS, InteractiveLimits
from app.channels.meta_base import GRAPH_BASE, MetaBaseAdapter, graph_detail, graph_get, graph_post
from app.channels.registry import register_adapter
from app.models.channels import ChannelAccount, ChannelConversation, ChannelType
from app.core.logger import get_logger

logger = get_logger(__name__)

# Messenger send API limit
MAX_MESSAGE_LENGTH = MESSENGER_LIMITS.body_max


class MessengerAdapter(MetaBaseAdapter):
    """Facebook Messenger. Instagram DM shares the same entry[].messaging[]
    envelope and send shape, so InstagramAdapter subclasses this — overriding
    only the host it talks to and the fields that name a sender."""

    channel_type: ClassVar[str] = ChannelType.MESSENGER.value
    # Instagram Login accounts hold an Instagram user token, which only
    # graph.instagram.com accepts; Page tokens only work on the Facebook graph.
    graph_base: ClassVar[str] = GRAPH_BASE
    # Graph fields on the sender node that carry a display name. Instagram user
    # nodes expose different ones, so it overrides this and _display_name.
    profile_fields: ClassVar[str] = "first_name,last_name"
    # Page conversations name their participants. Messenger falls back to that
    # when the profile lookup is refused; Instagram's own lookup already works.
    conversation_name_fallback: ClassVar[bool] = True
    # Extra keys on a send. messaging_type is a Messenger Platform parameter and
    # is not part of Instagram's documented send body, so Instagram sends none.
    send_extras: ClassVar[dict] = {"messaging_type": "RESPONSE"}
    # Choices go as quick replies (buttons only: no lists or link buttons)
    interactive_limits: ClassVar[Optional[InteractiveLimits]] = MESSENGER_LIMITS
    max_text_length: ClassVar[Optional[int]] = MAX_MESSAGE_LENGTH

    @staticmethod
    def _event_seconds(raw) -> Optional[int]:
        """Event time in seconds, or None if absent/unparseable.

        Messenger sends milliseconds as a number; Instagram's changes payload
        sends seconds as a string, which the old `// 1000` raised a TypeError on
        — crashing the whole webhook rather than dropping one timestamp.
        """
        try:
            value = int(raw)
        except (TypeError, ValueError):
            return None
        # 13-digit values are milliseconds; 10-digit ones are already seconds.
        return value // 1000 if value > 10_000_000_000 else value

    def _events(self, entry: dict) -> List[dict]:
        """The messaging events on one entry. Messenger always uses messaging[];
        Instagram overrides this because it can deliver the same event under
        changes[] instead."""
        return entry.get("messaging") or []

    def parse_inbound(self, payload: dict) -> List[InboundMessage]:
        """Normalize per-entry messaging events. Echoes, delivery/read receipts
        and attachment-only messages yield nothing."""
        messages: List[InboundMessage] = []
        for entry in payload.get("entry", []):
            account_id = str(entry.get("id", ""))
            for event in self._events(entry):
                message = event.get("message")
                if not message or message.get("is_echo"):
                    continue
                text = message.get("text")
                if not text:
                    continue
                sender_id = str((event.get("sender") or {}).get("id", ""))
                if not sender_id:
                    continue
                messages.append(InboundMessage(
                    external_account_id=account_id,
                    external_conversation_id=sender_id,
                    external_user_id=sender_id,
                    external_message_id=str(message.get("mid", "")),
                    text=text,
                    profile={},
                    timestamp=self._timestamp(self._event_seconds(event.get("timestamp"))),
                    interactive=_quick_reply(message),
                    # Only a swipe-reply carries this; a quick-reply tap doesn't
                    reply_to_message_id=(message.get("reply_to") or {}).get("mid"),
                ))
        return messages

    def graph_base_for(self, account: ChannelAccount) -> str:
        """The Graph host this account's token is accepted on."""
        return self.graph_base

    async def send_text(self, account: ChannelAccount, conversation: ChannelConversation, text: str) -> SendResult:
        return await self._send(account, conversation, {"text": text})

    async def send_interactive(self, account: ChannelAccount, conversation: ChannelConversation,
                               message: InteractiveMessage) -> SendResult:
        """The choices as quick replies under the text — and, where some of the
        platform's apps don't show quick replies, written into it as well."""
        if message.kind != InteractiveKind.BUTTONS:
            return SendResult(ok=False, error=f"{self.channel_type} only sends choices as quick replies")
        limits = self.interactive_limits
        text = to_text_fallback(message, limits.body_max) if limits.options_in_text else message.body
        return await self._send(account, conversation, {
            "text": text,
            "quick_replies": [{"content_type": "text", "title": b.title, "payload": b.id}
                              for b in message.buttons],
        })

    async def _send(self, account: ChannelAccount, conversation: ChannelConversation,
                    message: dict) -> SendResult:
        # `me/messages` resolves to the page/account owning the access token
        return await graph_post(
            "me/messages",
            self.access_token(account),
            {
                "recipient": {"id": conversation.external_conversation_id},
                **self.send_extras,
                "message": message,
            },
            base=self.graph_base_for(account),
        )

    async def send_typing(self, account: ChannelAccount, conversation: ChannelConversation) -> None:
        """Dismissed automatically when the reply is delivered, or after ~20s."""
        try:
            result = await graph_post(
                "me/messages",
                self.access_token(account),
                {
                    "recipient": {"id": conversation.external_conversation_id},
                    "sender_action": "typing_on",
                },
                base=self.graph_base_for(account),
            )
            if not result.ok:
                logger.debug(f"{self.channel_type} typing_on failed (non-critical): {result.error}")
        except Exception as e:
            logger.debug(f"{self.channel_type} typing_on failed (non-critical): {e}")

    def format_outbound(self, markdown: str) -> str:
        return markdown[:self.max_text_length]

    async def fetch_profile(self, account: ChannelAccount, external_user_id: str) -> dict:
        """The customer's name, which the webhook never carries — Messenger
        sends only a PSID, so without this every customer shows as
        "Messenger user 2742…" in People.

        Meta only answers the profile lookup for apps with Business Asset User
        Profile Access, so when it refuses we read the name off the Page's
        conversation with that person instead.

        Best-effort: a lookup failure must not cost us the message, so it
        degrades to {} (the placeholder stays) rather than raising.
        """
        token = self.access_token(account)
        base = self.graph_base_for(account)
        ok, data = await graph_get(external_user_id, token,
                                   params={"fields": self.profile_fields}, base=base)
        name = self._display_name(data) if ok else ""
        if name:
            return {"name": name}
        if not ok:
            logger.info(f"{self.channel_type} profile lookup refused for account {account.id}: "
                        f"{graph_detail(data, 'no detail')}")
        if self.conversation_name_fallback:
            name = await self._name_from_conversation(account, token, base, external_user_id)
        return {"name": name} if name else {}

    async def _name_from_conversation(self, account: ChannelAccount, token: str, base: str,
                                      external_user_id: str) -> str:
        """The person's name as the Page's conversation with them lists it."""
        ok, data = await graph_get("me/conversations", token,
                                   params={"platform": self.channel_type, "user_id": external_user_id,
                                           "fields": "participants"},
                                   base=base)
        if not ok:
            logger.info(f"{self.channel_type} conversation lookup refused for account {account.id}: "
                        f"{graph_detail(data, 'no detail')}")
            return ""
        for conversation in data.get("data") or []:
            for person in (conversation.get("participants") or {}).get("data") or []:
                if str(person.get("id")) == external_user_id:
                    return (person.get("name") or "").strip()
        return ""

    @staticmethod
    def _display_name(data: dict) -> str:
        return " ".join(p for p in (data.get("first_name"), data.get("last_name")) if p).strip()


def _quick_reply(message: dict) -> Optional[InteractiveReply]:
    """A tapped quick reply: its payload is the choice's id, the text its title."""
    payload = (message.get("quick_reply") or {}).get("payload")
    if not payload:
        return None
    return InteractiveReply(type=InteractiveReplyType.BUTTON_REPLY, id=str(payload), title=message.get("text") or "")


register_adapter(MessengerAdapter())

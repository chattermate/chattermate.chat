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
from app.channels.meta_base import GRAPH_BASE, MetaBaseAdapter, graph_get, graph_post
from app.channels.registry import register_adapter
from app.models.channels import ChannelAccount, ChannelConversation, ChannelType
from app.core.logger import get_logger

logger = get_logger(__name__)

# Messenger send API limit
MAX_MESSAGE_LENGTH = 2000


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
    # Extra keys on a send. messaging_type is a Messenger Platform parameter and
    # is not part of Instagram's documented send body, so Instagram sends none.
    send_extras: ClassVar[dict] = {"messaging_type": "RESPONSE"}

    def parse_inbound(self, payload: dict) -> List[InboundMessage]:
        """Normalize entry[].messaging[] events. Echoes, delivery/read receipts
        and attachment-only messages yield nothing."""
        messages: List[InboundMessage] = []
        for entry in payload.get("entry", []):
            account_id = str(entry.get("id", ""))
            for event in entry.get("messaging", []):
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
                    timestamp=self._timestamp(event.get("timestamp") and event["timestamp"] // 1000),
                ))
        return messages

    async def send_text(self, account: ChannelAccount, conversation: ChannelConversation, text: str) -> SendResult:
        # `me/messages` resolves to the page/account owning the access token
        return await graph_post(
            "me/messages",
            self.access_token(account),
            {
                "recipient": {"id": conversation.external_conversation_id},
                **self.send_extras,
                "message": {"text": text},
            },
            base=self.graph_base,
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
                base=self.graph_base,
            )
            if not result.ok:
                logger.debug(f"{self.channel_type} typing_on failed (non-critical): {result.error}")
        except Exception as e:
            logger.debug(f"{self.channel_type} typing_on failed (non-critical): {e}")

    def format_outbound(self, markdown: str) -> str:
        return markdown[:MAX_MESSAGE_LENGTH]

    async def fetch_profile(self, account: ChannelAccount, external_user_id: str) -> dict:
        """The customer's name, which the webhook never carries — Messenger
        sends only a PSID, so without this every customer shows as
        "Messenger user 2742…" in People.

        Best-effort: a lookup failure must not cost us the message, so it
        degrades to {} (the placeholder stays) rather than raising. Reading a
        sender's name needs no permission beyond messaging them.
        """
        ok, data = await graph_get(external_user_id, self.access_token(account),
                                   params={"fields": self.profile_fields},
                                   base=self.graph_base)
        if not ok:
            return {}
        name = self._display_name(data)
        return {"name": name} if name else {}

    @staticmethod
    def _display_name(data: dict) -> str:
        return " ".join(p for p in (data.get("first_name"), data.get("last_name")) if p).strip()


register_adapter(MessengerAdapter())

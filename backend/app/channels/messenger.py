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
from app.channels.meta_base import MetaBaseAdapter, graph_post
from app.channels.registry import register_adapter
from app.models.channels import ChannelAccount, ChannelConversation, ChannelType
from app.core.logger import get_logger

logger = get_logger(__name__)

# Messenger send API limit
MAX_MESSAGE_LENGTH = 2000


class MessengerAdapter(MetaBaseAdapter):
    """Facebook Messenger. Instagram DM shares the same entry[].messaging[]
    envelope and Graph send, so InstagramAdapter subclasses this."""

    channel_type: ClassVar[str] = ChannelType.MESSENGER.value

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
                "messaging_type": "RESPONSE",
                "message": {"text": text},
            },
        )

    def format_outbound(self, markdown: str) -> str:
        return markdown[:MAX_MESSAGE_LENGTH]


register_adapter(MessengerAdapter())

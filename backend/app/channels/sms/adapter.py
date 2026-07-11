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

from app.channels.base import ChannelAdapter, InboundMessage, SendResult
from app.channels.registry import register_adapter
from app.channels.sms.base import MAX_MESSAGE_LENGTH, get_provider
from app.models.channels import ChannelAccount, ChannelConversation, ChannelType
from app.core.logger import get_logger

logger = get_logger(__name__)


def account_provider_name(account: ChannelAccount) -> str:
    """The SMS provider chosen for this account (stored non-secret in settings;
    defaults to twilio for accounts connected before providers existed)."""
    return (account.settings or {}).get("provider", "twilio")


class SmsAdapter(ChannelAdapter):
    """The 'sms' channel. Inbound parsing/verification is provider-specific and
    handled by the /webhooks/sms route; this adapter only dispatches outbound
    sends to the account's provider."""

    channel_type: ClassVar[str] = ChannelType.SMS.value

    async def verify_webhook(self, headers: dict, raw_body: bytes, account: Optional[ChannelAccount]) -> bool:
        # SMS inbound is verified per-provider inside the webhook route.
        return account is not None

    def parse_inbound(self, payload: dict) -> List[InboundMessage]:
        # Inbound is parsed per-provider in the webhook route, not here.
        return []

    async def send_text(self, account: ChannelAccount, conversation: ChannelConversation, text: str) -> SendResult:
        provider = get_provider(account_provider_name(account))
        if provider is None:
            return SendResult(ok=False, error=f"Unknown SMS provider '{account_provider_name(account)}'")
        return await provider.send(account, conversation.external_conversation_id, text)

    def format_outbound(self, markdown: str) -> str:
        plain = markdown.replace("**", "").replace("__", "")
        return plain[:MAX_MESSAGE_LENGTH]


register_adapter(SmsAdapter())

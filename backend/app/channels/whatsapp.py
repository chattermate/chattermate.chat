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
    DeliveryState, InboundMessage, InteractiveKind, InteractiveMessage,
    InteractiveReply, InteractiveReplyType, InteractiveSection, SendResult, SharedLocation,
    StatusEvent, WindowStatus,
)
from app.channels.constants import DEFAULT_TEMPLATE_LANGUAGE
from app.channels.interactive_limits import WHATSAPP_LIMITS, InteractiveLimits
from app.channels.meta_base import MetaBaseAdapter, graph_post
from app.channels.registry import register_adapter
from app.models.channels import ChannelAccount, ChannelConversation, ChannelType
from app.core.logger import get_logger

logger = get_logger(__name__)

# https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
MAX_MESSAGE_LENGTH = 4096


class WhatsAppAdapter(MetaBaseAdapter):
    channel_type: ClassVar[str] = ChannelType.WHATSAPP.value
    # Outside the 24h window WhatsApp allows re-opening with an approved template
    expired_status: ClassVar[WindowStatus] = WindowStatus.TEMPLATE_REQUIRED
    interactive_limits: ClassVar[Optional[InteractiveLimits]] = WHATSAPP_LIMITS
    reports_delivery_status: ClassVar[bool] = True
    max_text_length: ClassVar[Optional[int]] = MAX_MESSAGE_LENGTH

    def parse_inbound(self, payload: dict) -> List[InboundMessage]:
        """Normalize a WhatsApp Cloud API webhook.

        Shape: entry[].changes[].value.{metadata,contacts,messages}. Status
        callbacks (delivered/read) carry no `messages` and yield nothing.
        """
        messages: List[InboundMessage] = []
        for entry in payload.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                metadata = value.get("metadata", {})
                phone_number_id = metadata.get("phone_number_id")
                if not phone_number_id or not value.get("messages"):
                    continue
                name_by_wa_id = {
                    c.get("wa_id"): (c.get("profile") or {}).get("name")
                    for c in value.get("contacts", [])
                }
                for message in value["messages"]:
                    interactive = self._extract_interactive(message)
                    location = self._extract_location(message)
                    text = self._extract_text(message, interactive, location)
                    if text is None:
                        continue  # media types until media support lands
                    wa_id = message.get("from")
                    messages.append(InboundMessage(
                        external_account_id=str(phone_number_id),
                        external_conversation_id=str(wa_id),
                        external_user_id=str(wa_id),
                        external_message_id=str(message.get("id", "")),
                        text=text,
                        # wa_id is the customer's number in E.164-without-plus,
                        # declared verbatim (like the SMS adapters) so the one
                        # normalize_msisdn boundary owns all '+' handling.
                        profile={"name": name_by_wa_id.get(wa_id), "phone": str(wa_id)},
                        timestamp=self._timestamp(message.get("timestamp")),
                        interactive=interactive,
                        location=location,
                        reply_to_message_id=(message.get("context") or {}).get("id"),
                    ))
        return messages

    @staticmethod
    def _extract_text(message: dict, interactive: Optional[InteractiveReply],
                      location: Optional[SharedLocation]) -> Optional[str]:
        if message.get("type") == "text":
            return (message.get("text") or {}).get("body")
        # A tap reads as the text the customer saw, so the agent needs no
        # special handling; the id travels separately on `interactive`. A
        # tap without a title (never expected) falls back to its id rather
        # than running a turn on nothing.
        if interactive is not None:
            return interactive.title or interactive.id or None
        if location is not None:
            return _describe_location(location)
        return None

    @staticmethod
    def _extract_interactive(message: dict) -> Optional[InteractiveReply]:
        if message.get("type") == "button":
            # Template quick-reply button: `payload` is what the template set
            button = message.get("button") or {}
            return InteractiveReply(type=InteractiveReplyType.TEMPLATE_BUTTON,
                                    id=str(button.get("payload") or ""),
                                    title=str(button.get("text") or ""))
        if message.get("type") == "interactive":
            interactive = message.get("interactive") or {}
            for reply_type in (InteractiveReplyType.BUTTON_REPLY, InteractiveReplyType.LIST_REPLY):
                reply = interactive.get(reply_type.value)
                if reply:
                    return InteractiveReply(type=reply_type,
                                            id=str(reply.get("id") or ""),
                                            title=str(reply.get("title") or ""))
        return None

    @staticmethod
    def _extract_location(message: dict) -> Optional[SharedLocation]:
        if message.get("type") != "location":
            return None
        location = message.get("location") or {}
        try:
            return SharedLocation(latitude=float(location["latitude"]),
                                  longitude=float(location["longitude"]),
                                  name=location.get("name"),
                                  address=location.get("address"))
        except (KeyError, TypeError, ValueError):
            return None

    def parse_status_events(self, payload: dict) -> List[StatusEvent]:
        """Delivery receipts: entry[].changes[].value.statuses[]."""
        events: List[StatusEvent] = []
        for entry in payload.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                phone_number_id = (value.get("metadata") or {}).get("phone_number_id")
                if not phone_number_id:
                    continue
                for status in value.get("statuses") or []:
                    event = self._status_event(str(phone_number_id), status)
                    if event is not None:
                        events.append(event)
        return events

    def _status_event(self, phone_number_id: str, status: dict) -> Optional[StatusEvent]:
        try:
            state = DeliveryState(status.get("status"))
        except ValueError:
            return None  # e.g. 'deleted' — not a delivery state we track
        message_id = status.get("id")
        if not message_id:
            return None
        pricing = status.get("pricing") or {}
        errors = status.get("errors") or []
        error_code = str(errors[0]["code"]) if errors and errors[0].get("code") is not None else None
        return StatusEvent(
            external_account_id=phone_number_id,
            external_message_id=str(message_id),
            recipient_id=str(status.get("recipient_id") or ""),
            status=state,
            timestamp=self._timestamp(status.get("timestamp")),
            error=_status_error(errors[0]) if errors else None,
            error_code=error_code,
            account_blocked=error_code in ACCOUNT_BLOCKING_ERROR_CODES,
            pricing_category=pricing.get("category"),
            pricing_type=pricing.get("type"),
            pricing_model=pricing.get("pricing_model"),
            billable=pricing.get("billable"),
        )

    def conversation_state(self, inbound: InboundMessage) -> dict:
        # send_typing marks a specific message as read, so it needs the wamid of
        # the message it is replying to.
        if not inbound.external_message_id:
            return {}
        return {"last_inbound_message_id": inbound.external_message_id}

    async def send_typing(self, account: ChannelAccount, conversation: ChannelConversation) -> None:
        """Show a typing indicator. WhatsApp only offers this as part of marking
        an inbound message read, so this also blue-ticks that message. Expires
        after 25s or when the reply is delivered."""
        message_id = (conversation.extra or {}).get("last_inbound_message_id")
        if message_id:
            await self._read_receipt(account, message_id, typing=True)

    async def mark_read(self, account: ChannelAccount, external_message_id: str) -> None:
        if external_message_id:
            await self._read_receipt(account, external_message_id, typing=False)

    async def _read_receipt(self, account: ChannelAccount, message_id: str, typing: bool) -> None:
        payload = {"messaging_product": "whatsapp", "status": "read", "message_id": message_id}
        if typing:
            payload["typing_indicator"] = {"type": "text"}
        try:
            result = await graph_post(f"{account.external_account_id}/messages",
                                      self.access_token(account), payload)
            if not result.ok:
                logger.debug(f"WhatsApp read receipt failed (non-critical): {result.error}")
        except Exception as e:
            logger.debug(f"WhatsApp read receipt failed (non-critical): {e}")

    async def send_text(self, account: ChannelAccount, conversation: ChannelConversation, text: str) -> SendResult:
        return await graph_post(
            f"{account.external_account_id}/messages",
            self.access_token(account),
            {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": conversation.external_conversation_id,
                "type": "text",
                "text": {"preview_url": False, "body": text},
            },
        )

    async def send_template(self, account: ChannelAccount, conversation: ChannelConversation,
                            template_name: str, language: str = DEFAULT_TEMPLATE_LANGUAGE,
                            components: list = None) -> SendResult:
        """Send an approved template message — the only way to reach a customer
        outside the 24h window."""
        template: dict = {"name": template_name, "language": {"code": language}}
        if components:
            template["components"] = components
        return await graph_post(
            f"{account.external_account_id}/messages",
            self.access_token(account),
            {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": conversation.external_conversation_id,
                "type": "template",
                "template": template,
            },
        )

    async def send_interactive(self, account: ChannelAccount, conversation: ChannelConversation,
                               message: InteractiveMessage) -> SendResult:
        return await graph_post(
            f"{account.external_account_id}/messages",
            self.access_token(account),
            {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": conversation.external_conversation_id,
                "type": "interactive",
                "interactive": _interactive_payload(message),
            },
        )

    def format_outbound(self, markdown: str) -> str:
        # WhatsApp renders *bold* / _italic_ but agent markdown (**bold**) doesn't
        # map cleanly; send as-is with the length cap to avoid mangled markup.
        return markdown[:MAX_MESSAGE_LENGTH]


def _describe_location(location: SharedLocation) -> str:
    """A shared pin as text the agent (and the inbox) can read."""
    place = ", ".join(p for p in (location.name, location.address) if p)
    coordinates = f"{location.latitude}, {location.longitude}"
    return f"Shared location: {place} ({coordinates})" if place else f"Shared location: {coordinates}"


# Failed-receipt codes that mean the sending account cannot send at all, as
# opposed to one message or recipient failing: 131031 account locked,
# 131042 payment/eligibility problem, 133010 number not registered.
ACCOUNT_BLOCKING_ERROR_CODES = frozenset({"131031", "131042", "133010"})


def _status_error(error: dict) -> str:
    details = (error.get("error_data") or {}).get("details")
    return str(details or error.get("message") or error.get("title") or error.get("code") or "failed")


def _interactive_payload(message: InteractiveMessage) -> dict:
    """The Graph `interactive` object for a validated InteractiveMessage."""
    payload: dict = {"body": {"text": message.body}}
    if message.header:
        payload["header"] = {"type": "text", "text": message.header}
    if message.footer:
        payload["footer"] = {"text": message.footer}

    if message.kind == InteractiveKind.BUTTONS:
        payload["type"] = "button"
        payload["action"] = {"buttons": [
            {"type": "reply", "reply": {"id": b.id, "title": b.title}} for b in message.buttons
        ]}
    elif message.kind == InteractiveKind.LIST:
        payload["type"] = "list"
        payload["action"] = {
            "button": message.list_button_label,
            "sections": [_list_section(s) for s in message.sections],
        }
    else:
        payload["type"] = "cta_url"
        payload["action"] = {"name": "cta_url", "parameters": {
            "display_text": message.display_text, "url": message.url,
        }}
    return payload


def _list_section(section: InteractiveSection) -> dict:
    rows = []
    for row in section.rows:
        item = {"id": row.id, "title": row.title}
        if row.description:
            item["description"] = row.description
        rows.append(item)
    out: dict = {"rows": rows}
    if section.title:
        out["title"] = section.title
    return out


register_adapter(WhatsAppAdapter())

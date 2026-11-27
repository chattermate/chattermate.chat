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

What a channel customer's message carries beyond its text — a tapped
button, a shared location — and how a tap on one of the agent's own choices
reads back as the full option.
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.channels.base import InboundMessage
from app.channels.sent_choices import (
    SENT_CHOICES_ATTRIBUTE, decode_sent_choices, sent_choice_text, sent_numbered_choice,
)
from app.repositories.chat import ChatRepository

# chat_history.attributes key for a tap: only its type and id. The visible
# text is already the (encrypted) message, and a shared location's details
# live there too — nothing customer-identifying goes in plaintext attributes.
REPLY_ATTRIBUTE = "interactive_reply"
# How far back a tap without reply context is matched to the reply that offered it
RECENT_OFFERS = 10


def inbound_attributes(inbound: InboundMessage, channel_type: str) -> dict:
    """The chat_history attributes for a customer's channel message."""
    attributes = {
        "channel": channel_type,
        "external_message_id": inbound.external_message_id,
    }
    if inbound.interactive is not None:
        attributes[REPLY_ATTRIBUTE] = {
            "type": inbound.interactive.type.value,
            "id": inbound.interactive.id,
        }
    if inbound.reply_to_message_id:
        attributes["reply_to_message_id"] = inbound.reply_to_message_id
    return attributes


def reply_text(db: Session, channel_account_id: UUID, inbound: InboundMessage,
               conversation_ids: Optional[List[str]] = None) -> str:
    """The text to store and answer for this message.

    A tap arrives as the button's title, which may have been cut to fit (or,
    on Telegram, as just the button's id); a reply to choices shown as a
    numbered list may be just the number. The full choice is in the record
    of what the offering message sent, looked up within this customer's chat
    on this account — by the tap's reply context where the platform gives
    one, otherwise as the latest reply that offered the choice.
    """
    # Every id the chat may be stored under (a WhatsApp number's forms, see external_ids)
    ids = conversation_ids or [inbound.external_conversation_id]
    choice = _tapped_choice(db, channel_account_id, inbound, ids) or _numbered_choice(db, channel_account_id, inbound, ids)
    if choice is not None:
        return choice
    return inbound.text or (inbound.interactive.title if inbound.interactive else "") or ""


def _tapped_choice(db: Session, channel_account_id: UUID, inbound: InboundMessage, ids: List[str]) -> Optional[str]:
    if inbound.interactive is None:
        return None
    repo = ChatRepository(db)
    if inbound.reply_to_message_id:
        offered = repo.in_channel_chat_by_external_message_id(
            channel_account_id, ids, inbound.reply_to_message_id)
        candidates = [offered] if offered is not None else []
    else:
        candidates = repo.latest_replies_in_channel_chat(
            channel_account_id, ids, RECENT_OFFERS)
    for offered in candidates:
        text = sent_choice_text(_record(offered), inbound.interactive.id)
        if text is not None:
            return text
    return None


def _numbered_choice(db: Session, channel_account_id: UUID, inbound: InboundMessage, ids: List[str]) -> Optional[str]:
    """A bare number answering our latest reply — the AI's or a person's —
    when that reply showed its choices numbered (as text, or alongside
    buttons a desktop app hides)."""
    typed = (inbound.text or "").strip().rstrip(".")
    if inbound.interactive is not None or not typed.isdecimal():
        return None
    latest = ChatRepository(db).latest_replies_in_channel_chat(
        channel_account_id, ids, 1)
    return sent_numbered_choice(_record(latest[0]), typed) if latest else None


def _record(message) -> Optional[dict]:
    return decode_sent_choices((message.attributes or {}).get(SENT_CHOICES_ATTRIBUTE))

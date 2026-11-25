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

STOP and START on a business number. A contact who replies STOP (or taps a
template's "Stop updates" button) gets no more business-initiated messages
from that number: order updates, alerts, the inbox's templates, app
integrations. START turns them back on. Kept in channel_opt_outs, the one
record they all read; extensions hear about each change (opt-out
listeners) to tidy their own lists.

Only on channels where a business can message first (WhatsApp templates);
elsewhere "stop" is just a word in a chat.
"""

import re
from typing import Callable, List, Optional

from sqlalchemy.orm import Session

from app.channels.base import InboundMessage
from app.core.logger import get_logger
from app.models.channels import ChannelAccount, ChannelType, OptOutSource
from app.repositories.channels import ChannelOptOutRepository
from app.utils.phone import normalize_msisdn

logger = get_logger(__name__)

# The whole message, ignoring case and punctuation ("STOP", "Stop.", "stop updates")
STOP_WORDS = {"stop", "unsubscribe", "stop updates", "stop all"}
START_WORDS = {"start", "unstop"}
# The payload of a template's "Stop updates" quick-reply button
STOP_BUTTON_PAYLOAD = "optout:stop"
PROACTIVE_CHANNELS = {ChannelType.WHATSAPP.value}

STOPPED_REPLY = "You won't get these messages from us any more. Reply START if you change your mind."
STARTED_REPLY = "Updates are back on. Reply STOP any time to turn them off."

_NOT_A_LETTER = re.compile(r"[^a-z ]+")

# (db, account, contact, opted_out): told after each STOP (True) or START (False)
OptOutListener = Callable[[Session, ChannelAccount, str, bool], None]
_listeners: List[OptOutListener] = []


def register_opt_out_listener(listener: OptOutListener) -> None:
    if listener not in _listeners:
        _listeners.append(listener)


def reset_opt_out_listeners() -> None:
    """Forget every listener (tests)."""
    _listeners.clear()


def contact_of(account: ChannelAccount, inbound: InboundMessage) -> Optional[str]:
    """Who wrote, as opt-outs key them: the WhatsApp number in E.164."""
    if account.channel_type != ChannelType.WHATSAPP.value:
        return None
    return normalize_msisdn(inbound.external_user_id)


def _words(text: Optional[str]) -> str:
    return " ".join(_NOT_A_LETTER.sub(" ", (text or "").lower()).split())


def _tell_listeners(db: Session, account: ChannelAccount, contact: str, opted_out: bool) -> None:
    for listener in list(_listeners):
        try:
            listener(db, account, contact, opted_out)
        except Exception as e:
            db.rollback()
            logger.error(f"Opt-out listener failed for account {account.id}: {e}")


def opt_out(db: Session, account: ChannelAccount, contact: str, source: str) -> None:
    ChannelOptOutRepository(db).opt_out(account, contact, source)
    _tell_listeners(db, account, contact, True)


def opt_in(db: Session, account: ChannelAccount, contact: str) -> bool:
    """START: True when they had opted out."""
    if not ChannelOptOutRepository(db).opt_in(account.id, contact):
        return False
    _tell_listeners(db, account, contact, False)
    return True


def opt_out_reply(db: Session, account: ChannelAccount, inbound: InboundMessage) -> Optional[str]:
    """The answer to a STOP or START, recorded; None for any other message.
    A START from someone who never opted out is an ordinary message."""
    if account.channel_type not in PROACTIVE_CHANNELS:
        return None
    contact = contact_of(account, inbound)
    if contact is None:
        return None
    tap = inbound.interactive
    if tap is not None and tap.id == STOP_BUTTON_PAYLOAD:
        opt_out(db, account, contact, OptOutSource.BUTTON)
        return STOPPED_REPLY
    if tap is not None:
        return None
    words = _words(inbound.text)
    if words in STOP_WORDS:
        opt_out(db, account, contact, OptOutSource.STOP_WORD)
        return STOPPED_REPLY
    if words in START_WORDS and opt_in(db, account, contact):
        return STARTED_REPLY
    return None


def is_opted_out(db: Session, account: ChannelAccount, phone: Optional[str]) -> bool:
    """Whether this number told the account STOP."""
    return ChannelOptOutRepository(db).is_opted_out(account.id, normalize_msisdn(phone))

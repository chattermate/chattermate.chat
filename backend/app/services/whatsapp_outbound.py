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

import re
import time
import uuid
from dataclasses import dataclass
from typing import Dict, Optional, Tuple
from uuid import UUID

from sqlalchemy.orm import Session

from app.channels import get_adapter
from app.channels.app_hooks import OutboundRecord, emit_channel_event, outbound_event
from app.channels.constants import DEFAULT_TEMPLATE_LANGUAGE, MessageSource
from app.utils.customer_names import placeholder_name
from app.services.channel_opt_outs import is_opted_out
from app.services.business_message import remember_business_message
from app.services.channel_status import record_sent
from app.services.chat_notifications import team_not_yet_notified
from app.channels.meta_base import fetch_message_templates, graph_auth_refused, graph_detail
from app.core.logger import get_logger
from app.models.channels import ChannelAccount
from app.repositories.channels import (
    AgentChannelConfigRepository,
    ChannelAccountRepository,
    ChannelConversationRepository,
)
from app.repositories.chat import ChatRepository
from app.repositories.customer import CustomerRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.utils.phone import normalize_phone, to_wa_id

logger = get_logger(__name__)

# Business-initiated conversations are Utility/Authentication only. Marketing
# is deliberately unsupported outbound: it carries opt-in obligations and
# per-user caps (Graph error 131049) that a support product should not walk
# its customers into. The reopen flow (an existing conversation) is unaffected.
OUTBOUND_CATEGORIES = {"UTILITY", "AUTHENTICATION"}

_PLACEHOLDER = re.compile(r"\{\{(\d+)\}\}")


@dataclass
class OutboundSent:
    """A started (or rejoined) conversation and the template that opened it."""
    session_id: UUID
    message_id: int
    external_message_id: Optional[str]


class OutboundReason:
    """Why a send was refused, for callers that decide what happens next (a
    queue retries a failed send but never an opted-out contact)."""
    OPTED_OUT = "opted_out"
    BAD_NUMBER = "bad_number"
    NO_AGENT = "no_agent"
    NOT_CONNECTED = "not_connected"
    TEMPLATE_MISSING = "template_missing"
    TEMPLATE_NOT_APPROVED = "template_not_approved"
    TEMPLATE_CATEGORY = "template_category"
    TEMPLATES_UNREADABLE = "templates_unreadable"
    SEND_FAILED = "send_failed"


class OutboundError(Exception):
    """A refused or failed outbound send. Carries the HTTP status the API
    route should answer with, so the Phase-2 scheduler can reuse the service
    without importing anything web-shaped, plus why (`reason`) and, for a
    send WhatsApp refused, Meta's error code."""

    def __init__(self, status_code: int, detail: str, reason: str = OutboundReason.SEND_FAILED,
                 meta_code: Optional[int] = None):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail
        self.reason = reason
        self.meta_code = meta_code


# An account's templates, read from Meta at most this often for a template
# already approved (one that isn't is always read again: its review may be done)
TEMPLATE_CACHE_SECONDS = 600
_template_cache: Dict[Tuple[str, str], Tuple[float, list]] = {}


def forget_templates() -> None:
    """Drop the cached template lists (tests, or after creating a template)."""
    _template_cache.clear()


def _find_template(templates: list, name: str, language: str) -> Optional[dict]:
    return next((t for t in templates if t.get("name") == name and t.get("language") == language), None)


def _is_approved(template: Optional[dict]) -> bool:
    return template is not None and str(template.get("status", "")).upper() == "APPROVED"


def _render_body(template: dict, components: Optional[list]) -> str:
    """The message text as the customer will read it.

    Graph matches body parameters to {{n}} placeholders positionally in
    ascending order (the same rule the frontend's previewTemplate applies —
    keep the two honest with each other). Falls back to the raw body when a
    parameter is missing rather than failing the send: Meta is the authority
    on completeness and will reject a genuinely short send itself.
    """
    body = next((c.get("text", "") for c in template.get("components") or []
                 if str(c.get("type", "")).upper() == "BODY"), "")
    values = [
        str(parameter.get("text", ""))
        for component in components or []
        if str(component.get("type", "")).lower() == "body"
        for parameter in component.get("parameters") or []
    ]
    return _PLACEHOLDER.sub(
        lambda match: values[int(match.group(1)) - 1]
        if 0 < int(match.group(1)) <= len(values) else match.group(0),
        body,
    )


async def _approved_outbound_template(db: Session, account: ChannelAccount,
                                      name: str, language: str,
                                      *, starts_conversation: bool, customer_asked: bool = False) -> dict:
    """The template this send is allowed to use, or the reason it isn't.

    `starts_conversation` decides whether the Utility/Authentication rule
    applies. It is a rule about business-INITIATED contact, so it belongs only
    to a send that opens a thread with someone who never wrote to us. Reaching
    an existing conversation is the reopen case: the customer did message us,
    which is why Meta accepts Marketing there — and why the inbox picker has
    never been category-gated. `customer_asked` is the same case reached
    later: the customer wrote to ask for exactly this message (a back-in-stock
    sign-up), so the rule about uninvited contact doesn't apply.
    """
    repo = ChannelAccountRepository(db)
    credentials = repo.get_credentials(account)
    waba_id = credentials.get("waba_id")
    if not waba_id:
        raise OutboundError(400, "Reconnect this number with its WhatsApp "
                                 "Business Account ID to send templates", OutboundReason.NOT_CONNECTED)

    key = (str(account.id), str(waba_id))
    cached = _template_cache.get(key)
    template = _find_template(cached[1], name, language) if cached and cached[0] > time.monotonic() else None
    if not _is_approved(template):
        ok, data = await fetch_message_templates(waba_id, credentials["access_token"])
        if not ok:
            if graph_auth_refused(data):
                repo.record_auth_failure(account, graph_detail(data, "Authentication Error"))
            raise OutboundError(502, "Could not read the account's templates from Meta",
                                OutboundReason.TEMPLATES_UNREADABLE)
        _template_cache[key] = (time.monotonic() + TEMPLATE_CACHE_SECONDS, data)
        template = _find_template(data, name, language)

    if template is None:
        raise OutboundError(404, f"No template named {name} in {language} on this account",
                            OutboundReason.TEMPLATE_MISSING)
    if not _is_approved(template):
        raise OutboundError(400, f"Template {name} is not approved yet", OutboundReason.TEMPLATE_NOT_APPROVED)
    if starts_conversation and not customer_asked and \
            str(template.get("category", "")).upper() not in OUTBOUND_CATEGORIES:
        raise OutboundError(
            400,
            "Only Utility and Authentication templates can start a conversation. "
            "Marketing templates need the customer to have messaged you first.",
            OutboundReason.TEMPLATE_CATEGORY,
        )
    return template


def _resolve_customer(db: Session, account: ChannelAccount, phone: str,
                      customer_id: Optional[UUID], customer_name: Optional[str]):
    """The person this conversation belongs to.

    A picked person must actually OWN the number being messaged — the two
    arrive as independent fields, and binding a conversation to one person at
    another person's number is unrecoverable: the reply resolves by phone to
    somebody else, so history splits across two customers and the thread never
    appears on the profile of the person actually in it.

    set_phone_if_absent's skip-and-log is right for the automatic inbound
    paths, where there is nobody to tell. Here there is a human waiting on a
    response, so a conflict is refused instead of silently ignored.
    """
    repo = CustomerRepository(db)
    if customer_id is not None:
        customer = repo.get_by_id(customer_id)
        if customer is None or customer.organization_id != account.organization_id:
            raise OutboundError(404, "Customer not found")
        if customer.phone and customer.phone != phone:
            raise OutboundError(
                400,
                f"{customer.full_name or 'That person'} has a different number on "
                f"file. Send to their number, or update it on their profile first.",
            )
        owner = repo.get_customer_by_phone(phone, account.organization_id)
        if owner is not None and owner.id != customer.id:
            raise OutboundError(
                400,
                f"{phone} already belongs to {owner.full_name or 'another person'}. "
                f"Pick them instead, or clear the number from their profile.",
            )
        repo.set_phone_if_absent(customer, phone)
        return customer

    wa_id = to_wa_id(phone)
    customer = repo.get_or_create_customer(
        email=f"{wa_id}@whatsapp.channel",
        organization_id=account.organization_id,
        full_name=customer_name or placeholder_name(account.channel_type, wa_id),
        phone=phone,
    )
    # First-touch source for People's Source column; setdefault semantics so a
    # person who arrived some other way keeps their original story.
    if customer.lead_source is None:
        customer.lead_source = {"channel": "whatsapp", "via": "outbound"}
    return customer


async def start_outbound_conversation(
    db: Session,
    account: ChannelAccount,
    *,
    to: str,
    template_name: str,
    language: str = DEFAULT_TEMPLATE_LANGUAGE,
    components: Optional[list] = None,
    customer_id: Optional[UUID] = None,
    customer_name: Optional[str] = None,
    source: MessageSource,
    customer_asked: bool = False,
) -> OutboundSent:
    """Start (or rejoin) a WhatsApp conversation by phone number.

    Returns the session — everything downstream (the inbox thread, template
    resends, the AI answering the reply) already keys off one, which is why
    this hands one back instead of growing a parallel outbound code path —
    and the stored template message. `source` is who sent it (an inbox user,
    or an external app). The team is told about the thread only once the
    customer's reply needs them (notify_new_channel_chat_once), so a bulk
    send doesn't page anyone.

    The conversation is created with last_inbound_at=None: no customer message
    means no 24-hour window, and pretending otherwise would let the AI send
    free-form text that Meta rejects.
    """
    phone = normalize_phone(to)
    if phone is None:
        raise OutboundError(400, "Enter the number in international format, e.g. +91 12345 67890",
                            OutboundReason.BAD_NUMBER)
    wa_id = to_wa_id(phone)
    if is_opted_out(db, account, phone):
        raise OutboundError(409, "This person replied STOP, so this number can't message them first",
                            OutboundReason.OPTED_OUT)

    agent_id = AgentChannelConfigRepository(db).get_active_agent_id(account.id)
    if agent_id is None:
        raise OutboundError(400, "Route an agent to this number first — "
                                 "otherwise nobody would answer the reply", OutboundReason.NO_AGENT)

    # Resolved BEFORE the template is validated: whether this opens a thread or
    # rejoins one decides which rules the template must satisfy.
    conv_repo = ChannelConversationRepository(db)
    existing = conv_repo.get_active(account.id, wa_id)

    template = await _approved_outbound_template(
        db, account, template_name, language, starts_conversation=existing is None,
        customer_asked=customer_asked)

    if existing is not None:
        # An open conversation already carries this number; send there instead
        # of splitting the thread. The window may even be open, but a template
        # send inside the window is legal and simpler than branching.
        conversation, session_id = existing, existing.session_id
        customer = None
    else:
        customer = _resolve_customer(db, account, phone, customer_id, customer_name)
        session_id = uuid.uuid4()
        SessionToAgentRepository(db).create_session(
            session_id=session_id,
            agent_id=str(agent_id),
            customer_id=str(customer.id),
            organization_id=str(account.organization_id),
            channel=account.channel_type,
        )
        conversation = conv_repo.create(
            channel_account_id=account.id,
            channel_type=account.channel_type,
            external_conversation_id=wa_id,
            external_user_id=wa_id,
            session_id=session_id,
            organization_id=account.organization_id,
            agent_id=agent_id,
            customer_id=customer.id,
            last_inbound_at=None,
            extra=team_not_yet_notified(),
        )

    adapter = get_adapter("whatsapp")
    result = await adapter.send_template(account, conversation, template_name,
                                         language, components)
    ChannelAccountRepository(db).track_send_result(account, result)
    if not result.ok:
        if existing is None:
            # A failed send must not leave an empty thread in the inbox: drop
            # the conversation, then the session it points at. The customer
            # row stays — harmless, and reused on the next attempt.
            #
            # Guarded, because an exception escaping here would replace the 502
            # (which names Meta's actual reason) with an opaque 500 AND leave
            # the empty thread this block exists to remove. Failing to clean up
            # is worth a log; losing the reason the send failed is not.
            from app.models.session_to_agent import SessionToAgent
            try:
                db.delete(conversation)
                db.query(SessionToAgent).filter(
                    SessionToAgent.session_id == session_id).delete()
                db.commit()
            except Exception as e:
                db.rollback()
                logger.error(f"Could not roll back the empty outbound thread for "
                             f"session {session_id}: {e}")
        raise OutboundError(502, result.error or "WhatsApp did not accept the message",
                            OutboundReason.SEND_FAILED, meta_code=result.error_code)

    rendered = _render_body(template, components)
    stored = ChatRepository(db).create_message({
        "message": rendered,
        "message_type": "bot",
        "session_id": str(session_id),
        "organization_id": str(account.organization_id),
        "agent_id": str(agent_id),
        # A reused conversation row predating this feature can lack a customer.
        "customer_id": str(conversation.customer_id) if conversation.customer_id else None,
        "attributes": {
            "channel": account.channel_type,
            "external_message_id": result.external_message_id,
            "outbound_template": template_name,
            "source": source.value,
        },
    })
    if result.external_message_id:
        await record_sent(db, stored.id, account.id, result.external_message_id)
    # The AI reads this when the customer replies: a bare "yes" is meaningless
    # without knowing what we asked.
    remember_business_message(db, conversation, rendered, result.external_message_id)
    await emit_channel_event(outbound_event(
        organization_id=account.organization_id, channel_account_id=account.id,
        session_id=str(session_id),
        customer_id=str(conversation.customer_id) if conversation.customer_id else None,
        record=OutboundRecord(message_id=stored.id, external_message_id=result.external_message_id,
                              source=source, text=rendered),
    ))
    return OutboundSent(session_id=session_id, message_id=stored.id,
                        external_message_id=result.external_message_id)

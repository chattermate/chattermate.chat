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
import uuid
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.channels import get_adapter
from app.channels.meta_base import fetch_message_templates
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


class OutboundError(Exception):
    """A refused or failed outbound send. Carries the HTTP status the API
    route should answer with, so the Phase-2 scheduler can reuse the service
    without importing anything web-shaped."""

    def __init__(self, status_code: int, detail: str):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


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
                                      name: str, language: str) -> dict:
    """The template this send is allowed to use, or the reason it isn't."""
    credentials = ChannelAccountRepository(db).get_credentials(account)
    waba_id = credentials.get("waba_id")
    if not waba_id:
        raise OutboundError(400, "Reconnect this number with its WhatsApp "
                                 "Business Account ID to send templates")

    ok, data = await fetch_message_templates(waba_id, credentials["access_token"])
    if not ok:
        raise OutboundError(502, "Could not read the account's templates from Meta")

    template = next(
        (t for t in data if t.get("name") == name and t.get("language") == language),
        None,
    )
    if template is None:
        raise OutboundError(404, f"No template named {name} in {language} on this account")
    if str(template.get("status", "")).upper() != "APPROVED":
        raise OutboundError(400, f"Template {name} is not approved yet")
    if str(template.get("category", "")).upper() not in OUTBOUND_CATEGORIES:
        raise OutboundError(
            400,
            "Only Utility and Authentication templates can start a conversation. "
            "Marketing templates need the customer to have messaged you first.",
        )
    return template


def _resolve_customer(db: Session, account: ChannelAccount, phone: str,
                      customer_id: Optional[UUID], customer_name: Optional[str]):
    """The person this conversation belongs to.

    An explicitly picked person is trusted (their phone is set if absent);
    otherwise resolution reuses the same repository policy as inbound — which
    is exactly what guarantees their later reply lands on this same customer.
    """
    repo = CustomerRepository(db)
    if customer_id is not None:
        customer = repo.get_by_id(customer_id)
        if customer is None or customer.organization_id != account.organization_id:
            raise OutboundError(404, "Customer not found")
        repo.set_phone_if_absent(customer, phone)
        return customer

    wa_id = to_wa_id(phone)
    customer = repo.get_or_create_customer(
        email=f"{wa_id}@whatsapp.channel",
        organization_id=account.organization_id,
        full_name=customer_name or f"Whatsapp user {wa_id[:8]}",
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
    language: str = "en_US",
    components: Optional[list] = None,
    customer_id: Optional[UUID] = None,
    customer_name: Optional[str] = None,
) -> UUID:
    """Start (or rejoin) a WhatsApp conversation by phone number.

    Returns the session_id; everything downstream — the inbox thread, template
    resends, the AI answering the reply — already keys off a session, which is
    why this returns one instead of growing a parallel outbound code path.

    The conversation is created with last_inbound_at=None: no customer message
    means no 24-hour window, and pretending otherwise would let the AI send
    free-form text that Meta rejects.
    """
    phone = normalize_phone(to)
    if phone is None:
        raise OutboundError(400, "Enter the number in international format, e.g. +91 63666 02824")
    wa_id = to_wa_id(phone)

    template = await _approved_outbound_template(db, account, template_name, language)

    agent_id = AgentChannelConfigRepository(db).get_active_agent_id(account.id)
    if agent_id is None:
        raise OutboundError(400, "Route an agent to this number first — "
                                 "otherwise nobody would answer the reply")

    conv_repo = ChannelConversationRepository(db)
    existing = conv_repo.get_active(account.id, wa_id)
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
        )

    adapter = get_adapter("whatsapp")
    result = await adapter.send_template(account, conversation, template_name,
                                         language, components)
    if not result.ok:
        if existing is None:
            # A failed send must not leave an empty thread in the inbox: drop
            # the conversation, then the session it points at. The customer
            # row stays — harmless, and reused on the next attempt.
            from app.models.session_to_agent import SessionToAgent
            db.delete(conversation)
            db.query(SessionToAgent).filter(
                SessionToAgent.session_id == session_id).delete()
            db.commit()
        raise OutboundError(502, result.error or "WhatsApp did not accept the message")

    rendered = _render_body(template, components)
    ChatRepository(db).create_message({
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
        },
    })
    # The AI reads this when the customer replies: a bare "yes" is meaningless
    # without knowing what we asked (see _run_chat_agent).
    conv_repo.set_extra(conversation, {
        **(conversation.extra or {}),
        "outbound_template": rendered,
    })
    return session_id

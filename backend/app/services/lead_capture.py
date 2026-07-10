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
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.lead_capture import LeadCaptureConfig, LeadCaptureResponse
from app.repositories.customer import CustomerRepository
from app.core.logger import get_logger

logger = get_logger(__name__)

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def has_captured_lead(db: Session, customer_id, agent_id) -> bool:
    """True once a lead has been recorded for this customer + agent (capture once)."""
    return db.query(LeadCaptureResponse.id).filter(
        LeadCaptureResponse.customer_id == customer_id,
        LeadCaptureResponse.agent_id == agent_id,
    ).first() is not None


def _valid_email(email: Optional[str]) -> bool:
    return bool(email and _EMAIL_RE.match(email.strip()))


def record_lead_capture(
    db: Session,
    config: LeadCaptureConfig,
    organization_id: UUID,
    agent_id,
    customer_id,
    session_id,
    lead_data: Optional[Dict[str, Any]],
    summary: Optional[str],
    consent: bool,
    page_url: Optional[str] = None,
    channel: str = "widget",
) -> Optional[LeadCaptureResponse]:
    """Persist an AI-captured lead (fields the agent extracted conversationally +
    an AI qualification summary). Returns None — recording nothing — when there is
    no valid email, or consent is required but not given (GDPR).

    Never records when lead capture is disabled for the agent, or when the customer
    is integration-authenticated (identified via generate-token) — those are the
    business's existing customers, not leads.

    If the captured email already belongs to ANOTHER customer in the org, the
    anonymous visitor is MERGED into that existing customer (history/sessions
    reassigned, visitor row marked merged) so People shows one entry. The returned
    response's customer_id is the final (possibly merged-into) customer.

    No CRM/Slack/assignment side effects in phase 1 — routing config is stored only.
    """
    from app.models.customer import Customer

    # Never capture when lead capture is off for this agent (authoritative guard,
    # independent of any caller-side check).
    if not (config and config.enabled):
        return None

    # Never capture integration-authenticated people (identified via generate-token) —
    # they're already the business's customers, not leads, regardless of the agent's
    # toggle. Uses the explicit flag, not meta_data (see Customer.is_authenticated).
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if customer is not None and customer.is_authenticated:
        return None

    lead_data = lead_data or {}
    # Keep only configured field keys (defensive: the model shouldn't inject others).
    field_keys = {f.get("key") for f in (config.fields or []) if f.get("key")}
    if field_keys:
        field_values = {k: v for k, v in lead_data.items() if k in field_keys and v}
    else:
        field_values = {k: v for k, v in lead_data.items() if v}

    email = (str(field_values.get("email") or "")).strip()
    if not _valid_email(email):
        return None  # need at least a valid email to have a usable lead
    if config.require_consent and not consent:
        return None  # GDPR: never record without explicit consent

    name = (str(field_values.get("name") or "")).strip() or None

    # If this email already belongs to a different customer in the org, merge the
    # current (anonymous) visitor into that customer and record the lead there.
    existing = (
        db.query(Customer)
        .filter(
            Customer.organization_id == organization_id,
            Customer.email == email,
            Customer.id != customer_id,
            Customer.merged_into_customer_id.is_(None),
        )
        .first()
    )
    # Merge (reassigning history across rows), the new response row, the contact
    # update, and the promotion must all commit together — roll back on any failure
    # so a mid-merge error can never leave a half-merged customer.
    try:
        target_customer_id = customer_id
        if existing is not None:
            _merge_customer(db, source_id=customer_id, target=existing)
            target_customer_id = existing.id

        response = LeadCaptureResponse(
            organization_id=organization_id,
            agent_id=agent_id,
            customer_id=target_customer_id,
            session_id=session_id,
            field_values=field_values or None,
            summary=(summary or None),
            consent=bool(consent),
            qualified=True,
        )
        db.add(response)

        # Update the customer's contact details so the People page / inbox show a real
        # email/name (reuses the handoff-capture logic + unique-constraint handling).
        CustomerRepository(db).update_contact(target_customer_id, email=email or None, full_name=name)

        # Promote Visitor -> Lead; never downgrade an existing Customer.
        _promote_to_lead(db, target_customer_id, session_id, page_url=page_url, channel=channel)

        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(response)
    return response


def _merge_customer(db: Session, source_id, target) -> None:
    """Merge the (anonymous) source customer into the identified target: reassign
    conversation history / sessions / lead responses, then mark the source row as
    merged so it disappears from People and stale device tokens resolve to target."""
    from app.models.customer import Customer
    from app.models.chat_history import ChatHistory
    from app.models.session_to_agent import SessionToAgent
    from app.models.rating import Rating

    source = db.query(Customer).filter(Customer.id == source_id).first()
    if not source or source.id == target.id:
        return

    db.query(ChatHistory).filter(ChatHistory.customer_id == source_id).update(
        {ChatHistory.customer_id: target.id}, synchronize_session=False)
    db.query(SessionToAgent).filter(SessionToAgent.customer_id == source_id).update(
        {SessionToAgent.customer_id: target.id}, synchronize_session=False)
    db.query(LeadCaptureResponse).filter(LeadCaptureResponse.customer_id == source_id).update(
        {LeadCaptureResponse.customer_id: target.id}, synchronize_session=False)
    db.query(Rating).filter(Rating.customer_id == source_id).update(
        {Rating.customer_id: target.id}, synchronize_session=False)

    # Carry over a name the target lacks; keep the row for token resolution.
    if not (target.full_name or "").strip() and (source.full_name or "").strip():
        target.full_name = source.full_name
    source.merged_into_customer_id = target.id
    source.is_active = False


def _promote_to_lead(db: Session, customer_id, session_id, page_url: Optional[str] = None,
                     channel: str = "widget") -> None:
    from app.models.customer import Customer, LeadStage
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        return
    if customer.lead_stage == LeadStage.VISITOR:
        customer.lead_stage = LeadStage.LEAD
        customer.lead_qualified_at = datetime.now(timezone.utc)
    # Always keep the capture context fresh (also for repeat captures on a Lead).
    source = dict(customer.lead_source or {})
    source.setdefault("channel", channel)
    source["captured_at"] = datetime.now(timezone.utc).isoformat()
    source["session_id"] = str(session_id) if session_id else None
    if page_url:
        source["page_url"] = page_url[:500]
    customer.lead_source = source


def record_lead_from_response(
    db: Session,
    response,
    organization_id,
    agent_id,
    customer_id,
    session_id,
    page_url: Optional[str] = None,
    channel: str = "widget",
) -> Optional[LeadCaptureResponse]:
    """Persist a lead from a ChatResponse whose request_lead_capture is set.

    Shared by the widget socket handler and external channel processors so
    every channel records leads identically: loads the agent's lead-capture
    config, assembles lead_data from the explicit scalar fields (reliable
    under strict structured outputs) plus any free-form lead_data dict, and
    delegates validation/merge/promotion to record_lead_capture. Returns the
    LeadCaptureResponse (whose customer_id may differ from the input when the
    visitor was merged into an existing customer), or None if nothing was
    recorded. Never raises.
    """
    try:
        if not getattr(response, 'request_lead_capture', False):
            return None
        from app.repositories.agent import AgentRepository
        agent = AgentRepository(db).get_agent(agent_id)
        config = getattr(agent, 'lead_capture_config', None) if agent else None
        if not (config and config.enabled) or has_captured_lead(db, customer_id, agent_id):
            return None

        lead_data = dict(getattr(response, 'lead_data', None) or {})
        for key, attr in (('email', 'lead_email'), ('name', 'lead_name'),
                          ('company', 'lead_company'), ('phone', 'lead_phone')):
            val = getattr(response, attr, None)
            if val and not lead_data.get(key):
                lead_data[key] = val

        return record_lead_capture(
            db, config,
            organization_id=organization_id,
            agent_id=agent_id,
            customer_id=customer_id,
            session_id=session_id,
            lead_data=lead_data,
            summary=getattr(response, 'lead_summary', None),
            consent=getattr(response, 'lead_consent', False),
            page_url=page_url,
            channel=channel,
        )
    except Exception as e:
        # Lead capture must never break the conversation flow.
        logger.error(f"Lead-capture record error: {e}")
        return None

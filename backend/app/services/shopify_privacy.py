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

Shopify's mandatory privacy webhooks: customers/data_request,
customers/redact and shop/redact.

Each request is recorded in shopify_compliance_events, which is both the
proof it was handled and what makes a Shopify retry (same webhook id) a no-op.
The erasure itself is also idempotent — a second pass finds nothing — so a
request without a webhook id is safe to run again.

A shop's conversations are found through its organization. The shop row is
deleted on uninstall, before shop/redact arrives 48 hours later, so the
uninstall is recorded with the organization it belonged to and every request
falls back to that record.

An installed extension that keeps its own records of a store's shoppers
registers a redact hook (register_redact_hook): customers/redact and
shop/redact run every hook in the same transaction as the core erasure. It
registers a data-request hook (register_data_request_hook) too, so a
customers/data_request counts what it holds about that customer.
"""

from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional
from uuid import UUID

from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.channels.app_hooks import load_extensions
from app.core.logger import get_logger
from app.models.session_to_agent import SessionToAgent
from app.models.shopify.agent_shopify_config import AgentShopifyConfig
from app.models.shopify.shopify_compliance_event import ShopifyComplianceEvent
from app.models.shopify.shopify_shop import ShopifyShop
from app.services import customer_erasure
from app.services.customer_erasure import ErasureResult

logger = get_logger(__name__)

TOPIC_APP_UNINSTALLED = "app/uninstalled"
TOPIC_SHOP_DISCONNECTED = "shop/disconnected"
TOPIC_DATA_REQUEST = "customers/data_request"
TOPIC_CUSTOMERS_REDACT = "customers/redact"
TOPIC_SHOP_REDACT = "shop/redact"
REDACT_TOPICS = (TOPIC_CUSTOMERS_REDACT, TOPIC_SHOP_REDACT)
# The events that remember which organization a removed shop belonged to.
OWNERSHIP_TOPICS = (TOPIC_APP_UNINSTALLED, TOPIC_SHOP_DISCONNECTED)

STATUS_RECORDED = "recorded"
STATUS_COMPLETED = "completed"
STATUS_NO_MATCH = "no_match"
STATUS_NO_SHOP = "no_shop"
# A data request needs a person to send the export to the merchant.
STATUS_AWAITING_EXPORT = "awaiting_export"

# The channel widget_chat stamps on a conversation served by an agent wired to
# a Shopify store — the conversations shop/redact is about.
SHOPIFY_CHANNEL = "shopify"


@dataclass
class RedactRequest:
    """The customer a hook acts on: one customer of a store (email and phone as
    Shopify sent them), or, for shop/redact, every shopper of the store when
    both are None. organization_id is None when the store's organization is
    unknown."""
    topic: str
    shop_domain: str
    organization_id: Optional[UUID]
    email: Optional[str] = None
    phone: Optional[str] = None


# Erases an extension's rows for the request, staged on the caller's session
# (never committing), and returns how many it deleted.
RedactHook = Callable[[Session, RedactRequest], int]

# {name: hook}; the name is what the compliance record counts its rows under
_redact_hooks: Dict[str, RedactHook] = {}


def register_redact_hook(name: str, hook: RedactHook) -> None:
    _redact_hooks[name] = hook


# Counts an extension's rows about the request's customer (read only)
DataRequestHook = Callable[[Session, RedactRequest], int]

# {name: hook}; the name is what the data request records its count under
_data_request_hooks: Dict[str, DataRequestHook] = {}


def register_data_request_hook(name: str, hook: DataRequestHook) -> None:
    _data_request_hooks[name] = hook


def reset_redact_hooks() -> None:
    """Forget every registration (tests)."""
    _redact_hooks.clear()
    _data_request_hooks.clear()


def _run_redact_hooks(db: Session, request: RedactRequest) -> ErasureResult:
    """Every registered hook. One that fails fails the request, so Shopify
    retries it: an erasure is never recorded as done with rows left behind."""
    # The extension registers its hooks when its hooks module loads
    load_extensions()
    result = ErasureResult()
    for name, hook in list(_redact_hooks.items()):
        result.add(name, hook(db, request))
    return result


def _held_by_extensions(db: Session, request: RedactRequest) -> Dict[str, int]:
    """What each extension holds about the customer, by hook name; only
    hooks that hold something are listed."""
    load_extensions()
    held = {name: hook(db, request) for name, hook in list(_data_request_hooks.items())}
    return {name: count for name, count in held.items() if count}


@dataclass
class ComplianceOutcome:
    status: str
    result: Dict[str, Any]
    duplicate: bool = False
    # Erased uploads, for the caller to delete from storage now that the
    # database commit has gone through (S3 is not part of the transaction).
    attachment_urls: List[str] = field(default_factory=list)


def remember_shop_owner(db: Session, shop: ShopifyShop, topic: str,
                        webhook_id: Optional[str] = None) -> None:
    """Record which organization a shop belonged to, before the row is deleted.

    Staged on the caller's session so it commits with the deletion; a shop
    that was never linked to an organization has nothing to remember.
    """
    if shop.organization_id is None:
        return
    if webhook_id and _find_by_webhook_id(db, webhook_id):
        return
    db.add(ShopifyComplianceEvent(
        topic=topic,
        shop_domain=shop.shop_domain,
        organization_id=shop.organization_id,
        webhook_id=webhook_id,
        status=STATUS_RECORDED,
    ))


def resolve_shop_organization(db: Session, shop_domain: Optional[str]) -> Optional[UUID]:
    """The organization whose data a shop's requests are about.

    The live shop row wins; once it is gone, the most recent uninstall or
    disconnect record for the domain.
    """
    if not shop_domain:
        return None
    shop = db.query(ShopifyShop).filter(ShopifyShop.shop_domain == shop_domain).first()
    if shop and shop.organization_id:
        return shop.organization_id
    remembered = (
        db.query(ShopifyComplianceEvent)
        .filter(
            ShopifyComplianceEvent.shop_domain == shop_domain,
            ShopifyComplianceEvent.topic.in_(OWNERSHIP_TOPICS),
            ShopifyComplianceEvent.organization_id.isnot(None),
        )
        .order_by(ShopifyComplianceEvent.created_at.desc())
        .first()
    )
    return remembered.organization_id if remembered else None


def handle_customers_redact(db: Session, payload: Dict[str, Any],
                            webhook_id: Optional[str]) -> ComplianceOutcome:
    """Erase one customer of one shop: every record of theirs in the
    organization that shop belongs to."""
    def work(organization_id: UUID):
        customer = payload.get("customer") or {}
        customer_ids = customer_erasure.find_customer_ids(
            db, organization_id, customer.get("email"), customer.get("phone"))
        if not customer_ids:
            return STATUS_NO_MATCH, ErasureResult()
        return STATUS_COMPLETED, customer_erasure.erase_customers(db, customer_ids)

    return _run(db, TOPIC_CUSTOMERS_REDACT, payload, webhook_id,
                subject_ref=(payload.get("customer") or {}).get("id"), work=work)


def handle_shop_redact(db: Session, payload: Dict[str, Any],
                       webhook_id: Optional[str]) -> ComplianceOutcome:
    """Erase what the store's visitors left with us: the storefront
    conversations, and the customers who have no other conversation.

    The organization itself and its other channels are the merchant's
    ChatterMate account, not the store's data, and stay.
    """
    def work(organization_id: UUID):
        shop_domain = payload.get("shop_domain")
        sessions = (
            db.query(SessionToAgent.session_id, SessionToAgent.customer_id)
            .filter(
                SessionToAgent.organization_id == organization_id,
                SessionToAgent.channel == SHOPIFY_CHANNEL,
                # NULL is an agent since deleted: still this org's storefront data.
                or_(SessionToAgent.agent_id.is_(None),
                    SessionToAgent.agent_id.notin_(_agents_serving_other_shops(db, organization_id, shop_domain))),
            )
            .all()
        )
        _delete_shop_row(db, shop_domain)
        if not sessions:
            return STATUS_NO_MATCH, ErasureResult()
        result = customer_erasure.erase_sessions(db, [s.session_id for s in sessions])
        db.flush()
        orphans = customer_erasure.orphaned_customer_ids(db, {s.customer_id for s in sessions})
        result.merge(customer_erasure.erase_customers(db, orphans))
        return STATUS_COMPLETED, result

    return _run(db, TOPIC_SHOP_REDACT, payload, webhook_id,
                subject_ref=payload.get("shop_id"), work=work)


def handle_data_request(db: Session, payload: Dict[str, Any],
                        webhook_id: Optional[str]) -> ComplianceOutcome:
    """Record a request for a customer's data, with which of our customer
    records it covers, so the export can be sent to the merchant.

    Our internal customer ids are stored rather than the email, so the record
    itself holds no personal data and the export can still be produced from it.
    """
    def work(organization_id: UUID):
        customer = payload.get("customer") or {}
        email, phone = customer.get("email"), customer.get("phone")
        customer_ids = customer_erasure.find_customer_ids(db, organization_id, email, phone)
        held = _held_by_extensions(db, RedactRequest(
            topic=TOPIC_DATA_REQUEST, shop_domain=payload.get("shop_domain") or "",
            organization_id=organization_id, email=email, phone=phone))
        found = ErasureResult()  # nothing erased; only what is held is recorded
        if not customer_ids and not held:
            return STATUS_NO_MATCH, found
        if customer_ids:
            found.details["customer_ids"] = sorted(str(cid) for cid in customer_ids)
        if held:
            found.details["held"] = held
        return STATUS_AWAITING_EXPORT, found

    return _run(db, TOPIC_DATA_REQUEST, payload, webhook_id,
                subject_ref=(payload.get("data_request") or {}).get("id")
                or (payload.get("customer") or {}).get("id"),
                work=work)


def _run(db: Session, topic: str, payload: Dict[str, Any], webhook_id: Optional[str],
         subject_ref: Any, work) -> ComplianceOutcome:
    """Answer a retry from its record, otherwise do the work and record it in
    the same transaction — the record exists exactly when the work committed."""
    previous = _find_by_webhook_id(db, webhook_id)
    if previous:
        return ComplianceOutcome(previous.status, previous.result or {}, duplicate=True)

    shop_domain = payload.get("shop_domain")
    organization_id = resolve_shop_organization(db, shop_domain)
    if organization_id is None:
        status, outcome = STATUS_NO_SHOP, ErasureResult()
        if topic == TOPIC_SHOP_REDACT:
            _delete_shop_row(db, shop_domain)
    else:
        status, outcome = work(organization_id)
    if topic in REDACT_TOPICS and shop_domain:
        customer = payload.get("customer") or {}
        erased = _run_redact_hooks(db, RedactRequest(
            topic=topic, shop_domain=shop_domain, organization_id=organization_id,
            email=customer.get("email") if topic == TOPIC_CUSTOMERS_REDACT else None,
            phone=customer.get("phone") if topic == TOPIC_CUSTOMERS_REDACT else None))
        outcome.merge(erased)
        if status == STATUS_NO_MATCH and erased.counts:
            status = STATUS_COMPLETED
    result = outcome.record()

    db.add(ShopifyComplianceEvent(
        topic=topic,
        shop_domain=shop_domain or "",
        organization_id=organization_id,
        webhook_id=webhook_id,
        subject_ref=str(subject_ref) if subject_ref is not None else None,
        status=status,
        result=result,
    ))
    try:
        db.commit()
    except IntegrityError:
        # The same webhook id committed first in a concurrent delivery.
        db.rollback()
        previous = _find_by_webhook_id(db, webhook_id)
        if previous is None:
            raise
        return ComplianceOutcome(previous.status, previous.result or {}, duplicate=True)

    logger.info(f"Shopify {topic} for {shop_domain}: {status} {result}")
    return ComplianceOutcome(status, result, attachment_urls=outcome.attachment_urls)


def _agents_serving_other_shops(db: Session, organization_id: UUID,
                                shop_domain: Optional[str]) -> List[UUID]:
    """Agents wired to another store of the same organization. Sessions carry
    the channel, not the store, so these are how one store's storefront
    conversations are told apart from another's."""
    rows = (
        db.query(AgentShopifyConfig.agent_id)
        .join(ShopifyShop, ShopifyShop.id == AgentShopifyConfig.shop_id)
        .filter(ShopifyShop.organization_id == organization_id, ShopifyShop.shop_domain != shop_domain)
        .all()
    )
    agent_ids = []
    for row in rows:
        try:
            agent_ids.append(UUID(str(row.agent_id)))
        except ValueError:
            logger.warning(f"Agent Shopify config has a malformed agent id: {row.agent_id!r}")
    return agent_ids


def _delete_shop_row(db: Session, shop_domain: Optional[str]) -> None:
    """A shop that was never uninstalled cleanly can still have its row (and
    token, and agent configs) when shop/redact arrives."""
    if not shop_domain:
        return
    shop = db.query(ShopifyShop).filter(ShopifyShop.shop_domain == shop_domain).first()
    if shop is None:
        return
    db.query(AgentShopifyConfig).filter(AgentShopifyConfig.shop_id == str(shop.id)).delete(
        synchronize_session=False)
    db.delete(shop)


def _find_by_webhook_id(db: Session, webhook_id: Optional[str]) -> Optional[ShopifyComplianceEvent]:
    if not webhook_id:
        return None
    return db.query(ShopifyComplianceEvent).filter(
        ShopifyComplianceEvent.webhook_id == webhook_id).first()

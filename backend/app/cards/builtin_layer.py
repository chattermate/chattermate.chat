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

The status cards and email check the widget panel has today, behind the reply
seam (app/services/reply_ui.py, app/services/email_proof.py). Used while no
chat UI layer is installed.
"""

from typing import Any, Dict, Optional

from app.cards.labels import labels_for, pick_language
from app.cards.order_card import order_card, recent_orders_card
from app.cards.ticket_card import ticket_card
from app.cards.turn_cards import TurnCards
from app.core.logger import get_logger
from app.services import email_check
from app.services.reply_ui import (
    EMAIL_CHECK_EVENT, ORDER_EVENT, RECENT_ORDERS_EVENT, TICKET_EVENT, TurnEvents,
)

logger = get_logger(__name__)


def _card(kind: str, data: Dict[str, Any], labels):
    if kind == ORDER_EVENT:
        return order_card(data['order'], labels)
    if kind == RECENT_ORDERS_EVENT:
        return recent_orders_card(data['orders'], labels) if data.get('orders') else None
    if kind == TICKET_EVENT:
        return ticket_card(data['number'], data['status'], labels)
    return None


class BuiltinLayer:
    payload_keys = frozenset({'cards', 'email_check'})

    def reply_extras(self, events: TurnEvents) -> Dict[str, Any]:
        cards = TurnCards(labels_for(pick_language(events.languages)))
        for kind, data in events.all():
            try:
                card = _card(kind, data, cards.labels)
            except Exception as e:
                # One card that can't be drawn loses only itself
                logger.error(f"Status card not drawn for a {kind} event: {e}")
                continue
            if card is not None:
                cards.add(card)
        extras: Dict[str, Any] = {}
        payload = cards.payload()
        if payload:
            extras['cards'] = payload
        if events.of(EMAIL_CHECK_EVENT):
            extras['email_check'] = True
        return extras

    def add_shopify_tools(self, toolkit: Any) -> None:
        toolkit.offer_email_check()


class BuiltinEmailProof:
    def available(self) -> bool:
        return email_check.available()

    def offer(self, session_id: str) -> bool:
        return email_check.offer(session_id)

    def verified_email(self, session_id: Optional[str], customer_id: Optional[str] = None) -> Optional[str]:
        return email_check.verified_email(session_id, customer_id)

    def email_key(self, email: str, org_id: Any) -> str:
        return email_check.email_key(email, org_id)

    def mask(self, email: str) -> str:
        return email_check.mask(email)

    def forget(self, session_id: Optional[str]) -> None:
        email_check.forget(session_id)

    def accept_store_sign_in(self, session: dict, token_data: dict) -> bool:
        from app.api.widget_email_check import accept_store_sign_in
        return accept_store_sign_in(session, token_data)


BUILTIN_LAYER = BuiltinLayer()
BUILTIN_EMAIL_PROOF = BuiltinEmailProof()

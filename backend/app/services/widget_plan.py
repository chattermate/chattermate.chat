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

What a visitor's widget may do on the org's plan. Each is a flag in the plan's
features; community installs get them all (feature_gate.plan_feature_on).

- Starter and up: quick actions, the visitor's own past chats, follow-up chips,
  and the proactive greeting.
- Growth and up: rows for the page the visitor is on, shopping in the chat
  (options, Add to cart, the cart bar), "My orders" after an email check, and
  AI titles for past chats.
- Pro: customers the widget knows (a signed-in Shopify customer, past chats from
  their other browsers after an email check).

A lower plan keeps what the agent saved: it is only not served, and comes back
on upgrade. A plan row that does not name a flag yet counts as having it
(feature_gate.plan_flag_on): only the migration's explicit false turns one off.
"""

from typing import Any, Dict, Iterable

from sqlalchemy.orm import Session

from app.services.feature_gate import plan_flag_on
from app.services.page_suggestions import every_page_labels

QUICK_ACTIONS_FEATURE = "quick_actions"
CONVERSATION_HISTORY_FEATURE = "conversation_history"
FOLLOW_UPS_FEATURE = "follow_ups"
CHAT_INITIATION_FEATURE = "chat_initiation"
PAGE_SUGGESTIONS_FEATURE = "page_suggestions"
SHOP_IN_CHAT_FEATURE = "shop_in_chat"
MY_ORDERS_FEATURE = "my_orders"
CONVERSATION_TITLES_FEATURE = "conversation_titles"
KNOWN_CUSTOMERS_FEATURE = "known_customers"

# Read once per widget connection and kept in the socket session
SESSION_KEY = 'plan_features'
SOCKET_FEATURES = (CONVERSATION_HISTORY_FEATURE, FOLLOW_UPS_FEATURE, SHOP_IN_CHAT_FEATURE,
                   KNOWN_CUSTOMERS_FEATURE)
# Told to the widget page, which hides what the plan leaves out
PAGE_FEATURES = (CONVERSATION_HISTORY_FEATURE, SHOP_IN_CHAT_FEATURE)


def features(db: Session, organization_id: Any, keys: Iterable[str]) -> Dict[str, bool]:
    """{feature: on} for `keys`, from one cached read of the plan. A failed read
    leaves them on: a blip must never change a paying customer's widget."""
    return {key: plan_flag_on(db, organization_id, key) for key in keys}


def session_allows(socket_session: dict, feature: str) -> bool:
    """Whether the plan read at connect allows `feature`. A session without the
    read allows nothing (every connect makes one)."""
    plan = socket_session.get(SESSION_KEY) if isinstance(socket_session, dict) else None
    return isinstance(plan, dict) and plan.get(feature) is True


def visitor_rows(db: Session, agent: Any) -> Dict[str, list]:
    """The agent's quick actions (every-page labels) and greeting messages as its
    plan serves them to visitors."""
    customization = getattr(agent, 'customization', None)
    plan = features(db, agent.organization_id, (QUICK_ACTIONS_FEATURE, CHAT_INITIATION_FEATURE))
    return {
        'quick_actions': every_page_labels(getattr(customization, 'quick_actions', None))
        if plan[QUICK_ACTIONS_FEATURE] else [],
        'chat_initiation_messages': (getattr(customization, 'chat_initiation_messages', None) or [])
        if plan[CHAT_INITIATION_FEATURE] else [],
    }

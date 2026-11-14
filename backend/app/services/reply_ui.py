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

The seam between a reply and the chat UI layer that draws more than its text.

Tools record what happened in a turn as neutral events (an order was looked up,
the visitor was asked to confirm their email). A chat UI layer, when one is
installed, turns them into what the widget shows next to the reply. Without
one, the reply's text is the whole answer, so a tool's own answer must always
say what matters in words.

Nothing here may break a reply: a layer that fails is logged and the reply goes
out as text.
"""

import importlib
from typing import Any, Dict, List, Optional, Protocol, Tuple

from app.core.logger import get_logger

logger = get_logger(__name__)

# What tools record. Each event's data is plain values a layer can rely on.
ORDER_EVENT = 'order'                    # {'order': <the store's order record>}
RECENT_ORDERS_EVENT = 'recent_orders'    # {'orders': [<order summaries>]}
TICKET_EVENT = 'ticket'                  # {'number': 'TKT-12', 'status': 'open'}
EMAIL_CHECK_EVENT = 'email_check'        # {}: the visitor is asked to prove their email

# The module that installs a chat UI layer, when the build has one
LAYER_MODULE = 'app.enterprise.chat_ui'


class TurnEvents:
    """What one turn's tools did, in order. Given to the toolkits for a chat
    that can show more than text (the widget panel), read once the reply is
    ready."""

    def __init__(self, languages: Optional[List[str]] = None) -> None:
        # The visitor's preferred languages, most preferred first (visitor_language.py)
        self.languages: List[str] = list(languages or [])
        self._events: List[Tuple[str, Dict[str, Any]]] = []

    def add(self, kind: str, data: Optional[Dict[str, Any]] = None) -> None:
        self._events.append((kind, dict(data or {})))

    def of(self, kind: str) -> List[Dict[str, Any]]:
        return [data for event_kind, data in self._events if event_kind == kind]

    def all(self) -> List[Tuple[str, Dict[str, Any]]]:
        return list(self._events)

    def reset(self) -> None:
        """Before a retry: the failed attempt's events are not this turn's."""
        self._events = []


class UILayer(Protocol):
    def reply_extras(self, events: TurnEvents) -> Dict[str, Any]:
        """What the widget shows with this reply, by payload key. Stored with the
        reply too, so a reload shows the same."""
        ...

    def add_shopify_tools(self, toolkit: Any) -> None:
        """Tools the layer adds to the Shopify toolkit for a chat it draws."""
        ...


_layer: Optional[UILayer] = None


def install(layer: Optional[UILayer]) -> None:
    global _layer
    _layer = layer


def _active() -> Optional[UILayer]:
    if _layer is not None:
        return _layer
    return _fallback_layer()


def _fallback_layer() -> Optional[UILayer]:
    """Today's status cards and email check, until the chat UI layer ships them."""
    from app.cards.builtin_layer import BUILTIN_LAYER
    return BUILTIN_LAYER


def installed() -> bool:
    """Whether replies can show more than text."""
    return _active() is not None


def reply_extras(events: Optional[TurnEvents]) -> Dict[str, Any]:
    layer = _active()
    if layer is None or events is None:
        return {}
    try:
        return dict(layer.reply_extras(events) or {})
    except Exception as e:
        logger.error(f"Chat UI layer failed on a reply; sending it as text: {e}")
        return {}


def add_shopify_tools(toolkit: Any) -> None:
    layer = _active()
    if layer is None:
        return
    try:
        layer.add_shopify_tools(toolkit)
    except Exception as e:
        logger.error(f"Chat UI layer failed to add its Shopify tools: {e}")


def load() -> bool:
    """Install the build's chat UI layer, if it has one. Whether one was installed."""
    try:
        module = importlib.import_module(LAYER_MODULE)
    except ModuleNotFoundError as e:
        # Only the layer's own absence is quiet; a broken import inside it is not
        if e.name and (e.name == LAYER_MODULE or LAYER_MODULE.startswith(e.name + '.')):
            return False
        logger.error(f"Chat UI layer failed to import: {e}")
        return False
    except Exception as e:
        logger.error(f"Chat UI layer failed to import: {e}")
        return False
    try:
        module.register()
    except Exception as e:
        logger.error(f"Chat UI layer failed to register: {e}")
        return False
    return _layer is not None

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

Toolkits an installed extension adds to the chat agent (a store integration, for
example), with the prompt text that explains them. The extension registers a
factory from its hooks module (app.channels.app_hooks.load_extensions); the
agent asks it for this conversation's toolkits. Without one the agent has only
its own tools.

Nothing here may break a reply: a factory that fails is logged and skipped.
"""

from dataclasses import dataclass
from typing import Any, Callable, List, Optional

from app.channels.app_hooks import load_extensions
from app.core.logger import get_logger

logger = get_logger(__name__)


@dataclass
class ToolContext:
    agent_id: str
    org_id: str
    session_id: str
    channel: str
    # What this turn's tools did, for a chat that shows more than text (reply_ui.py)
    turn_events: Any = None
    # The reply's products show as cards with an add-to-cart button (chat_agent)
    cards_add_to_cart: bool = False


@dataclass
class ExtraToolkit:
    toolkit: Any
    # Prompt text for these tools; CART_PLACES reads where customers add products
    instructions: str = ""
    # Its tools return products the reply shows (the product cache, enrich_shopify_response)
    products: bool = False


ToolkitFactory = Callable[[ToolContext], List[ExtraToolkit]]

_factories: List[ToolkitFactory] = []


def register(factory: ToolkitFactory) -> None:
    if factory not in _factories:
        _factories.append(factory)


def reset() -> None:
    """Forget every registration (tests)."""
    _factories.clear()


def extra_toolkits(ctx: ToolContext) -> List[ExtraToolkit]:
    # The extension registers its factories when its hooks load (once per process)
    load_extensions()
    found: List[ExtraToolkit] = []
    for factory in list(_factories):
        try:
            found.extend(factory(ctx) or [])
        except Exception as e:
            logger.error(f"An agent extension failed to build its toolkits: {e}")
    return found


def cached_products_key(extras: List[ExtraToolkit]) -> Optional[str]:
    """The product cache key a product toolkit filled during this turn, else None."""
    for extra in extras:
        toolkit = extra.toolkit
        if extra.products and getattr(toolkit, 'has_cached_products', False):
            return getattr(toolkit, 'product_cache_key', None)
    return None

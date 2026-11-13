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

The product sheet's options (the redesigned widget):
  product_options {product_id}
answered with product_options_result {product_id, options, variants, complete}.
Only the agent's own shop is asked, so a visitor learns nothing a store page
would not show them.
"""

import asyncio

from app.api.widget_actions import authenticated_session
from app.core.logger import get_logger
from app.core.socketio import sio
from app.database import SessionLocal
from app.services import widget_plan
from app.services.shopify import ShopifyService
from app.services.shopify_product_options import product_options, valid_product_id
from app.services.socket_rate_limit import socket_rate_limit
from app.services.widget_reply import WIDGET_NAMESPACE
from app.tools.shopify_toolkit import shop_for_agent

logger = get_logger(__name__)

NO_CHOICES = {'options': [], 'variants': [], 'complete': False}


def _read_options(agent_id: str, org_id: str, product_id: str) -> dict:
    """Blocking: the shop lookup and the Admin API call. Runs off the event loop."""
    shop = shop_for_agent(agent_id, org_id)
    if shop is None:
        return NO_CHOICES
    with SessionLocal() as db:
        return product_options(ShopifyService(db), shop, product_id)


@sio.on('product_options', namespace=WIDGET_NAMESPACE)
@socket_rate_limit(namespace=WIDGET_NAMESPACE)
async def handle_product_options(sid, data):
    session = await authenticated_session(sid)
    if session is None:
        return
    product_id = valid_product_id(data.get('product_id') if isinstance(data, dict) else None)
    choices = NO_CHOICES
    # The product sheet is shopping in the chat: a Growth plan's (widget_plan.py)
    if product_id and widget_plan.session_allows(session, widget_plan.SHOP_IN_CHAT_FEATURE):
        try:
            choices = await asyncio.to_thread(_read_options, session['agent_id'], session['org_id'], product_id)
        except Exception as e:
            logger.error(f"Reading product options failed: {e}")
    await sio.emit('product_options_result', {'product_id': product_id, **choices}, to=sid, namespace=WIDGET_NAMESPACE)

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

"Suggested for this page" (the redesigned widget's start state):
  page_suggestions {url, title}  ->  suggestions {url, heading, pill, items}
The page is the visitor's own (the host page), so nothing here is a secret; the
answer only ever uses this agent's rules and its org's published FAQs.
"""

import asyncio

from app.api.widget_actions import authenticated_session
from app.core.logger import get_logger
from app.core.socketio import sio
from app.database import SessionLocal
from app.repositories.agent import AgentRepository
from app.repositories.agent_shopify_config_repository import AgentShopifyConfigRepository
from app.services.feature_gate import PAGE_SUGGESTIONS_FEATURE, plan_feature_on
from app.services.page_suggestions import suggestions_for
from app.services.public_rate_limit import allow_request
from app.services.widget_reply import WIDGET_NAMESPACE

logger = get_logger(__name__)

TITLE_MAX = 200
NONE = {'heading': 'popular', 'pill': None, 'items': []}


def _suggestions(agent_id: str, org_id: str, url, title) -> dict:
    """Blocking: the agent, its store setting and the FAQs. Runs off the event loop."""
    with SessionLocal() as db:
        agent = AgentRepository(db).get_agent(agent_id)
        if agent is None or str(agent.organization_id) != str(org_id):
            return NONE
        if not plan_feature_on(db, agent.organization_id, PAGE_SUGGESTIONS_FEATURE):
            return suggestions_for(db, agent.organization_id, agent, url, title, for_page=False)
        shopify = AgentShopifyConfigRepository(db).get_agent_shopify_config(str(agent_id))
        return suggestions_for(db, agent.organization_id, agent, url, title,
                               store=bool(shopify and shopify.enabled))


# Asked at connect and on page changes: its own limit, never the agent's message
# limit (an ask there could cost the visitor their first message)
ASKS_PER_MINUTE = 30


@sio.on('page_suggestions', namespace=WIDGET_NAMESPACE)
async def handle_page_suggestions(sid, data):
    session = await authenticated_session(sid)
    if session is None or not allow_request(f"suggestions:{session.get('session_id')}", ASKS_PER_MINUTE, 60):
        return
    url = data.get('url') if isinstance(data, dict) else None
    title = data.get('title') if isinstance(data, dict) else None
    title = title[:TITLE_MAX] if isinstance(title, str) else None
    try:
        result = await asyncio.to_thread(_suggestions, session['agent_id'], session['org_id'], url, title)
    except Exception as e:
        logger.error(f"Page suggestions failed: {e}")
        result = NONE
    await sio.emit('suggestions', {'url': url[:2000] if isinstance(url, str) else None, **result},
                   to=sid, namespace=WIDGET_NAMESPACE)

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

Socket events for host actions and host context on the widget namespace.

The widget sends:
  actions_available {names, host_origin}  which actions this page supplied code for
  set_context {context}                    unverified page state for the agent
  action_result {call_id, status, result?, error?, confirmed?}
The server sends:
  actions_ready {names}                    what the agent may use on this page
  action_request {call_id, name, label, args, confirm, timeout_s}
"""

from uuid import UUID

from app.agents.host_actions.tools import clean_host_context
from app.core.auth_utils import widget_socket_identity
from app.core.config import settings
from app.core.logger import get_logger
from app.core.socketio import sio
from app.database import close_session, session_off_loop
from app.repositories.journey import AgentContextKeyRepository
from app.services.host_action_runtime import (
    OFFERED_KEY, handle_page_result, page_may_offer_actions, register_page_actions,
)
from app.services.socket_rate_limit import socket_rate_limit
from app.services.widget_reply import WIDGET_NAMESPACE

logger = get_logger(__name__)


async def authenticated_session(sid: str):
    session = await sio.get_session(sid, namespace=WIDGET_NAMESPACE)
    widget_id, org_id, _ = widget_socket_identity(session)
    if not widget_id or not org_id or not session.get('session_id'):
        await sio.emit('error', {'error': 'Authentication failed', 'type': 'auth_error'}, to=sid, namespace=WIDGET_NAMESPACE)
        return None
    return session


def _names(data) -> list:
    names = (data or {}).get('names') if isinstance(data, dict) else None
    if not isinstance(names, list):
        return []
    return [n for n in names if isinstance(n, str)][: settings.ACTION_MAX_PER_AGENT]


@sio.on('actions_available', namespace=WIDGET_NAMESPACE)
@socket_rate_limit(namespace=WIDGET_NAMESPACE)
async def handle_actions_available(sid, data):
    session = await authenticated_session(sid)
    if session is None:
        return
    db = await session_off_loop()
    try:
        host_origin = data.get('host_origin') if isinstance(data, dict) else None
        if page_may_offer_actions(db, session['widget_id'], host_origin if isinstance(host_origin, str) else None):
            offered = register_page_actions(db, session, _names(data))
        else:
            # Not on one of the widget's allowed domains: no actions at all.
            session[OFFERED_KEY] = []
            offered = []
        await sio.save_session(sid, session, namespace=WIDGET_NAMESPACE)
        await sio.emit('actions_ready', {'names': offered}, to=sid, namespace=WIDGET_NAMESPACE)
    except Exception as e:
        logger.error(f"actions_available failed for sid {sid}: {e}")
    finally:
        close_session(db)


@sio.on('set_context', namespace=WIDGET_NAMESPACE)
@socket_rate_limit(namespace=WIDGET_NAMESPACE)
async def handle_set_context(sid, data):
    session = await authenticated_session(sid)
    if session is None:
        return
    session['host_context'] = clean_host_context((data or {}).get('context') if isinstance(data, dict) else None)
    await sio.save_session(sid, session, namespace=WIDGET_NAMESPACE)
    if not session['host_context']:
        return
    db = await session_off_loop()
    try:
        # The editor lists the fields pages send, for {{ctx.*}} and rules.
        AgentContextKeyRepository(db).record(UUID(str(session['agent_id'])), session['host_context'].keys(), 'context')
    except Exception as e:
        logger.error(f"Recording context keys failed for sid {sid}: {e}")
    finally:
        close_session(db)


@sio.on('action_result', namespace=WIDGET_NAMESPACE)
@socket_rate_limit(namespace=WIDGET_NAMESPACE)
async def handle_action_result(sid, data):
    session = await authenticated_session(sid)
    if session is None:
        return
    if not isinstance(data, dict):
        return
    db = await session_off_loop()
    try:
        await handle_page_result(sid, session, data, db)
    except Exception as e:
        logger.error(f"action_result failed for sid {sid}: {e}")
        await sio.emit('error', {
            'error': 'Unable to process your request, please try again later.',
            'type': 'chat_error',
        }, to=sid, namespace=WIDGET_NAMESPACE)
    finally:
        close_session(db)

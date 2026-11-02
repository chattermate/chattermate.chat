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

Socket events for journeys on the widget namespace.

The widget sends:
  journey_sync {url?, event?, action?}   the page, an app event or an action chip's success
  journey_skip / journey_dismiss
  journey_start {key}                    ChatterMate.startJourney(key)
The server answers each with journey_state {view} (view is None: show nothing).
"""

import re

from app.api.widget_actions import authenticated_session
from app.core.logger import get_logger
from app.core.socketio import sio
from app.database import close_session, session_off_loop
from app.services.journey_runtime import JourneyRunner
from app.services.socket_rate_limit import socket_rate_limit
from app.services.widget_journeys import emit_journey_state, sync_journey
from app.services.widget_reply import WIDGET_NAMESPACE

logger = get_logger(__name__)

NAME = re.compile(r"^[a-z][a-z0-9_]{0,63}$")
URL_MAX = 2000


def _name(data, field: str) -> list:
    value = data.get(field) if isinstance(data, dict) else None
    return [value] if isinstance(value, str) and NAME.match(value) else []


@sio.on('journey_sync', namespace=WIDGET_NAMESPACE)
@socket_rate_limit(namespace=WIDGET_NAMESPACE)
async def handle_journey_sync(sid, data):
    session = await authenticated_session(sid)
    if session is None:
        return
    url = data.get('url') if isinstance(data, dict) else None
    if isinstance(url, str) and url.startswith(('http://', 'https://')):
        session['host_url'] = url[:URL_MAX]
        await sio.save_session(sid, session, namespace=WIDGET_NAMESPACE)
    db = await session_off_loop()
    try:
        await sync_journey(sid, session, db, events=_name(data, 'event'), actions=_name(data, 'action'))
    finally:
        close_session(db)


async def _run(sid, method: str, *args) -> None:
    session = await authenticated_session(sid)
    if session is None:
        return
    db = await session_off_loop()
    try:
        runner = JourneyRunner(db, session)
        view = getattr(runner, method)(*args)
        await emit_journey_state(sid, None if method == 'dismiss' else view)
    except Exception as e:
        logger.error(f"journey {method} failed for sid {sid}: {e}")
    finally:
        close_session(db)


@sio.on('journey_skip', namespace=WIDGET_NAMESPACE)
@socket_rate_limit(namespace=WIDGET_NAMESPACE)
async def handle_journey_skip(sid, data=None):
    await _run(sid, 'skip')


@sio.on('journey_dismiss', namespace=WIDGET_NAMESPACE)
@socket_rate_limit(namespace=WIDGET_NAMESPACE)
async def handle_journey_dismiss(sid, data=None):
    await _run(sid, 'dismiss')


@sio.on('journey_start', namespace=WIDGET_NAMESPACE)
@socket_rate_limit(namespace=WIDGET_NAMESPACE)
async def handle_journey_start(sid, data):
    keys = _name(data, 'key')
    if keys:
        await _run(sid, 'start', keys[0])

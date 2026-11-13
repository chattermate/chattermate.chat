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

The visitor's thumbs on an AI reply (the redesigned widget's answer actions):
  message_feedback {message_id, value: 'up' | 'down' | null}
answered with message_feedback_saved {message_id, value}, or an error of type
feedback_error so the widget can put the thumb back. The organization's open
inboxes hear message_feedback {session_id, message_id, value}.
"""

from app.api.widget_actions import authenticated_session
from app.core.logger import get_logger
from app.core.socketio import sio
from app.database import close_session, session_off_loop
from app.services.agent_rooms import emit_to_org_inbox
from app.services.message_feedback import save_visitor_feedback, valid_feedback
from app.services.socket_rate_limit import socket_rate_limit
from app.services.widget_reply import WIDGET_NAMESPACE

logger = get_logger(__name__)

FEEDBACK_ERROR = {'error': "Couldn't save your feedback.", 'type': 'feedback_error'}


@sio.on('message_feedback', namespace=WIDGET_NAMESPACE)
@socket_rate_limit(namespace=WIDGET_NAMESPACE)
async def handle_message_feedback(sid, data):
    session = await authenticated_session(sid)
    if session is None:
        return
    message_id = data.get('message_id') if isinstance(data, dict) else None
    value = data.get('value') if isinstance(data, dict) else None
    if not valid_feedback(message_id, value):
        await sio.emit('error', {**FEEDBACK_ERROR, 'message_id': message_id}, to=sid, namespace=WIDGET_NAMESPACE)
        return
    db = await session_off_loop()
    try:
        saved = save_visitor_feedback(db, session, message_id, value)
    except Exception as e:
        logger.error(f"Saving visitor feedback failed: {e}")
        saved = False
    finally:
        close_session(db)
    if saved:
        await sio.emit('message_feedback_saved', {'message_id': message_id, 'value': value},
                       to=sid, namespace=WIDGET_NAMESPACE)
        # The team's open inboxes mark the reply with the visitor's thumb
        await emit_to_org_inbox('message_feedback', {
            'session_id': str(session['session_id']), 'message_id': message_id, 'value': value,
        }, session['org_id'])
    else:
        await sio.emit('error', {**FEEDBACK_ERROR, 'message_id': message_id}, to=sid, namespace=WIDGET_NAMESPACE)

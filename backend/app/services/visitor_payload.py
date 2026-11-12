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

What a stored message may show the visitor.

A message's `attributes` also hold notes written for the team (the AI's handover
note), workflow state (ids, node ids, errors) and delivery details. The widget
only needs the keys below, so anything sent to the visitor goes through
`visitor_attributes`. Unknown keys are dropped: a new key reaches the widget
only when it is added here on purpose.
"""

import json
import logging
from typing import Any, Mapping, Optional, Union

logger = logging.getLogger(__name__)

# Keys the widget reads from a restored message's attributes (WidgetBuilder.vue,
# useWidgetSocket.ts). The end-chat reason and description are notes for the
# team: a restored message never closes the session, so they are not needed.
VISITOR_ATTRIBUTE_KEYS = frozenset({
    'sources',
    'shopify_output',
    'form_data',
    'prompt_message',
    'confirmation_message',
    'request_rating',
    'end_chat',
    # The redesigned widget (plan phase 2): follow-up choices, the handover
    # card's state and the visitor's thumbs.
    'quick_replies',
    'handover',
    'visitor_feedback',
    # Status cards (order, ticket), shortened for the visitor before they are stored
    'cards',
    # The reply asks the visitor to prove their email (email_check.py)
    'email_check',
})

GENERIC_ERROR = "Something went wrong. Please try again."


AttributesInput = Optional[Union[Mapping[str, Any], str]]


def _as_mapping(attributes: AttributesInput) -> Mapping[str, Any]:
    """Stored attributes are usually a dict; older rows can hold a JSON string."""
    if not attributes:
        return {}
    if isinstance(attributes, Mapping):
        return attributes
    if isinstance(attributes, str):
        try:
            parsed = json.loads(attributes)
        except ValueError:
            logger.warning("Message attributes are not valid JSON; sending none to the visitor")
            return {}
        return parsed if isinstance(parsed, Mapping) else {}
    return {}


def visitor_attributes(attributes: AttributesInput) -> dict:
    """The part of a message's attributes the visitor may see."""
    source = _as_mapping(attributes)
    return {key: value for key, value in source.items() if key in VISITOR_ATTRIBUTE_KEYS}


def visitor_error(error: Optional[str], fallback: str = GENERIC_ERROR) -> str:
    """What the visitor sees when a workflow step fails. The real error can be
    exception text, so it is logged for the team and never sent."""
    if error:
        logger.warning("Workflow error kept from the visitor: %s", error)
    return fallback


def visitor_message(msg: Any) -> dict:
    """A stored message as the widget restores it: its text, kind, time, the
    visitor-safe attributes, who wrote it, and its files (already signed by
    ChatRepository.get_session_history)."""
    payload = {
        'id': msg.id,
        'message': msg.message,
        'message_type': msg.message_type,
        'timestamp': msg.created_at.isoformat() if msg.created_at else None,
        'attributes': visitor_attributes(msg.attributes),
        'user_name': msg.user.full_name if msg.user else None,
        'agent_name': msg.agent.display_name or msg.agent.name if msg.agent else None,
    }
    if msg.attachments:
        payload['attachments'] = [{
            'id': attachment.id,
            'filename': attachment.filename,
            'file_url': attachment.file_url,
            'content_type': attachment.content_type,
            'file_size': attachment.file_size,
        } for attachment in msg.attachments]
    return payload

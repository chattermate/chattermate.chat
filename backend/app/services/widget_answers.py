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

Answer options an agent can turn on for the redesigned widget, kept in
customization_metadata.answers so they need no migration:
- `follow_ups`: up to three follow-up questions under an answer.
"""

from typing import Any, Optional

from app.channels.interactive_limits import WIDGET_FOLLOW_UP_LIMITS, InteractiveLimits
from app.services.widget_ui import REDESIGN, WIDGET_UI_KEY, served_metadata

ANSWERS_KEY = 'answers'
FOLLOW_UPS_KEY = 'follow_ups'


def _served(agent: Any) -> dict:
    customization = getattr(agent, 'customization', None)
    return served_metadata(getattr(customization, 'customization_metadata', None) or {})


def serves_redesign_to_visitors(agent: Any) -> bool:
    """Whether this agent's visitors get the redesigned widget (after the kill switch)."""
    return (_served(agent).get(WIDGET_UI_KEY) or {}).get('version') == REDESIGN


def offers_follow_ups(agent: Any) -> bool:
    """Whether the agent's visitors get the redesign with follow-up chips on."""
    answers = _served(agent).get(ANSWERS_KEY) or {}
    return serves_redesign_to_visitors(agent) and answers.get(FOLLOW_UPS_KEY) is True


def follow_up_limits(offered: bool) -> Optional[InteractiveLimits]:
    """The reply schema's choice limits for a session: None leaves it unchanged."""
    return WIDGET_FOLLOW_UP_LIMITS if offered else None

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

What the widget header may honestly say about who replies. Sent with the
page, on every widget socket connect, and pushed to open widgets when the agent
is switched Online or Offline (agent_rooms.announce_presence).
"""

from app.models.agent import Agent
from app.utils.business_hours import is_within_business_hours

# The widget event carrying a new presence (frontend useWidgetSocket)
PRESENCE_EVENT = 'presence'
_ROOM_PREFIX = 'agent_presence_'


def widget_presence(agent: Agent) -> dict:
    """Offline says so. While the AI answers it answers at 3am too; only a
    human-handled agent needs the business-hours check."""
    if agent.is_offline:
        return {'mode': 'offline', 'available': False}
    return {
        'mode': 'ai' if agent.answers_with_ai else 'human',
        'available': True if agent.answers_with_ai
                     else is_within_business_hours(agent.organization),
    }


def presence_room(agent_id) -> str:
    """Every open widget socket of one agent (joined on connect)."""
    return f"{_ROOM_PREFIX}{agent_id}"


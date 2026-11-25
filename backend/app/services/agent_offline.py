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

The reply a customer gets from an agent switched Offline: once per
conversation, on the website and every channel, so a message never lands in
silence. The team gets the chat itself (chat_notifications.notify_team_chat_waits).
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.models.agent import DEFAULT_OFFLINE_MESSAGE, Agent
from app.repositories.chat import ChatRepository
from app.services.feature_gate import OFFLINE_MESSAGE_FEATURE, plan_flag_on
from app.services.human_routing import notify_customer

# Marks the reply in the thread, so a conversation gets it once
OFFLINE_NOTICE_ATTRIBUTE = "offline_notice"


def offline_message_for(db: Session, agent: Agent) -> str:
    """The agent's own text where its plan allows one, else the default."""
    custom = (agent.offline_message or '').strip()
    if custom and plan_flag_on(db, agent.organization_id, OFFLINE_MESSAGE_FEATURE):
        return custom
    return DEFAULT_OFFLINE_MESSAGE


def should_tell_offline(agent: Optional[Agent], session) -> bool:
    """An Offline agent's chat nobody on the team has picked up yet. Once a
    person holds it, they are the reply."""
    return agent is not None and agent.is_offline and session.user_id is None


async def tell_customer_agent_offline(db: Session, session, agent: Agent) -> bool:
    """Send the offline message unless this conversation already has it.
    Returns whether it was sent."""
    if ChatRepository(db).has_message_flag(str(session.session_id), OFFLINE_NOTICE_ATTRIBUTE):
        return False
    await notify_customer(db, session, offline_message_for(db, agent), channels_only=False,
                          attributes={OFFLINE_NOTICE_ATTRIBUTE: True})
    return True

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

What a messaging-channel customer is told when a teammate joins the chat. The
agent can switch it off (teams who introduce themselves anyway) or, where the
plan allows, word it themselves. The widget shows a person joining in its own
UI, so this only goes out on channels (human_routing.notify_customer).
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.models.agent import DEFAULT_HANDOVER_MESSAGE, Agent
from app.services.feature_gate import HANDOVER_MESSAGE_FEATURE, plan_flag_on
from app.services.human_routing import notify_customer


def handover_message_for(db: Session, agent: Optional[Agent]) -> Optional[str]:
    """The text to send, or None when the agent has the message switched off.
    A chat with no agent gets the default."""
    if agent is None:
        return DEFAULT_HANDOVER_MESSAGE
    if agent.handover_notice_enabled is False:
        return None
    custom = (agent.handover_message or '').strip()
    if custom and plan_flag_on(db, agent.organization_id, HANDOVER_MESSAGE_FEATURE):
        return custom
    return DEFAULT_HANDOVER_MESSAGE


async def tell_customer_teammate_joined(db: Session, session, user_id: str) -> None:
    """Send the handover message in the teammate's name, unless switched off."""
    message = handover_message_for(db, getattr(session, 'agent', None))
    if message:
        await notify_customer(db, session, message, user_id=user_id)

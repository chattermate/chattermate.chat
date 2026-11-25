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
"""

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.repositories.chat import ChatRepository
from app.repositories.organization import OrganizationRepository
from app.services.feature_gate import WORKFLOW_FEATURE, plan_feature_on
from app.services.human_routing import notify_customer
from app.utils.business_hours import is_within_business_hours

try:
    from app.enterprise.services.entitlements import ai_replies_allowed
except ImportError:
    ai_replies_allowed = None

logger = get_logger(__name__)

AI_OFF_NOTICE = "Thanks for your message. Our team will reply here as soon as they can."
AI_OFF_AWAY_NOTICE = "Our team is away right now. They'll reply here when they're back."
AI_OFF_ATTRIBUTE = "ai_off_notice"
FORM_RECEIVED_NOTICE = "Thanks, we've got that."


def plan_allows_ai(db: Session, organization_id: UUID | str, model_type, on_channel: bool = False) -> bool:
    """False only when the plan really says no. Community installs have no
    plans, and a failed lookup must never silence a customer's agent."""
    if ai_replies_allowed is None:
        return True
    try:
        return ai_replies_allowed(db, organization_id, model_type, on_channel=on_channel)
    except Exception as e:
        logger.error(f"AI access check failed for org {organization_id} (allowing): {e}")
        return True


def workflow_may_run(db: Session, organization_id: UUID | str, model_type) -> bool:
    """A workflow needs its own plan flag as well as the AI: its nodes can call
    the model."""
    return (plan_allows_ai(db, organization_id, model_type)
            and plan_feature_on(db, organization_id, WORKFLOW_FEATURE))


def _notice_for(db: Session, organization_id) -> str:
    organization = OrganizationRepository(db).get_organization(organization_id)
    if organization and not is_within_business_hours(organization):
        return AI_OFF_AWAY_NOTICE
    return AI_OFF_NOTICE


async def acknowledge_form(db: Session, session) -> None:
    """A form left open when the plan lost workflows: nothing runs after it, but
    the AI is still on, so the visitor just carries on chatting."""
    await notify_customer(db, session, FORM_RECEIVED_NOTICE, channels_only=False)


async def tell_customer_ai_is_off(db: Session, session) -> Optional[str]:
    """Tell the customer a person will reply, once per conversation. Returns
    the line sent, or None if they already know."""
    if ChatRepository(db).has_message_flag(str(session.session_id), AI_OFF_ATTRIBUTE):
        return None
    notice = _notice_for(db, session.organization_id)
    await notify_customer(db, session, notice, channels_only=False, attributes={AI_OFF_ATTRIBUTE: True})
    return notice

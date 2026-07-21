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

Shared usage-metering helpers for hosted-model features (FAQ generation, AI
ticket investigations). Whether a run counts against the org's message budget,
and how many credits remain, is the same question for every hosted-model
feature — kept here so each feature doesn't reimplement (or drift from) it.

OSS/self-hosted builds have no enterprise module: nothing is metered and
nothing is blocked (fail open).
"""

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.repositories.ai_config import AIConfigRepository

logger = get_logger(__name__)

# Model type whose provider costs land on the platform, hence metered. Own-key
# orgs pay their provider directly and are never metered or blocked.
HOSTED_MODEL_TYPE = "CHATTERMATE"


def is_hosted_model(db: Session, organization_id: UUID) -> bool:
    """True when the org runs on the platform-hosted model, so its LLM usage is
    billable against the message budget."""
    config = AIConfigRepository(db).get_active_config(organization_id)
    if not config:
        return False
    model_type = (
        config.model_type.value if hasattr(config.model_type, "value")
        else str(config.model_type)
    )
    return model_type.upper() == HOSTED_MODEL_TYPE


def remaining_message_credits(db: Session, organization_id: UUID) -> Optional[int]:
    """Message credits left in the current billing period, or None when
    unlimited (no enterprise module, no subscription cap, or the check errored
    — fail open, matching check_message_limit's posture)."""
    try:
        from app.enterprise.services.message_limit import get_remaining_messages
    except ImportError:
        return None
    try:
        return get_remaining_messages(db, organization_id)
    except Exception as e:
        logger.error(f"Remaining-credit check failed for org {organization_id}: {e}")
        return None

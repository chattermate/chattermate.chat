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

In-app action limits: a hard platform cap from settings, plus the plan's
``max_actions`` on cloud (Free is capped; paid plans set no limit).
"""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.services.feature_gate import feature_limit

MAX_ACTIONS_FEATURE = "max_actions"


def action_cap(db: Session, organization_id: UUID) -> int:
    """How many actions one agent may declare in this org."""
    plan_cap = feature_limit(db, organization_id, MAX_ACTIONS_FEATURE)
    if plan_cap is None:
        return settings.ACTION_MAX_PER_AGENT
    return min(plan_cap, settings.ACTION_MAX_PER_AGENT)


def check_action_quota(db: Session, organization_id: UUID, current_count: int) -> None:
    """403 when adding one more action would pass the cap."""
    cap = action_cap(db, organization_id)
    if current_count >= cap:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This agent already has {cap} actions, the most your plan allows. Upgrade to add more.",
        )


def display_cap(db: Session, organization_id: UUID) -> int:
    """The cap to show next to the list. Never raises: an org with no
    accessible subscription can still see its actions, just add none (0)."""
    try:
        return action_cap(db, organization_id)
    except HTTPException:
        return 0

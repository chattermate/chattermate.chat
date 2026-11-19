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

Whether an org may add one more agent: the plan's max_agents on cloud, no
limit on community installs. Creating and duplicating an agent both check it.
"""

from typing import Any, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.agent import AgentRepository

try:
    from app.enterprise.services.feature_access import require_accessible_subscription
    HAS_ENTERPRISE = True
except ImportError:
    HAS_ENTERPRISE = False


def check_agent_quota(db: Session, organization_id: UUID) -> Optional[Any]:
    """403 when one more agent would pass the plan's max_agents. Returns the
    org's accessible subscription (None on community installs); raises like
    require_accessible_subscription when the org has none."""
    if not HAS_ENTERPRISE:
        return None
    # Accessible = active/trial/past-due-in-period OR cancelled-but-still-in-paid-period
    subscription = require_accessible_subscription(db, organization_id)
    max_agents = subscription.plan.max_agents
    if max_agents is not None and AgentRepository(db).count_by_organization(organization_id) + 1 > max_agents:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Cannot create agent: Maximum number of agents ({max_agents}) exceeded for current plan , please upgrade your plan"
        )
    return subscription

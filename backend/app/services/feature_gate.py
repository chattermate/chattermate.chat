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

Generic plan-feature gating.

Cloud (enterprise module installed): a feature is available when the org has
an accessible subscription whose plan carries the feature flag. OSS/community
deployments are always unrestricted. This generalizes the per-feature gates
copied across the API layer (lead_capture, mcp_tool, workflow, ...) — new
features should gate through here instead of minting another copy.
"""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.logger import get_logger

try:
    from app.enterprise.repositories.plan import PlanRepository
    from app.enterprise.services.feature_access import require_accessible_subscription
    HAS_ENTERPRISE = True
except ImportError:
    HAS_ENTERPRISE = False

logger = get_logger(__name__)


def feature_allowed(db: Session, organization_id: UUID, feature: str) -> bool:
    """Non-raising check. Any gating-lookup failure fails CLOSED (feature
    hidden) rather than surfacing a 500 — used by public/unauthenticated
    surfaces and background hooks."""
    if not HAS_ENTERPRISE:
        return True
    try:
        subscription = require_accessible_subscription(db, organization_id)
        return PlanRepository(db).check_feature_availability(str(subscription.plan_id), feature)
    except HTTPException:
        return False
    except Exception as e:
        logger.error(f"Feature gate check '{feature}' failed for org {organization_id}: {e}")
        return False


def check_feature_access(db: Session, organization_id: UUID, feature: str, upgrade_message: str) -> None:
    """Raising check for authenticated admin endpoints: 403 with the feature's
    upgrade message when the plan lacks the flag (subscription-level errors
    propagate from the enterprise module)."""
    if not HAS_ENTERPRISE:
        return
    subscription = require_accessible_subscription(db, organization_id)
    if not PlanRepository(db).check_feature_availability(str(subscription.plan_id), feature):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=upgrade_message)

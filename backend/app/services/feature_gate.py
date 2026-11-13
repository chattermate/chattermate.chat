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

from typing import Optional
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

# Apart from the rest: an enterprise module without it must still gate
# everything above, not fall back to community mode.
try:
    from app.enterprise.services.entitlements import feature_on, snapshot as plan_snapshot
except ImportError:
    feature_on = plan_snapshot = None

logger = get_logger(__name__)

WORKFLOW_FEATURE = "workflow"
MCP_TOOLS_FEATURE = "mcp_tools"
LEAD_CAPTURE_FEATURE = "lead_capture"
CUSTOM_BRANDING_FEATURE = "custom_branding"


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


def _plan_says(db: Session, organization_id: UUID | str, feature: str, otherwise: bool) -> bool:
    """One cached read of the plan, or `otherwise` on community installs and
    when the lookup fails."""
    if feature_on is None:
        return otherwise
    try:
        return feature_on(db, organization_id, feature)
    except Exception as e:
        logger.error(f"Plan check '{feature}' failed for org {organization_id} (using {otherwise}): {e}")
        return otherwise


def plan_feature_on(db: Session, organization_id: UUID | str, feature: str) -> bool:
    """The check for the chat path. Unlike feature_allowed, a failed lookup
    leaves the feature running: a blip must never change how a paying customer's
    agent behaves."""
    return _plan_says(db, organization_id, feature, otherwise=True)


def plan_flag_on(db: Session, organization_id: UUID | str, feature: str, otherwise: bool = True) -> bool:
    """For a flag newer than the plans' own rows: a plan that does not name it yet
    (its enterprise migration has not run) counts as having it, so a deploy never
    takes a paid feature away in between. An org with no plan has nothing.
    Community installs always have it; a failed lookup gives `otherwise`."""
    if plan_snapshot is None:
        return True
    try:
        features = plan_snapshot(db, organization_id)["features"] or {}
    except Exception as e:
        logger.error(f"Plan check '{feature}' failed for org {organization_id} (using {otherwise}): {e}")
        return otherwise
    return features.get(feature, bool(features)) is True


def plan_hides_branding(db: Session, organization_id: UUID | str) -> bool:
    """Only a plan removes the branding, so community installs and a failed
    lookup keep it."""
    return _plan_says(db, organization_id, CUSTOM_BRANDING_FEATURE, otherwise=False)


def check_feature_access(db: Session, organization_id: UUID, feature: str, upgrade_message: str) -> None:
    """Raising check for authenticated admin endpoints: 403 with the feature's
    upgrade message when the plan lacks the flag (subscription-level errors
    propagate from the enterprise module)."""
    if not HAS_ENTERPRISE:
        return
    subscription = require_accessible_subscription(db, organization_id)
    if not PlanRepository(db).check_feature_availability(str(subscription.plan_id), feature):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=upgrade_message)


def feature_limit(db: Session, organization_id: UUID, key: str) -> Optional[int]:
    """A numeric plan limit such as ``max_actions``, or None for no limit.

    None on OSS, and when the plan does not set the key. Raises like
    ``check_feature_access`` when the org has no accessible subscription, so
    admin endpoints report "No active subscription" instead of guessing.
    """
    if not HAS_ENTERPRISE:
        return None
    subscription = require_accessible_subscription(db, organization_id)
    plan = PlanRepository(db).get(subscription.plan_id)
    value = (plan.features or {}).get(key) if plan else None
    return value if isinstance(value, int) and not isinstance(value, bool) else None

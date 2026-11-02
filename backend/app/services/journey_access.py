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

Journeys plan gating: Pro and above on cloud, unrestricted for OSS/self-hosted.
Thin wrappers over the generic feature gate, like help_center_access.
"""

from uuid import UUID

from sqlalchemy.orm import Session

from app.services.feature_gate import check_feature_access, feature_allowed

JOURNEYS_FEATURE = "journeys"

UPGRADE_MESSAGE = (
    "Journeys are not available in your current plan. "
    "Please upgrade to Pro to use them."
)


def journeys_allowed(db: Session, organization_id: UUID) -> bool:
    """Non-raising check for the widget: journeys simply don't run when the
    plan lacks them. Fails closed on gating errors."""
    return feature_allowed(db, organization_id, JOURNEYS_FEATURE)


def check_journeys_access(db: Session, organization_id: UUID) -> None:
    """Raising check for the dashboard's API (403 with the upgrade message)."""
    check_feature_access(db, organization_id, JOURNEYS_FEATURE, UPGRADE_MESSAGE)

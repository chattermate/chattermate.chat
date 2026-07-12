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

Help-center plan gating: Pro-only on cloud, unrestricted for OSS/self-hosted.
Thin wrappers over the generic feature gate.
"""

from uuid import UUID

from sqlalchemy.orm import Session

from app.services.feature_gate import check_feature_access, feature_allowed

HELP_CENTER_FEATURE = "help_center"

UPGRADE_MESSAGE = (
    "The Help Center is not available in your current plan. "
    "Please upgrade to Pro to access this feature."
)


def help_center_allowed(db: Session, organization_id: UUID) -> bool:
    """Non-raising check — used by the public site (which 404s instead of
    403ing) and the auto-generation hook. Fails closed on gating errors."""
    return feature_allowed(db, organization_id, HELP_CENTER_FEATURE)


def check_help_center_access(db: Session, organization_id: UUID) -> None:
    """Raising check for admin endpoints (403 with the upgrade message)."""
    check_feature_access(db, organization_id, HELP_CENTER_FEATURE, UPGRADE_MESSAGE)

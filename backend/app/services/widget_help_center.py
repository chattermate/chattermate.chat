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

The help center link the widget's start state offers visitors.
"""

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.help_center import HelpCenterSettings, SSLStatus
from app.repositories.help_center import HelpCenterRepository
from app.services.help_center_access import help_center_allowed
from app.services.help_center_seo import site_url
from app.services.help_center_settings import slug_url


def help_center_url(db: Session, organization_id: UUID) -> Optional[str]:
    """The org's public help center URL when the site is actually live (enabled,
    has a slug, and the plan still includes it), else None. The same conditions
    the public site uses before it serves a page, so the link never 404s."""
    row = HelpCenterRepository(db).get_by_org(organization_id)
    if not row or not row.enabled or not row.slug:
        return None
    if not help_center_allowed(db, organization_id):
        return None
    return _reachable_url(row)


def _reachable_url(row: HelpCenterSettings) -> str:
    """The public URL, except a custom domain whose certificate isn't issued yet:
    visitors would hit a TLS error there, so they get the help center's own
    address (served in every mode) until it is."""
    if row.domain_verified and row.ssl_status != SSLStatus.ACTIVE:
        return slug_url(row).rstrip("/")
    return site_url(row)

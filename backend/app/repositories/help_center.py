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

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.help_center import HelpCenterQuery, HelpCenterSettings

# Both DNS records verified — the queryable form of the derived
# HelpCenterSettings.domain_verified property.
_DOMAIN_VERIFIED = (
    HelpCenterSettings.txt_record_verified.is_(True)
    & HelpCenterSettings.cname_record_verified.is_(True)
)


class HelpCenterRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_org(self, organization_id: UUID) -> Optional[HelpCenterSettings]:
        return (
            self.db.query(HelpCenterSettings)
            .filter(HelpCenterSettings.organization_id == organization_id)
            .first()
        )

    def get_by_slug(self, slug: str) -> Optional[HelpCenterSettings]:
        return (
            self.db.query(HelpCenterSettings)
            .filter(HelpCenterSettings.slug == slug.lower())
            .first()
        )

    def get_by_verified_domain(self, domain: str) -> Optional[HelpCenterSettings]:
        """Resolve a custom domain — only verified domains ever match, so an
        unverified claim on someone else's hostname can't hijack serving."""
        return (
            self.db.query(HelpCenterSettings)
            .filter(
                HelpCenterSettings.custom_domain == domain.lower(),
                _DOMAIN_VERIFIED,
            )
            .first()
        )

    def list_verified_domains(self) -> List[str]:
        """All verified custom domains, for the host-dispatch cache."""
        rows = (
            self.db.query(HelpCenterSettings.custom_domain)
            .filter(
                HelpCenterSettings.custom_domain.isnot(None),
                _DOMAIN_VERIFIED,
            )
            .all()
        )
        return [row[0] for row in rows]

    def slug_exists(self, slug: str) -> bool:
        return self.db.query(
            self.db.query(HelpCenterSettings)
            .filter(HelpCenterSettings.slug == slug.lower())
            .exists()
        ).scalar()

    def create(self, settings: HelpCenterSettings) -> HelpCenterSettings:
        self.db.add(settings)
        self.db.commit()
        self.db.refresh(settings)
        return settings

    def update(self, settings: HelpCenterSettings) -> HelpCenterSettings:
        self.db.commit()
        self.db.refresh(settings)
        return settings


class HelpCenterQueryRepository:
    def __init__(self, db: Session):
        self.db = db

    def log(self, organization_id: UUID, query: str, answered: bool) -> HelpCenterQuery:
        row = HelpCenterQuery(organization_id=organization_id, query=query, answered=answered)
        self.db.add(row)
        self.db.commit()
        return row

    def count_for_period(self, organization_id: UUID, start: datetime, end: datetime) -> int:
        """Answered asks in a billing period — feeds the hosted-model metering.
        Half-open [start, end) so a boundary instant is never billed twice."""
        return (
            self.db.query(HelpCenterQuery)
            .filter(
                HelpCenterQuery.organization_id == organization_id,
                HelpCenterQuery.answered.is_(True),
                HelpCenterQuery.created_at >= start,
                HelpCenterQuery.created_at < end,
            )
            .count()
        )

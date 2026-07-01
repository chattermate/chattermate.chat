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

from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.organization import Organization
from app.core.logger import get_logger

logger = get_logger(__name__)
from uuid import UUID

class OrganizationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_organization(
        self,
        name: str,
        domain: str,
        timezone: str = 'UTC',
        business_hours: Optional[dict] = None
    ) -> Organization:
        """Create a new organization"""
        try:
            organization = Organization(
                name=name,
                domain=domain,
                timezone=timezone,
                business_hours=business_hours
            )
            self.db.add(organization)
            self.db.flush()  # Get organization.id
            return organization

        except Exception as e:
            logger.error(f"Failed to create organization: {str(e)}")
            self.db.rollback()
            raise

    def get_organization(self, org_id: UUID) -> Optional[Organization]:
        """Get organization by ID"""
        return self.db.query(Organization).filter(
            Organization.id == org_id
        ).first()

    def get_organization_by_domain(self, domain: str) -> Optional[Organization]:
        """Get organization by domain"""
        return self.db.query(Organization).filter(
            Organization.domain == domain
        ).first()

    def get_active_organizations(self) -> List[Organization]:
        """Get all active organizations"""
        return self.db.query(Organization).filter(
            Organization.is_active == True
        ).all()

    def update_organization(
        self,
        org_id: UUID,
        name: Optional[str] = None,
        domain: Optional[str] = None,
        settings: Optional[dict] = None,
        is_active: Optional[bool] = None
    ) -> Optional[Organization]:
        """Update an organization"""
        try:
            organization = self.get_organization(org_id)
            if not organization:
                return None

            if name is not None:
                organization.name = name
            if domain is not None:
                organization.domain = domain
            if settings is not None:
                # Merge new settings with existing
                current_settings = organization.settings or {}
                current_settings.update(settings)
                organization.settings = current_settings
            if is_active is not None:
                organization.is_active = is_active

            self.db.commit()
            self.db.refresh(organization)
            return organization

        except Exception as e:
            logger.error(f"Failed to update organization {org_id}: {str(e)}")
            self.db.rollback()
            raise

    def update_settings(self, org_id: UUID, settings: dict) -> Optional[Organization]:
        """Update organization settings"""
        try:
            organization = self.get_organization(org_id)
            if not organization:
                return None

            # Merge new settings with existing
            current_settings = organization.settings or {}
            current_settings.update(settings)
            organization.settings = current_settings

            self.db.commit()
            self.db.refresh(organization)
            return organization

        except Exception as e:
            logger.error(f"Failed to update settings for org {
                         org_id}: {str(e)}")
            self.db.rollback()
            raise

    def deactivate_organization(self, org_id: UUID) -> bool:
        """Deactivate an organization"""
        try:
            organization = self.get_organization(org_id)
            if not organization:
                return False

            organization.is_active = False
            self.db.commit()
            return True

        except Exception as e:
            logger.error(f"Failed to deactivate org {org_id}: {str(e)}")
            self.db.rollback()
            raise

    def delete_organization(self, org_id: UUID) -> bool:
        """Hard delete an organization (use with caution)"""
        try:
            organization = self.get_organization(org_id)
            if not organization:
                return False

            self.db.delete(organization)
            self.db.commit()
            return True

        except Exception as e:
            logger.error(f"Failed to delete org {org_id}: {str(e)}")
            self.db.rollback()
            raise

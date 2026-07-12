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

from typing import List, Optional
from uuid import UUID

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.faq import FAQ, FAQStatus


class FAQRepository:
    def __init__(self, db: Session):
        self.db = db

    def _org_query(self, organization_id: UUID):
        return self.db.query(FAQ).filter(FAQ.organization_id == organization_id)

    def get_by_id(self, faq_id: UUID, organization_id: UUID) -> Optional[FAQ]:
        """Org-scoped fetch: cross-org ids resolve to None (callers 404)."""
        return self._org_query(organization_id).filter(FAQ.id == faq_id).first()

    def list_for_org(
        self,
        organization_id: UUID,
        status: Optional[FAQStatus] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[List[FAQ], int]:
        """Filtered, paginated list plus the total matching count."""
        query = self._org_query(organization_id)
        if status is not None:
            query = query.filter(FAQ.status == status)
        if category:
            # Exact match: filter values come from get_categories(), and the
            # (organization_id, category) index only serves equality.
            query = query.filter(FAQ.category == category)
        if search:
            pattern = f"%{search}%"
            query = query.filter(or_(FAQ.question.ilike(pattern), FAQ.answer.ilike(pattern)))
        total = query.count()
        items = (
            query.order_by(FAQ.category.asc(), FAQ.sort_order.asc(), FAQ.created_at.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return items, total

    def get_published_for_org(self, organization_id: UUID, search: Optional[str] = None) -> List[FAQ]:
        """Published FAQs for the public help center, in display order."""
        query = self._org_query(organization_id).filter(FAQ.status == FAQStatus.PUBLISHED)
        if search:
            pattern = f"%{search}%"
            query = query.filter(or_(FAQ.question.ilike(pattern), FAQ.answer.ilike(pattern)))
        return query.order_by(FAQ.category.asc(), FAQ.sort_order.asc(), FAQ.created_at.asc()).all()

    def get_categories(self, organization_id: UUID) -> List[str]:
        rows = (
            self._org_query(organization_id)
            .with_entities(FAQ.category)
            .distinct()
            .order_by(FAQ.category.asc())
            .all()
        )
        return [row[0] for row in rows]

    def get_existing_questions(self, organization_id: UUID) -> List[str]:
        """All question strings for the org — the generation dedup baseline."""
        rows = self._org_query(organization_id).with_entities(FAQ.question).all()
        return [row[0] for row in rows]

    def exists_for_org(self, organization_id: UUID) -> bool:
        return self.db.query(
            self._org_query(organization_id).exists()
        ).scalar()

    def create(self, faq: FAQ) -> FAQ:
        self.db.add(faq)
        self.db.commit()
        self.db.refresh(faq)
        return faq

    def bulk_create(self, faqs: List[FAQ]) -> List[FAQ]:
        self.db.add_all(faqs)
        self.db.commit()
        return faqs

    def update(self, faq: FAQ) -> FAQ:
        self.db.commit()
        self.db.refresh(faq)
        return faq

    def delete(self, faq: FAQ) -> None:
        self.db.delete(faq)
        self.db.commit()

    def bulk_set_status(
        self, organization_id: UUID, faq_ids: List[UUID], status: FAQStatus
    ) -> int:
        """Set status on the org's FAQs among faq_ids; returns rows changed."""
        updated = (
            self._org_query(organization_id)
            .filter(FAQ.id.in_(faq_ids))
            .update({FAQ.status: status}, synchronize_session=False)
        )
        self.db.commit()
        return updated

    def count_published(self, organization_id: UUID) -> int:
        return (
            self._org_query(organization_id)
            .filter(FAQ.status == FAQStatus.PUBLISHED)
            .count()
        )

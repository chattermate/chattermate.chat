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

from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.models.faq_generation_job import (
    ACTIVE_FAQ_JOB_STATUSES,
    FAQGenerationJob,
    FAQJobStage,
    FAQJobStatus,
    FAQJobType,
)

logger = get_logger(__name__)


class FAQGenerationJobRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, job: FAQGenerationJob) -> FAQGenerationJob:
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def get_by_id(self, job_id: int) -> Optional[FAQGenerationJob]:
        return self.db.query(FAQGenerationJob).filter(FAQGenerationJob.id == job_id).first()

    def get_by_id_for_org(self, job_id: int, organization_id: UUID) -> Optional[FAQGenerationJob]:
        return (
            self.db.query(FAQGenerationJob)
            .filter(
                FAQGenerationJob.id == job_id,
                FAQGenerationJob.organization_id == organization_id,
            )
            .first()
        )

    def get_pending(self) -> List[FAQGenerationJob]:
        return (
            self.db.query(FAQGenerationJob)
            .filter(FAQGenerationJob.status == FAQJobStatus.PENDING.value)
            .order_by(FAQGenerationJob.created_at.asc())
            .all()
        )

    def get_active_for_org(
        self,
        organization_id: UUID,
        job_type: Optional[FAQJobType] = None,
        knowledge_id: Optional[int] = None,
    ) -> Optional[FAQGenerationJob]:
        """Most recent pending/processing job, optionally narrowed by type and
        source — the enqueue-dedup guard and the UI's polling target."""
        query = self.db.query(FAQGenerationJob).filter(
            FAQGenerationJob.organization_id == organization_id,
            FAQGenerationJob.status.in_(ACTIVE_FAQ_JOB_STATUSES),
        )
        if job_type is not None:
            query = query.filter(FAQGenerationJob.job_type == job_type.value)
        if knowledge_id is not None:
            query = query.filter(FAQGenerationJob.knowledge_id == knowledge_id)
        return query.order_by(FAQGenerationJob.created_at.desc()).first()

    def get_latest_for_org(self, organization_id: UUID) -> Optional[FAQGenerationJob]:
        return (
            self.db.query(FAQGenerationJob)
            .filter(FAQGenerationJob.organization_id == organization_id)
            .order_by(FAQGenerationJob.created_at.desc())
            .first()
        )

    def update_progress(
        self,
        job_id: int,
        stage: Optional[FAQJobStage] = None,
        progress_percentage: Optional[float] = None,
    ) -> bool:
        """Direct assignment: each job has exactly one sequential writer (the
        worker), so no monotonicity guard is needed and retries may legitimately
        move stage/progress backwards."""
        fields = {}
        if stage is not None:
            fields["stage"] = stage.value
        if progress_percentage is not None:
            fields["progress_percentage"] = progress_percentage
        return self._apply(job_id, **fields)

    def mark_processing(self, job_id: int) -> bool:
        return self._apply(job_id, status=FAQJobStatus.PROCESSING.value)

    def mark_completed(self, job_id: int, faqs_created: int) -> bool:
        return self._apply(
            job_id,
            status=FAQJobStatus.COMPLETED.value,
            stage=FAQJobStage.COMPLETED.value,
            progress_percentage=100.0,
            faqs_created=faqs_created,
        )

    def mark_failed(self, job_id: int, error: str) -> bool:
        return self._apply(
            job_id,
            status=FAQJobStatus.FAILED.value,
            error=error[:2000] if error else None,
        )

    def _apply(self, job_id: int, **fields) -> bool:
        job = self.get_by_id(job_id)
        if not job:
            return False
        for key, value in fields.items():
            setattr(job, key, value)
        self.db.commit()
        return True

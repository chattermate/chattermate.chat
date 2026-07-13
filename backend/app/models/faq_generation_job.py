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

import enum

from sqlalchemy import JSON, Boolean, Column, DateTime, Float, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import expression, func

from app.database import Base


class FAQJobType(str, enum.Enum):
    # Generate from every knowledge source in the org (the "Generate" button).
    GENERATE_ALL = "generate_all"
    # Generate from one newly processed source (the auto-generation hook).
    GENERATE_SOURCE = "generate_source"
    # Extract Q&A pairs from an external FAQ page URL (migration).
    IMPORT_URL = "import_url"
    # Crawl an external help-center index and import linked articles as-is
    # (HTML→Markdown, no LLM).
    IMPORT_ARTICLES = "import_articles"
    # Extract Q&A pairs from an uploaded PDF.
    IMPORT_PDF = "import_pdf"


class FAQJobStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class FAQJobStage(str, enum.Enum):
    NOT_STARTED = "not_started"
    ANALYZING_SOURCES = "analyzing_sources"
    EXTRACTING = "extracting"
    DRAFTING = "drafting"
    GROUPING = "grouping"
    COMPLETED = "completed"


# Statuses that count as "still running" for enqueue guards and UI polling —
# derived so a future status defaults to "active" rather than silently
# escaping the duplicate-job guard.
TERMINAL_FAQ_JOB_STATUSES = {FAQJobStatus.COMPLETED, FAQJobStatus.FAILED}
ACTIVE_FAQ_JOB_STATUSES = [s.value for s in FAQJobStatus if s not in TERMINAL_FAQ_JOB_STATUSES]


class FAQGenerationJob(Base):
    """Async FAQ generation/import job, processed by the FAQ worker.

    Mirrors the KnowledgeQueue shape (string status/stage + float progress) so
    the established worker and frontend polling patterns carry over.
    """
    __tablename__ = "faq_generation_jobs"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Nullable: auto-generation jobs may be enqueued without an acting user.
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    job_type = Column(String, nullable=False, default=FAQJobType.GENERATE_ALL)
    # GENERATE_SOURCE: the knowledge source to read. NULL for GENERATE_ALL/
    # IMPORT_URL. SET NULL (not CASCADE) so deleting a source mid-run doesn't
    # yank the job row out from under the worker and the UI's polling.
    knowledge_id = Column(Integer, ForeignKey("knowledge.id", ondelete="SET NULL"), nullable=True, index=True)
    # GENERATE_ALL: optional explicit narrowing to specific knowledge sources
    # (overrides the default skip-already-generated behaviour).
    knowledge_ids = Column(JSON, nullable=True)
    # IMPORT_URL: the external page to extract from. IMPORT_PDF: the stored
    # upload path/URL the worker reads the file from.
    source_url = Column(String, nullable=True)
    # IMPORT_PDF: the original client filename, used for source_label.
    source_file_name = Column(String(255), nullable=True)
    # LLM calls attempted by this job (retries included) — the usage unit for
    # hosted-model metering. `metered` is stamped at enqueue time from the
    # org's AI config so the period sum never depends on later config changes.
    llm_calls = Column(Integer, nullable=False, default=0, server_default="0")
    metered = Column(Boolean, nullable=False, default=True, server_default=expression.true())
    status = Column(String, nullable=False, default=FAQJobStatus.PENDING)
    stage = Column(String, nullable=False, default=FAQJobStage.NOT_STARTED)
    progress_percentage = Column(Float, nullable=False, default=0.0)
    faqs_created = Column(Integer, nullable=False, default=0)
    error = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        # Partial index keeping the worker's poll O(active rows).
        Index(
            "ix_faq_generation_jobs_active",
            "status",
            postgresql_where=(status.in_(ACTIVE_FAQ_JOB_STATUSES)),
        ),
        # NOTE: production also has uq_faq_generation_jobs_one_active — a
        # UNIQUE partial index on (organization_id, job_type,
        # COALESCE(knowledge_id, -1)) WHERE status is active, closing the
        # enqueue check-then-insert race. It lives only in the migration:
        # declaring it here would create it WITHOUT the partial WHERE on
        # sqlite (tests), wrongly blocking re-enqueues after completion.
    )

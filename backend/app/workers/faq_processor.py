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

FAQ generation/import worker. Runs as an independent loop inside the
knowledge_processor container; `python -m app.workers.faq_processor` also
works as a standalone service if it ever needs its own container.
"""

import asyncio

from app.database import SessionLocal
from app.core.config import settings
from app.core.logger import get_logger
from app.models.faq_generation_job import FAQJobType
from app.models.notification import NotificationType
from app.repositories.faq_generation_job import FAQGenerationJobRepository
from app.services.faq_article_import import run_article_import_job
from app.services.faq_generation import run_generation_job
from app.services.faq_import import run_import_job, run_pdf_import_job
from app.services.notifications import notify_user

logger = get_logger(__name__)

POLL_INTERVAL_SECONDS = 60


async def process_faq_job(job_id: int):
    """Run one job to a terminal state, with notifications."""
    with SessionLocal() as db:
        job_repo = FAQGenerationJobRepository(db)
        job = job_repo.get_by_id(job_id)
        if not job:
            logger.error(f"FAQ job {job_id} not found")
            return
        # Captured before the try: after a DB failure + rollback the ORM
        # instance is expired and attribute access could raise or re-query.
        job_type = job.job_type
        is_import = job_type in (
            FAQJobType.IMPORT_URL.value,
            FAQJobType.IMPORT_ARTICLES.value,
            FAQJobType.IMPORT_PDF.value,
        )
        try:
            job_repo.mark_processing(job.id)
            if job_type == FAQJobType.IMPORT_URL.value:
                created = await run_import_job(db, job)
            elif job_type == FAQJobType.IMPORT_ARTICLES.value:
                created = await run_article_import_job(db, job)
            elif job_type == FAQJobType.IMPORT_PDF.value:
                created = await run_pdf_import_job(db, job)
            else:
                created = await run_generation_job(db, job)
            job_repo.mark_completed(job.id, faqs_created=created)
            if created:
                body = f"{created} draft FAQ{'s' if created != 1 else ''} added — review and publish them in Help center."
            elif is_import:
                body = "Nothing new was imported — the pages were unreadable or duplicated existing FAQs."
            else:
                body = "No new FAQs were found — your existing FAQs already cover this content."
            await notify_user(
                db,
                job.user_id,
                NotificationType.FAQ_GENERATED,
                "Imported drafts ready for review" if is_import and created else
                ("Import finished" if is_import else "Draft FAQs ready for review"),
                body,
                metadata={"faq_job_id": job.id},
            )
        except Exception as e:
            logger.error(f"FAQ job {job_id} failed: {e}")
            # A DB-originated failure leaves the session aborted; roll back so
            # mark_failed and the notification can still be persisted.
            try:
                db.rollback()
            except Exception:
                pass
            job_repo.mark_failed(job.id, str(e))
            await notify_user(
                db,
                job.user_id,
                NotificationType.FAQ_GENERATION_FAILED,
                "FAQ import failed" if is_import else "FAQ generation failed",
                str(e),
                metadata={"faq_job_id": job.id},
            )


_reaped_orphans = False


def _reap_orphans_once() -> None:
    """Reap orphaned `processing` jobs the first time the processor runs in
    this process — covers both worker entrypoints (the loop wrapper here and
    run_knowledge_processor's per-iteration call) without reaping every tick."""
    global _reaped_orphans
    if _reaped_orphans:
        return
    _reaped_orphans = True
    reap_orphaned_jobs()


async def run_faq_processor():
    """Single pass: process every pending FAQ job (bounded concurrency)."""
    _reap_orphans_once()
    with SessionLocal() as db:
        pending_ids = [job.id for job in FAQGenerationJobRepository(db).get_pending()]
    if not pending_ids:
        return
    semaphore = asyncio.Semaphore(max(1, settings.MAX_CONCURRENT_FAQ_JOBS))

    async def process_with_semaphore(job_id: int):
        async with semaphore:
            await process_faq_job(job_id)

    await asyncio.gather(*[process_with_semaphore(job_id) for job_id in pending_ids])


def reap_orphaned_jobs() -> None:
    """Fail jobs left in `processing` by a previous crash/kill. Runs once at
    startup: this worker is the only writer of `processing`, so on a fresh boot
    any such row is orphaned — otherwise it hangs the enqueue guard (one active
    job per type) and the UI's active-job polling forever."""
    try:
        with SessionLocal() as db:
            reaped = FAQGenerationJobRepository(db).fail_orphaned_processing(
                "Worker restarted before the job finished — please try again."
            )
        if reaped:
            logger.warning(f"Reaped {reaped} orphaned FAQ job(s) left in 'processing' on startup")
    except Exception as e:
        logger.error(f"FAQ orphan reap failed (non-fatal): {e}")


async def run_faq_processor_loop(poll_interval: int = POLL_INTERVAL_SECONDS):
    """Forever-loop wrapper — run as an independent task next to the knowledge
    loop so a long FAQ job never delays knowledge ingestion. run_faq_processor
    reaps orphans on its first call, so no explicit reap is needed here."""
    while True:
        try:
            await run_faq_processor()
        except Exception as e:
            logger.error(f"Error in FAQ processor loop: {e}")
        await asyncio.sleep(poll_interval)


if __name__ == "__main__":
    logger.info("Starting FAQ processor service")
    asyncio.run(run_faq_processor_loop())

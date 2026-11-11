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

import asyncio
from app.database import SessionLocal
from app.repositories.knowledge_queue import KnowledgeQueueRepository
from app.repositories.knowledge import KnowledgeRepository
from app.knowledge.knowledge_base import KnowledgeManager
from app.knowledge.failure_advice import SourceUnreadable
from app.services import knowledge_vector_links
from app.models.knowledge_queue import QueueStatus, ProcessingStage, STOPPED_AT_TIME_LIMIT
from app.knowledge.page_sink import SourceRemoved
from app.core.logger import get_logger
import os
from app.core.config import settings
from app.core.processor import PROCESSOR_STATUS
from app.knowledge.failure_advice import FAILURE_ADVICE, FailureCause
from datetime import datetime, timedelta, timezone
from app.models.notification import Notification, NotificationType
from app.services.user import send_fcm_notification
from urllib.parse import urlparse, unquote

logger = get_logger(__name__)


def get_user_friendly_filename(source: str, source_type: str) -> str:
    """Extract a user-friendly filename from the source URL or path"""
    try:
        if source_type in ('website', 'sitemap'):
            # For websites/sitemaps, just return the domain
            parsed = urlparse(source)
            return parsed.netloc or source
        
        # For files (PDF, etc.), extract filename from URL or path
        if source.startswith('http'):
            # Parse URL to get the path
            parsed = urlparse(source)
            path = parsed.path
            
            # Extract filename from path
            if path:
                # Get the last part of the path (filename)
                filename = path.split('/')[-1]
                # URL decode the filename to handle encoded characters like %20
                filename = unquote(filename)
                # Remove query parameters if any
                filename = filename.split('?')[0]
                if filename:
                    return filename
            
            # Fallback to domain if no filename found
            return parsed.netloc or source
        else:
            # For local file paths, just get the basename
            return os.path.basename(source)
            
    except Exception as e:
        logger.warning(f"Error extracting filename from {source}: {e}")
        return source


def _sync_vector_agent_links(db, queue_item) -> None:
    """Point the ingested chunks at every agent the source is linked to.

    Ingestion writes ``filters.agent_id`` from the queue row's single optional
    ``agent_id``, so a run queued without one leaves every chunk with an empty
    list. Retrieval matches on that filter, so the source is invisible to the
    agent while the dashboard still shows it as linked — the failure that left
    two production sources unreadable until the links were rebuilt by hand.

    The relational links are the authority, so re-derive from them. Idempotent,
    and non-fatal: the content is already ingested, and losing the run over a
    filter refresh would be worse than the stale filter.
    """
    try:
        knowledge_repo = KnowledgeRepository(db)
        sources = knowledge_repo.get_by_sources(
            queue_item.organization_id, [queue_item.source]
        )
        if not sources:
            return

        # An org can hold more than one knowledge row for the same URL, and they
        # share one set of vector chunks (keyed on the source name). Sync the
        # union of their links once, rather than per row where the last write
        # would drop the other rows' agents.
        agent_ids = sorted({
            agent_id
            for knowledge in sources
            for agent_id in knowledge_vector_links.agent_ids_for(knowledge)
        })
        knowledge_vector_links.sync_agent_ids(db, sources[0], agent_ids)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(
            f"Could not refresh vector agent filters for {queue_item.source} "
            f"(non-fatal, content was ingested): {e}"
        )


async def _notify(db, queue_item, kind: NotificationType, title: str, message: str) -> None:
    """Tell whoever added the source, in the app and by push. Never fatal: the
    source's own status must not depend on it. A source added without a user
    (a Shopify install queues the shop's site) has no one to tell."""
    if not queue_item.user_id:
        logger.info(f"Queue item {queue_item.id} has no user to notify ({kind.value})")
        return
    try:
        notification = Notification(
            user_id=queue_item.user_id,
            type=kind,
            title=title,
            message=message,
            # The column is notification_metadata; the old metadata=
            # kwarg silently shadowed Base.metadata and stored nothing.
            notification_metadata={"queue_id": queue_item.id}
        )
        db.add(notification)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Could not create {kind.value} notification for queue item {queue_item.id}: {e}")
        return
    await send_fcm_notification(queue_item.user_id, notification, db)


async def process_queue_item(queue_item_id: int):
    """Process a single queue item"""
    with SessionLocal() as db:
        queue_item = None
        try:
            queue_repo = KnowledgeQueueRepository(db)
            queue_item = queue_repo.get_by_id(queue_item_id)

            if not queue_item:
                logger.error(f"Queue item {queue_item_id} not found")
                return

            # Get knowledge manager instance
            knowledge = KnowledgeManager(
                org_id=queue_item.organization_id,
                agent_id=queue_item.agent_id
            )

            # Process if status is pending
            if queue_item.status == QueueStatus.PENDING:
                # Update to processing
                queue_item.status = QueueStatus.PROCESSING
                queue_item.processing_stage = ProcessingStage.NOT_STARTED
                queue_item.progress_percentage = 0.0
                db.commit()

                await knowledge.process_knowledge(queue_item)
                # The run wrote its progress through its own sessions
                db.refresh(queue_item)

                _sync_vector_agent_links(db, queue_item)

                await _notify(db, queue_item, NotificationType.KNOWLEDGE_PROCESSED,
                              "Knowledge Processing Complete", _processed_message(queue_item))

                # Auto-draft FAQs from the new source for orgs using the help
                # center. Fully non-fatal — even an import failure of the FAQ
                # stack must not flip an already-successful run to FAILED.
                try:
                    from app.services.faq_generation import maybe_enqueue_auto_faq_job
                    maybe_enqueue_auto_faq_job(db, queue_item)
                except Exception as faq_hook_err:
                    logger.error(f"Auto FAQ hook unavailable (non-fatal): {faq_hook_err}")

            queue_item.status = QueueStatus.COMPLETED
            db.commit()

        except SourceRemoved:
            # Deleted while it was read: the run cleaned up after itself, and
            # nobody wants to hear about a source they just removed.
            db.rollback()
            logger.info(f"Queue item {queue_item_id} stopped: its source was removed")

        except Exception as e:
            unreadable = isinstance(e, SourceUnreadable)
            log = logger.warning if unreadable else logger.error
            log(f"Error processing queue item {queue_item_id}: {str(e)}")
            if queue_item is None:
                raise
            # The session may hold a failed flush: start clean, record the
            # failure first, and only then tell anyone about it.
            db.rollback()
            try:
                queue_item.status = QueueStatus.FAILED
                # Persist the reason so the UI can show why it failed. A run
                # that stored pages before it broke keeps them searchable; it
                # failed partway, which is what reading it again fixes.
                stopped_partway = not unreadable and (queue_item.pages_learned or 0) > 0
                queue_item.error = (
                    FAILURE_ADVICE[FailureCause.INTERRUPTED].format(url=_shown_as(queue_item))
                    if stopped_partway else str(e)
                )
                db.commit()
            except Exception as status_err:
                db.rollback()
                logger.error(f"Could not mark queue item {queue_item_id} failed: {status_err}")
            else:
                await _tell_failed(db, queue_item)

            # The user has been told what to do about their site; only our
            # own failures go on up to be logged as errors
            if not unreadable:
                raise


def _processed_message(queue_item) -> str:
    name = get_user_friendly_filename(queue_item.source, queue_item.source_type)
    if (queue_item.queue_metadata or {}).get(STOPPED_AT_TIME_LIMIT):
        return f"Learned {queue_item.pages_learned} pages from {name} before the time limit"
    return f"Successfully processed {name}"


async def _tell_failed(db, queue_item) -> None:
    user_friendly_name = get_user_friendly_filename(queue_item.source, queue_item.source_type)
    await _notify(db, queue_item, NotificationType.KNOWLEDGE_FAILED,
                  "Knowledge Processing Failed", f"Failed to process {user_friendly_name}: {queue_item.error}")


# A source still 'processing' with no progress for this long was abandoned:
# its worker died partway (out of memory, a restart) and nothing will pick it
# up again, so it would spin in the dashboard for good. Longer than a live
# run can go without progress (websites stop at their time limit; files are
# size-capped and take about a minute), so it never fails one another
# process is still reading.
ABANDONED_AFTER = timedelta(seconds=settings.KB_SOURCE_TIME_LIMIT_SECONDS) + timedelta(minutes=15)


def _shown_as(queue_item) -> str:
    """A website by its address, as every other failure names it; a file by
    its name, not the path it was uploaded to on our server."""
    if queue_item.source_type in ('website', 'sitemap'):
        return queue_item.source
    return get_user_friendly_filename(queue_item.source, queue_item.source_type)


async def fail_abandoned_items() -> None:
    """Fail sources left 'processing' by a worker that died, and tell whoever
    added them."""
    with SessionLocal() as db:
        cutoff = datetime.now(timezone.utc) - ABANDONED_AFTER
        abandoned = KnowledgeQueueRepository(db).get_abandoned(cutoff)
        for item in abandoned:
            item.status = QueueStatus.FAILED
            item.error = FAILURE_ADVICE[FailureCause.INTERRUPTED].format(url=_shown_as(item))
        db.commit()
        for item in abandoned:
            logger.warning(f"Queue item {item.id} was abandoned mid-run; marked failed")
            await _tell_failed(db, item)


async def run_processor():
    """Single run of the processor"""
    try:
        PROCESSOR_STATUS["is_running"] = True
        PROCESSOR_STATUS["error"] = None

        try:
            await fail_abandoned_items()
        except Exception as e:
            # Never at the cost of processing what is pending
            logger.error(f"Could not check for abandoned queue items: {e}")

        # Get pending items with proper connection handling
        with SessionLocal() as db:
            queue_repo = KnowledgeQueueRepository(db)
            pending_items = queue_repo.get_pending()
            # Extract IDs before closing the session
            pending_item_ids = [item.id for item in pending_items] if pending_items else []

        if pending_item_ids:
            # Reduce concurrent processing to 2 to conserve connections on t3.micro
            semaphore = asyncio.Semaphore(2)

            async def process_with_semaphore(item_id):
                async with semaphore:
                    await process_queue_item(item_id)

            # Process items with semaphore control
            await asyncio.gather(*[process_with_semaphore(item_id) for item_id in pending_item_ids])

        PROCESSOR_STATUS["last_run"] = datetime.utcnow().isoformat()

    except Exception as e:
        logger.error(f"Error in knowledge processor: {str(e)}")
        PROCESSOR_STATUS["error"] = str(e)
        raise

    finally:
        PROCESSOR_STATUS["is_running"] = False


# Between runs. A new source waits up to this long before its crawl starts,
# and someone in onboarding is watching it: keep it short. An idle run is one
# small query.
IDLE_POLL_SECONDS = 10


def run_service():
    """Run the knowledge and FAQ loops as a standalone service (what the
    knowledge_processor container runs: python -m app.workers.knowledge_processor)."""
    logger.info("Starting knowledge processor service")

    # Pushes for processed sources go out from this process: without this the
    # first one failed with "The default Firebase app does not exist"
    # (run_knowledge_processor.py did it; this entry point, which prod runs, didn't).
    from app.services.firebase import initialize_firebase
    try:
        initialize_firebase()
    except Exception as e:
        logger.error(f"Firebase unavailable, push notifications are off: {e}")

    async def processor_loop():
        while True:
            try:
                logger.debug("Running knowledge processor")
                await run_processor()
                logger.debug(f"Knowledge processor completed, sleeping for {IDLE_POLL_SECONDS} seconds")
            except Exception as e:
                logger.error(f"Error in knowledge processor loop: {str(e)}")

            await asyncio.sleep(IDLE_POLL_SECONDS)

    async def main():
        """Knowledge and FAQ loops run as independent tasks in this container:
        a long FAQ generation job never delays knowledge ingestion, and an
        import failure of the FAQ stack only disables the FAQ half."""
        tasks = [processor_loop()]
        try:
            from app.workers.faq_processor import run_faq_processor_loop
            tasks.append(run_faq_processor_loop())
        except Exception as e:
            logger.error(f"FAQ processor unavailable, running knowledge only: {e}")
        await asyncio.gather(*tasks)

    asyncio.run(main())


# Main entry point for running as a standalone service
if __name__ == "__main__":
    run_service()

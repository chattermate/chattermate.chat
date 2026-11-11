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

from typing import Any, Dict, Iterator, List, Optional, Tuple
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

from agno.document import Document
from agno.knowledge.agent import AgentKnowledge
from agno.document.reader.website_reader import WebsiteReader
from app.core.logger import get_logger
from app.core.config import settings
from app.models.knowledge_queue import ProcessingStage, QueueStatus
from pydantic import model_validator

from app.knowledge.crawl_scope import DEFAULT_CRAWL_SCOPE
from app.knowledge.deadline import Deadline, SourceTimedOut
from app.knowledge.enhanced_website_reader import (
    EnhancedWebsiteReader,
    BotProtectionError,
    EmptyCrawlError,
    FAILURE_ADVICE,
)
from app.knowledge.failure_advice import FailureCause
from app.knowledge.page_sink import PageSink, SourceLearningHooks, SourceRemoved

# Initialize logger for this module
logger = get_logger(__name__)


class EnhancedWebsiteKnowledgeBase(AgentKnowledge):
    """Enhanced knowledge base for websites with robust content extraction using EnhancedWebsiteReader"""
    
    urls: List[str] = []
    reader: Optional[WebsiteReader] = None

    # Reader parameters - using settings from config
    max_depth: int = settings.KB_MAX_DEPTH
    max_links: int = settings.KB_MAX_LINKS 
    min_content_length: int = settings.KB_MIN_CONTENT_LENGTH
    timeout: int = settings.KB_TIMEOUT
    max_retries: int = settings.KB_MAX_RETRIES
    max_workers: int = settings.KB_MAX_WORKERS
    crawl_scope: str = DEFAULT_CRAWL_SCOPE
    
    # These are not part of the model schema, but added as instance attributes
    _queue_item = None
    _queue_repo = None
    _learning: Optional[SourceLearningHooks] = None
    _deadline = None
    _stopped_at_time_limit = False
    
    @property
    def queue_item(self):
        return self._queue_item
        
    @queue_item.setter
    def queue_item(self, value):
        self._queue_item = value
        
    @property
    def queue_repo(self):
        return self._queue_repo
        
    @queue_repo.setter
    def queue_repo(self, value):
        self._queue_repo = value

    @property
    def learning(self) -> Optional[SourceLearningHooks]:
        """Told as pages land: makes the source searchable after its first."""
        return self._learning

    @learning.setter
    def learning(self, value: Optional[SourceLearningHooks]):
        self._learning = value

    @model_validator(mode="after")
    def set_reader(self) -> "EnhancedWebsiteKnowledgeBase":
        """Set the reader if not provided"""
        if self.reader is None:
            logger.info(f"Initializing default EnhancedWebsiteReader with max_depth={self.max_depth}, max_links={self.max_links}, max_workers={self.max_workers}")
            self.reader = EnhancedWebsiteReader(
                max_depth=self.max_depth,
                max_links=self.max_links,
                min_content_length=self.min_content_length,
                timeout=self.timeout,
                max_retries=self.max_retries,
                max_workers=self.max_workers,
                crawl_scope=self.crawl_scope,
                verify_ssl=False  # Disable SSL verification to handle self-signed/invalid certificates
            )
        else:
            logger.info(f"Using custom reader: {type(self.reader).__name__}")
        return self

    def _process_url(self, url: str) -> List[Document]:
        """Read a single URL and return its documents (used by document_lists)."""
        try:
            logger.info(f"Crawling URL: {url}")
            return self.reader.read(url=url, url_crawled_callback=self._track_crawled_url)
        except Exception as e:
            logger.error(f"Error reading URL {url}: {str(e)}")
            return []

    def _track_crawled_url(self, crawled_url: str) -> None:
        """Record each page the crawler reached on the queue row."""
        if not (self.queue_item and self.queue_repo):
            return
        try:
            self.queue_repo.update_progress(self.queue_item.id, crawled_url=crawled_url)
        except Exception as e:
            logger.error(f"Error tracking crawled URL {crawled_url}: {str(e)}")

    @property
    def document_lists(self) -> Iterator[List[Document]]:
        """Each URL's documents, read in parallel: agno's AgentKnowledge
        interface. load() does not use it; it stores page by page instead."""
        if self.reader is not None:
            total_start_time = time.time()
            logger.info(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Starting to process {len(self.urls)} URLs")
            
            # Process URLs in parallel using ThreadPoolExecutor
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                # Submit all URLs for processing
                future_to_url = {executor.submit(self._process_url, url): url for url in self.urls}
                
                # Process completed futures as they finish
                for future in as_completed(future_to_url):
                    url = future_to_url[future]
                    try:
                        documents = future.result()
                        if documents:
                            yield documents
                    except Exception as e:
                        logger.error(f"Error processing URL {url}: {str(e)}")
                        yield []
            
            total_end_time = time.time()
            total_duration = total_end_time - total_start_time
            logger.info(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Completed processing all {len(self.urls)} URLs (Total time: {total_duration:.2f}s)")

    def _raise_if_nothing_stored(self, stored_documents: int, skipped_existing: int = 0) -> None:
        """Fail the run when it stored nothing.

        A zero-page run used to be marked COMPLETED, which made a broken crawl
        indistinguishable from a healthy source that happens to have no sub-pages —
        the dashboard showed success while the agent had nothing to answer from.
        Raising here is enough: process_queue_item already turns any exception into
        a FAILED queue item with the message shown to the user.

        The count is of documents *stored*, not crawled: a page that crawls fine
        and then fails to embed leaves the vector table empty, and counting it as
        progress reported success for a source with nothing behind it.
        """
        if stored_documents > 0:
            return

        # Bot protection first: it is the specific, actionable cause.
        if getattr(self.reader, '_challenge_blocked', 0) > 0:
            # The shared advice, so every place that reports a failure says the same
            raise BotProtectionError(
                FAILURE_ADVICE[FailureCause.BOT_BLOCKED].format(url=self._source_label())
            )

        # Every URL was already in the vector store, so there was nothing new to
        # crawl. That is a no-op, not a failed read: the content is already there
        # and the caller links this agent to it afterwards. Reporting the crawl
        # errors here blamed the site ("may require JavaScript") for what was
        # really a re-add of a source we had already indexed.
        if skipped_existing > 0 and skipped_existing >= len(self.urls):
            logger.info(
                f"Nothing to crawl: all {skipped_existing} URL(s) are already in the "
                "knowledge base; keeping the existing content."
            )
            return

        raise EmptyCrawlError(self._failure_message())

    @property
    def _out_of_time(self) -> bool:
        return self._deadline is not None and self._deadline.expired

    @property
    def stopped_at_time_limit(self) -> bool:
        """The last load ran out of time and kept the pages it had stored."""
        return self._stopped_at_time_limit

    def _source_label(self) -> str:
        return self.urls[0] if self.urls else 'this source'

    def _failure_message(self) -> str:
        """What to tell the user, based on what the crawl actually hit.

        The reader records a cause per failed page; the most common one is what
        the source as a whole ran into. Only when it recorded nothing do we fall
        back to the old catch-all.
        """
        url = self._source_label()
        cause = None
        if self.reader is not None and hasattr(self.reader, 'dominant_failure_cause'):
            cause = self.reader.dominant_failure_cause()

        advice = FAILURE_ADVICE.get(cause)
        if advice:
            return advice.format(url=url)

        return (
            f"No content could be read from {url}. The page may be empty, require "
            "JavaScript, or be unreachable — check the URL is correct and publicly "
            "accessible."
        )

    def _urls_to_read(self, recreate: bool, skip_existing: bool) -> Tuple[List[str], int]:
        """The URLs to crawl, and how many were skipped as already stored."""
        if recreate or not skip_existing:
            return list(self.urls), 0
        try:
            urls = [url for url in self.urls if not self.vector_db.name_exists(name=url)]
        except Exception as e:
            logger.error(f"Error checking existing URLs: {str(e)}")
            return list(self.urls), 0
        skipped = len(self.urls) - len(urls)
        if skipped:
            logger.info(f"Skipping {skipped} already loaded URLs")
        return urls, skipped

    def _read_into(self, sink: PageSink, url: str) -> None:
        """Crawl one URL, storing each page as it is read.

        A failure before any page is stored is left to the stored-nothing
        check, which says what the crawl hit. After that it goes up: the run
        stopped partway, and its stored pages stay.
        """
        logger.info(f"Crawling URL: {url}")
        try:
            self.reader.read(
                url=url,
                url_crawled_callback=self._track_crawled_url,
                page_callback=sink.store,
            )
        except Exception as e:
            if sink.stored_pages:
                raise
            logger.error(f"Error reading URL {url}: {str(e)}")

    def load(
        self,
        recreate: bool = False,
        upsert: bool = True,
        skip_existing: bool = True,
        filters: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Read the website into the vector db, storing each page as soon as it
        is read (see page_sink). Pages are always upserted: reading a page
        again must replace it, so ``upsert=False`` (agno's signature) is refused.

        Raises SourceRemoved when the source is deleted mid-crawl, and
        SourceTimedOut / the stored-nothing errors when nothing was stored.
        Past the time limit with pages stored, it keeps them and completes.
        """
        if not upsert:
            raise ValueError("Website pages are always upserted: a page read again replaces its old copy")
        total_start_time = time.time()
        self._stopped_at_time_limit = False

        if self.vector_db is None:
            logger.warning("No vector db provided")
            return

        if self.reader is None:
            logger.warning("No reader provided")
            return

        if recreate:
            self.vector_db.drop()
            self.vector_db.create()
        elif not self.vector_db.exists():
            self.vector_db.create()

        logger.info(f"Starting knowledge base loading - {len(self.urls)} URLs")

        self._deadline = Deadline(settings.KB_SOURCE_TIME_LIMIT_SECONDS)
        if hasattr(self.reader, 'deadline'):
            self.reader.deadline = self._deadline

        urls_to_read, skipped_existing = self._urls_to_read(recreate, skip_existing)
        sink = PageSink(self.vector_db, filters or {}, self._deadline, self.learning)

        if self.queue_item and self.queue_repo:
            self.queue_repo.update_progress(
                self.queue_item.id,
                ProcessingStage.CRAWLING,
                progress_percentage=10.0,
                total_items=len(urls_to_read),
                processed_items=0,
                force_stage_update=True
            )

        for url in urls_to_read:
            if self._out_of_time:
                break
            self._read_into(sink, url)

        if sink.removed:
            raise SourceRemoved(f"{self._source_label()} was removed while it was being read")
        if self._out_of_time and not sink.stored_pages:
            raise SourceTimedOut(
                FAILURE_ADVICE[FailureCause.TOO_LONG].format(url=self._source_label())
            )
        self._raise_if_nothing_stored(sink.stored_documents, skipped_existing)
        self._stopped_at_time_limit = self._out_of_time
        if self._stopped_at_time_limit:
            logger.warning(
                f"Time limit reached for {self._source_label()}: keeping the "
                f"{sink.stored_pages} page(s) stored so far"
            )

        # No approximate (HNSW/IVFFlat) index on purpose: every agent search
        # filters by agent_id, and an approximate index applies that filter
        # after picking candidates, so it can return fewer results than asked.
        # Exact search over a knowledge table (a few thousand rows) is fast.

        if self.queue_item and self.queue_repo:
            self.queue_repo.update_status(self.queue_item.id, QueueStatus.COMPLETED)
            logger.info(f"✓ Marked queue item {self.queue_item.id} as completed")

        logger.info(
            f"✓ Stored {sink.stored_pages} page(s), {sink.stored_documents} chunk(s) from "
            f"{len(urls_to_read)} URL(s) in {time.time() - total_start_time:.2f}s"
        )

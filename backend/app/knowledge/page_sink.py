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

Stores a website one page at a time, as the crawler reads it.

A site used to be held in memory and stored when the whole crawl ended, so
someone setting up their agent waited minutes with nothing to try. Each page
is now embedded and stored in its own transaction the moment it is read: it
is searchable straight away, and only one page is held in memory at a time.
"""

from typing import Any, Dict, List, Optional, Protocol

from agno.document import Document

from app.core.logger import get_logger
from app.knowledge.deadline import Deadline

logger = get_logger(__name__)


class SourceRemoved(Exception):
    """The source was deleted while it was being read."""


class SourceLearningHooks(Protocol):
    """What the run tells the rest of the app as pages land."""

    def first_page(self) -> List[str]:
        """The source now has content: make it a source the agent searches.
        Returns the agent ids its pages are filed under from now on."""

    def page_stored(self) -> None:
        """One more page is searchable."""

    def removed(self) -> bool:
        """Whether the source was deleted since its first page."""


class PageSink:
    """Takes each page's chunks from the crawler and stores them.

    Never raises: it runs inside the crawler's loop, which would count an
    exception as a page that failed to load. A page that can't be stored is
    logged and left out, and only stored pages are counted.
    """

    def __init__(
        self,
        vector_db: Any,
        filters: Dict[str, Any],
        deadline: Deadline,
        learning: Optional[SourceLearningHooks] = None,
    ):
        self._vector_db = vector_db
        self._filters = dict(filters)
        self._deadline = deadline
        self._learning = learning
        # The source exists and points at the agent; until then, every stored
        # page asks for it again (a failed attempt must not leave it hidden).
        self._source_ready = False
        self.stored_pages = 0
        self.stored_documents = 0
        self.removed = False

    def store(self, page: List[Document]) -> bool:
        """Embed and store one page's chunks. True when the page is searchable."""
        if not page or self._deadline.expired:
            return False
        if self._source_was_removed():
            self.removed = True
            self._deadline.cancel()  # stops the crawl at its next page
            return False

        embedded = [doc for doc in page if self._embed(doc)]
        if not embedded:
            return False
        try:
            self._vector_db.upsert_page(embedded, self._filters)
        except Exception as e:
            logger.error(f"Could not store page {embedded[0].id}: {e}")
            return False

        self.stored_pages += 1
        self.stored_documents += len(embedded)
        self._tell_learning()
        return True

    def _source_was_removed(self) -> bool:
        if not (self._learning and self._source_ready):
            return False
        try:
            return self._learning.removed()
        except Exception as e:
            # Can't tell: keep reading rather than drop a source still wanted
            logger.error(f"Could not check the source still exists: {e}")
            return False

    def _embed(self, doc: Document) -> bool:
        if doc.embedding is not None:
            return True
        embedder = getattr(self._vector_db, "embedder", None)
        if embedder is None:
            return False
        try:
            doc.embed(embedder=embedder)
        except Exception as e:
            logger.error(f"Could not embed {doc.id}: {e}")
            return False
        return doc.embedding is not None

    def _tell_learning(self) -> None:
        """Non-fatal: the page is stored either way, and the end of the run
        sets the source up again."""
        if not self._learning:
            return
        if not self._source_ready:
            try:
                self._filters = {**self._filters, "agent_id": self._learning.first_page()}
                self._source_ready = True
            except Exception as e:
                logger.error(f"Could not set up the source after its first page: {e}")
        try:
            self._learning.page_stored()
        except Exception as e:
            logger.error(f"Could not count a stored page: {e}")

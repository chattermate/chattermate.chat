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

import pytest
import os
from unittest.mock import MagicMock, patch, call, ANY
from agno.document.base import Document
from app.core.config import settings
from app.knowledge.crawl_scope import DEFAULT_CRAWL_SCOPE
from app.knowledge.deadline import Deadline, SourceTimedOut
from app.knowledge.enhanced_website_kb import EnhancedWebsiteKnowledgeBase
from app.knowledge.failure_advice import FAILURE_ADVICE
from app.knowledge.page_sink import SourceRemoved
from app.models.knowledge_queue import QueueStatus
from app.knowledge.enhanced_website_reader import (
    BotProtectionError,
    EmptyCrawlError,
    EnhancedWebsiteReader,
    FailureCause,
)

# Test Data
TEST_URLS = [
    "https://example.com",
    "https://test.com"
]

def _embedded(content, url):
    """A document as it looks once a real run has embedded it.

    Documents without an embedding are skipped by the vector store, so a fixture
    without one describes a source that stores nothing — which the guard now
    (correctly) fails.
    """
    document = Document(content=content, meta_data={"url": url})
    document.embedding = [0.1, 0.2, 0.3]
    return document


def _page(url, content="Page text"):
    """One page as the reader hands it over: its chunks, already embedded."""
    document = _embedded(content, url)
    document.id = url
    document.name = TEST_URLS[0]
    return [document]


TEST_DOCUMENTS = [
    _embedded("Test content 1", "https://example.com/page1"),
    _embedded("Test content 2", "https://example.com/page2"),
]
TEST_PAGES = [_page("https://example.com/page1"), _page("https://example.com/page2")]


def reads_pages(reader, pages, then=None):
    """Make the mock reader hand `pages` over one at a time, as the real one
    does, then call `then` (to fail or run out of time mid-crawl)."""
    def read(url, url_crawled_callback=None, page_callback=None, **kwargs):
        for page in pages:
            page_callback(page)
        if then:
            then()
        return []
    reader.read.side_effect = read

@pytest.fixture
def mock_vector_db():
    """Create a mock vector database"""
    mock_db = MagicMock()
    mock_db.upsert_available.return_value = True
    mock_db.name_exists.return_value = False
    mock_db.doc_exists.return_value = False
    return mock_db

@pytest.fixture
def mock_reader():
    """Create a mock website reader"""
    mock = MagicMock(spec=EnhancedWebsiteReader)
    mock.read.return_value = TEST_DOCUMENTS
    reads_pages(mock, TEST_PAGES)
    # The real reader declares this as an int defaulting to 0; left as a Mock it
    # is truthy, which would read as "bot protection blocked every page".
    mock._challenge_blocked = 0
    return mock

class TestEnhancedWebsiteKnowledgeBase:
    def test_initialization_with_defaults(self):
        """Test initialization with default values"""
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS)

        # Against settings, not literals: every one of these is configurable per
        # install (KB_MAX_DEPTH and friends), so hardcoding the defaults here
        # fails on any machine whose .env tunes a crawl.
        assert kb.urls == TEST_URLS
        assert isinstance(kb.reader, EnhancedWebsiteReader)
        assert kb.max_depth == settings.KB_MAX_DEPTH
        assert kb.max_links == settings.KB_MAX_LINKS
        assert kb.min_content_length == settings.KB_MIN_CONTENT_LENGTH
        assert kb.timeout == settings.KB_TIMEOUT
        assert kb.max_retries == settings.KB_MAX_RETRIES
        assert kb.max_workers == settings.KB_MAX_WORKERS
        assert kb.crawl_scope == DEFAULT_CRAWL_SCOPE
    
    def test_initialization_with_custom_params(self):
        """Test initialization with custom parameters"""
        kb = EnhancedWebsiteKnowledgeBase(
            urls=TEST_URLS,
            max_depth=5,
            max_links=20,
            min_content_length=200,
            timeout=60,
            max_retries=5,
            max_workers=8
        )
        
        assert kb.urls == TEST_URLS
        assert isinstance(kb.reader, EnhancedWebsiteReader)
        assert kb.max_depth == 5
        assert kb.max_links == 20
        assert kb.min_content_length == 200
        assert kb.timeout == 60
        assert kb.max_retries == 5
        assert kb.max_workers == 8
        
        # Verify reader was initialized with custom params
        assert kb.reader.max_depth == 5
        assert kb.reader.max_links == 20
        assert kb.reader.min_content_length == 200
        assert kb.reader.timeout == 60
        assert kb.reader.max_retries == 5
        assert kb.reader.max_workers == 8
    
    def test_initialization_with_custom_reader(self):
        """Test initialization with a custom reader"""
        custom_reader = EnhancedWebsiteReader(max_depth=4, max_links=15)
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=custom_reader)

        assert kb.reader is custom_reader
        assert kb.reader.max_depth == 4
        assert kb.reader.max_links == 15

    def test_raise_if_nothing_stored(self):
        """A run that stored no pages must raise so the queue item fails.

        Previously only the bot-blocked case raised; an empty crawl for any other
        reason was marked COMPLETED, making a broken source look identical to a
        healthy one with no sub-pages.
        """
        reader = EnhancedWebsiteReader(max_links=5)
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=reader)

        # Anything stored → never raises, whatever happened along the way.
        reader._challenge_blocked = 0
        kb._raise_if_nothing_stored(5)
        reader._challenge_blocked = 3
        kb._raise_if_nothing_stored(2)

        # Zero stored because bot protection blocked every page → the specific,
        # actionable error, which takes precedence.
        reader._challenge_blocked = 3
        with pytest.raises(BotProtectionError):
            kb._raise_if_nothing_stored(0)

        # Zero stored for any other reason → still a failure, not a success.
        reader._challenge_blocked = 0
        with pytest.raises(EmptyCrawlError) as excinfo:
            kb._raise_if_nothing_stored(0)
        # The message names the source so the dashboard error is actionable.
        assert TEST_URLS[0] in str(excinfo.value)

    def test_a_crawled_page_that_never_reached_the_vector_store_is_a_failure(self):
        """Crawled and stored are different numbers.

        chatring.ai crawled one document, failed to embed it, stored nothing,
        and was still marked COMPLETED — the org's vector table was empty while
        the dashboard showed a healthy source. The guard counts what survived
        the upsert, so a batch that stored nothing still fails the run.
        """
        reader = EnhancedWebsiteReader(max_links=5)
        reader._challenge_blocked = 0
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=reader)

        with pytest.raises(EmptyCrawlError):
            kb._raise_if_nothing_stored(0)

    def test_a_run_whose_documents_never_embedded_fails(self, mock_vector_db, mock_reader):
        """Crawling is not storing.

        chatring.ai crawled one document, failed to embed it, stored nothing, and
        was still marked COMPLETED — the org's vector table was empty while the
        dashboard showed a healthy source. A document with no embedding is
        skipped by the vector store, so the run has produced nothing retrievable
        and must fail.
        """
        unembedded = Document(content="crawled but never embedded", meta_data={})
        unembedded.embedding = None
        reads_pages(mock_reader, [[unembedded]])

        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS[:1], reader=mock_reader)
        kb.vector_db = mock_vector_db
        mock_vector_db.embedder = None

        with pytest.raises(EmptyCrawlError):
            kb.load()

    @pytest.mark.parametrize("cause,expected", [
        (FailureCause.DNS, "does not resolve"),
        (FailureCause.TIMEOUT, "did not respond in time"),
        (FailureCause.BOT_BLOCKED, "refused our crawler"),
        (FailureCause.EMPTY_RESPONSE, "returned an empty page"),
        (FailureCause.THIN_CONTENT, "JavaScript"),
        (FailureCause.HTTP_ERROR, "error response"),
        (FailureCause.BLOCKED_HOST, "not allowed to fetch"),
    ])
    def test_the_message_names_the_cause_the_crawl_actually_hit(self, cause, expected):
        """Every distinct cause gets its own advice.

        One string covering "empty, require JavaScript, or be unreachable" was
        undiagnosable for the user and for us; the reader already knew which of
        the three it hit.
        """
        reader = EnhancedWebsiteReader(max_links=5)
        reader._challenge_blocked = 0
        reader._failure_causes = {cause: 2}
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=reader)

        with pytest.raises(EmptyCrawlError) as excinfo:
            kb._raise_if_nothing_stored(0)

        message = str(excinfo.value)
        assert expected in message
        assert TEST_URLS[0] in message

    def test_message_falls_back_when_no_cause_was_recorded(self):
        """An unexplained empty crawl still says something sensible."""
        reader = EnhancedWebsiteReader(max_links=5)
        reader._challenge_blocked = 0
        reader._failure_causes = {}
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=reader)

        with pytest.raises(EmptyCrawlError) as excinfo:
            kb._raise_if_nothing_stored(0)
        assert "No content could be read" in str(excinfo.value)

    def test_nothing_stored_because_everything_was_already_indexed(self):
        """Skipping URLs we already hold is a no-op, not an unreadable source.

        load() drops URLs already in the vector store, so a re-add reaches this
        guard having stored nothing. Raising there failed the whole source and
        blamed the site — "may require JavaScript" — for content already indexed.
        """
        reader = EnhancedWebsiteReader(max_links=5)
        reader._challenge_blocked = 0
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=reader)

        # Every URL skipped as already present → nothing to do, no error.
        kb._raise_if_nothing_stored(0, skipped_existing=len(TEST_URLS))

        # Some URLs were still meant to be read and yielded nothing → real failure.
        with pytest.raises(EmptyCrawlError):
            kb._raise_if_nothing_stored(0, skipped_existing=len(TEST_URLS) - 1)

        # Bot protection keeps precedence over the skip shortcut: its message is
        # the actionable one, and a blocked sitemap must still fail loudly.
        reader._challenge_blocked = 2
        with pytest.raises(BotProtectionError):
            kb._raise_if_nothing_stored(0, skipped_existing=len(TEST_URLS))
    
    def test_document_lists_property(self, mock_reader):
        """agno's interface: each URL's documents."""
        mock_reader.read.side_effect = None
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=mock_reader)

        doc_lists = list(kb.document_lists)

        assert len(doc_lists) == len(TEST_URLS)
        assert all(docs == TEST_DOCUMENTS for docs in doc_lists)
        for url in TEST_URLS:
            mock_reader.read.assert_any_call(url=url, url_crawled_callback=ANY)

    def test_load_without_vector_db(self, mock_reader):
        """Test load method when no vector db is provided"""
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=mock_reader)

        with patch('app.knowledge.enhanced_website_kb.logger') as mock_logger:
            kb.load()
            mock_logger.warning.assert_called_with("No vector db provided")

    def test_each_page_is_stored_as_it_is_read(self, mock_vector_db, mock_reader):
        """Not all at the end: the first page is searchable while the rest are read."""
        stored_while_reading = []

        def read(url, url_crawled_callback=None, page_callback=None, **kwargs):
            for page in TEST_PAGES:
                page_callback(page)
                stored_while_reading.append(mock_vector_db.upsert_page.call_count)
            return []
        mock_reader.read.side_effect = read
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS[:1], reader=mock_reader)
        kb.vector_db = mock_vector_db

        kb.load(filters={"name": TEST_URLS[0]})

        assert stored_while_reading == [1, 2]
        assert [c.args[0] for c in mock_vector_db.upsert_page.call_args_list] == TEST_PAGES
        mock_vector_db.upsert.assert_not_called()
        assert not kb.stopped_at_time_limit

    def test_load_with_recreate(self, mock_vector_db, mock_reader):
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=mock_reader)
        kb.vector_db = mock_vector_db

        kb.load(recreate=True)

        mock_vector_db.drop.assert_called_once()
        mock_vector_db.create.assert_called_once()
        mock_vector_db.name_exists.assert_not_called()
        assert mock_reader.read.call_count == len(TEST_URLS)

    def test_load_with_existing_urls(self, mock_vector_db, mock_reader):
        """Only the URLs not stored yet are crawled."""
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=mock_reader)
        kb.vector_db = mock_vector_db
        mock_vector_db.name_exists.side_effect = lambda name: name == TEST_URLS[0]

        kb.load(recreate=False)

        mock_reader.read.assert_called_once_with(
            url=TEST_URLS[1], url_crawled_callback=ANY, page_callback=ANY
        )

    def test_load_when_every_url_is_already_indexed(self, mock_vector_db, mock_reader):
        """Re-adding a source that is fully indexed must not fail it.

        Nothing is crawled and nothing is stored, which used to surface on the
        queue item as "No content could be read ... may require JavaScript" even
        though the content was sitting in the vector store the whole time.
        """
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=mock_reader)
        kb.vector_db = mock_vector_db
        mock_vector_db.name_exists.return_value = True

        kb.load(recreate=False)

        mock_reader.read.assert_not_called()

    def test_a_partly_stored_source_is_read_again(self, mock_vector_db, mock_reader):
        """skip_existing=False: its last run stopped partway, so its name being
        in the store says nothing about the rest of the site."""
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS[:1], reader=mock_reader)
        kb.vector_db = mock_vector_db
        mock_vector_db.name_exists.return_value = True

        kb.load(skip_existing=False)

        mock_reader.read.assert_called_once()
        assert mock_vector_db.upsert_page.call_count == len(TEST_PAGES)

    def test_pages_cannot_be_read_without_being_stored(self, mock_vector_db, mock_reader):
        """A page read again must replace its old copy: upsert=False is refused."""
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS[:1], reader=mock_reader)
        kb.vector_db = mock_vector_db

        with pytest.raises(ValueError):
            kb.load(upsert=False)

        mock_reader.read.assert_not_called()

    def test_load_never_builds_an_approximate_index(self, mock_vector_db, mock_reader):
        """Agent searches filter by agent_id; an HNSW/IVFFlat index would filter
        after choosing candidates and could return fewer results. Exact search only."""
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=mock_reader)
        kb.vector_db = mock_vector_db

        kb.load()

        mock_vector_db.optimize.assert_not_called()

    def test_a_url_that_fails_before_any_page_is_left_to_the_empty_check(self, mock_vector_db, mock_reader):
        """The stored-nothing check says what the crawl hit; the next URL still runs."""
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=mock_reader)
        kb.vector_db = mock_vector_db
        calls = iter([Exception("Test error"), None])

        def read(url, url_crawled_callback=None, page_callback=None, **kwargs):
            error = next(calls)
            if error:
                raise error
            page_callback(TEST_PAGES[0])
            return []
        mock_reader.read.side_effect = read

        with patch('app.knowledge.enhanced_website_kb.logger') as mock_logger:
            kb.load()

        mock_logger.error.assert_any_call("Error reading URL https://example.com: Test error")
        assert mock_reader.read.call_count == 2
        mock_vector_db.upsert_page.assert_called_once()

    def test_a_crawl_that_breaks_after_storing_pages_fails_and_keeps_them(self, mock_vector_db, mock_reader):
        """It stopped partway: the worker marks it failed, its pages stay."""
        def break_down():
            raise RuntimeError("worker hiccup")
        reads_pages(mock_reader, TEST_PAGES[:1], then=break_down)
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS[:1], reader=mock_reader)
        kb.vector_db = mock_vector_db

        with pytest.raises(RuntimeError, match="worker hiccup"):
            kb.load()

        mock_vector_db.upsert_page.assert_called_once()

    def test_a_source_removed_mid_crawl_stops_it(self, mock_vector_db, mock_reader):
        learning = MagicMock()
        learning.first_page.return_value = []
        learning.removed.side_effect = [True]
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS[:1], reader=mock_reader)
        kb.vector_db = mock_vector_db
        kb.learning = learning

        with pytest.raises(SourceRemoved):
            kb.load()

        # Page 1 made the source; page 2 found it gone and was not stored
        mock_vector_db.upsert_page.assert_called_once()
        assert kb._deadline.expired  # the crawler stops at its next page


class ExpiringDeadline(Deadline):
    def __init__(self):
        super().__init__(3600)


class CountingEmbedder:
    def __init__(self):
        self.calls = 0

    def get_embedding_and_usage(self, text):
        self.calls += 1
        return [0.1, 0.2, 0.3], None


class TestASourceThatRunsOutOfTime:
    """Seen in production: one source ran for three hours until the worker hit
    its memory limit. Past its time limit the crawl stops. What it stored by
    then is kept; with nothing stored, it fails."""

    def test_with_nothing_stored_it_fails_with_advice(self, mock_vector_db, mock_reader):
        deadline = ExpiringDeadline()
        reads_pages(mock_reader, [], then=deadline.cancel)
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS[:1], reader=mock_reader)
        kb.vector_db = mock_vector_db

        with patch('app.knowledge.enhanced_website_kb.Deadline', return_value=deadline), \
             pytest.raises(SourceTimedOut) as raised:
            kb.load()

        assert str(raised.value) == FAILURE_ADVICE[FailureCause.TOO_LONG].format(url=TEST_URLS[0])
        mock_vector_db.upsert_page.assert_not_called()
        assert mock_reader.deadline is deadline  # the crawl stops at the same time

    def test_with_pages_stored_it_keeps_them_and_completes(self, mock_vector_db, mock_reader):
        deadline = ExpiringDeadline()
        reads_pages(mock_reader, TEST_PAGES, then=deadline.cancel)
        queue_repo = MagicMock()
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS[:1], reader=mock_reader)
        kb.vector_db = mock_vector_db
        kb.queue_item = MagicMock(id=7)
        kb.queue_repo = queue_repo

        with patch('app.knowledge.enhanced_website_kb.Deadline', return_value=deadline):
            kb.load()

        assert kb.stopped_at_time_limit
        assert mock_vector_db.upsert_page.call_count == len(TEST_PAGES)
        queue_repo.update_status.assert_called_once_with(7, QueueStatus.COMPLETED)

    def test_pages_read_after_the_limit_are_not_embedded(self, mock_vector_db, mock_reader):
        deadline = ExpiringDeadline()
        embedder = CountingEmbedder()
        mock_vector_db.embedder = embedder
        late = Document(content="read after the limit", meta_data={})

        def read(url, url_crawled_callback=None, page_callback=None, **kwargs):
            deadline.cancel()
            page_callback([late])
            return []
        mock_reader.read.side_effect = read
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS[:1], reader=mock_reader)
        kb.vector_db = mock_vector_db

        with patch('app.knowledge.enhanced_website_kb.Deadline', return_value=deadline), \
             pytest.raises(SourceTimedOut):
            kb.load()

        assert embedder.calls == 0

    def test_a_source_read_in_time_is_stored(self, mock_vector_db, mock_reader):
        mock_vector_db.embedder = CountingEmbedder()
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS[:1], reader=mock_reader)
        kb.vector_db = mock_vector_db

        kb.load()

        assert mock_vector_db.upsert_page.call_count == len(TEST_PAGES)
        assert isinstance(mock_reader.deadline, Deadline)
        assert not kb.stopped_at_time_limit

    def test_the_limit_comes_from_settings(self, mock_vector_db, mock_reader):
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS[:1], reader=mock_reader)
        kb.vector_db = mock_vector_db
        with patch('app.knowledge.enhanced_website_kb.Deadline', wraps=Deadline) as made:
            kb.load()
        made.assert_called_once_with(settings.KB_SOURCE_TIME_LIMIT_SECONDS)

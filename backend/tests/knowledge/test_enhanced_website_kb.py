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
from app.knowledge.enhanced_website_kb import EnhancedWebsiteKnowledgeBase
from app.knowledge.enhanced_website_reader import (
    BotProtectionError,
    EmptyCrawlError,
    EnhancedWebsiteReader,
)

# Test Data
TEST_URLS = [
    "https://example.com",
    "https://test.com"
]

TEST_DOCUMENTS = [
    Document(content="Test content 1", meta_data={"url": "https://example.com/page1"}),
    Document(content="Test content 2", meta_data={"url": "https://example.com/page2"})
]

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
        """Test the document_lists property"""
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=mock_reader)
        
        # Convert iterator to list to verify contents
        doc_lists = list(kb.document_lists)
        
        assert len(doc_lists) == len(TEST_URLS)
        assert all(docs == TEST_DOCUMENTS for docs in doc_lists)
        assert mock_reader.read.call_count == len(TEST_URLS)
        
        # Verify read was called with correct URLs and new callback args
        for url in TEST_URLS:
            mock_reader.read.assert_any_call(
                url=url,
                vector_db_callback=ANY,
                url_crawled_callback=ANY
            )
    
    def test_load_without_vector_db(self, mock_reader):
        """Test load method when no vector db is provided"""
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=mock_reader)
        
        with patch('app.knowledge.enhanced_website_kb.logger') as mock_logger:
            kb.load()
            mock_logger.warning.assert_called_with("No vector db provided")
    
    def test_load_with_recreate(self, mock_vector_db, mock_reader):
        """Test load method with recreate=True"""
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=mock_reader)
        kb.vector_db = mock_vector_db
        
        # Set up mock reader to return different documents for each URL
        doc1 = Document(content="Test content 1", meta_data={"url": "https://example.com/page1"})
        doc2 = Document(content="Test content 2", meta_data={"url": "https://test.com/page1"})
        mock_reader.read.side_effect = [[doc1], [doc2]]
        
        kb.load(recreate=True)
        
        # Verify vector db operations
        mock_vector_db.drop.assert_called_once()
        mock_vector_db.create.assert_called_once()
        
        # Verify reader operations
        assert mock_reader.read.call_count == len(TEST_URLS)
        mock_reader.read.assert_has_calls([
            call(url=TEST_URLS[0], vector_db_callback=ANY, url_crawled_callback=ANY),
            call(url=TEST_URLS[1], vector_db_callback=ANY, url_crawled_callback=ANY)
        ], any_order=True)
        
        # Verify batch upsert was called with combined documents
        mock_vector_db.upsert.assert_called_once()
        # Get the actual documents passed to upsert
        actual_docs = mock_vector_db.upsert.call_args[1]['documents']
        assert len(actual_docs) == 2
        assert doc1 in actual_docs
        assert doc2 in actual_docs

    def test_load_with_existing_urls(self, mock_vector_db, mock_reader):
        """Test load method with existing URLs in vector db"""
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=mock_reader)
        kb.vector_db = mock_vector_db
        
        # Simulate first URL already exists
        mock_vector_db.name_exists.side_effect = lambda name: name == TEST_URLS[0]
        
        kb.load(recreate=False)
        
        # Should only process second URL
        assert mock_reader.read.call_count == 1
        mock_reader.read.assert_called_once_with(
            url=TEST_URLS[1],
            vector_db_callback=ANY,
            url_crawled_callback=ANY
        )
        
        # Verify upsert was called once with the documents
        mock_vector_db.upsert.assert_called_once()

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

    def test_load_with_existing_documents(self, mock_vector_db, mock_reader):
        """Test load method with existing documents"""
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=mock_reader)
        kb.vector_db = mock_vector_db
        
        # Simulate first document already exists
        mock_vector_db.doc_exists.side_effect = lambda doc: doc == TEST_DOCUMENTS[0]
        
        kb.load(recreate=False)
        
        # Verify that batch upsert is used with all documents
        mock_vector_db.upsert.assert_called_once()
        # Extract the documents passed to upsert
        actual_docs = mock_vector_db.upsert.call_args[1]['documents']
        assert len(actual_docs) >= 1  # We should have at least one document
    
    def test_load_without_upsert(self, mock_vector_db, mock_reader):
        """Test load method when upsert is not available"""
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=mock_reader)
        kb.vector_db = mock_vector_db
        
        # Simulate upsert not available
        mock_vector_db.upsert_available.return_value = False
        
        kb.load(upsert=False)
        
        # Verify reader was called
        assert mock_reader.read.call_count > 0
        
        # When upsert is False, no upsert should be called
        mock_vector_db.upsert.assert_not_called()
    
    def test_load_with_optimization(self, mock_vector_db, mock_reader):
        """Test load method with optimization"""
        kb = EnhancedWebsiteKnowledgeBase(
            urls=TEST_URLS,
            reader=mock_reader,
            optimize_on=1  # Set low threshold to trigger optimization
        )
        kb.vector_db = mock_vector_db
        
        kb.load()
        
        # Should call optimize after inserting documents
        mock_vector_db.optimize.assert_called_once()
    
    def test_load_with_error_handling(self, mock_vector_db, mock_reader):
        """Test load method error handling"""
        kb = EnhancedWebsiteKnowledgeBase(urls=TEST_URLS, reader=mock_reader)
        kb.vector_db = mock_vector_db
        
        # Simulate error for first URL
        mock_reader.read.side_effect = [Exception("Test error"), TEST_DOCUMENTS]
        
        # Disable embedding for this test to avoid extra error logging
        mock_vector_db.embedder = None
        
        with patch('app.knowledge.enhanced_website_kb.logger') as mock_logger:
            kb.load()
            
            # Should log error and continue with second URL
            # Only check for the specific error we're expecting
            mock_logger.error.assert_any_call("Error reading URL https://example.com: Test error")
            
            # Should have still processed the second URL
            assert mock_reader.read.call_count == 2
            
            # Should still have called upsert with the successful documents
            mock_vector_db.upsert.assert_called_once() 
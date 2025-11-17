"""
ChatterMate - Test Enhanced PDF URL Knowledge Base
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
"""

import pytest
from unittest.mock import MagicMock, patch, PropertyMock
from agno.document.base import Document
from app.knowledge.enhanced_pdf_url_kb import EnhancedPDFUrlKnowledgeBase

# Test Data
TEST_URLS = [
    "https://example.com/document1.pdf",
    "https://example.com/document2.pdf"
]

TEST_DOCUMENTS = [
    Document(content="Test PDF content 1", meta_data={"url": "https://example.com/document1.pdf", "page": 1}),
    Document(content="Test PDF content 2", meta_data={"url": "https://example.com/document1.pdf", "page": 2})
]

TEST_FILTERS = {"agent_id": "123", "organization_id": "org-456"}


@pytest.fixture
def mock_vector_db():
    """Create a mock vector database"""
    mock_db = MagicMock()
    mock_db.exists.return_value = True
    mock_db.embedder = MagicMock()
    mock_db.upsert = MagicMock()
    return mock_db


@pytest.fixture
def mock_embedder():
    """Create a mock embedder"""
    mock = MagicMock()
    mock.embed = MagicMock()
    return mock


class TestEnhancedPDFUrlKnowledgeBase:
    """Test suite for EnhancedPDFUrlKnowledgeBase"""

    def test_initialization_with_urls(self):
        """Test initialization with URLs"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=TEST_URLS)

        assert kb.urls == TEST_URLS
        assert isinstance(kb, EnhancedPDFUrlKnowledgeBase)

    def test_initialization_without_urls(self):
        """Test initialization without URLs"""
        kb = EnhancedPDFUrlKnowledgeBase()

        assert kb.urls is None or kb.urls == []

    def test_load_without_vector_db(self):
        """Test load method when no vector db is provided"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=TEST_URLS)

        with patch('app.knowledge.enhanced_pdf_url_kb.logger') as mock_logger:
            kb.load()
            mock_logger.warning.assert_called_with("No vector db provided")

    def test_load_without_urls(self, mock_vector_db):
        """Test load method when no URLs are provided"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=[])
        kb.vector_db = mock_vector_db

        with patch('app.knowledge.enhanced_pdf_url_kb.logger') as mock_logger:
            kb.load()
            mock_logger.warning.assert_called_with("No URLs provided")

    def test_load_with_recreate_true(self, mock_vector_db):
        """Test load method with recreate=True"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=TEST_URLS)
        kb.vector_db = mock_vector_db

        # Mock the document_lists property to return test documents
        with patch.object(type(kb), 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = iter([TEST_DOCUMENTS])
            kb.load(recreate=True)

            # Verify vector db was dropped and recreated
            mock_vector_db.drop.assert_called_once()
            mock_vector_db.create.assert_called_once()

    def test_load_with_recreate_false_and_db_not_exists(self, mock_vector_db):
        """Test load method with recreate=False when database doesn't exist"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=TEST_URLS)
        kb.vector_db = mock_vector_db
        mock_vector_db.exists.return_value = False

        with patch.object(type(kb), 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = iter([TEST_DOCUMENTS])
            kb.load(recreate=False)

            # Verify vector db was created but not dropped
            mock_vector_db.drop.assert_not_called()
            mock_vector_db.create.assert_called_once()

    def test_load_with_recreate_false_and_db_exists(self, mock_vector_db):
        """Test load method with recreate=False when database exists"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=TEST_URLS)
        kb.vector_db = mock_vector_db
        mock_vector_db.exists.return_value = True

        with patch.object(type(kb), 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = iter([TEST_DOCUMENTS])
            kb.load(recreate=False)

            # Verify vector db was not dropped or created
            mock_vector_db.drop.assert_not_called()
            mock_vector_db.create.assert_not_called()

    def test_load_with_filters(self, mock_vector_db):
        """Test load method with metadata filters"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=TEST_URLS)
        kb.vector_db = mock_vector_db

        with patch.object(type(kb), 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = iter([TEST_DOCUMENTS])
            kb.load(filters=TEST_FILTERS)

            # Verify upsert was called with filters
            mock_vector_db.upsert.assert_called_once()
            call_kwargs = mock_vector_db.upsert.call_args[1]
            assert call_kwargs['filters'] == TEST_FILTERS
            assert call_kwargs['documents'] == TEST_DOCUMENTS

    def test_load_with_embedding(self, mock_vector_db, mock_embedder):
        """Test load method with document embedding"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=TEST_URLS)
        kb.vector_db = mock_vector_db
        mock_vector_db.embedder = mock_embedder

        # Create documents without embeddings
        doc1 = Document(content="Test PDF content 1", meta_data={"url": "https://example.com/document1.pdf"})
        doc2 = Document(content="Test PDF content 2", meta_data={"url": "https://example.com/document1.pdf"})
        doc1.embedding = None
        doc2.embedding = None

        with patch.object(type(kb), 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = iter([[doc1, doc2]])

            # Mock the embed method for each document
            with patch.object(doc1, 'embed') as mock_embed1, patch.object(doc2, 'embed') as mock_embed2:
                kb.load()

                # Verify embed was called for each document
                mock_embed1.assert_called_once_with(embedder=mock_embedder)
                mock_embed2.assert_called_once_with(embedder=mock_embedder)

    def test_load_skip_embedding_if_already_embedded(self, mock_vector_db):
        """Test load method skips embedding for documents that already have embeddings"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=TEST_URLS)
        kb.vector_db = mock_vector_db

        # Create documents with embeddings
        doc1 = Document(content="Test PDF content 1", meta_data={"url": "https://example.com/document1.pdf"})
        doc1.embedding = [0.1, 0.2, 0.3]  # Already embedded

        with patch.object(type(kb), 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = iter([[doc1]])
            with patch.object(doc1, 'embed') as mock_embed:
                kb.load()

                # Verify embed was not called
                mock_embed.assert_not_called()

    def test_load_with_upsert_false(self, mock_vector_db):
        """Test load method with upsert=False"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=TEST_URLS)
        kb.vector_db = mock_vector_db

        with patch.object(type(kb), 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = iter([TEST_DOCUMENTS])
            kb.load(upsert=False)

            # Verify upsert was not called
            mock_vector_db.upsert.assert_not_called()

    def test_load_with_multiple_document_lists(self, mock_vector_db):
        """Test load method with multiple document lists"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=TEST_URLS)
        kb.vector_db = mock_vector_db

        # Create multiple document lists
        doc_list_1 = [
            Document(content="PDF 1 Page 1", meta_data={"url": "https://example.com/doc1.pdf", "page": 1}),
            Document(content="PDF 1 Page 2", meta_data={"url": "https://example.com/doc1.pdf", "page": 2})
        ]
        doc_list_2 = [
            Document(content="PDF 2 Page 1", meta_data={"url": "https://example.com/doc2.pdf", "page": 1})
        ]

        with patch.object(type(kb), 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = iter([doc_list_1, doc_list_2])
            kb.load()

            # Verify upsert was called for each document list
            assert mock_vector_db.upsert.call_count == 2

    def test_load_handles_embedding_error(self, mock_vector_db, mock_embedder):
        """Test load method handles embedding errors gracefully"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=TEST_URLS)
        kb.vector_db = mock_vector_db
        mock_vector_db.embedder = mock_embedder

        # Create document that will fail embedding
        doc1 = Document(content="Test content", meta_data={"url": "https://example.com/doc.pdf"})
        doc1.embedding = None
        doc1.embed = MagicMock(side_effect=Exception("Embedding error"))

        with patch.object(type(kb), 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = iter([[doc1]])
            with patch('app.knowledge.enhanced_pdf_url_kb.logger') as mock_logger:
                kb.load()

                # Verify error was logged
                mock_logger.error.assert_any_call(f"Error embedding document {doc1.id}: Embedding error")

                # Verify upsert was still called despite embedding error
                mock_vector_db.upsert.assert_called_once()

    def test_load_handles_upsert_error(self, mock_vector_db):
        """Test load method handles upsert errors gracefully"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=TEST_URLS)
        kb.vector_db = mock_vector_db
        mock_vector_db.upsert.side_effect = Exception("Upsert error")

        with patch.object(type(kb), 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = iter([TEST_DOCUMENTS])
            with patch('app.knowledge.enhanced_pdf_url_kb.logger') as mock_logger:
                kb.load()

                # Verify error was logged
                mock_logger.error.assert_any_call("Error upserting documents: Upsert error")

    def test_load_with_filters_and_upsert(self, mock_vector_db):
        """Test load method with both filters and upsert enabled"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=TEST_URLS)
        kb.vector_db = mock_vector_db

        with patch.object(type(kb), 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = iter([TEST_DOCUMENTS])
            kb.load(upsert=True, filters=TEST_FILTERS)

            # Verify upsert was called with correct parameters
            mock_vector_db.upsert.assert_called_once()
            call_kwargs = mock_vector_db.upsert.call_args[1]
            assert call_kwargs['documents'] == TEST_DOCUMENTS
            assert call_kwargs['filters'] == TEST_FILTERS

    def test_load_logs_info_messages(self, mock_vector_db):
        """Test load method logs appropriate info messages"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=TEST_URLS)
        kb.vector_db = mock_vector_db

        with patch.object(type(kb), 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = iter([TEST_DOCUMENTS])
            with patch('app.knowledge.enhanced_pdf_url_kb.logger') as mock_logger:
                kb.load()

                # Verify info messages were logged
                mock_logger.info.assert_any_call(f"Loading PDF URL knowledge base: {len(TEST_URLS)} URLs")
                mock_logger.info.assert_any_call("Completed loading PDF URL knowledge base")

    def test_load_logs_debug_with_filters(self, mock_vector_db):
        """Test load method logs debug message when using filters"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=TEST_URLS)
        kb.vector_db = mock_vector_db

        with patch.object(type(kb), 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = iter([TEST_DOCUMENTS])
            with patch('app.knowledge.enhanced_pdf_url_kb.logger') as mock_logger:
                kb.load(filters=TEST_FILTERS)

                # Verify debug message was logged with filters
                mock_logger.debug.assert_called()
                debug_calls = [call for call in mock_logger.debug.call_args_list]
                assert any(
                    f"Upserting {len(TEST_DOCUMENTS)} documents with filters: {TEST_FILTERS}" in str(call)
                    for call in debug_calls
                )

    def test_load_without_embedder(self, mock_vector_db):
        """Test load method when vector db has no embedder"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=TEST_URLS)
        kb.vector_db = mock_vector_db
        # Remove embedder attribute
        delattr(mock_vector_db, 'embedder')

        doc1 = Document(content="Test content", meta_data={"url": "https://example.com/doc.pdf"})
        doc1.embedding = None

        with patch.object(type(kb), 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = iter([[doc1]])
            with patch.object(doc1, 'embed') as mock_embed:
                kb.load()

                # Verify embed was not called when embedder is not available
                mock_embed.assert_not_called()

                # But upsert should still be called
                mock_vector_db.upsert.assert_called_once()

    def test_load_integration_with_all_parameters(self, mock_vector_db, mock_embedder):
        """Test load method with all parameters combined"""
        kb = EnhancedPDFUrlKnowledgeBase(urls=TEST_URLS)
        kb.vector_db = mock_vector_db
        mock_vector_db.embedder = mock_embedder
        mock_vector_db.exists.return_value = False

        doc1 = Document(content="Test content 1", meta_data={"url": "https://example.com/doc1.pdf"})
        doc2 = Document(content="Test content 2", meta_data={"url": "https://example.com/doc2.pdf"})
        doc1.embedding = None
        doc2.embedding = None

        with patch.object(type(kb), 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = iter([[doc1, doc2]])

            # Mock the embed method for each document
            with patch.object(doc1, 'embed') as mock_embed1, patch.object(doc2, 'embed') as mock_embed2:
                kb.load(
                    recreate=False,
                    upsert=True,
                    skip_existing=True,
                    filters=TEST_FILTERS
                )

                # Verify database was created (not dropped)
                mock_vector_db.drop.assert_not_called()
                mock_vector_db.create.assert_called_once()

                # Verify documents were embedded
                mock_embed1.assert_called_once_with(embedder=mock_embedder)
                mock_embed2.assert_called_once_with(embedder=mock_embedder)

                # Verify upsert was called with filters
                mock_vector_db.upsert.assert_called_once()
                call_kwargs = mock_vector_db.upsert.call_args[1]
                assert call_kwargs['documents'] == [doc1, doc2]
                assert call_kwargs['filters'] == TEST_FILTERS

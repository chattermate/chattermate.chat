"""
ChatterMate - Test Enhanced PDF Knowledge Base
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
from agno.document import Document

from app.knowledge.enhanced_pdf_kb import EnhancedPDFKnowledgeBase


@pytest.fixture
def mock_vector_db():
    """Create a mock vector database"""
    db = MagicMock()
    db.exists.return_value = True
    db.embedder = MagicMock()
    return db


@pytest.fixture
def mock_reader():
    """Create a mock PDF reader"""
    reader = MagicMock()
    return reader


@pytest.fixture
def mock_document():
    """Create a mock document"""
    doc = MagicMock(spec=Document)
    doc.id = "test_doc_1"
    doc.embedding = None
    return doc


class TestEnhancedPDFKnowledgeBase:
    """Tests for EnhancedPDFKnowledgeBase class"""

    def test_load_no_vector_db(self):
        """Test load when no vector db is provided"""
        kb = EnhancedPDFKnowledgeBase(path="/test/path")
        kb.vector_db = None

        # Should return early without error
        kb.load()

    def test_load_no_reader(self, mock_vector_db):
        """Test load when no reader is provided"""
        kb = EnhancedPDFKnowledgeBase(path="/test/path")
        kb.vector_db = mock_vector_db
        kb.reader = None

        # Should return early without error
        kb.load()

    def test_load_recreate_db(self, mock_vector_db, mock_reader):
        """Test load with recreate=True"""
        with patch.object(EnhancedPDFKnowledgeBase, 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = []

            kb = EnhancedPDFKnowledgeBase(path="/test/path")
            kb.vector_db = mock_vector_db
            kb.reader = mock_reader

            kb.load(recreate=True)

            mock_vector_db.drop.assert_called_once()
            mock_vector_db.create.assert_called_once()

    def test_load_create_if_not_exists(self, mock_vector_db, mock_reader):
        """Test load creates db if it doesn't exist"""
        mock_vector_db.exists.return_value = False

        with patch.object(EnhancedPDFKnowledgeBase, 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = []

            kb = EnhancedPDFKnowledgeBase(path="/test/path")
            kb.vector_db = mock_vector_db
            kb.reader = mock_reader

            kb.load(recreate=False)

            mock_vector_db.create.assert_called_once()

    def test_load_with_documents(self, mock_vector_db, mock_reader, mock_document):
        """Test load with documents"""
        with patch.object(EnhancedPDFKnowledgeBase, 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = [[mock_document]]

            kb = EnhancedPDFKnowledgeBase(path="/test/path")
            kb.vector_db = mock_vector_db
            kb.reader = mock_reader

            kb.load(upsert=True)

            # Document should be embedded
            mock_document.embed.assert_called_once_with(embedder=mock_vector_db.embedder)
            # Documents should be upserted
            mock_vector_db.upsert.assert_called_once()

    def test_load_with_filters(self, mock_vector_db, mock_reader, mock_document):
        """Test load with metadata filters"""
        with patch.object(EnhancedPDFKnowledgeBase, 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = [[mock_document]]

            kb = EnhancedPDFKnowledgeBase(path="/test/path")
            kb.vector_db = mock_vector_db
            kb.reader = mock_reader

            filters = {"organization_id": "test_org", "agent_id": "test_agent"}
            kb.load(upsert=True, filters=filters)

            mock_vector_db.upsert.assert_called_once_with(
                documents=[mock_document],
                filters=filters
            )

    def test_load_document_already_embedded(self, mock_vector_db, mock_reader):
        """Test load when document is already embedded"""
        doc = MagicMock(spec=Document)
        doc.id = "test_doc_1"
        doc.embedding = [0.1, 0.2, 0.3]  # Already has embedding

        with patch.object(EnhancedPDFKnowledgeBase, 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = [[doc]]

            kb = EnhancedPDFKnowledgeBase(path="/test/path")
            kb.vector_db = mock_vector_db
            kb.reader = mock_reader

            kb.load(upsert=True)

            # embed should not be called since doc already has embedding
            doc.embed.assert_not_called()

    def test_load_embedding_error(self, mock_vector_db, mock_reader, mock_document):
        """Test load when embedding fails"""
        mock_document.embed.side_effect = Exception("Embedding error")

        with patch.object(EnhancedPDFKnowledgeBase, 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = [[mock_document]]

            kb = EnhancedPDFKnowledgeBase(path="/test/path")
            kb.vector_db = mock_vector_db
            kb.reader = mock_reader

            # Should not raise, but log error
            kb.load(upsert=True)

    def test_load_upsert_error(self, mock_vector_db, mock_reader, mock_document):
        """Test load when upsert fails"""
        mock_vector_db.upsert.side_effect = Exception("Upsert error")

        with patch.object(EnhancedPDFKnowledgeBase, 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = [[mock_document]]

            kb = EnhancedPDFKnowledgeBase(path="/test/path")
            kb.vector_db = mock_vector_db
            kb.reader = mock_reader

            # Should not raise, but log error
            kb.load(upsert=True)

    def test_load_skip_upsert(self, mock_vector_db, mock_reader, mock_document):
        """Test load with upsert=False"""
        with patch.object(EnhancedPDFKnowledgeBase, 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = [[mock_document]]

            kb = EnhancedPDFKnowledgeBase(path="/test/path")
            kb.vector_db = mock_vector_db
            kb.reader = mock_reader

            kb.load(upsert=False)

            # upsert should not be called
            mock_vector_db.upsert.assert_not_called()

    def test_load_multiple_document_lists(self, mock_vector_db, mock_reader):
        """Test load with multiple document lists"""
        doc1 = MagicMock(spec=Document)
        doc1.id = "doc1"
        doc1.embedding = None

        doc2 = MagicMock(spec=Document)
        doc2.id = "doc2"
        doc2.embedding = None

        with patch.object(EnhancedPDFKnowledgeBase, 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = [[doc1], [doc2]]

            kb = EnhancedPDFKnowledgeBase(path="/test/path")
            kb.vector_db = mock_vector_db
            kb.reader = mock_reader

            kb.load(upsert=True)

            # Both documents should be embedded
            doc1.embed.assert_called_once()
            doc2.embed.assert_called_once()

            # upsert should be called twice (once per document list)
            assert mock_vector_db.upsert.call_count == 2

    def test_load_no_embedder(self, mock_reader):
        """Test load when vector_db has no embedder"""
        mock_db = MagicMock()
        mock_db.exists.return_value = True
        # No embedder attribute
        del mock_db.embedder

        doc = MagicMock(spec=Document)
        doc.id = "doc1"
        doc.embedding = None

        with patch.object(EnhancedPDFKnowledgeBase, 'document_lists', new_callable=PropertyMock) as mock_doc_lists:
            mock_doc_lists.return_value = [[doc]]

            kb = EnhancedPDFKnowledgeBase(path="/test/path")
            kb.vector_db = mock_db
            kb.reader = mock_reader

            kb.load(upsert=True)

            # embed should not be called since no embedder
            doc.embed.assert_not_called()

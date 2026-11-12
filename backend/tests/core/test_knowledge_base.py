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
from unittest.mock import patch, MagicMock, AsyncMock
from app.knowledge.knowledge_base import KnowledgeManager
from app.models.knowledge import Knowledge, SourceType
from uuid import uuid4
import os
from agno.vectordb.pgvector import PgVector

@pytest.fixture
def mock_db():
    """Create a mock database session"""
    db = MagicMock()
    return db

@pytest.fixture
def mock_knowledge():
    """Create a mock knowledge entry"""
    knowledge_id = uuid4()
    org_id = uuid4()
    return Knowledge(
        id=knowledge_id,
        organization_id=org_id,
        source="test_source",
        source_type=SourceType.FILE,
        table_name="test_table",
        schema="test_schema"
    )

@pytest.fixture
def mock_vector_db():
    """Create a mock vector database"""
    vector_db = MagicMock(spec=PgVector)
    vector_db.table_name = "test_table"
    vector_db.schema = "test_schema"
    return vector_db

@pytest.fixture
def knowledge_manager(mock_db, mock_vector_db):
    """Create a KnowledgeManager instance with mocked dependencies"""
    org_id = uuid4()
    agent_id = uuid4()
    
    with patch('app.knowledge.knowledge_base.SessionLocal') as mock_session_local, \
         patch('app.knowledge.knowledge_base.OptimizedPgVector') as mock_pg_vector, \
         patch('app.knowledge.knowledge_base.KnowledgeRepository') as mock_knowledge_repo, \
         patch('app.knowledge.knowledge_base.KnowledgeToAgentRepository') as mock_link_repo:
        
        # Configure basic mocks
        mock_session_local.return_value.__enter__.return_value = mock_db
        mock_pg_vector.return_value = mock_vector_db
        
        # Configure repository mocks
        mock_knowledge_repo_instance = MagicMock()
        mock_link_repo_instance = MagicMock()
        mock_knowledge_repo.return_value = mock_knowledge_repo_instance
        mock_link_repo.return_value = mock_link_repo_instance
        
        manager = KnowledgeManager(org_id=org_id, agent_id=str(agent_id))
        
        # Replace repository instances with mocks
        manager.knowledge_repo = mock_knowledge_repo_instance
        manager.link_repo = mock_link_repo_instance
        
        return manager

@pytest.mark.asyncio
async def test_add_pdf_urls_success(knowledge_manager):
    """A PDF URL is downloaded through the guarded fetcher, then indexed."""
    urls = ["https://example.com/docs/test.pdf"]

    with patch('app.knowledge.knowledge_base.download_pdf') as mock_download, \
         patch.object(knowledge_manager, 'add_pdf_files', AsyncMock(return_value=True)) as mock_add_files, \
         patch('app.knowledge.knowledge_base.delete_file_from_s3', AsyncMock()) as mock_delete:
        result = await knowledge_manager.add_pdf_urls(urls)

    assert result is True
    url, temp_path = mock_download.call_args.args
    assert url == urls[0]
    assert os.path.basename(temp_path) == "test.pdf"
    mock_add_files.assert_awaited_once_with([temp_path], filename="test")
    mock_delete.assert_not_called()  # not one of our S3 uploads
    assert not os.path.exists(os.path.dirname(temp_path))  # temp dir cleaned up

@pytest.mark.asyncio
async def test_add_pdf_urls_failure(knowledge_manager):
    """A refused or failed download is reported, and nothing is indexed."""
    from app.knowledge.url_safety import BlockedHostError

    with patch('app.knowledge.knowledge_base.download_pdf',
               side_effect=BlockedHostError("internal")), \
         patch.object(knowledge_manager, 'add_pdf_files', AsyncMock()) as mock_add_files:
        result = await knowledge_manager.add_pdf_urls(["http://169.254.169.254/latest"])

    assert result is False
    mock_add_files.assert_not_called()

@pytest.mark.parametrize("url, name", [
    ("https://example.com/a/guide.pdf", "guide"),
    ("https://example.com/a/My%20Guide.pdf?x=1", "My Guide"),
    # An encoded traversal decodes to a separator; only the last part survives.
    ("https://b.s3.amazonaws.com/knowledge/..%2F..%2Fapp%2Fmain.py", "main"),
    ("https://example.com/", "example.com"),
])
def test_pdf_name_from_url_never_carries_a_path(url, name):
    from app.knowledge.knowledge_base import _pdf_name_from_url
    assert _pdf_name_from_url(url) == name

@pytest.mark.asyncio
async def test_only_this_orgs_uploaded_pdf_is_deleted_from_s3(knowledge_manager):
    from app.knowledge.knowledge_base import settings
    own = f"https://{settings.S3_BUCKET}.s3.us-east-1.amazonaws.com/knowledge/{knowledge_manager.org_id}/f.pdf?X-Amz-Signature=x"
    other_org = f"https://{settings.S3_BUCKET}.s3.us-east-1.amazonaws.com/knowledge/{uuid4()}/f.pdf"
    # Another bucket, laid out so a path-style read lands on our org's key.
    foreign = f"https://evil.s3.amazonaws.com/x/knowledge/{knowledge_manager.org_id}/f.pdf"

    with patch('app.knowledge.knowledge_base.delete_file_from_s3', AsyncMock(return_value=True)) as mock_delete:
        for url in (own, other_org, foreign):
            await knowledge_manager._delete_uploaded_pdf(url)

    mock_delete.assert_awaited_once_with(own)

@pytest.mark.asyncio
async def test_add_websites_success(knowledge_manager, mock_knowledge):
    """Test successful addition of websites"""
    # Setup
    urls = ["http://example.com"]
    max_links = 5
    
    with patch('app.knowledge.knowledge_base.EnhancedWebsiteKnowledgeBase') as mock_web_kb, \
         patch.object(knowledge_manager, '_add_knowledge_source', return_value=mock_knowledge) as mock_add_source:
        # Configure mock
        mock_web_kb_instance = MagicMock()
        mock_web_kb.return_value = mock_web_kb_instance
        
        # Execute
        result = await knowledge_manager.add_websites(urls, max_links)
        
        # Assert
        assert result is True
        mock_web_kb.assert_called_once()
        mock_web_kb_instance.load.assert_called_once()
        mock_add_source.assert_called_once()

@pytest.mark.asyncio
async def test_add_pdf_files_success(knowledge_manager, mock_knowledge):
    """Test successful addition of PDF files"""
    # Setup
    files = ["/path/to/test.pdf"]

    with patch('app.knowledge.knowledge_base.EnhancedPDFKnowledgeBase') as mock_pdf_kb, \
         patch('app.knowledge.knowledge_base.PDFImageReader'), \
         patch('os.path.exists') as mock_exists, \
         patch('os.path.getsize') as mock_getsize, \
         patch('os.path.basename') as mock_basename, \
         patch('os.path.splitext') as mock_splitext, \
         patch.object(knowledge_manager, '_add_knowledge_source', return_value=mock_knowledge) as mock_add_source:
        # Configure mocks
        mock_pdf_kb_instance = MagicMock()
        mock_pdf_kb.return_value = mock_pdf_kb_instance
        mock_exists.return_value = True
        mock_getsize.return_value = 1024
        mock_basename.return_value = "test.pdf"
        mock_splitext.return_value = ("test", ".pdf")

        # Execute
        result = await knowledge_manager.add_pdf_files(files)

        # Assert
        assert result is True
        mock_pdf_kb.assert_called_once()
        mock_pdf_kb_instance.load.assert_called_once()
        mock_add_source.assert_called_once()

def test_get_knowledge_base_for_agent(knowledge_manager, mock_knowledge):
    """Test getting knowledge base for a specific agent"""
    # Setup
    mock_knowledge.agent_links = [
        MagicMock(agent_id=knowledge_manager.agent_id)
    ]
    
    with patch('app.knowledge.knowledge_base.KnowledgeRepository') as mock_knowledge_repo_class:
        mock_knowledge_repo_instance = MagicMock()
        mock_knowledge_repo_class.return_value = mock_knowledge_repo_instance
        mock_knowledge_repo_instance.get_by_agent.return_value = [mock_knowledge]
        
        # Execute
        result = knowledge_manager.get_knowledge_base()
        
        # Assert
        assert len(result) == 1
        assert result[0]['id'] == mock_knowledge.id
        assert result[0]['source'] == mock_knowledge.source
        assert result[0]['source_type'] == mock_knowledge.source_type
        mock_knowledge_repo_instance.get_by_agent.assert_called_once_with(knowledge_manager.agent_id)

def test_get_knowledge_base_for_org(knowledge_manager, mock_knowledge):
    """Test getting knowledge base for an organization"""
    # Setup
    knowledge_manager.agent_id = None
    mock_knowledge.agent_links = []
    
    with patch('app.knowledge.knowledge_base.KnowledgeRepository') as mock_knowledge_repo_class:
        mock_knowledge_repo_instance = MagicMock()
        mock_knowledge_repo_class.return_value = mock_knowledge_repo_instance
        mock_knowledge_repo_instance.get_by_org.return_value = [mock_knowledge]
        
        # Execute
        result = knowledge_manager.get_knowledge_base()
        
        # Assert
        assert len(result) == 1
        assert result[0]['id'] == mock_knowledge.id
        assert result[0]['source'] == mock_knowledge.source
        assert result[0]['source_type'] == mock_knowledge.source_type
        mock_knowledge_repo_instance.get_by_org.assert_called_once_with(knowledge_manager.org_id)

@pytest.mark.asyncio
async def test_process_knowledge_pdf_file(knowledge_manager):
    """Test processing PDF file knowledge"""
    # Setup
    queue_item = MagicMock()
    queue_item.id = 123  # ensure a real integer ID to avoid DB adapter issues
    queue_item.source_type = "pdf_file"
    queue_item.source = "/path/to/test.pdf"
    
    with patch.object(knowledge_manager, 'add_pdf_files') as mock_add_pdf_files, \
         patch('os.path.exists') as mock_exists, \
         patch('os.remove') as mock_remove, \
         patch('app.knowledge.knowledge_base.KnowledgeQueueRepository') as mock_queue_repo_cls:
        # Configure mocks
        mock_add_pdf_files.return_value = True
        mock_exists.return_value = True
        mock_queue_repo = MagicMock()
        mock_queue_repo.update_progress.return_value = True
        mock_queue_repo.update_status.return_value = True
        mock_queue_repo_cls.return_value = mock_queue_repo
        
        # Execute
        result = await knowledge_manager.process_knowledge(queue_item)
        
        # Assert
        assert result is True
        mock_add_pdf_files.assert_called_once_with([queue_item.source])
        mock_exists.assert_called_once_with(queue_item.source)
        mock_remove.assert_called_once_with(queue_item.source)

@pytest.mark.asyncio
async def test_process_knowledge_unsupported_type(knowledge_manager):
    """Test processing unsupported knowledge type"""
    # Setup
    queue_item = MagicMock()
    queue_item.source_type = "unsupported_type"
    
    # Execute and Assert
    with pytest.raises(ValueError, match="Unsupported source type: unsupported_type"):
        await knowledge_manager.process_knowledge(queue_item) 

# ---- PDFs over a limit: refused with the reason, not "failed to process" ----

from app.knowledge.pdf_download import PdfTooLargeError  # noqa: E402
from app.knowledge.pdf_limits import PdfTooManyPages  # noqa: E402
from tests.knowledge.test_pdf_limits import pdf_with_pages  # noqa: E402


@pytest.mark.asyncio
async def test_a_pdf_over_the_page_limit_is_refused_before_it_is_read(knowledge_manager, tmp_path):
    path = tmp_path / "catalogue.pdf"
    path.write_bytes(pdf_with_pages(4))

    with patch('app.core.config.settings.KB_PDF_MAX_PAGES', 3), \
         patch('app.knowledge.knowledge_base.EnhancedPDFKnowledgeBase') as reader, \
         pytest.raises(PdfTooManyPages, match="4 pages; the limit is 3"):
        await knowledge_manager.add_pdf_files([str(path)])

    reader.assert_not_called()


@pytest.mark.asyncio
async def test_a_pdf_link_over_the_size_limit_says_so_without_the_link(knowledge_manager):
    signed = "https://bucket.s3.amazonaws.com/knowledge/x/big.pdf?X-Amz-Signature=secret"
    with patch('app.knowledge.knowledge_base.download_pdf', side_effect=PdfTooLargeError(25 * 1024 * 1024)), \
         pytest.raises(PdfTooLargeError) as refused:
        await knowledge_manager.add_pdf_urls([signed])

    assert "25 MB" in str(refused.value)
    assert "amazonaws" not in str(refused.value)


@pytest.mark.asyncio
async def test_a_refused_upload_is_reported_and_its_copy_removed(knowledge_manager, tmp_path):
    path = tmp_path / "0e9f_catalogue.pdf"
    path.write_bytes(pdf_with_pages(4))
    queue_item = MagicMock(id=123, source_type="pdf_file", source=str(path))

    with patch('app.core.config.settings.KB_PDF_MAX_PAGES', 3), \
         patch('app.knowledge.knowledge_base.KnowledgeQueueRepository') as queue_repo, \
         pytest.raises(PdfTooManyPages):
        await knowledge_manager.process_knowledge(queue_item)

    assert not path.exists()
    queue_repo.return_value.update_status.assert_not_called()  # never reported as completed


@pytest.mark.asyncio
@pytest.mark.parametrize("source_type,method", [("pdf_file", "add_pdf_files"), ("pdf_url", "add_pdf_urls")])
async def test_a_pdf_that_fails_is_never_marked_completed_first(knowledge_manager, source_type, method):
    queue_item = MagicMock(id=123, source_type=source_type, source="https://example.com/x.pdf")

    with patch.object(knowledge_manager, method, AsyncMock(return_value=False)), \
         patch('app.knowledge.knowledge_base.KnowledgeQueueRepository') as queue_repo, \
         pytest.raises(Exception, match="Failed to process knowledge source"):
        await knowledge_manager.process_knowledge(queue_item)

    queue_repo.return_value.update_status.assert_not_called()


# ---- Websites: learned page by page ----

from types import SimpleNamespace  # noqa: E402

from app.knowledge.page_sink import SourceRemoved  # noqa: E402

SITE = "https://shop.example"


@pytest.fixture
def site_run(knowledge_manager):
    """A queued website and the pieces _learn_site drives, stubbed."""
    queue_item = MagicMock(id=42, source=SITE, organization_id=knowledge_manager.org_id)
    queue_repo = MagicMock()
    queue_repo.last_run_left_partial.return_value = False
    kb = MagicMock(stopped_at_time_limit=False)
    learning = MagicMock()
    with patch('app.knowledge.knowledge_base.EnhancedWebsiteKnowledgeBase', return_value=kb), \
         patch('app.knowledge.knowledge_base.SourceLearning', return_value=learning) as made:
        yield queue_item, queue_repo, kb, learning, made


@pytest.mark.asyncio
async def test_a_site_is_read_with_its_pages_made_searchable_as_they_land(knowledge_manager, site_run):
    queue_item, queue_repo, kb, learning, made = site_run

    await knowledge_manager._learn_site(queue_item, queue_repo, MagicMock(), 25)

    made.assert_called_once_with(
        42, knowledge_manager.org_id, knowledge_manager.agent_id, SITE, "test_table", "test_schema"
    )
    assert kb.learning is learning
    kb.load.assert_called_once()
    assert kb.load.call_args.kwargs["skip_existing"] is True
    assert kb.load.call_args.kwargs["filters"]["agent_id"] == [str(knowledge_manager.agent_id)]
    # Also covers a site skipped as already learned: it is still linked
    learning.ensure_source.assert_called_once()
    queue_repo.note_stopped_at_time_limit.assert_not_called()


@pytest.mark.asyncio
async def test_a_site_whose_last_run_stopped_partway_is_read_again(knowledge_manager, site_run):
    queue_item, queue_repo, kb, learning, _ = site_run
    queue_repo.last_run_left_partial.return_value = True

    await knowledge_manager._learn_site(queue_item, queue_repo, MagicMock(), 25)

    queue_repo.last_run_left_partial.assert_called_once_with(knowledge_manager.org_id, SITE, 42)
    assert kb.load.call_args.kwargs["skip_existing"] is False


@pytest.mark.asyncio
async def test_a_site_that_hit_the_time_limit_is_noted(knowledge_manager, site_run):
    queue_item, queue_repo, kb, _, _ = site_run
    kb.stopped_at_time_limit = True

    await knowledge_manager._learn_site(queue_item, queue_repo, MagicMock(), 25)

    queue_repo.note_stopped_at_time_limit.assert_called_once_with(42)


@pytest.mark.asyncio
async def test_a_site_removed_mid_crawl_is_cleaned_up(knowledge_manager, site_run):
    queue_item, queue_repo, kb, learning, _ = site_run
    kb.load.side_effect = SourceRemoved("removed")

    with pytest.raises(SourceRemoved):
        await knowledge_manager._learn_site(queue_item, queue_repo, MagicMock(), 25)

    learning.discard.assert_called_once()
    learning.ensure_source.assert_not_called()


@pytest.mark.asyncio
@pytest.mark.parametrize("reader,fails", [
    (SimpleNamespace(), False),  # already learned: not read again, no count
    (SimpleNamespace(_sitemap_page_count=0), True),  # read, and it listed nothing
    (SimpleNamespace(_sitemap_page_count=4), False),
])
async def test_only_a_sitemap_that_was_read_and_listed_nothing_fails(knowledge_manager, reader, fails):
    queue_item = MagicMock(id=7, source_type='sitemap', source=f"{SITE}/sitemap.xml", queue_metadata={})
    with patch('app.knowledge.knowledge_base.SitemapReader', return_value=reader), \
         patch('app.knowledge.knowledge_base.KnowledgeQueueRepository'), \
         patch.object(knowledge_manager, '_learn_site', AsyncMock()):
        if fails:
            with pytest.raises(ValueError, match="No pages found"):
                await knowledge_manager.process_knowledge(queue_item)
        else:
            assert await knowledge_manager.process_knowledge(queue_item) is True

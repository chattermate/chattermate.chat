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
from app.workers.knowledge_processor import process_queue_item, run_processor
from app.models.knowledge_queue import QueueStatus
from app.models.notification import NotificationType
from uuid import uuid4
import pytest_asyncio

@pytest.fixture
def mock_db():
    """Create a mock database session"""
    db = MagicMock()
    return db

@pytest.fixture
def mock_queue_item():
    """Create a mock queue item"""
    queue_item = MagicMock()
    queue_item.id = 1
    queue_item.organization_id = uuid4()
    queue_item.agent_id = str(uuid4())
    queue_item.user_id = uuid4()
    queue_item.source = "test_document.pdf"
    queue_item.status = QueueStatus.PENDING
    queue_item.pages_learned = 0
    queue_item.queue_metadata = {}
    return queue_item

@pytest.fixture
def mock_queue_repo(mock_queue_item):
    """Create a mock queue repository"""
    repo = MagicMock()
    repo.get_by_id.return_value = mock_queue_item
    repo.get_pending.return_value = [mock_queue_item]
    return repo

@pytest.fixture
def mock_knowledge_manager():
    """Create a mock knowledge manager"""
    manager = MagicMock()
    manager.process_knowledge = AsyncMock()
    return manager

@pytest_asyncio.fixture
async def mock_dependencies(mock_db, mock_queue_repo, mock_knowledge_manager):
    """Set up all mock dependencies"""
    # Create a context manager mock that returns mock_db
    mock_session_local = MagicMock()
    mock_session_local.return_value.__enter__ = MagicMock(return_value=mock_db)
    mock_session_local.return_value.__exit__ = MagicMock(return_value=False)

    with patch('app.workers.knowledge_processor.SessionLocal', mock_session_local), \
         patch('app.workers.knowledge_processor.KnowledgeQueueRepository', return_value=mock_queue_repo), \
         patch('app.workers.knowledge_processor.KnowledgeManager', return_value=mock_knowledge_manager), \
         patch('app.workers.knowledge_processor.send_fcm_notification', new_callable=AsyncMock) as mock_fcm:
        yield {
            'db': mock_db,
            'queue_repo': mock_queue_repo,
            'knowledge_manager': mock_knowledge_manager,
            'fcm': mock_fcm
        }

@pytest.mark.asyncio
async def test_process_queue_item_success(mock_dependencies, mock_queue_item):
    """Test successful processing of a queue item"""
    # Execute
    await process_queue_item(mock_queue_item.id)

    # Assert
    assert mock_queue_item.status == QueueStatus.COMPLETED
    mock_dependencies['knowledge_manager'].process_knowledge.assert_awaited_once_with(mock_queue_item)
    
    # Verify notification was created
    mock_dependencies['db'].add.assert_called_once()
    notification_call = mock_dependencies['db'].add.call_args[0][0]
    assert notification_call.type == NotificationType.KNOWLEDGE_PROCESSED
    assert notification_call.user_id == mock_queue_item.user_id
    assert mock_queue_item.source in notification_call.message
    
    # Verify FCM notification was sent
    mock_dependencies['fcm'].assert_awaited_once()

@pytest.mark.asyncio
async def test_process_queue_item_not_found(mock_dependencies):
    """Test processing when queue item is not found"""
    # Setup
    mock_dependencies['queue_repo'].get_by_id.return_value = None
    
    # Execute
    await process_queue_item(999)
    
    # Assert
    mock_dependencies['knowledge_manager'].process_knowledge.assert_not_awaited()
    mock_dependencies['fcm'].assert_not_awaited()

@pytest.mark.asyncio
async def test_process_queue_item_error(mock_dependencies, mock_queue_item):
    """Test error handling during queue item processing"""
    # Setup
    error_message = "Processing failed"
    mock_dependencies['knowledge_manager'].process_knowledge.side_effect = Exception(error_message)
    
    # Execute and assert exception is raised
    with pytest.raises(Exception, match=error_message):
        await process_queue_item(mock_queue_item.id)
    
    # Assert
    assert mock_queue_item.status == QueueStatus.FAILED
    
    # Verify error notification was created
    mock_dependencies['db'].add.assert_called_once()
    notification_call = mock_dependencies['db'].add.call_args[0][0]
    assert notification_call.type == NotificationType.KNOWLEDGE_FAILED
    assert notification_call.user_id == mock_queue_item.user_id
    assert error_message in notification_call.message
    
    # Verify FCM notification was sent
    mock_dependencies['fcm'].assert_awaited_once()

@pytest.mark.asyncio
async def test_run_processor_success(mock_dependencies):
    """Test successful run of the processor"""
    from app.api.knowledge import PROCESSOR_STATUS
    
    # Execute
    await run_processor()
    
    # Assert
    assert not PROCESSOR_STATUS["is_running"]
    assert PROCESSOR_STATUS["error"] is None
    assert isinstance(PROCESSOR_STATUS["last_run"], str)
    mock_dependencies['queue_repo'].get_pending.assert_called_once()
    mock_dependencies['knowledge_manager'].process_knowledge.assert_awaited_once()

@pytest.mark.asyncio
async def test_run_processor_no_pending_items(mock_dependencies):
    """Test processor run with no pending items"""
    # Setup
    mock_dependencies['queue_repo'].get_pending.return_value = []
    
    # Execute
    await run_processor()
    
    # Assert
    mock_dependencies['knowledge_manager'].process_knowledge.assert_not_awaited()

@pytest.mark.asyncio
async def test_run_processor_error(mock_dependencies):
    """Test error handling in processor run"""
    # Setup
    error_message = "Processor error"
    mock_dependencies['queue_repo'].get_pending.side_effect = Exception(error_message)
    
    # Execute and assert exception is raised
    with pytest.raises(Exception, match=error_message):
        await run_processor()
    
    # Assert
    from app.api.knowledge import PROCESSOR_STATUS
    assert not PROCESSOR_STATUS["is_running"]
    assert PROCESSOR_STATUS["error"] == error_message

# ---------------------------------------------------------------------------
# Vector agent-filter re-assert
#
# Ingestion writes filters.agent_id from the queue row's single optional
# agent_id. A run queued without one leaves every chunk with an empty list, and
# retrieval matches on that filter — so the source is invisible to the agent
# while the dashboard shows it as linked. Two production sources were left
# unreadable this way. The relational links are the authority, so the worker
# re-derives the filter from them after every successful run.
# ---------------------------------------------------------------------------

def _linked_knowledge(*agent_ids):
    """A knowledge row whose agent_links resolve to the given agent ids."""
    knowledge = MagicMock()
    knowledge.agent_links = [MagicMock(agent_id=a) for a in agent_ids]
    return knowledge


@pytest.mark.asyncio
async def test_process_queue_item_reasserts_agent_links(mock_dependencies, mock_queue_item):
    """After a successful run the chunks point at every linked agent."""
    agent_a, agent_b = str(uuid4()), str(uuid4())
    knowledge = _linked_knowledge(agent_a, agent_b)
    repo = MagicMock()
    repo.get_by_sources.return_value = [knowledge]

    with patch('app.workers.knowledge_processor.KnowledgeRepository', return_value=repo), \
         patch('app.workers.knowledge_processor.knowledge_vector_links.sync_agent_ids') as sync:
        await process_queue_item(mock_queue_item.id)

    sync.assert_called_once()
    _db, synced_knowledge, agent_ids = sync.call_args[0]
    assert synced_knowledge is knowledge
    # Both linked agents, not just the one the queue row happened to carry.
    assert sorted(agent_ids) == sorted([agent_a, agent_b])
    assert mock_queue_item.status == QueueStatus.COMPLETED


@pytest.mark.asyncio
async def test_reasserts_agent_links_when_queue_row_has_no_agent(mock_dependencies, mock_queue_item):
    """The production incident: a crawl queued with agent_id=None.

    Ingestion writes an empty filter, so without this the source stays
    unreadable until someone unlinks and relinks it by hand.
    """
    mock_queue_item.agent_id = None
    linked_agent = str(uuid4())
    knowledge = _linked_knowledge(linked_agent)
    repo = MagicMock()
    repo.get_by_sources.return_value = [knowledge]

    with patch('app.workers.knowledge_processor.KnowledgeRepository', return_value=repo), \
         patch('app.workers.knowledge_processor.knowledge_vector_links.sync_agent_ids') as sync:
        await process_queue_item(mock_queue_item.id)

    assert sync.call_args[0][2] == [linked_agent]


@pytest.mark.asyncio
async def test_agent_link_sync_failure_does_not_fail_the_run(mock_dependencies, mock_queue_item):
    """The content is already ingested — a filter refresh must not lose the run."""
    repo = MagicMock()
    repo.get_by_sources.return_value = [_linked_knowledge(str(uuid4()))]

    with patch('app.workers.knowledge_processor.KnowledgeRepository', return_value=repo), \
         patch('app.workers.knowledge_processor.knowledge_vector_links.sync_agent_ids',
               side_effect=Exception("vector store unavailable")):
        await process_queue_item(mock_queue_item.id)

    assert mock_queue_item.status == QueueStatus.COMPLETED
    mock_dependencies['fcm'].assert_awaited_once()


@pytest.mark.asyncio
async def test_unknown_source_skips_sync_without_error(mock_dependencies, mock_queue_item):
    """No knowledge row yet (e.g. the run failed before creating one)."""
    repo = MagicMock()
    repo.get_by_sources.return_value = []

    with patch('app.workers.knowledge_processor.KnowledgeRepository', return_value=repo), \
         patch('app.workers.knowledge_processor.knowledge_vector_links.sync_agent_ids') as sync:
        await process_queue_item(mock_queue_item.id)

    sync.assert_not_called()
    assert mock_queue_item.status == QueueStatus.COMPLETED


@pytest.mark.asyncio
async def test_empty_crawl_fails_the_queue_item(mock_dependencies, mock_queue_item):
    """Regression: a crawl that stored nothing used to be marked COMPLETED.

    Production logged "Crawling completed - 0 URLs, 0 documents, 0.00s" followed
    by "Marked queue item as completed", so a broken source was indistinguishable
    from a healthy one in the dashboard.
    """
    from app.knowledge.enhanced_website_reader import EmptyCrawlError

    mock_dependencies['knowledge_manager'].process_knowledge.side_effect = EmptyCrawlError(
        "No content could be read from https://example.com."
    )

    # The user is told; it doesn't go on up the worker loop as an app error
    await process_queue_item(mock_queue_item.id)

    assert mock_queue_item.status == QueueStatus.FAILED
    notification = mock_dependencies['db'].add.call_args[0][0]
    assert notification.type == NotificationType.KNOWLEDGE_FAILED
    assert "No content could be read" in notification.message


@pytest.mark.asyncio
async def test_an_unreadable_site_is_a_warning_and_our_own_bugs_stay_errors(mock_dependencies, mock_queue_item):
    """The daily report counts ERROR lines: a customer's site that needs a
    password isn't one of ours."""
    from app.knowledge.enhanced_website_reader import EmptyCrawlError

    manager = mock_dependencies['knowledge_manager']
    manager.process_knowledge.side_effect = EmptyCrawlError("https://shop.example asks for a password")
    with patch('app.workers.knowledge_processor.logger') as log:
        await process_queue_item(mock_queue_item.id)
    log.warning.assert_called_once()
    log.error.assert_not_called()

    manager.process_knowledge.side_effect = KeyError("our bug")
    mock_queue_item.status = QueueStatus.PENDING
    with patch('app.workers.knowledge_processor.logger') as log, pytest.raises(KeyError):
        await process_queue_item(mock_queue_item.id)
    log.error.assert_called()


@pytest.mark.asyncio
async def test_duplicate_knowledge_rows_sync_the_union_of_their_agents(
    mock_dependencies, mock_queue_item
):
    """Two knowledge rows can share one URL — and one set of vector chunks.

    Syncing them one after another would let the last write drop the other
    row's agents, so the union is applied once.
    """
    agent_a, agent_b = str(uuid4()), str(uuid4())
    repo = MagicMock()
    repo.get_by_sources.return_value = [
        _linked_knowledge(agent_a),
        _linked_knowledge(agent_b),
    ]

    with patch('app.workers.knowledge_processor.KnowledgeRepository', return_value=repo), \
         patch('app.workers.knowledge_processor.knowledge_vector_links.sync_agent_ids') as sync:
        await process_queue_item(mock_queue_item.id)

    sync.assert_called_once()
    assert sync.call_args[0][2] == sorted([agent_a, agent_b])

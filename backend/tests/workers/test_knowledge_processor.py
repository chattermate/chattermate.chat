"""
ChatterMate - Test Knowledge Processor
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
from unittest.mock import patch, MagicMock, AsyncMock
from app.workers.knowledge_processor import process_queue_item, run_processor
from app.models.knowledge_queue import QueueStatus
from app.models.notification import NotificationType
from uuid import uuid4
import pytest_asyncio
from datetime import datetime

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
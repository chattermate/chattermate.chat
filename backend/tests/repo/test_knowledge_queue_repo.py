"""
ChatterMate - Test Knowledge Queue Repo
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
from app.repositories.knowledge_queue import KnowledgeQueueRepository
from app.models.knowledge_queue import KnowledgeQueue, QueueStatus
from app.models.user import User
from uuid import uuid4

@pytest.fixture
def queue_repo(db):
    return KnowledgeQueueRepository(db)

@pytest.fixture
def test_user(db, test_organization_id):
    """Create a test user"""
    user = User(
        email="test@example.com",
        hashed_password="hashed_password",
        organization_id=test_organization_id,
        is_active=True,
        full_name="Test User"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_queue_item(db, test_organization_id, test_user):
    """Create a test queue item"""
    queue_item = KnowledgeQueue(
        organization_id=test_organization_id,
        user_id=test_user.id,
        source_type="pdf_file",
        source="/test/path/document.pdf",
        status=QueueStatus.PENDING,
        error=None,
        queue_metadata={"test": "metadata"}
    )
    db.add(queue_item)
    db.commit()
    db.refresh(queue_item)
    return queue_item

def test_create_queue_item(queue_repo, test_organization_id, test_user):
    """Test creating a new queue item"""
    queue_item = KnowledgeQueue(
        organization_id=test_organization_id,
        user_id=test_user.id,
        source_type="pdf_file",
        source="/test/path/new.pdf",
        status=QueueStatus.PENDING,
        queue_metadata={"test": "metadata"}
    )
    
    created_item = queue_repo.create(queue_item)
    assert created_item is not None
    assert created_item.source == "/test/path/new.pdf"
    assert created_item.status == QueueStatus.PENDING
    assert created_item.error is None

def test_get_by_id(queue_repo, test_queue_item):
    """Test retrieving a queue item by ID"""
    item = queue_repo.get_by_id(test_queue_item.id)
    assert item is not None
    assert item.id == test_queue_item.id
    assert item.source == "/test/path/document.pdf"
    assert item.status == QueueStatus.PENDING

def test_get_by_id_nonexistent(queue_repo):
    """Test retrieving a nonexistent queue item"""
    item = queue_repo.get_by_id(999)
    assert item is None

def test_get_pending(queue_repo, test_queue_item, db, test_organization_id, test_user):
    """Test retrieving pending queue items"""
    # Create another pending item
    another_item = KnowledgeQueue(
        organization_id=test_organization_id,
        user_id=test_user.id,
        source_type="pdf_file",
        source="/test/path/another.pdf",
        status=QueueStatus.PENDING,
        queue_metadata={"test": "metadata"}
    )
    db.add(another_item)
    
    # Create a completed item
    completed_item = KnowledgeQueue(
        organization_id=test_organization_id,
        user_id=test_user.id,
        source_type="pdf_file",
        source="/test/path/completed.pdf",
        status=QueueStatus.COMPLETED,
        queue_metadata={"test": "metadata"}
    )
    db.add(completed_item)
    db.commit()

    # Get pending items
    pending_items = queue_repo.get_pending()
    assert len(pending_items) == 2
    assert all(item.status == QueueStatus.PENDING for item in pending_items)

def test_update_status_success(queue_repo, test_queue_item):
    """Test successfully updating queue item status"""
    success = queue_repo.update_status(
        test_queue_item.id,
        QueueStatus.COMPLETED
    )
    assert success is True

    # Verify the update
    updated_item = queue_repo.get_by_id(test_queue_item.id)
    assert updated_item.status == QueueStatus.COMPLETED
    assert updated_item.error is None

def test_update_status_with_error(queue_repo, test_queue_item):
    """Test updating queue item status with error"""
    error_message = "Processing failed"
    success = queue_repo.update_status(
        test_queue_item.id,
        QueueStatus.FAILED,
        error=error_message
    )
    assert success is True

    # Verify the update
    updated_item = queue_repo.get_by_id(test_queue_item.id)
    assert updated_item.status == QueueStatus.FAILED
    assert updated_item.error == error_message

def test_update_status_nonexistent(queue_repo):
    """Test updating status of nonexistent queue item"""
    success = queue_repo.update_status(999, QueueStatus.COMPLETED)
    assert success is False 
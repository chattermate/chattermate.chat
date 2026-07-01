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
from app.repositories.group import GroupRepository
from app.models.user import UserGroup, User
from uuid import uuid4, UUID

@pytest.fixture
def group_repo(db):
    return GroupRepository(db)

@pytest.fixture
def test_group(db, test_organization_id):
    """Create a test group with users"""
    group = UserGroup(
        id=uuid4(),
        name="Test Group",
        description="A test group",
        organization_id=test_organization_id
    )
    db.add(group)
    
    # Create test users
    users = []
    for i in range(3):
        user = User(
            id=uuid4(),
            email=f"user{i}@test.com",
            full_name=f"Test User {i}",
            hashed_password="dummy_hash",
            is_active=True,
            organization_id=test_organization_id
        )
        users.append(user)
        db.add(user)
    
    # Associate users with the group
    group.users.extend(users)
    db.commit()
    db.refresh(group)
    return group

def test_get_group_with_users(group_repo, test_group):
    """Test retrieving a group with its associated users"""
    # Get the group with users
    group = group_repo.get_group_with_users(test_group.id)
    
    # Verify group data
    assert group is not None
    assert group.id == test_group.id
    assert group.name == "Test Group"
    assert group.description == "A test group"
    
    # Verify associated users
    assert len(group.users) == 3
    for i, user in enumerate(group.users):
        assert user.email == f"user{i}@test.com"
        assert user.full_name == f"Test User {i}"
        assert user.is_active is True

def test_get_nonexistent_group(group_repo):
    """Test retrieving a group that doesn't exist"""
    group = group_repo.get_group_with_users(uuid4())
    assert group is None 
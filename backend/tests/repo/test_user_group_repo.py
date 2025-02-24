"""
ChatterMate - Test User Group Repo
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
from app.repositories.user_group import UserGroupRepository
from app.models.user import User, UserGroup
from uuid import uuid4
from app.models.organization import Organization

@pytest.fixture
def user_group_repo(db):
    """Create a UserGroupRepository instance"""
    return UserGroupRepository(db)

@pytest.fixture
def test_user(db, test_organization_id):
    """Create a test user"""
    user = User(
        id=uuid4(),
        email="test@example.com",
        hashed_password="hashed_password",
        is_active=True,
        organization_id=test_organization_id,
        full_name="Test User"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_group(db, test_organization_id):
    """Create a test group"""
    group = UserGroup(
        name="Test Group",
        description="Test group description",
        organization_id=test_organization_id
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    return group

def test_get_groups_by_organization(user_group_repo, test_organization_id, test_group):
    """Test retrieving groups by organization"""
    # Create another organization for testing
    other_org = Organization(
        name="Other Organization",
        domain="other.com",
        timezone="UTC"
    )
    user_group_repo.db.add(other_org)
    user_group_repo.db.commit()
    user_group_repo.db.refresh(other_org)

    # Create another group in a different organization
    other_group = UserGroup(
        name="Other Group",
        description="Other group description",
        organization_id=other_org.id
    )
    user_group_repo.db.add(other_group)
    user_group_repo.db.commit()

    # Get groups for test organization
    groups = user_group_repo.get_groups_by_organization(test_organization_id)
    assert len(groups) == 1
    assert groups[0].id == test_group.id
    assert groups[0].name == test_group.name

    # Get groups for other organization
    other_groups = user_group_repo.get_groups_by_organization(other_org.id)
    assert len(other_groups) == 1
    assert other_groups[0].name == other_group.name
    assert other_groups[0].organization_id == other_org.id

def test_get_group(user_group_repo, test_group):
    """Test retrieving a group by ID"""
    # Get existing group
    group = user_group_repo.get_group(test_group.id)
    assert group is not None
    assert group.id == test_group.id
    assert group.name == test_group.name

    # Try to get non-existent group
    non_existent_group = user_group_repo.get_group(uuid4())
    assert non_existent_group is None

def test_create_group(user_group_repo, test_organization_id):
    """Test creating a new group"""
    name = "New Group"
    description = "New group description"
    
    group = user_group_repo.create_group(name, description, test_organization_id)
    assert group is not None
    assert group.name == name
    assert group.description == description
    assert group.organization_id == test_organization_id

    # Verify group was saved to database
    saved_group = user_group_repo.get_group(group.id)
    assert saved_group is not None
    assert saved_group.name == name

def test_update_group(user_group_repo, test_group):
    """Test updating a group"""
    new_name = "Updated Group"
    new_description = "Updated description"
    
    # Update existing group
    updated_group = user_group_repo.update_group(
        test_group.id,
        name=new_name,
        description=new_description
    )
    assert updated_group is not None
    assert updated_group.name == new_name
    assert updated_group.description == new_description

    # Try to update non-existent group
    non_existent_update = user_group_repo.update_group(
        uuid4(),
        name="Non-existent Group"
    )
    assert non_existent_update is None

def test_delete_group(user_group_repo, test_group):
    """Test deleting a group"""
    # Delete existing group
    success = user_group_repo.delete_group(test_group.id)
    assert success is True

    # Verify group was deleted
    deleted_group = user_group_repo.get_group(test_group.id)
    assert deleted_group is None

    # Try to delete non-existent group
    success = user_group_repo.delete_group(uuid4())
    assert success is False

def test_add_user(user_group_repo, test_group, test_user):
    """Test adding a user to a group"""
    # Add user to group
    success = user_group_repo.add_user(test_group.id, test_user.id)
    assert success is True

    # Verify user was added
    group = user_group_repo.get_group(test_group.id)
    assert test_user in group.users

    # Try to add user again (should still return True but not duplicate)
    success = user_group_repo.add_user(test_group.id, test_user.id)
    assert success is True
    assert len(group.users) == 1

    # Try to add user to non-existent group
    success = user_group_repo.add_user(uuid4(), test_user.id)
    assert success is False

def test_remove_user(user_group_repo, test_group, test_user):
    """Test removing a user from a group"""
    # First add user to group
    user_group_repo.add_user(test_group.id, test_user.id)
    
    # Remove user from group
    success = user_group_repo.remove_user(test_group.id, test_user.id)
    assert success is True

    # Verify user was removed
    group = user_group_repo.get_group(test_group.id)
    assert test_user not in group.users

    # Try to remove user again (should still return True)
    success = user_group_repo.remove_user(test_group.id, test_user.id)
    assert success is True

    # Try to remove user from non-existent group
    success = user_group_repo.remove_user(uuid4(), test_user.id)
    assert success is False

def test_get_user_groups(user_group_repo, test_group, test_user):
    """Test getting all groups a user belongs to"""
    # Initially user should have no groups
    groups = user_group_repo.get_user_groups(test_user.id)
    assert len(groups) == 0

    # Add user to a group
    user_group_repo.add_user(test_group.id, test_user.id)

    # User should now have one group
    groups = user_group_repo.get_user_groups(test_user.id)
    assert len(groups) == 1
    assert groups[0].id == test_group.id

    # Test with non-existent user
    groups = user_group_repo.get_user_groups(uuid4())
    assert len(groups) == 0 
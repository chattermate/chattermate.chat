"""
ChatterMate - Test Role Repo
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
from app.repositories.role import RoleRepository
from app.models.role import Role
from app.models.permission import Permission
from app.models.user import User
from app.models.organization import Organization
from uuid import uuid4, UUID

@pytest.fixture
def test_organization(db):
    """Create a test organization"""
    org = Organization(
        name="Test Organization",
        domain="test.com",
        timezone="UTC"
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org

@pytest.fixture
def role_repo(db):
    return RoleRepository(db)

@pytest.fixture
def test_permission(db):
    """Create a test permission"""
    permission = Permission(name="test_permission", description="Test Permission")
    db.add(permission)
    db.commit()
    db.refresh(permission)
    return permission

@pytest.fixture
def test_role(db, test_organization):
    """Create a test role"""
    role = Role(
        name="Test Role",
        description="Test Role Description",
        organization_id=test_organization.id,
        is_default=False
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

def test_create_role(role_repo, test_organization):
    """Test creating a new role"""
    created = role_repo.create_role(
        name="New Role",
        description="New Role Description",
        organization_id=test_organization.id,
        is_default=False
    )
    
    assert created is not None
    assert created.name == "New Role"
    assert created.description == "New Role Description"
    assert created.organization_id == test_organization.id
    assert created.is_default is False

def test_create_role_with_permissions(role_repo, test_organization, test_permission):
    """Test creating a role with permissions"""
    created = role_repo.create_role(
        name="Role With Permissions",
        description="Role With Permissions Description",
        organization_id=test_organization.id,
        permission_ids=[test_permission.id]
    )
    
    assert created is not None
    assert len(created.permissions) == 1
    assert created.permissions[0].id == test_permission.id

def test_get_role(role_repo, test_role):
    """Test retrieving a role by ID"""
    role = role_repo.get_role(test_role.id)
    assert role is not None
    assert role.id == test_role.id
    assert role.name == test_role.name

def test_get_org_roles(role_repo, test_role):
    """Test retrieving all roles for an organization"""
    roles = role_repo.get_org_roles(test_role.organization_id)
    assert len(roles) == 1
    assert roles[0].id == test_role.id

def test_update_role(role_repo, test_role):
    """Test updating role details"""
    updated = role_repo.update_role(
        test_role.id,
        name="Updated Role",
        description="Updated Description"
    )
    
    assert updated is not None
    assert updated.name == "Updated Role"
    assert updated.description == "Updated Description"

def test_update_role_permissions(role_repo, test_role, test_permission):
    """Test updating role permissions"""
    updated = role_repo.update_role(
        test_role.id,
        permissions=[{"id": test_permission.id}]
    )
    
    assert updated is not None
    assert len(updated.permissions) == 1
    assert updated.permissions[0].id == test_permission.id

def test_update_nonexistent_role(role_repo):
    """Test updating a nonexistent role"""
    updated = role_repo.update_role(999, name="Updated Role")
    assert updated is None

def test_delete_role(role_repo, test_role):
    """Test deleting a role"""
    success = role_repo.delete_role(test_role.id)
    assert success is True
    
    # Verify deletion
    role = role_repo.get_role(test_role.id)
    assert role is None

def test_delete_nonexistent_role(role_repo):
    """Test deleting a nonexistent role"""
    success = role_repo.delete_role(999)
    assert success is False

def test_add_permission(role_repo, test_role, test_permission):
    """Test adding a permission to a role"""
    success = role_repo.add_permission(test_role.id, test_permission.name)
    assert success is True
    
    # Verify permission was added
    role = role_repo.get_role(test_role.id)
    assert len(role.permissions) == 1
    assert role.permissions[0].id == test_permission.id

def test_add_nonexistent_permission(role_repo, test_role):
    """Test adding a nonexistent permission to a role"""
    success = role_repo.add_permission(test_role.id, "nonexistent_permission")
    assert success is False

def test_remove_permission(role_repo, test_role, test_permission, db):
    """Test removing a permission from a role"""
    # First add the permission
    test_role.permissions.append(test_permission)
    db.commit()
    
    success = role_repo.remove_permission(test_role.id, test_permission.name)
    assert success is True
    
    # Verify permission was removed
    role = role_repo.get_role(test_role.id)
    assert len(role.permissions) == 0

def test_remove_nonexistent_permission(role_repo, test_role):
    """Test removing a nonexistent permission from a role"""
    success = role_repo.remove_permission(test_role.id, "nonexistent_permission")
    assert success is False

def test_get_role_permissions(role_repo, test_role, test_permission, db):
    """Test getting all permissions for a role"""
    # Add permission to role
    test_role.permissions.append(test_permission)
    db.commit()
    
    permissions = role_repo.get_role_permissions(test_role.id)
    assert len(permissions) == 1
    assert permissions[0] == test_permission.name

def test_get_roles_by_organization(role_repo, test_role):
    """Test getting all roles in an organization"""
    roles = role_repo.get_roles_by_organization(test_role.organization_id)
    assert len(roles) == 1
    assert roles[0].id == test_role.id

def test_get_default_role(role_repo, test_organization, db):
    """Test getting the default role for an organization"""
    default_role = Role(
        name="Default Role",
        description="Default Role Description",
        organization_id=test_organization.id,
        is_default=True
    )
    db.add(default_role)
    db.commit()
    
    role = role_repo.get_default_role(test_organization.id)
    assert role is not None
    assert role.is_default is True
    assert role.name == "Default Role"

def test_is_role_in_use(role_repo, test_role, test_organization, db):
    """Test checking if a role is assigned to any users"""
    # Create a test user with the role
    user = User(
        email="test@example.com",
        hashed_password="hashed_password",
        organization_id=test_organization.id,
        role_id=test_role.id
    )
    db.add(user)
    db.commit()
    
    in_use = role_repo.is_role_in_use(test_role.id)
    assert in_use is True

def test_is_role_not_in_use(role_repo, test_role):
    """Test checking if an unused role is in use"""
    in_use = role_repo.is_role_in_use(test_role.id)
    assert in_use is False 
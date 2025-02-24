"""
ChatterMate - Test Roles
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
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.database import Base, get_db
from fastapi import FastAPI
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission, role_permissions
from uuid import UUID, uuid4
from app.api import roles as roles_router
from app.core.auth import get_current_user, require_permissions
from app.main import app
from app.core.config import settings
from tests.conftest import engine, TestingSessionLocal, create_tables

# Create a test FastAPI app
app = FastAPI()
app.include_router(
    roles_router.router,
    prefix=f"{settings.API_V1_STR}/roles",
    tags=["roles"]
)

@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_permissions(db) -> list[Permission]:
    """Create test permissions"""
    permissions = []
    for name in ["manage_roles", "manage_users", "manage_chats"]:
        perm = Permission(
            name=name,
            description=f"Can {name}"
        )
        db.add(perm)
        permissions.append(perm)
    db.commit()
    for p in permissions:
        db.refresh(p)
    return permissions

@pytest.fixture
def test_role(db, test_organization, test_permissions) -> Role:
    """Create a test role with required permissions"""
    role = Role(
        id=1,
        name="Test Role",
        description="Test Role Description",
        organization_id=test_organization.id,
        is_default=False
    )
    db.add(role)
    db.commit()

    # Associate permissions with role
    for perm in test_permissions:
        db.execute(
            role_permissions.insert().values(
                role_id=role.id,
                permission_id=perm.id
            )
        )
    db.commit()
    db.refresh(role)
    return role

@pytest.fixture
def test_user(db: Session, test_organization, test_role: Role) -> User:
    """Create a test user with required permissions"""
    user = User(
        id=uuid4(),
        email="test@test.com",
        hashed_password="hashed_password",
        organization_id=test_organization.id,
        role_id=test_role.id,
        is_active=True,
        full_name="Test User"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def client(test_user: User) -> TestClient:
    """Create test client with mocked dependencies"""
    async def override_get_current_user():
        return test_user

    async def override_require_permissions(*args, **kwargs):
        return test_user

    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[require_permissions] = lambda x: override_require_permissions
    app.dependency_overrides[get_db] = override_get_db
    
    return TestClient(app)

def test_create_role(client: TestClient, test_permissions):
    """Test creating a new role"""
    role_data = {
        "name": "New Role",
        "description": "New role description",
        "is_default": False,
        "permissions": [{"id": perm.id, "name": perm.name, "description": perm.description} for perm in test_permissions[:2]]
    }
    
    response = client.post("/api/v1/roles", json=role_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == role_data["name"]
    assert data["description"] == role_data["description"]
    assert data["is_default"] == role_data["is_default"]
    assert len(data["permissions"]) == 2

def test_create_default_role_when_exists(client: TestClient, test_role, db):
    """Test creating a default role when one already exists"""
    # First make the test_role default
    test_role.is_default = True
    db.commit()
    
    role_data = {
        "name": "Another Default Role",
        "description": "This should fail",
        "is_default": True,
        "permissions": []
    }
    
    response = client.post("/api/v1/roles", json=role_data)
    assert response.status_code == 400
    assert "Organization already has a default role" in response.json()["detail"]

def test_list_roles(client: TestClient, test_role):
    """Test listing all roles"""
    response = client.get("/api/v1/roles")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["name"] == test_role.name
    assert data[0]["description"] == test_role.description

def test_get_role(client: TestClient, test_role):
    """Test getting a specific role"""
    response = client.get(f"/api/v1/roles/{test_role.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == test_role.name
    assert data["description"] == test_role.description

def test_update_role(client: TestClient, test_role, test_permissions):
    """Test updating a role"""
    update_data = {
        "name": "Updated Role Name",
        "description": "Updated description",
        "permissions": [{"id": perm.id, "name": perm.name, "description": perm.description} for perm in test_permissions[:1]]
    }
    
    response = client.put(f"/api/v1/roles/{test_role.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]
    assert len(data["permissions"]) == 1

def test_delete_role(client: TestClient, db, test_organization):
    """Test deleting a role"""
    # Create a new role that won't be used by any users
    role = Role(
        name="Role To Delete",
        description="This role will be deleted",
        organization_id=test_organization.id,
        is_default=False
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    
    response = client.delete(f"/api/v1/roles/{role.id}")
    assert response.status_code == 204

def test_add_permission_to_role(client: TestClient, test_role, test_permissions):
    """Test adding a permission to a role"""
    permission = test_permissions[0]
    response = client.post(f"/api/v1/roles/{test_role.id}/permissions/{permission.name}")
    assert response.status_code == 200
    assert response.json()["message"] == "Permission added to role"

def test_remove_permission_from_role(client: TestClient, test_role, test_permissions):
    """Test removing a permission from a role"""
    permission = test_permissions[0]
    response = client.delete(f"/api/v1/roles/{test_role.id}/permissions/{permission.name}")
    assert response.status_code == 200
    assert response.json()["message"] == "Permission removed from role"

def test_list_permissions(client: TestClient, test_permissions):
    """Test listing all available permissions"""
    response = client.get("/api/v1/roles/permissions/all")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == len(test_permissions)

# Negative test cases

def test_create_role_duplicate_name(client: TestClient, test_role):
    """Test creating a role with duplicate name"""
    role_data = {
        "name": test_role.name,  # Same name as existing role
        "description": "This should fail",
        "is_default": False,
        "permissions": []
    }
    
    response = client.post("/api/v1/roles", json=role_data)
    assert response.status_code == 400
    assert "Role with this name already exists" in response.json()["detail"]

def test_update_default_role(client: TestClient, test_role, db):
    """Test updating a default role"""
    # Make the role default
    test_role.is_default = True
    db.commit()
    
    update_data = {
        "name": "Updated Name",
        "description": "This should fail"
    }
    
    response = client.put(f"/api/v1/roles/{test_role.id}", json=update_data)
    assert response.status_code == 400
    assert "Cannot modify default role" in response.json()["detail"]

def test_delete_default_role(client: TestClient, test_role, db):
    """Test deleting a default role"""
    # Make the role default
    test_role.is_default = True
    db.commit()
    
    response = client.delete(f"/api/v1/roles/{test_role.id}")
    assert response.status_code == 400
    assert "Cannot delete default role" in response.json()["detail"]

def test_delete_role_in_use(client: TestClient, test_role, test_user):
    """Test deleting a role that is assigned to users"""
    response = client.delete(f"/api/v1/roles/{test_role.id}")
    assert response.status_code == 400
    assert "Cannot delete role that is assigned to users" in response.json()["detail"]

def test_get_nonexistent_role(client: TestClient):
    """Test getting a nonexistent role"""
    response = client.get("/api/v1/roles/999")
    assert response.status_code == 404
    assert "Role not found" in response.json()["detail"]

def test_update_nonexistent_role(client: TestClient):
    """Test updating a nonexistent role"""
    update_data = {
        "name": "Updated Name",
        "description": "This should fail"
    }
    
    response = client.put("/api/v1/roles/999", json=update_data)
    assert response.status_code == 404
    assert "Role not found" in response.json()["detail"]

def test_delete_nonexistent_role(client: TestClient):
    """Test deleting a nonexistent role"""
    response = client.delete("/api/v1/roles/999")
    assert response.status_code == 404
    assert "Role not found" in response.json()["detail"]

def test_add_invalid_permission(client: TestClient, test_role):
    """Test adding an invalid permission to a role"""
    response = client.post(f"/api/v1/roles/{test_role.id}/permissions/invalid_permission")
    assert response.status_code == 404
    assert "Permission not found" in response.json()["detail"]

def test_remove_invalid_permission(client: TestClient, test_role):
    """Test removing an invalid permission from a role"""
    response = client.delete(f"/api/v1/roles/{test_role.id}/permissions/invalid_permission")
    assert response.status_code == 404
    assert "Permission not found" in response.json()["detail"] 
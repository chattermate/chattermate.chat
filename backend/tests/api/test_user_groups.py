"""
ChatterMate - Test User Groups
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
from app.models.user import User, UserGroup
from app.models.role import Role
from app.models.permission import Permission
from uuid import UUID, uuid4
from app.api import user_groups as user_groups_router
from app.core.auth import get_current_user, require_permissions
from app.main import app
from app.core.config import settings
from app.core.security import get_password_hash
from tests.conftest import engine, TestingSessionLocal, create_tables, test_organization

# Create a test FastAPI app
app = FastAPI()
app.include_router(
    user_groups_router.router,
    prefix=f"{settings.API_V1_STR}/groups",
    tags=["groups"]
)

@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test."""
    # Drop all tables first
    Base.metadata.drop_all(bind=engine)
    # Create tables except enterprise ones
    create_tables()
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_role(db: Session, test_organization) -> Role:
    """Create a test role with required permissions"""
    role = Role(
        name="Test Role",
        organization_id=test_organization.id
    )
    db.add(role)
    db.commit()

    # Add required permissions
    permission = Permission(
        name="manage_users",
        description="Can manage users and groups"
    )
    db.add(permission)
    db.commit()

    # Associate permission with role
    role.permissions.append(permission)
    db.commit()

    return role

@pytest.fixture
def test_user(db: Session, test_organization, test_role: Role) -> User:
    """Create a test user with required permissions"""
    user = User(
        id=uuid4(),
        email="test@test.com",
        hashed_password=get_password_hash("testpassword"),
        organization_id=test_organization.id,
        role_id=test_role.id,
        is_active=True
    )
    db.add(user)
    db.commit()
    return user

@pytest.fixture
def test_group(db: Session, test_organization) -> UserGroup:
    """Create a test user group"""
    group = UserGroup(
        name="Test Group",
        description="Test group description",
        organization_id=test_organization.id
    )
    db.add(group)
    db.commit()
    return group

@pytest.fixture
def client(test_user: User) -> TestClient:
    """Create test client with mocked dependencies"""
    async def override_get_current_user():
        return test_user

    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_db] = override_get_db
    
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def test_list_groups(client: TestClient, test_group: UserGroup):
    """Test listing all groups in the organization"""
    response = client.get("/api/v1/groups")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["name"] == test_group.name
    assert data[0]["description"] == test_group.description

def test_create_group(client: TestClient, test_organization_id: UUID):
    """Test creating a new group"""
    group_data = {
        "name": "New Test Group",
        "description": "New test group description"
    }
    response = client.post("/api/v1/groups", json=group_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == group_data["name"]
    assert data["description"] == group_data["description"]
    assert UUID(data["organization_id"]) == test_organization_id

def test_get_group(client: TestClient, test_group: UserGroup):
    """Test getting a specific group"""
    response = client.get(f"/api/v1/groups/{test_group.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == test_group.name
    assert data["description"] == test_group.description

def test_update_group(client: TestClient, test_group: UserGroup):
    """Test updating a group"""
    update_data = {
        "name": "Updated Group Name",
        "description": "Updated group description"
    }
    response = client.put(f"/api/v1/groups/{test_group.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]

def test_delete_group(client: TestClient, test_group: UserGroup):
    """Test deleting a group"""
    response = client.delete(f"/api/v1/groups/{test_group.id}")
    assert response.status_code == 204

def test_add_user_to_group(client: TestClient, test_group: UserGroup, test_user: User):
    """Test adding a user to a group"""
    response = client.post(f"/api/v1/groups/{test_group.id}/users/{test_user.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "User added to group"

def test_remove_user_from_group(client: TestClient, test_group: UserGroup, test_user: User, db: Session):
    """Test removing a user from a group"""
    # First add the user to the group
    test_group.users.append(test_user)
    db.commit()
    
    response = client.delete(f"/api/v1/groups/{test_group.id}/users/{test_user.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "User removed from group"

def test_get_nonexistent_group(client: TestClient):
    """Test getting a nonexistent group"""
    nonexistent_id = uuid4()
    response = client.get(f"/api/v1/groups/{nonexistent_id}")
    assert response.status_code == 404

def test_update_nonexistent_group(client: TestClient):
    """Test updating a nonexistent group"""
    nonexistent_id = uuid4()
    update_data = {
        "name": "Updated Name",
        "description": "Updated description"
    }
    response = client.put(f"/api/v1/groups/{nonexistent_id}", json=update_data)
    assert response.status_code == 404

def test_delete_nonexistent_group(client: TestClient):
    """Test deleting a nonexistent group"""
    nonexistent_id = uuid4()
    response = client.delete(f"/api/v1/groups/{nonexistent_id}")
    assert response.status_code == 404

def test_add_user_to_nonexistent_group(client: TestClient, test_user: User):
    """Test adding a user to a nonexistent group"""
    nonexistent_id = uuid4()
    response = client.post(f"/api/v1/groups/{nonexistent_id}/users/{test_user.id}")
    assert response.status_code == 404

def test_remove_user_from_nonexistent_group(client: TestClient, test_user: User):
    """Test removing a user from a nonexistent group"""
    nonexistent_id = uuid4()
    response = client.delete(f"/api/v1/groups/{nonexistent_id}/users/{test_user.id}")
    assert response.status_code == 404 
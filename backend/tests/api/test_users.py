"""
ChatterMate - Test Users
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
from unittest.mock import patch, MagicMock

from app.database import Base, get_db
from fastapi import FastAPI, HTTPException
from app.models.user import User, UserGroup
from app.models.role import Role
from app.models.permission import Permission, role_permissions
from uuid import UUID, uuid4
from app.api import users as users_router
from app.core.auth import get_current_user, require_permissions
from app.main import app
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from datetime import datetime, timedelta
import json
from urllib.parse import unquote
from tests.conftest import engine, TestingSessionLocal, create_tables, test_organization

# Create a test FastAPI app
app = FastAPI()
app.include_router(
    users_router.router,
    prefix=f"{settings.API_V1_STR}/users",
    tags=["users"]
)

# Mock enterprise functionality
users_router.HAS_ENTERPRISE = False

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
def test_permissions(db) -> list[Permission]:
    """Create test permissions"""
    permissions = []
    for name in ["manage_users", "manage_chats"]:
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
        organization_id=test_organization.id
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
        hashed_password=get_password_hash("testpassword"),
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

    async def override_require_permissions(required_permissions: list[str] = None):
        if required_permissions and "manage_users" in required_permissions:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions"
            )
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
    
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture
def admin_client(test_user: User) -> TestClient:
    """Create test client with admin permissions"""
    async def override_get_current_user():
        return test_user

    async def override_require_permissions(required_permissions: list[str] = None):
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
    
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def test_create_user(admin_client: TestClient, test_role: Role, test_organization):
    """Test creating a new user"""
    user_data = {
        "email": "newuser@test.com",
        "full_name": "New Test User",
        "password": "testpassword123",
        "is_active": True,
        "role_id": test_role.id,
        "organization_id": str(test_organization.id)
    }
    response = admin_client.post("/api/v1/users", json=user_data)
    assert response.status_code == 200  # User creation should succeed
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["full_name"] == user_data["full_name"]
    assert data["is_active"] == user_data["is_active"]

def test_create_user_duplicate_email(client: TestClient, test_user: User, test_role: Role):
    """Test creating a user with duplicate email"""
    user_data = {
        "email": test_user.email,
        "full_name": "Another User",
        "password": "testpassword123",
        "is_active": True,
        "role_id": test_role.id
    }
    response = client.post("/api/v1/users", json=user_data)
    assert response.status_code == 400  # Bad request for duplicate email
    assert "Email already registered" in response.json()["detail"]

def test_list_users(client: TestClient, test_user: User):
    """Test listing all users in the organization"""
    response = client.get("/api/v1/users")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["email"] == test_user.email

def test_get_user(client: TestClient, test_user: User):
    """Test getting a specific user"""
    response = client.get(f"/api/v1/users/{test_user.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email
    assert data["full_name"] == test_user.full_name

def test_update_user(client: TestClient, test_user: User):
    """Test updating a user"""
    update_data = {
        "full_name": "Updated Name",
        "is_active": True
    }
    response = client.put(f"/api/v1/users/{test_user.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == update_data["full_name"]
    assert data["is_active"] == update_data["is_active"]

def test_delete_user(client: TestClient, db: Session, test_organization, test_role: Role):
    """Test deleting a user"""
    # Create a user to delete
    user_to_delete = User(
        id=uuid4(),
        email="delete@test.com",
        hashed_password=get_password_hash("testpassword"),
        organization_id=test_organization.id,
        role_id=test_role.id,
        is_active=True
    )
    db.add(user_to_delete)
    db.commit()
    db.refresh(user_to_delete)

    response = client.delete(f"/api/v1/users/{user_to_delete.id}")
    assert response.status_code == 204

def test_login_success(client: TestClient, test_user: User):
    """Test successful login"""
    response = client.post(
        "/api/v1/users/login",
        data={
            "username": test_user.email,
            "password": "testpassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == test_user.email

    # Check cookies
    cookies = response.cookies
    assert "access_token" in cookies
    assert "refresh_token" in cookies
    assert "user_info" in cookies

def test_login_invalid_credentials(client: TestClient):
    """Test login with invalid credentials"""
    response = client.post(
        "/api/v1/users/login",
        data={
            "username": "wrong@email.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401

def test_refresh_token(client: TestClient, test_user: User):
    """Test token refresh"""
    # First login to get tokens
    login_response = client.post(
        "/api/v1/users/login",
        data={
            "username": test_user.email,
            "password": "testpassword"
        }
    )
    
    # Get refresh token from cookie
    refresh_token = login_response.cookies.get("refresh_token")
    
    # Test refresh endpoint
    response = client.post(
        "/api/v1/users/refresh",
        cookies={"refresh_token": refresh_token}
    )
    assert response.status_code == 200  # Token refresh should succeed
    assert "access_token" in response.json()
    assert "refresh_token" in response.json()
    assert response.cookies.get("access_token") is not None
    assert response.cookies.get("refresh_token") is not None

def test_logout(client: TestClient, test_user: User):
    """Test logout"""
    response = client.post("/api/v1/users/logout")
    assert response.status_code == 200
    
    # Check that cookies are cleared
    for cookie in ["access_token", "refresh_token", "user_info"]:
        assert response.cookies.get(cookie) is None or response.cookies[cookie].value == ""

def test_update_profile(client: TestClient, test_user: User):
    """Test updating user's own profile"""
    update_data = {
        "full_name": "Updated Profile Name",
        "email": "updated@test.com"
    }
    response = client.patch("/api/v1/users/me", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == update_data["full_name"]
    assert data["email"] == update_data["email"]

def test_update_password(client: TestClient, test_user: User):
    """Test updating user's password"""
    update_data = {
        "current_password": "testpassword",
        "password": "newpassword123"
    }
    response = client.patch("/api/v1/users/me", json=update_data)
    assert response.status_code == 200

def test_update_status(client: TestClient, test_user: User):
    """Test updating user's online status"""
    status_data = {
        "is_online": True
    }
    response = client.post(f"/api/v1/users/{test_user.id}/status", json=status_data)
    assert response.status_code == 200
    data = response.json()
    assert data["is_online"] == status_data["is_online"]
    assert "last_seen" in data

def test_get_nonexistent_user(client: TestClient):
    """Test getting a nonexistent user"""
    nonexistent_id = uuid4()
    response = client.get(f"/api/v1/users/{nonexistent_id}")
    assert response.status_code == 404

def test_update_nonexistent_user(client: TestClient):
    """Test updating a nonexistent user"""
    nonexistent_id = uuid4()
    update_data = {
        "full_name": "Updated Name"
    }
    response = client.put(f"/api/v1/users/{nonexistent_id}", json=update_data)
    assert response.status_code == 404

def test_delete_nonexistent_user(client: TestClient):
    """Test deleting a nonexistent user"""
    nonexistent_id = uuid4()
    response = client.delete(f"/api/v1/users/{nonexistent_id}")
    assert response.status_code == 404

def test_update_fcm_token(client: TestClient, test_user: User):
    """Test updating FCM token"""
    token_data = {
        "token": "test_fcm_token_123"
    }
    response = client.post("/api/v1/users/token/fcm-token", json=token_data)
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "FCM token updated successfully"

def test_clear_fcm_token(client: TestClient, test_user: User, db: Session):
    """Test clearing FCM token"""
    # First set a token
    test_user.fcm_token_web = "test_token"
    db.commit()

    response = client.delete("/api/v1/users/token/fcm-token")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "FCM token cleared successfully" 
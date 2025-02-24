"""
ChatterMate - Organization API Tests
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
from app.database import get_db
from fastapi import FastAPI
from app.models.user import User
from app.models.organization import Organization
from app.models.role import Role
from app.models.permission import Permission, role_permissions
from uuid import UUID, uuid4
from datetime import datetime, timezone
from app.api import organizations as organizations_router
from app.core.auth import get_current_user, require_permissions
from tests.conftest import engine, TestingSessionLocal, create_tables, Base

# Create a test FastAPI app
app = FastAPI()
app.include_router(
    organizations_router.router,
    prefix="/api/v1/organizations",  # Match the prefix in main.py
    tags=["organizations"]
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
def test_permissions(db) -> list[Permission]:
    """Create test permissions"""
    permissions = []
    for name in ["manage_organization", "view_organization"]:
        perm = Permission(
            name=name,
            description=f"Test permission for {name}"
        )
        db.add(perm)
        permissions.append(perm)
    db.commit()
    for p in permissions:
        db.refresh(p)
    return permissions

@pytest.fixture
def test_role(db, test_permissions) -> Role:
    """Create a test role with required permissions"""
    role = Role(
        id=1,
        name="Test Role",
        description="Test Role Description",
        is_default=True
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
def test_organization(db) -> Organization:
    """Create a test organization"""
    org = Organization(
        id=uuid4(),
        name="Test Organization",
        domain="test.com",
        timezone="UTC",
        business_hours={
            "monday": {"start": "09:00", "end": "17:00", "enabled": True},
            "tuesday": {"start": "09:00", "end": "17:00", "enabled": True},
            "wednesday": {"start": "09:00", "end": "17:00", "enabled": True},
            "thursday": {"start": "09:00", "end": "17:00", "enabled": True},
            "friday": {"start": "09:00", "end": "17:00", "enabled": True},
            "saturday": {"start": "09:00", "end": "17:00", "enabled": False},
            "sunday": {"start": "09:00", "end": "17:00", "enabled": False}
        },
        settings={},
        is_active=True
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org

@pytest.fixture
def test_user(db, test_role, test_organization) -> User:
    """Create a test user with required permissions"""
    user = User(
        id=uuid4(),
        email="test@example.com",
        hashed_password="hashed_password",
        is_active=True,
        organization_id=test_organization.id,
        full_name="Test User",
        role_id=test_role.id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def client(test_user) -> TestClient:
    """Create test client with mocked dependencies"""
    async def override_get_current_user():
        return test_user

    async def override_require_permissions(*args, **kwargs):
        return test_user

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[require_permissions] = override_require_permissions
    app.dependency_overrides[get_db] = lambda: TestingSessionLocal()
    
    return TestClient(app)

# Test cases
def test_create_organization(client, db):
    """Test creating a new organization"""
    # Delete existing users and organization first since we only allow one
    db.query(User).delete()
    db.query(Organization).delete()
    db.commit()
    
    org_data = {
        "name": "New Organization",
        "domain": "new.com",
        "timezone": "UTC",
        "business_hours": {
            "monday": {"start": "09:00", "end": "17:00", "enabled": True},
            "tuesday": {"start": "09:00", "end": "17:00", "enabled": True},
            "wednesday": {"start": "09:00", "end": "17:00", "enabled": True},
            "thursday": {"start": "09:00", "end": "17:00", "enabled": True},
            "friday": {"start": "09:00", "end": "17:00", "enabled": True},
            "saturday": {"start": "09:00", "end": "17:00", "enabled": False},
            "sunday": {"start": "09:00", "end": "17:00", "enabled": False}
        },
        "admin_email": "admin@new.com",
        "admin_name": "Admin User",
        "admin_password": "adminpass123"
        
    }

    response = client.post("/api/v1/organizations", json=org_data)
    assert response.status_code == 201
    data = response.json()
    
    # Basic organization data validation
    assert data["name"] == org_data["name"]
    assert data["domain"] == org_data["domain"]
    assert data["timezone"] == org_data["timezone"]
    assert data["business_hours"] == org_data["business_hours"]
    assert data["settings"] == {}
    assert data["is_active"] == True
    assert "id" in data
    
    # Token validation
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    
    # User validation
    assert "user" in data
    user = data["user"]
    assert user["email"] == org_data["admin_email"]
    assert user["full_name"] == org_data["admin_name"]
    assert "id" in user
    assert "organization_id" in user
    assert user["organization_id"] == data["id"]  # User org ID should match org ID
    
    # Role validation
    assert "role" in user
    role = user["role"]
    assert role["name"] == "Admin"
    assert isinstance(role["id"], int)
    
    # Verify the role in database
    db_role = db.query(Role).filter(Role.id == role["id"]).first()
    assert db_role is not None


def test_get_organization(client, test_organization):
    """Test getting organization by ID"""
    response = client.get(f"/api/v1/organizations/{test_organization.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_organization.id)
    assert data["name"] == test_organization.name
    assert data["domain"] == test_organization.domain

def test_update_organization(client, test_organization):
    """Test updating organization details"""
    update_data = {
        "name": "Updated Organization",
        "business_hours": {
            "monday": {"start": "08:00", "end": "16:00", "enabled": True},
            "tuesday": {"start": "08:00", "end": "16:00", "enabled": True},
            "wednesday": {"start": "08:00", "end": "16:00", "enabled": True},
            "thursday": {"start": "08:00", "end": "16:00", "enabled": True},
            "friday": {"start": "08:00", "end": "16:00", "enabled": True},
            "saturday": {"start": "09:00", "end": "17:00", "enabled": False},
            "sunday": {"start": "09:00", "end": "17:00", "enabled": False}
        }
    }

    response = client.patch(f"/api/v1/organizations/{test_organization.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["business_hours"]["monday"]["start"] == "08:00"

def test_delete_organization(client, test_organization):
    """Test deleting (soft-delete) organization"""
    response = client.delete(f"/api/v1/organizations/{test_organization.id}")
    assert response.status_code == 204

    # Verify organization is soft-deleted
    org = client.get(f"/api/v1/organizations/{test_organization.id}").json()
    assert not org["is_active"]

def test_get_organization_stats(client, test_organization, test_user):
    """Test getting organization statistics"""
    response = client.get(f"/api/v1/organizations/{test_organization.id}/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_users" in data
    assert "active_users" in data
    assert data["total_users"] == 1
    assert data["active_users"] == 1

def test_list_organizations(client, test_organization):
    """Test listing all organizations"""
    response = client.get("/api/v1/organizations")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(org["id"] == str(test_organization.id) for org in data)

# Negative test cases
def test_create_organization_duplicate(client, test_organization):
    """Test creating organization when one already exists"""
    org_data = {
        "name": "Another Organization",
        "domain": "another.com",
        "timezone": "UTC",
        "business_hours": {
            "monday": {"start": "09:00", "end": "17:00", "enabled": True},
            "tuesday": {"start": "09:00", "end": "17:00", "enabled": True},
            "wednesday": {"start": "09:00", "end": "17:00", "enabled": True},
            "thursday": {"start": "09:00", "end": "17:00", "enabled": True},
            "friday": {"start": "09:00", "end": "17:00", "enabled": True},
            "saturday": {"start": "09:00", "end": "17:00", "enabled": False},
            "sunday": {"start": "09:00", "end": "17:00", "enabled": False}
        },
        "admin_email": "admin@another.com",
        "admin_name": "Another Admin",
        "admin_password": "adminpass123"
    }

    response = client.post("/api/v1/organizations", json=org_data)
    assert response.status_code == 403
    assert "Organization already exists" in response.json()["detail"]

def test_update_organization_invalid_hours(client, test_organization):
    """Test updating organization with invalid business hours"""
    update_data = {
        "business_hours": {
            "monday": {"start": "25:00", "end": "17:00", "enabled": True},  # Invalid hour
            "tuesday": {"start": "09:00", "end": "17:00", "enabled": True},
            "wednesday": {"start": "09:00", "end": "17:00", "enabled": True},
            "thursday": {"start": "09:00", "end": "17:00", "enabled": True},
            "friday": {"start": "09:00", "end": "17:00", "enabled": True},
            "saturday": {"start": "09:00", "end": "17:00", "enabled": False},
            "sunday": {"start": "09:00", "end": "17:00", "enabled": False}
        }
    }

    response = client.patch(f"/api/v1/organizations/{test_organization.id}", json=update_data)
    assert response.status_code == 400
    assert "Invalid time format" in response.json()["detail"]

def test_get_nonexistent_organization(client):
    """Test getting a non-existent organization"""
    response = client.get(f"/api/v1/organizations/{uuid4()}")
    assert response.status_code == 404
    assert "Organization not found" in response.json()["detail"] 
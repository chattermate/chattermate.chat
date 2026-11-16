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
from fastapi.testclient import TestClient
from app.database import get_db
from fastapi import FastAPI
from app.models.user import User
from app.models.organization import Organization
from app.models.role import Role
from app.models.auth_session import AuthSession
from app.core.security import verify_token
from app.models.permission import (
    Permission,
    role_permissions,
    DEFAULT_AGENT_ROLE_PERMISSIONS,
)
from uuid import UUID, uuid4
from datetime import datetime, timezone
from app.api import organizations as organizations_router
from app.repositories.agent import AgentRepository
from app.utils.domain_check import LOCALHOST_DOMAIN_MESSAGE, WEBSITE_INVALID_MESSAGE, WEBSITE_REQUIRED_MESSAGE
from app.core.auth import get_current_user, require_permissions
from tests.conftest import engine, TestingSessionLocal, create_tables, Base

# The disposable-address gate is enterprise-only; a community checkout has no
# blocklist and accepts everything.
try:
    from app.enterprise.services.email_validation import DISPOSABLE_EMAIL_MESSAGE

    HAS_EMAIL_VALIDATION = True
except ImportError:
    DISPOSABLE_EMAIL_MESSAGE = ""
    HAS_EMAIL_VALIDATION = False

requires_email_validation = pytest.mark.skipif(
    not HAS_EMAIL_VALIDATION, reason="enterprise email validation not installed"
)


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
def test_create_organization(client, db, monkeypatch):
    """Test creating a new organization"""
    # Delete existing users and organization first since we only allow one
    # We need to override the dependency to use our test session
    app.dependency_overrides[get_db] = lambda: db
    
    # Delete users first (due to foreign key constraints)
    db.query(User).delete()
    db.commit()
    
    # Then delete organizations
    db.query(Organization).delete()
    db.commit()
    
    # Mock the agent repository to avoid SQLite issues with JSON
    from app.repositories.agent import AgentRepository
    original_create_agent = AgentRepository.create_agent
    
    def mock_create_agent(self, **kwargs):
        # Skip agent creation in tests
        return None
    
    monkeypatch.setattr(AgentRepository, "create_agent", mock_create_agent)
    
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

    # Both tokens belong to the admin's first session, so signing out ends them
    sid = verify_token(data["access_token"])["sid"]
    assert verify_token(data["refresh_token"])["sid"] == sid
    session = db.query(AuthSession).filter(AuthSession.id == UUID(sid)).one()
    assert str(session.user_id) == data["user"]["id"]
    
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

    # The seeded roles, pinned. The hosted seeder drifted from this one for a
    # year — two permissions instead of four, and both roles is_default — and
    # nothing here failed, because the only claim made was the Admin name.
    # Every assertion below is one that drift broke.
    roles = db.query(Role).filter(Role.organization_id == UUID(data["id"])).all()
    by_name = {r.name: r for r in roles}
    assert set(by_name) == {"Admin", "Agent"}

    # Exactly one default: get_default_role() takes .first() with no ordering,
    # so a second one means an invited user can land on Admin.
    assert [r.name for r in roles if r.is_default] == ["Agent"]

    assert {p.name for p in by_name["Agent"].permissions} == set(
        DEFAULT_AGENT_ROLE_PERMISSIONS
    )
    assert {p.name for p in by_name["Admin"].permissions} == {
        name for name, _ in Permission.default_permissions()
    }


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

def test_renaming_the_organization_renames_it_in_agent_copy(client, db, test_organization, test_agent):
    test_agent.description = "Answers questions about Test Organization."
    db.commit()

    response = client.patch(f"/api/v1/organizations/{test_organization.id}", json={"name": "GlideShip"})

    assert response.status_code == 200
    db.refresh(test_agent)
    assert test_agent.description == "Answers questions about GlideShip."

# def test_delete_organization(client, test_organization):
#     """Test deleting (soft-delete) organization"""
#     response = client.delete(f"/api/v1/organizations/{test_organization.id}")
#     assert response.status_code == 204

#     # Verify organization is soft-deleted
#     org = client.get(f"/api/v1/organizations/{test_organization.id}").json()
#     assert not org["is_active"]

def test_get_organization_stats(client, test_organization, test_user):
    """Test getting organization statistics"""
    response = client.get(f"/api/v1/organizations/{test_organization.id}/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_users" in data
    assert "active_users" in data
    assert data["total_users"] == 1
    assert data["active_users"] == 1


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

@requires_email_validation
def test_create_organization_rejects_disposable_admin_email(client, db):
    """Signup with a throwaway admin address is refused and creates nothing"""
    app.dependency_overrides[get_db] = lambda: db

    db.query(User).delete()
    db.commit()
    db.query(Organization).delete()
    db.commit()

    org_data = {
        "name": "Throwaway Org",
        "domain": "throwaway.com",
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
        "admin_email": "someone@yopmail.com",
        "admin_name": "Throwaway Admin",
        "admin_password": "adminpass123"
    }

    response = client.post("/api/v1/organizations", json=org_data)
    assert response.status_code == 400
    assert response.json()["detail"] == DISPOSABLE_EMAIL_MESSAGE
    assert db.query(Organization).count() == 0
    assert db.query(User).count() == 0


def _first_run_setup(client, db, domain):
    """POST the first-run setup form on an empty install."""
    app.dependency_overrides[get_db] = lambda: db
    db.query(User).delete()
    db.query(Organization).delete()
    db.commit()
    return client.post("/api/v1/organizations", json={
        "name": "First Org",
        "domain": domain,
        "timezone": "UTC",
        "admin_email": "admin@first.example",
        "admin_name": "First Admin",
        "admin_password": "adminpass123",
    })


@pytest.mark.parametrize("typed, message", [
    ("localhost:5173", LOCALHOST_DOMAIN_MESSAGE),
    ("acme .com", WEBSITE_INVALID_MESSAGE),
    ("", WEBSITE_REQUIRED_MESSAGE),
])
def test_first_run_setup_checks_the_website_and_creates_nothing(client, db, typed, message):
    response = _first_run_setup(client, db, typed)

    assert response.status_code == 400
    assert response.json()["detail"] == message
    assert db.query(Organization).count() == 0
    assert db.query(User).count() == 0


def test_first_run_setup_stores_the_website_as_its_host(client, db, monkeypatch):
    monkeypatch.setattr(AgentRepository, "create_agent", lambda self, **kwargs: None)

    response = _first_run_setup(client, db, "https://WWW.First.example/pricing")

    assert response.status_code == 201
    assert response.json()["domain"] == "www.first.example"


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

@pytest.fixture
def other_organization(db) -> Organization:
    """An organization the test user does not belong to"""
    org = Organization(
        id=uuid4(),
        name="Other Organization",
        domain="other.example.com",
        timezone="UTC",
        business_hours={},
        settings={},
        is_active=True
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


def test_get_another_organization_is_not_found(client, other_organization):
    """Reading another tenant's organization record is refused"""
    response = client.get(f"/api/v1/organizations/{other_organization.id}")

    assert response.status_code == 404
    assert "Organization not found" in response.json()["detail"]


def test_update_another_organization_is_not_found(client, db, other_organization):
    """The domain (and therefore CORS) of another tenant can't be rewritten"""
    original_domain = other_organization.domain

    response = client.patch(
        f"/api/v1/organizations/{other_organization.id}",
        json={"name": "Hijacked", "domain": "attacker.example.com"}
    )

    assert response.status_code == 404
    db.refresh(other_organization)
    assert other_organization.domain == original_domain
    assert other_organization.name == "Other Organization"


def test_get_another_organizations_stats_is_not_found(client, other_organization):
    """Headcount and conversation volumes stay inside the tenant"""
    response = client.get(f"/api/v1/organizations/{other_organization.id}/stats")

    assert response.status_code == 404


@pytest.mark.parametrize("domain", ["other.example.com", "Other.Example.COM"])
def test_two_organizations_may_share_a_website(client, db, test_organization, other_organization, domain):
    """The widget is framed from our origin, so an org's website needn't be its own:
    an agency and its client, or two teams on one site, can both name it"""
    response = client.patch(
        f"/api/v1/organizations/{test_organization.id}",
        json={"domain": domain}
    )

    assert response.status_code == 200
    db.refresh(test_organization)
    assert test_organization.domain == "other.example.com"


def test_update_organization_keeps_own_domain(client, test_organization, other_organization):
    """Saving the form with the org's current domain unchanged is fine"""
    response = client.patch(
        f"/api/v1/organizations/{test_organization.id}",
        json={"name": "Renamed", "domain": test_organization.domain}
    )

    assert response.status_code == 200
    assert response.json()["domain"] == "test.com"
    assert response.json()["name"] == "Renamed"


def test_a_new_website_is_stored_as_its_host(client, db, test_organization):
    response = client.patch(
        f"/api/v1/organizations/{test_organization.id}",
        json={"domain": "  https://Fresh.Example.com/pricing?x=1  "}
    )

    assert response.status_code == 200
    assert response.json()["domain"] == "fresh.example.com"
    db.refresh(test_organization)
    assert test_organization.domain == "fresh.example.com"


@pytest.mark.parametrize("website, detail", [
    ("", "Your website is required"),
    ("   ", "Your website is required"),
    (None, "Your website is required"),
    ("a]b.com", "Please enter your website, like yourwebsite.com"),
    ("intranet", "Please enter your website, like yourwebsite.com"),
    ("a" * 120 + ".com", "Please enter your website, like yourwebsite.com"),
])
def test_a_website_that_cant_be_stored_is_refused_plainly(client, db, test_organization, website, detail):
    response = client.patch(f"/api/v1/organizations/{test_organization.id}", json={"domain": website})

    assert response.status_code == 400
    assert response.json()["detail"] == detail
    db.refresh(test_organization)
    assert test_organization.domain == "test.com"


@pytest.mark.parametrize("domain", ["localhost", "LocalHost", "localhost:3000", "http://localhost:5173", "127.0.0.1",
                                    "www.localhost", "app.localhost", "0.0.0.0", "[::1]:8000"])
def test_update_organization_localhost_domain_is_refused(client, db, test_organization, domain):
    """Localhost is refused as an org domain with a plain message"""
    response = client.patch(
        f"/api/v1/organizations/{test_organization.id}",
        json={"domain": domain}
    )

    assert response.status_code == 400
    assert response.json()["detail"] == LOCALHOST_DOMAIN_MESSAGE
    db.refresh(test_organization)
    assert test_organization.domain == "test.com"


def test_update_organization_keeps_existing_localhost_domain(client, db, test_organization):
    """An org already on localhost can still save other changes"""
    test_organization.domain = "localhost"
    db.commit()

    response = client.patch(
        f"/api/v1/organizations/{test_organization.id}",
        json={"name": "Renamed", "domain": "localhost"}
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Renamed"


def test_update_organization_localhost_lookalike_is_allowed(client, test_organization):
    """Only the host itself counts, not domains that merely contain the word"""
    response = client.patch(
        f"/api/v1/organizations/{test_organization.id}",
        json={"domain": "localhost.example.com"}
    )

    assert response.status_code == 200

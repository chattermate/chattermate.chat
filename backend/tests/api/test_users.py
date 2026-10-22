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
from sqlalchemy.orm import Session
from unittest.mock import patch, MagicMock

from app.database import Base, get_db
from fastapi import FastAPI, HTTPException
from app.models.user import User, UserGroup
from app.models.fcm_token import FCMToken
from app.models.organization import Organization
from app.models.shopify.shopify_shop import ShopifyShop
from app.models.role import Role
from app.models.auth_session import AuthSession
from app.models.user_identity import UserIdentity
from app.services.auth_sessions import issue_tokens, session_id_of
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
        "password": "TestPassw0rd!",
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

def test_create_user_rejects_weak_password(admin_client: TestClient, db: Session, test_role: Role, test_organization):
    """An invite has to clear the same password policy as a reset"""
    user_data = {
        "email": "weakpass@test.com",
        "full_name": "Weak Password User",
        "password": "short1",
        "is_active": True,
        "role_id": test_role.id,
        "organization_id": str(test_organization.id)
    }
    response = admin_client.post("/api/v1/users", json=user_data)

    assert response.status_code == 422
    assert db.query(User).filter(User.email == "weakpass@test.com").first() is None


def test_create_user_duplicate_email(client: TestClient, test_user: User, test_role: Role):
    """Test creating a user with duplicate email"""
    user_data = {
        "email": test_user.email,
        "full_name": "Another User",
        "password": "TestPassw0rd!",
        "is_active": True,
        "role_id": test_role.id
    }
    response = client.post("/api/v1/users", json=user_data)
    assert response.status_code == 400  # Bad request for duplicate email
    assert "Email already registered" in response.json()["detail"]

@requires_email_validation
def test_create_user_rejects_disposable_email(admin_client: TestClient, test_role: Role, test_organization):
    """Test that an invited teammate cannot be created on a throwaway domain"""
    user_data = {
        "email": "someone@yopmail.com",
        "full_name": "Throwaway User",
        "password": "TestPassw0rd!",
        "is_active": True,
        "role_id": test_role.id,
        "organization_id": str(test_organization.id)
    }
    response = admin_client.post("/api/v1/users", json=user_data)
    assert response.status_code == 400
    assert response.json()["detail"] == DISPOSABLE_EMAIL_MESSAGE

@requires_email_validation
def test_update_user_rejects_disposable_email(client: TestClient, test_user: User):
    """Test that an existing account cannot be moved onto a throwaway domain"""
    response = client.put(
        f"/api/v1/users/{test_user.id}",
        json={"email": "someone@dropmail.me"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == DISPOSABLE_EMAIL_MESSAGE

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

def _sso_only(monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_SSO_CLIENT_ID", "google-client")
    monkeypatch.setattr(settings, "GOOGLE_SSO_CLIENT_SECRET", "google-secret")
    monkeypatch.setattr(settings, "PASSWORD_LOGIN_ENABLED", False)


def _link_google(db: Session, user: User) -> UserIdentity:
    link = UserIdentity(user_id=user.id, provider="google", issuer="https://accounts.google.com", subject="g-1", email=user.email)
    db.add(link)
    db.commit()
    return link


def test_sso_only_refuses_the_password_of_someone_who_signs_in_with_sso(client: TestClient, db: Session, test_user: User, monkeypatch):
    _sso_only(monkeypatch)
    _link_google(db, test_user)
    response = client.post(
        "/api/v1/users/login",
        data={"username": test_user.email, "password": "testpassword"},
    )
    assert response.status_code == 403
    assert "single sign-on" in response.json()["detail"]
    assert "access_token" not in response.cookies


def test_sso_only_still_lets_someone_not_linked_yet_in(client: TestClient, test_user: User, monkeypatch):
    """Nobody is locked out while their provider can't (yet) vouch for them."""
    _sso_only(monkeypatch)
    response = client.post(
        "/api/v1/users/login",
        data={"username": test_user.email, "password": "testpassword"},
    )
    assert response.status_code == 200


def test_sso_only_never_reveals_a_wrong_password_as_refused(client: TestClient, db: Session, test_user: User, monkeypatch):
    _sso_only(monkeypatch)
    _link_google(db, test_user)
    response = client.post("/api/v1/users/login", data={"username": test_user.email, "password": "wrong"})
    assert response.status_code == 401


def test_login_still_works_when_switched_off_without_a_provider(client: TestClient, test_user: User, monkeypatch):
    for name in ("GOOGLE_SSO_CLIENT_ID", "GOOGLE_SSO_CLIENT_SECRET", "MICROSOFT_SSO_CLIENT_ID", "MICROSOFT_SSO_CLIENT_SECRET"):
        monkeypatch.setattr(settings, name, "")
    monkeypatch.setattr(settings, "PASSWORD_LOGIN_ENABLED", False)
    response = client.post(
        "/api/v1/users/login",
        data={"username": test_user.email, "password": "testpassword"},
    )
    assert response.status_code == 200


def test_login_records_how_and_ends_the_browsers_previous_session(client: TestClient, db: Session, test_user: User):
    first = client.post("/api/v1/users/login", data={"username": test_user.email, "password": "testpassword"})
    first_sid = session_id_of(first.json()["access_token"])
    client.cookies.set("access_token", first.json()["access_token"])
    second = client.post("/api/v1/users/login", data={"username": test_user.email, "password": "testpassword"})
    assert second.status_code == 200
    db.expire_all()
    previous = db.get(AuthSession, UUID(first_sid))
    current = db.get(AuthSession, UUID(session_id_of(second.json()["access_token"])))
    assert previous.revoked_at is not None
    assert (current.revoked_at, current.auth_method) == (None, "password")


def _sso_session(db: Session, user: User, link: UserIdentity) -> str:
    access, _ = issue_tokens(db, user.id, user.organization_id, auth_method="sso", identity_id=link.id)
    db.commit()
    return access


def test_an_admin_changing_an_address_drops_the_seats_sso_accounts_and_sessions(client: TestClient, db: Session, test_user: User):
    """A new address is a new person in the seat."""
    link = _link_google(db, test_user)
    sso_token = _sso_session(db, test_user, link)
    password_token, _ = issue_tokens(db, test_user.id, test_user.organization_id, auth_method="password")
    db.commit()

    response = client.put(f"/api/v1/users/{test_user.id}", json={"email": "next.person@test.com"})
    assert response.status_code == 200
    db.expire_all()
    assert db.query(UserIdentity).count() == 0
    for token in (sso_token, password_token):
        assert db.get(AuthSession, UUID(session_id_of(token))).revoked_at is not None


def test_an_admin_edit_that_keeps_the_address_keeps_the_links(client: TestClient, db: Session, test_user: User):
    _link_google(db, test_user)
    assert client.put(f"/api/v1/users/{test_user.id}", json={"full_name": "Renamed"}).status_code == 200
    assert db.query(UserIdentity).count() == 1


def test_changing_your_own_address_drops_your_sso_accounts_but_not_this_session(client: TestClient, db: Session, test_user: User):
    link = _link_google(db, test_user)
    this_session = _sso_session(db, test_user, link)
    other_device = _sso_session(db, test_user, link)
    client.cookies.set("access_token", this_session)

    response = client.patch("/api/v1/users/me", json={"email": "moved@test.com"})
    assert response.status_code == 200
    db.expire_all()
    assert db.query(UserIdentity).count() == 0
    assert db.get(AuthSession, UUID(session_id_of(this_session))).revoked_at is None
    assert db.get(AuthSession, UUID(session_id_of(other_device))).revoked_at is not None


def test_login_never_takes_another_orgs_store(client: TestClient, test_user: User, db: Session):
    """Signing in with ?shop_id= links an unclaimed store; a store another
    organization owns stays theirs (with its access token)."""
    other = Organization(name="Other", domain="other.example", timezone="UTC")
    db.add(other)
    db.flush()
    theirs = ShopifyShop(shop_domain="theirs.myshopify.com", is_installed=True, organization_id=other.id)
    unclaimed = ShopifyShop(shop_domain="new.myshopify.com", is_installed=True)
    db.add_all([theirs, unclaimed])
    db.commit()

    for shop in (theirs, unclaimed):
        response = client.post(
            f"/api/v1/users/login?shop_id={shop.id}",
            data={"username": test_user.email, "password": "testpassword"},
        )
        assert response.status_code == 200

    db.refresh(theirs)
    db.refresh(unclaimed)
    assert theirs.organization_id == other.id
    assert unclaimed.organization_id == test_user.organization_id
    # and connecting a store never replaced the org's own website
    assert db.get(Organization, test_user.organization_id).domain != "new.myshopify.com"

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

def test_update_password(client: TestClient, db: Session, test_user: User):
    """Test updating user's password"""
    update_data = {
        "current_password": "testpassword",
        "password": "NewPassw0rd!"
    }
    response = client.patch("/api/v1/users/me", json=update_data)
    assert response.status_code == 200
    # The new hash has to reach the column, not a stray ORM attribute
    db.refresh(test_user)
    assert verify_password("NewPassw0rd!", test_user.hashed_password)


def test_update_password_rejects_weak_password(client: TestClient, db: Session, test_user: User):
    """A self-service change has to clear the same policy as an admin reset"""
    response = client.patch(
        "/api/v1/users/me",
        json={"current_password": "testpassword", "password": "short1"},
    )

    assert response.status_code == 400
    db.refresh(test_user)
    assert verify_password("testpassword", test_user.hashed_password)


def test_update_password_rejects_wrong_current_password(client: TestClient, db: Session, test_user: User):
    """The old password still has to be proven"""
    response = client.patch(
        "/api/v1/users/me",
        json={"current_password": "wrongpassword", "password": "NewPassw0rd!"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect current password"
    db.refresh(test_user)
    assert verify_password("testpassword", test_user.hashed_password)

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

def test_register_fcm_token(client: TestClient, test_user: User, db: Session):
    """Registering a token stores a row for this device"""
    response = client.post("/api/v1/users/token/fcm-token",
                           json={"token": "test_fcm_token_123"})
    assert response.status_code == 200
    assert response.json()["message"] == "FCM token registered successfully"

    tokens = db.query(FCMToken).filter(FCMToken.user_id == test_user.id).all()
    assert [t.token for t in tokens] == ["test_fcm_token_123"]


def test_register_fcm_token_is_idempotent(client: TestClient, test_user: User, db: Session):
    """Re-posting the same token on every app load must not pile up rows"""
    for _ in range(3):
        response = client.post("/api/v1/users/token/fcm-token",
                               json={"token": "same_token"})
        assert response.status_code == 200

    assert db.query(FCMToken).filter(FCMToken.user_id == test_user.id).count() == 1


def test_register_fcm_token_keeps_other_devices(client: TestClient, test_user: User, db: Session):
    """A second device adds a token instead of replacing the first"""
    client.post("/api/v1/users/token/fcm-token", json={"token": "phone_token"})
    client.post("/api/v1/users/token/fcm-token", json={"token": "laptop_token"})

    tokens = {t.token for t in db.query(FCMToken).filter(
        FCMToken.user_id == test_user.id).all()}
    assert tokens == {"phone_token", "laptop_token"}


def test_clear_fcm_token_only_removes_that_device(client: TestClient, test_user: User, db: Session):
    """Signing out on one device must leave the user's other devices on push"""
    db.add_all([
        FCMToken(user_id=test_user.id, token="phone_token"),
        FCMToken(user_id=test_user.id, token="laptop_token"),
    ])
    db.commit()

    response = client.request("DELETE", "/api/v1/users/token/fcm-token",
                              json={"token": "laptop_token"})
    assert response.status_code == 200
    assert response.json()["message"] == "FCM token cleared successfully"

    tokens = [t.token for t in db.query(FCMToken).filter(
        FCMToken.user_id == test_user.id).all()]
    assert tokens == ["phone_token"]


def test_clear_unknown_fcm_token_succeeds(client: TestClient, test_user: User):
    """Logging out twice, or after the token was pruned, is not an error"""
    response = client.request("DELETE", "/api/v1/users/token/fcm-token",
                              json={"token": "never_registered"})
    assert response.status_code == 200


@pytest.fixture
def foreign_role(db) -> Role:
    """A role defined in a different organization."""
    other_org = Organization(id=uuid4(), name="Other Org", domain="other-role.example.com")
    db.add(other_org)
    db.commit()
    role = Role(name="Foreign Admin", organization_id=other_org.id)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


def test_create_user_rejects_foreign_role(admin_client, foreign_role, test_organization):
    """A user can't be created with a role from another tenant"""
    user_data = {
        "email": "roletest@test.com",
        "full_name": "Role Test",
        "password": "TestPassw0rd!",
        "is_active": True,
        "role_id": foreign_role.id,
        "organization_id": str(test_organization.id),
    }
    response = admin_client.post("/api/v1/users", json=user_data)

    assert response.status_code == 404
    assert response.json()["detail"] == "Role not found"


def test_update_user_rejects_foreign_role(admin_client, db, test_user, foreign_role):
    """A user can't be moved onto a role from another tenant"""
    response = admin_client.put(
        f"/api/v1/users/{test_user.id}",
        json={"role_id": foreign_role.id},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Role not found"
    db.refresh(test_user)
    assert test_user.role_id != foreign_role.id


# ---------------------------------------------------------------- admin reset

@pytest.fixture
def agent_user(db: Session, test_organization, test_role: Role) -> User:
    """A second user in the same org — the one an admin resets."""
    user = User(
        id=uuid4(),
        email="agent@test.com",
        hashed_password=get_password_hash("oldpassword"),
        organization_id=test_organization.id,
        role_id=test_role.id,
        is_active=True,
        full_name="Agent User",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_reset_user_password(admin_client: TestClient, db: Session, agent_user: User):
    """An admin can set a new password for an agent in their organization"""
    response = admin_client.post(
        f"/api/v1/users/{agent_user.id}/reset-password",
        json={"new_password": "NewPassw0rd!"},
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Password reset successfully"
    db.refresh(agent_user)
    assert verify_password("NewPassw0rd!", agent_user.hashed_password)
    assert not verify_password("oldpassword", agent_user.hashed_password)


@pytest.fixture
def agent_client(db: Session, test_organization, agent_user: User) -> TestClient:
    """A client authenticated as a user whose role grants nothing.

    The `client` fixture's require_permissions override targets the factory
    rather than the closure Depends() actually calls, so it authenticates as a
    user who *does* hold manage_users. Gate tests need a real unprivileged user.
    """
    plain_role = Role(name="Agent Only", organization_id=test_organization.id)
    db.add(plain_role)
    db.commit()
    agent_user.role_id = plain_role.id
    db.commit()
    db.refresh(agent_user)

    async def override_get_current_user():
        return agent_user

    def override_get_db():
        try:
            session = TestingSessionLocal()
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_db] = override_get_db

    yield TestClient(app)
    app.dependency_overrides.clear()


def test_reset_user_password_requires_permission(agent_client: TestClient, test_user: User):
    """Without manage_users the reset is refused"""
    response = agent_client.post(
        f"/api/v1/users/{test_user.id}/reset-password",
        json={"new_password": "NewPassw0rd!"},
    )
    assert response.status_code == 403


def test_reset_user_password_rejects_weak_password(admin_client: TestClient, db: Session, agent_user: User):
    """A password below the policy is rejected and nothing is written"""
    response = admin_client.post(
        f"/api/v1/users/{agent_user.id}/reset-password",
        json={"new_password": "short1"},
    )

    assert response.status_code == 422
    db.refresh(agent_user)
    assert verify_password("oldpassword", agent_user.hashed_password)


def test_reset_own_password_rejected(admin_client: TestClient, test_user: User):
    """Changing your own password still requires proving the current one"""
    response = admin_client.post(
        f"/api/v1/users/{test_user.id}/reset-password",
        json={"new_password": "NewPassw0rd!"},
    )

    assert response.status_code == 400
    assert "profile settings" in response.json()["detail"]


def test_reset_password_rejects_other_org_user(admin_client: TestClient, db: Session, test_role: Role):
    """A user in another organization is invisible, not resettable"""
    other_org = Organization(id=uuid4(), name="Other Org", domain="other-reset.example.com")
    db.add(other_org)
    db.commit()
    outsider = User(
        id=uuid4(),
        email="outsider@test.com",
        hashed_password=get_password_hash("oldpassword"),
        organization_id=other_org.id,
        is_active=True,
        full_name="Outsider",
    )
    db.add(outsider)
    db.commit()

    response = admin_client.post(
        f"/api/v1/users/{outsider.id}/reset-password",
        json={"new_password": "NewPassw0rd!"},
    )

    assert response.status_code == 404
    db.refresh(outsider)
    assert verify_password("oldpassword", outsider.hashed_password)


def test_update_user_ignores_password_field(admin_client: TestClient, db: Session, agent_user: User):
    """PUT /users/{id} no longer pretends to accept a password"""
    response = admin_client.put(
        f"/api/v1/users/{agent_user.id}",
        json={"full_name": "Renamed", "password": "IgnoredPassw0rd!"},
    )

    assert response.status_code == 200
    db.refresh(agent_user)
    assert agent_user.full_name == "Renamed"
    assert verify_password("oldpassword", agent_user.hashed_password)


# ------------------------------------------------------------------ teammates

@pytest.fixture
def inbox_agent_client(db: Session, test_organization, agent_user: User) -> TestClient:
    """Authenticated as a seeded Human Agent — the four permissions and no more."""
    role = Role(id=88, name="Human Agent", organization_id=test_organization.id)
    db.add(role)
    db.commit()
    for name in ("view_assigned_chats", "manage_assigned_chats",
                 "view_unassigned_chats", "view_people"):
        perm = db.query(Permission).filter(Permission.name == name).first()
        if perm is None:
            perm = Permission(name=name, description=name)
            db.add(perm)
            db.commit()
            db.refresh(perm)
        db.execute(role_permissions.insert().values(role_id=role.id, permission_id=perm.id))
    db.commit()
    agent_user.role_id = role.id
    db.commit()
    db.refresh(agent_user)

    async def override_get_current_user():
        return agent_user

    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_db] = override_get_db

    yield TestClient(app)
    app.dependency_overrides.clear()


def test_teammates_visible_to_inbox_roles(inbox_agent_client: TestClient, db: Session, test_organization, test_role: Role):
    """An agent can list who to hand a chat to, without manage_users.

    The inbox used to call GET /users for this, which 403'd — so Reassign, an
    action the API allows an agent to perform, had an empty dropdown.
    """
    colleague = User(
        id=uuid4(),
        email="colleague@test.com",
        hashed_password=get_password_hash("pw"),
        organization_id=test_organization.id,
        role_id=test_role.id,
        is_active=True,
        full_name="Colleague",
    )
    db.add(colleague)
    db.commit()

    response = inbox_agent_client.get("/api/v1/users/teammates")

    assert response.status_code == 200
    emails = {u["email"] for u in response.json()}
    assert "colleague@test.com" in emails


def test_teammates_does_not_leak_roles_or_permissions(inbox_agent_client: TestClient):
    """The payload is a name and a face — not the org's permission matrix"""
    response = inbox_agent_client.get("/api/v1/users/teammates")

    assert response.status_code == 200
    for teammate in response.json():
        assert set(teammate) <= {"id", "full_name", "email", "profile_pic", "is_online"}


def test_teammates_is_org_scoped(inbox_agent_client: TestClient, db: Session):
    """A teammate from another organization is not a teammate"""
    other_org = Organization(id=uuid4(), name="Other", domain="other-teammates.example.com")
    db.add(other_org)
    db.commit()
    outsider = User(
        id=uuid4(),
        email="outsider@other.com",
        hashed_password=get_password_hash("pw"),
        organization_id=other_org.id,
        is_active=True,
        full_name="Outsider",
    )
    db.add(outsider)
    db.commit()

    response = inbox_agent_client.get("/api/v1/users/teammates")

    assert response.status_code == 200
    assert "outsider@other.com" not in {u["email"] for u in response.json()}


def test_teammates_requires_an_inbox_permission(db: Session, test_organization) -> None:
    """Someone with no chat grant at all has no business reading the directory"""
    role = Role(id=77, name="Nothing", organization_id=test_organization.id)
    db.add(role)
    db.commit()
    user = User(
        id=uuid4(),
        email="nothing@test.com",
        hashed_password=get_password_hash("pw"),
        organization_id=test_organization.id,
        role_id=role.id,
        is_active=True,
        full_name="Nothing",
    )
    db.add(user)
    db.commit()

    async def override_get_current_user():
        return user

    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_db] = override_get_db
    try:
        response = TestClient(app).get("/api/v1/users/teammates")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403


def test_teammates_route_is_not_shadowed_by_the_user_id_route(inbox_agent_client: TestClient):
    """Declared above GET /{user_id}.

    Below it, "teammates" parses as a user id and the request lands on the
    manage_users route — a 403 for exactly the agents the endpoint is for. A
    200 here is the proof it resolved to the right handler.
    """
    response = inbox_agent_client.get("/api/v1/users/teammates")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_avatar_redirects_to_a_freshly_signed_url(client: TestClient, test_user: User, db: Session):
    """The point of the endpoint: a URL signed now, not at login.

    The dashboard used to render the link held in the cached user_info blob,
    which is written once at login. S3 presigned URLs expire an hour later, so
    every session outlived its own avatar and only a re-login fixed it.
    """
    test_user.profile_pic = "/uploads/user/org/user/profile.png"
    db.commit()

    response = client.get("/api/v1/users/me/avatar", follow_redirects=False)

    assert response.status_code == 307
    # Local storage is served under the API prefix; the bare stored path 404s.
    assert response.headers["location"] == "/api/v1/uploads/user/org/user/profile.png"
    # The redirect must not be cached, or the browser keeps replaying a
    # signature that has since expired — the bug all over again.
    assert response.headers["cache-control"] == "no-store"


def test_avatar_is_404_without_a_picture(client: TestClient, test_user: User, db: Session):
    test_user.profile_pic = None
    db.commit()

    assert client.get("/api/v1/users/me/avatar").status_code == 404


def test_avatar_route_is_not_shadowed_by_the_user_id_route(client: TestClient, test_user: User, db: Session):
    """Declared above GET /{user_id}, or "me" parses as a user id."""
    test_user.profile_pic = "/uploads/user/org/user/profile.png"
    db.commit()

    response = client.get("/api/v1/users/me/avatar", follow_redirects=False)

    assert response.status_code == 307


def test_get_user_with_malformed_id_is_a_client_error(client: TestClient):
    """A malformed id is the caller's mistake (422), never a server error."""
    assert client.get("/api/v1/users/0").status_code == 422

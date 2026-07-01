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
from fastapi import FastAPI
from app.models.user import User
from app.models.session_to_agent import SessionToAgent, SessionStatus
from app.models.rating import Rating
from app.models.permission import Permission, role_permissions
from app.models.role import Role
from uuid import UUID, uuid4
from app.api import rating as rating_router
from app.core.auth import get_current_user, require_permissions
from app.main import app
from app.core.config import settings
from app.repositories.session_to_agent import SessionToAgentRepository
from app.repositories.rating import RatingRepository
from tests.conftest import engine, TestingSessionLocal, create_tables, test_organization
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create a test FastAPI app
app = FastAPI()
app.include_router(
    rating_router.router,
    prefix=f"{settings.API_V1_STR}/ratings",
    tags=["ratings"]
)

@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test."""
    # Create all tables
    create_tables()
    
    # Create a new session for testing
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_permissions(db) -> list[Permission]:
    """Create test permissions"""
    permissions = []
    for name in ["view_all", "manage_agents", "manage_ratings"]:
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
    return role

@pytest.fixture
def test_session(db, test_agent, test_customer, test_organization) -> SessionToAgent:
    """Create a test session"""
    session_repo = SessionToAgentRepository(db)
    session = session_repo.create_session(
        session_id=uuid4(),
        agent_id=test_agent.id,
        customer_id=test_customer.id,
        organization_id=test_organization.id
    )
    return session

@pytest.fixture
def client(test_user: User, test_role: Role, db) -> TestClient:
    """Create a test client with mocked authentication"""
    
    # Update test user with role
    test_user.role_id = test_role.id
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    # Override the dependency to return our test user
    async def override_get_current_user():
        return test_user
    
    # Override the permissions dependency to return our test user
    async def override_require_permissions(*args, **kwargs):
        return test_user
    
    # Override the database dependency
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    # Apply the overrides
    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[require_permissions] = override_require_permissions
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as client:
        yield client
    
    app.dependency_overrides = {}

@pytest.fixture
def test_rating(db, test_session, test_customer, test_agent, test_organization) -> Rating:
    """Create a test rating"""
    rating_repo = RatingRepository(db)
    rating = rating_repo.create_rating(
        session_id=test_session.session_id,
        customer_id=test_customer.id,
        user_id=None,
        agent_id=test_agent.id,
        organization_id=test_organization.id,
        rating=5,
        feedback="Great service!"
    )
    return rating

def test_create_rating(client: TestClient, test_session: SessionToAgent, db: Session):
    """Test creating a new rating"""
    # Verify the session exists in the database
    session_repo = SessionToAgentRepository(db)
    session = session_repo.get_session(test_session.session_id)
    logger.debug(f"Test session: {session}")
    
    response = client.post(
        f"{settings.API_V1_STR}/ratings",
        json={
            "session_id": str(test_session.session_id),
            "rating": 4,
            "feedback": "Good service"
        }
    )
    
    # Log the response for debugging
    logger.debug(f"Response status: {response.status_code}")
    logger.debug(f"Response body: {response.text}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == str(test_session.session_id)
    assert data["rating"] == 4
    assert data["feedback"] == "Good service"

def test_create_rating_duplicate(client: TestClient, test_rating: Rating):
    """Test creating a duplicate rating for the same session"""
    response = client.post(
        f"{settings.API_V1_STR}/ratings",
        json={
            "session_id": str(test_rating.session_id),
            "rating": 3,
            "feedback": "Another feedback"
        }
    )
    
    # Log the response for debugging
    logger.debug(f"Response status: {response.status_code}")
    logger.debug(f"Response body: {response.text}")
    
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_create_rating_invalid_session(client: TestClient):
    """Test creating a rating for a non-existent session"""
    response = client.post(
        f"{settings.API_V1_STR}/ratings",
        json={
            "session_id": str(uuid4()),
            "rating": 4,
            "feedback": "Good service"
        }
    )
    
    # Log the response for debugging
    logger.debug(f"Response status: {response.status_code}")
    logger.debug(f"Response body: {response.text}")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]

def test_get_agent_ratings(client: TestClient, test_rating: Rating, test_agent):
    """Test getting all ratings for an agent"""
    response = client.get(f"{settings.API_V1_STR}/ratings/agent/{test_agent.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["agent_id"] == str(test_agent.id)

def test_get_agent_average_rating(client: TestClient, test_rating: Rating, test_agent):
    """Test getting average rating for an agent"""
    response = client.get(f"{settings.API_V1_STR}/ratings/agent/{test_agent.id}/average")
    
    assert response.status_code == 200
    data = response.json()
    assert "average_rating" in data
    assert isinstance(data["average_rating"], float)
    # No total_ratings field in the API response

def test_get_organization_ratings(client: TestClient, test_rating: Rating):
    """Test getting all ratings for the organization"""
    response = client.get("/api/v1/ratings/organization")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["id"] == str(test_rating.id)

def test_get_organization_average_rating(client: TestClient, test_rating: Rating):
    """Test getting average rating for the organization"""
    response = client.get("/api/v1/ratings/organization/average")
    
    assert response.status_code == 200
    data = response.json()
    assert "average_rating" in data
    assert isinstance(data["average_rating"], float)
    # No total_ratings field in the API response

def test_get_organization_ratings_pagination(client: TestClient, db, test_session, test_customer, test_agent, test_organization):
    """Test pagination for organization ratings"""
    # Create multiple ratings
    rating_repo = RatingRepository(db)
    
    # Create a second session
    session_repo = SessionToAgentRepository(db)
    session2 = session_repo.create_session(
        session_id=uuid4(),
        agent_id=test_agent.id,
        customer_id=test_customer.id,
        organization_id=test_organization.id
    )
    
    # Add ratings
    rating1 = rating_repo.create_rating(
        session_id=test_session.session_id,
        customer_id=test_customer.id,
        user_id=None,
        agent_id=test_agent.id,
        organization_id=test_organization.id,
        rating=5,
        feedback="Great service!"
    )
    
    rating2 = rating_repo.create_rating(
        session_id=session2.session_id,
        customer_id=test_customer.id,
        user_id=None,
        agent_id=test_agent.id,
        organization_id=test_organization.id,
        rating=4,
        feedback="Good service"
    )
    
    # Test with limit=1
    response = client.get("/api/v1/ratings/organization?limit=1")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    
    # Get the first rating ID
    first_rating_id = data[0]["id"]
    
    # Test with skip=1 (offset=1 in the API)
    response = client.get("/api/v1/ratings/organization?offset=1&limit=1")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    
    # The IDs should be different
    assert data[0]["id"] != first_rating_id 
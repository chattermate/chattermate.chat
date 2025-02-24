"""
ChatterMate - Test Knowledge
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
from app.models.knowledge import Knowledge, SourceType
from app.models.knowledge_queue import KnowledgeQueue, QueueStatus
from app.models.knowledge_to_agent import KnowledgeToAgent
from app.models.agent import Agent, AgentType
from uuid import UUID, uuid4
from app.api import knowledge as knowledge_router
from app.core.auth import get_current_user, require_permissions
from app.main import app
from app.core.config import settings
from tests.conftest import engine, TestingSessionLocal, create_tables
from datetime import datetime, timezone
import io

# Set enterprise flag to False
knowledge_router.HAS_ENTERPRISE = False

# Create a test FastAPI app
app = FastAPI()
app.include_router(
    knowledge_router.router,
    prefix=f"{settings.API_V1_STR}/knowledge",
    tags=["knowledge"]
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
    for name in ["manage_knowledge"]:
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
def test_agent(db: Session, test_organization) -> Agent:
    """Create a test agent"""
    agent = Agent(
        id=uuid4(),
        name="Test Agent",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Test instruction"],
        organization_id=test_organization.id,
        is_active=True
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

@pytest.fixture
def test_knowledge(db: Session, test_organization) -> Knowledge:
    """Create a test knowledge entry"""
    knowledge = Knowledge(
        source="test.pdf",
        source_type=SourceType.FILE,
        organization_id=test_organization.id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(knowledge)
    db.commit()
    db.refresh(knowledge)
    return knowledge

@pytest.fixture
def test_knowledge_queue(db: Session, test_organization, test_user) -> KnowledgeQueue:
    """Create a test knowledge queue entry"""
    queue = KnowledgeQueue(
        organization_id=test_organization.id,
        user_id=test_user.id,
        source_type="pdf_file",
        source="test.pdf",
        status=QueueStatus.PENDING,
        created_at=datetime.now(timezone.utc)
    )
    db.add(queue)
    db.commit()
    db.refresh(queue)
    return queue

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

def test_upload_pdf(client: TestClient, test_organization):
    """Test uploading PDF files"""
    # Create a test PDF file
    pdf_content = b"%PDF-1.4 test pdf content"
    files = [
        ("files", ("test.pdf", io.BytesIO(pdf_content), "application/pdf"))
    ]
    
    response = client.post(
        "/api/v1/knowledge/upload/pdf",
        files=files,
        data={
            "org_id": str(test_organization.id)
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "queue_items" in data
    assert len(data["queue_items"]) == 1
    assert data["queue_items"][0]["status"] == "pending"

def test_add_urls(client: TestClient, test_organization):
    """Test adding URLs for processing"""
    urls_data = {
        "org_id": str(test_organization.id),
        "pdf_urls": ["https://example.com/test.pdf"],
        "websites": ["https://example.com"]
    }
    
    response = client.post("/api/v1/knowledge/add/urls", json=urls_data)
    
    assert response.status_code == 200
    data = response.json()
    assert "queue_items" in data
    assert len(data["queue_items"]) == 2  # One for PDF, one for website
    assert all(item["status"] == "pending" for item in data["queue_items"])

def test_link_knowledge_to_agent(client: TestClient, test_knowledge, test_agent):
    """Test linking knowledge to an agent"""
    response = client.post(
        "/api/v1/knowledge/link",
        params={
            "knowledge_id": test_knowledge.id,
            "agent_id": str(test_agent.id)
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Knowledge linked to agent successfully"

def test_unlink_knowledge_from_agent(client: TestClient, test_knowledge, test_agent, db):
    """Test unlinking knowledge from an agent"""
    # First link the knowledge
    link = KnowledgeToAgent(
        knowledge_id=test_knowledge.id,
        agent_id=test_agent.id
    )
    db.add(link)
    db.commit()
    
    response = client.delete(
        "/api/v1/knowledge/unlink",
        params={
            "knowledge_id": test_knowledge.id,
            "agent_id": str(test_agent.id)
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Knowledge unlinked from agent successfully"

def test_get_knowledge_by_agent(client: TestClient, test_knowledge, test_agent, db):
    """Test getting knowledge entries by agent"""
    # Link knowledge to agent
    link = KnowledgeToAgent(
        knowledge_id=test_knowledge.id,
        agent_id=test_agent.id
    )
    db.add(link)
    db.commit()
    
    response = client.get(
        f"/api/v1/knowledge/agent/{test_agent.id}",
        params={"page": 1, "page_size": 10}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "knowledge" in data
    assert len(data["knowledge"]) == 1
    assert data["knowledge"][0]["id"] == test_knowledge.id
    assert "pagination" in data
    assert data["pagination"]["page"] == 1
    assert data["pagination"]["page_size"] == 10

def test_get_knowledge_by_organization(client: TestClient, test_knowledge, test_organization):
    """Test getting knowledge entries by organization"""
    response = client.get(
        f"/api/v1/knowledge/organization/{test_organization.id}",
        params={"page": 1, "page_size": 10}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "knowledge" in data
    assert len(data["knowledge"]) == 1
    assert data["knowledge"][0]["id"] == test_knowledge.id
    assert "pagination" in data
    assert data["pagination"]["page"] == 1
    assert data["pagination"]["page_size"] == 10

def test_get_queue_status(client: TestClient, test_knowledge_queue):
    """Test getting queue status"""
    response = client.get(f"/api/v1/knowledge/queue/{test_knowledge_queue.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_knowledge_queue.id
    assert data["status"] == "pending"

def test_get_processor_status(client: TestClient):
    """Test getting processor status"""
    response = client.get("/api/v1/knowledge/processor/status")
    
    assert response.status_code == 200
    data = response.json()
    assert "queue_status" in data
    assert "is_running" in data
    assert "last_run" in data
    assert "error" in data

def test_delete_knowledge(client: TestClient, test_knowledge):
    """Test deleting knowledge"""
    response = client.delete(f"/api/v1/knowledge/{test_knowledge.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Knowledge source deleted successfully"

# Negative test cases

def test_upload_invalid_file(client: TestClient, test_organization):
    """Test uploading invalid file type"""
    files = [
        ("files", ("test.txt", io.BytesIO(b"test content"), "text/plain"))
    ]
    
    response = client.post(
        "/api/v1/knowledge/upload/pdf",
        files=files,
        data={
            "org_id": str(test_organization.id)
        }
    )
    
    assert response.status_code == 200  # API accepts all files now
    data = response.json()
    assert "queue_items" in data
    assert len(data["queue_items"]) == 1

def test_add_invalid_urls(client: TestClient, test_organization):
    """Test adding invalid URLs"""
    urls_data = {
        "org_id": str(test_organization.id),
        "pdf_urls": ["not_a_url"],
        "websites": ["not_a_url"]
    }
    
    response = client.post("/api/v1/knowledge/add/urls", json=urls_data)
    
    assert response.status_code == 200  # API accepts all URLs now
    data = response.json()
    assert "queue_items" in data
    assert len(data["queue_items"]) == 2

def test_link_nonexistent_knowledge(client: TestClient, test_agent):
    """Test linking nonexistent knowledge"""
    response = client.post(
        "/api/v1/knowledge/link",
        params={
            "knowledge_id": 999999,  # Nonexistent ID
            "agent_id": str(test_agent.id)
        }
    )
    
    assert response.status_code == 404
    assert "Knowledge source not found or unauthorized access" in response.json()["detail"]

def test_get_nonexistent_queue(client: TestClient):
    """Test getting nonexistent queue status"""
    response = client.get("/api/v1/knowledge/queue/999999")
    
    assert response.status_code == 200  # API returns 200 with error message
    data = response.json()
    assert "error" in data
    assert data["error"] == "Queue item not found" 
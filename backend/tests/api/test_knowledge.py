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
import os
from unittest.mock import patch
from unittest.mock import MagicMock

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

    # Create temp directory if it doesn't exist
    os.makedirs("temp", exist_ok=True)

    # Mock S3 configuration and upload
    mock_s3_client = MagicMock()
    mock_s3_client.put_object.return_value = {'ResponseMetadata': {'HTTPStatusCode': 200}}
    mock_s3_client.generate_presigned_url.return_value = "https://test-bucket.s3.amazonaws.com/test.pdf"
    
    with patch('app.core.config.settings.S3_FILE_STORAGE', True), \
         patch('app.core.s3.upload_file_to_s3') as mock_upload, \
         patch('app.core.s3.get_s3_signed_url') as mock_signed_url, \
         patch('app.core.s3.get_s3_client', return_value=mock_s3_client):
        # Configure mocks
        mock_upload.return_value = "s3://test-bucket/test.pdf"
        mock_signed_url.return_value = "https://test-bucket.s3.amazonaws.com/test.pdf"

        response = client.post(
            "/api/v1/knowledge/upload/pdf",
            files=files,
            data={
                "org_id": str(test_organization.id)
            }
        )

        assert response.status_code == 200
        assert "queue_items" in response.json()
        assert len(response.json()["queue_items"]) == 1

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
    """Test uploading invalid file type is rejected"""
    # A text file must be rejected by content-type validation
    text_content = b"This is not a PDF file"
    files = [
        ("files", ("test.txt", io.BytesIO(text_content), "text/plain"))
    ]

    response = client.post(
        "/api/v1/knowledge/upload/pdf",
        files=files,
        data={
            "org_id": str(test_organization.id)
        }
    )

    assert response.status_code == 400
    assert "unsupported content type" in response.json()["detail"]

def test_upload_fake_pdf_rejected(client: TestClient, test_organization):
    """Test uploading a file with a PDF content type but non-PDF bytes is rejected"""
    # Correct content type, but the magic-byte check must reject it
    files = [
        ("files", ("fake.pdf", io.BytesIO(b"This is not a PDF file"), "application/pdf"))
    ]

    response = client.post(
        "/api/v1/knowledge/upload/pdf",
        files=files,
        data={
            "org_id": str(test_organization.id)
        }
    )

    assert response.status_code == 400
    assert "not a valid PDF" in response.json()["detail"]

def test_add_invalid_urls(client: TestClient, test_organization):
    """Test adding invalid URLs"""
    urls_data = {
        "org_id": str(test_organization.id),
        "pdf_urls": ["not_a_url"],
        "websites": ["not_a_url"]
    }
    
    response = client.post("/api/v1/knowledge/add/urls", json=urls_data)
    
    # The API now validates URL formats strictly and returns 422 for invalid inputs
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    # Ensure validation errors point to either pdf_urls or websites fields
    errors = data.get("detail", [])
    assert any(
        any(part in ("websites", "pdf_urls") for part in err.get("loc", []))
        for err in errors
    )

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


# Test cases for add_subpage endpoint
def test_add_subpage_knowledge_not_found(client: TestClient):
    """Test adding subpage to non-existent knowledge source"""
    response = client.post(
        "/api/v1/knowledge/999999/subpage",
        json={
            "subpage_name": "test_subpage",
            "content": "Test content for subpage"
        }
    )

    assert response.status_code == 404
    assert "Knowledge source not found" in response.json()["detail"]


def test_add_subpage_unauthorized(client: TestClient, test_knowledge):
    """Test adding subpage to knowledge from different organization"""
    # Create a knowledge source with different org_id
    from uuid import uuid4
    from app.models.organization import Organization
    from tests.conftest import TestingSessionLocal

    db = TestingSessionLocal()
    try:
        # Create a different organization
        other_org = Organization(
            id=uuid4(),
            name="Other Org",
            domain="other.com",
            timezone="UTC"
        )
        db.add(other_org)

        # Create knowledge for different org
        other_knowledge = Knowledge(
            source="other.pdf",
            source_type=SourceType.FILE,
            organization_id=other_org.id,
            created_at=datetime.now(timezone.utc)
        )
        db.add(other_knowledge)
        db.commit()
        db.refresh(other_knowledge)

        response = client.post(
            f"/api/v1/knowledge/{other_knowledge.id}/subpage",
            json={
                "subpage_name": "test_subpage",
                "content": "Test content"
            }
        )

        assert response.status_code == 403
        assert "Unauthorized access to knowledge source" in response.json()["detail"]
    finally:
        db.close()


def test_add_subpage_no_table_name(client: TestClient, test_knowledge):
    """Test adding subpage when knowledge has no vector database table"""
    # test_knowledge by default has no table_name set
    response = client.post(
        f"/api/v1/knowledge/{test_knowledge.id}/subpage",
        json={
            "subpage_name": "test_subpage",
            "content": "Test content for subpage"
        }
    )

    assert response.status_code == 400
    assert "Knowledge source has no vector database table" in response.json()["detail"]


def test_add_subpage_integration_logic():
    """Test that add_subpage endpoint has correct integration points"""
    # This test verifies the endpoint exists and has the expected logic flow
    # Actual database operations with pgvector are tested in integration tests

    # Verify the endpoint is registered
    from app.api.knowledge import router
    route_found = False
    for route in router.routes:
        if hasattr(route, 'path') and '/{knowledge_id}/subpage' in route.path:
            route_found = True
            break

    assert route_found, "add_subpage endpoint should be registered"


def test_add_subpage_with_enterprise_limits_mocked():
    """Test that enterprise limits are checked in add_subpage endpoint"""
    import pytest
    from unittest.mock import patch, MagicMock
    from app.models.user import User
    from app.models.knowledge import Knowledge, SourceType
    from uuid import uuid4
    import app.api.knowledge as knowledge_module

    # Skip this test if enterprise module is not available
    if not knowledge_module.HAS_ENTERPRISE:
        pytest.skip("Enterprise module not available")

    from app.api.knowledge import add_subpage
    from fastapi import HTTPException

    # Create mock objects
    mock_db = MagicMock()
    mock_user = User(
        id=uuid4(),
        email="test@test.com",
        hashed_password="hashed",
        organization_id=uuid4(),
        role_id=1,
        is_active=True,
        full_name="Test User"
    )

    # Create mock knowledge with table_name and schema set
    mock_knowledge = Knowledge(
        id=1,
        source="test.pdf",
        source_type=SourceType.FILE,
        organization_id=mock_user.organization_id,
        table_name="test_table",
        schema="public"
    )
    mock_knowledge.agent_links = []

    # Mock repository
    with patch('app.api.knowledge.KnowledgeRepository') as mock_repo_class:
        mock_repo = MagicMock()
        mock_repo.get_by_id.return_value = mock_knowledge
        mock_repo_class.return_value = mock_repo

        # Mock subscription check with limit reached
        with patch('app.enterprise.repositories.subscription.SubscriptionRepository') as mock_sub_repo_class:
            # Create subscription with plan at limit
            mock_subscription = MagicMock()
            mock_plan = MagicMock()
            mock_plan.max_sub_pages = 2
            mock_subscription.plan = mock_plan

            mock_sub_repo = MagicMock()
            mock_sub_repo.get_active_subscription.return_value = mock_subscription
            mock_sub_repo_class.return_value = mock_sub_repo

            # Mock the database count query to return 2 (at limit)
            mock_result = MagicMock()
            mock_result.count = 2
            mock_db.execute.return_value.fetchone.return_value = mock_result

            # Should raise 402 error
            with pytest.raises(HTTPException) as exc_info:
                # Call the endpoint function directly
                import asyncio
                result = asyncio.run(add_subpage(
                    knowledge_id=1,
                    subpage_name="test",
                    content="test content",
                    current_user=mock_user,
                    db=mock_db
                ))

            assert exc_info.value.status_code == 402
            assert "Subpage limit reached" in exc_info.value.detail


# Test cases for update_page_content / delete_page endpoints
def test_update_page_empty_content(client: TestClient, test_knowledge):
    """Empty page content is rejected before any DB work."""
    response = client.put(
        f"/api/v1/knowledge/{test_knowledge.id}/page/some-page",
        json={"content": "   "}
    )
    assert response.status_code == 400
    assert "Page content cannot be empty" in response.json()["detail"]


def test_update_page_knowledge_not_found(client: TestClient):
    """Updating a page on a non-existent knowledge source returns 404."""
    response = client.put(
        "/api/v1/knowledge/999999/page/some-page",
        json={"content": "New content"}
    )
    assert response.status_code == 404
    assert "Knowledge source not found" in response.json()["detail"]


def test_update_page_no_table_name(client: TestClient, test_knowledge):
    """Updating a page when the source has no vector table returns 400."""
    response = client.put(
        f"/api/v1/knowledge/{test_knowledge.id}/page/some-page",
        json={"content": "New content"}
    )
    assert response.status_code == 400
    assert "Knowledge source has no vector database table" in response.json()["detail"]


def test_delete_page_knowledge_not_found(client: TestClient):
    """Deleting a page on a non-existent knowledge source returns 404."""
    response = client.delete("/api/v1/knowledge/999999/page/some-page")
    assert response.status_code == 404
    assert "Knowledge source not found" in response.json()["detail"]


def test_delete_page_no_table_name(client: TestClient, test_knowledge):
    """Deleting a page when the source has no vector table returns 400."""
    response = client.delete(f"/api/v1/knowledge/{test_knowledge.id}/page/some-page")
    assert response.status_code == 400
    assert "Knowledge source has no vector database table" in response.json()["detail"]


def test_page_endpoints_registered():
    """The page update/delete endpoints are registered on the router."""
    from app.api.knowledge import router
    paths = [route.path for route in router.routes if hasattr(route, 'path')]
    assert any('/{knowledge_id}/page/{page_id:path}' in p for p in paths), \
        "page endpoints should be registered"


def test_replace_page_upserts_before_deleting(monkeypatch):
    """replace_page persists the new content (upsert) before clearing old chunks,
    so an insert failure can never leave the page empty. Ordering is asserted via
    a call log."""
    from types import SimpleNamespace
    from unittest.mock import MagicMock
    from app.knowledge import page_editor

    calls = []

    knowledge = SimpleNamespace(
        schema="ai", table_name="d_test", source="site.com",
        organization_id=uuid4(), agent_links=[],
    )

    # One existing chunk for the page so replace_page proceeds.
    existing_chunk = SimpleNamespace(id="site.com/docs", content="old", meta_data={"url": "site.com/docs"})
    monkeypatch.setattr(page_editor, "get_page_chunks", lambda db, k, pid: [existing_chunk])

    fake_manager = MagicMock()
    fake_manager.vector_db.embedder = object()
    fake_manager.vector_db.upsert.side_effect = lambda *a, **kw: calls.append("upsert")
    monkeypatch.setattr(page_editor, "get_manager", lambda org_id: fake_manager)
    monkeypatch.setattr(page_editor, "embed_document", lambda *a, **kw: SimpleNamespace(embedding=[0.1]))

    def fake_delete(db, k, pid, exclude_canonical=False):
        calls.append(("delete", exclude_canonical))
        return 1
    monkeypatch.setattr(page_editor, "delete_page_chunks", fake_delete)

    db = MagicMock()
    db.commit.side_effect = lambda: calls.append("commit")

    replaced = page_editor.replace_page(db, knowledge, "site.com/docs", "new content", title="Docs")

    assert replaced == 1
    # upsert (persist new content) must happen before the destructive delete.
    assert calls[0] == "upsert"
    assert calls[1] == ("delete", True)
    assert "commit" in calls 
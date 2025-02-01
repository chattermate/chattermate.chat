import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database import Base, get_db
from fastapi import FastAPI
from app.models.user import User
from app.models.notification import Notification, NotificationType
from app.models.role import Role
from datetime import datetime, timezone
from uuid import uuid4
from app.api import notification as notification_router
from app.core.auth import get_current_user

# Test database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# Create test engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a test FastAPI app
app = FastAPI()
app.include_router(
    notification_router.router,
    prefix="/api/notifications",
    tags=["notifications"]
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
def test_role(db) -> Role:
    """Create a test role"""
    role = Role(
        id=1,
        name="Test Role",
        description="Test Role Description",
        is_default=True
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

@pytest.fixture
def test_user(db, test_role) -> User:
    """Create a test user"""
    user = User(
        id=uuid4(),
        email="test@example.com",
        hashed_password="hashed_password",
        is_active=True,
        organization_id=uuid4(),
        full_name="Test User",
        role_id=test_role.id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_notifications(db, test_user) -> list[Notification]:
    """Create test notifications"""
    notifications = []
    for i in range(3):
        notification = Notification(
            user_id=test_user.id,
            type=NotificationType.CHAT,
            title=f"Test Notification {i+1}",
            message=f"Test message {i+1}",
            is_read=i == 0,  # First notification is read
            notification_metadata={"test": True},
            created_at=datetime.now(timezone.utc)
        )
        notifications.append(notification)
        db.add(notification)
    db.commit()
    for n in notifications:
        db.refresh(n)
    return notifications

@pytest.fixture
def client(test_user) -> TestClient:
    """Create test client with mocked dependencies"""
    async def override_get_current_user():
        return test_user

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_db] = lambda: TestingSessionLocal()
    
    return TestClient(app)

def test_list_notifications(
    client,
    db,
    test_user,
    test_notifications
):
    """Test listing user's notifications"""
    response = client.get("/api/notifications")
    assert response.status_code == 200
    notifications = response.json()
    assert len(notifications) == 3
    assert notifications[0]["user_id"] == str(test_user.id)
    assert notifications[0]["type"] == NotificationType.CHAT.value

def test_list_notifications_pagination(
    client,
    db,
    test_user,
    test_notifications
):
    """Test notification listing with pagination"""
    response = client.get("/api/notifications?skip=1&limit=1")
    assert response.status_code == 200
    notifications = response.json()
    assert len(notifications) == 1

def test_mark_as_read(
    client,
    db,
    test_user,
    test_notifications
):
    """Test marking a notification as read"""
    unread_notification = next(n for n in test_notifications if not n.is_read)
    response = client.patch(f"/api/notifications/{unread_notification.id}/read")
    assert response.status_code == 200
    assert response.json()["message"] == "Notification marked as read"
    
    # Verify notification is marked as read in database
    db.refresh(unread_notification)  # Refresh from database
    assert unread_notification.is_read == True

def test_mark_as_read_not_found(
    client,
    db,
    test_user
):
    """Test marking non-existent notification as read"""
    response = client.patch("/api/notifications/999/read")
    assert response.status_code == 404
    assert response.json()["detail"] == "Notification not found"

def test_mark_as_read_wrong_user(
    client,
    db,
    test_user
):
    """Test marking another user's notification as read"""
    # Create notification for different user
    other_notification = Notification(
        user_id=uuid4(),  # Different user
        type="CHAT",
        title="Other Notification",
        message="Test message",
        notification_metadata={"test": True}
    )
    db.add(other_notification)
    db.commit()

    response = client.patch(f"/api/notifications/{other_notification.id}/read")
    assert response.status_code == 404
    assert response.json()["detail"] == "Notification not found"

def test_get_unread_count(
    client,
    db,
    test_user,
    test_notifications
):
    """Test getting unread notification count"""
    response = client.get("/api/notifications/unread-count")
    assert response.status_code == 200
    assert response.json()["count"] == 2  # Two unread notifications from fixture

def test_send_test_notification(
    client,
    db,
    test_user
):
    """Test sending a test notification"""
    response = client.post("/api/notifications/test")
    assert response.status_code == 200
    assert response.json()["message"] == "Test notification sent successfully"
    
    # Verify notification was created
    notification = db.query(Notification)\
        .filter_by(user_id=test_user.id)\
        .order_by(Notification.created_at.desc())\
        .first()
    assert notification is not None
    assert notification.title == "Test Notification"
    assert notification.type == NotificationType.CHAT 
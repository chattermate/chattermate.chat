"""
ChatterMate - Test Configuration
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
from sqlalchemy import create_engine, event, DDL
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database import Base
from typing import Generator
from sqlalchemy.schema import CreateTable, Table
from app.models.organization import Organization
from uuid import UUID, uuid4
from app.models.widget import Widget
from app.models.agent import Agent, AgentType
from app.models.ai_config import AIConfig, AIModelType
from app.models.customer import Customer
from app.models.user import User
from app.repositories.agent import AgentRepository
from app.repositories.widget import create_widget
from app.models.schemas.widget import WidgetCreate
from app.core.security import encrypt_api_key, get_password_hash, create_access_token, create_refresh_token, create_conversation_token
from unittest.mock import MagicMock

# Test database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# Create test engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Create TestingSessionLocal class
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@event.listens_for(engine, "connect")
def do_connect(dbapi_connection, connection_record):
    # Disable foreign key constraint enforcement
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

@event.listens_for(Table, 'before_create')
def _before_create_table(target, connection, **kw):
    # For SQLite, we need to remove schema prefixes
    if connection.engine.dialect.name == 'sqlite':
        target.schema = None

def create_tables():
    """Create all tables in the test database"""
    Base.metadata.create_all(bind=engine)

@pytest.fixture(scope="function")
def db() -> Generator:
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
def test_organization(db) -> Organization:
    """Create a test organization"""
    org = Organization(
        name="Test Organization",
        domain="test.com",
        timezone="UTC"
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org

@pytest.fixture
def test_organization_id(test_organization) -> UUID:
    """Return the ID of the test organization"""
    return test_organization.id

@pytest.fixture
def test_ai_config(db, test_organization) -> AIConfig:
    """Create a test AI config"""
    ai_config = AIConfig(
        organization_id=test_organization.id,
        model_type=AIModelType.OPENAI,
        model_name="gpt-4",
        encrypted_api_key=encrypt_api_key("test_key"),
        is_active=True
    )
    db.add(ai_config)
    db.commit()
    db.refresh(ai_config)
    return ai_config

@pytest.fixture
def test_agent(db, test_organization) -> Agent:
    """Create a test agent"""
    agent_repo = AgentRepository(db)
    agent = agent_repo.create_agent(
        name="Test Agent",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Test instructions"],
        org_id=test_organization.id
    )
    return agent

@pytest.fixture
def test_widget(db, test_agent) -> Widget:
    """Create a test widget"""
    widget = create_widget(
        db=db,
        widget=WidgetCreate(name="Test Widget", agent_id=test_agent.id),
        organization_id=test_agent.organization_id
    )
    return widget

@pytest.fixture
def test_customer(db, test_organization) -> Customer:
    """Create a test customer"""
    customer = Customer(
        id=uuid4(),
        organization_id=test_organization.id,
        email="test.customer@example.com",
        full_name="Test Customer"
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@pytest.fixture
def test_user(db, test_organization) -> User:
    """Create a test user"""
    user = User(
        id=uuid4(),
        organization_id=test_organization.id,
        email="test.user@example.com",
        full_name="Test User",
        hashed_password=get_password_hash("test_password"),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_access_token(test_user) -> str:
    """Create a test access token"""
    token_data = {
        "sub": str(test_user.id),
        "org": str(test_user.organization_id)
    }
    return create_access_token(token_data)

@pytest.fixture
def test_refresh_token(test_user) -> str:
    """Create a test refresh token"""
    token_data = {
        "sub": str(test_user.id),
        "org": str(test_user.organization_id)
    }
    return create_refresh_token(token_data)

@pytest.fixture
def test_conversation_token(test_widget, test_customer) -> str:
    """Create a test conversation token"""
    return create_conversation_token(
        widget_id=str(test_widget.id),
        customer_id=str(test_customer.id)
    )

@pytest.fixture
def mock_socketio():
    """Create a mock SocketIO instance"""
    mock_sio = MagicMock()
    mock_sio.emit = MagicMock()
    mock_sio.save_session = MagicMock()
    mock_sio.get_session = MagicMock()
    return mock_sio 
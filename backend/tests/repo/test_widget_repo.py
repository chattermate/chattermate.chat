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
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.widget import Widget
from app.models.schemas.widget import WidgetCreate
from app.repositories.widget import WidgetRepository
from app.models.agent import Agent, AgentType
from app.models.organization import Organization
from uuid import UUID, uuid4

# Test database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def engine():
    """Create a test database engine"""
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(engine):
    """Create a test database session"""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def test_organization_id(db):
    """Create a test organization and return its ID"""
    organization = Organization(
        name="Test Organization",
        domain="test.com",
        timezone="UTC"
    )
    db.add(organization)
    db.commit()
    db.refresh(organization)
    return organization.id

@pytest.fixture
def test_agent(db, test_organization_id):
    """Create a test agent"""
    agent = Agent(
        name="Test Agent",
        organization_id=test_organization_id,
        description="Test agent description",
        agent_type=AgentType.GENERAL,
        _instructions="Test instructions",
        is_active=True
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

@pytest.fixture
def test_widget(db, test_organization_id, test_agent):
    """Create a test widget"""
    widget_data = WidgetCreate(
        name="Test Widget",
        agent_id=test_agent.id
    )
    widget_repo = WidgetRepository(db)
    widget = widget_repo.create_widget(widget_data, test_organization_id)
    return widget

def test_create_widget(db, test_organization_id, test_agent):
    """Test creating a new widget"""
    widget_data = WidgetCreate(
        name="New Widget",
        agent_id=test_agent.id
    )
    
    widget_repo = WidgetRepository(db)
    widget = widget_repo.create_widget(widget_data, test_organization_id)
    assert widget is not None
    assert widget.name == widget_data.name
    assert widget.agent_id == test_agent.id
    assert widget.organization_id == test_organization_id

    # Verify widget was saved to database
    saved_widget = widget_repo.get_widget(str(widget.id))
    assert saved_widget is not None
    assert saved_widget.name == widget_data.name

def test_get_widget(db, test_widget):
    """Test retrieving a widget by ID"""
    # Get existing widget
    widget_repo = WidgetRepository(db)
    widget = widget_repo.get_widget(str(test_widget.id))
    assert widget is not None
    assert widget.id == test_widget.id
    assert widget.name == test_widget.name
    assert widget.agent_id == test_widget.agent_id
    assert widget.organization_id == test_widget.organization_id

    # Try to get non-existent widget
    non_existent_widget = widget_repo.get_widget(str(uuid4()))
    assert non_existent_widget is None

def test_get_widgets(db, test_organization_id, test_widget):
    """Test retrieving widgets by organization"""
    # Create another organization for testing
    other_org = Organization(
        name="Other Organization",
        domain="other.com",
        timezone="UTC"
    )
    db.add(other_org)
    db.commit()
    db.refresh(other_org)

    # Create an agent for the other organization
    other_agent = Agent(
        name="Other Agent",
        organization_id=other_org.id,
        description="Other agent description",
        agent_type=AgentType.GENERAL,
        _instructions="Other instructions",
        is_active=True
    )
    db.add(other_agent)
    db.commit()
    db.refresh(other_agent)

    # Create another widget in a different organization
    other_widget_data = WidgetCreate(
        name="Other Widget",
        agent_id=other_agent.id
    )
    widget_repo = WidgetRepository(db)
    widget_repo.create_widget(other_widget_data, other_org.id)

    # Get widgets for test organization
    widgets = widget_repo.get_widgets(test_organization_id)
    assert len(widgets) == 1
    assert widgets[0].id == test_widget.id
    assert widgets[0].name == test_widget.name
    assert widgets[0].organization_id == test_organization_id

    # Get widgets for other organization
    other_widgets = widget_repo.get_widgets(other_org.id)
    assert len(other_widgets) == 1
    assert other_widgets[0].name == other_widget_data.name
    assert other_widgets[0].organization_id == other_org.id

def test_delete_widget(db, test_widget):
    """Test deleting a widget"""
    # Delete existing widget
    widget_repo = WidgetRepository(db)
    widget_repo.delete_widget(str(test_widget.id))

    # Verify widget was deleted
    deleted_widget = widget_repo.get_widget(str(test_widget.id))
    assert deleted_widget is None

    # Try to delete non-existent widget (should not raise error)
    widget_repo.delete_widget(str(uuid4()))
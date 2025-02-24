"""
ChatterMate - Test Knowledge Repo
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
from app.repositories.knowledge import KnowledgeRepository
from app.models.knowledge import Knowledge, SourceType
from app.models.knowledge_to_agent import KnowledgeToAgent
from app.models.agent import Agent, AgentType
from uuid import uuid4

@pytest.fixture
def knowledge_repo(db):
    return KnowledgeRepository(db)

@pytest.fixture
def test_knowledge(db, test_organization_id):
    """Create a test knowledge source"""
    knowledge = Knowledge(
        organization_id=test_organization_id,
        source="/test/path/document.pdf",
        source_type=SourceType.FILE,
        schema="test_schema",
        table_name="test_table"
    )
    db.add(knowledge)
    db.commit()
    db.refresh(knowledge)
    return knowledge

@pytest.fixture
def test_agent(db, test_organization_id):
    """Create a test agent"""
    agent = Agent(
        name="Test Agent",
        display_name="Test Agent",
        description="A test agent",
        agent_type=AgentType.GENERAL,
        instructions=["Test instruction"],
        organization_id=test_organization_id,
        is_active=True
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

def test_create_knowledge(knowledge_repo, test_organization_id):
    """Test creating a new knowledge source"""
    knowledge = Knowledge(
        organization_id=test_organization_id,
        source="/test/path/new.pdf",
        source_type=SourceType.FILE,
        schema="test_schema",
        table_name="test_table"
    )
    
    created = knowledge_repo.create(knowledge)
    assert created is not None
    assert created.source == "/test/path/new.pdf"
    assert created.source_type == SourceType.FILE

def test_create_duplicate_knowledge(knowledge_repo, test_knowledge):
    """Test creating a duplicate knowledge source returns existing one"""
    duplicate = Knowledge(
        organization_id=test_knowledge.organization_id,
        source=test_knowledge.source,
        source_type=test_knowledge.source_type,
        schema=test_knowledge.schema,
        table_name=test_knowledge.table_name
    )
    
    created = knowledge_repo.create(duplicate)
    assert created.id == test_knowledge.id

def test_get_by_id(knowledge_repo, test_knowledge):
    """Test retrieving a knowledge source by ID"""
    knowledge = knowledge_repo.get_by_id(test_knowledge.id)
    assert knowledge is not None
    assert knowledge.id == test_knowledge.id
    assert knowledge.source == test_knowledge.source

def test_get_by_id_nonexistent(knowledge_repo):
    """Test retrieving a nonexistent knowledge source"""
    knowledge = knowledge_repo.get_by_id(999)
    assert knowledge is None

def test_get_by_agent(knowledge_repo, test_knowledge, test_agent, db):
    """Test retrieving knowledge sources for an agent"""
    # Create a link to the test knowledge
    link = KnowledgeToAgent(
        knowledge_id=test_knowledge.id,
        agent_id=test_agent.id
    )
    db.add(link)
    
    # Create another knowledge source and link
    another_knowledge = Knowledge(
        organization_id=test_knowledge.organization_id,
        source="/test/path/another.pdf",
        source_type=SourceType.FILE,
        schema="test_schema",
        table_name="test_table"
    )
    db.add(another_knowledge)
    db.flush()
    
    another_link = KnowledgeToAgent(
        knowledge_id=another_knowledge.id,
        agent_id=test_agent.id
    )
    db.add(another_link)
    db.commit()

    # Test pagination
    knowledge_sources = knowledge_repo.get_by_agent(test_agent.id, skip=0, limit=1)
    assert len(knowledge_sources) == 1
    
    knowledge_sources = knowledge_repo.get_by_agent(test_agent.id, skip=0, limit=10)
    assert len(knowledge_sources) == 2
    assert all(k.id in [test_knowledge.id, another_knowledge.id] for k in knowledge_sources)

def test_count_by_agent(knowledge_repo, test_knowledge, test_agent, db):
    """Test counting knowledge sources for an agent"""
    # Create a link to the test knowledge
    link = KnowledgeToAgent(
        knowledge_id=test_knowledge.id,
        agent_id=test_agent.id
    )
    db.add(link)
    db.commit()

    count = knowledge_repo.count_by_agent(test_agent.id)
    assert count == 1

def test_get_by_org(knowledge_repo, test_knowledge, db):
    """Test retrieving knowledge sources for an organization"""
    # Create another knowledge source for the same org
    another_knowledge = Knowledge(
        organization_id=test_knowledge.organization_id,
        source="/test/path/another.pdf",
        source_type=SourceType.FILE,
        schema="test_schema",
        table_name="test_table"
    )
    db.add(another_knowledge)
    db.commit()

    knowledge_sources = knowledge_repo.get_by_org(test_knowledge.organization_id)
    assert len(knowledge_sources) == 2
    assert all(k.organization_id == test_knowledge.organization_id for k in knowledge_sources)

def test_get_by_organization_paginated(knowledge_repo, test_knowledge, db):
    """Test retrieving paginated knowledge sources for an organization"""
    # Create another knowledge source for the same org
    another_knowledge = Knowledge(
        organization_id=test_knowledge.organization_id,
        source="/test/path/another.pdf",
        source_type=SourceType.FILE,
        schema="test_schema",
        table_name="test_table"
    )
    db.add(another_knowledge)
    db.commit()

    # Test pagination
    knowledge_sources = knowledge_repo.get_by_organization(
        test_knowledge.organization_id,
        skip=0,
        limit=1
    )
    assert len(knowledge_sources) == 1

    knowledge_sources = knowledge_repo.get_by_organization(
        test_knowledge.organization_id,
        skip=0,
        limit=10
    )
    assert len(knowledge_sources) == 2

def test_count_by_organization(knowledge_repo, test_knowledge, db):
    """Test counting knowledge sources for an organization"""
    # Create another knowledge source for the same org
    another_knowledge = Knowledge(
        organization_id=test_knowledge.organization_id,
        source="/test/path/another.pdf",
        source_type=SourceType.FILE,
        schema="test_schema",
        table_name="test_table"
    )
    db.add(another_knowledge)
    db.commit()

    count = knowledge_repo.count_by_organization(test_knowledge.organization_id)
    assert count == 2

def test_get_by_sources(knowledge_repo, test_knowledge, db):
    """Test retrieving knowledge sources by source URLs"""
    # Create another knowledge source
    another_knowledge = Knowledge(
        organization_id=test_knowledge.organization_id,
        source="/test/path/another.pdf",
        source_type=SourceType.FILE,
        schema="test_schema",
        table_name="test_table"
    )
    db.add(another_knowledge)
    db.commit()

    sources = [test_knowledge.source, another_knowledge.source]
    knowledge_sources = knowledge_repo.get_by_sources(test_knowledge.organization_id, sources)
    assert len(knowledge_sources) == 2
    assert all(k.source in sources for k in knowledge_sources)

def test_delete(knowledge_repo, test_knowledge):
    """Test deleting a knowledge source"""
    success = knowledge_repo.delete(test_knowledge.id)
    assert success is True

    # Verify deletion
    knowledge = knowledge_repo.get_by_id(test_knowledge.id)
    assert knowledge is None

def test_delete_nonexistent(knowledge_repo):
    """Test deleting a nonexistent knowledge source"""
    success = knowledge_repo.delete(999)
    assert success is False

def test_delete_with_data(knowledge_repo, test_knowledge, test_agent, db):
    """Test deleting a knowledge source with its data"""
    # Create a link to test cascade deletion
    link = KnowledgeToAgent(
        knowledge_id=test_knowledge.id,
        agent_id=test_agent.id
    )
    db.add(link)
    db.commit()

    success = knowledge_repo.delete_with_data(test_knowledge.id)
    assert success is True

    # Verify knowledge source deletion
    knowledge = knowledge_repo.get_by_id(test_knowledge.id)
    assert knowledge is None

    # Verify link deletion
    link = db.query(KnowledgeToAgent).filter(
        KnowledgeToAgent.knowledge_id == test_knowledge.id
    ).first()
    assert link is None 
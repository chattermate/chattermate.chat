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
from app.repositories.knowledge_to_agent import KnowledgeToAgentRepository
from app.models.knowledge_to_agent import KnowledgeToAgent
from app.models.knowledge import Knowledge, SourceType
from app.models.agent import Agent, AgentType
from uuid import uuid4

@pytest.fixture
def link_repo(db):
    return KnowledgeToAgentRepository(db)

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
        instructions="Test instructions",
        organization_id=test_organization_id,
        is_active=True
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

@pytest.fixture
def test_link(db, test_knowledge, test_agent):
    """Create a test knowledge-to-agent link"""
    link = KnowledgeToAgent(
        knowledge_id=test_knowledge.id,
        agent_id=test_agent.id
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return link

def test_create_link(link_repo, test_knowledge, test_agent):
    """Test creating a new knowledge-to-agent link"""
    link = KnowledgeToAgent(
        knowledge_id=test_knowledge.id,
        agent_id=test_agent.id
    )
    
    created_link = link_repo.create(link)
    assert created_link is not None
    assert created_link.knowledge_id == test_knowledge.id
    assert created_link.agent_id == test_agent.id

def test_create_duplicate_link(link_repo, test_link):
    """Test creating a duplicate link returns existing link"""
    duplicate_link = KnowledgeToAgent(
        knowledge_id=test_link.knowledge_id,
        agent_id=test_link.agent_id
    )
    
    created_link = link_repo.create(duplicate_link)
    assert created_link.id == test_link.id

def test_get_by_ids(link_repo, test_link):
    """Test retrieving a link by knowledge_id and agent_id"""
    link = link_repo.get_by_ids(test_link.knowledge_id, test_link.agent_id)
    assert link is not None
    assert link.id == test_link.id
    assert link.knowledge_id == test_link.knowledge_id
    assert link.agent_id == test_link.agent_id

def test_get_by_ids_nonexistent(link_repo):
    """Test retrieving a nonexistent link"""
    link = link_repo.get_by_ids(999, uuid4())
    assert link is None

def test_get_by_agent(link_repo, test_link, db, test_organization_id, test_agent):
    """Test retrieving all links for an agent"""
    # Create another link for the same agent
    another_knowledge = Knowledge(
        organization_id=test_organization_id,
        source="/test/path/another.pdf",
        source_type=SourceType.FILE,
        schema="test_schema",
        table_name="test_table"
    )
    db.add(another_knowledge)
    db.commit()

    another_link = KnowledgeToAgent(
        knowledge_id=another_knowledge.id,
        agent_id=test_agent.id
    )
    db.add(another_link)
    db.commit()

    # Get links for agent
    links = link_repo.get_by_agent(test_agent.id)
    assert len(links) == 2
    assert all(link.agent_id == test_agent.id for link in links)

def test_delete_by_ids(link_repo, test_link):
    """Test deleting a link by knowledge_id and agent_id"""
    success = link_repo.delete_by_ids(test_link.knowledge_id, test_link.agent_id)
    assert success is True

    # Verify deletion
    link = link_repo.get_by_ids(test_link.knowledge_id, test_link.agent_id)
    assert link is None

def test_delete_by_ids_nonexistent(link_repo):
    """Test deleting a nonexistent link"""
    success = link_repo.delete_by_ids(999, uuid4())
    assert success is False

def test_delete(link_repo, test_link):
    """Test deleting a link by ID"""
    success = link_repo.delete(test_link.id)
    assert success is True

    # Verify deletion
    link = link_repo.get_by_ids(test_link.knowledge_id, test_link.agent_id)
    assert link is None

def test_delete_nonexistent(link_repo):
    """Test deleting a nonexistent link by ID"""
    success = link_repo.delete(999)
    assert success is False 
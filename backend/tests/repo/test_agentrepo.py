"""
ChatterMate - Test Agentrepo
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
from app.models.agent import Agent, AgentType
from app.repositories.agent import AgentRepository
import json

@pytest.fixture
def agent_repo(db):
    """Create an agent repository instance"""
    return AgentRepository(db)

def test_create_agent(agent_repo, test_organization_id):
    """Test creating a new agent"""
    name = "Test Agent"
    agent_type = AgentType.CUSTOMER_SUPPORT
    instructions = ["Instruction 1", "Instruction 2"]
    tools = [{"name": "tool1", "description": "Tool 1"}]
    description = "Test agent description"

    agent = agent_repo.create_agent(
        name=name,
        agent_type=agent_type,
        instructions=instructions,
        org_id=test_organization_id,
        description=description,
        tools=tools,
        is_default=True,
        is_active=True
    )

    assert agent.name == name
    assert agent.agent_type == agent_type
    assert agent.instructions == instructions
    assert agent.organization_id == test_organization_id
    assert agent.description == description
    assert json.loads(agent.tools) == tools
    assert agent.is_default is True
    assert agent.is_active is True

def test_create_agent_with_string_instructions(agent_repo, test_organization_id):
    """Test creating an agent with string instructions"""
    instruction = "Single instruction"
    
    agent = agent_repo.create_agent(
        name="Test Agent",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=instruction,
        org_id=test_organization_id
    )

    assert agent.instructions == [instruction]

def test_get_agent(agent_repo, test_organization_id):
    """Test retrieving an agent by ID"""
    # Create test agent
    agent = agent_repo.create_agent(
        name="Test Agent",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Test instruction"],
        org_id=test_organization_id
    )

    # Retrieve agent
    retrieved_agent = agent_repo.get_agent(agent.id)
    assert retrieved_agent.id == agent.id
    assert retrieved_agent.name == agent.name

def test_get_org_agents(agent_repo, test_organization_id):
    """Test retrieving all agents for an organization"""
    # Create multiple test agents
    agent1 = agent_repo.create_agent(
        name="Agent 1",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Instruction"],
        org_id=test_organization_id,
        is_active=True
    )
    agent2 = agent_repo.create_agent(
        name="Agent 2",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Instruction"],
        org_id=test_organization_id,
        is_active=False
    )

    # Test getting all agents
    all_agents = agent_repo.get_org_agents(test_organization_id, active_only=False)
    assert len(all_agents) == 2

    # Test getting only active agents
    active_agents = agent_repo.get_org_agents(test_organization_id, active_only=True)
    assert len(active_agents) == 1
    assert active_agents[0].id == agent1.id

def test_get_default_agent(agent_repo, test_organization_id):
    """Test retrieving default agent for an organization"""
    # Create multiple agents, one default
    default_agent = agent_repo.create_agent(
        name="Default Agent",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Instruction"],
        org_id=test_organization_id,
        is_default=True,
        is_active=True
    )
    agent_repo.create_agent(
        name="Non-default Agent",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Instruction"],
        org_id=test_organization_id,
        is_default=False,
        is_active=True
    )

    # Get default agent
    retrieved_default = agent_repo.get_default_agents(test_organization_id)
    assert retrieved_default.id == default_agent.id
    assert retrieved_default.is_default is True

def test_update_agent(agent_repo, test_organization_id):
    """Test updating an agent"""
    # Create test agent
    agent = agent_repo.create_agent(
        name="Test Agent",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Original instruction"],
        org_id=test_organization_id
    )

    # Update agent
    new_name = "Updated Agent"
    new_instructions = ["Updated instruction"]
    updated_agent = agent_repo.update_agent(
        agent.id,
        name=new_name,
        instructions=new_instructions
    )

    assert updated_agent.name == new_name
    assert updated_agent.instructions == new_instructions

def test_delete_agent(agent_repo, test_organization_id):
    """Test soft deleting an agent"""
    # Create test agent
    agent = agent_repo.create_agent(
        name="Test Agent",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Instruction"],
        org_id=test_organization_id,
        is_active=True
    )

    # Delete agent
    success = agent_repo.delete_agent(agent.id)
    assert success is True

    # Verify agent is inactive
    deleted_agent = agent_repo.get_agent(agent.id)
    assert deleted_agent.is_active is False

def test_get_active_agents(agent_repo, test_organization_id):
    """Test retrieving active agents"""
    # Create agents with different active states
    active_agent = agent_repo.create_agent(
        name="Active Agent",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Instruction"],
        org_id=test_organization_id,
        is_active=True
    )
    agent_repo.create_agent(
        name="Inactive Agent",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Instruction"],
        org_id=test_organization_id,
        is_active=False
    )

    # Get active agents
    active_agents = agent_repo.get_active_agents(test_organization_id)
    assert len(active_agents) == 1
    assert active_agents[0].id == active_agent.id

def test_get_by_agent_id(agent_repo, test_organization_id):
    """Test retrieving agent by ID with relationships"""
    # Create test agent
    agent = agent_repo.create_agent(
        name="Test Agent",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Instruction"],
        org_id=test_organization_id
    )

    # Retrieve agent with relationships
    retrieved_agent = agent_repo.get_by_agent_id(str(agent.id))
    assert retrieved_agent.id == agent.id
    assert retrieved_agent.name == agent.name
    # Note: Additional relationship assertions would go here if the test database
    # included related organization and group records 
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
from uuid import uuid4
from sqlalchemy.orm import Session

from app.repositories.mcp_tool import MCPToolRepository
from app.models.mcp_tool import MCPTransportType, MCPTool, MCPToolToAgent
from tests.conftest import TestingSessionLocal, create_tables, Base


@pytest.fixture(scope="function")
def db() -> Session:
    create_tables()
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=session.bind)


def _create_tool(repo: MCPToolRepository, org_id):
    return repo.create_mcp_tool(
        name="Test MCP Tool",
        description="Test description",
        transport_type=MCPTransportType.STDIO,
        command="npx",
        args=["-y", "@modelcontextprotocol/server-filesystem"],
        env_vars={"FOO": "bar"},
        organization_id=org_id,
        enabled=True,
    )


def test_create_and_get_mcp_tool(db: Session):
    repo = MCPToolRepository(db)
    org_id = uuid4()

    created = _create_tool(repo, org_id)
    assert isinstance(created, MCPTool)
    assert created.id is not None
    assert created.name == "Test MCP Tool"

    fetched = repo.get_mcp_tool(created.id)
    assert fetched is not None
    assert fetched.id == created.id


def test_get_by_name_and_org(db: Session):
    repo = MCPToolRepository(db)
    org_id = uuid4()
    other_org = uuid4()

    tool = _create_tool(repo, org_id)
    _create_tool(repo, other_org)

    same = repo.get_by_name("Test MCP Tool", org_id)
    assert same is not None
    assert same.id == tool.id

    none_other = repo.get_by_name("Does Not Exist", org_id)
    assert none_other is None


def test_get_org_mcp_tools_enabled_flag(db: Session):
    repo = MCPToolRepository(db)
    org_id = uuid4()

    t1 = _create_tool(repo, org_id)
    t2 = repo.create_mcp_tool(
        name="Disabled Tool",
        description="",
        transport_type=MCPTransportType.HTTP,
        url="https://example.com/mcp",
        headers={"Authorization": "Bearer token"},
        timeout=30,
        terminate_on_close=False,
        organization_id=org_id,
        enabled=False,
    )

    enabled_only = repo.get_org_mcp_tools(org_id, enabled_only=True)
    assert t1 in enabled_only
    assert t2 not in enabled_only

    all_tools = repo.get_org_mcp_tools(org_id, enabled_only=False)
    assert set(a.id for a in all_tools) == {t1.id, t2.id}


def test_update_and_delete_mcp_tool(db: Session):
    repo = MCPToolRepository(db)
    org_id = uuid4()
    tool = _create_tool(repo, org_id)

    updated = repo.update_mcp_tool(tool.id, description="Updated", enabled=False)
    assert updated.description == "Updated"
    assert updated.enabled is False

    assert repo.delete_mcp_tool(tool.id) is True
    assert repo.get_mcp_tool(tool.id) is None


def test_agent_associations(db: Session):
    repo = MCPToolRepository(db)
    org_id = uuid4()
    tool = _create_tool(repo, org_id)
    agent_id = uuid4()

    assoc = repo.add_mcp_tool_to_agent(tool.id, agent_id)
    assert isinstance(assoc, MCPToolToAgent)
    assert assoc.mcp_tool_id == tool.id
    assert assoc.agent_id == agent_id

    # Adding again returns existing association
    again = repo.add_mcp_tool_to_agent(tool.id, agent_id)
    assert again.id == assoc.id

    tools_for_agent = repo.get_agent_mcp_tools(agent_id)
    assert any(t.id == tool.id for t in tools_for_agent)

    agent_ids = repo.get_mcp_tool_agents(tool.id)
    assert agent_id in agent_ids

    # Remove link
    assert repo.remove_mcp_tool_from_agent(tool.id, agent_id) is True
    assert repo.remove_mcp_tool_from_agent(tool.id, agent_id) is False


def test_get_mcp_tool_with_agents(db: Session):
    repo = MCPToolRepository(db)
    org_id = uuid4()
    tool = _create_tool(repo, org_id)
    agent_id = uuid4()
    repo.add_mcp_tool_to_agent(tool.id, agent_id)

    fetched = repo.get_mcp_tool_with_agents(tool.id)
    assert fetched is not None
    # Ensure relationship is accessible
    assert hasattr(fetched, "agent_links")


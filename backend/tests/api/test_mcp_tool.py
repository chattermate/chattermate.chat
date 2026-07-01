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

"""
ChatterMate - MCP Tool API Tests
"""

import pytest
from uuid import uuid4
from fastapi.testclient import TestClient
from fastapi import FastAPI

from app.api import mcp_tool as mcp_api
from app.core.auth import get_current_user, require_permissions
from app.database import get_db
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.agent import Agent, AgentType
from app.models.mcp_tool import MCPTransportType
from app.models.schemas.mcp_tool import MCPToolCreate, MCPToolUpdate, MCPToolToAgentCreate


app = FastAPI()
app.include_router(mcp_api.router, prefix="/api/mcp", tags=["mcp"])


@pytest.fixture
def client(db) -> TestClient:
    # Minimal user with permissions
    test_user = User(
        id=uuid4(),
        email="test@example.com",
        hashed_password="x",
        is_active=True,
        organization_id=uuid4(),
    )
    db.add(test_user)
    # Create a role with super_admin permission to bypass permission checks
    super_admin_perm = Permission(name="super_admin", description="All access")
    db.add(super_admin_perm)
    db.commit()
    db.refresh(super_admin_perm)

    role = Role(name="Admin", organization_id=test_user.organization_id)
    role.permissions = [super_admin_perm]
    db.add(role)
    db.commit()
    db.refresh(role)
    test_user.role_id = role.id
    db.add(test_user)
    db.commit()
    db.refresh(test_user)

    async def override_get_current_user():
        return test_user

    async def override_require_permissions(*args, **kwargs):
        return test_user

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_db] = override_get_db

    return TestClient(app)


def _create_agent(db, org_id):
    agent = Agent(
        id=uuid4(),
        name="A",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        _instructions="[]",
        is_active=True,
        organization_id=org_id,
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


def test_create_and_get_mcp_tool(client: TestClient, db):
    # Disable enterprise gating for tests
    mcp_api.HAS_ENTERPRISE = False
    # Fetch the user created in fixture
    user = db.query(User).first()

    # Create an MCP tool
    payload = {
        "name": "Tool1",
        "description": "desc",
        "transport_type": MCPTransportType.STDIO.value,
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
        "env_vars": {"FOO": "bar"},
        "enabled": True,
    }

    resp = client.post("/api/mcp", json=payload)
    assert resp.status_code == 200
    tool = resp.json()
    assert tool["name"] == "Tool1"
    tool_id = tool["id"]

    # Get tool by id
    resp2 = client.get(f"/api/mcp/{tool_id}")
    assert resp2.status_code == 200
    assert resp2.json()["id"] == tool_id


def test_list_update_delete_mcp_tool(client: TestClient, db):
    # Ensure enterprise check passes by forcing HAS_ENTERPRISE False
    mcp_api.HAS_ENTERPRISE = False

    # Create another tool
    payload = {
        "name": "Tool2",
        "description": "",
        "transport_type": MCPTransportType.HTTP.value,
        "url": "https://example.com/mcp",
        "headers": {"Authorization": "Bearer"},
        "timeout": 15,
        "enabled": False,
    }
    resp = client.post("/api/mcp", json=payload)
    assert resp.status_code == 200
    tool = resp.json()
    tool_id = tool["id"]

    # List tools
    resp2 = client.get("/api/mcp?enabled_only=false")
    assert resp2.status_code == 200
    tools = resp2.json()
    assert any(t["id"] == tool_id for t in tools)

    # Update tool
    upd = {"description": "updated", "enabled": True}
    resp3 = client.put(f"/api/mcp/{tool_id}", json=upd)
    assert resp3.status_code == 200
    assert resp3.json()["description"] == "updated"
    assert resp3.json()["enabled"] is True

    # Delete tool
    resp4 = client.delete(f"/api/mcp/{tool_id}")
    assert resp4.status_code == 200
    assert resp4.json()["message"] == "MCP tool deleted successfully"


def test_agent_association_endpoints(client: TestClient, db):
    # Ensure enterprise check passes by forcing HAS_ENTERPRISE False
    mcp_api.HAS_ENTERPRISE = False
    # Create a tool
    payload = {
        "name": "Tool3",
        "description": "",
        "transport_type": MCPTransportType.STDIO.value,
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
        "enabled": True,
    }
    tool_resp = client.post("/api/mcp", json=payload)
    assert tool_resp.status_code == 200
    tool_id = tool_resp.json()["id"]

    # Create agent in same org
    user = db.query(User).first()
    agent = _create_agent(db, user.organization_id)

    # Add association
    assoc_payload = {"mcp_tool_id": tool_id, "agent_id": str(agent.id)}
    resp = client.post("/api/mcp/agent-association", json=assoc_payload)
    assert resp.status_code == 200
    assoc = resp.json()
    assert assoc["agent_id"] == str(agent.id)
    assert assoc["mcp_tool_id"] == tool_id

    # Get agent mcp tools
    resp2 = client.get(f"/api/mcp/agent/{agent.id}")
    assert resp2.status_code == 200
    data = resp2.json()
    assert data["id"] == str(agent.id)
    assert any(t["id"] == tool_id for t in data["mcp_tools"])

    # Remove association
    resp3 = client.delete(f"/api/mcp/agent-association/{tool_id}/{agent.id}")
    assert resp3.status_code == 200
    assert resp3.json()["message"] == "MCP tool removed from agent successfully"



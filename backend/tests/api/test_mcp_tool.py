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
from app.repositories.mcp_tool import MCPToolRepository
from app.models.schemas.mcp_tool import (
    MCPToolCreate, MCPToolUpdate, MCPToolToAgentCreate,
    MAX_USAGE_GUIDANCE_CHARS, SECRET_MASK,
)
from app.models.ticket_settings import OrganizationTicketSettings


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




def test_test_mcp_tool_endpoint(client: TestClient, db):
    """POST /{id}/test proxies the manager's connection probe."""
    from unittest.mock import AsyncMock, patch

    mcp_api.HAS_ENTERPRISE = False
    payload = {
        "name": "Probe",
        "transport_type": MCPTransportType.STDIO.value,
        "command": "npx",
        "args": ["-y", "@elastic/mcp-server-elasticsearch"],
        "enabled": True,
    }
    tool_id = client.post("/api/mcp", json=payload).json()["id"]

    with patch.object(
        mcp_api.MCPToolsManager, "test_tool_config",
        new=AsyncMock(return_value={"success": False, "functions": [], "error": "[Errno 2] No such file or directory: 'npx'"}),
    ):
        resp = client.post(f"/api/mcp/{tool_id}/test")

    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is False
    assert "npx" in body["error"]

    # Unknown id → 404
    resp2 = client.post("/api/mcp/999999/test")
    assert resp2.status_code == 404


def test_test_mcp_tool_endpoint_other_org_forbidden(client: TestClient, db):
    """Testing a tool owned by another organization is rejected."""
    from app.models.mcp_tool import MCPTool

    mcp_api.HAS_ENTERPRISE = False
    other_org_tool = MCPTool(
        name="Other org tool",
        transport_type=MCPTransportType.STDIO,
        command="npx",
        args=["-y", "some-server"],
        enabled=True,
        organization_id=uuid4(),
    )
    db.add(other_org_tool)
    db.commit()
    db.refresh(other_org_tool)

    resp = client.post(f"/api/mcp/{other_org_tool.id}/test")
    assert resp.status_code == 403


def test_secrets_are_masked_on_the_way_out(client: TestClient, db):
    """Credentials must never reach the browser — the edit form only ever
    sees the mask."""
    mcp_api.HAS_ENTERPRISE = False

    resp = client.post("/api/mcp", json={
        "name": "MaskedTool",
        "transport_type": MCPTransportType.STDIO.value,
        "command": "uvx",
        "env_vars": {"AWS_SECRET_ACCESS_KEY": "super-secret", "AWS_REGION": "us-east-1"},
        "enabled": True,
    })
    assert resp.status_code == 200
    tool_id = resp.json()["id"]

    # Keys stay visible so the operator knows what is set; values do not.
    assert resp.json()["env_vars"] == {
        "AWS_SECRET_ACCESS_KEY": SECRET_MASK,
        "AWS_REGION": SECRET_MASK,
    }
    assert client.get(f"/api/mcp/{tool_id}").json()["env_vars"] == {
        "AWS_SECRET_ACCESS_KEY": SECRET_MASK,
        "AWS_REGION": SECRET_MASK,
    }


def test_update_keeps_secrets_the_form_sent_back_masked(client: TestClient, db):
    """Fixing a typo in an unrelated field must not cost a credential rotation."""
    mcp_api.HAS_ENTERPRISE = False

    resp = client.post("/api/mcp", json={
        "name": "KeepSecret",
        "transport_type": MCPTransportType.HTTP.value,
        "url": "https://example.com/mpc",
        "headers": {"Authorization": "ApiKey real-key"},
        "enabled": True,
    })
    tool_id = resp.json()["id"]

    # The form round-trips the mask and corrects only the URL typo.
    upd = client.put(f"/api/mcp/{tool_id}", json={
        "url": "https://example.com/mcp",
        "headers": {"Authorization": SECRET_MASK},
    })
    assert upd.status_code == 200
    assert upd.json()["url"] == "https://example.com/mcp"

    stored = MCPToolRepository(db).get_mcp_tool(tool_id)
    assert stored.headers == {"Authorization": "ApiKey real-key"}


def test_update_replaces_a_secret_the_operator_retyped(client: TestClient, db):
    mcp_api.HAS_ENTERPRISE = False

    resp = client.post("/api/mcp", json={
        "name": "RotateSecret",
        "transport_type": MCPTransportType.HTTP.value,
        "url": "https://example.com/mcp",
        "headers": {"Authorization": "ApiKey old-key"},
        "enabled": True,
    })
    tool_id = resp.json()["id"]

    client.put(f"/api/mcp/{tool_id}", json={"headers": {"Authorization": "ApiKey new-key"}})

    stored = MCPToolRepository(db).get_mcp_tool(tool_id)
    assert stored.headers == {"Authorization": "ApiKey new-key"}


def test_delete_clears_the_investigation_selection(client: TestClient, db):
    """investigation_mcp_tool_ids has no foreign key, so a deleted connector
    would otherwise stay 'configured' and every later run would report fewer
    connectors loaded than configured."""
    mcp_api.HAS_ENTERPRISE = False
    user = db.query(User).first()

    resp = client.post("/api/mcp", json={
        "name": "Doomed",
        "transport_type": MCPTransportType.HTTP.value,
        "url": "https://example.com/mcp",
        "enabled": True,
    })
    tool_id = resp.json()["id"]

    settings = OrganizationTicketSettings(
        organization_id=user.organization_id,
        investigation_mcp_tool_ids=[tool_id, 999],
    )
    db.add(settings)
    db.commit()

    assert client.get(f"/api/mcp/{tool_id}/references").json()["used_in_investigations"] is True

    assert client.delete(f"/api/mcp/{tool_id}").status_code == 200
    db.refresh(settings)
    assert settings.investigation_mcp_tool_ids == [999]


def test_references_names_the_agents_using_the_tool(client: TestClient, db):
    mcp_api.HAS_ENTERPRISE = False
    user = db.query(User).first()
    agent = _create_agent(db, user.organization_id)

    resp = client.post("/api/mcp", json={
        "name": "Referenced",
        "transport_type": MCPTransportType.HTTP.value,
        "url": "https://example.com/mcp",
        "enabled": True,
    })
    tool_id = resp.json()["id"]
    client.post("/api/mcp/agent-association", json={
        "mcp_tool_id": tool_id, "agent_id": str(agent.id)
    })

    refs = client.get(f"/api/mcp/{tool_id}/references")
    assert refs.status_code == 200
    assert refs.json() == {"agents": [agent.name], "used_in_investigations": False}


def test_update_rejects_a_transport_switch_with_nothing_to_connect_to(client: TestClient, db):
    """The update path must not accept a state the create path rejects."""
    mcp_api.HAS_ENTERPRISE = False

    resp = client.post("/api/mcp", json={
        "name": "SwitchMe",
        "transport_type": MCPTransportType.STDIO.value,
        "command": "uvx",
        "enabled": True,
    })
    tool_id = resp.json()["id"]

    bad = client.put(f"/api/mcp/{tool_id}", json={
        "transport_type": MCPTransportType.HTTP.value, "url": ""
    })
    assert bad.status_code == 400
    assert "URL is required" in bad.json()["detail"]

    good = client.put(f"/api/mcp/{tool_id}", json={
        "transport_type": MCPTransportType.HTTP.value, "url": "https://example.com/mcp"
    })
    assert good.status_code == 200
    assert good.json()["transport_type"] == MCPTransportType.HTTP.value


def test_update_rejects_clearing_the_stdio_command(client: TestClient, db):
    mcp_api.HAS_ENTERPRISE = False

    resp = client.post("/api/mcp", json={
        "name": "NeedsCommand",
        "transport_type": MCPTransportType.STDIO.value,
        "command": "uvx",
        "enabled": True,
    })
    tool_id = resp.json()["id"]

    bad = client.put(f"/api/mcp/{tool_id}", json={"command": ""})
    assert bad.status_code == 400
    assert "Command is required" in bad.json()["detail"]


GUIDANCE = "Indices: app-logs-*. Order id is fields.order_ref, not order_id."


def test_usage_guidance_round_trips_and_is_not_masked(client: TestClient, db):
    """Guidance is prompt text, not a credential — masking it would make the
    edit form unable to show the operator what they wrote."""
    mcp_api.HAS_ENTERPRISE = False

    resp = client.post("/api/mcp", json={
        "name": "GuidedTool",
        "transport_type": MCPTransportType.HTTP.value,
        "url": "https://example.com/mcp",
        "usage_guidance": GUIDANCE,
        "enabled": True,
    })
    assert resp.status_code == 200
    assert resp.json()["usage_guidance"] == GUIDANCE
    tool_id = resp.json()["id"]

    assert client.get(f"/api/mcp/{tool_id}").json()["usage_guidance"] == GUIDANCE

    updated = client.put(f"/api/mcp/{tool_id}", json={"usage_guidance": "Replaced."})
    assert updated.status_code == 200
    assert updated.json()["usage_guidance"] == "Replaced."


def test_usage_guidance_defaults_to_none(client: TestClient, db):
    """A connector nobody has documented must stay untouched."""
    mcp_api.HAS_ENTERPRISE = False

    resp = client.post("/api/mcp", json={
        "name": "UndocumentedTool",
        "transport_type": MCPTransportType.HTTP.value,
        "url": "https://example.com/mcp",
        "enabled": True,
    })
    assert resp.status_code == 200
    assert resp.json()["usage_guidance"] is None


def test_overlong_usage_guidance_is_rejected(client: TestClient, db):
    mcp_api.HAS_ENTERPRISE = False

    resp = client.post("/api/mcp", json={
        "name": "TooMuchGuidance",
        "transport_type": MCPTransportType.HTTP.value,
        "url": "https://example.com/mcp",
        "usage_guidance": "x" * (MAX_USAGE_GUIDANCE_CHARS + 1),
        "enabled": True,
    })
    assert resp.status_code == 422

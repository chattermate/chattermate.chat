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
ChatterMate - MCP Manager Tests
"""

import pytest
import asyncio
from unittest.mock import patch, AsyncMock, MagicMock
from time import monotonic
from uuid import uuid4

from app.models.mcp_tool import MCPTransportType
from app.tools.mcp_manager import (
    CHAT_CONNECT_BUDGET_SECONDS,
    CONNECT_TIMEOUT_MARGIN_SECONDS,
    DEFAULT_TIMEOUT_SECONDS,
    HANDSHAKE_REQUESTS,
    MCPToolsManager,
    TEST_CONNECT_BUDGET_SECONDS,
    _connect_timeout,
    _pending_teardowns,
    _session_timeout,
    cleanup_mcp_tools,
    initialize_mcp_tools,
)


@pytest.mark.asyncio
async def test_initialize_mcp_tools_no_ids():
    manager = MCPToolsManager()
    tools = await manager.initialize_mcp_tools(agent_id="", org_id="")
    assert tools == []


@pytest.mark.asyncio
async def test_initialize_mcp_tools_stdio_success():
    manager = MCPToolsManager()
    agent_id = str(uuid4())
    org_id = str(uuid4())

    # Mock repo to return a single STDIO tool config
    mock_tool_config = MagicMock()
    mock_tool_config.name = "FS Tool"
    mock_tool_config.transport_type = type("T", (), {"__eq__": lambda s, o: False})()  # placeholder
    from app.models.mcp_tool import MCPTransportType
    mock_tool_config.transport_type = MCPTransportType.STDIO
    mock_tool_config.timeout = None
    mock_tool_config.command = "npx"
    mock_tool_config.args = ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
    mock_tool_config.env_vars = {"FOO": "bar"}

    with patch("app.tools.mcp_manager.SessionLocal") as mock_sess_local, \
         patch("app.tools.mcp_manager.MCPToolRepository") as mock_repo_cls, \
         patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:

        mock_db = MagicMock()
        mock_sess_local.return_value.__enter__.return_value = mock_db
        mock_repo = MagicMock()
        mock_repo.get_agent_mcp_tools.return_value = [mock_tool_config]
        mock_repo_cls.return_value = mock_repo

        # Mock MCPTools async context manager
        mock_mcp_instance = AsyncMock()
        # Simulate that functions are available after connect
        mock_mcp_instance.functions = {"list": MagicMock()}
        mock_mcp_tools_cls.return_value = mock_mcp_instance

        tools = await manager.initialize_mcp_tools(agent_id, org_id)

        assert len(tools) == 1
        mock_repo.get_agent_mcp_tools.assert_called_once_with(agent_id)
        # __aenter__ called to connect
        mock_mcp_instance.__aenter__.assert_awaited()


@pytest.mark.asyncio
async def test_initialize_mcp_tools_stdio_missing_dirs_skips():
    manager = MCPToolsManager()
    agent_id = str(uuid4())
    org_id = str(uuid4())

    # Tool without directories and without env var should be skipped
    mock_tool_config = MagicMock()
    from app.models.mcp_tool import MCPTransportType
    mock_tool_config.transport_type = MCPTransportType.STDIO
    mock_tool_config.timeout = None
    mock_tool_config.name = "FS Tool"
    mock_tool_config.command = "npx"
    mock_tool_config.args = ["-y", "@modelcontextprotocol/server-filesystem"]  # no dirs after package
    mock_tool_config.env_vars = {}  # no ALLOWED_DIRECTORIES

    with patch("app.tools.mcp_manager.SessionLocal") as mock_sess_local, \
         patch("app.tools.mcp_manager.MCPToolRepository") as mock_repo_cls, \
         patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:

        mock_db = MagicMock()
        mock_sess_local.return_value.__enter__.return_value = mock_db
        mock_repo = MagicMock()
        mock_repo.get_agent_mcp_tools.return_value = [mock_tool_config]
        mock_repo_cls.return_value = mock_repo

        tools = await manager.initialize_mcp_tools(agent_id, org_id)

        assert tools == []  # skipped
        mock_mcp_tools_cls.assert_not_called()


@pytest.mark.asyncio
async def test_cleanup_mcp_tools_calls_disconnects():
    manager = MCPToolsManager()
    tool1 = AsyncMock()
    tool2 = AsyncMock()
    manager.mcp_tools = [tool1, tool2]

    await manager.cleanup_mcp_tools()

    # Attempted to cleanup via __aexit__ first
    tool1.__aexit__.assert_awaited()
    tool2.__aexit__.assert_awaited()
    assert manager.mcp_tools == []


@pytest.mark.asyncio
async def test_initialize_and_cleanup_helpers():
    # High level helper functions
    with patch("app.tools.mcp_manager.MCPToolsManager") as mock_mgr_cls:
        mock_mgr = AsyncMock()
        mock_mgr.initialize_mcp_tools.return_value = []
        mock_mgr.cleanup_mcp_tools.return_value = None
        mock_mgr_cls.return_value = mock_mgr

        tools = await initialize_mcp_tools(agent_id="a", org_id="o")
        assert tools == []

        await cleanup_mcp_tools([])
        mock_mgr.cleanup_mcp_tools.assert_awaited()


# ==================== Additional tests for better coverage ====================

from app.tools.mcp_manager import ChatAgentMCPMixin
from app.models.mcp_tool import MCPTransportType


@pytest.mark.asyncio
async def test_initialize_mcp_tools_none_ids():
    """Test with None values for agent_id and org_id"""
    manager = MCPToolsManager()
    tools = await manager.initialize_mcp_tools(agent_id=None, org_id=None)
    assert tools == []


@pytest.mark.asyncio
async def test_initialize_mcp_tools_filesystem_with_env_dirs():
    """Test filesystem tool with directories from env_vars"""
    manager = MCPToolsManager()
    agent_id = str(uuid4())
    org_id = str(uuid4())

    mock_tool_config = MagicMock()
    mock_tool_config.name = "FS Tool"
    mock_tool_config.transport_type = MCPTransportType.STDIO
    mock_tool_config.timeout = None
    mock_tool_config.command = "npx"
    mock_tool_config.args = ["-y", "@modelcontextprotocol/server-filesystem"]  # No dirs in args
    mock_tool_config.env_vars = {"ALLOWED_DIRECTORIES": "/tmp, /home"}  # Dirs in env

    with patch("app.tools.mcp_manager.SessionLocal") as mock_sess_local, \
         patch("app.tools.mcp_manager.MCPToolRepository") as mock_repo_cls, \
         patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:

        mock_db = MagicMock()
        mock_sess_local.return_value.__enter__.return_value = mock_db
        mock_repo = MagicMock()
        mock_repo.get_agent_mcp_tools.return_value = [mock_tool_config]
        mock_repo_cls.return_value = mock_repo

        mock_mcp_instance = AsyncMock()
        mock_mcp_instance.functions = {"list_files": MagicMock()}
        mock_mcp_tools_cls.return_value = mock_mcp_instance

        tools = await manager.initialize_mcp_tools(agent_id, org_id)

        assert len(tools) == 1


@pytest.mark.asyncio
async def test_initialize_mcp_tools_filesystem_empty_env_dirs():
    """Test filesystem tool with empty ALLOWED_DIRECTORIES env var"""
    manager = MCPToolsManager()
    agent_id = str(uuid4())
    org_id = str(uuid4())

    mock_tool_config = MagicMock()
    mock_tool_config.name = "FS Tool"
    mock_tool_config.transport_type = MCPTransportType.STDIO
    mock_tool_config.timeout = None
    mock_tool_config.command = "npx"
    mock_tool_config.args = ["-y", "@modelcontextprotocol/server-filesystem"]
    mock_tool_config.env_vars = {"ALLOWED_DIRECTORIES": ""}  # Empty dirs

    with patch("app.tools.mcp_manager.SessionLocal") as mock_sess_local, \
         patch("app.tools.mcp_manager.MCPToolRepository") as mock_repo_cls:

        mock_db = MagicMock()
        mock_sess_local.return_value.__enter__.return_value = mock_db
        mock_repo = MagicMock()
        mock_repo.get_agent_mcp_tools.return_value = [mock_tool_config]
        mock_repo_cls.return_value = mock_repo

        tools = await manager.initialize_mcp_tools(agent_id, org_id)

        assert tools == []  # Should be skipped


@pytest.mark.asyncio
async def test_initialize_mcp_tools_uvx_command():
    """Test tool with uvx command"""
    manager = MCPToolsManager()
    agent_id = str(uuid4())
    org_id = str(uuid4())

    mock_tool_config = MagicMock()
    mock_tool_config.name = "Python Tool"
    mock_tool_config.transport_type = MCPTransportType.STDIO
    mock_tool_config.timeout = None
    mock_tool_config.command = "uvx"
    mock_tool_config.args = ["python-mcp-server"]
    mock_tool_config.env_vars = {}

    with patch("app.tools.mcp_manager.SessionLocal") as mock_sess_local, \
         patch("app.tools.mcp_manager.MCPToolRepository") as mock_repo_cls, \
         patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:

        mock_db = MagicMock()
        mock_sess_local.return_value.__enter__.return_value = mock_db
        mock_repo = MagicMock()
        mock_repo.get_agent_mcp_tools.return_value = [mock_tool_config]
        mock_repo_cls.return_value = mock_repo

        mock_mcp_instance = AsyncMock()
        mock_mcp_instance.functions = {"run": MagicMock()}
        mock_mcp_tools_cls.return_value = mock_mcp_instance

        tools = await manager.initialize_mcp_tools(agent_id, org_id)

        assert len(tools) == 1


@pytest.mark.asyncio
async def test_initialize_mcp_tools_connection_timeout():
    """Test tool connection timeout"""
    manager = MCPToolsManager()
    agent_id = str(uuid4())
    org_id = str(uuid4())

    mock_tool_config = MagicMock()
    mock_tool_config.name = "Slow Tool"
    mock_tool_config.transport_type = MCPTransportType.STDIO
    mock_tool_config.timeout = None
    mock_tool_config.command = "npx"
    mock_tool_config.args = ["-y", "slow-package"]
    mock_tool_config.env_vars = {}

    with patch("app.tools.mcp_manager.SessionLocal") as mock_sess_local, \
         patch("app.tools.mcp_manager.MCPToolRepository") as mock_repo_cls, \
         patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:

        mock_db = MagicMock()
        mock_sess_local.return_value.__enter__.return_value = mock_db
        mock_repo = MagicMock()
        mock_repo.get_agent_mcp_tools.return_value = [mock_tool_config]
        mock_repo_cls.return_value = mock_repo

        mock_mcp_instance = MagicMock()
        mock_mcp_instance.__aenter__ = AsyncMock(side_effect=asyncio.TimeoutError())
        mock_mcp_instance.__aexit__ = AsyncMock()
        mock_mcp_tools_cls.return_value = mock_mcp_instance

        tools = await manager.initialize_mcp_tools(agent_id, org_id)

        assert tools == []


@pytest.mark.asyncio
async def test_initialize_mcp_tools_package_not_found():
    """Test tool with 404 not found error"""
    manager = MCPToolsManager()
    agent_id = str(uuid4())
    org_id = str(uuid4())

    mock_tool_config = MagicMock()
    mock_tool_config.name = "Missing Tool"
    mock_tool_config.transport_type = MCPTransportType.STDIO
    mock_tool_config.timeout = None
    mock_tool_config.command = "npx"
    mock_tool_config.args = ["-y", "nonexistent"]
    mock_tool_config.env_vars = {}

    with patch("app.tools.mcp_manager.SessionLocal") as mock_sess_local, \
         patch("app.tools.mcp_manager.MCPToolRepository") as mock_repo_cls, \
         patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:

        mock_db = MagicMock()
        mock_sess_local.return_value.__enter__.return_value = mock_db
        mock_repo = MagicMock()
        mock_repo.get_agent_mcp_tools.return_value = [mock_tool_config]
        mock_repo_cls.return_value = mock_repo

        mock_mcp_instance = MagicMock()
        mock_mcp_instance.__aenter__ = AsyncMock(side_effect=Exception("404 package not found"))
        mock_mcp_instance.__aexit__ = AsyncMock()
        mock_mcp_tools_cls.return_value = mock_mcp_instance

        tools = await manager.initialize_mcp_tools(agent_id, org_id)

        assert tools == []


@pytest.mark.asyncio
async def test_initialize_mcp_tools_no_functions_loaded():
    """Test tool that connects but has no functions"""
    manager = MCPToolsManager()
    agent_id = str(uuid4())
    org_id = str(uuid4())

    mock_tool_config = MagicMock()
    mock_tool_config.name = "Empty Tool"
    mock_tool_config.transport_type = MCPTransportType.STDIO
    mock_tool_config.timeout = None
    mock_tool_config.command = "npx"
    mock_tool_config.args = ["-y", "empty-package"]
    mock_tool_config.env_vars = {}

    with patch("app.tools.mcp_manager.SessionLocal") as mock_sess_local, \
         patch("app.tools.mcp_manager.MCPToolRepository") as mock_repo_cls, \
         patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:

        mock_db = MagicMock()
        mock_sess_local.return_value.__enter__.return_value = mock_db
        mock_repo = MagicMock()
        mock_repo.get_agent_mcp_tools.return_value = [mock_tool_config]
        mock_repo_cls.return_value = mock_repo

        mock_mcp_instance = MagicMock()
        mock_mcp_instance.__aenter__ = AsyncMock()
        mock_mcp_instance.__aexit__ = AsyncMock()
        mock_mcp_instance.functions = {}  # Empty functions
        mock_mcp_tools_cls.return_value = mock_mcp_instance

        tools = await manager.initialize_mcp_tools(agent_id, org_id)

        assert tools == []


@pytest.mark.asyncio
async def test_initialize_mcp_tools_sse_transport():
    """A remote tool that can't be reached is excluded and recorded."""
    manager = MCPToolsManager()
    agent_id = str(uuid4())
    org_id = str(uuid4())

    mock_tool_config = _remote_config(MCPTransportType.SSE, name="SSE Tool")

    with patch("app.tools.mcp_manager.SessionLocal") as mock_sess_local, \
         patch("app.tools.mcp_manager.MCPToolRepository") as mock_repo_cls, \
         patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:

        mock_db = MagicMock()
        mock_sess_local.return_value.__enter__.return_value = mock_db
        mock_repo = MagicMock()
        mock_repo.get_agent_mcp_tools.return_value = [mock_tool_config]
        mock_repo_cls.return_value = mock_repo

        mock_mcp_instance = MagicMock()
        mock_mcp_instance.__aenter__ = AsyncMock(side_effect=Exception("connection refused"))
        mock_mcp_instance.__aexit__ = AsyncMock()
        mock_mcp_tools_cls.return_value = mock_mcp_instance

        tools = await manager.initialize_mcp_tools(agent_id, org_id)

        assert tools == []
        assert manager.failed_tools[-1]["name"] == "SSE Tool"


@pytest.mark.asyncio
async def test_initialize_mcp_tools_http_transport():
    """A remote tool that can't be reached is excluded and recorded."""
    manager = MCPToolsManager()
    agent_id = str(uuid4())
    org_id = str(uuid4())

    mock_tool_config = _remote_config(MCPTransportType.HTTP, name="HTTP Tool")

    with patch("app.tools.mcp_manager.SessionLocal") as mock_sess_local, \
         patch("app.tools.mcp_manager.MCPToolRepository") as mock_repo_cls, \
         patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:

        mock_db = MagicMock()
        mock_sess_local.return_value.__enter__.return_value = mock_db
        mock_repo = MagicMock()
        mock_repo.get_agent_mcp_tools.return_value = [mock_tool_config]
        mock_repo_cls.return_value = mock_repo

        mock_mcp_instance = MagicMock()
        mock_mcp_instance.__aenter__ = AsyncMock(side_effect=Exception("connection refused"))
        mock_mcp_instance.__aexit__ = AsyncMock()
        mock_mcp_tools_cls.return_value = mock_mcp_instance

        tools = await manager.initialize_mcp_tools(agent_id, org_id)

        assert tools == []
        assert manager.failed_tools[-1]["name"] == "HTTP Tool"


@pytest.mark.asyncio
async def test_initialize_mcp_tools_missing_command():
    """Test STDIO tool with missing command"""
    manager = MCPToolsManager()
    agent_id = str(uuid4())
    org_id = str(uuid4())

    mock_tool_config = MagicMock()
    mock_tool_config.name = "Bad Tool"
    mock_tool_config.transport_type = MCPTransportType.STDIO
    mock_tool_config.timeout = None
    mock_tool_config.command = None
    mock_tool_config.args = None

    with patch("app.tools.mcp_manager.SessionLocal") as mock_sess_local, \
         patch("app.tools.mcp_manager.MCPToolRepository") as mock_repo_cls:

        mock_db = MagicMock()
        mock_sess_local.return_value.__enter__.return_value = mock_db
        mock_repo = MagicMock()
        mock_repo.get_agent_mcp_tools.return_value = [mock_tool_config]
        mock_repo_cls.return_value = mock_repo

        tools = await manager.initialize_mcp_tools(agent_id, org_id)

        assert tools == []


@pytest.mark.asyncio
async def test_initialize_mcp_tools_db_error():
    """Test error getting tools from database"""
    manager = MCPToolsManager()
    agent_id = str(uuid4())
    org_id = str(uuid4())

    with patch("app.tools.mcp_manager.SessionLocal") as mock_sess_local:
        mock_sess_local.return_value.__enter__.side_effect = Exception("DB error")

        tools = await manager.initialize_mcp_tools(agent_id, org_id)

        assert tools == []


@pytest.mark.asyncio
async def test_cleanup_mcp_tools_empty():
    """Test cleanup with no tools"""
    manager = MCPToolsManager()
    manager.mcp_tools = []

    await manager.cleanup_mcp_tools()

    assert manager.mcp_tools == []


@pytest.mark.asyncio
async def test_cleanup_mcp_tools_with_disconnect():
    """Test cleanup using disconnect method"""
    manager = MCPToolsManager()

    mock_tool = MagicMock(spec=['disconnect'])  # Only has disconnect
    mock_tool.disconnect = AsyncMock()

    manager.mcp_tools = [mock_tool]

    await manager.cleanup_mcp_tools()

    mock_tool.disconnect.assert_awaited()
    assert manager.mcp_tools == []


@pytest.mark.asyncio
async def test_cleanup_mcp_tools_with_stop():
    """Test cleanup using stop method"""
    manager = MCPToolsManager()

    mock_tool = MagicMock(spec=['stop'])  # Only has stop
    mock_tool.stop = AsyncMock()

    manager.mcp_tools = [mock_tool]

    await manager.cleanup_mcp_tools()

    mock_tool.stop.assert_awaited()
    assert manager.mcp_tools == []


@pytest.mark.asyncio
async def test_cleanup_mcp_tools_timeout():
    """Test cleanup with timeout"""
    manager = MCPToolsManager()

    mock_tool = AsyncMock()
    mock_tool.__aexit__ = AsyncMock(side_effect=asyncio.TimeoutError())

    manager.mcp_tools = [mock_tool]

    await manager.cleanup_mcp_tools()

    assert manager.mcp_tools == []


@pytest.mark.asyncio
async def test_cleanup_mcp_tools_cancel_scope_warning():
    """Test cleanup with cancel scope warning"""
    manager = MCPToolsManager()

    mock_tool = AsyncMock()
    mock_tool.__aexit__ = AsyncMock(side_effect=Exception("cancel scope different task"))

    manager.mcp_tools = [mock_tool]

    await manager.cleanup_mcp_tools()

    assert manager.mcp_tools == []


@pytest.mark.asyncio
async def test_cleanup_mcp_tools_unexpected_error():
    """Test cleanup with unexpected error"""
    manager = MCPToolsManager()

    mock_tool = AsyncMock()
    mock_tool.__aexit__ = AsyncMock(side_effect=Exception("Unexpected error"))

    manager.mcp_tools = [mock_tool]

    await manager.cleanup_mcp_tools()

    assert manager.mcp_tools == []


# ==================== Failure tracking + connection test ====================


def _stdio_config(name="Elasticsearch", command="npx", args=None, env_vars=None, timeout=None):
    config = MagicMock()
    config.name = name
    config.transport_type = MCPTransportType.STDIO
    config.command = command
    config.args = args if args is not None else ["-y", "@elastic/mcp-server-elasticsearch"]
    config.env_vars = env_vars or {}
    config.timeout = timeout
    return config


@pytest.mark.asyncio
async def test_failed_tools_records_connect_error():
    """A tool that can't start (e.g. npx missing) lands in failed_tools with
    the real error, and connected_tool_names stays empty."""
    manager = MCPToolsManager()

    with patch("app.tools.mcp_manager.SessionLocal") as mock_sess_local, \
         patch("app.tools.mcp_manager.MCPToolRepository") as mock_repo_cls, \
         patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:

        mock_sess_local.return_value.__enter__.return_value = MagicMock()
        mock_repo = MagicMock()
        config = _stdio_config()
        config.id = 7
        mock_repo.get_by_ids.return_value = [config]
        mock_repo_cls.return_value = mock_repo

        mock_mcp_instance = MagicMock()
        mock_mcp_instance.__aenter__ = AsyncMock(
            side_effect=FileNotFoundError("[Errno 2] No such file or directory: 'npx'")
        )
        mock_mcp_instance.__aexit__ = AsyncMock()
        mock_mcp_tools_cls.return_value = mock_mcp_instance

        tools = await manager.initialize_mcp_tools_by_ids(str(uuid4()), [7])

        assert tools == []
        assert manager.connected_tool_names == []
        assert len(manager.failed_tools) == 1
        assert manager.failed_tools[0]["name"] == "Elasticsearch"
        assert "npx" in manager.failed_tools[0]["error"]


@pytest.mark.asyncio
async def test_failed_tools_records_missing_ids():
    """Requested tool ids that no longer resolve to configs are reported."""
    manager = MCPToolsManager()

    with patch("app.tools.mcp_manager.SessionLocal") as mock_sess_local, \
         patch("app.tools.mcp_manager.MCPToolRepository") as mock_repo_cls:

        mock_sess_local.return_value.__enter__.return_value = MagicMock()
        mock_repo = MagicMock()
        mock_repo.get_by_ids.return_value = []
        mock_repo_cls.return_value = mock_repo

        tools = await manager.initialize_mcp_tools_by_ids(str(uuid4()), [42])

        assert tools == []
        assert manager.failed_tools == [
            {"name": "Tool #42", "error": "Configured tool no longer exists or is disabled"}
        ]


@pytest.mark.asyncio
async def test_connected_tool_names_recorded_on_success():
    manager = MCPToolsManager()

    with patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:
        mock_mcp_instance = AsyncMock()
        mock_mcp_instance.functions = {"search": MagicMock()}
        mock_mcp_tools_cls.return_value = mock_mcp_instance

        tools = await manager._initialize_from_configs([_stdio_config()])

        assert len(tools) == 1
        assert manager.connected_tool_names == ["Elasticsearch"]
        assert manager.failed_tools == []


@pytest.mark.asyncio
async def test_test_tool_config_success():
    manager = MCPToolsManager()

    with patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:
        mock_mcp_instance = AsyncMock()
        mock_mcp_instance.functions = {"search": MagicMock(), "get_index": MagicMock()}
        mock_mcp_tools_cls.return_value = mock_mcp_instance

        result = await manager.test_tool_config(_stdio_config())

        assert result["success"] is True
        assert sorted(result["functions"]) == ["get_index", "search"]
        assert result["error"] is None
        # The probe tool is torn down, never registered for later use.
        assert manager.mcp_tools == []
        mock_mcp_instance.__aexit__.assert_awaited()


@pytest.mark.asyncio
async def test_test_tool_config_connect_failure():
    manager = MCPToolsManager()

    with patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:
        mock_mcp_instance = MagicMock()
        mock_mcp_instance.__aenter__ = AsyncMock(
            side_effect=FileNotFoundError("[Errno 2] No such file or directory: 'npx'")
        )
        mock_mcp_instance.__aexit__ = AsyncMock()
        mock_mcp_tools_cls.return_value = mock_mcp_instance

        result = await manager.test_tool_config(_stdio_config())

        assert result["success"] is False
        assert "npx" in result["error"]


@pytest.mark.asyncio
async def test_test_tool_config_misconfigured():
    manager = MCPToolsManager()
    result = await manager.test_tool_config(_stdio_config(command=None, args=None))
    assert result["success"] is False
    assert "misconfigured" in result["error"]


@pytest.mark.asyncio
async def test_test_tool_config_timeout():
    manager = MCPToolsManager()

    async def hang():
        await asyncio.sleep(60)

    with patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls, \
         patch("app.tools.mcp_manager._connect_timeout", return_value=0.01):
        mock_mcp_instance = MagicMock()
        mock_mcp_instance.__aenter__ = MagicMock(side_effect=hang)
        mock_mcp_instance.__aexit__ = AsyncMock()
        mock_mcp_tools_cls.return_value = mock_mcp_instance

        result = await manager.test_tool_config(_stdio_config())

        assert result["success"] is False
        assert "Timed out" in result["error"]


@pytest.mark.asyncio
async def test_mixed_success_and_failure_bookkeeping():
    """With one tool connecting and one failing, both lists are accurate —
    this is what run.connector_status is built from."""
    manager = MCPToolsManager()
    good = _stdio_config(name="Good")
    bad = _stdio_config(name="Bad")

    good_instance = AsyncMock()
    good_instance.functions = {"search": MagicMock()}
    bad_instance = MagicMock()
    bad_instance.__aenter__ = AsyncMock(side_effect=Exception("connection refused"))
    bad_instance.__aexit__ = AsyncMock()

    with patch("app.tools.mcp_manager.MCPTools", side_effect=[good_instance, bad_instance]):
        tools = await manager._initialize_from_configs([good, bad])

    assert len(tools) == 1
    assert manager.connected_tool_names == ["Good"]
    assert manager.failed_tools == [{"name": "Bad", "error": "connection refused"}]


@pytest.mark.asyncio
async def test_test_tool_config_no_functions():
    manager = MCPToolsManager()

    with patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:
        mock_mcp_instance = AsyncMock()
        mock_mcp_instance.functions = {}
        mock_mcp_tools_cls.return_value = mock_mcp_instance

        result = await manager.test_tool_config(_stdio_config())

        assert result["success"] is False
        assert "no tools" in result["error"]


def _remote_config(transport, name="Remote", url="https://example.com/mcp", timeout=None):
    config = MagicMock()
    config.name = name
    config.transport_type = transport
    config.url = url
    config.headers = None
    config.timeout = timeout
    config.sse_read_timeout = None
    config.terminate_on_close = True
    return config


def test_stdio_tool_uses_configured_timeout():
    """The configured timeout reaches the MCP session on the STDIO path.
    Without it agno falls back to its 5s default, which npx-launched servers
    straddle — the same config then connects or times out at random."""
    with patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:
        MCPToolsManager._build_tool(_stdio_config(timeout=120))

    assert mock_mcp_tools_cls.call_args.kwargs["timeout_seconds"] == 120


def test_stdio_tool_defaults_timeout_when_unset():
    with patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:
        MCPToolsManager._build_tool(_stdio_config(timeout=None))

    assert mock_mcp_tools_cls.call_args.kwargs["timeout_seconds"] == DEFAULT_TIMEOUT_SECONDS


@pytest.mark.parametrize("transport", [MCPTransportType.SSE, MCPTransportType.HTTP])
def test_remote_tool_passes_timeout_to_session(transport):
    """Remote transports need timeout_seconds too: agno takes the *min* of it
    and the transport timeout, so leaving it unset pins the session to 5s no
    matter what the server params say."""
    with patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:
        MCPToolsManager._build_tool(_remote_config(transport, timeout=90))

    assert mock_mcp_tools_cls.call_args.kwargs["timeout_seconds"] == 90


def test_connect_budget_covers_the_whole_handshake():
    """The outer guard has to sit above what the handshake can legitimately
    spend — initialize and list_tools each get the full per-request timeout —
    otherwise raising the timeout changes nothing, the guard just fires first."""
    config = _stdio_config(timeout=120)

    assert _connect_timeout(config) > _session_timeout(config) * HANDSHAKE_REQUESTS
    assert _connect_timeout(config) == 120 * HANDSHAKE_REQUESTS + CONNECT_TIMEOUT_MARGIN_SECONDS


def test_connect_budget_caps_a_generous_per_tool_timeout():
    """An interactive caller's ceiling wins over the tool's own budget, so a
    connector that spawns but never speaks can't stall a live reply."""
    manager = MCPToolsManager(connect_budget=12.0)
    config = _stdio_config(timeout=300)

    assert manager._budgeted_connect_timeout(config, monotonic() + 12.0) <= 12.0


@pytest.mark.asyncio
async def test_connect_budget_is_shared_across_tools():
    """The ceiling is for the whole set: once it's gone the remaining tools
    are reported as skipped rather than silently retried at full budget."""
    manager = MCPToolsManager(connect_budget=0.05)
    first, second = _stdio_config(name="First"), _stdio_config(name="Second")

    async def slow_connect():
        await asyncio.sleep(0.2)

    with patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls:
        mock_instance = MagicMock()
        mock_instance.__aenter__ = MagicMock(side_effect=slow_connect)
        mock_instance.__aexit__ = AsyncMock()
        mock_mcp_tools_cls.return_value = mock_instance

        tools = await manager._initialize_from_configs([first, second])

    assert tools == []
    assert [failure["name"] for failure in manager.failed_tools] == ["First", "Second"]
    assert "Skipped" in manager.failed_tools[-1]["error"]


def test_chat_turn_gets_a_tighter_budget_than_the_test_button():
    """create_async runs per chat turn with a visitor waiting, so it can't
    inherit the patience the Test button needs for a cold npx launch."""
    assert CHAT_CONNECT_BUDGET_SECONDS < TEST_CONNECT_BUDGET_SECONDS


@pytest.mark.asyncio
async def test_abort_does_not_block_on_a_hanging_teardown():
    """A STDIO server that never answered leaves __aexit__ unwinding anyio
    scopes that can't take a further cancellation. Awaiting that would hold
    the caller long past its connect budget, so the teardown runs detached."""
    tool = MagicMock()
    started = asyncio.Event()

    async def never_finishes(*args):
        started.set()
        await asyncio.sleep(3600)

    tool.__aexit__ = never_finishes

    # Returns promptly even though the teardown itself never will...
    await asyncio.wait_for(MCPToolsManager._abort_tool(tool), timeout=1.0)
    # ...and the teardown really was started, not skipped.
    await asyncio.wait_for(started.wait(), timeout=1.0)

    for task in list(_pending_teardowns):
        task.cancel()


def test_no_connect_budget_leaves_the_tool_timeout_intact():
    """Background callers (the investigation worker) get the full budget —
    they're bounded by their own wall clock instead."""
    manager = MCPToolsManager()
    config = _stdio_config(timeout=300)

    assert manager._budgeted_connect_timeout(config, None) == _connect_timeout(config)


@pytest.mark.asyncio
async def test_connect_timeout_error_reports_configured_budget():
    manager = MCPToolsManager()

    with patch("app.tools.mcp_manager.MCPTools") as mock_mcp_tools_cls, \
         patch("app.tools.mcp_manager._connect_timeout", return_value=130.0):
        mock_instance = MagicMock()
        mock_instance.__aenter__ = AsyncMock(side_effect=asyncio.TimeoutError())
        mock_instance.__aexit__ = AsyncMock()
        mock_mcp_tools_cls.return_value = mock_instance

        result = await manager.test_tool_config(_stdio_config(timeout=120))

    assert result["success"] is False
    assert "130s" in result["error"]


class TestChatAgentMCPMixin:
    """Tests for ChatAgentMCPMixin"""

    @pytest.mark.asyncio
    async def test_cleanup_with_manager(self):
        """Test cleanup using _mcp_manager"""

        class TestAgent(ChatAgentMCPMixin):
            def __init__(self):
                self._mcp_manager = MagicMock()
                self._mcp_manager.cleanup_mcp_tools = AsyncMock()

        agent = TestAgent()
        await agent.cleanup_mcp_tools()

        agent._mcp_manager.cleanup_mcp_tools.assert_awaited()

    @pytest.mark.asyncio
    async def test_cleanup_without_manager(self):
        """Test cleanup without _mcp_manager"""

        class TestAgent(ChatAgentMCPMixin):
            def __init__(self):
                self.mcp_tools = [MagicMock()]

        agent = TestAgent()

        with patch("app.tools.mcp_manager.cleanup_mcp_tools", new_callable=AsyncMock) as mock_cleanup:
            await agent.cleanup_mcp_tools()

        mock_cleanup.assert_awaited_once_with(agent.mcp_tools)

    def test_del_with_tools(self):
        """Test destructor with mcp_tools"""

        class TestAgent(ChatAgentMCPMixin):
            def __init__(self):
                self.mcp_tools = [MagicMock()]

        agent = TestAgent()
        agent.__del__()  # Should not raise

    def test_del_without_tools(self):
        """Test destructor without mcp_tools"""

        class TestAgent(ChatAgentMCPMixin):
            pass

        agent = TestAgent()
        agent.__del__()  # Should not raise


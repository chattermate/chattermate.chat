"""
ChatterMate - MCP Manager Tests
"""

import pytest
import asyncio
from unittest.mock import patch, AsyncMock, MagicMock
from uuid import uuid4

from app.tools.mcp_manager import MCPToolsManager, initialize_mcp_tools, cleanup_mcp_tools


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
    """Test SSE transport (not implemented)"""
    manager = MCPToolsManager()
    agent_id = str(uuid4())
    org_id = str(uuid4())

    mock_tool_config = MagicMock()
    mock_tool_config.name = "SSE Tool"
    mock_tool_config.transport_type = MCPTransportType.SSE

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
async def test_initialize_mcp_tools_http_transport():
    """Test HTTP transport (not implemented)"""
    manager = MCPToolsManager()
    agent_id = str(uuid4())
    org_id = str(uuid4())

    mock_tool_config = MagicMock()
    mock_tool_config.name = "HTTP Tool"
    mock_tool_config.transport_type = MCPTransportType.HTTP

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
async def test_initialize_mcp_tools_missing_command():
    """Test STDIO tool with missing command"""
    manager = MCPToolsManager()
    agent_id = str(uuid4())
    org_id = str(uuid4())

    mock_tool_config = MagicMock()
    mock_tool_config.name = "Bad Tool"
    mock_tool_config.transport_type = MCPTransportType.STDIO
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


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

import asyncio
from typing import List, Optional
from agno.tools.mcp import MCPTools
from app.database import SessionLocal
from app.repositories.mcp_tool import MCPToolRepository
from app.models.mcp_tool import MCPTransportType
from app.core.logger import get_logger

logger = get_logger(__name__)


class MCPToolsManager:
    """Manager class for handling MCP tools initialization and cleanup"""
    
    def __init__(self):
        self.mcp_tools: List[MCPTools] = []
    
    async def initialize_mcp_tools(self, agent_id: str, org_id: str) -> List[MCPTools]:
        """
        Initialize MCP tools for an agent asynchronously.
        Returns a list of connected MCPTools instances.
        """
        if not agent_id or not org_id:
            return []
            
        try:
            # Get MCP tools for this agent from database
            with SessionLocal() as db:
                mcp_tool_repo = MCPToolRepository(db)
                agent_mcp_tools = mcp_tool_repo.get_agent_mcp_tools(agent_id)
                
            # Initialize each MCP tool asynchronously
            for mcp_tool_config in agent_mcp_tools:
                try:
                    logger.debug(f"Initializing MCP tool: {mcp_tool_config.name}")
                    
                    if mcp_tool_config.transport_type == MCPTransportType.STDIO:
                        # Build command string for STDIO transport
                        if mcp_tool_config.command and mcp_tool_config.args:
                            # For filesystem MCP server, ensure we have proper directory arguments
                            command_parts = [mcp_tool_config.command] + mcp_tool_config.args
                            
                            # Check if we need to add directories from env_vars
                            if "@modelcontextprotocol/server-filesystem" in str(mcp_tool_config.args):
                                # Check if there are directory arguments after the package name
                                args_after_package = []
                                package_found = False
                                for arg in mcp_tool_config.args:
                                    if package_found:
                                        args_after_package.append(arg)
                                    elif arg == "@modelcontextprotocol/server-filesystem":
                                        package_found = True
                                
                                # If no directories in args, check env_vars
                                if not args_after_package and mcp_tool_config.env_vars:
                                    allowed_dirs_env = mcp_tool_config.env_vars.get("ALLOWED_DIRECTORIES")
                                    if allowed_dirs_env:
                                        # Parse comma-separated directories from env_vars
                                        directories = [dir.strip() for dir in allowed_dirs_env.split(",") if dir.strip()]
                                        if directories:
                                            command_parts.extend(directories)
                                            logger.debug(f"Added directories from env_vars: {directories}")
                                        else:
                                            logger.warning(f"Filesystem MCP tool {mcp_tool_config.name} has empty ALLOWED_DIRECTORIES, skipping")
                                            continue
                                    else:
                                        logger.warning(f"Filesystem MCP tool {mcp_tool_config.name} missing ALLOWED_DIRECTORIES in env_vars, skipping")
                                        continue
                                elif not args_after_package:
                                    logger.warning(f"Filesystem MCP tool {mcp_tool_config.name} missing directory arguments, skipping")
                                    continue
                            
                            # Special handling for uvx commands with Python packages
                            if mcp_tool_config.command == "uvx":
                                # For uvx, we might need to handle Python MCP servers differently
                                logger.debug(f"Using uvx command for MCP tool: {mcp_tool_config.name}")
                            
                            command_str = " ".join(command_parts)
                            logger.debug(f"Creating STDIO MCP tool with command: {command_str}")
                            
                            # Prepare environment variables if provided (excluding ALLOWED_DIRECTORIES which we handled above)
                            env_vars_for_process = None
                            if mcp_tool_config.env_vars:
                                env_vars_for_process = {k: v for k, v in mcp_tool_config.env_vars.items() if k != "ALLOWED_DIRECTORIES"}
                                if env_vars_for_process:
                                    logger.debug(f"Environment variables configured: {env_vars_for_process}")
                                
                            # Create MCPTools instance with environment variables
                            mcp_tool = MCPTools(command_str, env=env_vars_for_process)
                            
                            # Connect the tool asynchronously with timeout
                            connected = False
                            try:
                                # Try to initialize the MCP tool using context manager
                                await asyncio.wait_for(mcp_tool.__aenter__(), timeout=10.0)
                                connected = True
                                logger.debug(f"Entered MCP tool context: {mcp_tool_config.name}")
                            except asyncio.TimeoutError:
                                logger.error(f"Timeout connecting to MCP tool {mcp_tool_config.name}")
                                # Try to cleanup the failed tool
                                try:
                                    await asyncio.wait_for(mcp_tool.__aexit__(None, None, None), timeout=2.0)
                                except:
                                    pass
                                continue
                            except Exception as e:
                                logger.error(f"Failed to connect MCP tool {mcp_tool_config.name}: {e}")
                                # For package not found errors (like Git server), skip silently after first error
                                if "404" in str(e) or "not found" in str(e).lower() or "no such package" in str(e).lower():
                                    logger.warning(f"MCP tool package not found, skipping: {mcp_tool_config.name}")
                                # Try to cleanup the failed tool
                                try:
                                    await asyncio.wait_for(mcp_tool.__aexit__(None, None, None), timeout=2.0)
                                except:
                                    pass
                                continue
                            
                            # Verify functions are loaded after connection
                            if connected and hasattr(mcp_tool, 'functions') and mcp_tool.functions:
                                logger.debug(f"MCP tool {mcp_tool_config.name} loaded functions: {list(mcp_tool.functions.keys())}")
                                self.mcp_tools.append(mcp_tool)
                            else:
                                logger.warning(f"MCP tool {mcp_tool_config.name} has no functions available after connection")
                                # Try to cleanup the failed tool
                                try:
                                    if hasattr(mcp_tool, 'disconnect'):
                                        await mcp_tool.disconnect()
                                    elif hasattr(mcp_tool, '__aexit__'):
                                        await mcp_tool.__aexit__(None, None, None)
                                except:
                                    pass  # Ignore cleanup errors for failed tools
                                
                        else:
                            logger.warning(f"STDIO MCP tool {mcp_tool_config.name} missing command or args")
                            
                    elif mcp_tool_config.transport_type in [MCPTransportType.SSE, MCPTransportType.HTTP]:
                        # For SSE/HTTP transports, we would need different initialization
                        logger.warning(f"SSE/HTTP MCP tools not yet implemented for {mcp_tool_config.name}")
                        
                except Exception as e:
                    logger.error(f"Failed to initialize MCP tool {mcp_tool_config.name}: {e}")
                    import traceback
                    logger.error(f"MCP tool error traceback: {traceback.format_exc()}")
                    continue
                    
        except Exception as e:
            logger.error(f"Failed to get MCP tools for agent {agent_id}: {e}")
            
        logger.debug(f"Initialized {len(self.mcp_tools)} MCP tools for agent {agent_id}")
        return self.mcp_tools
    
    async def cleanup_mcp_tools(self):
        """
        Clean up MCP tools by properly disconnecting them.
        """
        if not self.mcp_tools:
            logger.debug("No MCP tools to clean up")
            return
            
        for i, mcp_tool in enumerate(self.mcp_tools):
            try:
                logger.debug(f"Cleaning up MCP tool {i+1}/{len(self.mcp_tools)}")
                
                # Try multiple cleanup methods with timeout
                cleaned_up = False
                
                # Try __aexit__ first (most common for MCPTools)
                if hasattr(mcp_tool, '__aexit__'):
                    try:
                        await asyncio.wait_for(mcp_tool.__aexit__(None, None, None), timeout=5.0)
                        cleaned_up = True
                        logger.debug(f"Exited MCP tool {i+1} context")
                    except asyncio.TimeoutError:
                        logger.warning(f"Timeout exiting MCP tool {i+1} context")
                    except Exception as e:
                        # Handle known non-critical async context manager warnings
                        if "cancel scope" in str(e) or "different task" in str(e):
                            logger.debug(f"MCP tool {i+1} cleanup warning (non-critical): {e}")
                        else:
                            logger.warning(f"Error exiting MCP tool {i+1} context: {e}")
                
                if not cleaned_up and hasattr(mcp_tool, 'disconnect'):
                    try:
                        await asyncio.wait_for(mcp_tool.disconnect(), timeout=5.0)
                        cleaned_up = True
                        logger.debug(f"Disconnected MCP tool {i+1}")
                    except asyncio.TimeoutError:
                        logger.warning(f"Timeout disconnecting MCP tool {i+1}")
                    except Exception as e:
                        if "cancel scope" in str(e) or "different task" in str(e):
                            logger.debug(f"MCP tool {i+1} disconnect warning (non-critical): {e}")
                        else:
                            logger.warning(f"Error disconnecting MCP tool {i+1}: {e}")
                
                if not cleaned_up and hasattr(mcp_tool, 'stop'):
                    try:
                        await asyncio.wait_for(mcp_tool.stop(), timeout=5.0)
                        cleaned_up = True
                        logger.debug(f"Stopped MCP tool {i+1}")
                    except asyncio.TimeoutError:
                        logger.warning(f"Timeout stopping MCP tool {i+1}")
                    except Exception as e:
                        if "cancel scope" in str(e) or "different task" in str(e):
                            logger.debug(f"MCP tool {i+1} stop warning (non-critical): {e}")
                        else:
                            logger.warning(f"Error stopping MCP tool {i+1}: {e}")
                
                if not cleaned_up:
                    logger.warning(f"Could not properly cleanup MCP tool {i+1}")
                    
            except Exception as e:
                logger.error(f"Unexpected error cleaning up MCP tool {i+1}: {e}")
        
        # Clear the tools list after cleanup
        self.mcp_tools.clear()
        logger.debug("All MCP tools cleaned up")


# Convenience functions for backward compatibility and easy usage
async def initialize_mcp_tools(agent_id: str, org_id: str) -> List[MCPTools]:
    """
    Initialize MCP tools for an agent asynchronously.
    Returns a list of connected MCPTools instances.
    """
    manager = MCPToolsManager()
    return await manager.initialize_mcp_tools(agent_id, org_id)


async def cleanup_mcp_tools(mcp_tools: List[MCPTools]):
    """
    Clean up a list of MCP tools.
    """
    manager = MCPToolsManager()
    manager.mcp_tools = mcp_tools
    await manager.cleanup_mcp_tools()


class ChatAgentMCPMixin:
    """
    Mixin class to add MCP tools functionality to ChatAgent
    """
    
    @classmethod
    async def create_async(cls, api_key: str, model_name: str = "gpt-4o-mini", model_type: str = "OPENAI", 
                          org_id: str = None, agent_id: str = None, customer_id: str = None, 
                          session_id: str = None, custom_system_prompt: str = None,
                          transfer_to_human: bool | None = None, source: str = None,
                          channel: str = None, extra_context: str = None):
        """
        Async factory method to create a ChatAgent with MCP tools initialized.
        """
        # Initialize MCP tools asynchronously if agent_id and org_id are provided
        mcp_tools = []
        mcp_manager = None
        if agent_id and org_id:
            try:
                mcp_manager = MCPToolsManager()
                mcp_tools = await mcp_manager.initialize_mcp_tools(agent_id, org_id)
            except Exception as e:
                logger.error(f"Failed to initialize MCP tools: {e}")

        # Create ChatAgent instance with initialized MCP tools
        instance = cls(
            api_key=api_key,
            model_name=model_name,
            model_type=model_type,
            org_id=org_id,
            agent_id=agent_id,
            customer_id=customer_id,
            session_id=session_id,
            custom_system_prompt=custom_system_prompt,
            transfer_to_human=transfer_to_human,
            mcp_tools=mcp_tools,
            source=source,
            channel=channel,
            extra_context=extra_context
        )
        
        # Attach the MCP manager to the instance for cleanup
        instance._mcp_manager = mcp_manager
        
        return instance
    
    async def cleanup_mcp_tools(self):
        """
        Clean up MCP tools by properly disconnecting them.
        """
        if hasattr(self, '_mcp_manager') and self._mcp_manager:
            await self._mcp_manager.cleanup_mcp_tools()
        elif hasattr(self, 'mcp_tools') and self.mcp_tools:
            await cleanup_mcp_tools(self.mcp_tools)

    async def safe_cleanup_mcp_tools(self, timeout: float = 2.0):
        """
        Best-effort MCP cleanup after a chat turn: bounded by a timeout and
        never raises, so cleanup can't break or block the response flow.
        """
        try:
            await asyncio.wait_for(self.cleanup_mcp_tools(), timeout=timeout)
        except asyncio.TimeoutError:
            logger.debug("MCP cleanup timed out (non-critical)")
        except Exception as e:
            logger.debug(f"MCP cleanup warning (non-critical): {e}")
    
    def __del__(self):
        """
        Destructor to clean up MCP tools if they weren't properly cleaned up.
        Note: This is a fallback and shouldn't be relied upon for proper cleanup.
        """
        if hasattr(self, 'mcp_tools') and self.mcp_tools:
            logger.debug("MCP tools cleanup detected in destructor (likely due to async context cleanup timing)")
            # Can't run async code in __del__, so we just log for debugging 
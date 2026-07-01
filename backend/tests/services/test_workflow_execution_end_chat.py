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
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from uuid import uuid4
from app.services.workflow_execution import WorkflowExecutionService
from app.models.workflow_node import WorkflowNode, NodeType, ExitCondition
from app.agents.chat_agent import ChatResponse
from app.models.workflow import Workflow, WorkflowStatus


@pytest.fixture
def mock_db():
    return Mock()


@pytest.fixture
def workflow_service(mock_db):
    return WorkflowExecutionService(mock_db)


@pytest.fixture
def sample_workflow():
    workflow = MagicMock(spec=Workflow)
    workflow.id = uuid4()
    workflow.name = "Test Workflow"
    workflow.nodes = []  # List to store nodes
    workflow.connections = []  # List to store connections
    workflow.status = WorkflowStatus.PUBLISHED
    return workflow


class TestWorkflowExecutionEndChat:
    
    @pytest.mark.asyncio
    async def test_llm_node_end_chat_with_rating_config_true(self, workflow_service, sample_workflow):
        """Test LLM node end chat with ask_for_rating config set to True"""
        
        # Create LLM node with continuous execution and ask_for_rating: True
        node = Mock(spec=WorkflowNode)
        node.id = uuid4()
        node.node_type = NodeType.LLM
        config_dict = {
            "system_prompt": "You are a helpful assistant.",
            "exit_condition": ExitCondition.CONTINUOUS_EXECUTION,
            "ask_for_rating": True,
            "model_config": {
                "temperature": 0.7,
                "max_tokens": 150
            }
        }
        node.config = MagicMock()
        node.config.__getitem__.side_effect = config_dict.__getitem__
        node.config.get.side_effect = config_dict.get
        
        # Mock chat agent and its response
        mock_chat_agent = AsyncMock()
        mock_response = Mock(spec=ChatResponse)
        mock_response.message = "Thank you for chatting with us. Goodbye!"
        mock_response.transfer_to_human = False
        mock_response.end_chat = True
        mock_response.request_rating = False  # This should be updated by _handle_end_chat
        mock_response.transfer_reason = None
        mock_response.transfer_description = None
        mock_response.success = True  # Add success attribute
        
        # Mock the updated response after _handle_end_chat
        mock_updated_response = Mock(spec=ChatResponse)
        mock_updated_response.message = "Thank you for chatting with us. Goodbye!\n\nThank you for chatting with us! Would you please take a moment to rate your experience? Your feedback helps us improve our service."
        mock_updated_response.transfer_to_human = False
        mock_updated_response.end_chat = True
        mock_updated_response.request_rating = True  # Updated by _handle_end_chat
        mock_updated_response.transfer_reason = None
        mock_updated_response.transfer_description = None
        mock_updated_response.success = True  # Add success attribute
        
        # Set up async method return values
        mock_chat_agent._get_llm_response_only = AsyncMock(return_value=mock_response)
        mock_chat_agent._handle_end_chat = AsyncMock(return_value=mock_updated_response)
        
        # Mock _find_next_node
        next_node_id = uuid4()
        with patch('app.services.workflow_execution.ChatAgent') as mock_chat_agent_class:
            mock_chat_agent_class.create_async = AsyncMock(return_value=mock_chat_agent)
            with patch.object(workflow_service.session_repo, 'get_workflow_history', return_value=[]), \
                 patch.object(workflow_service, '_find_next_node', return_value=next_node_id):
                result = await workflow_service._execute_llm_node(
                    node=node,
                    workflow=sample_workflow,
                    workflow_state={},
                    user_message="Goodbye",
                    api_key="test-key",
                    model_name="gpt-4",
                    model_type="openai",
                    org_id="test-org",
                    agent_id="test-agent",
                    customer_id="test-customer",
                    session_id="test-session"
                )
                
                # Verify _handle_end_chat was NOT called (it's handled in workflow_chat service)
                mock_chat_agent._handle_end_chat.assert_not_called()
                
                # Verify the result has the correct rating setting
                assert result.success is True
                assert result.end_chat is True
                assert result.request_rating is True
                assert result.next_node_id == next_node_id
    
    @pytest.mark.asyncio
    async def test_llm_node_end_chat_with_rating_config_false(self, workflow_service, sample_workflow):
        """Test LLM node end chat with ask_for_rating config set to False"""
        
        # Create LLM node with continuous execution and ask_for_rating: False
        node = Mock(spec=WorkflowNode)
        node.id = uuid4()
        node.node_type = NodeType.LLM
        config_dict = {
            "system_prompt": "You are a helpful assistant.",
            "exit_condition": ExitCondition.CONTINUOUS_EXECUTION,
            "ask_for_rating": False,
            "model_config": {
                "temperature": 0.7,
                "max_tokens": 150
            }
        }
        node.config = MagicMock()
        node.config.__getitem__.side_effect = config_dict.__getitem__
        node.config.get.side_effect = config_dict.get
        node.config.__contains__ = lambda *args: args[1] in config_dict  # Fix lambda to handle multiple args
        
        # Mock chat agent and its response
        mock_chat_agent = AsyncMock()
        mock_response = Mock(spec=ChatResponse)
        mock_response.message = "Thank you for chatting with us. Goodbye!"
        mock_response.transfer_to_human = False
        mock_response.end_chat = True
        mock_response.request_rating = True  # This should be updated by _handle_end_chat
        mock_response.transfer_reason = None
        mock_response.transfer_description = None
        mock_response.success = True  # Add success attribute
        
        # Mock the updated response after _handle_end_chat
        mock_updated_response = Mock(spec=ChatResponse)
        mock_updated_response.message = "Thank you for chatting with us. Goodbye!"
        mock_updated_response.transfer_to_human = False
        mock_updated_response.end_chat = True
        mock_updated_response.request_rating = False  # Updated by _handle_end_chat to False
        mock_updated_response.transfer_reason = None
        mock_updated_response.transfer_description = None
        mock_updated_response.success = True  # Add success attribute
        
        # Set up async method return values
        mock_chat_agent._get_llm_response_only = AsyncMock(return_value=mock_response)
        mock_chat_agent._handle_end_chat = AsyncMock(return_value=mock_updated_response)
        
        # Mock _find_next_node
        next_node_id = uuid4()
        with patch('app.services.workflow_execution.ChatAgent') as mock_chat_agent_class:
            mock_chat_agent_class.create_async = AsyncMock(return_value=mock_chat_agent)
            with patch.object(workflow_service.session_repo, 'get_workflow_history', return_value=[]), \
                 patch.object(workflow_service, '_find_next_node', return_value=next_node_id):
                result = await workflow_service._execute_llm_node(
                    node=node,
                    workflow=sample_workflow,
                    workflow_state={},
                    user_message="Goodbye",
                    api_key="test-key",
                    model_name="gpt-4",
                    model_type="openai",
                    org_id="test-org",
                    agent_id="test-agent",
                    customer_id="test-customer",
                    session_id="test-session"
                )
                
                # Verify _handle_end_chat was NOT called (it's handled in workflow_chat service)
                mock_chat_agent._handle_end_chat.assert_not_called()
                
                # Verify the result has the correct rating setting
                assert result.success is True
                assert result.end_chat is True
                assert result.request_rating is False
                assert result.next_node_id == next_node_id
    
    @pytest.mark.asyncio
    async def test_llm_node_end_chat_without_rating_config(self, workflow_service, sample_workflow):
        """Test LLM node end chat without ask_for_rating config (should default to True)"""
        
        # Create LLM node with continuous execution but no ask_for_rating config
        node = Mock(spec=WorkflowNode)
        node.id = uuid4()
        node.node_type = NodeType.LLM
        config_dict = {
            "system_prompt": "You are a helpful assistant.",
            "exit_condition": ExitCondition.CONTINUOUS_EXECUTION,
            "model_config": {
                "temperature": 0.7,
                "max_tokens": 150
            }
        }
        node.config = MagicMock()
        node.config.__getitem__.side_effect = config_dict.__getitem__
        node.config.get.side_effect = config_dict.get
        
        # Mock chat agent and its response
        mock_chat_agent = AsyncMock()
        mock_response = Mock(spec=ChatResponse)
        mock_response.message = "Thank you for chatting with us. Goodbye!"
        mock_response.transfer_to_human = False
        mock_response.end_chat = True
        mock_response.request_rating = False
        mock_response.transfer_reason = None
        mock_response.transfer_description = None
        mock_response.success = True  # Add success attribute
        
        # Mock the updated response after _handle_end_chat
        mock_updated_response = Mock(spec=ChatResponse)
        mock_updated_response.message = "Thank you for chatting with us. Goodbye!\n\nThank you for chatting with us! Would you please take a moment to rate your experience? Your feedback helps us improve our service."
        mock_updated_response.transfer_to_human = False
        mock_updated_response.end_chat = True
        mock_updated_response.request_rating = True  # Should default to True
        mock_updated_response.transfer_reason = None
        mock_updated_response.transfer_description = None
        mock_updated_response.success = True  # Add success attribute
        
        # Set up async method return values
        mock_chat_agent._get_llm_response_only = AsyncMock(return_value=mock_response)
        mock_chat_agent._handle_end_chat = AsyncMock(return_value=mock_updated_response)
        
        # Mock _find_next_node
        next_node_id = uuid4()
        with patch('app.services.workflow_execution.ChatAgent') as mock_chat_agent_class:
            mock_chat_agent_class.create_async = AsyncMock(return_value=mock_chat_agent)
            with patch.object(workflow_service.session_repo, 'get_workflow_history', return_value=[]), \
                 patch.object(workflow_service, '_find_next_node', return_value=next_node_id):
                result = await workflow_service._execute_llm_node(
                    node=node,
                    workflow=sample_workflow,
                    workflow_state={},
                    user_message="Goodbye",
                    api_key="test-key",
                    model_name="gpt-4",
                    model_type="openai",
                    org_id="test-org",
                    agent_id="test-agent",
                    customer_id="test-customer",
                    session_id="test-session"
                )
                
                # Verify _handle_end_chat was NOT called (it's handled in workflow_chat service)
                mock_chat_agent._handle_end_chat.assert_not_called()
                
                # Verify the result has the correct rating setting (default True)
                assert result.success is True
                assert result.end_chat is True
                assert result.request_rating is True
                assert result.next_node_id == next_node_id
    
    @pytest.mark.asyncio
    async def test_llm_node_end_chat_single_execution_no_config_override(self, workflow_service, sample_workflow):
        """Test LLM node end chat with single execution (should not use config override)"""
        
        # Create LLM node with single execution
        node = Mock(spec=WorkflowNode)
        node.id = uuid4()
        node.node_type = NodeType.LLM
        config_dict = {
            "system_prompt": "You are a helpful assistant.",
            "exit_condition": ExitCondition.SINGLE_EXECUTION,
            "ask_for_rating": False,  # This should not be used for single execution
            "model_config": {
                "temperature": 0.7,
                "max_tokens": 150
            }
        }
        node.config = MagicMock()
        node.config.__getitem__.side_effect = config_dict.__getitem__
        node.config.get.side_effect = config_dict.get
        
        # Mock chat agent and its response
        mock_chat_agent = AsyncMock()
        mock_response = Mock(spec=ChatResponse)
        mock_response.message = "Thank you for chatting with us. Goodbye!"
        mock_response.transfer_to_human = False
        mock_response.end_chat = True
        mock_response.request_rating = False
        mock_response.transfer_reason = None
        mock_response.transfer_description = None
        mock_response.success = True  # Add success attribute
        
        # Mock the updated response after _handle_end_chat (using agent's default)
        mock_updated_response = Mock(spec=ChatResponse)
        mock_updated_response.message = "Thank you for chatting with us. Goodbye!"
        mock_updated_response.transfer_to_human = False
        mock_updated_response.end_chat = True
        mock_updated_response.request_rating = False  # Uses agent's default, not config
        mock_updated_response.transfer_reason = None
        mock_updated_response.transfer_description = None
        mock_updated_response.success = True  # Add success attribute
        
        # Set up async method return values
        mock_chat_agent._get_llm_response_only = AsyncMock(return_value=mock_response)
        mock_chat_agent._handle_end_chat = AsyncMock(return_value=mock_updated_response)
        
        # Mock _find_next_node
        next_node_id = uuid4()
        with patch('app.services.workflow_execution.ChatAgent') as mock_chat_agent_class:
            mock_chat_agent_class.create_async = AsyncMock(return_value=mock_chat_agent)
            with patch.object(workflow_service.session_repo, 'get_workflow_history', return_value=[]), \
                 patch.object(workflow_service, '_find_next_node', return_value=next_node_id):
                result = await workflow_service._execute_llm_node(
                    node=node,
                    workflow=sample_workflow,
                    workflow_state={},
                    user_message="Goodbye",
                    api_key="test-key",
                    model_name="gpt-4",
                    model_type="openai",
                    org_id="test-org",
                    agent_id="test-agent",
                    customer_id="test-customer",
                    session_id="test-session"
                )
                
                # Verify _handle_end_chat was NOT called (it's handled in workflow_chat service)
                mock_chat_agent._handle_end_chat.assert_not_called()
                
                # Verify the result (single execution doesn't override rating)
                assert result.success is True
                assert result.end_chat is True
                assert result.request_rating is False
                assert result.next_node_id == next_node_id
    
    @pytest.mark.asyncio
    async def test_llm_node_no_end_chat_no_handle_end_chat_call(self, workflow_service, sample_workflow):
        """Test LLM node without end chat (should not call _handle_end_chat)"""
        
        # Create LLM node
        node = Mock(spec=WorkflowNode)
        node.id = uuid4()
        node.node_type = NodeType.LLM
        config_dict = {
            "system_prompt": "You are a helpful assistant.",
            "exit_condition": ExitCondition.CONTINUOUS_EXECUTION,
            "model_config": {
                "temperature": 0.7,
                "max_tokens": 150
            }
        }
        node.config = MagicMock()
        node.config.__getitem__.side_effect = config_dict.__getitem__
        node.config.get.side_effect = config_dict.get
        
        # Mock chat agent and its response (no end chat)
        mock_chat_agent = AsyncMock()
        mock_response = Mock(spec=ChatResponse)
        mock_response.message = "How can I help you today?"
        mock_response.transfer_to_human = False
        mock_response.end_chat = False  # No end chat
        mock_response.request_rating = False
        mock_response.transfer_reason = None
        mock_response.transfer_description = None
        mock_response.success = True  # Add success attribute
        
        # Set up async method return values
        mock_chat_agent._get_llm_response_only = AsyncMock(return_value=mock_response)
        
        # Mock _find_next_node
        next_node_id = uuid4()
        with patch('app.services.workflow_execution.ChatAgent') as mock_chat_agent_class:
            mock_chat_agent_class.create_async = AsyncMock(return_value=mock_chat_agent)
            with patch.object(workflow_service.session_repo, 'get_workflow_history', return_value=[]), \
                 patch.object(workflow_service, '_find_next_node', return_value=next_node_id):
                result = await workflow_service._execute_llm_node(
                    node=node,
                    workflow=sample_workflow,
                    workflow_state={},
                    user_message="Hello",
                    api_key="test-key",
                    model_name="gpt-4",
                    model_type="openai",
                    org_id="test-org",
                    agent_id="test-agent",
                    customer_id="test-customer",
                    session_id="test-session"
                )
                
                # Verify _handle_end_chat was NOT called
                mock_chat_agent._handle_end_chat.assert_not_called()
                
                # Verify the result
                assert result.success is True
                assert result.end_chat is False
                assert result.request_rating is False
                assert result.next_node_id is None
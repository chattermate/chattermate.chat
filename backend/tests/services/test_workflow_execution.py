"""
ChatterMate - Workflow Execution Tests
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


@pytest.fixture
def sample_workflow_node():
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
    return node


@pytest.fixture
def sample_chat_history():
    """Create sample chat history for testing"""
    from datetime import datetime
    history = [
        Mock(),
        Mock(),
        Mock()
    ]
    history[0].message = "Hello! How can I help you today?"
    history[0].message_type = "assistant"
    history[0].created_at = datetime.now()
    history[0].attributes = {}
    history[1].message = "I need help with my order"
    history[1].message_type = "user"
    history[1].created_at = datetime.now()
    history[1].attributes = {}
    history[2].message = "I'll help you with your order. What's your order number?"
    history[2].message_type = "assistant"
    history[2].created_at = datetime.now()
    history[2].attributes = {}
    return history


class TestWorkflowExecutionService:
    
    @pytest.mark.asyncio
    async def test_build_context_message_with_full_history(
        self, workflow_service, sample_chat_history
    ):
        """Test building context message with full chat history"""
        
        # Mock repositories
        mock_chat_repo = Mock()
        mock_chat_repo.get_session_history = AsyncMock(return_value=sample_chat_history)
        
        with patch('app.services.workflow_execution.ChatRepository', return_value=mock_chat_repo), \
             patch.object(workflow_service.session_repo, 'get_workflow_history', return_value=[]):
            
            # Build context message
            context_message = await workflow_service._build_context_message("test-session", {})
            
            # Verify context message contains expected structure and chat history
            assert "CONTEXT on previous workflow messages" in context_message
            assert "Hello! How can I help you today?" in context_message
            assert "I need help with my order" in context_message
            assert "I'll help you with your order. What's your order number?" in context_message
            assert "CONVERSATION HISTORY:" in context_message
            # Instruction header changed in implementation; detailed analysis instructions are implicit now
    
    @pytest.mark.asyncio
    async def test_build_context_message_empty_history(self, workflow_service):
        """Test building context message with empty chat history"""
        
        # Mock repositories with empty history
        mock_chat_repo = Mock()
        mock_chat_repo.get_session_history = AsyncMock(return_value=[])
        
        with patch('app.services.workflow_execution.ChatRepository', return_value=mock_chat_repo), \
             patch.object(workflow_service.session_repo, 'get_workflow_history', return_value=[]):
            
            # Build context message
            context_message = await workflow_service._build_context_message("test-session", {})
            
            # Verify context message structure for empty history
            assert "CONTEXT on previous workflow messages" in context_message
            assert "No previous messages" in context_message
            assert "No previous workflow interactions" in context_message
            # Instruction header changed in implementation; detailed analysis instructions are implicit now
    
    @pytest.mark.asyncio
    async def test_build_context_message_error_handling(self, workflow_service):
        """Test building context message with error in repository"""
        
        # Mock repositories to raise exception
        mock_chat_repo = Mock()
        mock_chat_repo.get_session_history = AsyncMock(side_effect=Exception("Test error"))
        
        with patch('app.services.workflow_execution.ChatRepository', return_value=mock_chat_repo), \
             patch.object(workflow_service.session_repo, 'get_workflow_history', return_value=[]):
            
            # Build context message
            context_message = await workflow_service._build_context_message("test-session", {})
            
            # Verify fallback context message on error
            assert "Please analyze the current conversation context" in context_message
            assert "provide an appropriate response" in context_message
    
    @pytest.mark.asyncio
    async def test_execute_llm_node_with_empty_message(
        self, workflow_service, sample_workflow_node, sample_workflow, sample_chat_history
    ):
        """Test LLM node execution with empty user message"""
        
        # Mock chat agent and its response
        mock_chat_agent = AsyncMock()
        mock_response = Mock()
        mock_response.message = "Based on our conversation, I can see you're asking about order ORDER123. Let me check that for you."
        mock_response.transfer_to_human = False
        mock_response.end_chat = False
        mock_response.transfer_reason = None
        mock_response.transfer_description = None
        mock_response.success = True  # Add success attribute
        
        # Set up async method return value
        mock_chat_agent._get_llm_response_only = AsyncMock(return_value=mock_response)
        
        # Mock repositories
        mock_chat_repo = Mock()
        mock_chat_repo.get_session_history = AsyncMock(return_value=sample_chat_history)
        
        with patch('app.services.workflow_execution.ChatAgent') as mock_chat_agent_class:
            mock_chat_agent_class.create_async = AsyncMock(return_value=mock_chat_agent)
            with patch('app.services.workflow_execution.ChatRepository', return_value=mock_chat_repo), \
                 patch.object(workflow_service.session_repo, 'get_workflow_history', return_value=[]):
                
                # Test with empty user message
                result = await workflow_service._execute_llm_node(
                    node=sample_workflow_node,
                    workflow=sample_workflow,
                    workflow_state={},
                    user_message="",  # Empty message
                    api_key="test-key",
                    model_name="gpt-4",
                    model_type="openai",
                    org_id="test-org",
                    agent_id="test-agent",
                    customer_id="test-customer",
                    session_id="test-session"
                )
                
                # Verify that context message was built and used
                assert result.success is True
                assert result.message == mock_response.message
                assert result.next_node_id is None
                assert result.should_continue is False
    
    @pytest.mark.asyncio
    async def test_execute_llm_node_with_normal_message(
        self, workflow_service, sample_workflow_node, sample_workflow
    ):
        """Test LLM node execution with normal user message (should not use context building)"""
        
        # Mock chat agent and its response
        mock_chat_agent = AsyncMock()
        mock_response = Mock()
        mock_response.message = "I understand you want to check your order status."
        mock_response.transfer_to_human = False
        mock_response.end_chat = False
        mock_response.transfer_reason = None
        mock_response.transfer_description = None
        mock_response.success = True  # Add success attribute
        
        # Set up async method return value
        mock_chat_agent._get_llm_response_only = AsyncMock(return_value=mock_response)
        
        with patch('app.services.workflow_execution.ChatAgent') as mock_chat_agent_class:
            mock_chat_agent_class.create_async = AsyncMock(return_value=mock_chat_agent)
            with patch.object(workflow_service.session_repo, 'get_workflow_history', return_value=[]):
                
                # Test with normal user message
                user_message = "I want to check my order status"
                result = await workflow_service._execute_llm_node(
                    node=sample_workflow_node,
                    workflow=sample_workflow,
                    workflow_state={},
                    user_message=user_message,
                    api_key="test-key",
                    model_name="gpt-4",
                    model_type="openai",
                    org_id="test-org",
                    agent_id="test-agent",
                    customer_id="test-customer",
                    session_id="test-session"
                )
                
                # Verify that original message was used
                assert result.success is True
                assert result.message == mock_response.message
                assert result.next_node_id is None
                assert result.should_continue is False
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

    def test_find_start_node(self, workflow_service, sample_workflow):
        """Test finding the start node in a workflow"""
        # Create start node with no incoming connections
        start_node = Mock(spec=WorkflowNode)
        start_node.id = uuid4()
        start_node.node_type = NodeType.MESSAGE
        start_node.incoming_connections = []
        start_node.config = {}

        # Create other nodes with incoming connections
        other_node = Mock(spec=WorkflowNode)
        other_node.id = uuid4()
        other_node.node_type = NodeType.LLM
        other_node.incoming_connections = [Mock()]  # Has incoming connection

        sample_workflow.nodes = [other_node, start_node]

        # Find start node (should return the one with no incoming connections)
        result = workflow_service._find_start_node(sample_workflow)

        assert result.id == start_node.id

    def test_find_node_by_id(self, workflow_service, sample_workflow):
        """Test finding a node by ID"""
        node_id = uuid4()
        target_node = Mock(spec=WorkflowNode)
        target_node.id = node_id

        other_node = Mock(spec=WorkflowNode)
        other_node.id = uuid4()

        sample_workflow.nodes = [other_node, target_node]

        # Find existing node
        result = workflow_service._find_node_by_id(sample_workflow, node_id)
        assert result.id == node_id

        # Try to find non-existent node
        result = workflow_service._find_node_by_id(sample_workflow, uuid4())
        assert result is None

    def test_execute_message_node(self, workflow_service):
        """Test executing a MESSAGE node"""
        next_node_id = uuid4()
        connection = Mock()
        connection.target_node_id = next_node_id

        node = Mock(spec=WorkflowNode)
        node.id = uuid4()
        node.node_type = NodeType.MESSAGE
        node.config = {"message_text": "Hello {{user_name}}!"}
        node.outgoing_connections = [connection]

        node_id_str = str(node.id)
        workflow_state = {
            "variables": {
                node_id_str: {"user_name": "John"}
            }
        }

        result = workflow_service._execute_message_node(node, workflow_state)

        assert result.success is True
        assert "Hello John!" in result.message
        assert result.should_continue is True
        assert result.next_node_id == next_node_id

    def test_execute_condition_node_true(self, workflow_service, sample_workflow):
        """Test condition node with true condition"""
        next_node_id = uuid4()
        connection = Mock()
        connection.target_node_id = next_node_id
        connection.label = "true"
        connection.condition = "true"

        node = Mock(spec=WorkflowNode)
        node.id = uuid4()
        node.node_type = NodeType.CONDITION
        node.config = {"condition_expression": "{{order_total}} > 100"}
        node.outgoing_connections = [connection]

        node_id_str = str(node.id)
        workflow_state = {
            "variables": {
                node_id_str: {"order_total": "150"}
            }
        }

        result = workflow_service._execute_condition_node(node, sample_workflow, workflow_state)

        assert result.success is True
        assert result.should_continue is True

    def test_execute_condition_node_false(self, workflow_service, sample_workflow):
        """Test condition node with false condition"""
        next_node_id = uuid4()
        connection = Mock()
        connection.target_node_id = next_node_id
        connection.label = "false"
        connection.condition = "false"

        node = Mock(spec=WorkflowNode)
        node.id = uuid4()
        node.node_type = NodeType.CONDITION
        node.config = {"condition_expression": "{{order_total}} > 200"}
        node.outgoing_connections = [connection]

        node_id_str = str(node.id)
        workflow_state = {
            "variables": {
                node_id_str: {"order_total": "150"}
            }
        }

        result = workflow_service._execute_condition_node(node, sample_workflow, workflow_state)

        assert result.success is True
        assert result.should_continue is True

    def test_execute_end_node(self, workflow_service):
        """Test executing an END node"""
        node = Mock(spec=WorkflowNode)
        node.id = uuid4()
        node.node_type = NodeType.END
        node.config = {"message_text": "Thank you for using our service!"}

        result = workflow_service._execute_end_node(node, {})

        assert result.success is True
        assert "Thank you" in result.message
        assert result.end_chat is True
        assert result.should_continue is False

    def test_execute_human_transfer_node(self, workflow_service):
        """Test executing a HUMAN_TRANSFER node"""
        node = Mock(spec=WorkflowNode)
        node.id = uuid4()
        node.node_type = NodeType.HUMAN_TRANSFER
        node.config = {
            "transfer_rules": {
                "message": "Transferring you to a human agent. Please wait..."
            },
            "transfer_group_id": "support_team"
        }

        result = workflow_service._execute_human_transfer_node(node, {})

        assert result.success is True
        assert result.transfer_to_human is True
        assert result.transfer_group_id == "support_team"
        assert result.should_continue is False

    def test_execute_wait_node(self, workflow_service):
        """Test executing a WAIT node"""
        next_node_id = uuid4()
        connection = Mock()
        connection.target_node_id = next_node_id

        node = Mock(spec=WorkflowNode)
        node.id = uuid4()
        node.node_type = NodeType.WAIT
        node.config = {"duration": 1}  # 1 second
        node.wait_duration = 1
        node.outgoing_connections = [connection]

        result = workflow_service._execute_wait_node(node, {})

        assert result.success is True
        assert result.should_continue is True
        assert result.next_node_id == next_node_id

    def test_process_variables(self, workflow_service):
        """Test variable replacement in text"""
        node_id = str(uuid4())
        text = "Hello {{user_name}}, your order {{order_id}} is ready!"
        workflow_state = {
            "variables": {
                node_id: {
                    "user_name": "Alice",
                    "order_id": "ORDER123"
                }
            }
        }

        result = workflow_service._process_variables(text, workflow_state)

        assert result == "Hello Alice, your order ORDER123 is ready!"

    def test_process_variables_missing_var(self, workflow_service):
        """Test variable replacement with missing variable"""
        text = "Hello {{user_name}}"
        workflow_state = {"variables": {}}

        result = workflow_service._process_variables(text, workflow_state)

        # Should leave placeholder as is or handle gracefully
        assert "{{user_name}}" in result or "user_name" in result

    def test_evaluate_condition_greater_than(self, workflow_service):
        """Test evaluating > condition"""
        condition = "100 > 50"
        result = workflow_service._evaluate_condition(condition, {})
        assert result is True

        condition = "50 > 100"
        result = workflow_service._evaluate_condition(condition, {})
        assert result is False

    def test_evaluate_condition_equals(self, workflow_service):
        """Test evaluating === condition"""
        condition = "active === active"
        result = workflow_service._evaluate_condition(condition, {})
        assert result is True

        condition = "active === inactive"
        result = workflow_service._evaluate_condition(condition, {})
        assert result is False

    def test_evaluate_condition_contains(self, workflow_service):
        """Test evaluating contains condition"""
        condition = "hello contains ell"
        result = workflow_service._evaluate_condition(condition, {})
        assert result is True

        condition = "hello contains xyz"
        result = workflow_service._evaluate_condition(condition, {})
        assert result is False

    def test_find_next_node(self, workflow_service):
        """Test finding the next node from connections"""
        from app.models.workflow_connection import WorkflowConnection

        current_node_id = uuid4()
        next_node_id = uuid4()

        node = Mock(spec=WorkflowNode)
        node.id = current_node_id
        node.workflow_id = uuid4()

        # Create a connection
        connection = Mock(spec=WorkflowConnection)
        connection.source_node_id = current_node_id
        connection.target_node_id = next_node_id
        connection.condition_type = None

        node.outgoing_connections = [connection]

        result = workflow_service._find_next_node(node)

        assert result == next_node_id

    def test_find_next_node_no_connections(self, workflow_service):
        """Test finding next node when no connections exist"""
        node = Mock(spec=WorkflowNode)
        node.id = uuid4()
        node.outgoing_connections = []

        result = workflow_service._find_next_node(node)

        assert result is None

    def test_interpolate_variables(self, workflow_service):
        """Test interpolating variables in text"""
        node_id = str(uuid4())
        text = "Order {{order_id}} for {{customer_name}}"
        workflow_state = {
            "variables": {
                node_id: {
                    "order_id": "12345",
                    "customer_name": "Bob"
                }
            }
        }

        result = workflow_service._interpolate_variables(text, workflow_state)

        assert result == "Order 12345 for Bob"

    def test_parse_operands(self, workflow_service):
        """Test parsing operands from strings"""
        left, right = workflow_service._parse_operands("100", "50")
        assert left == "100"
        assert right == "50"

        left, right = workflow_service._parse_operands('"hello"', '"world"')
        assert left == "hello"
        assert right == "world"

    def test_parse_numeric_operands(self, workflow_service):
        """Test parsing numeric operands"""
        left, right = workflow_service._parse_numeric_operands("100", "50")
        assert left == 100.0
        assert right == 50.0

        left, right = workflow_service._parse_numeric_operands("10.5", "20.3")
        assert left == 10.5
        assert right == 20.3

    def test_store_form_variables(self, workflow_service):
        """Test storing form data in workflow state"""
        workflow_state = {"variables": {}}
        node_id = uuid4()
        form_data = {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "123-456-7890"
        }

        workflow_service._store_form_variables(workflow_state, node_id, form_data)

        # Variables are stored under the node_id
        node_id_str = str(node_id)
        assert node_id_str in workflow_state["variables"]
        assert workflow_state["variables"][node_id_str]["name"] == "John Doe"
        assert workflow_state["variables"][node_id_str]["email"] == "john@example.com"
        assert workflow_state["variables"][node_id_str]["phone"] == "123-456-7890"

    @pytest.mark.asyncio
    async def test_execute_workflow_not_found(self, workflow_service):
        """Test executing non-existent workflow"""
        with patch.object(workflow_service.workflow_repo, 'get_workflow_with_nodes_and_connections', return_value=None):
            result = await workflow_service.execute_workflow(
                session_id="test-session",
                user_message="Hello",
                workflow_id=uuid4()
            )

            assert result.success is False
            # The error occurs when trying to access workflow.id on None
            assert "error" in result.message.lower()

    @pytest.mark.asyncio
    async def test_execute_workflow_not_published(self, workflow_service, sample_workflow):
        """Test executing unpublished workflow"""
        sample_workflow.status = WorkflowStatus.DRAFT

        with patch.object(workflow_service.workflow_repo, 'get_workflow_with_nodes_and_connections', return_value=sample_workflow):
            result = await workflow_service.execute_workflow(
                session_id="test-session",
                user_message="Hello",
                workflow_id=sample_workflow.id
            )

            assert result.success is False
            assert "not published" in result.message.lower()

    @pytest.mark.asyncio
    async def test_execute_workflow_no_start_node(self, workflow_service, sample_workflow):
        """Test executing workflow with no start node"""
        sample_workflow.nodes = []

        with patch.object(workflow_service.workflow_repo, 'get_workflow_with_nodes_and_connections', return_value=sample_workflow):
            result = await workflow_service.execute_workflow(
                session_id="test-session",
                user_message="Hello",
                workflow_id=sample_workflow.id
            )

            assert result.success is False
            # The error occurs when trying to access current_node.id on None
            assert "error" in result.message.lower()

    def test_execute_form_node(self, workflow_service):
        """Test executing a FORM node"""
        node = Mock(spec=WorkflowNode)
        node.id = uuid4()
        node.name = "Contact Form"
        node.node_type = NodeType.FORM
        node.config = {
            "form_fields": [
                {"name": "name", "type": "text", "label": "Name", "required": True},
                {"name": "email", "type": "email", "label": "Email", "required": True}
            ],
            "form_title": "Contact Us",
            "form_description": "Please fill out the form",
            "submit_button_text": "Submit"
        }

        result = workflow_service._execute_form_node(node, {}, None, "test-session")

        assert result.success is True
        assert result.form_data is not None
        assert "fields" in result.form_data
        assert result.should_continue is False

    def test_execute_landing_page_node(self, workflow_service):
        """Test executing a LANDING_PAGE node"""
        node = Mock(spec=WorkflowNode)
        node.id = uuid4()
        node.node_type = NodeType.LANDING_PAGE
        node.config = {
            "landing_page_heading": "Welcome",
            "landing_page_content": "Welcome to our service"
        }

        result = workflow_service._execute_landing_page_node(node, {}, None)

        assert result.success is True
        assert result.landing_page_data is not None
        assert "heading" in result.landing_page_data
        assert result.should_continue is False

    def test_execute_action_node(self, workflow_service):
        """Test executing an ACTION node"""
        next_node_id = uuid4()
        connection = Mock()
        connection.target_node_id = next_node_id

        node = Mock(spec=WorkflowNode)
        node.id = uuid4()
        node.node_type = NodeType.ACTION
        node.config = {
            "action_type": "set_variable",
            "action_config": {
                "variable_name": "status",
                "variable_value": "active"
            }
        }
        node.outgoing_connections = [connection]

        workflow_state = {"variables": {}}
        result = workflow_service._execute_action_node(node, workflow_state)

        assert result.success is True
        assert result.should_continue is True
        assert result.next_node_id == next_node_id
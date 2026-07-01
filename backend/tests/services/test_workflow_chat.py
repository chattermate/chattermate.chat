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
from unittest.mock import Mock, AsyncMock, patch
from app.services.workflow_chat import WorkflowChatService
from app.agents.chat_agent import ChatResponse


@pytest.fixture
def mock_db():
    return Mock()


@pytest.fixture
def workflow_chat_service(mock_db):
    return WorkflowChatService(mock_db)


@pytest.fixture
def sample_active_session():
    session = Mock()
    session.workflow_id = "test-workflow-id"
    session.user_id = None
    session.current_node_id = "test-node-id"
    session.workflow_state = {}
    return session


@pytest.fixture
def sample_session_data():
    return {
        'agent_id': 'test-agent-id',
        'ai_config': Mock(
            encrypted_api_key='encrypted-key',
            model_name='gpt-4',
            model_type='openai'
        )
    }


@pytest.fixture
def mock_sio():
    sio = AsyncMock()
    sio.emit = AsyncMock()
    return sio


class TestWorkflowChatService:
    
    @pytest.mark.asyncio
    async def test_handle_workflow_chat_successful_execution(
        self, workflow_chat_service, sample_active_session, sample_session_data, mock_sio
    ):
        """Test successful workflow execution"""
        
        # Mock workflow result
        mock_workflow_result = Mock()
        mock_workflow_result.success = True
        mock_workflow_result.message = "Test response"
        mock_workflow_result.transfer_to_human = False
        mock_workflow_result.end_chat = False
        mock_workflow_result.request_rating = False
        mock_workflow_result.form_data = None
        mock_workflow_result.intermediate_messages = []
        mock_workflow_result.next_node_id = "next-node"
        
        # Mock decrypt_api_key to return a test key
        with patch('app.services.workflow_chat.decrypt_api_key', return_value='test-api-key'):
            # Mock workflow service
            with patch.object(workflow_chat_service.workflow_service, 'execute_workflow', return_value=mock_workflow_result):
                with patch.object(workflow_chat_service.chat_repo, 'create_message'):
                    response = await workflow_chat_service.handle_workflow_chat(
                    active_session=sample_active_session,
                    message="test message",
                    session_id="test-session",
                    org_id="test-org",
                    customer_id="test-customer",
                    session=sample_session_data,
                    sio=mock_sio
                )
        
        assert response is not None
        assert isinstance(response, ChatResponse)
        assert response.message == "Test response"
        assert response.transfer_to_human is False
    
    @pytest.mark.asyncio
    async def test_handle_workflow_chat_form_display(
        self, workflow_chat_service, sample_active_session, sample_session_data, mock_sio
    ):
        """Test form display scenario returns None"""
        
        # Mock workflow result with form data
        mock_workflow_result = Mock()
        mock_workflow_result.success = True
        mock_workflow_result.form_data = {"field1": "value1"}
        mock_workflow_result.intermediate_messages = []
        
        # Mock decrypt_api_key to return a test key
        with patch('app.services.workflow_chat.decrypt_api_key', return_value='test-api-key'):
            with patch.object(workflow_chat_service.workflow_service, 'execute_workflow', return_value=mock_workflow_result):
                with patch.object(workflow_chat_service.chat_repo, 'create_message'):
                    response = await workflow_chat_service.handle_workflow_chat(
                    active_session=sample_active_session,
                    message="test message",
                    session_id="test-session",
                    org_id="test-org",
                    customer_id="test-customer",
                    session=sample_session_data,
                    sio=mock_sio
                )
        
        # Should return None for form display
        assert response is None
        # Should have emitted display_form event
        mock_sio.emit.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_handle_workflow_chat_failed_execution(
        self, workflow_chat_service, sample_active_session, sample_session_data, mock_sio
    ):
        """Test failed workflow execution"""
        
        # Mock failed workflow result
        mock_workflow_result = Mock()
        mock_workflow_result.success = False
        mock_workflow_result.error = "Test error"
        mock_workflow_result.message = "Error message"
        
        # Mock decrypt_api_key to return a test key
        with patch('app.services.workflow_chat.decrypt_api_key', return_value='test-api-key'):
            with patch.object(workflow_chat_service.workflow_service, 'execute_workflow', return_value=mock_workflow_result):
                with patch.object(workflow_chat_service.chat_repo, 'create_message'):
                    response = await workflow_chat_service.handle_workflow_chat(
                    active_session=sample_active_session,
                    message="test message",
                    session_id="test-session",
                    org_id="test-org",
                    customer_id="test-customer",
                    session=sample_session_data,
                    sio=mock_sio
                )
        
        assert response is not None
        assert isinstance(response, ChatResponse)
        assert response.transfer_to_human is False
        # Should either use the error message or fallback message
        assert response.message in ["Error message", "I apologize, but I'm having trouble processing your request right now."]
    
    @pytest.mark.asyncio
    async def test_handle_intermediate_messages(
        self, workflow_chat_service, sample_active_session, sample_session_data, mock_sio
    ):
        """Test handling of intermediate messages"""
        
        intermediate_messages = ["Message 1", "Message 2"]
        
        with patch.object(workflow_chat_service.chat_repo, 'create_message') as mock_create:
            await workflow_chat_service._handle_intermediate_messages(
                intermediate_messages=intermediate_messages,
                session_id="test-session",
                org_id="test-org",
                session=sample_session_data,
                customer_id="test-customer",
                active_session=sample_active_session,
                sio=mock_sio,
                namespace='/widget'
            )
        
        # Should create message for each intermediate message
        assert mock_create.call_count == 2
        # Should emit response for each intermediate message
        assert mock_sio.emit.call_count == 2 
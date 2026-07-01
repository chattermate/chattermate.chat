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
from unittest.mock import Mock, patch, AsyncMock
from app.services.workflow_chat import WorkflowChatService
from app.agents.chat_agent import ChatResponse


@pytest.fixture
def mock_db():
    return Mock()


@pytest.fixture
def workflow_chat_service(mock_db):
    return WorkflowChatService(mock_db)


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


class TestWorkflowChatServiceEndChat:
    
    @pytest.mark.asyncio
    async def test_handle_workflow_end_chat_with_rating_true(
        self, workflow_chat_service, sample_session_data
    ):
        """Test workflow end chat handling with request_rating=True"""
        
        # Create response with rating enabled
        response = ChatResponse(
            message="Thank you for chatting with us. Goodbye!",
            transfer_to_human=False,
            transfer_reason=None,
            transfer_description=None,
            end_chat=True,
            request_rating=True,  # Rating enabled from workflow config
            create_ticket=False
        )
        
        # Mock chat agent and its _handle_end_chat method
        mock_chat_agent = Mock()
        mock_updated_response = Mock(spec=ChatResponse)
        mock_updated_response.message = "Thank you for chatting with us. Goodbye!\n\nThank you for chatting with us! Would you please take a moment to rate your experience? Your feedback helps us improve our service."
        mock_updated_response.request_rating = True
        mock_updated_response.end_chat = True
        
        # Use AsyncMock for the async method
        mock_chat_agent._handle_end_chat = AsyncMock(return_value=mock_updated_response)
        
        # Mock decrypt_api_key to return a test key
        with patch('app.services.workflow_chat.decrypt_api_key', return_value='test-api-key'):
            with patch('app.services.workflow_chat.ChatAgent.create_async', AsyncMock(return_value=mock_chat_agent)):
                result = await workflow_chat_service._handle_workflow_end_chat(
                response=response,
                session_id="test-session",
                org_id="test-org",
                session=sample_session_data,
                customer_id="test-customer"
            )
            
            # Verify _handle_end_chat was called with the rating value from response
            mock_chat_agent._handle_end_chat.assert_called_once_with(
                response, "test-session", workflow_chat_service.db, True
            )
            
            # Verify the result
            assert result == mock_updated_response
    
    @pytest.mark.asyncio
    async def test_handle_workflow_end_chat_with_rating_false(
        self, workflow_chat_service, sample_session_data
    ):
        """Test workflow end chat handling with request_rating=False"""
        
        # Create response with rating disabled
        response = ChatResponse(
            message="Thank you for chatting with us. Goodbye!",
            transfer_to_human=False,
            transfer_reason=None,
            transfer_description=None,
            end_chat=True,
            request_rating=False,  # Rating disabled from workflow config
            create_ticket=False
        )
        
        # Mock chat agent and its _handle_end_chat method
        mock_chat_agent = Mock()
        mock_updated_response = Mock(spec=ChatResponse)
        mock_updated_response.message = "Thank you for chatting with us. Goodbye!"
        mock_updated_response.request_rating = False
        mock_updated_response.end_chat = True
        
        # Use AsyncMock for the async method
        mock_chat_agent._handle_end_chat = AsyncMock(return_value=mock_updated_response)
        
        # Mock decrypt_api_key to return a test key
        with patch('app.services.workflow_chat.decrypt_api_key', return_value='test-api-key'):
            with patch('app.services.workflow_chat.ChatAgent.create_async', AsyncMock(return_value=mock_chat_agent)):
                result = await workflow_chat_service._handle_workflow_end_chat(
                response=response,
                session_id="test-session",
                org_id="test-org",
                session=sample_session_data,
                customer_id="test-customer"
            )
            
            # Verify _handle_end_chat was called with the rating value from response
            mock_chat_agent._handle_end_chat.assert_called_once_with(
                response, "test-session", workflow_chat_service.db, False
            )
            
            # Verify the result
            assert result == mock_updated_response
    
    @pytest.mark.asyncio
    async def test_handle_workflow_end_chat_creates_chat_agent_correctly(
        self, workflow_chat_service, sample_session_data
    ):
        """Test that ChatAgent is created with correct parameters"""
        
        response = ChatResponse(
            message="Goodbye!",
            transfer_to_human=False,
            transfer_reason=None,
            transfer_description=None,
            end_chat=True,
            request_rating=True,
            create_ticket=False
        )
        
        mock_chat_agent = Mock()
        mock_chat_agent._handle_end_chat = AsyncMock(return_value=response)
        
        with patch('app.services.workflow_chat.ChatAgent.create_async', AsyncMock(return_value=mock_chat_agent)) as mock_create_async:
            with patch('app.services.workflow_chat.decrypt_api_key', return_value='decrypted-key'):
                
                await workflow_chat_service._handle_workflow_end_chat(
                    response=response,
                    session_id="test-session",
                    org_id="test-org",
                    session=sample_session_data,
                    customer_id="test-customer"
                )
                
                # Verify ChatAgent.create_async was called with correct parameters
                mock_create_async.assert_called_once_with(
                    api_key='decrypted-key',
                    model_name='gpt-4',
                    model_type='openai',
                    org_id="test-org",
                    agent_id='test-agent-id',
                    customer_id="test-customer",
                    session_id="test-session"
                ) 
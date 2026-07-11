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
from app.core.logger import get_logger
from app.agents.chat_agent import ChatAgent, ChatResponse
from app.repositories.chat import ChatRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services.workflow_execution import WorkflowExecutionService
from app.core.security import decrypt_api_key
from app.models.schemas.chat import TransferReasonType

logger = get_logger(__name__)


class WorkflowChatService:
    """Service for handling workflow-based chat processing"""
    
    def __init__(self, db):
        self.db = db
        self.chat_repo = ChatRepository(db)
        self.session_repo = SessionToAgentRepository(db)
        self.workflow_service = WorkflowExecutionService(db)
    
    async def handle_workflow_chat(
        self,
        active_session,
        message: str,
        session_id: str,
        org_id: str,
        customer_id: str,
        session: dict,
        sio,
        namespace: str = '/widget',
        source: str = None
    ) -> ChatResponse:
        """
        Handle chat processing for workflow-enabled agents
        
        Args:
            active_session: The active session object
            message: User message
            session_id: Session ID
            org_id: Organization ID
            customer_id: Customer ID
            session: Session data containing agent and AI config
            sio: SocketIO instance for emitting events
            namespace: SocketIO namespace
            
        Returns:
            ChatResponse: The response from workflow execution
        """
        
        # Store user message in chat history
        self.chat_repo.create_message({
            "message": message,
            "message_type": "user",
            "session_id": session_id,
            "organization_id": org_id,
            "agent_id": session['agent_id'],
            "customer_id": customer_id,
        })
        
        # Execute workflow
        workflow_result = await self.workflow_service.execute_workflow(
            session_id=session_id,
            user_message=message,
            workflow_id=active_session.workflow_id,
            current_node_id=active_session.current_node_id,
            workflow_state=active_session.workflow_state,
            api_key=decrypt_api_key(session['ai_config'].encrypted_api_key),
            model_name=session['ai_config'].model_name,
            model_type=session['ai_config'].model_type,
            org_id=org_id,
            agent_id=session['agent_id'],
            customer_id=customer_id,
            source=source
        )
        
        if workflow_result.success:
            return await self._handle_successful_workflow(
                workflow_result, active_session, session_id, org_id, 
                customer_id, session, sio, namespace
            )
        else:
            return await self._handle_failed_workflow(
                workflow_result, session_id, org_id, session, customer_id
            )
    
    async def _handle_successful_workflow(
        self, 
        workflow_result, 
        active_session, 
        session_id: str, 
        org_id: str, 
        customer_id: str, 
        session: dict, 
        sio, 
        namespace: str
    ) -> ChatResponse:
        """Handle successful workflow execution"""
        

        
        # Handle intermediate messages from MESSAGE nodes during automatic execution
        if workflow_result.intermediate_messages:
            await self._handle_intermediate_messages(
                workflow_result.intermediate_messages, session_id, org_id, 
                session, customer_id, active_session, sio, namespace
            )
        
        # Check if this is a form node that needs to display a form
        if workflow_result.form_data:
            await self._handle_form_display(workflow_result, session_id, sio, namespace)
            return None  # Don't send a regular chat response for form display
        
        # Create ChatResponse object from workflow result
        response = ChatResponse(
            message=workflow_result.message,
            transfer_to_human=workflow_result.transfer_to_human,
            transfer_reason=None,
            transfer_description=None,
            end_chat=workflow_result.end_chat,
            request_rating=workflow_result.request_rating,
            create_ticket=False
        )
        
        # Handle transfer to human if requested by workflow LLM
        if workflow_result.transfer_to_human:
            transfer_response = await self._handle_workflow_transfer(
                workflow_result, session_id, org_id, session, customer_id, response
            )
            if transfer_response:
                return transfer_response
        
        # Handle end chat if requested by workflow
        if workflow_result.end_chat:
            response = await self._handle_workflow_end_chat(
                response, session_id, org_id, session, customer_id
            )
        
        # Only store message if there's actual content
        if workflow_result.message:
            self._store_workflow_response(
                response, session_id, org_id, session, customer_id, 
                active_session, workflow_result
            )
        
        return response
    
    async def _handle_intermediate_messages(
        self, 
        intermediate_messages, 
        session_id: str, 
        org_id: str, 
        session: dict, 
        customer_id: str, 
        active_session, 
        sio, 
        namespace: str
    ):
        """Handle intermediate messages from MESSAGE nodes"""
        
        logger.info(f"Found {len(intermediate_messages)} intermediate messages from MESSAGE nodes")
        
        for intermediate_message in intermediate_messages:
            logger.debug(f"Emitting intermediate message: {intermediate_message}")
            
            # Store intermediate message in chat history
            self.chat_repo.create_message({
                "message": intermediate_message,
                "message_type": "bot",
                "session_id": session_id,
                "organization_id": org_id,
                "agent_id": session['agent_id'],
                "customer_id": customer_id,
                "attributes": {
                    "workflow_execution": True,
                    "workflow_id": str(active_session.workflow_id),
                    "intermediate_message": True,
                    "message_node": True
                }
            })
            
            # Emit intermediate message to client immediately
            await sio.emit('chat_response', {
                'message': intermediate_message,
                'type': 'chat_response',
                'transfer_to_human': False,
                'end_chat': False,
                'request_rating': False,
                'shopify_output': None
            }, room=session_id, namespace=namespace)
    
    async def _handle_form_display(self, workflow_result, session_id: str, sio, namespace: str):
        """Handle form display for form nodes"""
        
        logger.info(f"Form data detected: {workflow_result.form_data}")
        logger.info("Emitting display_form event")
        
        # Emit form display to client
        await sio.emit('display_form', {
            'form_data': workflow_result.form_data,
            'session_id': session_id
        }, room=session_id, namespace=namespace)
        
        logger.info("Form display event emitted successfully")
    
    async def _handle_workflow_transfer(
        self, 
        workflow_result, 
        session_id: str, 
        org_id: str, 
        session: dict, 
        customer_id: str, 
        response: ChatResponse
    ) -> ChatResponse:
        """Handle transfer to human requested by workflow"""
        
        logger.info(f"Workflow LLM requested transfer to human for session {session_id}")
        
        if workflow_result.transfer_group_id:
            # Transfer to specific group using workflow transfer method
            chat_agent = await ChatAgent.create_async(
                api_key=decrypt_api_key(session['ai_config'].encrypted_api_key),
                model_name=session['ai_config'].model_name,
                model_type=session['ai_config'].model_type,
                org_id=org_id,
                agent_id=session['agent_id'],
                customer_id=customer_id,
                session_id=session_id
            )
            
            try:
                # Create ChatResponse object with transfer details from workflow
                llm_response = ChatResponse(
                    message=workflow_result.message,
                    transfer_to_human=True,
                    transfer_reason=TransferReasonType(workflow_result.transfer_reason) if workflow_result.transfer_reason else None,
                    transfer_description=workflow_result.transfer_description,
                    end_chat=False,
                    request_rating=False,
                    create_ticket=False
                )
                
                transfer_response = await chat_agent.handle_workflow_transfer(
                    session_id=session_id,
                    org_id=org_id,
                    agent_id=session['agent_id'],
                    customer_id=customer_id,
                    transfer_group_id=workflow_result.transfer_group_id,
                    db=self.db,
                    chat_repo=self.chat_repo,
                    llm_response=llm_response
                )
                
                logger.info(f"Transfer completed for session {session_id} to group {workflow_result.transfer_group_id}")
                # Mark this as a transfer response so widget_chat.py can handle it properly
                transfer_response._is_transfer_response = True
                return transfer_response
            finally:
                await chat_agent.safe_cleanup_mcp_tools()
        else:
            # Fallback: just update session status without specific group
            logger.warning(f"No transfer_group_id provided for workflow transfer in session {session_id}")
            self.session_repo.update_session_status(session_id, "TRANSFERRED")
            return response
    
    async def _handle_workflow_end_chat(
        self, 
        response: ChatResponse, 
        session_id: str, 
        org_id: str, 
        session: dict, 
        customer_id: str
    ) -> ChatResponse:
        """Handle end chat requested by workflow"""
        
        logger.info(f"Workflow requested end chat for session {session_id}")
        
        # Create a ChatAgent instance to use the _handle_end_chat method
        chat_agent = await ChatAgent.create_async(
            api_key=decrypt_api_key(session['ai_config'].encrypted_api_key),
            model_name=session['ai_config'].model_name,
            model_type=session['ai_config'].model_type,
            org_id=org_id,
            agent_id=session['agent_id'],
            customer_id=customer_id,
            session_id=session_id
        )
        
        try:
            # Handle end chat using the agent's method with rating from response
            # The response.request_rating value comes from the workflow execution config
            return await chat_agent._handle_end_chat(response, session_id, self.db, response.request_rating)
        finally:
            await chat_agent.safe_cleanup_mcp_tools()
    
    def _store_workflow_response(
        self, 
        response: ChatResponse, 
        session_id: str, 
        org_id: str, 
        session: dict, 
        customer_id: str, 
        active_session, 
        workflow_result
    ):
        """Store workflow response in chat history"""
        
        self.chat_repo.create_message({
            "message": response.message,
            "message_type": "bot",
            "session_id": session_id,
            "organization_id": org_id,
            "agent_id": session['agent_id'],
            "customer_id": customer_id,
            "attributes": {
                "workflow_execution": True,
                "workflow_id": str(active_session.workflow_id),
                "current_node_id": str(workflow_result.next_node_id) if workflow_result.next_node_id else None,
                "transfer_to_human": response.transfer_to_human,
                "end_chat": response.end_chat,
                "request_rating": response.request_rating,
            }
        })
    
    async def _handle_failed_workflow(
        self, 
        workflow_result, 
        session_id: str, 
        org_id: str, 
        session: dict, 
        customer_id: str
    ) -> ChatResponse:
        """Handle failed workflow execution"""
        
        logger.error(f"Workflow execution failed: {workflow_result.error}")
        
        response = ChatResponse(
            message=workflow_result.message or "I apologize, but I'm having trouble processing your request right now.",
            transfer_to_human=False,
            transfer_reason=None,
            transfer_description=None,
            end_chat=False,
            request_rating=False,
            create_ticket=False
        )
        
        # Store error response in chat history
        self.chat_repo.create_message({
            "message": response.message,
            "message_type": "bot",
            "session_id": session_id,
            "organization_id": org_id,
            "agent_id": session['agent_id'],
            "customer_id": customer_id,
            "attributes": {
                "workflow_execution": True,
                "workflow_error": workflow_result.error,
                "transfer_to_human": response.transfer_to_human,
                "end_chat": response.end_chat,
                "request_rating": response.request_rating,
            }
        })
        
        return response 
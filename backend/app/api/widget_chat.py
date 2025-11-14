"""
ChatterMate - Widget Chat
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

import asyncio
import datetime
import json
import os
import re
from fastapi import APIRouter
from app.core.socketio import sio
from app.core.logger import get_logger
import traceback
from app.agents.chat_agent import ChatAgent, ChatResponse
from app.core.auth_utils import authenticate_socket, authenticate_socket_conversation_token
from app.database import get_db
from app.repositories.ai_config import AIConfigRepository
from app.repositories.widget import WidgetRepository
from app.core.security import decrypt_api_key
from app.repositories.session_to_agent import SessionToAgentRepository
from app.repositories.chat import ChatRepository
from app.repositories.customer import CustomerRepository
import uuid
from app.services.socket_rate_limit import socket_rate_limit
from app.services.workflow_chat import WorkflowChatService
from app.services.file_upload_service import FileUploadService
from app.core.config import settings
from app.core.s3 import get_s3_signed_url

from app.models.session_to_agent import SessionStatus
from app.agents.transfer_agent import get_agent_availability_response
from app.repositories.agent import AgentRepository
from app.repositories.rating import RatingRepository
from app.repositories.jira import JiraRepository
from app.models.ai_config import AIModelType
from app.services.workflow_execution import WorkflowExecutionService


# Try to import enterprise modules
try:
    from app.enterprise.services.message_limit import check_message_limit
    HAS_ENTERPRISE = True
except ImportError:
    HAS_ENTERPRISE = False

router = APIRouter()
logger = get_logger(__name__)


def format_datetime(dt):
    """Convert datetime to ISO format string"""
    return dt.isoformat() if dt else None

def validate_email(email: str) -> bool:
    """Validate email format"""
    if not email:
        return False
    email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    return re.match(email_pattern, email) is not None

def validate_phone_number(phone: str) -> bool:
    """Validate phone number format"""
    if not phone:
        return False
    # Remove all non-digit characters
    clean_phone = re.sub(r'\D', '', phone)
    # Check if it's between 7 and 15 digits (international standard)
    return 7 <= len(clean_phone) <= 15

def validate_form_field(field_config: dict, value: any) -> str:
    """Validate a single form field based on its configuration"""
    field_name = field_config.get('name', 'Field')
    field_label = field_config.get('label', field_name)
    field_type = field_config.get('type', 'text')
    required = field_config.get('required', False)
    min_length = field_config.get('minLength', 0)
    max_length = field_config.get('maxLength', None)
    
    # Required field validation
    if required and (value is None or str(value).strip() == ''):
        return f"{field_label} is required"
    
    # Skip further validation if field is empty and not required
    if value is None or str(value).strip() == '':
        return None
    
    value_str = str(value).strip()
    
    # Email validation
    if field_type == 'email' and not validate_email(value_str):
        return f"Please enter a valid email address for {field_label}"
    
    # Phone number validation
    if field_type == 'tel' and not validate_phone_number(value_str):
        return f"Please enter a valid phone number for {field_label}"
    
    # Length validation for text fields
    if field_type in ['text', 'textarea']:
        if min_length and len(value_str) < min_length:
            return f"{field_label} must be at least {min_length} characters"
        if max_length and len(value_str) > max_length:
            return f"{field_label} must not exceed {max_length} characters"
    
    # Number validation
    if field_type == 'number':
        try:
            num_value = float(value_str)
            if min_length is not None and num_value < min_length:
                return f"{field_label} must be at least {min_length}"
            if max_length is not None and num_value > max_length:
                return f"{field_label} must not exceed {max_length}"
        except ValueError:
            return f"{field_label} must be a valid number"
    
    return None

def validate_form_data(form_fields: list, form_data: dict) -> list:
    """Validate form data against field configurations"""
    errors = []
    
    for field_config in form_fields:
        field_name = field_config.get('name')
        if not field_name:
            continue
            
        value = form_data.get(field_name)
        error = validate_form_field(field_config, value)
        
        if error:
            errors.append(error)
    
    return errors

@sio.on('connect', namespace='/widget')
async def widget_connect(sid, environ, auth):
    try:
       
        logger.info(f"Widget client connected: {auth}")
        # Authenticate using conversation token from Authorization header
        widget_id, org_id, customer_id, conversation_token = await authenticate_socket_conversation_token(sid, auth)
        
        if not widget_id or not org_id:
            raise ValueError("Widget authentication failed")

        # Get widget and verify it exists
        db = next(get_db())
        widget_repo = WidgetRepository(db)
        widget = widget_repo.get_widget(widget_id)
        if not widget:
            raise ValueError("Invalid widget ID")

        # Get AI config for widget's organization
        ai_config_repo = AIConfigRepository(db)
        ai_config = ai_config_repo.get_active_config(org_id)
        if not ai_config:
            await sio.emit('error', {
                'error': 'AI configuration required',
                'type': 'ai_config_missing'
            }, to=sid, namespace='/widget')
            return False
        
        message_limit_reached = False
        # Check message limits if enterprise module is available
        if HAS_ENTERPRISE and ai_config.model_type == AIModelType.CHATTERMATE:
            if not await check_message_limit(db, org_id, sid, sio):
                message_limit_reached = True

        
        session_repo = SessionToAgentRepository(db)
                
        # Try to get existing active session
        active_session = session_repo.get_active_customer_session(
            customer_id=customer_id,
            agent_id=widget.agent_id
        )
              
        if active_session:
            session_id = str(active_session.session_id)
            logger.debug(f"Active session: {session_id}")  
        else:
            # Create new session if none exists
            new_session_id = str(uuid.uuid4())
            session_repo.create_session(
                session_id=new_session_id,
                agent_id=widget.agent_id,
                customer_id=customer_id,
                organization_id=org_id
            )
            session_id = new_session_id
            logger.debug(f"New session: {session_id}")

        # Join the room using session_id
        await sio.enter_room(sid, session_id, namespace='/widget')
        
        # Get agent to retrieve rate limiting settings
        agent_repo = AgentRepository(db)
        agent = agent_repo.get_agent(widget.agent_id)
        
        # Store session data including rate limiting settings
        enable_rate_limiting = agent.enable_rate_limiting if agent else False
        overall_limit_per_ip = agent.overall_limit_per_ip if agent else 100
        requests_per_sec = agent.requests_per_sec if agent else 1.0
        
        # Extract source from conversation token if available
        source = None
        try:
            from app.core.security import verify_conversation_token
            token_data = verify_conversation_token(conversation_token)
            if token_data:
                source = token_data.get("source")
        except Exception:
            pass
        
        session_data = {
            'widget_id': widget_id,
            'org_id': org_id,
            'agent_id': str(widget.agent_id),
            'customer_id': customer_id,
            'session_id': session_id,
            'ai_config': ai_config,
            'conversation_token': conversation_token,
            # Add rate limiting settings
            'enable_rate_limiting': enable_rate_limiting,
            'overall_limit_per_ip': overall_limit_per_ip,
            'requests_per_sec': requests_per_sec,
            'message_limit_reached': message_limit_reached,
            'use_workflow': agent.use_workflow if agent else False,
            'active_workflow_id': agent.active_workflow_id if agent else None,
            'source': source
        }

        # Log rate limiting settings
        if enable_rate_limiting:
            logger.debug(f"Rate limiting enabled for agent {agent.name} - Daily limit: {overall_limit_per_ip} requests, Rate: {requests_per_sec} req/sec")
        else:
            logger.debug(f"Rate limiting disabled for agent {agent.name}")

        logger.debug(f"Session data: {session_data['ai_config'].encrypted_api_key}")
        await sio.save_session(sid, session_data, namespace='/widget')
        logger.info(f"Widget client connected: {sid} joined room: {session_id}")
        return True

    except Exception as e:
        logger.error(f"Widget connection error for sid {sid}: {str(e)}")
        logger.error(traceback.format_exc())
        await sio.emit('error', {
            'error': 'Connection failed',
            'type': 'connection_error'
        }, to=sid, namespace='/widget')
        return False


@sio.on('chat', namespace='/widget')
@socket_rate_limit(namespace='/widget')
async def handle_widget_chat(sid, data):
    """Handle widget chat messages"""
    try:
        # Authenticate using conversation token
        session = await sio.get_session(sid, namespace='/widget')

        widget_id, org_id, customer_id, conversation_token = await authenticate_socket_conversation_token(sid, session)
        
        if not widget_id or not org_id:
            logger.error(f"Widget authentication failed for sid {sid}")
            await sio.emit('error', {'error': 'Authentication failed', 'type': 'auth_error'}, room=sid, namespace='/widget')
            return

        # Process message and files
        message = data.get('message', '').strip()
        files = data.get('files', [])  # List of file objects with base64 content
        
        if not message and not files:
            return

        session_id = session['session_id']
        # Verify session matches authenticated data
        if (session['widget_id'] != widget_id or 
            session['org_id'] != org_id or 
            session['customer_id'] != customer_id):
            raise ValueError("Session mismatch")
        
        # Upload files if provided
        uploaded_files = []
        if files:
            db_temp = next(get_db())
            try:
                agent_repo = AgentRepository(db_temp)
                agent = agent_repo.get_agent(session['agent_id'])
                if agent and not agent.allow_attachments:
                    await sio.emit('error', {
                        'error': 'Attachments are not allowed for this agent',
                        'type': 'validation_error'
                    }, room=sid, namespace='/widget')
                    return
                
                # Check if chat is handed over to human agent
                # Check if there's any agent message in the conversation
                from app.models import ChatHistory
                agent_message_exists = db_temp.query(ChatHistory).filter(
                    ChatHistory.session_id == session_id,
                    ChatHistory.message_type == 'agent'
                ).first()
                
                if not agent_message_exists:
                    await sio.emit('error', {
                        'error': 'Attachments are only available when the chat is handed over to a human agent',
                        'type': 'validation_error'
                    }, room=sid, namespace='/widget')
                    return
                
                # Upload each file
                for file_data in files:
                    try:
                        uploaded_file = await FileUploadService.upload_file(
                            file_data=file_data,
                            org_id=org_id,
                            customer_id=customer_id
                        )
                        uploaded_files.append(uploaded_file)
                    except ValueError as val_err:
                        # Validation error
                        logger.error(f"File validation error: {str(val_err)}")
                        await sio.emit('error', {
                            'error': str(val_err),
                            'type': 'validation_error'
                        }, room=sid, namespace='/widget')
                        return
                    except Exception as upload_err:
                        logger.error(f"Error uploading file: {str(upload_err)}")
                        await sio.emit('error', {
                            'error': f"Failed to upload file: {file_data.get('filename', 'unknown')}",
                            'type': 'upload_error'
                        }, room=sid, namespace='/widget')
                        return
            finally:
                db_temp.close()

        db = next(get_db())
        session_repo = SessionToAgentRepository(db)
                
        # Try to get existing active session
        active_session = session_repo.get_active_customer_session(
            customer_id=customer_id,
            agent_id=session['agent_id']
        )

        # Check message limit from session
        if HAS_ENTERPRISE and session.get('message_limit_reached') and active_session and active_session.user_id is None:
            logger.error(f"Message limit reached")
            await sio.emit('error', {
                    'error': 'Unable to process your message. Please contact support.',
                    'type': 'message_limit_exceeded'
            }, to=sid, namespace='/widget')
            return

        if not active_session:
            # Check if there's a closed session that can be reopened
            latest_session = session_repo.get_latest_customer_session(
                customer_id=customer_id
            )
            
            if latest_session and latest_session.status == SessionStatus.CLOSED:
                # Reopen the closed session if it matches the current session ID
                if str(latest_session.session_id) == session_id:
                    success = session_repo.reopen_closed_session(session_id)
                    if success:
                        # Refresh the session data
                        active_session = session_repo.get_session(session_id)
                        logger.info(f"Reopened closed session {session_id} for customer {customer_id}")
                    else:
                        raise ValueError("Failed to reopen closed session")
                else:
                    raise ValueError("Session mismatch")
            else:
                raise ValueError("No active session found")
        
        if str(active_session.session_id) != session_id:
            raise ValueError("Session mismatch")
        
        # Check if agent uses workflow and no human agent has taken over
        if active_session.workflow_id and active_session.user_id is None:
            # Handle workflow chat using the dedicated service
            workflow_chat_service = WorkflowChatService(db)
            response = await workflow_chat_service.handle_workflow_chat(
                active_session=active_session,
                message=message,
                session_id=session_id,
                org_id=org_id,
                customer_id=customer_id,
                session=session,
                sio=sio,
                namespace='/widget',
                source=session.get('source')
            )
            
            # If response is None, it means a form was displayed and no regular response should be sent
            if response is None:
                return
            
            # If this is a transfer response, send it and return
            if response.transfer_to_human and hasattr(response, '_is_transfer_response'):
                await sio.emit('chat_response', {
                    'message': response.message,
                    'session_id': session_id,
                    'transfer_to_human': response.transfer_to_human,
                    'transfer_reason': response.transfer_reason.value if response.transfer_reason else None,
                    'transfer_description': response.transfer_description,
                    'end_chat': response.end_chat,
                    'request_rating': response.request_rating
                }, room=session_id, namespace='/widget')
                return
        elif active_session.status == SessionStatus.OPEN and active_session.user_id is None: # open and user has not taken over
            logger.debug(f"Initializing chat agent for model {session['ai_config'].model_type}")
            # Initialize chat agent with async factory method for MCP tools support
            chat_agent = await ChatAgent.create_async(
                api_key=decrypt_api_key(session['ai_config'].encrypted_api_key),
                model_name=session['ai_config'].model_name,
                model_type=session['ai_config'].model_type,
                org_id=org_id,
                agent_id=session['agent_id'],
                customer_id=customer_id,
                session_id=session_id,
                source=session.get('source')
            )
            try:
                # Get response from ai agent (this already handles end chat internally)
                response = await chat_agent.get_response(
                    message=message,
                    session_id=chat_agent.agent.session_id,
                    org_id=org_id,
                    agent_id=session['agent_id'],
                    customer_id=customer_id)
            finally:
                # Clean up MCP tools
                # Use asyncio.create_task to ensure cleanup doesn't block the main flow
                try:
                    cleanup_task = asyncio.create_task(chat_agent.cleanup_mcp_tools())
                    await asyncio.wait_for(cleanup_task, timeout=2.0)
                except asyncio.TimeoutError:
                    logger.debug("MCP cleanup timed out in widget chat (non-critical)")
                except Exception as cleanup_error:
                    logger.debug(f"MCP cleanup warning in widget chat (non-critical): {str(cleanup_error)}")
        elif active_session.status == SessionStatus.TRANSFERRED and active_session.user_id is None: # transferred and user has not taken over
            logger.debug(f"Transferring chat to human for session {session_id}")
            # Get response from agent transfer ai agent
            chat_repo = ChatRepository(db)
            user_msg = chat_repo.create_message({
                "message": message,
                "message_type": "user",
                "session_id": session_id,
                "organization_id": org_id,
                "agent_id": session['agent_id'],
                "customer_id": customer_id,
            })
            
            # Attach uploaded files to the user message
            if uploaded_files:
                from app.models import FileAttachment
                for file_info in uploaded_files:
                    file_attachment = FileAttachment(
                        file_url=file_info['file_url'],
                        filename=file_info['filename'],
                        content_type=file_info['content_type'],
                        file_size=file_info['size'],
                        chat_history_id=user_msg.id,
                        organization_id=org_id,
                        uploaded_by_customer_id=customer_id
                    )
                    db.add(file_attachment)
                db.commit()
            chat_history = []
            chat_history = await chat_repo.get_session_history(session_id)
            jira_repo = JiraRepository(db)
            agent_data = jira_repo.get_agent_with_jira_config(session['agent_id']) if session['agent_id'] else None
            availability_response = await get_agent_availability_response(
                agent=agent_data,
                customer_id=customer_id,
                chat_history=chat_history,
                db=db,
                api_key=decrypt_api_key(session['ai_config'].encrypted_api_key),
                model_name=session['ai_config'].model_name,
                model_type=session['ai_config'].model_type,
                session_id=session_id
            )

                # Create ChatResponse object
            response_content = ChatResponse(
                message=availability_response["message"],
                transfer_to_human=True,
                transfer_reason=None,
                transfer_description=None,
                end_chat=False,
                request_rating=False,
                create_ticket=False
            )
                
            # Store AI response with transfer status
            chat_repo.create_message({
                "message": response_content.message,
                "message_type": "bot",
                "session_id": session_id,
                "organization_id": org_id,  
                "agent_id": session['agent_id'],
                "customer_id": customer_id,
                "attributes": {
                    "transfer_to_human": response_content.transfer_to_human,
                    "transfer_reason": response_content.transfer_reason.value if response_content.transfer_reason else None,
                    "transfer_description": response_content.transfer_description,
                    "end_chat": response_content.end_chat,
                    "end_chat_reason": response_content.end_chat_reason.value if response_content.end_chat_reason else None,
                    "end_chat_description": response_content.end_chat_description,
                    "request_rating": response_content.request_rating,
                    "shopify_output": response_content.shopify_output
                                    }
                })
            response = response_content
        elif active_session.workflow_id and active_session.user_id is not None:
            # Workflow session but human agent has taken over - handle like regular human takeover
            chat_repo = ChatRepository(db)
            user_msg = chat_repo.create_message({
                "message": message,
                "message_type": "user",
                "session_id": session_id,
                "organization_id": org_id,  
                "agent_id": session['agent_id'],
                "customer_id": customer_id,
                "user_id": active_session.user_id,
            })
            
            # Attach uploaded files to the user message
            if uploaded_files:
                from app.models import FileAttachment
                for file_info in uploaded_files:
                    file_attachment = FileAttachment(
                        file_url=file_info['file_url'],
                        filename=file_info['filename'],
                        content_type=file_info['content_type'],
                        file_size=file_info['size'],
                        chat_history_id=user_msg.id,
                        organization_id=org_id,
                        uploaded_by_customer_id=customer_id
                    )
                    db.add(file_attachment)
                db.commit()
            # Get session data to find assigned user
            session_data = session_repo.get_session(session_id)
            user_id = str(session_data.user_id) if session_data and session_data.user_id else None
            timestamp = format_datetime(datetime.datetime.now())
            
            # Prepare attachments data if files were uploaded
            attachments_data = []
            if uploaded_files:
                for file_info in uploaded_files:
                    file_url = file_info['file_url']

                    # Generate S3 signed URL if S3 storage is enabled
                    if settings.S3_FILE_STORAGE:
                        try:
                            file_url = await get_s3_signed_url(file_url)
                        except Exception as e:
                            logger.error(f"Error generating signed URL for attachment: {str(e)}")

                    attachments_data.append({
                        'filename': file_info['filename'],
                        'file_url': file_url,
                        'content_type': file_info['content_type'],
                        'file_size': file_info['size']
                    })

            if user_id:
                # Also emit to user-specific room
                user_room = f"user_{user_id}"
                await sio.emit('chat_reply', {
                    'message': message,
                    'message_id': user_msg.id,
                    'type': 'user_message',
                    'transfer_to_human': False,
                    'session_id': session_id,
                    'created_at': timestamp,
                    'attachments': attachments_data if attachments_data else None
                }, room=user_room, namespace='/agent')

            # Emit to both session room and user's personal room
            await sio.emit('chat_reply', {
                'message': message,
                'message_id': user_msg.id,
                'type': 'user_message',
                'transfer_to_human': False,
                'session_id': session_id,
                'timestamp': timestamp,
                'attachments': attachments_data if attachments_data else None
            }, room=session_id, namespace='/agent')    

            return # don't do anything further - human agent handles the conversation
        else:
            chat_repo = ChatRepository(db)
            user_msg = chat_repo.create_message({
                "message": message,
                "message_type": "user",
                "session_id": session_id,
                "organization_id": org_id,  
                "agent_id": session['agent_id'],
                "customer_id": customer_id,
                "user_id": active_session.user_id,
            })
            
            # Attach uploaded files to the user message
            if uploaded_files:
                from app.models import FileAttachment
                for file_info in uploaded_files:
                    file_attachment = FileAttachment(
                        file_url=file_info['file_url'],
                        filename=file_info['filename'],
                        content_type=file_info['content_type'],
                        file_size=file_info['size'],
                        chat_history_id=user_msg.id,
                        organization_id=org_id,
                        uploaded_by_customer_id=customer_id
                    )
                    db.add(file_attachment)
                db.commit()
            # Get session data to find assigned user
            session_data = session_repo.get_session(session_id)
            user_id = str(session_data.user_id) if session_data and session_data.user_id else None
            timestamp = format_datetime(datetime.datetime.now())
            
            # Prepare attachments data if files were uploaded
            attachments_data = []
            if uploaded_files:
                for file_info in uploaded_files:
                    file_url = file_info['file_url']

                    # Generate S3 signed URL if S3 storage is enabled
                    if settings.S3_FILE_STORAGE:
                        try:
                            file_url = await get_s3_signed_url(file_url)
                        except Exception as e:
                            logger.error(f"Error generating signed URL for attachment: {str(e)}")

                    attachments_data.append({
                        'filename': file_info['filename'],
                        'file_url': file_url,
                        'content_type': file_info['content_type'],
                        'file_size': file_info['size']
                    })

            if user_id:
                # Also emit to user-specific room
                user_room = f"user_{user_id}"
                await sio.emit('chat_reply', {
                    'message': message,
                    'message_id': user_msg.id,
                    'type': 'user_message',
                    'transfer_to_human': False,
                    'session_id': session_id,
                    'created_at': timestamp,
                    'attachments': attachments_data if attachments_data else None
                }, room=user_room, namespace='/agent')


            # Emit to both session room and user's personal room
            await sio.emit('chat_reply', {
                'message': message,
                'message_id': user_msg.id,
                'type': 'user_message',
                'transfer_to_human': False,
                'session_id': session_id,
                'timestamp': timestamp,
                'attachments': attachments_data if attachments_data else None
            }, room=session_id, namespace='/agent')    

            return # don't do anything if the session is closed or the user has already taken over
        
        # Only emit response if we have a response object and message
        if 'response' in locals() and response.message:
            # Emit response to the specific room
            response_payload = {
                'message': response.message,
                'type': 'chat_response',
                'session_id': session_id,
                'transfer_to_human': response.transfer_to_human,
                'end_chat': response.end_chat,
                'end_chat_reason': response.end_chat_reason.value if response.end_chat_reason else None,
                'end_chat_description': response.end_chat_description,
                'request_rating': response.request_rating,
                # Initialize shopify_output to None. It will be populated if data exists.
                'shopify_output': None 
            }
            
            # Check if the response object has the structured shopify_output field
            # and assign it directly if it's valid (should be a Pydantic model or dict)
            if hasattr(response, 'shopify_output') and response.shopify_output:
                # Assuming response.shopify_output is already the correct 
                # ShopifyOutputData model instance from ChatResponse
                # We need to convert it to a dict for JSON serialization
                try:
                    response_payload['shopify_output'] = response.shopify_output.model_dump(exclude_unset=True)
                except AttributeError:
                     # Handle cases where it might be a plain dict already (less likely but safe)
                     if isinstance(response.shopify_output, dict):
                         response_payload['shopify_output'] = response.shopify_output
                     else:
                         logger.warning(f"Unexpected type for shopify_output: {type(response.shopify_output)}")

            await sio.emit('chat_response', response_payload, room=session_id, namespace='/widget')

    except Exception as e:
        logger.error(f"Widget chat error for sid {sid}: {str(e)}")
        logger.error(traceback.format_exc())
        await sio.emit('error', {
            'error': 'Unable to process your request, please try again later.',
            'type': 'chat_error'
        }, to=sid, namespace='/widget')


@sio.on('get_chat_history', namespace='/widget')
@socket_rate_limit(namespace='/widget')
async def get_widget_chat_history(sid):
    try:
        logger.info(f"Getting chat history for sid {sid}")
        # Get session data
        session = await sio.get_session(sid, namespace='/widget')
        widget_id, org_id, customer_id, conversation_token = await authenticate_socket_conversation_token(sid, session)
        
        if not widget_id or not org_id:
            logger.error(f"Widget authentication failed for sid {sid}")
            await sio.emit('error', {'error': 'Authentication failed', 'type': 'auth_error'}, room=sid, namespace='/widget')
            return


        
        # Verify session matches authenticated data
        if (session['widget_id'] != widget_id or 
            session['org_id'] != org_id or 
            session['customer_id'] != customer_id):
            raise ValueError("Session mismatch")
        
        db = next(get_db())
        
        # Get active session using new repository
        session_repo = SessionToAgentRepository(db)
        active_session = session_repo.get_active_customer_session(
            customer_id=customer_id,
            agent_id=session['agent_id']
        )

        if not active_session:
            logger.info("No active session found, returning empty history")
            await sio.emit('chat_history', {
                'messages': [],
                'type': 'chat_history'
            }, to=sid, namespace='/widget')
            return

        # Get chat history for active session
        chat_repo = ChatRepository(db)
        messages = await chat_repo.get_session_history(
            session_id=active_session.session_id
        )

        # Convert datetime to ISO format string
        formatted_messages = []
        for msg in messages:
            msg_dict = {
                'message': msg.message,
                'message_type': msg.message_type,
                'timestamp': format_datetime(msg.created_at),
                'attributes': msg.attributes,
                'user_name': msg.user.full_name if msg.user else None,
                'agent_name': msg.agent.display_name or msg.agent.name if msg.agent else None
            }
            
            # Add attachments with file info if they exist
            if msg.attachments:
                attachments = []
                for attachment in msg.attachments:
                    att_dict = {
                        'id': attachment.id,
                        'filename': attachment.filename,
                        'file_url': attachment.file_url,
                        'content_type': attachment.content_type,
                        'file_size': attachment.file_size
                    }
                    
                    # Use signed URL as file_url for S3 files
                    if hasattr(attachment, 'signed_url'):
                        att_dict['file_url'] = attachment.signed_url
                    
                    attachments.append(att_dict)
                msg_dict['attachments'] = attachments
            
            formatted_messages.append(msg_dict)

        await sio.emit('chat_history', {
            'messages': formatted_messages,
            'type': 'chat_history'
        }, to=sid, namespace='/widget')

    except ValueError as e:
        logger.error(f"Widget authentication error for sid {sid}: {str(e)}")
        await sio.emit('error', {
            'error': 'Authentication failed',
            'type': 'auth_error'
        }, to=sid, namespace='/widget')
    except Exception as e:
        logger.error(f"Error getting chat history for sid {sid}: {str(e)}")
        logger.error(traceback.format_exc())
        await sio.emit('error', {
            'error': 'Failed to get chat history',
            'type': 'chat_history_error'
        }, to=sid, namespace='/widget')


# Add connection handler for agent namespace
@sio.on('connect', namespace='/agent')
async def agent_connect(sid, environ, auth):
    try:
        access_token, user_id, org_id = await authenticate_socket(sid, environ)
        if not access_token:
            raise ValueError("Authentication failed")
        logger.info(f"Authenticated connection for user {
                    user_id} org {org_id}")

        # Store session data
        session_data = {
            'user_id': user_id,
            'organization_id': org_id
        }
        
        await sio.save_session(sid, session_data, namespace='/agent')
        
        
        return True

    except Exception as e:
        logger.error(f"Agent connection error for sid {sid}: {str(e)}")
        return False 
    
# Add new socket event handler for agent messages
@sio.on('agent_message', namespace='/agent')
async def handle_agent_message(sid, data):
    try:
        session = await sio.get_session(sid, namespace='/agent')
        session_id = data['session_id']
        
        logger.info(f"Session ID: {session_id}")
        if not session_id:
            raise ValueError("No active session")

        db = next(get_db())
        session_repo = SessionToAgentRepository(db)
        chat_repo = ChatRepository(db)
        
        # Verify session and agent permissions
        session_data = session_repo.get_session(session_id)
        if not session_data or str(session_data.user_id) != session.get('user_id'):
            raise ValueError("Unauthorized")

        # Upload files if provided
        files = data.get('files', [])
        uploaded_files = []
        if files:
            org_id = session.get('organization_id')
            user_id = session.get('user_id')
            
            for file_data in files:
                try:
                    uploaded_file = await FileUploadService.upload_file(
                        file_data=file_data,
                        org_id=org_id,
                        user_id=user_id
                    )
                    uploaded_files.append(uploaded_file)
                except ValueError as val_err:
                    logger.error(f"File validation error: {str(val_err)}")
                    await sio.emit('error', {
                        'error': str(val_err),
                        'type': 'validation_error'
                    }, to=sid, namespace='/agent')
                    return
                except Exception as upload_err:
                    logger.error(f"Error uploading file: {str(upload_err)}")
                    await sio.emit('error', {
                        'error': f"Failed to upload file: {file_data.get('filename', 'unknown')}",
                        'type': 'upload_error'
                    }, to=sid, namespace='/agent')
                    return

        # Store the agent's message
        message_data = {
            "message": data['message'],
            "message_type": data.get('message_type', "agent"),
            "session_id": session_id,
            "organization_id": session.get('organization_id'),
            "agent_id": session_data.agent_id if session_data.agent_id else None,
            "customer_id": session_data.customer_id,
            "user_id": session_data.user_id,
            "attributes":{
                "end_chat": data.get('end_chat', False),
                "request_rating": data.get('request_rating', False),
                "end_chat_reason": data.get('end_chat_reason', None),
                "end_chat_description": data.get('end_chat_description', None),
                "shopify_output": data.get('shopify_output', None)
            }
        }
        
        created_message = chat_repo.create_message(message_data)
        
        # Attach uploaded files to the message
        if uploaded_files:
            from app.models import FileAttachment
            for file_info in uploaded_files:
                file_attachment = FileAttachment(
                    file_url=file_info['file_url'],
                    filename=file_info['filename'],
                    content_type=file_info['content_type'],
                    file_size=file_info['size'],
                    chat_history_id=created_message.id,
                    organization_id=session.get('organization_id'),
                    uploaded_by_user_id=session.get('user_id')
                )
                db.add(file_attachment)
            db.commit()
            logger.info(f"Attached {len(uploaded_files)} files to agent message {created_message.id}")
        
        # Check if this is an end chat message
        if data.get('end_chat') is True:
            logger.info(f"Agent ended chat session {session_id}")
            # Update session status to closed
            session_repo.update_session_status(session_id, "CLOSED")
            
        
        # Emit to widget clients
        response_payload = {
            'message': data['message'],
            'type': 'agent_message',
            'message_type': data.get('message_type', 'agent'),
            'end_chat': data.get('end_chat', False),
            'request_rating': data.get('request_rating', False),
            'end_chat_reason': data.get('end_chat_reason', None),
            'end_chat_description': data.get('end_chat_description', None),
            'shopify_output': data.get('shopify_output', False)
        }
        
        # Add individual product fields if shopify_output is true
        if response_payload['shopify_output']:
            response_payload.update({
                'product_id': data.get('product_id'),
                'product_title': data.get('product_title'),
                'product_description': data.get('product_description'),
                'product_handle': data.get('product_handle'),
                'product_inventory': data.get('product_inventory'),
                'product_price': data.get('product_price'),
                'product_currency': data.get('product_currency'),
                'product_image': data.get('product_image'),
            })
        
        # Add attachments to response if files were uploaded
        if uploaded_files:
            attachments_data = []
            for file_info in uploaded_files:
                file_url = file_info['file_url']

                # Generate S3 signed URL if S3 storage is enabled
                if settings.S3_FILE_STORAGE:
                    try:
                        file_url = await get_s3_signed_url(file_url)
                    except Exception as e:
                        logger.error(f"Error generating signed URL for attachment: {str(e)}")

                attachments_data.append({
                    'filename': file_info['filename'],
                    'file_url': file_url,
                    'content_type': file_info['content_type'],
                    'file_size': file_info['size']
                })
            response_payload['attachments'] = attachments_data
            response_payload['message_id'] = created_message.id

        await sio.emit('chat_response', response_payload, room=session_id, namespace='/widget')


    except Exception as e:
        logger.error(f"Agent message error for sid {sid}: {str(e)}")
        logger.error(traceback.format_exc())
        await sio.emit('error', {
            'error': 'Failed to send message',
            'type': 'message_error'
        }, to=sid, namespace='/agent')

# Add handlers for room management
@sio.on('join_room', namespace='/agent')
async def handle_join_room(sid, data):
    try:
        session = await sio.get_session(sid, namespace='/agent')
        session_id = data.get('session_id')
        if not session_id:
            raise ValueError("No session ID provided")

        # Handle user-specific rooms
        if session_id.startswith('user_'):
            user_id = session_id.split('_')[1]
            if str(session.get('user_id')) != user_id:
                raise ValueError("Unauthorized to join user room")
            await sio.enter_room(sid, session_id, namespace='/agent')
            logger.info(f"Agent {user_id} joined their user room")
            return

        # Verify this agent has permission to join this room
        db = next(get_db())
        session_repo = SessionToAgentRepository(db)
        session_data = session_repo.get_session(session_id)
        
        if not session_data:
            raise ValueError("Invalid session")
            
        if str(session_data.user_id) != str(session.get('user_id')):
            raise ValueError("Unauthorized to join this room")

        # Join the room
        await sio.enter_room(sid, session_id, namespace='/agent')
        logger.info(f"Agent {session.get('user_id')} joined room: {session_id}")


        # Notify room of join
        await sio.emit('room_event', {
            'type': 'join',
            'user_id': str(session.get('user_id')),
        }, room=session_id, namespace='/agent')

        session_data = {
            'session_id': session_id,
            'user_id': session.get('user_id'),
        }
        await sio.save_session(sid, session_data, namespace='/agent')

    except Exception as e:
        logger.error(f"Error joining room for sid {sid}: {str(e)}")
        await sio.emit('error', {
            'error': 'Failed to join room',
            'type': 'room_error'
        }, to=sid, namespace='/agent')

@sio.on('leave_room', namespace='/agent')
async def handle_leave_room(sid, data):
    try:
        session = await sio.get_session(sid, namespace='/agent')
        if not session:
            raise ValueError("No active session")

        session_id = data.get('session_id')
        if not session_id:
            raise ValueError("No session ID provided")

        # Leave the room
        await sio.leave_room(sid, session_id, namespace='/agent')
        logger.info(f"Agent {session.get('user_id')} left room: {session_id}")

        # Notify room of leave
        await sio.emit('room_event', {
            'type': 'leave',
            'user_id': str(session.get('user_id')),
        }, room=session_id, namespace='/agent')

    except Exception as e:
        logger.error(f"Error leaving room for sid {sid}: {str(e)}")
        await sio.emit('error', {
            'error': 'Failed to leave room',
            'type': 'room_error'
        }, to=sid, namespace='/agent')    


@sio.on('taken_over', namespace='/agent')
async def handle_taken_over(sid, data):
    logger.info(f"Agent {data['user_name']} has taken over chat {data['session_id']}")
    await sio.emit('handle_taken_over', data, room=data['session_id'] , namespace='/widget')

@sio.on('submit_rating', namespace='/widget')
@socket_rate_limit(namespace='/widget')
async def handle_rating_submission(sid, data):
    """Handle rating submission from widget"""
    try:
        # Get session data and authenticate
        session = await sio.get_session(sid, namespace='/widget')
        widget_id, org_id, customer_id, conversation_token = await authenticate_socket_conversation_token(sid, session)
        
        if not widget_id or not org_id:
            logger.error(f"Widget authentication failed for sid {sid}")
            await sio.emit('error', {'error': 'Authentication failed', 'type': 'auth_error'}, room=sid, namespace='/widget')
            return

        session_id = session['session_id']
        # Verify session matches authenticated data
        if (session['widget_id'] != widget_id or 
            session['org_id'] != org_id or 
            session['customer_id'] != customer_id):
            raise ValueError("Session mismatch")

        # Validate rating data
        rating = data.get('rating')
        feedback = data.get('feedback')
        
        if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
            raise ValueError("Invalid rating value")

        db = next(get_db())
        
        # Get session details
        session_repo = SessionToAgentRepository(db)
        session_data = session_repo.get_session(session_id)
        
        if not session_data:
            raise ValueError("Session not found")

        # Create rating using repository
        rating_repo = RatingRepository(db)
        rating_obj = rating_repo.create_rating(
            session_id=session_id,
            customer_id=customer_id,
            user_id=session_data.user_id,
            agent_id=session_data.agent_id,
            organization_id=org_id,
            rating=rating,
            feedback=feedback
        )

        # Emit success response
        await sio.emit('rating_submitted', {
            'success': True,
            'message': 'Rating submitted successfully'
        }, room=sid, namespace='/widget')

        # Also emit to agent room if there's an assigned agent
        if session_data.user_id:
            user_room = f"user_{session_data.user_id}"
            await sio.emit('rating_received', {
                'session_id': session_id,
                'rating': rating,
                'feedback': feedback
            }, room=user_room, namespace='/agent')

    except ValueError as e:
        logger.error(f"Rating submission error for sid {sid}: {str(e)}")
        await sio.emit('error', {
            'error': str(e),
            'type': 'rating_error'
        }, to=sid, namespace='/widget')
    except Exception as e:
        logger.error(f"Rating submission error for sid {sid}: {str(e)}")
        logger.error(traceback.format_exc())
        await sio.emit('error', {
            'error': 'Failed to submit rating',
            'type': 'rating_error'
        }, to=sid, namespace='/widget')


@sio.on('get_workflow_state', namespace='/widget')
@socket_rate_limit(namespace='/widget') 
async def handle_get_workflow_state(sid):
    """Get current workflow state and execute next node if no chat history"""
    try:
        logger.info(f"Getting workflow state for sid {sid}")
        # Get session data and authenticate
        session = await sio.get_session(sid, namespace='/widget')
        widget_id, org_id, customer_id, conversation_token = await authenticate_socket_conversation_token(sid, session)
        
        if not widget_id or not org_id:
            logger.error(f"Widget authentication failed for sid {sid}")
            await sio.emit('error', {'error': 'Authentication failed', 'type': 'auth_error'}, room=sid, namespace='/widget')
            return

        session_id = session['session_id']
        # Verify session matches authenticated data
        if (session['widget_id'] != widget_id or 
            session['org_id'] != org_id or 
            session['customer_id'] != customer_id):
            raise ValueError("Session mismatch")

        db = next(get_db())
        session_repo = SessionToAgentRepository(db)
        chat_repo = ChatRepository(db)
        
        # Get active session
        active_session = session_repo.get_active_customer_session(
            customer_id=customer_id
        )
        
        if not active_session:
            raise ValueError("No active session found")

        # Check if there's any chat history
        chat_history = await chat_repo.get_session_history(session_id)
        has_history = len(chat_history) > 0

        # If agent uses workflow, handle workflow state
        if active_session.workflow_id:
            current_node_id = active_session.current_node_id
            
            # If no current node and no history - start from beginning by executing workflow
            if not current_node_id and not has_history:
                logger.info(f"Starting workflow from beginning for session {session_id}")
                workflow_service = WorkflowExecutionService(db)
                
                # Execute workflow to get the starting node
                workflow_result = await workflow_service.execute_workflow(
                    session_id=session_id,
                    user_message=None,  # No user message for initial execution
                    workflow_id=active_session.workflow_id,
                    current_node_id=None,  # Start from beginning
                    workflow_state=active_session.workflow_state or {},
                    api_key=decrypt_api_key(session['ai_config'].encrypted_api_key),
                    model_name=session['ai_config'].model_name,
                    model_type=session['ai_config'].model_type,
                    org_id=org_id,
                    agent_id=session['agent_id'],
                    customer_id=customer_id,
                    is_initial_execution=True,
                    source=session.get('source')
                )
                
                if workflow_result.success:
                    logger.debug(f"Initial workflow result: {workflow_result}")
                    
                    # Handle intermediate messages from MESSAGE nodes during automatic execution
                    if workflow_result.intermediate_messages:
                        logger.info(f"Found {len(workflow_result.intermediate_messages)} intermediate messages from MESSAGE nodes in initial execution")
                        for intermediate_message in workflow_result.intermediate_messages:
                            logger.debug(f"Emitting intermediate message: {intermediate_message}")
                            
                            # Store intermediate message in chat history
                            chat_repo.create_message({
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
                                    "message_node": True,
                                    "initial_execution": True
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
                            }, room=session_id, namespace='/widget')
                    
                    # Handle different node types
                    if workflow_result.form_data:
                        await sio.emit('workflow_state', {
                            'type': 'form',
                            'form_data': workflow_result.form_data,
                            'session_id': session_id,
                            'has_history': has_history,
                            'button_text': 'Start Chat'
                        }, room=sid, namespace='/widget')
                        
                    elif workflow_result.landing_page_data:
                        await sio.emit('workflow_state', {
                            'type': 'landing_page',
                            'landing_page_data': workflow_result.landing_page_data,
                            'session_id': session_id,
                            'has_history': has_history,
                            'button_text': 'Start Chat'
                        }, room=sid, namespace='/widget')
                        
                    elif workflow_result.message:
                        # Store initial message and emit
                        chat_repo.create_message({
                            "message": workflow_result.message,
                            "message_type": "bot",
                            "session_id": session_id,
                            "organization_id": org_id,
                            "agent_id": session['agent_id'],
                            "customer_id": customer_id,
                            "attributes": {
                                "workflow_execution": True,
                                "workflow_id": str(active_session.workflow_id),
                                "initial_message": True
                            }
                        })
                        
                        await sio.emit('workflow_state', {
                            'type': 'message',
                            'message': workflow_result.message,
                            'session_id': session_id,
                            'has_history': has_history,
                            'button_text': 'Continue Conversation'
                        }, room=sid, namespace='/widget')
                    else:
                        await sio.emit('workflow_state', {
                            'type': 'ready',
                            'session_id': session_id,
                            'has_history': has_history,
                            'button_text': 'Start Chat'
                        }, room=sid, namespace='/widget')
                else:
                    await sio.emit('workflow_state', {
                        'type': 'error',
                        'error': workflow_result.error,
                        'session_id': session_id,
                        'has_history': has_history,
                        'button_text': 'Start Chat'
                    }, room=sid, namespace='/widget')
            else:
                # We have a current node - fetch node details and emit them directly
                logger.info(f"Fetching details for current node {current_node_id} in session {session_id}")
                
                try:
                    from app.repositories.workflow import WorkflowRepository
                    workflow_repo = WorkflowRepository(db)
                    workflow = workflow_repo.get_workflow_with_nodes_and_connections(active_session.workflow_id)
                    
                    if workflow:
                        current_node = None
                        for node in workflow.nodes:
                            if node.id == current_node_id:
                                current_node = node
                                break
                        
                        if current_node:
                            logger.debug(f"Found current node: {current_node.node_type}")
                            
                            if current_node.node_type.value == 'form':
                                # Emit form node details
                                config = current_node.config or {}
                                form_data = {
                                    "title": config.get("form_title", ""),
                                    "description": config.get("form_description", ""),
                                    "submit_button_text": config.get("submit_button_text", "Submit"),
                                    "fields": config.get("form_fields", []),
                                    "form_full_screen": config.get("form_full_screen", False)
                                }
                                
                                await sio.emit('workflow_state', {
                                    'type': 'form',
                                    'form_data': form_data,
                                    'session_id': session_id,
                                    'has_history': has_history,
                                    'button_text': 'Continue Conversation'
                                }, room=sid, namespace='/widget')
                                
                            elif current_node.node_type.value == 'landing_page':
                                # Emit landing page node details
                                config = current_node.config or {}
                                landing_page_data = {
                                    "heading": config.get("landing_page_heading", "Welcome"),
                                    "content": config.get("landing_page_content", "Thank you for visiting!")
                                }
                                
                                await sio.emit('workflow_state', {
                                    'type': 'landing_page',
                                    'landing_page_data': landing_page_data,
                                    'session_id': session_id,
                                    'has_history': has_history,
                                    'button_text': 'Continue Conversation'
                                }, room=sid, namespace='/widget')
                            else:
                                # For other node types, just emit ready state
                                await sio.emit('workflow_state', {
                                    'type': 'ready',
                                    'session_id': session_id,
                                    'has_history': has_history,
                                    'button_text': 'Continue Conversation'
                                }, room=sid, namespace='/widget')
                        else:
                            logger.warning(f"Current node {current_node_id} not found in workflow")
                            await sio.emit('workflow_state', {
                                'type': 'ready',
                                'session_id': session_id,
                                'has_history': has_history,
                                'button_text': 'Continue Conversation'
                            }, room=sid, namespace='/widget')
                    else:
                        logger.error(f"Workflow {active_session.workflow_id} not found")
                        await sio.emit('workflow_state', {
                            'type': 'error',
                            'error': 'Workflow not found',
                            'session_id': session_id,
                            'has_history': has_history,
                            'button_text': 'Continue Conversation'
                        }, room=sid, namespace='/widget')
                        
                except Exception as e:
                    logger.error(f"Error fetching node details: {str(e)}")
                    await sio.emit('workflow_state', {
                        'type': 'error',
                        'error': 'Failed to get workflow state',
                        'session_id': session_id,
                        'has_history': has_history,
                        'button_text': 'Continue Conversation'
                    }, room=sid, namespace='/widget')
        else:
            # No workflow or has history - just return current state
            await sio.emit('workflow_state', {
                'type': 'ready',
                'session_id': session_id,
                'has_history': has_history,
                'button_text': 'Start Chat' if not has_history else 'Continue Conversation'
            }, room=sid, namespace='/widget')

    except Exception as e:
        logger.error(f"Error getting workflow state for sid {sid}: {str(e)}")
        logger.error(traceback.format_exc())
        await sio.emit('error', {
            'error': 'Failed to get workflow state',
            'type': 'workflow_error'
        }, to=sid, namespace='/widget')


@sio.on('proceed_workflow', namespace='/widget')
@socket_rate_limit(namespace='/widget')
async def handle_proceed_workflow(sid, data):
    """Proceed to next workflow node after landing page interaction"""
    try:
        logger.info(f"Proceeding workflow for sid {sid}")
        # Get session data and authenticate
        session = await sio.get_session(sid, namespace='/widget')
        widget_id, org_id, customer_id, conversation_token = await authenticate_socket_conversation_token(sid, session)
        
        if not widget_id or not org_id:
            logger.error(f"Widget authentication failed for sid {sid}")
            await sio.emit('error', {'error': 'Authentication failed', 'type': 'auth_error'}, room=sid, namespace='/widget')
            return

        session_id = session['session_id']
        # Verify session matches authenticated data
        if (session['widget_id'] != widget_id or 
            session['org_id'] != org_id or 
            session['customer_id'] != customer_id):
            raise ValueError("Session mismatch")

        db = next(get_db())
        session_repo = SessionToAgentRepository(db)
        chat_repo = ChatRepository(db)
        
        # Get active session
        active_session = session_repo.get_active_customer_session(
            customer_id=customer_id
        )

        if not active_session or not active_session.workflow_id:
            raise ValueError("No active workflow session found")

        # Simply update to next node and execute it
        workflow_service = WorkflowExecutionService(db)
        
        # Get current node and find next node
        from app.repositories.workflow import WorkflowRepository
        workflow_repo = WorkflowRepository(db)
        workflow = workflow_repo.get_workflow_with_nodes_and_connections(active_session.workflow_id)
        
        if not workflow:
            raise ValueError("Workflow not found")
        
        # Find current node
        current_node = None
        for node in workflow.nodes:
            if node.id == active_session.current_node_id:
                current_node = node
                break
        
        if not current_node:
            raise ValueError("Current node not found")
        
        # Find next node
        next_node_id = None
        for connection in current_node.outgoing_connections:
            next_node_id = connection.target_node_id
            break
        
        if not next_node_id:
            await sio.emit('workflow_proceeded', {'success': True, 'message': 'End of workflow'}, room=sid, namespace='/widget')
            return
        
        logger.debug(f"Next node ID: {next_node_id}")
        logger.debug(f"Active session: {active_session}")
        logger.debug(f"Workflow state: {active_session.workflow_state}")
        # Update session with next node
        session_repo.update_workflow_state(session_id, next_node_id, active_session.workflow_state or {})
        
        # Execute the next workflow node
        workflow_result = await workflow_service.execute_workflow(
            session_id=session_id,
            user_message=None,
            workflow_id=active_session.workflow_id,
            current_node_id=next_node_id,
            workflow_state=active_session.workflow_state or {},
            org_id=org_id,
            agent_id=session['agent_id'],
            customer_id=customer_id,
            api_key=decrypt_api_key(session['ai_config'].encrypted_api_key),
            model_name=session['ai_config'].model_name,
            model_type=session['ai_config'].model_type,
            source=session.get('source')
        )
        
        if workflow_result.success:
            logger.debug(f"Workflow result: {workflow_result}")
            
            # Handle intermediate messages from MESSAGE nodes during automatic execution
            if workflow_result.intermediate_messages:
                logger.info(f"Found {len(workflow_result.intermediate_messages)} intermediate messages from MESSAGE nodes")
                for intermediate_message in workflow_result.intermediate_messages:
                    logger.debug(f"Emitting intermediate message: {intermediate_message}")
                    
                    # Store intermediate message in chat history
                    chat_repo.create_message({
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
                    }, room=session_id, namespace='/widget')
            
            # Handle the next node type
            if workflow_result.form_data:
                # It's a form node - emit form display
                await sio.emit('display_form', {
                    'form_data': workflow_result.form_data,
                    'session_id': session_id
                }, room=session_id, namespace='/widget')
                
            elif workflow_result.message:
                # Regular message node - store and emit
                chat_repo.create_message({
                    "message": workflow_result.message,
                    "message_type": "bot",
                    "session_id": session_id,
                    "organization_id": org_id,
                    "agent_id": session['agent_id'],
                    "customer_id": customer_id,
                    "attributes": {
                        "workflow_execution": True,
                        "workflow_id": str(active_session.workflow_id),
                        "current_node_id": str(workflow_result.next_node_id) if workflow_result.next_node_id else None,
                        "transfer_to_human": workflow_result.transfer_to_human,
                        "end_chat": workflow_result.end_chat,
                        "request_rating": workflow_result.request_rating,
                    }
                })
                
                # Emit chat response
                await sio.emit('chat_response', {
                    'message': workflow_result.message,
                    'type': 'chat_response',
                    'transfer_to_human': workflow_result.transfer_to_human,
                    'end_chat': workflow_result.end_chat,
                    'request_rating': workflow_result.request_rating,
                    'shopify_output': None
                }, room=session_id, namespace='/widget')
            
            # Emit success
            await sio.emit('workflow_proceeded', {
                'success': True
            }, room=sid, namespace='/widget')
        else:
            # Handle error
            await sio.emit('error', {
                'error': workflow_result.error or 'Failed to proceed workflow',
                'type': 'workflow_error'
            }, to=sid, namespace='/widget')

    except Exception as e:
        logger.error(f"Error proceeding workflow for sid {sid}: {str(e)}")
        logger.error(traceback.format_exc())
        await sio.emit('error', {
            'error': 'Failed to proceed workflow',
            'type': 'workflow_error'
        }, to=sid, namespace='/widget')


@sio.on('submit_form', namespace='/widget')
@socket_rate_limit(namespace='/widget')
async def handle_form_submission(sid, data):
    """Handle form submission from widget"""
    try:
        logger.info(f"Submitting form for sid {sid}")
        # Get session data and authenticate
        session = await sio.get_session(sid, namespace='/widget')
        widget_id, org_id, customer_id, conversation_token = await authenticate_socket_conversation_token(sid, session)
        
        if not widget_id or not org_id:
            logger.error(f"Widget authentication failed for sid {sid}")
            await sio.emit('error', {'error': 'Authentication failed', 'type': 'auth_error'}, room=sid, namespace='/widget')
            return

        session_id = session['session_id']
        # Verify session matches authenticated data
        if (session['widget_id'] != widget_id or 
            session['org_id'] != org_id or 
            session['customer_id'] != customer_id):
            raise ValueError("Session mismatch")

        # Validate form data
        form_data = data.get('form_data', {})
        if not form_data:
            raise ValueError("No form data provided")

        db = next(get_db())
        session_repo = SessionToAgentRepository(db)
        
        # Get active session
        active_session = session_repo.get_active_customer_session(
            customer_id=customer_id
        )

        if not active_session or not active_session.workflow_id:
            raise ValueError("No active workflow session found")

        # Get the current form configuration for validation
        from app.repositories.workflow import WorkflowRepository
        workflow_repo = WorkflowRepository(db)
        workflow = workflow_repo.get_workflow_with_nodes_and_connections(active_session.workflow_id)
        
        if not workflow:
            raise ValueError("Workflow not found")
        
        # Find the current form node to get field configurations
        current_node = None
        for node in workflow.nodes:
            if node.id == active_session.current_node_id:
                current_node = node
                break
        
        if current_node and current_node.node_type.value == 'form':
            # Get form fields configuration from config JSON
            config = current_node.config or {}
            form_fields = config.get("form_fields", [])
            
            # Validate form data against field configurations
            validation_errors = validate_form_data(form_fields, form_data)
            
            if validation_errors:
                error_message = "; ".join(validation_errors)
                logger.error(f"Form validation failed: {error_message}")
                await sio.emit('error', {
                    'error': error_message,
                    'type': 'validation_error'
                }, to=sid, namespace='/widget')
                return

        # Submit form through workflow service
        workflow_service = WorkflowExecutionService(db)
        logger.info(f"Submitting form for sid {sid}")
        workflow_result = await workflow_service.submit_form(
            session_id=session_id,
            form_data=form_data,
            workflow_id=active_session.workflow_id,
            org_id=org_id,
            agent_id=session['agent_id'],
            customer_id=customer_id,
            api_key=decrypt_api_key(session['ai_config'].encrypted_api_key),
            model_name=session['ai_config'].model_name,
            model_type=session['ai_config'].model_type,
            source=session.get('source')
        )

        if workflow_result.success:
            # Check if form contains email and update customer if they have @noemail.com email
            if 'email' in form_data and form_data['email']:
                submitted_email = form_data['email'].strip()
                if submitted_email:  # Only process if email is not empty
                    customer_repo = CustomerRepository(db)
                    customer = customer_repo.get_by_id(customer_id)
                    
                    if customer and customer.email and '@noemail.com' in customer.email:
                        # Customer has a generated @noemail.com email, update it with the real email
                        try:
                            # Check if the new email already exists for another customer in the same organization
                            existing_customer = customer_repo.get_customer_by_email(submitted_email, org_id)
                            if not existing_customer:
                                # Update customer email
                                old_email = customer.email
                                customer.email = submitted_email
                                db.commit()
                                logger.info(f"Updated customer {customer_id} email from {old_email} to {submitted_email}")
                            else:
                                logger.warning(f"Email {submitted_email} already exists for another customer, skipping update")
                        except Exception as e:
                            logger.error(f"Failed to update customer email: {str(e)}")
                            db.rollback()
            
            # Store form submission in chat history
            chat_repo = ChatRepository(db)
            
            # Handle intermediate messages from MESSAGE nodes during automatic execution
            if workflow_result.intermediate_messages:
                logger.info(f"Found {len(workflow_result.intermediate_messages)} intermediate messages from MESSAGE nodes")
                for intermediate_message in workflow_result.intermediate_messages:
                    logger.debug(f"Emitting intermediate message: {intermediate_message}")
                    
                    # Store intermediate message in chat history
                    chat_repo.create_message({
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
                    }, room=session_id, namespace='/widget')

            # Check if there's a response message to send
            if workflow_result.message:
                # Store workflow response
                chat_repo.create_message({
                    "message": workflow_result.message,
                    "message_type": "bot",
                    "session_id": session_id,
                    "organization_id": org_id,
                    "agent_id": session['agent_id'],
                    "customer_id": customer_id,
                    "attributes": {
                        "workflow_execution": True,
                        "workflow_id": str(active_session.workflow_id),
                        "current_node_id": str(workflow_result.next_node_id) if workflow_result.next_node_id else None,
                        "transfer_to_human": workflow_result.transfer_to_human,
                        "end_chat": workflow_result.end_chat,
                        "request_rating": workflow_result.request_rating,
                    }
                })

                # Emit chat response
                await sio.emit('chat_response', {
                    'message': workflow_result.message,
                    'type': 'chat_response',
                    'transfer_to_human': workflow_result.transfer_to_human,
                    'end_chat': workflow_result.end_chat,
                    'request_rating': workflow_result.request_rating,
                    'shopify_output': None
                }, room=session_id, namespace='/widget')

            # Emit form submission success
            await sio.emit('form_submitted', {
                'success': True,
                'message': 'Form submitted successfully'
            }, room=sid, namespace='/widget')

        else:
            # Handle form submission error
            await sio.emit('error', {
                'error': workflow_result.error or 'Form submission failed',
                'type': 'form_error'
            }, to=sid, namespace='/widget')

    except ValueError as e:
        logger.error(f"Form submission error for sid {sid}: {str(e)}")
        await sio.emit('error', {
            'error': str(e),
            'type': 'form_error'
        }, to=sid, namespace='/widget')
    except Exception as e:
        logger.error(f"Form submission error for sid {sid}: {str(e)}")
        logger.error(traceback.format_exc())
        await sio.emit('error', {
            'error': 'Failed to submit form',
            'type': 'form_error'
        }, to=sid, namespace='/widget')


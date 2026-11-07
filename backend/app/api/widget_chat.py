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
import datetime
import json
import os
import re
from types import SimpleNamespace
from fastapi import APIRouter
from socketio.exceptions import ConnectionRefusedError as SocketRefused
from app.channels.constants import MessageSource
from app.core.socketio import sio
from app.core.logger import get_logger
import traceback
from app.agents.chat_agent import ChatResponse
from app.agents.host_actions.turns import PausedTurn
from app.core.auth_utils import (
    authenticate_socket,
    authenticate_socket_conversation_token,
    widget_socket_identity,
)
from app.database import close_session, release_connection, session_off_loop
from app.repositories.ai_config import AIConfigRepository
from app.repositories.widget import WidgetRepository
from app.repositories.agent_shopify_config_repository import AgentShopifyConfigRepository
from app.core.security import decrypt_api_key, verify_conversation_token
from app.repositories.session_to_agent import SessionToAgentRepository
from app.repositories.chat import ChatRepository
from app.repositories.customer import CustomerRepository
import uuid
from app.services.socket_rate_limit import socket_rate_limit
from app.utils.keyed_lock import KeyedLock
from app.services import conversation_token as conversation_token_service
from app.services.workflow_chat import WorkflowChatService
from app.services.file_upload_service import FileUploadService
from app.services.file_storage import resolve_public_url

from app.models.session_to_agent import ACTIVE_STATUSES, SessionStatus
from app.agents.transfer_agent import get_agent_availability_response
from app.repositories.agent import AgentRepository
from app.services.agent_rooms import is_org_inbox_room, may_join_org_inbox
from app.services.chat_notifications import notify_new_chat
from app.services.contact_capture import retain_unstored_email
from app.services.human_routing import (
    HUMAN_ONLY_ACK,
    QUEUED_FOR_HUMAN_NOTICE,
    notify_customer,
)
from app.services.host_action_runtime import (
    offered_actions, replay_open_call, start_paused_turn, waiting_on_page,
)
from app.services.widget_reply import create_widget_agent, deliver_ai_reply, emit_bot_typing, widget_agent_kwargs
from app.services.journey_runtime import step_actions_hint
from app.services.host_prompt import clean_host_prompt, store_host_prompt
from app.services.widget_identity import can_act_as, may_stand_for
from app.services.message_delivery import deliver_to_customer
from app.repositories.rating import RatingRepository
from app.services.ticket_csat import record_conversation_rating
from app.repositories.jira import JiraRepository
from app.models.ai_config import AIModelType
from app.services.workflow_execution import WorkflowExecutionService


# Try to import enterprise modules
try:
    from app.enterprise.services.message_limit import check_message_limit
    HAS_ENTERPRISE = True
except ImportError:
    HAS_ENTERPRISE = False

from app.utils.sanitize import sanitize_message
from app.utils.secret_redaction import redact_secrets

router = APIRouter()
logger = get_logger(__name__)

# The inbox's own id for a message it sends (a UUID), echoed back on the
# stored-message ack so it can match the row it became
MAX_CLIENT_ID_LENGTH = 64

# Rating feedback comes from an anonymous widget visitor and is stored, shown
# to agents and copied onto the linked ticket's activity feed — bound it.
MAX_RATING_FEEDBACK_LENGTH = 2000


def format_datetime(dt):
    """Convert datetime to ISO format string"""
    return dt.isoformat() if dt else None


async def _client_attachments(uploaded_files: list) -> list:
    """Socket payload for freshly uploaded files, each with a signed URL."""
    return [
        {
            'filename': file_info['filename'],
            'file_url': await resolve_public_url(file_info['file_url']),
            'content_type': file_info['content_type'],
            'file_size': file_info['size'],
        }
        for file_info in uploaded_files or []
    ]

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

def _refuse_connection(error: str, error_type: str):
    """Reject the connect with a reason the widget can act on. It has to travel
    in the refusal itself: socket.io clients drop events emitted to a connection
    that is then refused, so an 'error' emit never reached a browser."""
    raise SocketRefused(error, {'error': error, 'type': error_type})


def _refuse_dead_token(sid: str):
    """Refuse a connect whose token has expired or been revoked. GET /widgets/{id}
    swaps such a token for a live one, so the widget authorizes again on this
    reason; refused like any other failure, it retried the dead token forever."""
    logger.warning(f"Widget connection refused for sid {sid}: conversation token expired or revoked")
    _refuse_connection('Conversation token no longer valid', 'token_invalid')


def _holds_dead_token(auth) -> bool:
    """True when the connect presented a token that no longer authenticates."""
    token = auth.get('conversation_token') if isinstance(auth, dict) else None
    return bool(token) and not conversation_token_service.inspect(token).is_live


def _own_session(session_repo: SessionToAgentRepository, session: dict, active_only: bool = True):
    """The conversation this socket connected to, while it still belongs to it."""
    return session_repo.get_widget_session(
        session.get('session_id'), session.get('customer_id'),
        session.get('conversation_scope'), active_only=active_only)


@sio.on('connect', namespace='/widget')
async def widget_connect(sid, environ, auth):
    db = None
    try:
       
        logger.info(f"Widget client connected: {auth}")
        # Authenticate using conversation token from Authorization header
        widget_id, org_id, customer_id, conversation_token = await authenticate_socket_conversation_token(sid, auth)
        
        if not widget_id or not org_id:
            if _holds_dead_token(auth):
                _refuse_dead_token(sid)
            raise ValueError("Widget authentication failed")

        # The widget page hands out an anonymous token; GET /widgets/{id} binds it
        # to a customer. A conversation can't be stored without one, so say so
        # instead of failing on the insert: the widget re-authorizes and retries.
        # (Legacy tokens carry the string "None", as GET /widgets/{id} also allows.)
        if not customer_id or customer_id == "None":
            _refuse_connection('Visitor not authorized yet', 'customer_required')

        # The token's scope decides which conversations this socket may join, so
        # an unverifiable token fails the connection instead of being shrugged off.
        token_data = verify_conversation_token(conversation_token)
        if not token_data:
            _refuse_dead_token(sid)
        scope = conversation_token_service.conversation_scope(token_data)
        source = token_data.get("source")
        is_identified = conversation_token_service.is_identified(token_data)

        # Get widget and verify it exists
        db = await session_off_loop()
        widget_repo = WidgetRepository(db)
        widget = widget_repo.get_widget(widget_id)
        if not widget:
            raise ValueError("Invalid widget ID")

        # A widget-issued token may not stand for a person the embedding app has
        # since signed in. Refused like an unbound token, so the widget authorizes
        # again - and GET /widgets/{id} swaps it for a customer of its own.
        if not may_stand_for(CustomerRepository(db).get_by_id(customer_id), scope):
            _refuse_connection('Visitor not authorized yet', 'customer_required')

        # Get AI config for widget's organization
        ai_config_repo = AIConfigRepository(db)
        ai_config = ai_config_repo.get_active_config(org_id)
        if not ai_config:
            _refuse_connection('AI configuration required', 'ai_config_missing')
        
        message_limit_reached = False
        # Check message limits if enterprise module is available
        if HAS_ENTERPRISE and ai_config.model_type == AIModelType.CHATTERMATE:
            if not await check_message_limit(db, org_id, sid, sio):
                message_limit_reached = True

        
        session_repo = SessionToAgentRepository(db)
                
        # Resume only a conversation this token's scope created
        active_session = session_repo.get_active_widget_session(
            customer_id=customer_id,
            agent_id=widget.agent_id,
            scope=scope
        )

        session_created = active_session is None
        if active_session:
            session_id = str(active_session.session_id)
            logger.debug(f"Active session: {session_id}")  
        else:
            # Create new session if none exists. Stamp the channel now, the way
            # the messaging channels do: an agent wired to a Shopify store is
            # serving that storefront, and the inbox labels the conversation
            # accordingly. Still a widget surface — see WIDGET_CHANNELS.
            new_session_id = str(uuid.uuid4())
            shopify_config = AgentShopifyConfigRepository(db).get_agent_shopify_config(
                str(widget.agent_id)
            )
            session_repo.create_session(
                session_id=new_session_id,
                agent_id=widget.agent_id,
                customer_id=customer_id,
                organization_id=org_id,
                channel='shopify' if shopify_config and shopify_config.enabled else 'web',
                conversation_key=conversation_token_service.session_key_for_scope(scope)
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
        
        # Snapshot only the fields the rest of the app reads from session['ai_config']
        # (encrypted_api_key/model_name/model_type) into a plain, DB-independent object.
        # This dict lives in the socket.io session store across the whole conversation,
        # long after this handler's db session closes - caching the live ORM instance
        # here would raise DetachedInstanceError on later access.
        ai_config_snapshot = SimpleNamespace(
            encrypted_api_key=ai_config.encrypted_api_key,
            model_name=ai_config.model_name,
            model_type=ai_config.model_type,
            settings=ai_config.settings,
        )

        session_data = {
            'widget_id': widget_id,
            'org_id': org_id,
            'agent_id': str(widget.agent_id),
            'customer_id': customer_id,
            'session_id': session_id,
            'ai_config': ai_config_snapshot,
            'conversation_token': conversation_token,
            # Which of the customer's conversations this socket may act on (see
            # conversation_token.conversation_scope). Read by _own_session.
            'conversation_scope': scope,
            # Add rate limiting settings
            'enable_rate_limiting': enable_rate_limiting,
            'overall_limit_per_ip': overall_limit_per_ip,
            'requests_per_sec': requests_per_sec,
            'message_limit_reached': message_limit_reached,
            # Cached like use_workflow: read once per connection so the
            # human-only check costs no query per message.
            'ai_replies_enabled': agent.ai_replies_enabled if agent else True,
            'use_workflow': agent.use_workflow if agent else False,
            'active_workflow_id': agent.active_workflow_id if agent else None,
            'source': source,
            # Host page that embeds the widget (sent by the webclient). Recorded on
            # lead capture as lead_source.page_url so you can see WHERE leads convert.
            'page_url': str((auth or {}).get('page_url') or '')[:500] or None,
        }

        # Log rate limiting settings
        if enable_rate_limiting:
            logger.debug(f"Rate limiting enabled for agent {agent.name} - Daily limit: {overall_limit_per_ip} requests, Rate: {requests_per_sec} req/sec")
        else:
            logger.debug(f"Rate limiting disabled for agent {agent.name}")

        logger.debug(f"Session data: {session_data['ai_config'].encrypted_api_key}")
        await sio.save_session(sid, session_data, namespace='/widget')
        logger.info(f"Widget client connected: {sid} joined room: {session_id}")
        
        # Send session_id back to client immediately so it can be used for end_chat.
        # `authenticated` lets the widget tell the host page whether a conversation it
        # just started belongs to the identified visitor or to an anonymous one.
        await sio.emit('session_initialized', {
            'session_id': session_id,
            'customer_id': customer_id,
            'agent_id': str(widget.agent_id),
            'authenticated': is_identified,
            'created': session_created
        }, to=sid, namespace='/widget')

        # A reply paused on a host action survives a reconnect: send its call again.
        await replay_open_call(sid, session_id, db)

        return True

    except SocketRefused:
        raise
    except Exception as e:
        logger.error(f"Widget connection error for sid {sid}: {str(e)}")
        logger.error(traceback.format_exc())
        await sio.emit('error', {
            'error': 'Connection failed',
            'type': 'connection_error'
        }, to=sid, namespace='/widget')
        return False
    finally:
        if db:
            close_session(db)


@sio.on('chat', namespace='/widget')
@socket_rate_limit(namespace='/widget')
async def handle_widget_chat(sid, data):
    """Handle widget chat messages"""
    db = None
    try:
        # Identity was established (and the token verified) at connect time.
        session = await sio.get_session(sid, namespace='/widget')

        widget_id, org_id, customer_id = widget_socket_identity(session)
        
        if not widget_id or not org_id:
            logger.error(f"No authenticated widget session for sid {sid}")
            await sio.emit('error', {'error': 'Authentication failed', 'type': 'auth_error'}, room=sid, namespace='/widget')
            return

        # Process message and files
        original_message = data.get('message', '').strip()
        
        # Sanitize message to prevent XSS attacks
        message = sanitize_message(original_message)
        # Passwords, keys and card numbers never reach storage or the model.
        message, _ = redact_secrets(message)
        # A message the page showed (ChatterMate.prompt) that this one answers.
        host_prompt = clean_host_prompt(data.get('host_prompt'))
        
        files = data.get('files', [])  # List of file objects with base64 content
        
        # If message was stripped to empty but had content before, it was malicious
        if original_message and not message.strip() and not files:
            logger.warning(f"Blocked malicious message from customer {customer_id}")
            await sio.emit('error', {
                'error': 'Your message contains unsafe content and cannot be sent.',
                'type': 'validation_error'
            }, room=sid, namespace='/widget')
            return
        
        if not message.strip() and not files:
            return

        session_id = session['session_id']
        
        # Upload files if provided
        uploaded_files = []
        if files:
            db_temp = await session_off_loop()
            try:
                agent_repo = AgentRepository(db_temp)
                agent = agent_repo.get_agent(session['agent_id'])
                if agent and not agent.allow_attachments:
                    await sio.emit('error', {
                        'error': 'Attachments are not allowed for this agent',
                        'type': 'validation_error'
                    }, room=sid, namespace='/widget')
                    return
                
                # Get allowed attachment types for this agent
                allowed_types = FileUploadService.get_allowed_types_for_agent(
                    agent.allowed_attachment_types if agent else None
                )
                friendly_types = FileUploadService.get_friendly_allowed_types_message(allowed_types)
                
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
                
                # Upload each file with security validation
                for file_data in files:
                    try:
                        uploaded_file = await FileUploadService.upload_file(
                            file_data=file_data,
                            org_id=org_id,
                            customer_id=customer_id,
                            allowed_types=allowed_types
                        )
                        uploaded_files.append(uploaded_file)
                    except ValueError as val_err:
                        # Validation error
                        logger.error(f"File validation error: {str(val_err)}")
                        await sio.emit('error', {
                            'error': str(val_err),
                            'type': 'validation_error',
                            'allowed_types': friendly_types
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
                close_session(db_temp)

        db = await session_off_loop()
        session_repo = SessionToAgentRepository(db)
                
        own_session = _own_session(session_repo, session, active_only=False)
        active_session = own_session if own_session and own_session.status in ACTIVE_STATUSES else None

        # Check message limit from session
        if HAS_ENTERPRISE and session.get('message_limit_reached') and active_session and active_session.user_id is None:
            logger.error(f"Message limit reached")
            await sio.emit('error', {
                    'error': 'Unable to process your message. Please contact support.',
                    'type': 'message_limit_exceeded'
            }, to=sid, namespace='/widget')
            return

        if not active_session:
            # Reopen this socket's own closed session - unless the visitor has
            # since started a newer one, which is where they should be. Only
            # sessions in this token's scope count: anyone else's newer session
            # must not be able to lock the visitor out.
            latest_session = session_repo.get_latest_customer_session(
                customer_id=customer_id,
                scope=session['conversation_scope']
            ) if own_session else None

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

        # The session opens when the widget connects, so the chat only really
        # starts on the customer's first message — notify there, not on connect,
        # or merely opening the chat window would ping the team.
        is_first_customer_message = not ChatRepository(db).has_customer_messages(session_id)
        if is_first_customer_message:
            await notify_new_chat(db, active_session)

        if host_prompt:
            store_host_prompt(db, session, host_prompt, data.get('host_prompt_source'))
            session['host_prompt'] = host_prompt
        else:
            session.pop('host_prompt', None)

        # A human-only agent answers nothing: no model, no workflow, and no
        # transfer either — the chat was never with the AI, so there is nothing
        # to hand over. Every automated branch below is gated on this, leaving
        # the message to fall through to the plain store-and-relay at the end,
        # exactly like a chat a human already holds. notify_new_chat above has
        # already told the team it is waiting.
        # Older sessions predate the cached flag, so default to answering.
        ai_replies_enabled = session.get('ai_replies_enabled', True)

        # Check if agent uses workflow and no human agent has taken over
        if ai_replies_enabled and active_session.workflow_id and active_session.user_id is None:
            await emit_bot_typing(session_id)
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
        elif ai_replies_enabled and active_session.status == SessionStatus.OPEN and active_session.user_id is None: # open and user has not taken over
            # One reply at a time: while the page is running an action for the
            # last one, a new message would start a second, crossing reply.
            if waiting_on_page(db, session_id):
                await sio.emit('error', {
                    'error': 'Still waiting for the app to finish the last step.',
                    'type': 'action_pending',
                }, to=sid, namespace='/widget')
                return
            await emit_bot_typing(session_id)
            logger.debug(f"Initializing chat agent for model {session['ai_config'].model_type}")
            host_actions = offered_actions(db, session)
            agent_kwargs = widget_agent_kwargs(session, host_actions, step_actions_hint(db, session, host_actions))
            # Everything the model call needs is read: let the connection go
            # rather than hold it through the call
            release_connection(db)
            chat_agent = await create_widget_agent(agent_kwargs)
            try:
                # Get response from ai agent (this already handles end chat internally)
                response = await chat_agent.get_response(
                    message=message,
                    session_id=chat_agent.agent.session_id,
                    org_id=org_id,
                    agent_id=session['agent_id'],
                    customer_id=customer_id)
            finally:
                await chat_agent.safe_cleanup_mcp_tools()
            if isinstance(response, PausedTurn):
                # The page runs the action; the reply follows its answer.
                await start_paused_turn(sid, session, response, host_actions, db)
                return
        elif active_session.status == SessionStatus.TRANSFERRED and active_session.user_id is None: # transferred and user has not taken over
            await emit_bot_typing(session_id)
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
            if agent_data is not None and getattr(agent_data, 'groups', None):
                availability_response = await get_agent_availability_response(
                    agent=agent_data,
                    customer_id=customer_id,
                    chat_history=chat_history,
                    db=db,
                    api_key=decrypt_api_key(session['ai_config'].encrypted_api_key),
                    model_name=session['ai_config'].model_name,
                    model_type=session['ai_config'].model_type,
                    base_url=(session['ai_config'].settings or {}).get('base_url'),
                    session_id=session_id
                )
            else:
                # No group queue configured. The availability agent apologises
                # that it is "unable to transfer the chat", which is untrue
                # here — the chat is queued and shows in the inbox as waiting.
                # Only reachable now that a chat can be queued without a group:
                # human-only agents, and Hand to my team.
                availability_response = {"message": QUEUED_FOR_HUMAN_NOTICE}

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
            
            attachments_data = await _client_attachments(uploaded_files)

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
            
            attachments_data = await _client_attachments(uploaded_files)

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

            # Nothing is going to answer this on its own, so acknowledge once —
            # otherwise the visitor sends into what looks like a dead widget.
            # Only on the opening message: after that the thread is visibly a
            # conversation with people in it.
            if is_first_customer_message and not ai_replies_enabled:
                await notify_customer(db, active_session, HUMAN_ONLY_ACK,
                                      channels_only=False)

            return # don't do anything if the session is closed or the user has already taken over
        
        if 'response' in locals():
            await deliver_ai_reply(sid, session, response, db)

    except Exception as e:
        logger.error(f"Widget chat error for sid {sid}: {str(e)}")
        logger.error(traceback.format_exc())
        await sio.emit('error', {
            'error': 'Unable to process your request, please try again later.',
            'type': 'chat_error'
        }, to=sid, namespace='/widget')
    finally:
        if db:
            close_session(db)


@sio.on('get_chat_history', namespace='/widget')
@socket_rate_limit(namespace='/widget')
async def get_widget_chat_history(sid):
    db = None
    try:
        logger.info(f"Getting chat history for sid {sid}")
        # Get session data
        session = await sio.get_session(sid, namespace='/widget')
        widget_id, org_id, customer_id = widget_socket_identity(session)
        
        if not widget_id or not org_id:
            logger.error(f"No authenticated widget session for sid {sid}")
            await sio.emit('error', {'error': 'Authentication failed', 'type': 'auth_error'}, room=sid, namespace='/widget')
            return

        db = await session_off_loop()
        
        # History of this socket's own conversation only
        session_repo = SessionToAgentRepository(db)
        active_session = _own_session(session_repo, session)

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
                        'file_url': attachment.file_url,  # signed by get_session_history
                        'content_type': attachment.content_type,
                        'file_size': attachment.file_size
                    }
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
    finally:
        if db:
            close_session(db)


@sio.on('refresh_token', namespace='/widget')
async def handle_refresh_token(sid, data):
    """Adopt the rotated conversation token for an already-connected socket.

    The socket session holds the token the connection was authenticated with, and
    that is what a reconnect and any later reader see. Keeping it current means the
    stored token matches the one the page actually holds, rather than an expiring
    one nobody can use again.
    """
    try:
        session = await sio.get_session(sid, namespace='/widget')
        if not session:
            return

        token = (data or {}).get('conversation_token') if isinstance(data, dict) else None
        state = conversation_token_service.inspect(token, session.get('widget_id'))
        if not state.is_live:
            logger.warning(f"Rejected token refresh for sid {sid}: token is not valid")
            return

        # A refresh may only extend the connection it already has - never move it to
        # another customer, which would hand this socket someone else's conversation.
        if str(state.payload.get('sub')) != str(session.get('customer_id')):
            logger.warning(f"Rejected token refresh for sid {sid}: customer mismatch")
            return
        # Nor to another scope: the socket's conversations were chosen by it.
        try:
            same_scope = conversation_token_service.conversation_scope(state.payload) == session.get('conversation_scope')
        except ValueError:
            same_scope = False
        if not same_scope:
            logger.warning(f"Rejected token refresh for sid {sid}: conversation scope mismatch")
            return

        session['conversation_token'] = token
        await sio.save_session(sid, session, namespace='/widget')
        logger.debug(f"Conversation token refreshed for sid {sid}")
    except Exception as e:
        logger.error(f"Error refreshing token for sid {sid}: {str(e)}")


@sio.on('end_chat', namespace='/widget')
async def handle_end_chat(sid, data):
    """Handle end chat event from widget client"""
    try:
        logger.info(f"End chat requested for sid {sid}")
        
        # Get session data
        session = await sio.get_session(sid, namespace='/widget')
        if not session:
            logger.error(f"No session found for sid {sid}")
            return
        
        # Identity was established (and the token verified) at connect time. Closing
        # the widget must not depend on the token still being live — re-checking it
        # here is what made "Authentication failed" appear on close (#315).
        widget_id, org_id, customer_id = widget_socket_identity(session)

        if not widget_id or not org_id:
            logger.error(f"No authenticated widget session for sid {sid}")
            await sio.emit('error', {'error': 'Authentication failed', 'type': 'auth_error'}, room=sid, namespace='/widget')
            return

        # Get session id and optional end reason/description
        session_id = session.get('session_id')
        reason = data.get('reason') if isinstance(data, dict) else None
        description = data.get('description') if isinstance(data, dict) else None
        
        if not session_id:
            logger.error(f"No session_id in session data for sid {sid}")
            return

        db = await session_off_loop()
        try:
            # Close the session immediately
            session_repo = SessionToAgentRepository(db)
            closed = session_repo.close_session(
                session_id=session_id,
                reason=reason,
                description=description
            )
            # close_session swallows its own errors and returns False (an invalid
            # end-chat reason does exactly that). Confirming regardless would tell the
            # client the chat ended while the session stayed open, and the next
            # connect would hand back the same conversation.
            if not closed:
                logger.error(f"Session {session_id} was not closed (reason={reason})")
                await sio.emit('error', {
                    'error': 'Failed to end chat session',
                    'type': 'end_chat_error'
                }, to=sid, namespace='/widget')
                return

            logger.info(f"Session {session_id} closed by client with reason: {reason}")

            # Confirm to client that chat has ended
            await sio.emit('chat_ended', {
                'session_id': session_id,
                'message': 'Chat session closed'
            }, room=sid, namespace='/widget')

        except Exception as close_error:
            logger.error(f"Error closing session {session_id}: {str(close_error)}")
            await sio.emit('error', {
                'error': 'Failed to end chat session',
                'type': 'end_chat_error'
            }, to=sid, namespace='/widget')
        finally:
            close_session(db)
    
    except Exception as e:
        logger.error(f"Error in end_chat handler for sid {sid}: {str(e)}")
        logger.error(traceback.format_exc())
        await sio.emit('error', {
            'error': 'Failed to process end chat request',
            'type': 'end_chat_error'
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
    db = None
    try:
        session = await sio.get_session(sid, namespace='/agent')
        session_id = data['session_id']
        
        logger.info(f"Session ID: {session_id}")
        if not session_id:
            raise ValueError("No active session")

        db = await session_off_loop()
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
            
            # Get agent and allowed attachment types
            agent_repo = AgentRepository(db)
            agent = agent_repo.get_agent(session_data.agent_id) if session_data.agent_id else None
            allowed_types = FileUploadService.get_allowed_types_for_agent(
                agent.allowed_attachment_types if agent else None
            )
            
            for file_data in files:
                try:
                    uploaded_file = await FileUploadService.upload_file(
                        file_data=file_data,
                        org_id=org_id,
                        user_id=user_id,
                        allowed_types=allowed_types
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
        original_agent_message = data.get('message', '')
        
        # Sanitize message to prevent XSS attacks
        agent_message = sanitize_message(original_agent_message)
        
        # If message was stripped to empty but had content before, it was malicious
        if original_agent_message and not agent_message.strip():
            logger.warning(f"Blocked malicious message from agent {session.get('user_id')}")
            await sio.emit('error', {
                'error': 'Your message contains unsafe content and cannot be sent.',
                'type': 'validation_error'
            }, to=sid, namespace='/agent')
            return
        
        message_data = {
            "message": agent_message,
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
        # Tell the sender which row their message became, before delivery, so
        # the inbox can match delivery receipts and errors to it exactly.
        client_id = data.get('client_id')
        if not (isinstance(client_id, str) and len(client_id) <= MAX_CLIENT_ID_LENGTH):
            client_id = None  # only ever echoed back, but never echo junk
        await sio.emit('agent_message_stored', {
            'session_id': session_id,
            'client_id': client_id,
            'message_id': created_message.id,
        }, to=sid, namespace='/agent')

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
            response_payload['attachments'] = await _client_attachments(uploaded_files)
            response_payload['message_id'] = created_message.id

        delivery = await deliver_to_customer(db, session_data, response_payload,
                                             message_id=created_message.id,
                                             source=MessageSource.HUMAN)
        if not delivery.ok:
            if delivery.reason == 'window_expired':
                error_message = (
                    "The customer's messaging window has expired — "
                    "send an approved template message to re-open the conversation."
                    if delivery.can_template else
                    "The customer's messaging window has expired; this message could not be delivered."
                )
            else:
                error_message = 'Message saved but could not be delivered to the customer.'
            chat_repo.mark_delivery_failed(created_message.id, delivery.reason)
            await sio.emit('error', {
                'error': error_message,
                'type': 'delivery_error',
                'session_id': session_id,
                'client_id': client_id,
                'message_id': created_message.id,
                # Lets the inbox offer the template action only when sending one
                # would actually reopen the conversation.
                'can_template': delivery.can_template,
            }, to=sid, namespace='/agent')

    except Exception as e:
        logger.error(f"Agent message error for sid {sid}: {str(e)}")
        logger.error(traceback.format_exc())
        await sio.emit('error', {
            'error': 'Failed to send message',
            'type': 'message_error'
        }, to=sid, namespace='/agent')
    finally:
        if db:
            close_session(db)

# Add handlers for room management
@sio.on('join_room', namespace='/agent')
async def handle_join_room(sid, data):
    db = None
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

        # Handle per-org ticket rooms (live ticket_update events)
        if session_id.startswith('org_tickets_'):
            org_id = session_id.removeprefix('org_tickets_')
            if str(session.get('organization_id')) != org_id:
                raise ValueError("Unauthorized to join org ticket room")
            await sio.enter_room(sid, session_id, namespace='/agent')
            logger.info(f"Agent {session.get('user_id')} joined ticket room for org {org_id}")
            return

        # Per-org inbox room (live delivery receipts on any of the org's
        # chats) — for the people who can see chats nobody owns
        if is_org_inbox_room(session_id):
            db = await session_off_loop()
            if not may_join_org_inbox(db, session, session_id):
                raise ValueError("Unauthorized to join org inbox room")
            await sio.enter_room(sid, session_id, namespace='/agent')
            return

        # Verify this agent has permission to join this room
        db = await session_off_loop()
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

        # Merge into the existing socket session — replacing it would drop
        # keys set at connect (organization_id, used by the org ticket room
        # authorization) and silently break later joins.
        session_data = {**session, 'session_id': session_id}
        await sio.save_session(sid, session_data, namespace='/agent')

    except Exception as e:
        logger.error(f"Error joining room for sid {sid}: {str(e)}")
        await sio.emit('error', {
            'error': 'Failed to join room',
            'type': 'room_error'
        }, to=sid, namespace='/agent')
    finally:
        if db:
            close_session(db)

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

        # Notify a conversation room of the leave — not the org inbox room,
        # where the whole team would hear every chat switch
        if not is_org_inbox_room(session_id):
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
    db = None
    try:
        # Identity was established (and the token verified) at connect time.
        session = await sio.get_session(sid, namespace='/widget')
        widget_id, org_id, customer_id = widget_socket_identity(session)
        
        if not widget_id or not org_id:
            logger.error(f"No authenticated widget session for sid {sid}")
            await sio.emit('error', {'error': 'Authentication failed', 'type': 'auth_error'}, room=sid, namespace='/widget')
            return

        session_id = session['session_id']

        # Validate rating data
        rating = data.get('rating')
        feedback = data.get('feedback')
        
        if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
            raise ValueError("Invalid rating value")

        if feedback is not None:
            if not isinstance(feedback, str):
                raise ValueError("Invalid feedback value")
            # Same treatment as an inbound chat message: the text is untrusted
            # and ends up in the agent UI and the ticket activity feed.
            feedback = sanitize_message(feedback.strip()[:MAX_RATING_FEEDBACK_LENGTH]) or None

        db = await session_off_loop()
        
        # Get session details
        session_repo = SessionToAgentRepository(db)
        session_data = session_repo.get_session(session_id)
        
        if not session_data:
            raise ValueError("Session not found")

        # One rating per session — re-rating replaces the previous score.
        rating_repo = RatingRepository(db)
        rating_obj = rating_repo.upsert_rating(
            session_id=session_id,
            customer_id=customer_id,
            user_id=session_data.user_id,
            agent_id=session_data.agent_id,
            organization_id=org_id,
            rating=rating,
            feedback=feedback
        )

        # Close the CSAT loop if this conversation belongs to a ticket.
        record_conversation_rating(db, rating_obj)

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
    finally:
        if db:
            close_session(db)


# A session's workflow is started by one get_workflow_state at a time
_workflow_starts = KeyedLock()


@sio.on('get_workflow_state', namespace='/widget')
@socket_rate_limit(namespace='/widget') 
async def handle_get_workflow_state(sid):
    """Get current workflow state and execute next node if no chat history"""
    db = None
    starting = None
    try:
        logger.info(f"Getting workflow state for sid {sid}")
        # Identity was established (and the token verified) at connect time.
        session = await sio.get_session(sid, namespace='/widget')
        widget_id, org_id, customer_id = widget_socket_identity(session)
        
        if not widget_id or not org_id:
            logger.error(f"No authenticated widget session for sid {sid}")
            await sio.emit('error', {'error': 'Authentication failed', 'type': 'auth_error'}, room=sid, namespace='/widget')
            return

        session_id = session['session_id']
        # The widget may ask twice on load: one at a time, or both would see no
        # history yet and start the workflow (greeting the visitor) twice
        lock = _workflow_starts(session_id)
        await lock.acquire()
        starting = lock

        db = await session_off_loop()
        session_repo = SessionToAgentRepository(db)
        chat_repo = ChatRepository(db)
        
        active_session = _own_session(session_repo, session)

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
                    base_url=(session['ai_config'].settings or {}).get('base_url'),
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

                        # The widget does not render a workflow_state message, so
                        # send the text as a chat_response like the other handlers.
                        await sio.emit('chat_response', {
                            'message': workflow_result.message,
                            'type': 'chat_response',
                            'transfer_to_human': workflow_result.transfer_to_human,
                            'end_chat': workflow_result.end_chat,
                            'request_rating': workflow_result.request_rating,
                            'shopify_output': None
                        }, room=session_id, namespace='/widget')

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
    finally:
        if db:
            close_session(db)
        if starting is not None:
            starting.release()


@sio.on('proceed_workflow', namespace='/widget')
@socket_rate_limit(namespace='/widget')
async def handle_proceed_workflow(sid, data):
    """Proceed to next workflow node after landing page interaction"""
    db = None
    try:
        logger.info(f"Proceeding workflow for sid {sid}")
        # Identity was established (and the token verified) at connect time.
        session = await sio.get_session(sid, namespace='/widget')
        widget_id, org_id, customer_id = widget_socket_identity(session)
        
        if not widget_id or not org_id:
            logger.error(f"No authenticated widget session for sid {sid}")
            await sio.emit('error', {'error': 'Authentication failed', 'type': 'auth_error'}, room=sid, namespace='/widget')
            return

        session_id = session['session_id']

        db = await session_off_loop()
        session_repo = SessionToAgentRepository(db)
        chat_repo = ChatRepository(db)
        
        active_session = _own_session(session_repo, session)

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
            base_url=(session['ai_config'].settings or {}).get('base_url'),
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
    finally:
        if db:
            close_session(db)


async def _confirm_contact(session_id: str, message: str) -> None:
    """Tell the visitor their contact details were received, as a bot message."""
    await sio.emit('chat_response', {
        'message': message,
        'type': 'chat_response',
        'session_id': session_id,
        'transfer_to_human': False,
        'end_chat': False,
    }, room=session_id, namespace='/widget')


@sio.on('submit_contact_info', namespace='/widget')
@socket_rate_limit(namespace='/widget')
async def handle_contact_info(sid, data):
    """Handle the inline contact form shown at human handoff (email + optional name).

    Updates the customer record so the human agent can follow up. Non-blocking: the handoff
    already happened, so failures here never undo the transfer.
    """
    db = None
    try:
        session = await sio.get_session(sid, namespace='/widget')
        widget_id, org_id, customer_id = widget_socket_identity(session)

        if not widget_id or not org_id:
            logger.error(f"No authenticated widget session for sid {sid}")
            await sio.emit('error', {'error': 'Authentication failed', 'type': 'auth_error'}, room=sid, namespace='/widget')
            return

        session_id = session['session_id']

        form_data = data.get('form_data', {}) or {}
        email = (form_data.get('email') or '').strip()
        name = (form_data.get('name') or '').strip()

        # Validate email server-side too (the field is required client-side when shown)
        if email and not validate_email(email):
            await sio.emit('error', {'error': 'Please enter a valid email address', 'type': 'validation_error'},
                           room=session_id, namespace='/widget')
            return

        if not email and not name:
            return  # nothing to update

        db = await session_off_loop()
        customer_repo = CustomerRepository(db)
        # A visitor bound to a known customer by an email they only typed must
        # not rename that person, nor leave an address on their record for the
        # team to follow up at.
        if not can_act_as(db, customer_repo.get_by_id(customer_id), session.get('conversation_scope')):
            logger.info(f"Contact details from sid {sid} not stored: the visitor does not own customer {customer_id}")
            # Silence would read as the form having failed. The team can still
            # follow up here, in the conversation they see in the inbox.
            await _confirm_contact(session_id, "Thanks — a teammate will follow up here.")
            return
        result = customer_repo.update_contact(customer_id, email=email or None, full_name=name or None)

        # The customer row can refuse the address — another customer in the org
        # already owns it (a visitor returning anonymously, or a shared team
        # inbox), or it is a channel identity key. Keep it on meta_data so the
        # agent can still follow up; otherwise the visitor asked to be contacted
        # and nothing anywhere records how.
        email_retained = retain_unstored_email(customer_repo, customer_id, email, result)

        # Confirm back to the visitor as a bot message. Retaining counts: from
        # where they sit they gave us a good address either way, and silence
        # after submitting the form reads as the form having failed.
        if result.get('email_updated') or result.get('name_updated') or email_retained:
            confirm = "Thanks — a teammate will follow up"
            updated_email = result.get('email') or ''
            if result.get('email_updated') and updated_email and not CustomerRepository.is_placeholder_email(updated_email):
                confirm += f" at {updated_email}"
            elif email_retained:
                confirm += f" at {email}"
            confirm += "."
            await _confirm_contact(session_id, confirm)
    except Exception as e:
        logger.error(f"Error handling contact info for sid {sid}: {str(e)}")
    finally:
        if db:
            close_session(db)


@sio.on('submit_form', namespace='/widget')
@socket_rate_limit(namespace='/widget')
async def handle_form_submission(sid, data):
    """Handle form submission from widget"""
    db = None
    try:
        logger.info(f"Submitting form for sid {sid}")
        # Identity was established (and the token verified) at connect time.
        session = await sio.get_session(sid, namespace='/widget')
        widget_id, org_id, customer_id = widget_socket_identity(session)
        
        if not widget_id or not org_id:
            logger.error(f"No authenticated widget session for sid {sid}")
            await sio.emit('error', {'error': 'Authentication failed', 'type': 'auth_error'}, room=sid, namespace='/widget')
            return

        session_id = session['session_id']

        # Validate form data
        form_data = data.get('form_data', {})
        if not form_data:
            raise ValueError("No form data provided")

        db = await session_off_loop()
        session_repo = SessionToAgentRepository(db)
        
        active_session = _own_session(session_repo, session)

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
            base_url=(session['ai_config'].settings or {}).get('base_url'),
            source=session.get('source')
        )

        if workflow_result.success:
            # Check if form contains email and update customer if they have @noemail.com email
            if 'email' in form_data and form_data['email']:
                submitted_email = form_data['email'].strip()
                if submitted_email:  # Only process if email is not empty
                    customer_repo = CustomerRepository(db)
                    customer = customer_repo.get_by_id(customer_id)

                    if customer and CustomerRepository.is_placeholder_email(customer.email) \
                            and can_act_as(db, customer, session.get('conversation_scope')):
                        # Customer has a generated placeholder email, update it with the real one
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
    finally:
        if db:
            close_session(db)


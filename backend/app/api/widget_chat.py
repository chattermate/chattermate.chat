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

import datetime
import os
from fastapi import APIRouter
from app.core.socketio import sio
from app.core.logger import get_logger
import traceback
from app.agents.chat_agent import ChatAgent, ChatResponse
from app.core.auth_utils import authenticate_socket, authenticate_socket_conversation_token
from app.database import get_db
from app.repositories.ai_config import AIConfigRepository
from app.repositories.widget import get_widget
from app.core.security import decrypt_api_key
from app.repositories.session_to_agent import SessionToAgentRepository
from app.repositories.chat import ChatRepository
import uuid

from app.models.session_to_agent import SessionStatus
from app.agents.transfer_agent import get_agent_availability_response
from app.repositories.agent import AgentRepository

router = APIRouter()
logger = get_logger(__name__)

def format_datetime(dt):
    """Convert datetime to ISO format string"""
    return dt.isoformat() if dt else None

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
        widget = get_widget(db, widget_id)
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
        
        os.environ["OPENAI_API_KEY"] = decrypt_api_key(
            ai_config.encrypted_api_key)
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
        
        # Store session data
        session_data = {
            'widget_id': widget_id,
            'org_id': org_id,
            'agent_id': str(widget.agent_id),
            'customer_id': customer_id,
            'session_id': session_id,
            'ai_config': ai_config,
            'conversation_token': conversation_token
        }

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

        # Process message
        message = data.get('message', '').strip()
        if not message:
            return

  
        session_id = session['session_id']
        # Verify session matches authenticated data
        if (session['widget_id'] != widget_id or 
            session['org_id'] != org_id or 
            session['customer_id'] != customer_id):
            raise ValueError("Session mismatch")

        db = next(get_db())
        session_repo = SessionToAgentRepository(db)
                
        # Try to get existing active session
        active_session = session_repo.get_active_customer_session(
            customer_id=customer_id
        )

        if not active_session:
            raise ValueError("No active session found")
        
        if str(active_session.session_id) != session_id:
            raise ValueError("Session mismatch")
        
        if active_session.status == SessionStatus.OPEN and active_session.user_id is None: # open and user has not taken over
            # Initialize chat agent
            chat_agent = ChatAgent(
                api_key=decrypt_api_key(session['ai_config'].encrypted_api_key),
                model_name=session['ai_config'].model_name,
                model_type=session['ai_config'].model_type,
                org_id=org_id,
                agent_id=session['agent_id'],
                customer_id=customer_id,
                session_id=session_id
            )
            # Get response from ai agent
            response = await chat_agent.get_response(
                message=message,
                session_id=chat_agent.agent.session_id,
                org_id=org_id,
                agent_id=session['agent_id'],
                customer_id=customer_id)
        elif active_session.status == SessionStatus.TRANSFERRED and active_session.user_id is None: # transferred and user has not taken over
            # Get response from agent transfer ai agent
            chat_repo = ChatRepository(db)
            chat_repo.create_message({
                "message": message,
                "message_type": "user",
                "session_id": session_id,
                "organization_id": org_id,
                "agent_id": session['agent_id'],
                "customer_id": customer_id,
            })
            chat_history = []
            chat_history = chat_repo.get_session_history(session_id)
            agent_data_repo = AgentRepository(db)
            agent_data = agent_data_repo.get_by_agent_id(
                session['agent_id'])
            availability_response = await get_agent_availability_response(
                agent=agent_data,
                customer_id=customer_id,
                chat_history=chat_history,
                db=db,
                api_key=decrypt_api_key(session['ai_config'].encrypted_api_key),
                model_name=session['ai_config'].model_name,
                model_type=session['ai_config'].model_type
            )

                # Create ChatResponse object
            response_content = ChatResponse(
                message=availability_response["message"],
                transfer_to_human=True,
                transfer_reason=None,
                transfer_description=None
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
                    "transfer_description": response_content.transfer_description
                }
            })
            response = response_content
        else:
            chat_repo = ChatRepository(db)
            chat_repo.create_message({
                "message": message,
                "message_type": "user",
                "session_id": session_id,
                "organization_id": org_id,  
                "agent_id": session['agent_id'],
                "customer_id": customer_id,
                "user_id": active_session.user_id
            })
            # Get session data to find assigned user
            session_data = session_repo.get_session(session_id)
            user_id = str(session_data.user_id) if session_data and session_data.user_id else None
            timestamp = format_datetime(datetime.datetime.now())

            
            if user_id:
                # Also emit to user-specific room
                user_room = f"user_{user_id}"
                await sio.emit('chat_reply', {
                    'message': message,
                    'type': 'user_message',
                    'transfer_to_human': False,
                    'session_id': session_id,
                    'created_at': timestamp
                }, room=user_room, namespace='/agent')


            # Emit to both session room and user's personal room
            await sio.emit('chat_reply', {
                'message': message,
                'type': 'user_message',
                'transfer_to_human': False,
                'session_id': session_id,
                'timestamp': timestamp
            }, room=session_id, namespace='/agent')    

            return # don't do anything if the session is closed or the user has already taken over
        
        # Emit response to the specific room
        await sio.emit('chat_response', {
            'message': response.message,
            'type': 'chat_response',
            'transfer_to_human': response.transfer_to_human
        }, room=session_id, namespace='/widget')

    except Exception as e:
        logger.error(f"Widget chat error for sid {sid}: {str(e)}")
        logger.error(traceback.format_exc())
        await sio.emit('error', {
            'error': 'Unable to process your request, please try again later.',
            'type': 'chat_error'
        }, to=sid, namespace='/widget')


@sio.on('get_chat_history', namespace='/widget')
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
        messages = chat_repo.get_session_history(
            session_id=active_session.session_id
        )

        # Convert datetime to ISO format string
        formatted_messages = [{
            'message': msg.message,
            'message_type': msg.message_type,
            'timestamp': format_datetime(msg.created_at),
            'attributes': msg.attributes,
            'user_name': msg.user.full_name if msg.user else None,
            'agent_name': msg.agent.display_name or msg.agent.name if msg.agent else None
        } for msg in messages]

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

        # Store the agent's message
        message = {
            "message": data['message'],
            "message_type": "agent",
            "session_id": session_id,
            "organization_id": session.get('organization_id'),
            "agent_id": session_data.agent_id if session_data.agent_id else None,
            "customer_id": session_data.customer_id,
            "user_id": session_data.user_id
        }
        
        chat_repo.create_message(message)
        # Emit to widget clients
        await sio.emit('chat_response', {
            'message': data['message'],
            'type': 'agent_message',
        }, room=session_id, namespace='/widget')


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
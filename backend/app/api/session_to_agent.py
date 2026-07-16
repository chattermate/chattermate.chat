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

from app.repositories.session_to_agent import SessionToAgentRepository
from app.repositories.chat import ChatRepository
from app.models.schemas.chat import ChatDetailResponse
from app.core.socketio import sio
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.core.logger import get_logger
from app.models.user import User
from app.core.auth import get_current_user
from app.database import get_db
from app.services.message_delivery import deliver_to_customer


logger = get_logger(__name__)

router = APIRouter()

# Shown to the customer when a human takes over an external-channel chat. The
# widget surfaces the handover in its own UI, so only channels need a message.
HANDOVER_NOTICE = "You're now connected with a member of our team."


async def _notify_customer_of_handover(db: Session, session, user: User) -> None:
    """Tell a channel customer a human joined, and record it in the thread.
    Best-effort: a failed notice must never fail the takeover itself."""
    if getattr(session, 'channel', None) in (None, 'web'):
        return
    try:
        ChatRepository(db).create_message({
            'message': HANDOVER_NOTICE,
            'message_type': 'agent',
            'session_id': str(session.session_id),
            'organization_id': str(session.organization_id),
            'agent_id': str(session.agent_id) if session.agent_id else None,
            'customer_id': str(session.customer_id) if session.customer_id else None,
            'user_id': str(user.id),
            'attributes': {'channel': session.channel, 'handover_notice': True},
        })
        result = await deliver_to_customer(db, session, {
            'message': HANDOVER_NOTICE,
            'type': 'chat_response',
        })
        if not result.ok:
            logger.warning(
                f"Handover notice not delivered on {session.channel}: {result.reason}")
    except Exception as e:
        logger.error(f"Failed sending handover notice: {str(e)}")


@router.post("/{session_id}/takeover", response_model=ChatDetailResponse)
async def takeover_chat(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Take over a chat session"""
    try:
        # Check permissions
        user_permissions = {p.name for p in current_user.role.permissions}
        if not ("manage_chats" in user_permissions or "manage_assigned_chats" in user_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )

        # Get session
        session_repo = SessionToAgentRepository(db)
        session = session_repo.get_session(session_id)
        
        if not session:
            raise HTTPException(
                status_code=404,
                detail="Chat session not found"
            )

        # Update session
        success = session_repo.takeover_session(
            session_id=session_id,
            user_id=str(current_user.id)
        )

        if not success:
            raise HTTPException(
                status_code=400,
                detail="Failed to take over chat"
            )

        # Let the customer know a human joined (external channels only), before
        # the detail is read back so the notice is part of the returned thread.
        await _notify_customer_of_handover(db, session, current_user)

        # Get updated chat details
        chat_repo = ChatRepository(db)
        chat = await chat_repo.get_chat_detail(
            session_id=session_id,
            org_id=current_user.organization_id
        )

        if not chat:
            raise HTTPException(
                status_code=500,
                detail="Failed to get chat details after takeover"
            )

        return ChatDetailResponse(**chat)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error taking over chat: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to take over chat"
        )


@router.post("/{session_id}/reassign", response_model=ChatDetailResponse)
async def reassign_chat(
    session_id: str,
    to_user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reassign a chat session to a different user"""
    try:
        # Permission: need manage_chats
        user_permissions = {p.name for p in current_user.role.permissions}
        if not ("manage_chats" in user_permissions or "manage_assigned_chats" in user_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )

        session_repo = SessionToAgentRepository(db)
        session = session_repo.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        # Only allow reassignment for open sessions handled by a user (not AI)
        if str(session.status.name).lower() != 'open':
            raise HTTPException(status_code=400, detail="Only open sessions can be reassigned")
        if session.user_id is None:
            raise HTTPException(status_code=400, detail="Chat must be handled by a user to reassign")

        # Update session owner
        success = session_repo.reassign_session(session_id=session_id, to_user_id=to_user_id)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to reassign chat")

        # Fetch updated chat detail
        chat_repo = ChatRepository(db)
        chat = await chat_repo.get_chat_detail(
            session_id=session_id,
            org_id=current_user.organization_id
        )
        if not chat:
            raise HTTPException(status_code=500, detail="Failed to get chat details after reassignment")

        # Notify widget room (customer)
        await sio.emit('room_event', {
            'type': 'reassigned',
            'session_id': session_id,
            'message': 'Your conversation has been reassigned to another agent.'
        }, room=session_id, namespace='/widget')

        # Notify agent rooms (convention: user_{id})
        await sio.emit('room_event', {
            'type': 'reassigned',
            'session_id': session_id,
            'assigned_to': to_user_id
        }, room=f"user_{to_user_id}")

        # Also notify previous assignee if exists
        if session.user_id:
            await sio.emit('room_event', {
                'type': 'reassigned_from_you',
                'session_id': session_id
            }, room=f"user_{session.user_id}")

        return ChatDetailResponse(**chat)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reassigning chat: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to reassign chat")

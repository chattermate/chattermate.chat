"""
ChatterMate - Session To Agent
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

from app.repositories.session_to_agent import SessionToAgentRepository
from app.repositories.chat import ChatRepository
from app.models.schemas.chat import ChatDetailResponse
from app.core.socketio import sio
from app.services.conversation_summary import get_or_generate_summary, generate_summary
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.core.logger import get_logger
from app.models.user import User
from app.core.auth import get_current_user
from app.database import get_db


logger = get_logger(__name__)

router = APIRouter()


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


@router.get("/{session_id}/summary")
async def get_session_summary(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get or generate an AI summary for a conversation session."""
    try:
        # Check permissions
        user_permissions = {p.name for p in current_user.role.permissions}
        if not ("manage_chats" in user_permissions or "manage_assigned_chats" in user_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )

        # Verify session exists and belongs to user's org
        session_repo = SessionToAgentRepository(db)
        session = session_repo.get_session(session_id)

        if not session:
            raise HTTPException(
                status_code=404,
                detail="Chat session not found"
            )

        if str(session.organization_id) != str(current_user.organization_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Session does not belong to your organization"
            )

        # Get or generate the summary
        summary = await get_or_generate_summary(
            db=db,
            session_id=session_id,
            organization_id=current_user.organization_id
        )

        return {
            "session_id": session_id,
            "summary": summary,
            "summary_updated_at": session.summary_updated_at.isoformat() if session.summary_updated_at else None,
            "summary_message_count": session.summary_message_count
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session summary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get session summary"
        )


@router.post("/{session_id}/summary/regenerate")
async def regenerate_session_summary(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Force regenerate the AI summary for a conversation session."""
    try:
        # Check permissions
        user_permissions = {p.name for p in current_user.role.permissions}
        if not ("manage_chats" in user_permissions or "manage_assigned_chats" in user_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )

        # Verify session exists and belongs to user's org
        session_repo = SessionToAgentRepository(db)
        session = session_repo.get_session(session_id)

        if not session:
            raise HTTPException(
                status_code=404,
                detail="Chat session not found"
            )

        if str(session.organization_id) != str(current_user.organization_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Session does not belong to your organization"
            )

        # Force regenerate summary
        summary = await generate_summary(
            db=db,
            session_id=session_id,
            organization_id=current_user.organization_id,
            force=True
        )

        return {
            "session_id": session_id,
            "summary": summary,
            "summary_updated_at": session.summary_updated_at.isoformat() if session.summary_updated_at else None,
            "summary_message_count": session.summary_message_count,
            "regenerated": True
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error regenerating session summary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to regenerate session summary"
        )

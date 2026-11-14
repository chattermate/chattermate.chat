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

from uuid import UUID

from app.repositories.session_to_agent import SessionToAgentRepository
from app.repositories.chat import ChatRepository
from app.repositories.user import UserRepository
from app.core.socketio import sio
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.core.logger import get_logger
from app.models.user import User
from app.models.session_to_agent import SessionStatus
from app.core.auth import CHAT_MANAGE_PERMISSIONS, get_current_user, has_any_permission
from app.database import get_db
from app.services.agent_rooms import emit_to_org_inbox
from app.services.chat_access import can_see_session, may_change_hands
from app.services.chat_notifications import notify_chat_assigned
from app.services.human_routing import notify_customer, route_session_to_human
from app.models.schemas.chat import ChatDetailResponse, TransferReasonType


logger = get_logger(__name__)

router = APIRouter()

# Shown to the customer when a human takes over an external-channel chat. The
# widget surfaces the handover in its own UI, so only channels need a message.
HANDOVER_NOTICE = "You're now connected with a member of our team."
BACK_TO_AI_NOTICE = "You're chatting with our AI assistant again."


def _is_uuid(value: str) -> bool:
    """Guard the repository lookup: a malformed id is a 404, not a 500."""
    try:
        UUID(str(value))
        return True
    except (ValueError, TypeError, AttributeError):
        return False


async def _notify_customer_of_handover(db: Session, session, user: User) -> None:
    """Tell a channel customer a human joined, and record it in the thread."""
    await notify_customer(db, session, HANDOVER_NOTICE, user_id=str(user.id))


async def _load_manageable_session(db: Session, session_id: str, current_user: User):
    """The session, if this user may act on it — or the right HTTPException.

    Shared by every action that changes who handles a chat, so they cannot
    drift apart: the permission grant, the organization scope and the
    visibility check are one sequence, checked in one place.
    """
    # manage_all_chats, not "manage_chats" — the latter is not a real
    # permission and never matched. has_any_permission also honours the
    # super_admin bypass the previous hand-rolled set check ignored.
    if not has_any_permission(current_user, CHAT_MANAGE_PERMISSIONS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    session = SessionToAgentRepository(db).get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    # A session id is guessable and was never scoped here: without this an
    # agent could act on a conversation belonging to another organization.
    if session.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Chat session not found")

    # Acting is limited to what the caller may actually see, so widening the
    # inbox to the unclaimed queue can't be used to reach past it.
    if not can_see_session(current_user, session):
        raise HTTPException(status_code=404, detail="Chat session not found")

    return session


def _require_may_change_hands(session, current_user: User) -> None:
    if not may_change_hands(current_user, session):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A teammate has this chat: only they, or someone who manages all chats, can do that",
        )


@router.post("/{session_id}/takeover", response_model=ChatDetailResponse)
async def takeover_chat(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Take over a chat session"""
    try:
        session = await _load_manageable_session(db, session_id, current_user)
        session_repo = SessionToAgentRepository(db)
        chat_repo = ChatRepository(db)

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


@router.post("/{session_id}/route-to-human", response_model=ChatDetailResponse)
async def route_chat_to_human(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stop the AI answering this chat and queue it for the team.

    Taking a chat over was the only way to silence the AI, which forces whoever
    spots the problem to handle it personally. This hands it to the queue
    instead, leaving it claimable by anyone.
    """
    try:
        session = await _load_manageable_session(db, session_id, current_user)

        if session.status == SessionStatus.CLOSED:
            raise HTTPException(
                status_code=400, detail="This chat is closed")
        if session.user_id is not None:
            raise HTTPException(
                status_code=400, detail="A human is already handling this chat")

        routed = await route_session_to_human(
            db,
            session,
            reason=TransferReasonType.DIRECT_REQUEST.value,
            description=f"Routed to the team by {current_user.full_name}",
        )
        if not routed:
            raise HTTPException(
                status_code=400, detail="This chat is already waiting for a human")

        chat = await ChatRepository(db).get_chat_detail(
            session_id=session_id,
            org_id=current_user.organization_id
        )
        if not chat:
            raise HTTPException(
                status_code=500,
                detail="Failed to get chat details after routing"
            )

        return ChatDetailResponse(**chat)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error routing chat to human: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to route chat to a human"
        )


@router.post("/{session_id}/release", response_model=ChatDetailResponse)
async def release_chat_to_ai(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Hand the chat back to the AI, from a person or the team's queue.

    The person who took it over (or anyone who may manage it) is done, and the
    AI answers the customer's next message. The customer is told in the thread,
    on every channel including the widget.
    """
    try:
        session = await _load_manageable_session(db, session_id, current_user)
        _require_may_change_hands(session, current_user)

        if session.status == SessionStatus.CLOSED:
            raise HTTPException(status_code=400, detail="This chat is closed")
        if session.agent is not None and session.agent.ai_replies_enabled is False:
            raise HTTPException(
                status_code=400, detail="This agent doesn't answer with AI")
        if (session.user_id is None and session.group_id is None
                and session.status == SessionStatus.OPEN):
            raise HTTPException(
                status_code=400, detail="The AI is already handling this chat")

        previous_user_id = session.user_id
        if not SessionToAgentRepository(db).release_to_ai(session_id):
            raise HTTPException(status_code=400, detail="Failed to hand the chat back to the AI")

        await notify_customer(db, session, BACK_TO_AI_NOTICE, channels_only=False)

        if previous_user_id and previous_user_id != current_user.id:
            # Their inbox drops it without waiting for the next refresh
            await sio.emit('room_event', {
                'type': 'released_to_ai',
                'session_id': session_id,
            }, room=f"user_{previous_user_id}", namespace='/agent')

        chat = await ChatRepository(db).get_chat_detail(
            session_id=session_id,
            org_id=current_user.organization_id
        )
        if not chat:
            raise HTTPException(
                status_code=500, detail="Failed to get chat details after handing back")
        return ChatDetailResponse(**chat)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handing chat back to AI: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to hand the chat back to the AI")


@router.post("/{session_id}/reopen", response_model=ChatDetailResponse)
async def reopen_chat(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Open a closed chat again, held by whoever reopens it: they reply next,
    so the AI stays out. The customer isn't told; the next message is theirs."""
    session = await _load_manageable_session(db, session_id, current_user)
    if session.status != SessionStatus.CLOSED:
        raise HTTPException(status_code=400, detail="This chat is already open")
    if not SessionToAgentRepository(db).reopen_for(session_id, current_user.id):
        raise HTTPException(status_code=500, detail="Failed to reopen the chat")

    # The other inboxes' views and counts move with it
    await emit_to_org_inbox('room_event', {'type': 'reopened', 'session_id': session_id},
                            session.organization_id)

    chat = await ChatRepository(db).get_chat_detail(session_id=session_id, org_id=current_user.organization_id)
    if not chat:
        raise HTTPException(status_code=500, detail="Failed to read the chat back")
    return ChatDetailResponse(**chat)


@router.post("/{session_id}/reassign", response_model=ChatDetailResponse)
async def reassign_chat(
    session_id: str,
    to_user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reassign a chat session to a different user"""
    try:
        # The same permission, organization and visibility checks as taking a
        # chat over: assigning reaches unclaimed chats too, so it must not reach
        # past what the caller's inbox shows.
        session = await _load_manageable_session(db, session_id, current_user)
        _require_may_change_hands(session, current_user)
        session_repo = SessionToAgentRepository(db)

        # The new owner must be a real, active member of the same org —
        # otherwise a chat (and its assignment notification) could be pushed
        # onto someone outside it. A 404 here doesn't confirm whether an id
        # exists elsewhere.
        target_user = UserRepository(db).get_user(to_user_id) if _is_uuid(to_user_id) else None
        if (target_user is None
                or not target_user.is_active
                or target_user.organization_id != current_user.organization_id):
            raise HTTPException(status_code=404, detail="User not found")

        # Any conversation still going can be given to someone: one a teammate
        # holds, one waiting in the queue, or one the AI is answering.
        if session.status == SessionStatus.CLOSED:
            raise HTTPException(status_code=400, detail="This chat is closed")

        # Capture the previous assignee BEFORE reassigning. reassign_session
        # re-fetches this same row, so within one DB session the identity map
        # hands back the very object `session` points at — it mutates
        # session.user_id to the new owner in place. Reading it afterward would
        # target the new assignee's room, not the previous one's.
        previous_user_id = session.user_id

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

        if previous_user_id:
            # Notify widget room (customer)
            await sio.emit('room_event', {
                'type': 'reassigned',
                'session_id': session_id,
                'message': 'Your conversation has been reassigned to another agent.'
            }, room=session_id, namespace='/widget')
        else:
            # Nobody had it: to the customer this is a person joining, as a
            # takeover is (the widget's note, and a channel's message)
            await sio.emit('handle_taken_over', {
                'session_id': session_id,
                'user_name': target_user.full_name,
                'profile_picture': '',
            }, room=session_id, namespace='/widget')
            await _notify_customer_of_handover(db, session, target_user)

        # Notify agent rooms (convention: user_{id})
        await sio.emit('room_event', {
            'type': 'reassigned',
            'session_id': session_id,
            'assigned_to': to_user_id
        }, room=f"user_{to_user_id}", namespace='/agent')

        # Also notify the PREVIOUS assignee that the chat left their queue —
        # unless it was reassigned to themselves (a no-op).
        if previous_user_id and str(previous_user_id) != str(to_user_id):
            await sio.emit('room_event', {
                'type': 'reassigned_from_you',
                'session_id': session_id
            }, room=f"user_{previous_user_id}", namespace='/agent')

        # Push to the new assignee — a socket event only reaches them if the
        # dashboard is already open.
        await notify_chat_assigned(db, session, to_user_id, assigned_by=current_user.id)

        return ChatDetailResponse(**chat)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reassigning chat: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to reassign chat")

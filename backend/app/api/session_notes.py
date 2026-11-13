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

"""Team notes on a conversation, with @-mentions, and snoozing it.

Mounted under /sessions with the takeover routes, and checked the same way
(_load_manageable_session): permission, organization, then inbox visibility.
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.session_to_agent import _load_manageable_session, _require_may_change_hands
from app.core.auth import get_current_user
from app.core.logger import get_logger
from app.core.socketio import sio
from app.database import get_db
from app.models.notification import NotificationType
from app.models.schemas.chat import ChatDetailResponse, ConversationNoteResponse, NoteCreate, SnoozeRequest
from app.models.session_to_agent import SessionStatus
from app.models.user import User
from app.repositories.chat import ChatRepository
from app.repositories.conversation_notes import ConversationNoteRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services.agent_rooms import emit_to_org_inbox
from app.services.inbox_plan import SNOOZE_FEATURE, require_inbox_feature
from app.services.notifications import notify_user

logger = get_logger(__name__)
router = APIRouter()

# A snooze is for "later today", "tomorrow", "next week", not for parking a chat
SNOOZE_MAX = timedelta(days=90)


@router.post("/{session_id}/notes", response_model=ConversationNoteResponse, status_code=status.HTTP_201_CREATED)
async def add_note(
    session_id: str,
    payload: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Leave a note on the conversation for the team.

    It is stored apart from the messages, so the customer, their channel and
    the AI never see it. Each teammate it mentions (an active member of the
    organization who can see the conversation; anyone else is dropped) gets
    a notification.
    """
    session = await _load_manageable_session(db, session_id, current_user)
    body = payload.body.strip()
    if not body:
        raise HTTPException(status_code=422, detail="A note needs some text")

    repo = ConversationNoteRepository(db)
    mentioned = repo.mentionable(session, payload.mentions)
    try:
        note = repo.create(session, current_user.id, body, mentioned)
    except Exception as e:
        logger.error(f"Error adding a note: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add the note")

    author = current_user.full_name or 'A teammate'
    for user in mentioned:
        if user.id == current_user.id:
            continue
        await notify_user(
            db=db,
            user_id=user.id,
            type_=NotificationType.CHAT,
            title=f"{author} mentioned you",
            # Notes are encrypted at rest; a notification row and a push are not,
            # so they say where to look, never what the note says
            message="Open the conversation to read the note",
            metadata={"session_id": str(session.session_id), "event": "mention", "note_id": note.id},
        )

    # The holder, every inbox that sees the whole queue (the org room) and each
    # mentioned teammate refresh: the note shows on an open thread without a
    # reload, and Mentions updates. The author's own inbox already shows it:
    # author_id lets it skip a refetch.
    event = {'type': 'note_added', 'session_id': str(session.session_id), 'author_id': str(current_user.id)}
    await emit_to_org_inbox('room_event', event, session.organization_id, session.user_id)
    for user in mentioned:
        if user.id != session.user_id:
            await sio.emit('room_event', event, room=f"user_{user.id}", namespace='/agent')

    return next(n for n in repo.for_session(session.session_id) if n['id'] == note.id)


async def _chat_detail(db: Session, session_id: str, current_user: User) -> ChatDetailResponse:
    chat = await ChatRepository(db).get_chat_detail(session_id=session_id, org_id=current_user.organization_id)
    if not chat:
        raise HTTPException(status_code=500, detail="Failed to read the conversation back")
    return ChatDetailResponse(**chat)


@router.post("/{session_id}/snooze", response_model=ChatDetailResponse)
async def snooze_chat(
    session_id: str,
    payload: SnoozeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Take the conversation out of the inbox's views until `until`. It comes
    back then, or as soon as the customer writes again."""
    session = await _load_manageable_session(db, session_id, current_user)
    if session.status == SessionStatus.CLOSED:
        raise HTTPException(status_code=400, detail="This chat is closed")
    _require_may_change_hands(session, current_user)
    require_inbox_feature(db, session.organization_id, SNOOZE_FEATURE)
    # Snoozing would take a waiting customer out of everyone's queue
    if session.status == SessionStatus.TRANSFERRED and session.user_id is None:
        raise HTTPException(status_code=400, detail="Someone is waiting for a person: assign the chat before snoozing it")

    until = payload.until if payload.until.tzinfo else payload.until.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    if until <= now:
        raise HTTPException(status_code=422, detail="Snooze until a time in the future")
    if until - now > SNOOZE_MAX:
        raise HTTPException(status_code=422, detail="Snooze for 90 days at most")

    if not SessionToAgentRepository(db).update_session(session.session_id, {'snoozed_until': until}):
        raise HTTPException(status_code=500, detail="Failed to snooze the chat")
    return await _chat_detail(db, session_id, current_user)


@router.delete("/{session_id}/snooze", response_model=ChatDetailResponse)
async def unsnooze_chat(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Bring a snoozed conversation back into the inbox now."""
    session = await _load_manageable_session(db, session_id, current_user)
    if session.snoozed_until is not None:
        if not SessionToAgentRepository(db).update_session(session.session_id, {'snoozed_until': None}):
            raise HTTPException(status_code=500, detail="Failed to unsnooze the chat")
    return await _chat_detail(db, session_id, current_user)

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

"""AI help in the inbox's thread: improve a draft reply, refresh the summary,
draft a help-center answer from the conversation (services/inbox_assistant).

Each acts on a conversation the caller may act on (_load_manageable_session),
on a plan with AI in the inbox (inbox_plan), with the org's own model.
"""

from dataclasses import asdict

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.api.session_to_agent import _load_manageable_session
from app.core.auth import get_current_user, has_any_permission
from app.database import get_db
from app.models.schemas.inbox_assist import (
    ImproveRequest, ImproveResponse, KnowledgeDraftResponse, SummaryResponse,
)
from app.models.user import User
from app.services import inbox_assistant
from app.services.inbox_assistant import AssistFailed, AssistUnavailable
from app.services.inbox_plan import INBOX_AI_FEATURE, require_inbox_feature

router = APIRouter()

NO_ANSWER = "The AI didn't answer. Try again."


async def _prepare(db: Session, session_id: str, current_user: User):
    """The conversation's transcript and the org's model, or the right refusal."""
    session = await _load_manageable_session(db, session_id, current_user)
    require_inbox_feature(db, session.organization_id, INBOX_AI_FEATURE)
    try:
        setup = inbox_assistant.model_setup(db, session.organization_id)
    except AssistUnavailable as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    conversation = await run_in_threadpool(inbox_assistant.transcript, db, session.session_id)
    return setup, conversation


@router.post("/{session_id}/assist/improve", response_model=ImproveResponse)
async def improve_reply(
    session_id: str, payload: ImproveRequest,
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    setup, conversation = await _prepare(db, session_id, current_user)
    try:
        return ImproveResponse(text=await inbox_assistant.improve(setup, payload.text, payload.style, conversation))
    except AssistFailed:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=NO_ANSWER)


@router.post("/{session_id}/assist/summary", response_model=SummaryResponse)
async def refresh_summary(
    session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    setup, conversation = await _prepare(db, session_id, current_user)
    if not conversation:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Nothing has been said yet")
    try:
        return SummaryResponse(summary=await inbox_assistant.summarize(setup, conversation))
    except AssistFailed:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=NO_ANSWER)


@router.post("/{session_id}/assist/knowledge", response_model=KnowledgeDraftResponse)
async def draft_knowledge(
    session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    """The team's answer as a help-center FAQ draft, for the FAQ editor to open
    (nothing is saved here). Only for someone who may edit the help center."""
    if not has_any_permission(current_user, ('manage_knowledge',)):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    setup, conversation = await _prepare(db, session_id, current_user)
    try:
        draft = await inbox_assistant.knowledge_draft(setup, conversation)
    except AssistFailed:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=NO_ANSWER)
    return KnowledgeDraftResponse(**asdict(draft))

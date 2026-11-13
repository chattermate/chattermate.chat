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

"""Saved replies: the team's shared library of replies for the inbox.

Anyone who works the inbox can use them; anyone who may act on chats can add,
edit or remove them (they speak for the whole team). Adding one needs a plan
with saved replies (inbox_plan): a team that moved down keeps the ones it has
listed, editable and removable.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.auth import CHAT_MANAGE_PERMISSIONS, INBOX_PERMISSIONS, get_current_user, has_any_permission
from app.database import get_db
from app.models.schemas.saved_reply import SavedReplyIn, SavedReplyOut
from app.models.user import User
from app.repositories.saved_replies import SavedReplyRepository, ShortcutTaken
from app.services.inbox_plan import SAVED_REPLIES_FEATURE, require_inbox_feature

router = APIRouter()

SHORTCUT_TAKEN = "Another saved reply already uses this shortcut"


def _require(user: User, permissions) -> None:
    if not has_any_permission(user, permissions):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")


@router.get("", response_model=List[SavedReplyOut])
async def list_saved_replies(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require(current_user, INBOX_PERMISSIONS)
    return SavedReplyRepository(db).list(current_user.organization_id)


@router.post("", response_model=SavedReplyOut, status_code=status.HTTP_201_CREATED)
async def create_saved_reply(
    payload: SavedReplyIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    _require(current_user, CHAT_MANAGE_PERMISSIONS)
    require_inbox_feature(db, current_user.organization_id, SAVED_REPLIES_FEATURE)
    try:
        return SavedReplyRepository(db).create(current_user.organization_id, current_user.id, **payload.model_dump())
    except ShortcutTaken:
        raise HTTPException(status_code=409, detail=SHORTCUT_TAKEN)


@router.put("/{reply_id}", response_model=SavedReplyOut)
async def update_saved_reply(
    reply_id: int, payload: SavedReplyIn,
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    _require(current_user, CHAT_MANAGE_PERMISSIONS)
    repo = SavedReplyRepository(db)
    reply = repo.get(current_user.organization_id, reply_id)
    if not reply:
        raise HTTPException(status_code=404, detail="Saved reply not found")
    try:
        return repo.update(reply, **payload.model_dump())
    except ShortcutTaken:
        raise HTTPException(status_code=409, detail=SHORTCUT_TAKEN)


@router.delete("/{reply_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_reply(
    reply_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    _require(current_user, CHAT_MANAGE_PERMISSIONS)
    repo = SavedReplyRepository(db)
    reply = repo.get(current_user.organization_id, reply_id)
    if not reply:
        raise HTTPException(status_code=404, detail="Saved reply not found")
    repo.delete(reply)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

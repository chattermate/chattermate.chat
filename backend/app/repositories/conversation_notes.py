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

from typing import Iterable, List
from uuid import UUID

from sqlalchemy.orm import Session, selectinload

from app.models.conversation_note import ConversationNote, ConversationNoteMention
from app.models.role import Role
from app.models.session_to_agent import SessionToAgent
from app.models.user import User
from app.services.chat_access import can_see_session

# A note is a few lines for a teammate, not a document
class ConversationNoteRepository:
    def __init__(self, db: Session):
        self.db = db

    def mentionable(self, session: SessionToAgent, user_ids: Iterable[UUID]) -> List[User]:
        """The ones among `user_ids` a note on `session` may mention: active
        members of its organization who can see the conversation. Anyone else is
        dropped, so a note never notifies a stranger, a switched-off account, or
        a teammate who would get a 404 opening it."""
        wanted = {UUID(str(u)) for u in user_ids}
        if not wanted:
            return []
        members = self.db.query(User).options(
            selectinload(User.role).selectinload(Role.permissions),
            selectinload(User.groups),
        ).filter(
            User.id.in_(wanted),
            User.organization_id == session.organization_id,
            User.is_active.is_(True),
        ).all()
        return [user for user in members if can_see_session(user, session)]

    def create(self, session, author_id: UUID, body: str, mentioned: List[User]) -> ConversationNote:
        note = ConversationNote(
            session_id=session.session_id,
            organization_id=session.organization_id,
            user_id=author_id,
            body=body,
            mentions=[ConversationNoteMention(user_id=user.id) for user in mentioned],
        )
        self.db.add(note)
        self.db.commit()
        self.db.refresh(note)
        return note

    def for_session(self, session_id: UUID) -> List[dict]:
        """A conversation's notes, oldest first, with who wrote them and who they mention."""
        notes = self.db.query(ConversationNote).filter(
            ConversationNote.session_id == session_id
        ).order_by(ConversationNote.created_at, ConversationNote.id).all()
        people = {n.user_id for n in notes if n.user_id} | {m.user_id for n in notes for m in n.mentions}
        names = dict(self.db.query(User.id, User.full_name).filter(User.id.in_(people)).all()) if people else {}
        return [{
            'id': n.id,
            'body': n.body,
            'user_id': n.user_id,
            'user_name': names.get(n.user_id),
            'mentions': [{'user_id': m.user_id, 'name': names.get(m.user_id)} for m in n.mentions],
            'created_at': n.created_at,
        } for n in notes]

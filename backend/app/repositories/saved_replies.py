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

from typing import List, Optional
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.saved_reply import SavedReply


class ShortcutTaken(Exception):
    """Another of the organization's replies already uses the shortcut."""


class SavedReplyRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, organization_id: UUID) -> List[SavedReply]:
        return self.db.query(SavedReply).filter(
            SavedReply.organization_id == organization_id
        ).order_by(SavedReply.title, SavedReply.id).all()

    def get(self, organization_id: UUID, reply_id: int) -> Optional[SavedReply]:
        """One of the organization's replies; another organization's is None, like a missing one."""
        return self.db.query(SavedReply).filter(
            SavedReply.id == reply_id, SavedReply.organization_id == organization_id
        ).first()

    def create(self, organization_id: UUID, created_by: UUID, **fields) -> SavedReply:
        reply = SavedReply(organization_id=organization_id, created_by=created_by, **fields)
        self.db.add(reply)
        return self._save(reply)

    def update(self, reply: SavedReply, **fields) -> SavedReply:
        for key, value in fields.items():
            setattr(reply, key, value)
        return self._save(reply)

    def _save(self, reply: SavedReply) -> SavedReply:
        # The unique (organization, shortcut) constraint decides, so two people
        # saving the same shortcut at once get a clear refusal, not a 500
        try:
            self.db.commit()
        except IntegrityError as error:
            self.db.rollback()
            raise ShortcutTaken() from error
        self.db.refresh(reply)
        return reply

    def delete(self, reply: SavedReply) -> None:
        self.db.delete(reply)
        self.db.commit()

"""
ChatterMate - File Attachment Repository
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

from sqlalchemy.orm import Session
from app.models.file_attachment import FileAttachment
from typing import List, Optional
from uuid import UUID


class FileAttachmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_attachment(
        self,
        file_url: str,
        filename: str,
        content_type: str,
        file_size: int,
        organization_id: UUID,
        chat_history_id: Optional[int] = None,
        uploaded_by_user_id: Optional[UUID] = None,
        uploaded_by_customer_id: Optional[UUID] = None
    ) -> FileAttachment:
        """Create a new file attachment record"""
        attachment = FileAttachment(
            file_url=file_url,
            filename=filename,
            content_type=content_type,
            file_size=file_size,
            chat_history_id=chat_history_id,
            organization_id=organization_id,
            uploaded_by_user_id=uploaded_by_user_id,
            uploaded_by_customer_id=uploaded_by_customer_id
        )
        self.db.add(attachment)
        self.db.commit()
        self.db.refresh(attachment)
        return attachment

    def get_attachment(self, attachment_id: int) -> Optional[FileAttachment]:
        """Get a file attachment by ID"""
        return self.db.query(FileAttachment).filter(
            FileAttachment.id == attachment_id
        ).first()

    def get_attachments_by_chat_history(
        self, chat_history_id: int
    ) -> List[FileAttachment]:
        """Get all attachments for a chat message"""
        return self.db.query(FileAttachment).filter(
            FileAttachment.chat_history_id == chat_history_id
        ).all()

    def get_attachments_by_organization(
        self, organization_id: UUID, limit: int = 100
    ) -> List[FileAttachment]:
        """Get all attachments for an organization"""
        return self.db.query(FileAttachment).filter(
            FileAttachment.organization_id == organization_id
        ).order_by(FileAttachment.created_at.desc()).limit(limit).all()

    def delete_attachment(self, attachment_id: int) -> bool:
        """Delete a file attachment"""
        attachment = self.get_attachment(attachment_id)
        if attachment:
            self.db.delete(attachment)
            self.db.commit()
            return True
        return False

    def link_attachment_to_message(
        self, attachment_id: int, chat_history_id: int
    ) -> Optional[FileAttachment]:
        """Link an existing attachment to a chat message"""
        attachment = self.get_attachment(attachment_id)
        if attachment:
            attachment.chat_history_id = chat_history_id
            self.db.commit()
            self.db.refresh(attachment)
            return attachment
        return None

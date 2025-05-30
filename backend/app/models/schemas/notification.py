"""
ChatterMate - Notification
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

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict
from app.models.notification import NotificationType
from uuid import UUID


class NotificationResponse(BaseModel):
    id: int
    user_id: UUID
    type: NotificationType
    title: str
    message: str
    notification_metadata: Optional[Dict] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

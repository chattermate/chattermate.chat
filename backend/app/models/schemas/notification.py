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

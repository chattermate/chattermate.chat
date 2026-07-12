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

from typing import Optional

from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.models.notification import Notification, NotificationType
from app.services.user import send_fcm_notification

logger = get_logger(__name__)


async def notify_user(
    db: Session,
    user_id,
    type_: NotificationType,
    title: str,
    message: str,
    metadata: Optional[dict] = None,
) -> None:
    """Persist an in-app notification and send its FCM push.

    Never raises and no-ops without a user (background jobs may have none) —
    a notification failure must not fail the work it reports on.
    """
    if not user_id:
        return
    try:
        notification = Notification(
            user_id=user_id,
            type=type_,
            title=title,
            message=message,
            notification_metadata=metadata,
        )
        db.add(notification)
        db.commit()
        await send_fcm_notification(user_id, notification, db)
    except Exception as e:
        logger.error(f"Error sending notification '{title}' to user {user_id}: {e}")
        try:
            db.rollback()
        except Exception:
            pass

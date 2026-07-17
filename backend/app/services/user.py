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

import json

from app.models.user import User
from app.models.notification import Notification
from app.core.logger import get_logger
from firebase_admin import messaging

logger = get_logger(__name__)


async def send_fcm_notification(user_id: str, notification: Notification, db):
    """Send FCM notification to user"""
    try:
        # Get user's FCM token
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.fcm_token_web:
            return

        metadata = notification.notification_metadata or {}

        # Data-only FCM message (no messaging.Notification): with a notification
        # payload the Firebase web SDK auto-displays its own copy in the service
        # worker AND swallows clicks on it, so the app's tagged, deep-linking
        # notification would appear as a duplicate. The service worker renders
        # the notification itself from this data. session_id is flattened out of
        # the metadata so a click can deep-link to /conversations?session=<id>;
        # metadata is JSON (str() produced a Python repr the frontend could
        # never parse).
        message = messaging.Message(
            data={
                'title': notification.title or '',
                'body': notification.message or '',
                'type': notification.type,
                'notification_id': str(notification.id),
                'session_id': str(metadata.get('session_id') or ''),
                'metadata': json.dumps(metadata, default=str)
            },
            token=user.fcm_token_web,
        )

        # Send message
        response = messaging.send(message)
        logger.info(f"Successfully sent FCM notification: {response}")

    except Exception as e:
        logger.error(f"Failed to send FCM notification: {str(e)}")

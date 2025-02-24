"""
ChatterMate - Knowledge Processor
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

import asyncio
from app.database import SessionLocal
from app.repositories.knowledge_queue import KnowledgeQueueRepository
from app.knowledge.knowledge_base import KnowledgeManager
from app.models.knowledge_queue import QueueStatus
from app.core.logger import get_logger
import os
from app.api.knowledge import PROCESSOR_STATUS
from datetime import datetime
from app.models.notification import Notification, NotificationType
from app.services.user import send_fcm_notification

logger = get_logger(__name__)


async def process_queue_item(queue_item_id: int):
    """Process a single queue item"""
    db = None
    try:
        db = SessionLocal()
        queue_repo = KnowledgeQueueRepository(db)
        queue_item = queue_repo.get_by_id(queue_item_id)

        if not queue_item:
            logger.error(f"Queue item {queue_item_id} not found")
            return

        # Get knowledge manager instance
        knowledge = KnowledgeManager(
            org_id=queue_item.organization_id,
            agent_id=queue_item.agent_id
        )

        # Process if status is pending
        if queue_item.status == QueueStatus.PENDING:
            # Update to processing
            queue_item.status = QueueStatus.PROCESSING
            db.commit()

            await knowledge.process_knowledge(queue_item)

            # Create notification for successful processing
            notification = Notification(
                user_id=queue_item.user_id,
                type=NotificationType.KNOWLEDGE_PROCESSED,
                title="Knowledge Processing Complete",
                message=f"Successfully processed {queue_item.source}",
                metadata={"queue_id": queue_item.id}
            )
            db.add(notification)
            db.commit()

            # Send FCM notification
            await send_fcm_notification(queue_item.user_id, notification, db)

        queue_item.status = QueueStatus.COMPLETED
        db.commit()

    except Exception as e:
        logger.error(f"Error processing queue item {queue_item_id}: {str(e)}")
        if db:
            queue_item.status = QueueStatus.FAILED

            # Create notification for failed processing
            notification = Notification(
                user_id=queue_item.user_id,
                type=NotificationType.KNOWLEDGE_FAILED,
                title="Knowledge Processing Failed",
                message=f"Failed to process {queue_item.source}: {str(e)}",
                metadata={"queue_id": queue_item.id}
            )
            db.add(notification)
            db.commit()

            # Send FCM notification for failure
            await send_fcm_notification(queue_item.user_id, notification, db)

        raise


async def run_processor():
    """Single run of the processor"""
    db = None
    try:
        PROCESSOR_STATUS["is_running"] = True
        PROCESSOR_STATUS["error"] = None

        db = SessionLocal()
        queue_repo = KnowledgeQueueRepository(db)
        pending_items = queue_repo.get_pending()

        if pending_items:
            # Create semaphore to limit concurrent processing to 3
            semaphore = asyncio.Semaphore(3)

            async def process_with_semaphore(item_id):
                async with semaphore:
                    await process_queue_item(item_id)

            # Process items with semaphore control
            await asyncio.gather(*[process_with_semaphore(item.id) for item in pending_items])

        PROCESSOR_STATUS["last_run"] = datetime.utcnow().isoformat()

    except Exception as e:
        logger.error(f"Error in knowledge processor: {str(e)}")
        PROCESSOR_STATUS["error"] = str(e)
        raise

    finally:
        if db:
            db.close()
        PROCESSOR_STATUS["is_running"] = False

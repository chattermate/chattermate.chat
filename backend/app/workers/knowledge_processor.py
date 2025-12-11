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
from app.models.knowledge_queue import QueueStatus, ProcessingStage
from app.core.logger import get_logger
import os
from app.core.processor import PROCESSOR_STATUS
from datetime import datetime
from app.models.notification import Notification, NotificationType
from app.services.user import send_fcm_notification
from urllib.parse import urlparse, unquote

logger = get_logger(__name__)


def get_user_friendly_filename(source: str, source_type: str) -> str:
    """Extract a user-friendly filename from the source URL or path"""
    try:
        if source_type == 'website':
            # For websites, just return the domain
            parsed = urlparse(source)
            return parsed.netloc or source
        
        # For files (PDF, etc.), extract filename from URL or path
        if source.startswith('http'):
            # Parse URL to get the path
            parsed = urlparse(source)
            path = parsed.path
            
            # Extract filename from path
            if path:
                # Get the last part of the path (filename)
                filename = path.split('/')[-1]
                # URL decode the filename to handle encoded characters like %20
                filename = unquote(filename)
                # Remove query parameters if any
                filename = filename.split('?')[0]
                if filename:
                    return filename
            
            # Fallback to domain if no filename found
            return parsed.netloc or source
        else:
            # For local file paths, just get the basename
            return os.path.basename(source)
            
    except Exception as e:
        logger.warning(f"Error extracting filename from {source}: {e}")
        return source


async def process_queue_item(queue_item_id: int):
    """Process a single queue item"""
    with SessionLocal() as db:
        try:
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
                queue_item.processing_stage = ProcessingStage.NOT_STARTED
                queue_item.progress_percentage = 0.0
                db.commit()

                await knowledge.process_knowledge(queue_item)

                # Create notification for successful processing
                user_friendly_name = get_user_friendly_filename(queue_item.source, queue_item.source_type)
                notification = Notification(
                    user_id=queue_item.user_id,
                    type=NotificationType.KNOWLEDGE_PROCESSED,
                    title="Knowledge Processing Complete",
                    message=f"Successfully processed {user_friendly_name}",
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
            try:
                queue_item.status = QueueStatus.FAILED

                # Create notification for failed processing
                user_friendly_name = get_user_friendly_filename(queue_item.source, queue_item.source_type)
                notification = Notification(
                    user_id=queue_item.user_id,
                    type=NotificationType.KNOWLEDGE_FAILED,
                    title="Knowledge Processing Failed",
                    message=f"Failed to process {user_friendly_name}: {str(e)}",
                    metadata={"queue_id": queue_item.id}
                )
                db.add(notification)
                db.commit()

                # Send FCM notification for failure
                await send_fcm_notification(queue_item.user_id, notification, db)
            except Exception as notify_err:
                logger.error(f"Error creating failure notification: {notify_err}")

            raise


async def run_processor():
    """Single run of the processor"""
    try:
        PROCESSOR_STATUS["is_running"] = True
        PROCESSOR_STATUS["error"] = None

        # Get pending items with proper connection handling
        with SessionLocal() as db:
            queue_repo = KnowledgeQueueRepository(db)
            pending_items = queue_repo.get_pending()
            # Extract IDs before closing the session
            pending_item_ids = [item.id for item in pending_items] if pending_items else []

        if pending_item_ids:
            # Reduce concurrent processing to 2 to conserve connections on t3.micro
            semaphore = asyncio.Semaphore(2)

            async def process_with_semaphore(item_id):
                async with semaphore:
                    await process_queue_item(item_id)

            # Process items with semaphore control
            await asyncio.gather(*[process_with_semaphore(item_id) for item_id in pending_item_ids])

        PROCESSOR_STATUS["last_run"] = datetime.utcnow().isoformat()

    except Exception as e:
        logger.error(f"Error in knowledge processor: {str(e)}")
        PROCESSOR_STATUS["error"] = str(e)
        raise

    finally:
        PROCESSOR_STATUS["is_running"] = False


# Main entry point for running as a standalone service
if __name__ == "__main__":
    import time
    
    logger.info("Starting knowledge processor service")
    
    async def processor_loop():
        while True:
            try:
                logger.info("Running knowledge processor")
                await run_processor()
                logger.info("Knowledge processor completed, sleeping for 60 seconds")
            except Exception as e:
                logger.error(f"Error in knowledge processor loop: {str(e)}")
            
            # Sleep for 60 seconds before next run
            await asyncio.sleep(60)
    
    # Run the processor loop
    asyncio.run(processor_loop())

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

from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.knowledge_queue import KnowledgeQueue, QueueStatus, STOPPED_AT_TIME_LIMIT
from typing import List, Optional
from datetime import datetime, timezone
from uuid import UUID
from app.core.logger import get_logger

logger = get_logger(__name__)


class KnowledgeQueueRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, queue_item: KnowledgeQueue) -> KnowledgeQueue:
        self.db.add(queue_item)
        self.db.commit()
        self.db.refresh(queue_item)
        return queue_item

    def get_by_id(self, queue_id: int) -> Optional[KnowledgeQueue]:
        """Get queue item by ID"""
        return self.db.query(KnowledgeQueue).filter(
            KnowledgeQueue.id == queue_id
        ).first()

    def get_pending(self) -> List[KnowledgeQueue]:
        """Get all pending queue items ordered by priority (highest first), then by creation time"""
        return self.db.query(KnowledgeQueue)\
            .filter(KnowledgeQueue.status == QueueStatus.PENDING)\
            .order_by(KnowledgeQueue.priority.desc(), KnowledgeQueue.created_at.asc())\
            .all()

    def get_abandoned(self, last_progress_before: datetime) -> List[KnowledgeQueue]:
        """Items still 'processing' with no progress since `last_progress_before`,
        locked so two workers never handle the same one."""
        return self.db.query(KnowledgeQueue)\
            .filter(KnowledgeQueue.status == QueueStatus.PROCESSING,
                    func.coalesce(KnowledgeQueue.updated_at, KnowledgeQueue.created_at) < last_progress_before)\
            .with_for_update(skip_locked=True)\
            .all()

    def update_status(self, queue_id: int, status: QueueStatus, error: Optional[str] = None) -> bool:
        item = self.db.query(KnowledgeQueue).filter(
            KnowledgeQueue.id == queue_id).first()
        if item:
            item.status = status
            item.error = error
            # Update processing stage to COMPLETED when status is COMPLETED
            if status == QueueStatus.COMPLETED:
                item.processing_stage = "COMPLETED"
                item.progress_percentage = 100.0
            self.db.commit()
            return True
        return False
        
    def update_progress(
        self, 
        queue_id: int, 
        processing_stage: str = None, 
        progress_percentage: float = None,
        total_items: int = None,
        processed_items: int = None,
        crawled_url: str = None,
        force_stage_update: bool = False
    ) -> bool:
        """Update the progress of a queue item"""
        item = self.db.query(KnowledgeQueue).filter(
            KnowledgeQueue.id == queue_id).first()
        if item:
            # Define stage priority to prevent regression
            stage_priority = {
                "not_started": 0,
                "crawling": 1,
                "embedding": 2,
                "completed": 3
            }
            
            # Only update processing stage if it's an advancement or forced
            if processing_stage and (force_stage_update or not item.processing_stage or 
                stage_priority.get(processing_stage.lower(), 0) >= stage_priority.get(item.processing_stage.lower(), 0)):
                item.processing_stage = processing_stage
            
            # Update progress percentage using main columns
            if progress_percentage is not None:
                item.progress_percentage = progress_percentage
            elif processed_items is not None and total_items is not None and total_items > 0:
                # Auto-calculate percentage based on processed/total items
                item.progress_percentage = (processed_items / total_items) * 100
                
            if total_items is not None:
                item.total_items = total_items
                
            if processed_items is not None:
                item.processed_items = processed_items
            
            # Add crawled URL to the list if provided (store only URL strings)
            if crawled_url:
                if not item.crawled_urls:
                    item.crawled_urls = []
                # Store only the URL string, no timestamp or status
                if crawled_url not in item.crawled_urls:
                    # Create a new list to ensure SQLAlchemy detects the change
                    new_crawled_urls = list(item.crawled_urls) if item.crawled_urls else []
                    new_crawled_urls.append(crawled_url)
                    item.crawled_urls = new_crawled_urls
                    
                    # Mark the attribute as modified to ensure SQLAlchemy commits the change
                    from sqlalchemy.orm.attributes import flag_modified
                    flag_modified(item, 'crawled_urls')
                    
                    from app.core.logger import get_logger
                    logger = get_logger(__name__)
                    logger.debug(f"📝 Added crawled URL to queue {queue_id}: {crawled_url} (total: {len(item.crawled_urls)})")
                    
                else:
                    from app.core.logger import get_logger
                    logger = get_logger(__name__)
                    logger.debug(f"🔄 URL already in list for queue {queue_id}: {crawled_url}")
                    
            # Commit changes and verify
            self.db.commit()
            
            # If we added a crawled URL, verify it was saved
            if crawled_url:
                self.db.refresh(item)
                from app.core.logger import get_logger
                logger = get_logger(__name__)
                logger.debug(f"🔍 After commit - queue {queue_id} crawled_urls count: {len(item.crawled_urls) if item.crawled_urls else 0}")
            
            return True
        return False

    def attach_knowledge(self, queue_id: int, knowledge_id: int) -> None:
        """Point the run at the source its pages land in. The caller commits,
        so this lands with the source it names."""
        self.db.query(KnowledgeQueue).filter(KnowledgeQueue.id == queue_id).update(
            {KnowledgeQueue.knowledge_id: knowledge_id}, synchronize_session=False
        )

    def record_page_learned(self, queue_id: int) -> None:
        """Count one more stored page. Done in SQL so it never loses a count
        to a stale copy of the row; it also marks the run as alive for the
        abandoned-item check."""
        self.db.query(KnowledgeQueue).filter(KnowledgeQueue.id == queue_id).update(
            {
                KnowledgeQueue.pages_learned: KnowledgeQueue.pages_learned + 1,
                KnowledgeQueue.updated_at: datetime.now(timezone.utc),
            },
            synchronize_session=False,
        )
        self.db.commit()

    def last_run_left_partial(self, organization_id: UUID, source: str, exclude_id: int) -> bool:
        """Whether the previous run of this source stopped partway with pages
        stored. Its pages stay searchable, but adding it again must read the
        site again rather than skip it as already learned."""
        previous = self.db.query(KnowledgeQueue).filter(
            KnowledgeQueue.organization_id == organization_id,
            KnowledgeQueue.source == source,
            KnowledgeQueue.id != exclude_id,
        ).order_by(KnowledgeQueue.id.desc()).first()
        return bool(
            previous
            and previous.status == QueueStatus.FAILED.value
            and (previous.pages_learned or 0) > 0
        )

    def note_stopped_at_time_limit(self, queue_id: int) -> None:
        """Record that the run kept what it read before its time limit."""
        item = self.get_by_id(queue_id)
        if item is None:
            return
        item.queue_metadata = {**(item.queue_metadata or {}), STOPPED_AT_TIME_LIMIT: True}
        self.db.commit()

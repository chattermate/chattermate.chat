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

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.knowledge import Knowledge, SourceType
from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.sql import text
import logging
from uuid import UUID
from app.models.knowledge_to_agent import KnowledgeToAgent
from app.models.knowledge_queue import KnowledgeQueue, QueueStatus

logger = logging.getLogger(__name__)


class KnowledgeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, knowledge_id: int) -> Optional[Knowledge]:
        """Get knowledge source by ID"""
        return self.db.query(Knowledge)\
            .filter(Knowledge.id == knowledge_id)\
            .first()

    def get_by_agent(self, agent_id: UUID, skip: int = 0, limit: int = 100):
        """Get paginated knowledge items for an agent"""
        
        query = (self.db.query(Knowledge)
                .join(KnowledgeToAgent)
                .filter(
                    KnowledgeToAgent.knowledge_id == Knowledge.id,
                    KnowledgeToAgent.agent_id == agent_id
                )
                .order_by(Knowledge.id)
                .offset(skip)
                .limit(limit))
        
        result = query.all()

        return result

    def count_by_agent(self, agent_id: UUID) -> int:
        """Get total count of knowledge items for an agent"""
        
        query = (self.db.query(func.count(Knowledge.id))
                .join(KnowledgeToAgent)
                .filter(
                    KnowledgeToAgent.knowledge_id == Knowledge.id,
                    KnowledgeToAgent.agent_id == agent_id
                ))
        
        result = query.scalar() or 0
        return result

    def get_by_org(self, org_id: UUID) -> List[Knowledge]:
        """Get all knowledge sources for an organization"""
        return self.db.query(Knowledge)\
            .filter(Knowledge.organization_id == org_id)\
            .all()

    def create(self, knowledge: Knowledge) -> Knowledge:
        """Create a new knowledge source or get existing"""
        existing = self.db.query(Knowledge)\
            .filter(
                Knowledge.organization_id == knowledge.organization_id,
                Knowledge.source == knowledge.source
        ).first()

        if existing:
            return existing

        self.db.add(knowledge)
        self.db.commit()
        self.db.refresh(knowledge)
        return knowledge

    def delete(self, knowledge_id: int) -> bool:
        """Delete a knowledge source"""
        knowledge = self.db.query(Knowledge)\
            .filter(Knowledge.id == knowledge_id)\
            .first()
        if knowledge:
            self.db.delete(knowledge)
            self.db.commit()
            return True
        return False

    def count_by_organization(self, org_id: UUID) -> int:
        """Get total count of indexed knowledge items for an organization"""
        
        query = (self.db.query(func.count(Knowledge.id))
                .filter(Knowledge.organization_id == org_id))
        
        result = query.scalar() or 0
        return result

    # A crawl occupies its plan slot the moment it is queued, not when it
    # finishes. Counting only indexed rows let an organization submit its
    # whole backlog in one sitting - every request saw a count of zero - and
    # end up over the plan limit once the queue drained.
    IN_FLIGHT_QUEUE_STATUSES = (QueueStatus.PENDING.value, QueueStatus.PROCESSING.value)
    # The worker only ever picks up PENDING, so a row left PROCESSING by a
    # restart is never retried and never completes. Stop charging for one
    # after this long, or a redeploy mid-crawl would cost a slot for ever.
    STALE_PROCESSING_AFTER = timedelta(hours=6)

    def count_sources_in_use(self, org_id: UUID, now: datetime = None) -> int:
        """Knowledge sources occupying a plan slot: the indexed ones plus the
        crawls still queued or running.

        Every queue row becomes its own Knowledge row - the worker does not
        merge repeats - so rows are counted, not distinct sources: otherwise
        submitting one URL repeatedly walked past the limit unchecked. A run
        that has stored a page points at its Knowledge row and is counted
        through that row alone."""
        now = now or datetime.now(timezone.utc)
        fresh_enough = now - self.STALE_PROCESSING_AFTER
        in_flight = (
            self.db.query(func.count(KnowledgeQueue.id))
            .filter(
                KnowledgeQueue.organization_id == org_id,
                # A crawl that has stored a page already has its Knowledge
                # row, counted above; counting the run too would take two
                # slots for as long as it reads.
                KnowledgeQueue.knowledge_id.is_(None),
                or_(
                    KnowledgeQueue.status == QueueStatus.PENDING.value,
                    and_(
                        KnowledgeQueue.status == QueueStatus.PROCESSING.value,
                        func.coalesce(
                            KnowledgeQueue.updated_at, KnowledgeQueue.created_at
                        ) >= fresh_enough,
                    ),
                ),
            )
            .scalar() or 0
        )
        return self.count_by_organization(org_id) + in_flight

    def get_by_organization(
        self,
        org_id: UUID,
        skip: int = 0,
        limit: int = 10
    ) -> List[Knowledge]:
        """Get paginated knowledge items for an organization"""
        
        query = (self.db.query(Knowledge)
                .filter(Knowledge.organization_id == org_id)
                .order_by(Knowledge.id)
                .offset(skip)
                .limit(limit))
        
        result = query.all()
        return result

    def get_by_sources(self, organization_id: UUID, sources: List[str]):
        """Get knowledge items by source URLs for an organization"""
        return self.db.query(Knowledge)\
            .filter(
                Knowledge.organization_id == organization_id,
                Knowledge.source.in_(sources)
            ).all()

    def get_or_create_source(
        self,
        organization_id: UUID,
        source: str,
        source_type: SourceType,
        table_name: str,
        schema: str,
        agent_id: Optional[UUID] = None,
    ) -> Knowledge:
        """The org's Knowledge row for `source`, created if it has none, and
        linked to `agent_id`. Reading a site again reuses its row, so its
        pages (which share the row's name in the vector table) never belong
        to two sources. Does not commit.

        A run and an API add can reach this at the same moment, so it holds a
        transaction-level lock on the (org, source) pair until the caller
        commits."""
        if self.db.get_bind().dialect.name == "postgresql":
            self.db.execute(
                text("SELECT pg_advisory_xact_lock(hashtextextended(:key, 0))"),
                {"key": f"knowledge:{organization_id}:{source}"},
            )
        knowledge = (
            self.db.query(Knowledge)
            .filter(
                Knowledge.organization_id == organization_id,
                Knowledge.source == source,
                Knowledge.source_type == source_type,
            )
            .order_by(Knowledge.id)
            .first()
        )
        if knowledge is None:
            knowledge = Knowledge(
                organization_id=organization_id,
                source=source,
                source_type=source_type,
                table_name=table_name,
                schema=schema,
            )
            self.db.add(knowledge)
            self.db.flush()
        if agent_id and all(link.agent_id != agent_id for link in knowledge.agent_links):
            knowledge.agent_links.append(KnowledgeToAgent(agent_id=agent_id))
            self.db.flush()
        return knowledge

    def delete_with_data(self, knowledge_id: int) -> bool:
        """Delete knowledge source and its associated data"""
        try:
            knowledge = self.get_by_id(knowledge_id)
            if not knowledge:
                return False

            # Delete from knowledge_to_agent table first
            self.db.execute(
                text("DELETE FROM knowledge_to_agents WHERE knowledge_id = :kid"),
                {"kid": knowledge_id}
            )

            # If table_name and schema exist, delete the actual data
            if knowledge.table_name and knowledge.schema:
                try:
                    # Delete data from the specific table
                    self.db.execute(
                        text(f'DELETE FROM {knowledge.schema}."{ knowledge.table_name}" WHERE name = :source'),
                        {"source": knowledge.source}
                    )
                except Exception as e:
                    logger.error(f"Error deleting data from {
                                 knowledge.table_name}: {str(e)}")
                    # Continue with knowledge deletion even if data deletion fails

            # Delete the knowledge entry
            self.db.delete(knowledge)
            self.db.commit()
            return True

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error in delete_with_data: {str(e)}")
            raise

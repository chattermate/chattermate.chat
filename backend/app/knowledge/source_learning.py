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

The bookkeeping around a website that is learned page by page.

The agent only searches sources it is linked to, so the source's Knowledge
row and link are made as soon as its first page is stored, not when the
crawl ends. The queue row counts the stored pages for the progress shown
while it reads. Each call uses its own short session: they run on the
crawler's thread, between pages.
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import text

from app.database import SessionLocal
from app.models.knowledge import Knowledge, SourceType
from app.models.knowledge_queue import KnowledgeQueue
from app.repositories.knowledge import KnowledgeRepository
from app.repositories.knowledge_queue import KnowledgeQueueRepository
from app.services import knowledge_vector_links


class SourceLearning:
    """Implements page_sink.SourceLearningHooks for one queued source: a
    website, or a source an extension reads (see source_readers)."""

    def __init__(
        self,
        queue_id: int,
        organization_id: UUID,
        agent_id: Optional[UUID],
        source: str,
        table_name: str,
        schema: str,
        source_type: SourceType = SourceType.WEBSITE,
    ):
        self._queue_id = queue_id
        self._organization_id = organization_id
        # Compared with the link rows' UUIDs; a caller may hold it as text
        self._agent_id = UUID(str(agent_id)) if agent_id else None
        self._source = source
        self._table_name = table_name
        self._schema = schema
        self._source_type = source_type
        self._knowledge_id: Optional[int] = None

    def first_page(self) -> List[str]:
        return self.ensure_source()

    def ensure_source(self) -> List[str]:
        """Make (or reuse) the source and link the agent, file every stored
        page under the agents it is linked to, and point the run at it.
        Idempotent: also called when the run ends, which covers a run that
        stored nothing new because the site was already learned."""
        with SessionLocal() as db:
            knowledge = KnowledgeRepository(db).get_or_create_source(
                self._organization_id,
                self._source,
                self._source_type,
                self._table_name,
                self._schema,
                self._agent_id,
            )
            agent_ids = knowledge_vector_links.agent_ids_for(knowledge)
            knowledge_vector_links.sync_agent_ids(db, knowledge, agent_ids)
            KnowledgeQueueRepository(db).attach_knowledge(self._queue_id, knowledge.id)
            db.commit()
            self._knowledge_id = knowledge.id
            return agent_ids

    def page_stored(self) -> None:
        with SessionLocal() as db:
            KnowledgeQueueRepository(db).record_page_learned(self._queue_id)

    def removed(self) -> bool:
        if self._knowledge_id is None:
            return False
        with SessionLocal() as db:
            return db.get(Knowledge, self._knowledge_id) is None

    def discard(self) -> None:
        """The source was deleted mid-crawl: drop what the run wrote after
        the delete, and the run itself, so nothing of it lingers. Rows stay
        if the org still has a source by that name (it owns them)."""
        with SessionLocal() as db:
            still_a_source = db.query(Knowledge.id).filter(
                Knowledge.organization_id == self._organization_id,
                Knowledge.source == self._source,
            ).first()
            if still_a_source is None:
                db.execute(
                    text(f'DELETE FROM {self._schema}."{self._table_name}" WHERE name = :source'),
                    {"source": self._source},
                )
            db.query(KnowledgeQueue).filter(KnowledgeQueue.id == self._queue_id).delete(
                synchronize_session=False
            )
            db.commit()

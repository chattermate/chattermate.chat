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

What an agent learns about a Shopify store when it starts answering on it.

By default the storefront is crawled like any website. An installed extension
can learn the store another way: its STORE_LEARNING_MODULE has
on_agent_enabled(db, shop, organization_id, agent_id, user_id), which returns
True when it has queued (or linked) what the agent learns. If it returns False,
fails, or isn't installed, the storefront is crawled.
"""

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.enterprise_hooks import enterprise_hook
from app.core.logger import get_logger
from app.models.knowledge import Knowledge
from app.models.knowledge_queue import KnowledgeQueue, QueueStatus
from app.models.knowledge_to_agent import KnowledgeToAgent
from app.models.shopify.shopify_shop import ShopifyShop
from app.repositories.knowledge_queue import KnowledgeQueueRepository
from app.repositories.knowledge_to_agent import KnowledgeToAgentRepository
from app.services import knowledge_vector_links

logger = get_logger(__name__)

STORE_LEARNING_MODULE = "app.enterprise.services.shopify_store_learning"

# Queue source_type of a storefront crawl
WEBSITE = "website"


def learn_store(
    db: Session,
    shop: ShopifyShop,
    organization_id: UUID,
    agent_id: UUID,
    user_id: Optional[UUID],
) -> None:
    """Have the agent learn the store, once: queue it, or link what the org
    has already learned from it."""
    if _extension_learns(db, shop, organization_id, agent_id, user_id):
        return
    queue_or_link(db, organization_id, agent_id, user_id, shop.shop_domain, WEBSITE)


def queue_or_link(
    db: Session,
    organization_id: UUID,
    agent_id: UUID,
    user_id: Optional[UUID],
    source: str,
    queue_type: str,
    queue_metadata: Optional[dict] = None,
) -> None:
    """Link the org's source to the agent if it has one; otherwise queue it."""
    if not link_existing(db, organization_id, agent_id, source):
        queue_source(db, organization_id, agent_id, user_id, source, queue_type, queue_metadata)


def queue_source(
    db: Session,
    organization_id: UUID,
    agent_id: Optional[UUID],
    user_id: Optional[UUID],
    source: str,
    queue_type: str,
    queue_metadata: Optional[dict] = None,
) -> bool:
    """Queue the source to be read (again) for the agent, unless it is
    already waiting or being read for that agent. Commits. True when queued."""
    if is_queued(db, organization_id, source, agent_id):
        logger.info(f"{source} is already queued for org {organization_id}")
        return False
    KnowledgeQueueRepository(db).create(KnowledgeQueue(
        organization_id=organization_id,
        agent_id=agent_id,
        user_id=user_id,
        source_type=queue_type,
        source=source,
        status=QueueStatus.PENDING,
        queue_metadata=queue_metadata or {},
    ))
    logger.info(f"Queued {source} ({queue_type}) for agent {agent_id}")
    return True


def is_queued(db: Session, organization_id: UUID, source: str, agent_id: Optional[UUID] = None) -> bool:
    """Whether the source is waiting to be read, or being read; for the
    agent, when one is given (a run links its source to its own agent only)."""
    query = db.query(KnowledgeQueue.id).filter(
        KnowledgeQueue.organization_id == organization_id,
        KnowledgeQueue.source == source,
        KnowledgeQueue.status.in_([QueueStatus.PENDING, QueueStatus.PROCESSING]),
    )
    if agent_id is not None:
        query = query.filter(KnowledgeQueue.agent_id == agent_id)
    return query.first() is not None


def link_existing(db: Session, organization_id: UUID, agent_id: UUID, source: str) -> bool:
    """Link the org's source to the agent, in the vector store too (retrieval
    matches on the stored agent ids, so a link row alone finds nothing).
    False when the org has no such source. Commits."""
    knowledge = (
        db.query(Knowledge)
        .filter(Knowledge.organization_id == organization_id, Knowledge.source == source)
        .first()
    )
    if knowledge is None:
        return False
    link_repo = KnowledgeToAgentRepository(db)
    if link_repo.get_by_ids(knowledge.id, agent_id) is None:
        link_repo.create(KnowledgeToAgent(knowledge_id=knowledge.id, agent_id=agent_id), commit=False)
        logger.info(f"Linked knowledge source {knowledge.id} to agent {agent_id}")
    # Every time, not only for a new link: links made before the vector store
    # was kept in step have no filter, and this repairs them (idempotent)
    knowledge_vector_links.add_agent(db, knowledge, agent_id)
    db.commit()
    return True


def _extension_learns(
    db: Session,
    shop: ShopifyShop,
    organization_id: UUID,
    agent_id: UUID,
    user_id: Optional[UUID],
) -> bool:
    try:
        on_agent_enabled = enterprise_hook(STORE_LEARNING_MODULE, "on_agent_enabled")
        return bool(on_agent_enabled and on_agent_enabled(db, shop, organization_id, agent_id, user_id))
    except Exception:
        # The store still gets learned: fall back to the storefront crawl
        db.rollback()
        logger.exception(f"Store learning extension failed for {shop.shop_domain}; crawling the storefront")
        return False

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

"""Shared helpers for reading, re-embedding and deleting knowledge sub-pages.

A knowledge "source" (``Knowledge`` row) stores its crawled/extracted content as
rows in the pgvector table ``{schema}."{table}"``. Each row is a *chunk*; a
*page* (aka sub-page) is the group of chunks that share a base ``id`` — the page
URL/name — with optional ``_N`` chunk suffixes (e.g. ``site.com/docs`` and
``site.com/docs_1``, ``site.com/docs_2``).

These helpers centralise the embed/upsert/delete logic that the knowledge API
endpoints previously duplicated inline, so editing a chunk, adding a sub-page and
replacing a whole page all go through one code path.
"""

from typing import Any, Dict, List, Optional
from uuid import UUID

from agno.document import Document
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.knowledge.knowledge_base import KnowledgeManager
from app.models.knowledge import Knowledge, SourceType
from app.models.knowledge_to_agent import KnowledgeToAgent
from app.repositories.knowledge import KnowledgeRepository
from app.repositories.knowledge_to_agent import KnowledgeToAgentRepository

logger = get_logger(__name__)

# SQL expression that maps a chunk ``id`` back to its page id by stripping a
# trailing ``_<number>`` chunk suffix (agno splits a page's content into
# ``<page>_1``, ``<page>_2`` … chunks). Only a *numeric* suffix is stripped, so
# legitimate underscores in a page name (e.g. ``getting_started``) are kept and
# distinct pages are never collapsed together. This is the single source of
# truth for page grouping — the source-listing queries import it too, and the
# frontend ``basePageId`` mirrors it — so page membership is identical
# everywhere edit/delete/list operate.
PAGE_ID_EXPR = "CASE WHEN id ~ '_[0-9]+$' THEN substring(id from '^(.*)_[0-9]+$') ELSE id END"


def get_manager(organization_id) -> KnowledgeManager:
    """Build a KnowledgeManager bound to an org's vector table (no agent link)."""
    return KnowledgeManager(org_id=organization_id, agent_id=None)


def agent_ids_for(knowledge: Knowledge) -> List[str]:
    """Return the agent ids linked to a knowledge source (for vector filters)."""
    return [str(link.agent_id) for link in knowledge.agent_links]


def embed_document(
    manager: KnowledgeManager,
    source: str,
    doc_id: str,
    content: str,
    meta_data: Optional[Dict[str, Any]] = None,
) -> Document:
    """Create a Document for ``doc_id`` and embed it with the org's embedder."""
    doc = Document(
        name=source,
        id=doc_id,
        content=content,
        meta_data=meta_data or {},
    )
    doc.embed(embedder=manager.vector_db.embedder)
    return doc


def count_subpages(db: Session, knowledge: Knowledge) -> int:
    """Count the distinct sub-pages stored for a knowledge source.

    Counts pages, not raw chunks, so a page split into several ``_N`` chunks
    counts once — matching the ``max_sub_pages`` plan limit's intent.
    """
    query = text(
        f"SELECT COUNT(DISTINCT {PAGE_ID_EXPR}) AS count "
        f'FROM {knowledge.schema}."{knowledge.table_name}" WHERE name = :source'
    )
    row = db.execute(query, {"source": knowledge.source}).fetchone()
    return row.count if row else 0


def get_page_chunks(db: Session, knowledge: Knowledge, page_id: str) -> List[Any]:
    """Return all chunk rows (id, content, meta_data) belonging to a page."""
    query = text(
        f'SELECT id, content, meta_data FROM {knowledge.schema}."{knowledge.table_name}" '
        f"WHERE name = :source AND {PAGE_ID_EXPR} = :page_id "
        "ORDER BY id ASC"
    )
    return db.execute(
        query, {"source": knowledge.source, "page_id": page_id}
    ).fetchall()


def delete_page_chunks(
    db: Session,
    knowledge: Knowledge,
    page_id: str,
    exclude_canonical: bool = False,
) -> int:
    """Delete the chunks of a page. Returns the number of rows removed.

    When ``exclude_canonical`` is True the row whose id equals ``page_id`` is
    kept — used by :func:`replace_page` to clear leftover ``_N`` chunks after the
    canonical row has been upserted. The caller commits the transaction.
    """
    sql = (
        f'DELETE FROM {knowledge.schema}."{knowledge.table_name}" '
        f"WHERE name = :source AND {PAGE_ID_EXPR} = :page_id"
    )
    if exclude_canonical:
        sql += " AND id != :page_id"
    result = db.execute(text(sql), {"source": knowledge.source, "page_id": page_id})
    return result.rowcount


def replace_page(
    db: Session,
    knowledge: Knowledge,
    page_id: str,
    content: str,
    title: Optional[str] = None,
) -> int:
    """Replace a page's content with a single freshly re-embedded chunk.

    Collapses the page into one chunk keyed by ``page_id`` holding ``content``.
    Metadata (including the page ``url`` and agent linkage) is preserved from the
    existing chunks where available, so the edited page stays attributed to the
    same agents and keeps its source URL.

    Ordering is chosen so the page can never be lost:

    1. Embed the new content (if this raises, nothing has changed).
    2. ``upsert`` the canonical ``page_id`` row on the vector store's own
       connection — this overwrites the existing single-chunk page in place, or
       inserts the collapsed row for a multi-chunk page. The new content is now
       durably stored before anything is deleted.
    3. Delete any leftover ``_N`` chunks (``exclude_canonical``) and commit.

    A failure at step 2 leaves the original page intact; a failure at step 3
    leaves the correct new content in place plus at most some stale extra chunks
    (no data loss). ``upsert`` (vs ``insert``) also avoids a duplicate-key error
    when the canonical row already exists. This function commits the request
    session itself.

    Returns the number of chunks the page had before the replace (0 if the page
    does not exist).
    """
    existing = get_page_chunks(db, knowledge, page_id)
    if not existing:
        return 0

    # Preserve the first chunk's metadata (url, etc.); refresh agent linkage.
    base_meta: Dict[str, Any] = dict(existing[0].meta_data or {})
    agent_ids = agent_ids_for(knowledge)
    base_meta["agent_id"] = agent_ids
    if title is not None:
        base_meta["title"] = title

    manager = get_manager(knowledge.organization_id)
    doc = embed_document(manager, knowledge.source, page_id, content, base_meta)
    filters = {
        "name": knowledge.source,
        "agent_id": agent_ids,
        "org_id": str(knowledge.organization_id),
    }

    # Persist the new content first, then clear leftover chunks of the page.
    manager.vector_db.upsert([doc], filters=filters)
    removed_extra = delete_page_chunks(db, knowledge, page_id, exclude_canonical=True)
    db.commit()

    logger.info(
        f"Replaced page '{page_id}' ({len(existing)} chunk(s), "
        f"{removed_extra} extra removed) for source '{knowledge.source}'"
    )
    return len(existing)


def reembed_chunk(
    db: Session,
    knowledge: Knowledge,
    chunk_id: str,
    content: str,
) -> None:
    """Re-embed one chunk's content in place (scoped to its source). Caller commits."""
    manager = get_manager(knowledge.organization_id)
    doc = embed_document(manager, knowledge.source, chunk_id, content)
    update_query = text(
        f'UPDATE {knowledge.schema}."{knowledge.table_name}" '
        "SET content = :content, embedding = :embedding "
        "WHERE id = :chunk_id AND name = :source"
    )
    db.execute(
        update_query,
        {
            "content": content,
            "embedding": doc.embedding,
            "chunk_id": chunk_id,
            "source": knowledge.source,
        },
    )


def create_text_source(
    db: Session,
    organization_id: UUID,
    title: str,
    content: str,
    agent_id: Optional[UUID] = None,
) -> Knowledge:
    """Create a knowledge source from pasted text and embed it as one page.

    Unlike a URL/PDF source (which is crawled asynchronously via the queue), a
    text source is indexed inline and is immediately ``synced``. Returns the new
    ``Knowledge`` row. Caller is responsible for the enclosing request context;
    the vector write commits on its own session.
    """
    manager = KnowledgeManager(
        org_id=organization_id, agent_id=str(agent_id) if agent_id else None
    )
    agent_ids = [str(agent_id)] if agent_id else []

    # Embed first — an embedding failure then creates no source row at all.
    doc = embed_document(
        manager, title, title, content, {"agent_id": agent_ids, "url": title, "title": title}
    )

    repo = KnowledgeRepository(db)
    # KnowledgeRepository.create dedupes on (org, source); track whether the row
    # already existed so we only compensate-delete a row we actually created.
    pre_existing = bool(repo.get_by_sources(organization_id, [title]))
    knowledge = repo.create(
        Knowledge(
            organization_id=organization_id,
            source=title,
            source_type=SourceType.CUSTOM,
            table_name=manager.vector_db.table_name,
            schema=manager.vector_db.schema,
        )
    )
    try:
        if agent_id is not None:
            KnowledgeToAgentRepository(db).create(
                KnowledgeToAgent(knowledge_id=knowledge.id, agent_id=agent_id)
            )
        # upsert (not insert) is idempotent on the id, so a raced duplicate title
        # overwrites its own chunk instead of raising a duplicate-key error.
        manager.vector_db.upsert(
            [doc],
            filters={"name": title, "agent_id": agent_ids, "org_id": str(organization_id)},
        )
    except Exception:
        # Don't leave a chunkless orphan source behind if indexing fails.
        if not pre_existing:
            repo.delete(knowledge.id)
        raise
    logger.info(f"Created text knowledge source '{title}' for org {organization_id}")
    return knowledge


def insert_subpage(knowledge: Knowledge, subpage_name: str, content: str) -> None:
    """Embed and insert a brand-new sub-page chunk.

    The write happens on the vector store's own session (which commits itself);
    there is nothing to commit on the request session.
    """
    agent_ids = agent_ids_for(knowledge)
    manager = get_manager(knowledge.organization_id)
    doc = embed_document(
        manager, knowledge.source, subpage_name, content, {"agent_id": agent_ids}
    )
    filters = {
        "name": knowledge.source,
        "agent_id": agent_ids,
        "org_id": str(knowledge.organization_id),
    }
    manager.vector_db.insert([doc], filters=filters)

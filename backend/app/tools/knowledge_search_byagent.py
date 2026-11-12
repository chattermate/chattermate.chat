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

import traceback
from typing import Any, Dict, Iterable, List, Optional, Set, Tuple
from agno.tools import Toolkit
from agno.utils.log import logger
from sqlalchemy import text
from app.database import SessionLocal
from app.core.config import settings
from app.knowledge.chunking import chunk_id, page_id_of, split_text
from app.repositories.knowledge import KnowledgeRepository
from agno.knowledge.agent import AgentKnowledge
from agno.vectordb.pgvector import PgVector, SearchType
from app.knowledge.embedder import get_embedder
from uuid import UUID

NO_RESULTS = "No relevant information found in the knowledge base."
NO_FURTHER_RESULTS = (
    "No further results for this topic in the knowledge base beyond what earlier "
    "searches in this turn already returned."
)


class _Hit:
    """One chunk row as rendered to the model, plus what groups and orders it."""

    __slots__ = ("id", "content", "page_id", "chunk", "chunk_count", "url", "name")

    def __init__(self, id: str, content: str, meta: Dict[str, Any], name: str):
        self.id = id
        self.content = content
        self.name = name
        self.page_id = meta.get("page_id") or page_id_of(id)
        self.chunk = meta.get("chunk") if isinstance(meta.get("chunk"), int) else None
        self.chunk_count = meta.get("chunk_count") if isinstance(meta.get("chunk_count"), int) else None
        self.url = meta.get("url")

    @property
    def is_chunked(self) -> bool:
        return self.chunk is not None and self.chunk_count is not None and self.chunk_count > 1


class KnowledgeSearchByAgent(Toolkit):
    def __init__(self, agent_id: str, org_id: UUID, source: str = None):
        super().__init__(name="knowledge_search_by_agent")
        self.name = "knowledge_search_by_agent"
        self.description = "Search the knowledge base for information about a query"
        self.function = self.search_knowledge_base
        self.agent_id = agent_id
        self.org_id = org_id
        self.source = source
        # Structured citations for the most recent turn: list of {"name", "type"}.
        # Read (and reset) by the chat agent after each run to attach to the response.
        self.collected_sources: List[Dict[str, str]] = []
        # Chunk ids already shown to the model this turn. A repeat search skips
        # them and returns the next-best material instead of the same text again,
        # so every tool call within the turn's budget adds something new.
        self.seen_chunk_ids: Set[str] = set()

        # NOTE: this used to export the org's key as OPENAI_API_KEY for agno's
        # old default OpenAI embedder. Search now uses the local FastEmbed
        # embedder and every model gets its key explicitly, so the env write
        # was dead — and a cross-tenant race (concurrent orgs overwrote each
        # other's key in process-global state).
        self.agent_knowledge = None
        self._table: Optional[str] = None
        self._schema: Optional[str] = None
        self.register(self.search_knowledge_base)

    def reset_turn(self) -> None:
        """Forget this turn's citations and shown chunks before the next run."""
        self.collected_sources = []
        self.seen_chunk_ids = set()

    def search_knowledge_base(self, query: str) -> str:
        """Use this function to search the knowledge base for information about a query.

        Args:
            query: The query to search for.
        """
        try:
            logger.debug(f"Searching knowledge base for query: {query}")

            # Use context manager for database operations
            with SessionLocal() as db:
                knowledge_repo = KnowledgeRepository(db)
                # Get knowledge sources linked to this agent
                knowledge_sources = knowledge_repo.get_by_agent(self.agent_id)

                if not knowledge_sources:
                    return "No knowledge sources available for this agent."

                # All of an agent's sources live in the org's one vector table.
                source = knowledge_sources[0]
                self._table = source.table_name
                self._schema = source.schema

                # Initialize agent_knowledge if it doesn't exist
                if self.agent_knowledge is None:
                    # Initialize vector db with simpler search type to avoid connection issues
                    vector_db = PgVector(
                        table_name=source.table_name,
                        db_url=settings.DATABASE_URL,
                        schema=source.schema,
                        search_type=SearchType.vector,  # Changed from hybrid to vector for speed
                        embedder=get_embedder()
                    )
                    logger.debug(f"Vector db initialized: {source.table_name}")

                    # Create AgentKnowledge instance
                    self.agent_knowledge = AgentKnowledge(vector_db=vector_db)

                # Convert UUID to string in filters
                filters = {"agent_id": [str(self.agent_id)]}
                if self.source:
                    filters["name"] = self.source
                logger.debug(f"Search filters: {filters}")

                # Ask for enough rows that, after skipping what this turn has
                # already shown, a full set of new ones remains.
                limit = settings.KNOWLEDGE_SEARCH_RESULTS
                documents = self.agent_knowledge.search(
                    query=query,
                    num_documents=limit + len(self.seen_chunk_ids),
                    filters=filters
                )
                logger.debug(f"Documents: {documents}")

                hits = [
                    _Hit(
                        getattr(doc, "id", None) or f"{doc.name}#{position}",
                        doc.content,
                        getattr(doc, "meta_data", None) or {},
                        doc.name or "Untitled",
                    )
                    for position, doc in enumerate(documents)
                    if doc.content
                ]
                fresh = [hit for hit in hits if hit.id not in self.seen_chunk_ids][:limit]
                if not fresh:
                    return NO_FURTHER_RESULTS if hits else NO_RESULTS

                hits_by_id = {hit.id: hit for hit in fresh}
                neighbours, heads = self._page_context(db, fresh)
                for hit in neighbours:
                    hits_by_id.setdefault(hit.id, hit)

                source_types = {
                    source.source: source.source_type.value.lower() for source in knowledge_sources
                }
                rendered, shown = self._render(hits_by_id.values(), heads, source_types)
                # Only what the model actually received counts as seen or as a
                # citation; a page dropped by the size cap stays searchable.
                self.seen_chunk_ids.update(hit.id for hit in shown)
                self._record_sources(shown, source_types)
                return rendered

        except Exception as e:
            logger.error(f"Error searching knowledge base: {str(e)}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return "Error searching knowledge base."

    def _page_context(self, db, hits: List[_Hit]) -> Tuple[List[_Hit], Dict[str, _Hit]]:
        """Context for each hit on a chunked page, fetched in one query.

        Neighbours — the chunk before and after a hit — so a fact split by a
        chunk boundary (a pricing table, a numbered procedure) arrives whole.

        Heads — the page's first chunk, keyed by page id — which is where a
        page says what it is: a product's name and price, a plan's headline
        terms. A query that matches the description further down (or is
        phrased in another language than the page) would otherwise come back
        without them. Heads are optional: ``_render`` adds them only where
        they fit after every matched page has its place.

        Only chunked pages have context; a single-row page is complete."""
        neighbour_ids: Set[str] = set()
        head_ids: Set[str] = set()
        for hit in hits:
            if not hit.is_chunked:
                continue
            for index in (hit.chunk - 1, hit.chunk + 1):
                if 1 <= index <= hit.chunk_count:
                    neighbour_ids.add(chunk_id(hit.page_id, index))
            head_ids.add(chunk_id(hit.page_id, 1))
        known = self.seen_chunk_ids | {hit.id for hit in hits}
        neighbour_ids -= known
        head_ids -= known | neighbour_ids
        wanted = neighbour_ids | head_ids
        if not wanted:
            return [], {}

        rows = db.execute(
            text(
                f'SELECT id, name, content, meta_data FROM {self._schema}."{self._table}" '
                "WHERE id = ANY(:ids)"
            ),
            {"ids": list(wanted)},
        ).fetchall()
        fetched = [_Hit(row.id, row.content, row.meta_data or {}, row.name or "Untitled") for row in rows]
        neighbours = [hit for hit in fetched if hit.id in neighbour_ids]
        heads = {hit.page_id: hit for hit in fetched if hit.id in head_ids}
        return neighbours, heads

    def _record_sources(self, hits: Iterable[_Hit], source_types: Dict[str, str]) -> None:
        # Record structured citations (deduped by name+type) so the chat agent
        # can surface them to the widget.
        seen = {(s['name'], s['type']) for s in self.collected_sources}
        for hit in hits:
            key = (hit.name, source_types.get(hit.name, 'unknown'))
            if key not in seen:
                seen.add(key)
                self.collected_sources.append({'name': key[0], 'type': key[1]})

    def _render(
        self, hits: Iterable[_Hit], heads: Dict[str, _Hit], source_types: Dict[str, str]
    ) -> Tuple[str, List[_Hit]]:
        """Group chunks by page, in page order, under one header per page.

        Pages with matches are placed first and dropped whole once the result
        would exceed the size cap — a page is never cut mid-chunk, and the cap
        keeps one search from crowding out the rest of the conversation. Page
        heads go in afterwards, only into pages that made it and only while
        they still fit, so a head never displaces a page that matched.
        Returns the text and the hits it contains."""
        cap = settings.KNOWLEDGE_SEARCH_MAX_CHARS
        pages: Dict[str, List[_Hit]] = {}
        for hit in hits:
            pages.setdefault(hit.page_id, []).append(hit)

        placed: List[List[_Hit]] = []
        total = 0
        for page_hits in pages.values():
            size = len(_page_block(page_hits, source_types)) + len(_PAGE_SEPARATOR)
            if placed and total + size > cap:
                break
            placed.append(page_hits)
            total += size

        for page_hits in placed:
            head = heads.get(page_hits[0].page_id)
            if head is None:
                continue
            size = len(_chunk_text(head)) + len(_CHUNK_SEPARATOR)
            if total + size <= cap:
                page_hits.append(head)
                total += size

        blocks = [_page_block(page_hits, source_types) for page_hits in placed]
        shown = [hit for page_hits in placed for hit in page_hits]
        return _PAGE_SEPARATOR.join(blocks), shown


_PAGE_SEPARATOR = "\n\n"
_CHUNK_SEPARATOR = "\n"


def _chunk_text(hit: _Hit) -> str:
    label = f"(part {hit.chunk}/{hit.chunk_count}) " if hit.is_chunked else ""
    return f"{label}{_hit_text(hit)}"


def _page_block(page_hits: List[_Hit], source_types: Dict[str, str]) -> str:
    """One page as the model sees it: a source header, then its chunks in
    page order."""
    page_hits.sort(key=lambda h: h.chunk or 0)
    first = page_hits[0]
    header = f"[{source_types.get(first.name, 'unknown').upper()} - {first.name}"
    if first.url and first.url != first.name:
        header += f" | {first.url}"
    header += "]"
    return header + " " + _CHUNK_SEPARATOR.join(_chunk_text(hit) for hit in page_hits)


# A row this much bigger than a chunk was stored before pages were chunked and
# has not been re-indexed yet (scripts/rechunk_knowledge.py). It is a data
# defect, not knowledge to protect: one such row can be 100k+ chars.
OVERSIZED_ROW_FACTOR = 4
OVERSIZED_ROW_NOTE = "\n(page continues — not yet re-indexed in full)"


def _hit_text(hit: _Hit) -> str:
    limit = settings.KNOWLEDGE_CHUNK_SIZE * OVERSIZED_ROW_FACTOR
    if len(hit.content) <= limit:
        return hit.content
    kept: List[str] = []
    total = 0
    for piece in split_text(hit.content, settings.KNOWLEDGE_CHUNK_SIZE):
        if total + len(piece) > limit:
            break
        kept.append(piece)
        total += len(piece)
    return "".join(kept) + OVERSIZED_ROW_NOTE

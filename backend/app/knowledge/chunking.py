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

Splitting a knowledge page into embedder-sized chunks.

The search embedder only reads ~512 tokens, so a page stored as one row is
searchable by its first screen only, and a single hit can be tens of thousands
of chars — enough to overflow the model's context when a few are replayed. Each
page is therefore stored as several small rows that together hold every byte of
it.

Stored chunks are disjoint verbatim slices: concatenating a page's chunks gives
the page back exactly, which is what the dashboard, the FAQ generator and page
edits all rely on. Context across a boundary is handled at embedding time (the
tail of the previous chunk is prepended to the text that is embedded, never to
the text that is stored) and at search time (neighbouring chunks are returned
with a hit).

Why not agno's chunkers: ``ChunkingStrategy.clean_text`` collapses whitespace,
which flattens tables, lists and headings into one line and would persist that
way; ``MarkdownChunking`` needs the ``unstructured`` package.

Chunk ids are ``<page_id>::<n>`` (1-based). The ``_<n>`` form agno uses for PDFs
is kept readable by the page-grouping helpers, but it is not used for new chunks
because real page URLs end in ``_<n>`` too (``/blog/post_2``) and an upsert on
such an id would silently overwrite another page.
"""

import re
from dataclasses import dataclass
from typing import List, Optional

from agno.document import Document
from agno.document.chunking.strategy import ChunkingStrategy
from agno.embedder import Embedder

from app.core.config import settings

CHUNK_ID_SEPARATOR = "::"
# Legacy agno PDF chunk suffix. Stripped when grouping, never generated.
_LEGACY_CHUNK_ID_RE = re.compile(r"_\d+$")
_CHUNK_ID_RE = re.compile(re.escape(CHUNK_ID_SEPARATOR) + r"\d+$")

# Break preference, best first. A chunk ends just after the chosen separator so
# the separator itself is never lost.
_BREAKS = ("\n\n", "\n", ". ", " ")
# Don't take a break that would leave a chunk under this share of the target
# size; a hard cut at full size is better than a 40-char chunk.
_MIN_FILL = 0.3
_TITLE_MAX_CHARS = 120
# Metadata that describes a row's place in its page. Set by chunk_page; must be
# dropped before a page's content is re-chunked.
CHUNK_META_KEYS = frozenset({"page_id", "chunk", "chunk_count", "chunk_size"})


def page_id_of(chunk_id: str) -> str:
    """Map a chunk id back to its page id. Mirrors ``PAGE_ID_EXPR`` in SQL and
    ``basePageId`` in the frontend — keep the three in sync."""
    stripped = _CHUNK_ID_RE.sub("", chunk_id)
    if stripped != chunk_id:
        return stripped
    return _LEGACY_CHUNK_ID_RE.sub("", chunk_id)


def chunk_id(page_id: str, index: int) -> str:
    return f"{page_id}{CHUNK_ID_SEPARATOR}{index}"


def split_text(text: str, size: Optional[int] = None) -> List[str]:
    """Split ``text`` into consecutive pieces of at most ``size`` chars,
    preferring to break on paragraph, line, sentence then word boundaries.
    The pieces are disjoint verbatim slices: ``"".join(pieces) == text``."""
    size = settings.KNOWLEDGE_CHUNK_SIZE if size is None else size
    if size <= 0:
        raise ValueError("chunk size must be positive")

    pieces: List[str] = []
    start = 0
    length = len(text)
    while start < length:
        if length - start <= size:
            pieces.append(text[start:])
            break
        end = _break_point(text, start, size)
        pieces.append(text[start:end])
        start = end
    return pieces


def _break_point(text: str, start: int, size: int) -> int:
    """End of the piece starting at ``start``: just after the best separator in
    the window, else a hard cut at ``size``. Always past ``start``."""
    window = text[start:start + size]
    floor = int(size * _MIN_FILL)
    for sep in _BREAKS:
        idx = window.rfind(sep)
        if idx >= floor:
            return start + idx + len(sep)
    return start + size


@dataclass
class ChunkDocument(Document):
    """A chunk whose embedding is computed from more than its stored text: the
    page title and the tail of the previous chunk are prepended, so a mid-page
    chunk about pricing still matches "pricing" queries that only name the
    page, and a sentence cut by the boundary is embedded whole on one side."""

    embedding_text: Optional[str] = None

    def embed(self, embedder: Optional[Embedder] = None) -> None:
        _embedder = embedder or self.embedder
        if _embedder is None:
            raise ValueError("No embedder provided")
        self.embedding, self.usage = _embedder.get_embedding_and_usage(
            self.embedding_text or self.content
        )


def given_title(document: Document) -> Optional[str]:
    """The title the source recorded for the page, if any."""
    title = (document.meta_data or {}).get("title")
    if isinstance(title, str) and title.strip():
        return title.strip()[:_TITLE_MAX_CHARS]
    return None


def page_title(document: Document) -> str:
    """What to call the page when embedding: its recorded title, else its first
    non-empty line. The fallback is for the embedding only — it is never stored
    as the page's title, since a crawled first line is as likely to be a cookie
    banner as a heading."""
    title = given_title(document)
    if title:
        return title
    for line in (document.content or "").splitlines():
        if line.strip():
            return line.strip()[:_TITLE_MAX_CHARS]
    return document.id or ""


def needs_explicit_chunk_id(page_id: Optional[str]) -> bool:
    """A page id that ends in ``_<n>`` reads as a legacy chunk suffix to the
    grouping rule, which would file ``/blog/post_2`` under ``/blog/post`` and
    let an edit of the sibling delete it. Such pages get a ``::1`` id even
    when they fit in one chunk."""
    return bool(page_id) and bool(_LEGACY_CHUNK_ID_RE.search(page_id))


def chunk_page(
    document: Document,
    size: Optional[int] = None,
    overlap: Optional[int] = None,
) -> List[Document]:
    """Split one page into chunk documents. A page that fits in one chunk is
    returned unchanged (same id, same metadata), so small pages are stored
    exactly as before. ``overlap`` is how much of the previous chunk is
    embedded with each chunk; it never changes what is stored."""
    size = settings.KNOWLEDGE_CHUNK_SIZE if size is None else size
    overlap = settings.KNOWLEDGE_CHUNK_OVERLAP if overlap is None else overlap
    content = document.content or ""
    if len(content) <= size and not needs_explicit_chunk_id(document.id):
        return [document]

    pieces = split_text(content, size)
    title = page_title(document)
    page_id = document.id
    base_meta = {k: v for k, v in (document.meta_data or {}).items() if k not in CHUNK_META_KEYS}
    recorded_title = given_title(document)
    if recorded_title:
        base_meta["title"] = recorded_title
    chunks: List[Document] = []
    previous = ""
    for index, piece in enumerate(pieces, start=1):
        meta = {
            **base_meta,
            "page_id": page_id,
            "chunk": index,
            "chunk_count": len(pieces),
            "chunk_size": len(piece),
        }
        context = previous[-overlap:] if overlap > 0 else ""
        chunks.append(
            ChunkDocument(
                id=chunk_id(page_id, index),
                name=document.name,
                content=piece,
                meta_data=meta,
                embedder=document.embedder,
                embedding_text=f"{title}\n{context}{piece}",
            )
        )
        previous = piece
    return chunks


class PageChunking(ChunkingStrategy):
    """agno ``ChunkingStrategy`` adapter so the PDF readers chunk the same way
    as the website crawler."""

    def __init__(self, size: Optional[int] = None, overlap: Optional[int] = None):
        self.size = size
        self.overlap = overlap

    def chunk(self, document: Document) -> List[Document]:
        return chunk_page(document, self.size, self.overlap)

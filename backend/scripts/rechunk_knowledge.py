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

Re-chunk knowledge rows that were stored as whole pages.

Before app.knowledge.chunking, a crawled page was one vector row however long
it was. Such rows are only searchable by their first screen and, when hit, can
push a conversation past the model's context window. This splits every
oversized row into chunks from the content already in the database — nothing is
re-crawled, so nothing is metered.

Each row is replaced in one transaction (insert chunks, delete original), with
the embeddings computed beforehand, so a failure leaves the original row
untouched. The script is resumable: rows already within the chunk size are
skipped. Legacy PDF chunks (agno's ``<doc>_<page>`` rows, at most 5000 chars)
are left alone: re-splitting them would regroup a PDF's pages in the dashboard,
and they are far too small to overflow a conversation.

It also fixes a grouping defect for small website pages whose URL ends in
``_<n>`` (``/blog/post_2``): the page-grouping rule reads that as a chunk
suffix and files the row under ``/blog/post``, so editing the sibling deletes
it. Such rows are renamed to ``<url>::1`` (see app.knowledge.chunking).

Run it in the knowledge_processor container (it loads the embedding model),
never in the backend container:

    python -m scripts.rechunk_knowledge --dry-run
    python -m scripts.rechunk_knowledge --org <organization uuid>
    python -m scripts.rechunk_knowledge
"""

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Sequence

from agno.document import Document
from agno.embedder import Embedder
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Connection

from app.core.config import settings
from app.knowledge.chunking import chunk_id, chunk_page
from app.knowledge.embedder import get_embedder

VECTOR_SCHEMA = "ai"
VECTOR_TABLE_PREFIX = "d_"
_LEGACY_SUFFIX_RE = re.compile(r"_\d+$")


@dataclass
class TableReport:
    table: str
    rows: int = 0
    chunks: int = 0
    skipped: int = 0
    legacy_pdf: int = 0
    renamed: int = 0
    failed: int = 0
    collisions: List[str] = field(default_factory=list)


def vector_tables(conn: Connection, org_id: Optional[str]) -> List[str]:
    if org_id:
        return [f"{VECTOR_TABLE_PREFIX}{org_id}"]
    rows = conn.execute(
        text(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema = :schema AND table_name LIKE :prefix ORDER BY table_name"
        ),
        {"schema": VECTOR_SCHEMA, "prefix": VECTOR_TABLE_PREFIX.replace("_", r"\_") + "%"},
    ).fetchall()
    return [row.table_name for row in rows]


def oversized_rows(conn: Connection, table: str, size: int) -> Sequence[Any]:
    return conn.execute(
        text(
            f'SELECT id, name, content, meta_data, filters FROM {VECTOR_SCHEMA}."{table}" '
            "WHERE length(content) > :size ORDER BY id"
        ),
        {"size": size},
    ).fetchall()


def existing_ids(conn: Connection, table: str, ids: List[str]) -> List[str]:
    rows = conn.execute(
        text(f'SELECT id FROM {VECTOR_SCHEMA}."{table}" WHERE id = ANY(:ids)'), {"ids": ids}
    ).fetchall()
    return [row.id for row in rows]


def is_legacy_pdf_chunk(row: Any) -> bool:
    """agno's PDF reader ids rows ``<doc>_<page>`` and records ``page`` in
    meta_data; a website row records ``url`` instead."""
    return bool(_LEGACY_SUFFIX_RE.search(row.id)) and "page" in (row.meta_data or {})


def plan_chunks(row: Any, size: int) -> List[Document]:
    page = Document(id=row.id, name=row.name, content=row.content, meta_data=dict(row.meta_data or {}))
    return chunk_page(page, size)


def replace_row(conn: Connection, table: str, row: Any, chunks: List[Document]) -> None:
    """Insert the chunks and delete the original row in one transaction.

    Commit-as-you-go: the SELECTs before this call already opened the
    connection's transaction, so ``conn.begin()`` would raise; committing here
    closes that transaction with both statements inside it.
    """
    records = [
        {
            "id": chunk.id,
            "name": chunk.name,
            "meta_data": chunk.meta_data,
            "filters": row.filters,
            "content": chunk.content,
            "embedding": chunk.embedding,
            "usage": chunk.usage,
        }
        for chunk in chunks
    ]
    try:
        conn.execute(
            text(
                f'INSERT INTO {VECTOR_SCHEMA}."{table}" '
                "(id, name, meta_data, filters, content, embedding, usage, content_hash) VALUES "
                "(:id, :name, CAST(:meta_data AS jsonb), CAST(:filters AS jsonb), :content, "
                "CAST(:embedding AS vector), CAST(:usage AS jsonb), md5(:content))"
            ),
            [_jsonable(record) for record in records],
        )
        conn.execute(
            text(f'DELETE FROM {VECTOR_SCHEMA}."{table}" WHERE id = :id'), {"id": row.id}
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise


def _jsonable(record: Dict[str, Any]) -> Dict[str, Any]:
    out = dict(record)
    for key in ("meta_data", "filters", "usage"):
        out[key] = json.dumps(out[key]) if out[key] is not None else None
    out["embedding"] = str(out["embedding"]) if out["embedding"] is not None else None
    return out


def process_table(
    conn: Connection, table: str, embedder: Optional[Embedder], size: int, dry_run: bool
) -> TableReport:
    report = TableReport(table=table)
    for row in oversized_rows(conn, table, size):
        if is_legacy_pdf_chunk(row):
            report.legacy_pdf += 1
            continue
        chunks = plan_chunks(row, size)
        if len(chunks) < 2:
            report.skipped += 1
            continue
        report.rows += 1
        report.chunks += len(chunks)
        taken = existing_ids(conn, table, [chunk.id for chunk in chunks])
        if taken:
            report.collisions.extend(taken)
            report.failed += 1
            continue
        if dry_run:
            continue
        try:
            for chunk in chunks:
                chunk.embed(embedder=embedder)
            replace_row(conn, table, row, chunks)
            print(f"  {row.id}: {len(row.content)} chars -> {len(chunks)} chunks")
        except Exception as exc:  # keep going; the original row is still there
            report.failed += 1
            print(f"  FAILED {row.id}: {exc}", file=sys.stderr)
    return report


def legacy_suffixed_pages(conn: Connection, table: str, size: int) -> Sequence[Any]:
    """Single-row website pages whose URL happens to end in ``_<n>``."""
    return conn.execute(
        text(
            f'SELECT id, meta_data FROM {VECTOR_SCHEMA}."{table}" '
            "WHERE length(content) <= :size AND id ~ '_[0-9]+$' "
            "AND meta_data ? 'url' AND NOT (meta_data ? 'page') ORDER BY id"
        ),
        {"size": size},
    ).fetchall()


def rename_legacy_suffixed_pages(conn: Connection, table: str, size: int, dry_run: bool) -> int:
    """Give each such row the explicit ``::1`` id so the grouping rule reads
    it as its own page. Returns how many rows were (or would be) renamed."""
    rows = legacy_suffixed_pages(conn, table, size)
    for row in rows:
        new_id = chunk_id(row.id, 1)
        meta = {**(row.meta_data or {}), "page_id": row.id, "chunk": 1, "chunk_count": 1}
        if dry_run:
            print(f"  would rename {row.id} -> {new_id}")
            continue
        try:
            conn.execute(
                text(
                    f'UPDATE {VECTOR_SCHEMA}."{table}" '
                    "SET id = :new_id, meta_data = CAST(:meta AS jsonb) WHERE id = :old_id"
                ),
                {"new_id": new_id, "meta": json.dumps(meta), "old_id": row.id},
            )
            conn.commit()
            print(f"  renamed {row.id} -> {new_id}")
        except Exception as exc:
            conn.rollback()
            print(f"  FAILED rename {row.id}: {exc}", file=sys.stderr)
    return len(rows)


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dry-run", action="store_true", help="report what would change; write nothing")
    parser.add_argument("--org", help="only this organization's table")
    parser.add_argument("--size", type=int, default=settings.KNOWLEDGE_CHUNK_SIZE, help="chunk size in chars")
    args = parser.parse_args(argv)

    engine = create_engine(settings.DATABASE_URL)
    embedder = None if args.dry_run else get_embedder()
    reports: List[TableReport] = []
    with engine.connect() as conn:
        for table in vector_tables(conn, args.org):
            print(f"{table}:")
            report = process_table(conn, table, embedder, args.size, args.dry_run)
            report.renamed = rename_legacy_suffixed_pages(conn, table, args.size, args.dry_run)
            reports.append(report)

    total_rows = sum(r.rows for r in reports)
    total_chunks = sum(r.chunks for r in reports)
    total_failed = sum(r.failed for r in reports)
    total_renamed = sum(r.renamed for r in reports)
    total_pdf = sum(r.legacy_pdf for r in reports)
    collisions = [c for r in reports for c in r.collisions]
    verb = "would split" if args.dry_run else "split"
    print(
        f"\n{verb} {total_rows} rows into {total_chunks} chunks across {len(reports)} tables; "
        f"{total_renamed} legacy-suffixed pages renamed; {total_pdf} PDF chunks left as-is; "
        f"{total_failed} failed"
    )
    if collisions:
        print("planned chunk ids that already exist (rows left untouched):", file=sys.stderr)
        for cid in collisions:
            print(f"  {cid}", file=sys.stderr)
    return 1 if total_failed else 0


if __name__ == "__main__":
    sys.exit(main())

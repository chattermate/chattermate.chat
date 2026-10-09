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

Search over chunked pages: neighbour expansion, page grouping, the size cap
and "a repeat search returns what has not been shown yet".
"""

from types import SimpleNamespace
from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest
from agno.document import Document

from app.models.knowledge import SourceType
from app.tools.knowledge_search_byagent import NO_FURTHER_RESULTS, KnowledgeSearchByAgent

PAGE = "https://x.com/pricing"


def _chunk(page: str, n: int, count: int, text: str) -> Document:
    return Document(
        id=f"{page}::{n}",
        name="https://x.com",
        content=text,
        meta_data={"url": page, "page_id": page, "chunk": n, "chunk_count": count},
    )


def _row(doc: Document):
    return SimpleNamespace(id=doc.id, name=doc.name, content=doc.content, meta_data=doc.meta_data)


@pytest.fixture
def tool():
    source = MagicMock()
    source.source = "https://x.com"
    source.source_type = SourceType.WEBSITE
    source.table_name = "d_org"
    source.schema = "ai"
    with patch("app.tools.knowledge_search_byagent.SessionLocal") as session_local, \
         patch("app.tools.knowledge_search_byagent.KnowledgeRepository") as repo_class:
        db = MagicMock()
        session_local.return_value.__enter__.return_value = db
        repo_class.return_value.get_by_agent.return_value = [source]
        tool = KnowledgeSearchByAgent(agent_id=str(uuid4()), org_id=uuid4())
        tool.agent_knowledge = MagicMock()
        tool._db = db
        yield tool


def test_hit_comes_with_page_head_and_neighbours_grouped_and_ordered(tool):
    hit = _chunk(PAGE, 4, 6, "part four")
    tool.agent_knowledge.search.return_value = [hit]
    tool._db.execute.return_value.fetchall.return_value = [
        _row(_chunk(PAGE, 5, 6, "part five")),
        _row(_chunk(PAGE, 1, 6, "Thermofit gloves 39,90 EUR")),
        _row(_chunk(PAGE, 3, 6, "part three")),
    ]

    result = tool.search_knowledge_base("pricing")

    assert result.startswith(f"[WEBSITE - https://x.com | {PAGE}] ")
    order = ["(part 1/6) Thermofit", "(part 3/6) part three", "(part 4/6) part four", "(part 5/6) part five"]
    positions = [result.index(p) for p in order]
    assert positions == sorted(positions)
    ids = tool._db.execute.call_args.args[1]["ids"]
    assert sorted(ids) == [f"{PAGE}::1", f"{PAGE}::3", f"{PAGE}::5"]
    assert tool.seen_chunk_ids == {f"{PAGE}::1", f"{PAGE}::3", f"{PAGE}::4", f"{PAGE}::5"}
    assert tool.collected_sources == [{"name": "https://x.com", "type": "website"}]


def test_page_head_never_displaces_a_matched_page(tool, monkeypatch):
    """Heads are added last and only where they fit: a page that matched the
    query must not be dropped by the cap to make room for another page's head."""
    a, b = "https://x.com/a", "https://x.com/b"
    tool.agent_knowledge.search.return_value = [_chunk(a, 3, 3, "a" * 60), _chunk(b, 3, 3, "b" * 60)]
    tool._db.execute.return_value.fetchall.return_value = [
        _row(_chunk(a, 1, 3, "HEAD-A " + "h" * 60)),
        _row(_chunk(b, 1, 3, "HEAD-B " + "h" * 60)),
    ]
    one_page = len(f"[WEBSITE - https://x.com | {a}] (part 3/3) " + "a" * 60) + 2
    monkeypatch.setattr("app.tools.knowledge_search_byagent.settings.KNOWLEDGE_SEARCH_MAX_CHARS", 2 * one_page + 10)

    result = tool.search_knowledge_base("q")

    assert "a" * 60 in result and "b" * 60 in result  # both matched pages kept
    assert "HEAD-A" not in result and "HEAD-B" not in result  # no room left for heads
    assert f"{a}::1" not in tool.seen_chunk_ids  # unshown head stays searchable


def test_page_head_added_when_it_fits(tool):
    tool.agent_knowledge.search.return_value = [_chunk(PAGE, 5, 5, "tail")]
    tool._db.execute.return_value.fetchall.return_value = [
        _row(_chunk(PAGE, 4, 5, "four")),
        _row(_chunk(PAGE, 1, 5, "Thermofit gloves 39,90 EUR")),
    ]

    result = tool.search_knowledge_base("Wie viel kosten die Handschuhe?")

    assert result.index("39,90 EUR") < result.index("four") < result.index("tail")


def test_page_head_is_not_fetched_twice(tool):
    """A hit on chunk 2 already asks for chunk 1 as its neighbour; a hit on
    chunk 1 needs no head lookup at all."""
    tool.agent_knowledge.search.return_value = [_chunk(PAGE, 2, 4, "two"), _chunk(PAGE, 1, 4, "one")]
    tool._db.execute.return_value.fetchall.return_value = [_row(_chunk(PAGE, 3, 4, "three"))]

    tool.search_knowledge_base("q")

    ids = tool._db.execute.call_args.args[1]["ids"]
    assert sorted(ids) == [f"{PAGE}::3"]


def test_unchunked_row_has_no_neighbour_lookup(tool):
    legacy = Document(id="https://x.com/about", name="https://x.com", content="About us",
                      meta_data={"url": "https://x.com/about", "chunk": 7})
    tool.agent_knowledge.search.return_value = [legacy]

    result = tool.search_knowledge_base("about")

    assert result == "[WEBSITE - https://x.com | https://x.com/about] About us"
    tool._db.execute.assert_not_called()


def test_repeat_search_returns_unseen_chunks_then_exhausts(tool):
    first, second = _chunk(PAGE, 1, 2, "one"), _chunk("https://x.com/faq", 1, 1, "faq")
    tool.agent_knowledge.search.return_value = [first]
    tool._db.execute.return_value.fetchall.return_value = []
    tool.search_knowledge_base("q")

    tool.agent_knowledge.search.return_value = [first, second]
    result = tool.search_knowledge_base("q again")
    assert "faq" in result and "one" not in result
    assert tool.agent_knowledge.search.call_args.kwargs["num_documents"] > 1

    tool.agent_knowledge.search.return_value = [first, second]
    assert tool.search_knowledge_base("q once more") == NO_FURTHER_RESULTS


def test_reset_turn_forgets_seen_and_sources(tool):
    tool.seen_chunk_ids = {"a"}
    tool.collected_sources = [{"name": "n", "type": "t"}]
    tool.reset_turn()
    assert tool.seen_chunk_ids == set() and tool.collected_sources == []


def test_result_cap_drops_whole_pages_never_cuts_a_chunk(tool, monkeypatch):
    monkeypatch.setattr("app.tools.knowledge_search_byagent.settings.KNOWLEDGE_SEARCH_MAX_CHARS", 120)
    pages = [_chunk(f"https://x.com/p{i}", 1, 1, "x" * 80) for i in range(4)]
    tool.agent_knowledge.search.return_value = pages
    tool._db.execute.return_value.fetchall.return_value = []

    result = tool.search_knowledge_base("q")

    assert result.count("[WEBSITE") == 1
    assert result.endswith("x" * 80)
    # Dropped pages were never shown: not seen, not cited, still searchable.
    assert tool.seen_chunk_ids == {"https://x.com/p0::1"}
    tool.agent_knowledge.search.return_value = pages
    assert "p1" in tool.search_knowledge_base("q again")


def test_not_yet_rechunked_whole_page_row_is_bounded(tool, monkeypatch):
    monkeypatch.setattr("app.tools.knowledge_search_byagent.settings.KNOWLEDGE_CHUNK_SIZE", 100)
    legacy = Document(id="https://x.com/huge", name="https://x.com",
                      content=("sentence. " * 10 + "\n") * 200, meta_data={"url": "https://x.com/huge"})
    tool.agent_knowledge.search.return_value = [legacy]

    result = tool.search_knowledge_base("q")

    assert len(result) < 600
    assert result.endswith("(page continues — not yet re-indexed in full)")
    assert "sentence. " in result

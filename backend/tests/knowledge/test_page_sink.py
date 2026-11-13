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

from unittest.mock import MagicMock

import pytest
from agno.document import Document

from app.knowledge.deadline import Deadline
from app.knowledge.page_sink import PageSink

SITE = "https://shop.example"
FILTERS = {"name": SITE, "agent_id": [], "org_id": "org-1"}


def page(url, chunks=1, embedded=True):
    docs = []
    for n in range(1, chunks + 1):
        doc = Document(id=f"{url}::{n}" if chunks > 1 else url, name=SITE, content=f"text {n}")
        doc.embedding = [0.1, 0.2] if embedded else None
        docs.append(doc)
    return docs


class Embedder:
    def __init__(self, fail=False):
        self.fail = fail

    def get_embedding_and_usage(self, text):
        if self.fail:
            raise RuntimeError("model unavailable")
        return [0.3, 0.4], None


@pytest.fixture
def vector_db():
    db = MagicMock()
    db.embedder = Embedder()
    return db


@pytest.fixture
def learning():
    hooks = MagicMock()
    hooks.first_page.return_value = ["agent-1"]
    hooks.removed.return_value = False
    return hooks


@pytest.fixture
def deadline():
    return Deadline(3600)


def test_each_page_is_written_on_its_own(vector_db, deadline):
    sink = PageSink(vector_db, FILTERS, deadline)

    assert sink.store(page(f"{SITE}/a", chunks=3))
    assert sink.store(page(f"{SITE}/b"))

    assert vector_db.upsert_page.call_count == 2
    assert (sink.stored_pages, sink.stored_documents) == (2, 4)


def test_unembedded_chunks_are_embedded_before_they_are_written(vector_db, deadline):
    sink = PageSink(vector_db, FILTERS, deadline)

    sink.store(page(f"{SITE}/a", embedded=False))

    written = vector_db.upsert_page.call_args.args[0]
    assert written[0].embedding == [0.3, 0.4]


def test_a_page_that_cannot_be_embedded_is_not_counted(vector_db, deadline):
    vector_db.embedder = Embedder(fail=True)
    sink = PageSink(vector_db, FILTERS, deadline)

    assert not sink.store(page(f"{SITE}/a", embedded=False))

    vector_db.upsert_page.assert_not_called()
    assert sink.stored_pages == 0


def test_a_page_the_store_refused_is_not_counted(vector_db, deadline, learning):
    """Stored means searchable: a failed write is not progress."""
    vector_db.upsert_page.side_effect = RuntimeError("connection reset")
    sink = PageSink(vector_db, FILTERS, deadline, learning)

    assert not sink.store(page(f"{SITE}/a"))

    assert sink.stored_pages == 0
    learning.first_page.assert_not_called()
    learning.page_stored.assert_not_called()


def test_the_first_page_makes_the_source_and_files_the_rest_under_its_agents(vector_db, deadline, learning):
    sink = PageSink(vector_db, FILTERS, deadline, learning)

    sink.store(page(f"{SITE}/a"))
    sink.store(page(f"{SITE}/b"))

    learning.first_page.assert_called_once()
    assert learning.page_stored.call_count == 2
    first_filters = vector_db.upsert_page.call_args_list[0].args[1]
    later_filters = vector_db.upsert_page.call_args_list[1].args[1]
    assert first_filters["agent_id"] == []
    assert later_filters["agent_id"] == ["agent-1"]


def test_a_failed_source_setup_is_tried_again_and_the_page_still_counts(vector_db, deadline, learning):
    learning.first_page.side_effect = [RuntimeError("db busy"), ["agent-1"]]
    sink = PageSink(vector_db, FILTERS, deadline, learning)

    assert sink.store(page(f"{SITE}/a"))
    assert sink.store(page(f"{SITE}/b"))

    assert learning.first_page.call_count == 2
    assert learning.page_stored.call_count == 2


def test_a_source_deleted_mid_crawl_stops_it(vector_db, deadline, learning):
    sink = PageSink(vector_db, FILTERS, deadline, learning)
    sink.store(page(f"{SITE}/a"))
    learning.removed.return_value = True

    assert not sink.store(page(f"{SITE}/b"))

    assert sink.removed
    assert deadline.expired
    assert vector_db.upsert_page.call_count == 1


def test_not_knowing_whether_it_was_deleted_keeps_reading(vector_db, deadline, learning):
    sink = PageSink(vector_db, FILTERS, deadline, learning)
    sink.store(page(f"{SITE}/a"))
    learning.removed.side_effect = RuntimeError("db busy")

    assert sink.store(page(f"{SITE}/b"))
    assert not sink.removed


def test_nothing_is_written_past_the_deadline(vector_db, deadline):
    sink = PageSink(vector_db, FILTERS, deadline)
    deadline.cancel()

    assert not sink.store(page(f"{SITE}/a"))
    vector_db.upsert_page.assert_not_called()


def test_an_empty_page_is_ignored(vector_db, deadline):
    sink = PageSink(vector_db, FILTERS, deadline)

    assert not sink.store([])
    vector_db.upsert_page.assert_not_called()

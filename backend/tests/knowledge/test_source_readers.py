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

Sources an extension reads: the registry, and the knowledge manager storing
what a reader yields page by page.
"""

from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest
from agno.document import Document

from app.knowledge import source_readers
from app.knowledge.deadline import SourceTimedOut
from app.knowledge.failure_advice import SourceUnreadable
from app.knowledge.knowledge_base import KnowledgeManager
from app.knowledge.page_sink import SourceRemoved
from app.models.knowledge import SourceType
from app.models.knowledge_queue import QueueStatus

SOURCE = "shopify:shop.example"
QUEUE_TYPE = "test_store"


@pytest.fixture(autouse=True)
def registry(monkeypatch):
    # No installed extension: only what a test registers
    monkeypatch.setattr(source_readers, "load_extensions", lambda: None)
    source_readers.reset()
    yield
    source_readers.reset()


def _page(n: int) -> Document:
    return Document(id=f"{SOURCE}:page:{n}", name=SOURCE, content=f"Page {n} text", embedding=[0.1, 0.2])


def _register(read):
    source_readers.register(QUEUE_TYPE, read, SourceType.API, lambda source: "your test store")


class FakeLearning:
    instances = []

    def __init__(self, *args, source_type=SourceType.WEBSITE, **kwargs):
        self.source_type = source_type
        self.ensured = False
        self.discarded = False
        self.removed_after = None  # pages stored before the source "is deleted"
        self.stored = 0
        FakeLearning.instances.append(self)

    def first_page(self):
        return []

    def page_stored(self):
        self.stored += 1

    def removed(self):
        return self.removed_after is not None and self.stored >= self.removed_after

    def ensure_source(self):
        self.ensured = True
        return []

    def discard(self):
        self.discarded = True


@pytest.fixture
def manager():
    vector_db = MagicMock()
    vector_db.table_name = "d_test"
    vector_db.schema = "ai"
    vector_db.exists.return_value = True
    with patch("app.knowledge.knowledge_base.OptimizedPgVector", return_value=vector_db), \
         patch("app.knowledge.knowledge_base.get_embedder"):
        manager = KnowledgeManager(org_id=uuid4(), agent_id=str(uuid4()))
    FakeLearning.instances = []
    with patch("app.knowledge.knowledge_base.SourceLearning", FakeLearning), \
         patch("app.knowledge.knowledge_base.SessionLocal"), \
         patch("app.knowledge.knowledge_base.KnowledgeQueueRepository") as queue_repo:
        manager.queue_repo = queue_repo.return_value
        yield manager


def _queue_item():
    item = MagicMock()
    item.id = 7
    item.source_type = QUEUE_TYPE
    item.source = SOURCE
    item.queue_metadata = {}
    return item


class TestTheRegistry:
    def test_a_registered_reader_is_found(self):
        async def read(item):
            yield _page(1)

        _register(read)

        found = source_readers.reader_for(QUEUE_TYPE)
        assert found.read is read
        assert found.knowledge_type == SourceType.API
        assert found.label(SOURCE) == "your test store"

    def test_an_unknown_type_has_no_reader(self):
        assert source_readers.reader_for("website") is None

    def test_looking_one_up_loads_the_installed_extension(self, monkeypatch):
        loaded = MagicMock()
        monkeypatch.setattr(source_readers, "load_extensions", loaded)

        source_readers.reader_for(QUEUE_TYPE)

        loaded.assert_called_once()


class TestLearningFromAReader:
    @pytest.mark.asyncio
    async def test_every_page_is_stored_and_the_source_set_up(self, manager):
        finished = []

        async def read(item):
            yield _page(1)
            yield _page(2)
            finished.append(True)  # runs once every page is stored

        _register(read)

        assert await manager.process_knowledge(_queue_item()) is True

        [learning] = FakeLearning.instances
        assert learning.source_type == SourceType.API
        assert learning.stored == 2
        assert learning.ensured
        assert finished == [True]
        assert manager.vector_db.upsert_page.call_count == 2
        manager.queue_repo.update_status.assert_called_once_with(7, QueueStatus.COMPLETED)

    @pytest.mark.asyncio
    async def test_a_source_read_to_the_end_drops_the_pages_it_no_longer_has(self, manager):
        async def read(item):
            yield _page(1)
            yield _page(2)

        _register(read)

        await manager.process_knowledge(_queue_item())

        manager.vector_db.delete_pages_except.assert_called_once_with(
            SOURCE, f"{SOURCE}:", {_page(1).id, _page(2).id}
        )
        manager.queue_repo.note_stopped_at_time_limit.assert_not_called()

    @pytest.mark.asyncio
    async def test_a_run_cut_by_the_time_limit_keeps_its_pages_and_says_so(self, manager, monkeypatch):
        class RunsOutAfterOnePage:
            """Not expired when the first page is stored; expired right after."""
            checks = 0

            def __init__(self, seconds):
                pass

            def cancel(self):
                pass

            @property
            def expired(self):
                RunsOutAfterOnePage.checks += 1
                return RunsOutAfterOnePage.checks > 1

        monkeypatch.setattr("app.knowledge.knowledge_base.Deadline", RunsOutAfterOnePage)

        async def read(item):
            yield _page(1)
            yield _page(2)

        _register(read)

        await manager.process_knowledge(_queue_item())

        manager.vector_db.delete_pages_except.assert_not_called()
        manager.queue_repo.note_stopped_at_time_limit.assert_called_once_with(7)
        assert manager.vector_db.upsert_page.call_count == 1  # the second page is never read

    @pytest.mark.asyncio
    async def test_a_source_with_nothing_to_read_tells_the_user(self, manager):
        async def read(item):
            return
            yield

        _register(read)

        with pytest.raises(SourceUnreadable, match="your test store"):
            await manager.process_knowledge(_queue_item())
        assert not FakeLearning.instances[0].ensured

    @pytest.mark.asyncio
    async def test_a_time_limit_hit_before_any_page_is_stored_says_so(self, manager, monkeypatch):
        monkeypatch.setattr("app.knowledge.knowledge_base.settings.KB_SOURCE_TIME_LIMIT_SECONDS", 0)

        async def read(item):
            yield _page(1)

        _register(read)

        with pytest.raises(SourceTimedOut, match="took too long"):
            await manager.process_knowledge(_queue_item())

    @pytest.mark.asyncio
    async def test_the_readers_own_advice_reaches_the_user(self, manager):
        async def read(item):
            raise SourceUnreadable("This store is closed.")
            yield

        _register(read)

        with pytest.raises(SourceUnreadable, match="This store is closed."):
            await manager.process_knowledge(_queue_item())

    @pytest.mark.asyncio
    async def test_pages_we_fail_to_store_are_our_error_not_the_users(self, manager):
        manager.vector_db.upsert_page.side_effect = RuntimeError("db down")

        async def read(item):
            yield _page(1)

        _register(read)

        with pytest.raises(RuntimeError, match="could be stored"):
            await manager.process_knowledge(_queue_item())

    @pytest.mark.asyncio
    async def test_deleting_the_source_mid_read_stops_and_cleans_up(self, manager, monkeypatch):
        finished = []

        async def read(item):
            FakeLearning.instances[0].removed_after = 1
            for n in range(1, 5):
                yield _page(n)
            finished.append(True)

        _register(read)

        with pytest.raises(SourceRemoved):
            await manager.process_knowledge(_queue_item())

        [learning] = FakeLearning.instances
        assert learning.discarded
        assert not learning.ensured
        assert finished == []  # the reader's after-step never runs
        assert manager.vector_db.upsert_page.call_count == 1

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

from datetime import datetime, timezone
from unittest.mock import MagicMock
from uuid import uuid4

import pytest
from sqlalchemy import text

from app.knowledge import source_learning
from app.knowledge.source_learning import SourceLearning
from app.models.agent import Agent
from app.models.knowledge import Knowledge, SourceType
from app.models.knowledge_queue import KnowledgeQueue, QueueStatus, STOPPED_AT_TIME_LIMIT
from app.repositories.knowledge import KnowledgeRepository
from app.repositories.knowledge_queue import KnowledgeQueueRepository

SITE = "https://shop.example"
# SQLite stands in for the org's pgvector table: same name, no vector type
VECTOR_SCHEMA = "main"
VECTOR_TABLE = "d_test"


@pytest.fixture
def sessions(db, monkeypatch):
    monkeypatch.setattr(source_learning, "SessionLocal", lambda: db)
    return db


@pytest.fixture
def synced(monkeypatch):
    """The vector-filter rewrite is jsonb SQL; its own tests cover it."""
    sync = MagicMock()
    monkeypatch.setattr(source_learning.knowledge_vector_links, "sync_agent_ids", sync)
    return sync


@pytest.fixture
def vector_rows(db):
    db.execute(text(f'CREATE TABLE {VECTOR_SCHEMA}."{VECTOR_TABLE}" (id TEXT, name TEXT)'))
    db.execute(
        text(f'INSERT INTO {VECTOR_SCHEMA}."{VECTOR_TABLE}" VALUES (:id, :name)'),
        [{"id": f"{SITE}/a", "name": SITE}, {"id": "https://other.example", "name": "https://other.example"}],
    )
    db.commit()
    yield
    db.execute(text(f'DROP TABLE {VECTOR_SCHEMA}."{VECTOR_TABLE}"'))
    db.commit()


def _agent(db, org_id, name="Support") -> Agent:
    agent = Agent(name=name, display_name=name, organization_id=org_id, agent_type="customer_support", instructions=[])
    db.add(agent)
    db.commit()
    return agent


def _run(db, org_id, agent_id=None, status=QueueStatus.PROCESSING, pages=0, source=SITE) -> KnowledgeQueue:
    now = datetime.now(timezone.utc)
    item = KnowledgeQueue(
        organization_id=org_id,
        agent_id=agent_id,
        source_type="website",
        source=source,
        status=status,
        pages_learned=pages,
        created_at=now,
        updated_at=now,
    )
    db.add(item)
    db.commit()
    return item


def _learning(item) -> SourceLearning:
    return SourceLearning(item.id, item.organization_id, item.agent_id, item.source, VECTOR_TABLE, VECTOR_SCHEMA)


def _sources(db, org_id):
    return db.query(Knowledge).filter(Knowledge.organization_id == org_id).all()


class TestTheSourceAppearsWithItsFirstPage:
    def test_it_is_made_linked_and_pointed_at(self, db, sessions, synced, test_organization):
        agent = _agent(db, test_organization.id)
        run = _run(db, test_organization.id, agent.id)

        agent_ids = _learning(run).first_page()

        [source] = _sources(db, test_organization.id)
        assert (source.source, source.source_type) == (SITE, SourceType.WEBSITE)
        assert [link.agent_id for link in source.agent_links] == [agent.id]
        assert agent_ids == [str(agent.id)]
        db.refresh(run)
        assert run.knowledge_id == source.id
        synced.assert_called_once()

    def test_a_source_an_extension_reads_keeps_its_own_type(self, db, sessions, synced, test_organization):
        run = _run(db, test_organization.id, source="shopify:shop.example")

        SourceLearning(
            run.id, run.organization_id, None, run.source, VECTOR_TABLE, VECTOR_SCHEMA,
            source_type=SourceType.API,
        ).first_page()

        [source] = _sources(db, test_organization.id)
        assert (source.source, source.source_type) == ("shopify:shop.example", SourceType.API)

    def test_setting_it_up_again_changes_nothing(self, db, sessions, synced, test_organization):
        agent = _agent(db, test_organization.id)
        learning = _learning(_run(db, test_organization.id, agent.id))

        learning.first_page()
        learning.ensure_source()

        [source] = _sources(db, test_organization.id)
        assert len(source.agent_links) == 1

    def test_reading_a_site_again_reuses_its_source(self, db, sessions, synced, test_organization):
        """Its pages share the source's name in the vector table: two rows
        would be two sources over the same pages, costing two plan slots."""
        first, second = _agent(db, test_organization.id), _agent(db, test_organization.id, "Sales")
        _learning(_run(db, test_organization.id, first.id, QueueStatus.COMPLETED)).ensure_source()

        agent_ids = _learning(_run(db, test_organization.id, second.id)).first_page()

        [source] = _sources(db, test_organization.id)
        assert sorted(agent_ids) == sorted([str(first.id), str(second.id)])
        assert len(source.agent_links) == 2

    def test_a_run_with_no_agent_makes_an_unlinked_source(self, db, sessions, synced, test_organization):
        assert _learning(_run(db, test_organization.id)).first_page() == []
        [source] = _sources(db, test_organization.id)
        assert source.agent_links == []


class TestProgress:
    def test_each_stored_page_is_counted(self, db, sessions, synced, test_organization):
        run = _run(db, test_organization.id)
        learning = _learning(run)

        learning.page_stored()
        learning.page_stored()

        db.refresh(run)
        assert run.pages_learned == 2


class TestASourceDeletedMidCrawl:
    def test_it_is_not_gone_before_it_exists(self, db, sessions, synced, test_organization):
        assert not _learning(_run(db, test_organization.id)).removed()

    def test_it_is_noticed(self, db, sessions, synced, test_organization):
        learning = _learning(_run(db, test_organization.id))
        learning.first_page()
        assert not learning.removed()

        KnowledgeRepository(db).delete_with_data(_sources(db, test_organization.id)[0].id)

        assert learning.removed()

    def test_discarding_drops_its_pages_and_the_run(self, db, sessions, synced, vector_rows, test_organization):
        run = _run(db, test_organization.id)
        run_id = run.id

        _learning(run).discard()

        ids = db.execute(text(f'SELECT id FROM {VECTOR_SCHEMA}."{VECTOR_TABLE}"')).scalars().all()
        assert ids == ["https://other.example"]
        assert db.get(KnowledgeQueue, run_id) is None

    def test_pages_another_source_by_that_name_owns_are_kept(self, db, sessions, synced, vector_rows, test_organization):
        run = _run(db, test_organization.id)
        _learning(_run(db, test_organization.id, status=QueueStatus.COMPLETED)).ensure_source()

        _learning(run).discard()

        count = db.execute(text(f'SELECT count(*) FROM {VECTOR_SCHEMA}."{VECTOR_TABLE}"')).scalar()
        assert count == 2


class TestQueueRepository:
    @pytest.mark.parametrize("status,pages,partial", [
        (QueueStatus.FAILED, 12, True),
        (QueueStatus.FAILED, 0, False),
        (QueueStatus.COMPLETED, 12, False),
    ])
    def test_last_run_left_partial(self, db, test_organization, status, pages, partial):
        _run(db, test_organization.id, status=status, pages=pages)
        current = _run(db, test_organization.id)
        repo = KnowledgeQueueRepository(db)
        assert repo.last_run_left_partial(test_organization.id, SITE, current.id) is partial

    def test_a_run_that_stopped_at_the_time_limit_left_it_partial(self, db, test_organization):
        """It completed with the pages it had; adding it again must read the
        site again, not skip it as already learned."""
        earlier = _run(db, test_organization.id, status=QueueStatus.COMPLETED, pages=400)
        KnowledgeQueueRepository(db).note_stopped_at_time_limit(earlier.id)
        current = _run(db, test_organization.id)
        assert KnowledgeQueueRepository(db).last_run_left_partial(test_organization.id, SITE, current.id)

    def test_only_the_latest_earlier_run_counts(self, db, test_organization):
        _run(db, test_organization.id, status=QueueStatus.FAILED, pages=12)
        _run(db, test_organization.id, status=QueueStatus.COMPLETED, pages=40)
        current = _run(db, test_organization.id)
        assert not KnowledgeQueueRepository(db).last_run_left_partial(test_organization.id, SITE, current.id)

    def test_other_orgs_and_sites_are_ignored(self, db, test_organization):
        _run(db, uuid4(), status=QueueStatus.FAILED, pages=12)
        _run(db, test_organization.id, status=QueueStatus.FAILED, pages=12, source="https://b.example")
        current = _run(db, test_organization.id)
        assert not KnowledgeQueueRepository(db).last_run_left_partial(test_organization.id, SITE, current.id)

    def test_the_time_limit_note_keeps_the_rest_of_the_metadata(self, db, test_organization):
        run = _run(db, test_organization.id)
        run.queue_metadata = {"max_links": 25}
        db.commit()

        KnowledgeQueueRepository(db).note_stopped_at_time_limit(run.id)

        db.refresh(run)
        assert run.queue_metadata == {"max_links": 25, STOPPED_AT_TIME_LIMIT: True}


class TestPlanSlots:
    def test_a_run_that_has_stored_a_page_takes_one_slot(self, db, sessions, synced, test_organization):
        """Its Knowledge row exists from the first page; the run itself is
        still processing. Counting both took two slots for the whole crawl."""
        run = _run(db, test_organization.id)
        _learning(run).first_page()

        assert KnowledgeRepository(db).count_sources_in_use(test_organization.id) == 1

    def test_a_run_with_nothing_stored_yet_still_holds_its_slot(self, db, test_organization):
        _run(db, test_organization.id)
        assert KnowledgeRepository(db).count_sources_in_use(test_organization.id) == 1

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

A source's own status never depends on telling someone about it. Seen in
production: a Shopify install queues the shop's site with no user, so the
"processed" notification hit the NOT NULL user_id constraint, and the failure
handler then failed the same way and lost the FAILED status too.

Run against a real database: the bug was a database constraint.
"""

from unittest.mock import AsyncMock, patch

import pytest
from sqlalchemy.orm import sessionmaker

from app.knowledge.failure_advice import FAILURE_ADVICE, FailureCause
from app.knowledge.page_sink import SourceRemoved
from app.models.knowledge_queue import KnowledgeQueue, QueueStatus, STOPPED_AT_TIME_LIMIT
from app.models.notification import Notification, NotificationType
from app.workers import knowledge_processor


@pytest.fixture
def queue_item(db, test_organization):
    def make(user_id=None, source="https://shop.example"):
        item = KnowledgeQueue(organization_id=test_organization.id, user_id=user_id, source=source,
                              source_type="website", status=QueueStatus.PENDING)
        db.add(item)
        db.commit()
        return item.id
    return make


@pytest.fixture
def sessions(db):
    """New sessions on the fixture's database, as the worker opens its own."""
    return sessionmaker(bind=db.get_bind())


@pytest.fixture
def worker(monkeypatch, sessions):
    """The worker on the test database, with crawling and the side jobs stubbed."""
    manager = AsyncMock()
    monkeypatch.setattr(knowledge_processor, "SessionLocal", sessions)
    monkeypatch.setattr(knowledge_processor, "KnowledgeManager", lambda **kw: manager)
    monkeypatch.setattr(knowledge_processor, "_sync_vector_agent_links", lambda db, item: None)
    push = AsyncMock()
    monkeypatch.setattr(knowledge_processor, "send_fcm_notification", push)
    return manager, push


def state(sessions, item_id):
    with sessions() as db:
        item = db.get(KnowledgeQueue, item_id)
        notifications = db.query(Notification).filter(
            Notification.notification_metadata.isnot(None)).all()
        return item.status, item.error, [n for n in notifications if n.notification_metadata.get("queue_id") == item_id]


@pytest.mark.asyncio
async def test_a_source_with_no_user_completes_without_a_notification(worker, sessions, queue_item):
    manager, push = worker
    item_id = queue_item(user_id=None)  # what a Shopify install queues

    await knowledge_processor.process_queue_item(item_id)

    status, error, notifications = state(sessions, item_id)
    assert (status, error, notifications) == (QueueStatus.COMPLETED, None, [])
    push.assert_not_called()


@pytest.mark.asyncio
async def test_a_source_with_no_user_that_fails_keeps_its_failed_status(worker, sessions, queue_item):
    manager, push = worker
    manager.process_knowledge.side_effect = RuntimeError("https://shop.example did not respond in time.")
    item_id = queue_item(user_id=None)

    with pytest.raises(RuntimeError):
        await knowledge_processor.process_queue_item(item_id)

    status, error, notifications = state(sessions, item_id)
    assert status == QueueStatus.FAILED
    assert "did not respond in time" in error
    assert notifications == []


@pytest.mark.asyncio
async def test_the_person_who_added_it_is_told_it_is_ready(worker, sessions, queue_item, test_user):
    manager, push = worker
    item_id = queue_item(user_id=test_user.id)

    await knowledge_processor.process_queue_item(item_id)

    status, _, notifications = state(sessions, item_id)
    assert status == QueueStatus.COMPLETED
    assert [(n.user_id, n.type) for n in notifications] == [(test_user.id, NotificationType.KNOWLEDGE_PROCESSED)]
    push.assert_awaited_once()


@pytest.mark.asyncio
async def test_the_person_who_added_it_is_told_it_failed(worker, sessions, queue_item, test_user):
    manager, push = worker
    manager.process_knowledge.side_effect = RuntimeError("could not be found")
    item_id = queue_item(user_id=test_user.id)

    with pytest.raises(RuntimeError):
        await knowledge_processor.process_queue_item(item_id)

    status, error, notifications = state(sessions, item_id)
    assert (status, error) == (QueueStatus.FAILED, "could not be found")
    assert [n.type for n in notifications] == [NotificationType.KNOWLEDGE_FAILED]


@pytest.mark.asyncio
async def test_a_notification_that_cannot_be_saved_does_not_fail_the_source(worker, sessions, queue_item, test_user, monkeypatch):
    manager, push = worker
    item_id = queue_item(user_id=test_user.id)
    real_init = Notification.__init__

    def broken(self, **kwargs):
        real_init(self, **{**kwargs, "user_id": None})  # violates NOT NULL on flush
    monkeypatch.setattr(Notification, "__init__", broken)

    await knowledge_processor.process_queue_item(item_id)

    status, error, notifications = state(sessions, item_id)
    assert (status, error, notifications) == (QueueStatus.COMPLETED, None, [])
    push.assert_not_called()


def _stores_pages(sessions, item_id, pages, metadata=None):
    """What a run that stored pages leaves on its queue row."""
    def run(queue_item):
        with sessions() as db:
            item = db.get(KnowledgeQueue, item_id)
            item.pages_learned = pages
            if metadata:
                item.queue_metadata = metadata
            db.commit()
    return run


@pytest.mark.asyncio
async def test_a_run_that_broke_after_storing_pages_says_it_stopped_partway(worker, sessions, queue_item, test_user):
    """Its pages stay searchable; the advice is to add it again, not that
    the site is broken."""
    manager, push = worker
    item_id = queue_item(user_id=test_user.id)
    store = _stores_pages(sessions, item_id, 12)

    async def breaks(queue_item):
        store(queue_item)
        raise RuntimeError("connection reset")
    manager.process_knowledge.side_effect = breaks

    with pytest.raises(RuntimeError):
        await knowledge_processor.process_queue_item(item_id)

    status, error, notifications = state(sessions, item_id)
    assert status == QueueStatus.FAILED
    assert error == FAILURE_ADVICE[FailureCause.INTERRUPTED].format(url="https://shop.example")
    assert [n.type for n in notifications] == [NotificationType.KNOWLEDGE_FAILED]


@pytest.mark.asyncio
async def test_a_run_that_hit_the_time_limit_says_how_much_it_learned(worker, sessions, queue_item, test_user):
    manager, push = worker
    item_id = queue_item(user_id=test_user.id)
    manager.process_knowledge.side_effect = _stores_pages(
        sessions, item_id, 140, {STOPPED_AT_TIME_LIMIT: True}
    )

    await knowledge_processor.process_queue_item(item_id)

    status, _, notifications = state(sessions, item_id)
    assert status == QueueStatus.COMPLETED
    assert [n.message for n in notifications] == [
        "Learned 140 pages from shop.example before the time limit"
    ]


@pytest.mark.asyncio
async def test_a_source_removed_while_it_was_read_is_dropped_quietly(worker, sessions, queue_item, test_user):
    """The run deleted its own queue row; nobody hears about a source they
    just removed."""
    manager, push = worker
    item_id = queue_item(user_id=test_user.id)

    async def removed(queue_item):
        with sessions() as db:
            db.delete(db.get(KnowledgeQueue, item_id))
            db.commit()
        raise SourceRemoved("removed")
    manager.process_knowledge.side_effect = removed

    await knowledge_processor.process_queue_item(item_id)

    with sessions() as db:
        assert db.get(KnowledgeQueue, item_id) is None
        assert db.query(Notification).count() == 0
    push.assert_not_called()


def test_the_service_starts_firebase_before_its_loops():
    order = []
    with patch("app.services.firebase.initialize_firebase", side_effect=lambda: order.append("firebase")), \
         patch.object(knowledge_processor.asyncio, "run", side_effect=lambda coro: (coro.close(), order.append("loops"))):
        knowledge_processor.run_service()
    assert order == ["firebase", "loops"]


def test_the_service_still_runs_without_firebase():
    started = []
    with patch("app.services.firebase.initialize_firebase", side_effect=ValueError("no credentials")), \
         patch.object(knowledge_processor.asyncio, "run", side_effect=lambda coro: (coro.close(), started.append(True))):
        knowledge_processor.run_service()
    assert started == [True]

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
from uuid import uuid4

import pytest

from app.models.knowledge import Knowledge, SourceType
from app.models.knowledge_queue import KnowledgeQueue, QueueStatus
from app.repositories.knowledge import KnowledgeRepository


@pytest.fixture
def repo(db):
    return KnowledgeRepository(db)


def _index(db, org_id, source: str) -> Knowledge:
    """A finished crawl: the row the source ends up as."""
    row = Knowledge(
        source=source,
        source_type=SourceType.FILE,
        organization_id=org_id,
        created_at=datetime.now(timezone.utc),
    )
    db.add(row)
    db.commit()
    return row


def _queue(db, org_id, source: str, status=QueueStatus.PENDING) -> KnowledgeQueue:
    """A crawl that has been accepted but has produced nothing yet."""
    item = KnowledgeQueue(
        organization_id=org_id,
        source_type="website",
        source=source,
        status=status,
        created_at=datetime.now(timezone.utc),
    )
    db.add(item)
    db.commit()
    return item


class TestCountSourcesInUse:
    def test_counts_indexed_sources(self, repo, db, test_organization):
        assert repo.count_sources_in_use(test_organization.id) == 0
        _index(db, test_organization.id, "https://a.example")
        assert repo.count_sources_in_use(test_organization.id) == 1

    @pytest.mark.parametrize("status", [QueueStatus.PENDING, QueueStatus.PROCESSING])
    def test_a_queued_crawl_holds_its_slot(self, repo, db, test_organization, status):
        """The bug: three sites queued at once each saw a count of zero, so a
        one-source plan ended up with three."""
        _queue(db, test_organization.id, "https://a.example", status)
        _queue(db, test_organization.id, "https://b.example", status)
        assert repo.count_sources_in_use(test_organization.id) == 2

    def test_a_finished_crawl_is_not_counted_twice(self, repo, db, test_organization):
        """The queue row stays behind once the source is indexed."""
        _queue(db, test_organization.id, "https://a.example", QueueStatus.COMPLETED)
        _index(db, test_organization.id, "https://a.example")
        assert repo.count_sources_in_use(test_organization.id) == 1

    def test_a_running_crawl_is_not_counted_twice_once_indexed(self, repo, db, test_organization):
        """A crawl can index its seed before the queue row is marked done."""
        _queue(db, test_organization.id, "https://a.example", QueueStatus.PROCESSING)
        _index(db, test_organization.id, "https://a.example")
        assert repo.count_sources_in_use(test_organization.id) == 1

    def test_the_same_url_queued_twice_holds_one_slot(self, repo, db, test_organization):
        _queue(db, test_organization.id, "https://a.example")
        _queue(db, test_organization.id, "https://a.example")
        assert repo.count_sources_in_use(test_organization.id) == 1

    def test_failed_and_completed_crawls_hold_nothing(self, repo, db, test_organization):
        _queue(db, test_organization.id, "https://a.example", QueueStatus.FAILED)
        _queue(db, test_organization.id, "https://b.example", QueueStatus.COMPLETED)
        assert repo.count_sources_in_use(test_organization.id) == 0

    def test_another_organization_is_not_counted(self, repo, db, test_organization):
        other_org = uuid4()
        _queue(db, other_org, "https://a.example")
        _index(db, other_org, "https://b.example")
        assert repo.count_sources_in_use(test_organization.id) == 0

    def test_indexed_count_still_excludes_the_queue(self, repo, db, test_organization):
        """count_by_organization backs the paginated list, so it must keep
        counting only what the list can actually show."""
        _queue(db, test_organization.id, "https://a.example")
        assert repo.count_by_organization(test_organization.id) == 0
        assert repo.count_sources_in_use(test_organization.id) == 1

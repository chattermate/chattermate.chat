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

from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

from scripts import rechunk_knowledge as script


def _row(id: str, content: str, **meta):
    return SimpleNamespace(
        id=id,
        name="https://x.com",
        content=content,
        meta_data={"url": id, **meta},
        filters={"name": "https://x.com", "agent_id": ["a1"], "org_id": "o1"},
    )


@pytest.fixture
def conn():
    return MagicMock()


@pytest.fixture
def embedder():
    embedder = MagicMock()
    embedder.get_embedding_and_usage.return_value = ([0.5, 0.5], None)
    return embedder


def _execute_returning(conn, oversized, taken=()):
    """First query lists oversized rows, second checks planned ids."""
    results = [MagicMock(fetchall=MagicMock(return_value=oversized)),
               MagicMock(fetchall=MagicMock(return_value=[SimpleNamespace(id=t) for t in taken]))]
    results += [MagicMock()] * 10
    conn.execute.side_effect = results


class TestProcessTable:
    def test_splits_row_and_replaces_it_then_commits(self, conn, embedder):
        big = _row("https://x.com/pricing", "para\n\n" * 400)
        _execute_returning(conn, [big])

        report = script.process_table(conn, "d_o1", embedder, size=300, dry_run=False)

        assert report.rows == 1 and report.failed == 0 and report.chunks > 1
        # Commit-as-you-go: never conn.begin() (the preceding SELECTs already
        # opened the transaction), one commit after insert + delete.
        conn.begin.assert_not_called()
        conn.commit.assert_called_once()
        insert_call, delete_call = conn.execute.call_args_list[2], conn.execute.call_args_list[3]
        records = insert_call.args[1]
        assert len(records) == report.chunks
        assert records[0]["id"] == "https://x.com/pricing::1"
        assert '"agent_id": ["a1"]' in records[0]["filters"]
        assert '"page_id": "https://x.com/pricing"' in records[0]["meta_data"]
        assert delete_call.args[1] == {"id": "https://x.com/pricing"}
        assert embedder.get_embedding_and_usage.call_count == report.chunks

    def test_dry_run_writes_nothing(self, conn, embedder):
        _execute_returning(conn, [_row("https://x.com/p", "x " * 400)])
        report = script.process_table(conn, "d_o1", None, size=300, dry_run=True)
        assert report.rows == 1 and report.chunks > 1
        conn.commit.assert_not_called()
        assert conn.execute.call_count == 2  # list + collision check only

    def test_collision_leaves_row_untouched(self, conn, embedder):
        _execute_returning(conn, [_row("https://x.com/p", "x " * 400)], taken=["https://x.com/p::2"])
        report = script.process_table(conn, "d_o1", embedder, size=300, dry_run=False)
        assert report.failed == 1 and report.collisions == ["https://x.com/p::2"]
        conn.commit.assert_not_called()

    def test_embedding_failure_keeps_original(self, conn, embedder):
        _execute_returning(conn, [_row("https://x.com/p", "x " * 400)])
        embedder.get_embedding_and_usage.side_effect = RuntimeError("model down")
        report = script.process_table(conn, "d_o1", embedder, size=300, dry_run=False)
        assert report.failed == 1
        conn.commit.assert_not_called()

    def test_write_failure_rolls_back(self, conn, embedder):
        _execute_returning(conn, [_row("https://x.com/p", "x " * 400)])
        conn.execute.side_effect = list(conn.execute.side_effect)[:2] + [RuntimeError("disk full")]
        report = script.process_table(conn, "d_o1", embedder, size=300, dry_run=False)
        assert report.failed == 1
        conn.rollback.assert_called_once()
        conn.commit.assert_not_called()

    def test_row_that_fits_one_chunk_is_skipped(self, conn, embedder):
        _execute_returning(conn, [_row("https://x.com/p", "short")])
        report = script.process_table(conn, "d_o1", embedder, size=300, dry_run=False)
        assert report.skipped == 1 and report.rows == 0

    def test_legacy_pdf_chunks_are_left_alone(self, conn, embedder):
        pdf = SimpleNamespace(id="manual_3", name="manual", content="p " * 400,
                              meta_data={"page": 3}, filters=None)
        _execute_returning(conn, [pdf])
        report = script.process_table(conn, "d_o1", embedder, size=300, dry_run=False)
        assert report.legacy_pdf == 1 and report.rows == 0
        conn.commit.assert_not_called()


class TestRenameLegacySuffixedPages:
    def test_renames_to_explicit_chunk_id(self, conn):
        conn.execute.return_value.fetchall.return_value = [
            SimpleNamespace(id="https://x.com/post_2", meta_data={"url": "https://x.com/post_2"})
        ]
        renamed = script.rename_legacy_suffixed_pages(conn, "d_o1", size=300, dry_run=False)
        assert renamed == 1
        params = conn.execute.call_args.args[1]
        assert params["new_id"] == "https://x.com/post_2::1"
        assert params["old_id"] == "https://x.com/post_2"
        assert '"page_id": "https://x.com/post_2"' in params["meta"]
        conn.commit.assert_called_once()

    def test_dry_run_only_reports(self, conn):
        conn.execute.return_value.fetchall.return_value = [
            SimpleNamespace(id="https://x.com/post_2", meta_data={})
        ]
        assert script.rename_legacy_suffixed_pages(conn, "d_o1", size=300, dry_run=True) == 1
        assert conn.execute.call_count == 1
        conn.commit.assert_not_called()


class TestVectorTables:
    def test_org_scopes_to_one_table(self, conn):
        assert script.vector_tables(conn, "abc") == ["d_abc"]
        conn.execute.assert_not_called()

    def test_lists_all_vector_tables(self, conn):
        conn.execute.return_value.fetchall.return_value = [
            SimpleNamespace(table_name="d_1"), SimpleNamespace(table_name="d_2")
        ]
        assert script.vector_tables(conn, None) == ["d_1", "d_2"]

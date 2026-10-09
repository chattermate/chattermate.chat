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

scripts.rechunk_knowledge against a real SQLAlchemy connection.

The other script tests mock the connection, which hides transaction
semantics: SQLAlchemy 2.x autobegins a transaction on the first SELECT, and
``Connection.begin()`` then raises ``InvalidRequestError`` until that
transaction is committed or rolled back. ``process_table`` runs two SELECTs
before ``replace_row`` calls ``conn.begin()``, so every row fails.
"""

import hashlib
from unittest.mock import MagicMock, patch

import pytest
from sqlalchemy import create_engine, event, text

from scripts import rechunk_knowledge as script


@pytest.fixture
def conn():
    engine = create_engine("sqlite://")

    @event.listens_for(engine, "connect")
    def _setup(dbapi_conn, _):
        dbapi_conn.create_function("md5", 1, lambda s: hashlib.md5(s.encode()).hexdigest())
        dbapi_conn.execute("ATTACH DATABASE ':memory:' AS ai")
        dbapi_conn.execute(
            'CREATE TABLE ai."d_o" (id TEXT PRIMARY KEY, name TEXT, meta_data TEXT, filters TEXT, '
            "content TEXT, embedding TEXT, usage TEXT, content_hash TEXT)"
        )

    with engine.connect() as conn:
        conn.execute(
            text('INSERT INTO ai."d_o" (id, name, content, meta_data, filters) VALUES (:id, :n, :c, NULL, NULL)'),
            {"id": "https://x.com/p", "n": "https://x.com", "c": "para. " * 300},
        )
        conn.commit()
        yield conn


def test_process_table_replaces_row_on_a_real_connection(conn):
    embedder = MagicMock()
    embedder.get_embedding_and_usage.return_value = ([0.5, 0.5], None)

    # ``id = ANY(:ids)`` is Postgres-only; the collision check is not what is under test.
    with patch.object(script, "existing_ids", lambda *_: []):
        report = script.process_table(conn, "d_o", embedder, size=300, dry_run=False)

    assert report.failed == 0, "replace_row must work after the SELECTs that precede it"
    ids = [r.id for r in conn.execute(text('SELECT id FROM ai."d_o" ORDER BY length(id), id')).fetchall()]
    assert ids and ids[0] == "https://x.com/p::1" and "https://x.com/p" not in ids
    assert len(ids) == report.chunks

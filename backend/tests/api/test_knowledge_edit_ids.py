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

"""Editing and deleting chunks/pages whose ids are URLs.

A website source's chunk ids look like ``https://site.com/pricing::1``. In a
path segment they break behind proxies that decode ``%2F`` and merge ``//``, so
the edit routes also take the id in the query string. These tests check the id
reaches the page editor exactly as the client sent it.
"""

from types import SimpleNamespace
from unittest.mock import MagicMock
from uuid import uuid4

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import knowledge as knowledge_router
from app.api import knowledge_edits
from app.core import auth
from app.core.auth import get_current_user
from app.core.config import settings
from app.database import get_db
from app.knowledge import page_editor

ORG_ID = uuid4()
KNOWLEDGE_ID = 7
BASE = f"{settings.API_V1_STR}/knowledge/{KNOWLEDGE_ID}"

URL_IDS = [
    "https://chattermate.chat/pricing::1",
    "https://docs.chattermate.chat/features/lead-capture::5",
    "https://site.com//double//slash::2",
    "https://site.com/a b?x=1&y=2#frag::3",
    "https://site.com/c++/über::4",
]


class FakeKnowledgeRepository:
    """Serves one editable website source owned by ORG_ID."""

    def __init__(self, db):
        pass

    def get_by_id(self, knowledge_id):
        if knowledge_id != KNOWLEDGE_ID:
            return None
        return SimpleNamespace(
            id=KNOWLEDGE_ID,
            organization_id=ORG_ID,
            source="https://chattermate.chat",
            schema="ai",
            table_name="kb_test",
        )


@pytest.fixture
def db():
    return MagicMock()


@pytest.fixture
def calls(monkeypatch):
    """Record what the page editor is asked to do; every id 'exists'."""
    seen = []

    def record(name, result):
        def fn(db, knowledge, item_id, *args):
            seen.append((name, item_id, args))
            return result
        return fn

    monkeypatch.setattr(page_editor, "chunk_exists", record("chunk_exists", True))
    monkeypatch.setattr(page_editor, "reembed_chunk", record("reembed_chunk", 1))
    monkeypatch.setattr(page_editor, "delete_chunk", record("delete_chunk", 1))
    monkeypatch.setattr(page_editor, "replace_page", record("replace_page", 2))
    monkeypatch.setattr(page_editor, "delete_page_chunks", record("delete_page_chunks", 3))
    return seen


@pytest.fixture
def client(db, monkeypatch):
    monkeypatch.setattr(knowledge_edits, "KnowledgeRepository", FakeKnowledgeRepository)
    monkeypatch.setattr(auth, "check_permissions", lambda user, perms: True)

    app = FastAPI()
    app.include_router(knowledge_router.router, prefix=f"{settings.API_V1_STR}/knowledge")
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(organization_id=ORG_ID)
    app.dependency_overrides[get_db] = lambda: db
    return TestClient(app)


@pytest.mark.parametrize("chunk_id", URL_IDS)
def test_update_chunk_with_a_url_id_in_the_query(client, calls, db, chunk_id):
    response = client.put(f"{BASE}/chunk", params={"chunk_id": chunk_id}, json={"content": "new"})

    assert response.status_code == 200, response.text
    assert calls == [("chunk_exists", chunk_id, ()), ("reembed_chunk", chunk_id, ("new",))]
    db.commit.assert_called_once()


@pytest.mark.parametrize("chunk_id", URL_IDS)
def test_delete_chunk_with_a_url_id_in_the_query(client, calls, db, chunk_id):
    response = client.delete(f"{BASE}/chunk", params={"chunk_id": chunk_id})

    assert response.status_code == 200, response.text
    assert calls == [("delete_chunk", chunk_id, ())]
    db.commit.assert_called_once()


@pytest.mark.parametrize("page_id", [i.rsplit("::", 1)[0] for i in URL_IDS])
def test_update_page_with_a_url_id_in_the_query(client, calls, page_id):
    response = client.put(
        f"{BASE}/page", params={"page_id": page_id}, json={"content": "body", "title": "Pricing"}
    )

    assert response.status_code == 200, response.text
    assert response.json()["page_id"] == page_id
    assert calls == [("replace_page", page_id, ("body", "Pricing"))]


@pytest.mark.parametrize("page_id", [i.rsplit("::", 1)[0] for i in URL_IDS])
def test_delete_page_with_a_url_id_in_the_query(client, calls, db, page_id):
    response = client.delete(f"{BASE}/page", params={"page_id": page_id})

    assert response.status_code == 200, response.text
    assert response.json()["removed_chunks"] == 3
    assert calls == [("delete_page_chunks", page_id, ())]
    db.commit.assert_called_once()


def test_the_path_routes_still_work_for_ids_without_slashes(client, calls):
    assert client.put(f"{BASE}/chunk/notes.txt::2", json={"content": "x"}).status_code == 200
    assert client.delete(f"{BASE}/chunk/notes.txt::2").status_code == 200
    assert client.put(f"{BASE}/page/notes.txt", json={"content": "x"}).status_code == 200
    assert client.delete(f"{BASE}/page/notes.txt").status_code == 200

    assert [(name, item_id) for name, item_id, _ in calls] == [
        ("chunk_exists", "notes.txt::2"),
        ("reembed_chunk", "notes.txt::2"),
        ("delete_chunk", "notes.txt::2"),
        ("replace_page", "notes.txt"),
        ("delete_page_chunks", "notes.txt"),
    ]


@pytest.mark.parametrize("method,path", [
    ("put", "/chunk"), ("delete", "/chunk"), ("put", "/page"), ("delete", "/page"),
])
def test_a_missing_or_empty_id_is_refused(client, calls, method, path):
    kwargs = {"json": {"content": "x"}} if method == "put" else {}
    param = "chunk_id" if path == "/chunk" else "page_id"

    assert client.request(method, f"{BASE}{path}", **kwargs).status_code == 422
    assert client.request(method, f"{BASE}{path}", params={param: ""}, **kwargs).status_code == 422
    assert calls == []


@pytest.mark.parametrize("path,param,what", [
    ("/chunk", "chunk_id", "Chunk"), ("/page", "page_id", "Page"),
])
def test_blank_content_is_refused(client, calls, path, param, what):
    response = client.put(f"{BASE}{path}", params={param: URL_IDS[0]}, json={"content": " \n "})

    assert response.status_code == 400
    assert response.json()["detail"] == f"{what} content cannot be empty"
    assert calls == []


def test_an_unknown_chunk_is_404(client, monkeypatch, db):
    monkeypatch.setattr(page_editor, "chunk_exists", lambda *a: False)
    reembed = MagicMock()
    monkeypatch.setattr(page_editor, "reembed_chunk", reembed)

    response = client.put(f"{BASE}/chunk", params={"chunk_id": URL_IDS[0]}, json={"content": "x"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Chunk not found"
    reembed.assert_not_called()


@pytest.mark.parametrize("method,path,editor_fn,detail", [
    ("put", "/chunk", "reembed_chunk", "Chunk not found"),
    ("delete", "/chunk", "delete_chunk", "Chunk not found"),
    ("put", "/page", "replace_page", "Page not found"),
    ("delete", "/page", "delete_page_chunks", "Page not found"),
])
def test_nothing_matched_is_404(client, monkeypatch, db, method, path, editor_fn, detail):
    monkeypatch.setattr(page_editor, editor_fn, lambda *a: 0)
    param = "chunk_id" if path == "/chunk" else "page_id"
    kwargs = {"json": {"content": "x"}} if method == "put" else {}

    response = client.request(method, f"{BASE}{path}", params={param: URL_IDS[0]}, **kwargs)

    assert response.status_code == 404
    assert response.json()["detail"] == detail
    db.commit.assert_not_called()


def test_a_source_in_another_org_is_403(client, calls, monkeypatch):
    class OtherOrgRepository(FakeKnowledgeRepository):
        def get_by_id(self, knowledge_id):
            knowledge = super().get_by_id(knowledge_id)
            knowledge.organization_id = uuid4()
            return knowledge

    monkeypatch.setattr(knowledge_edits, "KnowledgeRepository", OtherOrgRepository)

    response = client.delete(f"{BASE}/chunk", params={"chunk_id": URL_IDS[0]})

    assert response.status_code == 403
    assert calls == []


def test_a_store_failure_rolls_back_without_leaking_the_error(client, monkeypatch, db):
    def boom(*a):
        raise RuntimeError("connection to 10.0.0.5 refused")

    monkeypatch.setattr(page_editor, "chunk_exists", lambda *a: True)
    monkeypatch.setattr(page_editor, "reembed_chunk", boom)

    response = client.put(f"{BASE}/chunk", params={"chunk_id": URL_IDS[0]}, json={"content": "x"})

    assert response.status_code == 500
    assert response.json()["detail"] == "Error updating chunk"
    db.rollback.assert_called_once()
    db.commit.assert_not_called()


def test_chunk_sql_is_scoped_to_the_source():
    """The vector table is shared across an org's sources, so a chunk lookup or
    delete must match the source name as well as the id."""
    knowledge = FakeKnowledgeRepository(None).get_by_id(KNOWLEDGE_ID)
    db = MagicMock()
    db.execute.return_value.rowcount = 1

    page_editor.delete_chunk(db, knowledge, URL_IDS[0])
    page_editor.chunk_exists(db, knowledge, URL_IDS[0])

    for call in db.execute.call_args_list:
        sql, params = str(call.args[0]), call.args[1]
        assert 'ai."kb_test"' in sql
        assert "id = :chunk_id AND name = :source" in sql
        assert params == {"chunk_id": URL_IDS[0], "source": "https://chattermate.chat"}

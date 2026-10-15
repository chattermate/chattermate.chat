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

Refreshing the allowed origins must update the one CORS middleware in place.
It used to prepend a new layer on every refresh, and the stale inner layers
kept answering for origins that had been removed.
"""

import pytest
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient

from app.core import cors
from app.core.socketio import sio

KEPT = "https://kept.example.com"
REMOVED = "https://removed.example.com"


@pytest.fixture(autouse=True)
def restore_socketio_origins(monkeypatch):
    # update_local_cors also rewrites the shared Socket.IO server's list
    monkeypatch.setattr(sio.eio, "cors_allowed_origins", list(sio.eio.cors_allowed_origins or []))


@pytest.fixture
def app():
    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[KEPT, REMOVED],
        allow_origin_regex=cors.get_cors_origin_regex(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/ping")
    def ping():
        return {"ok": True}

    return app


def cors_layers(app):
    return [m for m in app.user_middleware if m.cls is CORSMiddleware]


def get_from(client, origin):
    return client.get("/ping", headers={"Origin": origin})


def test_refresh_updates_the_existing_middleware(app):
    assert cors.update_local_cors(app, [KEPT]) is True

    layers = cors_layers(app)
    assert len(layers) == 1
    assert layers[0].kwargs["allow_origins"] == [KEPT]
    assert layers[0].kwargs["allow_origin_regex"] == cors.get_cors_origin_regex()


def test_repeated_refreshes_never_stack_layers(app):
    client = TestClient(app)
    get_from(client, KEPT)  # the stack is built once the app has served a request

    for _ in range(3):
        cors.update_local_cors(app, [KEPT])
        get_from(client, KEPT)

    assert len(cors_layers(app)) == 1


def test_removed_origin_is_no_longer_allowed(app):
    client = TestClient(app)
    assert get_from(client, REMOVED).headers.get("access-control-allow-origin") == REMOVED

    cors.update_local_cors(app, [KEPT])

    assert "access-control-allow-origin" not in get_from(client, REMOVED).headers
    assert get_from(client, KEPT).headers.get("access-control-allow-origin") == KEPT


def test_removed_origin_preflight_is_refused(app):
    client = TestClient(app)
    cors.update_local_cors(app, [KEPT])

    response = client.options(
        "/ping",
        headers={"Origin": REMOVED, "Access-Control-Request-Method": "GET"},
    )

    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


def test_vary_header_is_not_duplicated(app):
    client = TestClient(app)
    for _ in range(3):
        cors.update_local_cors(app, [KEPT])

    vary = get_from(client, KEPT).headers.get("vary", "")
    assert [v.strip() for v in vary.split(",")].count("Origin") == 1


def test_help_center_regex_survives_a_refresh(app, monkeypatch):
    monkeypatch.setattr(cors.settings, "HELP_CENTER_BASE_DOMAIN", "help.example.com")
    cors.get_cors_origin_regex.cache_clear()
    try:
        app.user_middleware[0].kwargs["allow_origin_regex"] = cors.get_cors_origin_regex()
        client = TestClient(app)
        cors.update_local_cors(app, [KEPT])

        origin = "https://acme.help.example.com"
        assert get_from(client, origin).headers.get("access-control-allow-origin") == origin
    finally:
        cors.get_cors_origin_regex.cache_clear()


def test_unchanged_origins_skip_the_rebuild(app):
    client = TestClient(app)
    cors.update_local_cors(app, [KEPT])
    get_from(client, KEPT)
    built = app.middleware_stack

    cors.update_local_cors(app, [KEPT])

    assert app.middleware_stack is built


def test_socketio_origins_follow_the_refresh(app):
    cors.update_local_cors(app, [KEPT])

    assert sio.eio.cors_allowed_origins == [KEPT]


def test_app_without_cors_middleware_gets_one():
    bare = FastAPI()

    assert cors.update_local_cors(bare, [KEPT]) is True

    layers = cors_layers(bare)
    assert len(layers) == 1
    assert layers[0].kwargs["allow_origins"] == [KEPT]

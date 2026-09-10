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

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.core.error_handlers import (
    INTERNAL_ERROR_DETAIL,
    ClientSafeHTTPException,
    install_error_handlers,
)

# What a leaked `detail=str(e)` looks like in practice: the text carries the
# connection string, the SQL, the file path — none of it the caller's business.
LEAKED = 'relation "users" does not exist at postgresql://admin:hunter2@10.0.0.4/app'


@pytest.fixture
def client():
    app = FastAPI()
    install_error_handlers(app)

    @app.get("/boom")
    def boom():
        raise HTTPException(status_code=500, detail=LEAKED)

    @app.get("/unavailable")
    def unavailable():
        raise HTTPException(status_code=503, detail=LEAKED)

    @app.get("/missing")
    def missing():
        raise HTTPException(status_code=404, detail="Agent not found")

    @app.get("/upstream")
    def upstream():
        raise ClientSafeHTTPException(status_code=502, detail="Recipient not on WhatsApp")

    @app.get("/unauthorized")
    def unauthorized():
        raise HTTPException(
            status_code=401, detail="Not authenticated", headers={"WWW-Authenticate": "Bearer"}
        )

    return TestClient(app, raise_server_exceptions=False)


class TestSanitizedHttpExceptions:
    def test_a_500_does_not_hand_the_caller_our_error_text(self, client):
        response = client.get("/boom")

        assert response.status_code == 500
        assert response.json()["detail"] == INTERNAL_ERROR_DETAIL
        assert "postgresql://" not in response.text
        assert "users" not in response.text

    def test_every_5xx_is_covered_not_just_500(self, client):
        response = client.get("/unavailable")

        assert response.status_code == 503
        assert response.json()["detail"] == INTERNAL_ERROR_DETAIL

    def test_the_real_reason_is_logged_with_the_route(self, client, caplog):
        with caplog.at_level("ERROR"):
            client.get("/boom")

        assert LEAKED in caplog.text, "the original detail must survive in the log"
        assert "/boom" in caplog.text, "the log must say which route produced it"

    def test_4xx_detail_is_written_for_the_caller_and_kept(self, client):
        response = client.get("/missing")

        assert response.status_code == 404
        assert response.json()["detail"] == "Agent not found"

    def test_4xx_headers_survive(self, client):
        response = client.get("/unauthorized")

        assert response.status_code == 401
        assert response.headers["WWW-Authenticate"] == "Bearer"
        assert response.json()["detail"] == "Not authenticated"

    def test_a_deliberate_5xx_message_still_reaches_the_caller(self, client):
        # Upstream wording the operator has to act on is useless in a log only.
        response = client.get("/upstream")

        assert response.status_code == 502
        assert response.json()["detail"] == "Recipient not on WhatsApp"

    def test_validation_errors_are_untouched(self, client):
        # 422 bodies name the offending field; they carry nothing internal.
        app = client.app

        @app.get("/typed")
        def typed(count: int):
            return {"count": count}

        response = TestClient(app).get("/typed", params={"count": "not-a-number"})

        assert response.status_code == 422
        assert response.json()["detail"][0]["loc"] == ["query", "count"]

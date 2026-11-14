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
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import widget as widget_router
from app.core.config import settings
from app.database import get_db
from app.models.agent import Agent
from app.models.customer import Customer
from app.models.widget import Widget

app = FastAPI()
app.include_router(widget_router.router, prefix=f"{settings.API_V1_STR}/widgets", tags=["widgets"])


@pytest.fixture
def client(db) -> TestClient:
    # The route runs in a worker thread; hand it the test's own session, whose
    # in-memory database holds the fixtures.
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def _status(client: TestClient, widget_id: str):
    return client.get(f"/api/v1/widgets/{widget_id}/status")


def test_status_names_the_agent_and_how_visitors_get_in(client: TestClient, test_widget: Widget, test_agent: Agent):
    response = _status(client, test_widget.id)

    assert response.status_code == 200
    assert response.json() == {
        "widget_id": test_widget.id,
        "agent_name": test_agent.name,
        "requires_token": False,
        "collects_email": False,
    }
    assert response.headers["cache-control"] == "no-store"


def test_status_prefers_the_visitor_facing_name(client: TestClient, db, test_widget: Widget, test_agent: Agent):
    test_agent.display_name = "Mia from Support"
    db.commit()

    assert _status(client, test_widget.id).json()["agent_name"] == "Mia from Support"


def test_status_reports_a_widget_that_only_takes_signed_in_visitors(
        client: TestClient, db, test_widget: Widget, test_agent: Agent):
    test_agent.require_token_auth = True
    db.commit()

    status = _status(client, test_widget.id).json()
    assert status["requires_token"] is True
    assert status["agent_name"] == ""  # as GET /widgets/{id} names no agent without a token


def test_checking_status_adds_no_customer(client: TestClient, db, test_widget: Widget):
    before = db.query(Customer).count()

    for _ in range(3):
        assert _status(client, test_widget.id).status_code == 200

    assert db.query(Customer).count() == before


def test_status_of_an_unknown_widget_is_not_found(client: TestClient):
    response = _status(client, "not-a-widget")

    assert response.status_code == 404
    assert response.json() == {"detail": "Widget not found"}


def test_status_of_a_widget_without_an_agent_says_so(client: TestClient, db, test_widget: Widget):
    test_widget.agent_id = None
    db.commit()

    response = _status(client, test_widget.id)

    assert response.status_code == 404
    assert response.json() == {"detail": "Agent not found"}

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

from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from app.api import widget_actions, widget_journeys as journey_events
from app.models.journey import JourneyProgress, AgentContextKey
from app.models.schemas.journey import JourneyWrite
from app.repositories.journey import JourneyRepository
from app.services import widget_journeys


@pytest.fixture
def sio(monkeypatch):
    mock = MagicMock()
    mock.emit = AsyncMock()
    mock.save_session = AsyncMock()
    mock.get_session = AsyncMock()
    for module in (journey_events, widget_actions, widget_journeys):
        monkeypatch.setattr(module, "sio", mock)
    return mock


@pytest.fixture
def session(db, monkeypatch, sio, test_widget, test_customer):
    for module in (journey_events, widget_actions):
        monkeypatch.setattr(module, "session_off_loop", AsyncMock(return_value=db))
        monkeypatch.setattr(module, "close_session", lambda _db: None)
    data = {"widget_id": str(test_widget.id), "org_id": test_widget.organization_id,
            "agent_id": str(test_widget.agent_id), "customer_id": str(test_customer.id),
            "session_id": str(uuid4())}
    sio.get_session.return_value = data
    return data


@pytest.fixture
def journey(db, test_agent):
    return JourneyRepository(db).create(test_agent.organization_id, test_agent.id, JourneyWrite(
        key="first_invoice", name="First invoice", status="live",
        definition={"start": {"kind": "url", "value": "/dashboard*"}, "steps": [
            {"id": "one", "title": "One", "message": "Step one", "done_when": [{"kind": "event", "value": "one_done"}]},
            {"id": "two", "title": "Two", "message": "Step two", "done_when": [{"kind": "action", "value": "open_page"}]},
        ]}))


def _views(sio):
    return [c.args[1]["view"] for c in sio.emit.call_args_list if c.args[0] == "journey_state"]


@pytest.mark.asyncio
async def test_sync_starts_and_events_advance(sio, session, journey):
    await journey_events.handle_journey_sync("sid", {"url": "https://app.x/dashboard"})
    await journey_events.handle_journey_sync("sid", {"event": "one_done"})
    await journey_events.handle_journey_sync("sid", {"action": "open_page"})
    first, second, third = _views(sio)
    assert first["step_id"] == "one" and first["message"] == "Step one"
    assert second["step_id"] == "two"
    assert third["finished"] is True
    assert session["host_url"] == "https://app.x/dashboard"


@pytest.mark.asyncio
async def test_bad_values_are_ignored(sio, session, journey):
    await journey_events.handle_journey_sync("sid", {"url": "javascript:alert(1)", "event": "Bad Event!"})
    assert "host_url" not in session
    assert _views(sio) == [None]


@pytest.mark.asyncio
async def test_skip_dismiss_start(sio, session, journey):
    await journey_events.handle_journey_sync("sid", {"url": "https://app.x/dashboard"})
    await journey_events.handle_journey_skip("sid")
    assert _views(sio)[-1]["step_id"] == "two"
    await journey_events.handle_journey_dismiss("sid")
    assert _views(sio)[-1] is None
    await journey_events.handle_journey_start("sid", {"key": "first_invoice"})
    assert _views(sio)[-1] is None  # dismissed: a user goes through a journey once


@pytest.mark.asyncio
async def test_set_context_records_keys(db, sio, session, test_agent):
    await widget_actions.handle_set_context("sid", {"context": {"plan": "free", "seats": 3}})
    assert {k.key for k in db.query(AgentContextKey).all()} == {"plan", "seats"}


@pytest.mark.asyncio
async def test_unauthenticated_is_refused(sio):
    sio.get_session.return_value = {}
    await journey_events.handle_journey_sync("sid", {"url": "https://app.x/"})
    assert [c.args[0] for c in sio.emit.call_args_list] == ["error"]


@pytest.mark.asyncio
async def test_a_runner_failure_never_breaks_the_chat(sio, session, journey):
    with patch("app.services.widget_journeys.JourneyRunner.sync", side_effect=RuntimeError("boom")):
        await journey_events.handle_journey_sync("sid", {"url": "https://app.x/dashboard"})
    assert _views(sio) == []

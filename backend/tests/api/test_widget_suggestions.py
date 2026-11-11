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


The page_suggestions socket event.
"""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.api import widget_suggestions as handlers

SESSION = {"agent_id": "a-1", "org_id": "o-1", "session_id": "s-1"}


async def _ask(data, **patches):
    with patch.object(handlers, "authenticated_session", AsyncMock(return_value=SESSION)), \
         patch.object(handlers, "allow_request", patches.pop("allow", MagicMock(return_value=True))), \
         patch.object(handlers, "sio") as sio:
        sio.emit = AsyncMock()
        with patch.object(handlers, "_suggestions", **patches):
            await handlers.handle_page_suggestions("sid", data)
    return sio


@pytest.mark.asyncio
async def test_answers_for_the_page_asked_about():
    result = {"heading": "page", "pill": "Tee", "items": [{"label": "In stock?", "icon": "product", "source": "page"}]}
    sio = await _ask({"url": "https://shop.example/products/tee", "title": "Tee"}, return_value=result)
    assert sio.emit.await_args.args[:2] == ("suggestions", {"url": "https://shop.example/products/tee", **result})


@pytest.mark.asyncio
async def test_a_failure_answers_nothing_to_suggest():
    sio = await _ask({"url": "https://x.example/"}, side_effect=RuntimeError("db"))
    assert sio.emit.await_args.args[1]["items"] == []


@pytest.mark.asyncio
async def test_too_many_asks_get_no_answer():
    sio = await _ask({"url": "https://x.example/"}, return_value=handlers.NONE, allow=MagicMock(return_value=False))
    sio.emit.assert_not_awaited()


def test_another_orgs_agent_suggests_nothing():
    agent = SimpleNamespace(organization_id="someone-else", customization=None)
    with patch.object(handlers, "SessionLocal", MagicMock()), \
         patch.object(handlers, "AgentRepository") as repo:
        repo.return_value.get_agent.return_value = agent
        assert handlers._suggestions("a-1", "o-1", "https://x.example/", None) == handlers.NONE

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


def _plan_check(page_suggestions: bool, quick_actions: bool = True):
    """_suggestions for a Shopify agent with one page rule and one every-page row,
    under a plan with or without page suggestions and quick actions."""
    agent = SimpleNamespace(organization_id="o-1", customization=SimpleNamespace(
        quick_actions=[{"label": "Does it run small?", "match": "/products/*"}, "Track my order"]))
    plan = {handlers.PAGE_SUGGESTIONS_FEATURE: page_suggestions, handlers.QUICK_ACTIONS_FEATURE: quick_actions}
    with patch.object(handlers, "SessionLocal", MagicMock()), \
         patch.object(handlers, "AgentRepository") as repo, \
         patch.object(handlers, "AgentShopifyConfigRepository") as shopify, \
         patch.object(handlers, "features", return_value=plan) as gate:
        repo.return_value.get_agent.return_value = agent
        shopify.return_value.get_agent_shopify_config.return_value = SimpleNamespace(enabled=True)
        result = handlers._suggestions("a-1", "o-1", "https://shop.example/products/tee", "Tee")
    assert gate.call_args.args[1] == "o-1"
    return [i["label"] for i in result["items"]]


def test_growth_and_up_get_rows_for_the_page():
    assert _plan_check(True)[0] == "Does it run small?"


def test_starter_gets_every_page_rows_only():
    assert _plan_check(False) == ["Track my order"]


def test_free_gets_no_quick_actions_at_all():
    assert _plan_check(False, quick_actions=False) == []


def test_without_quick_actions_the_store_page_still_counts():
    """Page rows that are not the agent's own (the store's product page) need only
    page suggestions."""
    rows = _plan_check(True, quick_actions=False)
    assert rows and "Does it run small?" not in rows and "Track my order" not in rows


def test_a_self_hosted_install_gets_rows_for_the_page():
    """No enterprise module: the real gate leaves the feature on."""
    agent = SimpleNamespace(organization_id="o-1", customization=SimpleNamespace(
        quick_actions=[{"label": "Does it run small?", "match": "/products/*"}]))
    with patch.object(handlers, "SessionLocal", MagicMock()), \
         patch.object(handlers, "AgentRepository") as repo, \
         patch.object(handlers, "AgentShopifyConfigRepository") as shopify, \
         patch("app.services.feature_gate.plan_snapshot", None):
        repo.return_value.get_agent.return_value = agent
        shopify.return_value.get_agent_shopify_config.return_value = None
        result = handlers._suggestions("a-1", "o-1", "https://shop.example/products/tee", "Tee")
    assert [i["label"] for i in result["items"]] == ["Does it run small?"]


def test_another_orgs_agent_suggests_nothing():
    agent = SimpleNamespace(organization_id="someone-else", customization=None)
    with patch.object(handlers, "SessionLocal", MagicMock()), \
         patch.object(handlers, "AgentRepository") as repo:
        repo.return_value.get_agent.return_value = agent
        assert handlers._suggestions("a-1", "o-1", "https://x.example/", None) == handlers.NONE

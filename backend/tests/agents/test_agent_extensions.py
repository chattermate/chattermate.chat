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


Toolkits an installed extension adds to the chat agent.
"""

from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest
from agno.tools import Toolkit

from app.agents import agent_extensions
from app.agents.agent_extensions import ExtraToolkit, ToolContext
from tests.agents.test_chat_agent_tools_with_transfer import build_agent, prompt_of


class StoreTools(Toolkit):
    def __init__(self):
        super().__init__(name="store_tools")
        self.has_cached_products = False
        self.product_cache_key = "org:store_products:s1"
        self.turn_events = None
        self.register(self.search_store)

    def search_store(self, query: str) -> str:
        """Search the store's products."""
        return "[]"


@pytest.fixture(autouse=True)
def no_extensions(monkeypatch):
    monkeypatch.setattr(agent_extensions, "_factories", [])
    # The installed extension's hooks never load here: only what a test registers
    monkeypatch.setattr(agent_extensions, "load_extensions", lambda: None)


def ctx(**fields):
    return ToolContext(**{"agent_id": "a", "org_id": "o", "session_id": "s", "channel": "web", **fields})


def test_a_registered_factory_builds_this_conversations_toolkits():
    tools = StoreTools()
    agent_extensions.register(lambda c: [ExtraToolkit(tools, "Use the store tools.")] if c.channel == "web" else [])
    assert [x.toolkit for x in agent_extensions.extra_toolkits(ctx())] == [tools]
    assert agent_extensions.extra_toolkits(ctx(channel="telegram")) == []


def test_a_failing_factory_is_skipped():
    agent_extensions.register(MagicMock(side_effect=RuntimeError("boom")))
    tools = StoreTools()
    agent_extensions.register(lambda c: [ExtraToolkit(tools)])
    assert [x.toolkit for x in agent_extensions.extra_toolkits(ctx())] == [tools]


def test_without_an_extension_there_is_nothing_to_add():
    assert agent_extensions.extra_toolkits(ctx()) == []


def test_the_extension_hooks_load_before_the_factories_run(monkeypatch):
    tools = StoreTools()
    monkeypatch.setattr(agent_extensions, "load_extensions",
                        lambda: agent_extensions.register(lambda c: [ExtraToolkit(tools)]))
    assert [x.toolkit for x in agent_extensions.extra_toolkits(ctx())] == [tools]


def test_only_a_product_toolkit_that_cached_this_turn_gives_its_key():
    tools = StoreTools()
    assert agent_extensions.cached_products_key([ExtraToolkit(tools, products=True)]) is None
    tools.has_cached_products = True
    assert agent_extensions.cached_products_key([ExtraToolkit(tools, products=False)]) is None
    assert agent_extensions.cached_products_key([ExtraToolkit(tools, products=True)]) == "org:store_products:s1"


class TestTheAgentUsesThem:
    def test_tools_and_their_instructions_reach_the_agent(self):
        tools = StoreTools()
        seen = []

        def factory(c):
            seen.append(c)
            return [ExtraToolkit(tools, "STORE RULES: products from CART_PLACES.", products=True)]

        agent_extensions.register(factory)
        agent = build_agent(shopify=False)
        assert tools in agent.tools
        assert "STORE RULES: products from" in prompt_of(agent)
        assert seen and seen[0].agent_id and seen[0].channel

    def test_the_products_a_toolkit_cached_are_the_turns_fallback(self):
        tools = StoreTools()
        agent_extensions.register(lambda c: [ExtraToolkit(tools, products=True)])
        agent = build_agent(shopify=False)
        assert agent._shopify_fallback_cache_key() is None
        tools.has_cached_products = True
        assert agent._shopify_fallback_cache_key() == "org:store_products:s1"

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

What an agent learns about a Shopify store when it starts answering on it.
"""

from unittest.mock import MagicMock

import pytest

from app.core.enterprise_hooks import EnterpriseHookBroken
from app.models.agent import Agent
from app.models.knowledge import Knowledge, SourceType
from app.models.knowledge_queue import KnowledgeQueue, QueueStatus
from app.models.knowledge_to_agent import KnowledgeToAgent
from app.models.shopify.shopify_shop import ShopifyShop
from app.services import shopify_store_knowledge

STORE = "teststore.myshopify.com"


@pytest.fixture
def agent(db, test_organization):
    agent = Agent(
        name="Support", display_name="Support", organization_id=test_organization.id,
        agent_type="customer_support", instructions=[],
    )
    db.add(agent)
    db.commit()
    return agent


@pytest.fixture
def shop(test_organization):
    return ShopifyShop(shop_domain=STORE, organization_id=test_organization.id, is_installed=True)


@pytest.fixture
def vector_links(monkeypatch):
    """The vector-filter rewrite is jsonb SQL; its own tests cover it."""
    add_agent = MagicMock()
    monkeypatch.setattr(shopify_store_knowledge.knowledge_vector_links, "add_agent", add_agent)
    return add_agent


def _extension(monkeypatch, on_agent_enabled):
    def hook(module, name):
        assert (module, name) == (shopify_store_knowledge.STORE_LEARNING_MODULE, "on_agent_enabled")
        return on_agent_enabled

    monkeypatch.setattr(shopify_store_knowledge, "enterprise_hook", hook)


def _queued(db, org_id):
    return db.query(KnowledgeQueue).filter(KnowledgeQueue.organization_id == org_id).all()


def _learn(db, shop, org, agent):
    shopify_store_knowledge.learn_store(db, shop, org.id, agent.id, None)


class TestWithoutAnExtension:
    def test_the_storefront_is_queued_for_a_crawl(self, db, shop, test_organization, agent):
        _learn(db, shop, test_organization, agent)

        [item] = _queued(db, test_organization.id)
        assert (item.source, item.source_type, item.status) == (STORE, "website", QueueStatus.PENDING)
        assert item.agent_id == agent.id

    def test_switching_the_agent_on_again_queues_nothing_more(self, db, shop, test_organization, agent):
        _learn(db, shop, test_organization, agent)
        _learn(db, shop, test_organization, agent)

        assert len(_queued(db, test_organization.id)) == 1

    def test_a_finished_or_failed_crawl_can_be_queued_again(self, db, shop, test_organization, agent):
        _learn(db, shop, test_organization, agent)
        [first] = _queued(db, test_organization.id)
        first.status = QueueStatus.FAILED
        db.commit()

        _learn(db, shop, test_organization, agent)

        assert len(_queued(db, test_organization.id)) == 2

    def test_a_store_already_learned_is_linked_where_the_agent_searches(
        self, db, shop, test_organization, agent, vector_links
    ):
        knowledge = Knowledge(
            organization_id=test_organization.id, source=STORE, source_type=SourceType.WEBSITE,
            table_name="d_test", schema="ai",
        )
        db.add(knowledge)
        db.commit()

        _learn(db, shop, test_organization, agent)

        assert _queued(db, test_organization.id) == []
        assert db.query(KnowledgeToAgent).filter_by(knowledge_id=knowledge.id, agent_id=agent.id).one()
        vector_links.assert_called_once_with(db, knowledge, agent.id)

    def test_a_second_agent_switched_on_while_the_first_waits_gets_its_own_run(
        self, db, shop, test_organization, agent
    ):
        second = Agent(name="Sales", display_name="Sales", organization_id=test_organization.id,
                       agent_type="customer_support", instructions=[])
        db.add(second)
        db.commit()

        _learn(db, shop, test_organization, agent)
        _learn(db, shop, test_organization, second)

        assert {item.agent_id for item in _queued(db, test_organization.id)} == {agent.id, second.id}

    def test_an_existing_link_keeps_its_row_and_gets_its_search_filter(
        self, db, shop, test_organization, agent, vector_links
    ):
        knowledge = Knowledge(
            organization_id=test_organization.id, source=STORE, source_type=SourceType.WEBSITE,
            table_name="d_test", schema="ai",
        )
        db.add(knowledge)
        db.commit()
        db.add(KnowledgeToAgent(knowledge_id=knowledge.id, agent_id=agent.id))
        db.commit()

        _learn(db, shop, test_organization, agent)

        assert db.query(KnowledgeToAgent).filter_by(knowledge_id=knowledge.id).count() == 1
        vector_links.assert_called_once_with(db, knowledge, agent.id)


class TestWithAnExtension:
    def test_it_decides_what_the_agent_learns(self, db, shop, test_organization, agent, monkeypatch):
        calls = []

        def on_agent_enabled(*args):
            calls.append(args)
            return True

        _extension(monkeypatch, on_agent_enabled)

        _learn(db, shop, test_organization, agent)

        assert calls == [(db, shop, test_organization.id, agent.id, None)]
        assert _queued(db, test_organization.id) == []

    def test_the_storefront_is_crawled_when_it_declines(self, db, shop, test_organization, agent, monkeypatch):
        _extension(monkeypatch, lambda *args: False)

        _learn(db, shop, test_organization, agent)

        [item] = _queued(db, test_organization.id)
        assert item.source == STORE

    def test_the_storefront_is_crawled_when_it_is_broken(self, db, shop, test_organization, agent, monkeypatch):
        def broken(module, name):
            raise EnterpriseHookBroken(f"{module}: a dependency is missing")

        monkeypatch.setattr(shopify_store_knowledge, "enterprise_hook", broken)

        _learn(db, shop, test_organization, agent)

        [item] = _queued(db, test_organization.id)
        assert item.source == STORE

    def test_the_storefront_is_crawled_when_it_fails(self, db, shop, test_organization, agent, monkeypatch):
        def broken(*args):
            raise RuntimeError("extension bug")

        _extension(monkeypatch, broken)

        _learn(db, shop, test_organization, agent)

        [item] = _queued(db, test_organization.id)
        assert item.source == STORE

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

Switching the agent on for a Shopify store (POST /shopify/agent-config) has
it learn the store, and learning going wrong never undoes the switch.
"""

from uuid import uuid4

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import shopify as shopify_api
from app.database import get_db
from app.models.shopify import AgentShopifyConfig, ShopifyShop

STORE = "teststore.myshopify.com"


@pytest.fixture
def shop(db, test_organization):
    shop = ShopifyShop(id=str(uuid4()), shop_domain=STORE, access_token="shpat_test",
                       is_installed=True, organization_id=test_organization.id)
    db.add(shop)
    db.commit()
    return shop


@pytest.fixture
def client(db, test_organization, monkeypatch):
    async def embedded_session(request, db):
        return {"organization_id": test_organization.id, "shop": STORE}

    monkeypatch.setattr(shopify_api, "require_shopify_session", embedded_session)
    api = FastAPI()
    api.include_router(shopify_api.router, prefix="/shopify")
    api.dependency_overrides[get_db] = lambda: (yield db)
    return TestClient(api)


@pytest.fixture
def learned(monkeypatch):
    calls = []
    monkeypatch.setattr(shopify_api.shopify_store_knowledge, "learn_store", lambda *args: calls.append(args))
    return calls


def _switch(client, agent, enabled=True):
    return client.post(f"/shopify/agent-config/{agent.id}", json={"enabled": enabled})


def test_switching_the_agent_on_has_it_learn_the_store(client, db, shop, test_agent, test_organization, learned):
    response = _switch(client, test_agent)

    assert response.status_code == 200, response.text
    [(_, learned_shop, org_id, agent_id, user_id)] = learned
    assert (learned_shop.shop_domain, org_id, agent_id, user_id) == (STORE, test_organization.id, test_agent.id, None)


def test_switching_it_off_learns_nothing(client, shop, test_agent, learned):
    assert _switch(client, test_agent, enabled=False).status_code == 200
    assert learned == []


def test_learning_going_wrong_still_switches_the_agent_on(client, db, shop, test_agent, monkeypatch):
    def broken(*args):
        raise RuntimeError("queue unavailable")

    monkeypatch.setattr(shopify_api.shopify_store_knowledge, "learn_store", broken)

    response = _switch(client, test_agent)

    assert response.status_code == 200, response.text
    config = db.query(AgentShopifyConfig).filter_by(agent_id=str(test_agent.id)).one()
    assert config.enabled and config.shop_id == shop.id

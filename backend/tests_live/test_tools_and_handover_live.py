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

One agent with order lookups, tickets and a human handover: does the real model
pick the right one? The store is stubbed, so this needs no Shopify connection;
every other part of the turn is real.
"""

import re
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

pytestmark = pytest.mark.asyncio

OWNER = "pat.owner@example.com"
ORDER = {
    "id": "gid://shopify/Order/5005",
    "name": "#1005",
    "email": OWNER,
    "displayFinancialStatus": "PAID",
    "displayFulfillmentStatus": "FULFILLED",
    "fulfillments": [{"status": "SUCCESS", "trackingInfo": [
        {"company": "UPS", "number": "1Z999AA10123456784", "url": "https://ups.example/1Z999"},
    ]}],
}


# The full record get_order_status fetches once the search has matched
FULL_ORDER = {
    "id": "5005",
    "name": "#1005",
    "email": OWNER,
    "financial_status": "paid",
    "fulfillment_status": "fulfilled",
    "customer": {"email": OWNER},
    "fulfillments": [{"status": "success", "tracking_number": "1Z999AA10123456784"}],
}


class FakeStore:
    """Answers the order search the way Shopify would, and records each search."""

    def __init__(self):
        self.searches = []

    def post(self, url, json=None, **kwargs):
        query = (json or {}).get("variables", {}).get("query", "")
        self.searches.append(query)
        matches = OWNER in query and re.search(r"name:1005\b", query)
        response = MagicMock(status_code=200)
        response.json.return_value = {"data": {"orders": {
            "edges": [{"node": ORDER}] if matches else [],
            "pageInfo": {"hasNextPage": False},
        }}}
        return response


@pytest.fixture
def store():
    fake = FakeStore()
    shop = SimpleNamespace(shop_domain="demo.myshopify.com", access_token="token")
    with patch("app.agents.chat_agent.AgentShopifyConfigRepository") as config, \
         patch("app.tools.shopify_toolkit.ShopifyTools._get_shop_for_agent", return_value=shop), \
         patch("app.tools.shopify_toolkit.ShopifyService") as service, \
         patch("app.tools.shopify_toolkit.requests.post", side_effect=fake.post):
        config.return_value.get_agent_shopify_config.return_value = SimpleNamespace(enabled=True)
        service.return_value.get_order.return_value = {"success": True, "order": FULL_ORDER}
        yield fake


def handed_over(response) -> bool:
    return bool(response.transfer_to_human or response.request_contact)


class TestOrderLookupBesideHandover:
    async def test_a_lookup_runs_the_tool_and_stays_with_the_ai(self, conversation, transfer_agent_id, store):
        chat = await conversation(agent_id=transfer_agent_id)
        response = await chat.say(f"Where is my order #1005? The email on it is {OWNER}")

        assert store.searches, f"no order lookup ran:\n{response.message}"
        assert not handed_over(response), f"handed over instead of answering:\n{response.message}"
        assert "1Z999AA10123456784" in response.message or "shipped" in response.message.lower(), response.message

    async def test_a_missing_detail_is_asked_for_not_handed_over(self, conversation, transfer_agent_id, store):
        chat = await conversation(agent_id=transfer_agent_id)
        response = await chat.say("Where is my order?")

        assert not store.searches, f"searched with nothing to go on: {store.searches}"
        assert not handed_over(response), f"handed over instead of asking:\n{response.message}"

    async def test_no_match_asks_the_customer_to_check(self, conversation, transfer_agent_id, store):
        chat = await conversation(agent_id=transfer_agent_id)
        response = await chat.say("Where is my order #1005? My email is someone.else@example.com")

        assert store.searches, f"no order lookup ran:\n{response.message}"
        assert not handed_over(response), f"handed over on the first miss:\n{response.message}"
        assert "1Z999AA10123456784" not in response.message

    async def test_a_request_for_a_person_goes_straight_to_one(self, conversation, transfer_agent_id, store):
        chat = await conversation(agent_id=transfer_agent_id)
        response = await chat.say("I don't want a bot. Please put me through to a person about my order #1005.")

        assert handed_over(response), f"no handover:\n{response.message}"
        assert not store.searches, f"looked the order up first: {store.searches}"
        assert not response.ticket_id, "opened a ticket as well as a handover"

    async def test_a_refund_decision_reaches_the_team_once(self, conversation, transfer_agent_id, store):
        """A handover is what the prompt asks for. gpt-4o-mini opens a ticket about
        half the time instead, which still reaches the team; neither or both is the bug."""
        chat = await conversation(agent_id=transfer_agent_id)
        await chat.say(f"Where is my order #1005? The email on it is {OWNER}")
        response = await chat.say("It arrived broken. I need someone to approve a refund for it today.")

        assert handed_over(response) != bool(response.ticket_id), (
            f"handover={handed_over(response)} ticket={response.ticket_id}:\n{response.message}"
        )

    async def test_an_email_alone_lists_no_orders(self, conversation, transfer_agent_id, store):
        chat = await conversation(agent_id=transfer_agent_id)
        response = await chat.say(f"Show me all my orders. My email is {OWNER}")

        assert not store.searches, f"searched on an email alone: {store.searches}"
        assert "1005" not in response.message, response.message

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

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, Mock, patch
from uuid import uuid4

import pytest
from sqlalchemy.orm import Session

from app.agents.chat_agent import ChatAgent
from app.models.schemas.chat import ChatResponse, ShopifyOutputData, ShopifyProduct, TransferReasonType


def build_agent(*, transfer=True, shopify=False, jira=False, ticketing=False,
                mcp_tools=None, transfer_override=None, channel=None,
                broken_tool=None, groups=("support",), host_actions=None) -> ChatAgent:
    """A ChatAgent with everything external stubbed, to read what it was given."""
    agent_data = Mock()
    agent_data.name = "Support"
    agent_data.jira_enabled = jira
    agent_data.transfer_to_human = transfer
    agent_data.ask_for_rating = False
    agent_data.ticketing_enabled = ticketing
    agent_data.instructions = ["You are a helpful assistant"]
    agent_data.groups = list(groups)

    storage = Mock()
    storage.get_session_state.return_value = {"status": "active"}
    shopify_config = SimpleNamespace(enabled=True) if shopify else None
    broken = (patch(f'app.agents.chat_agent.{broken_tool}', side_effect=RuntimeError("boom"))
              if broken_tool else patch('app.agents.chat_agent.logger'))

    with patch('app.agents.chat_agent.get_db') as mock_get_db, \
         patch('app.agents.chat_agent.JiraRepository') as mock_jira_repo, \
         patch('app.agents.chat_agent.AgentShopifyConfigRepository') as mock_shopify_repo, \
         patch('app.services.ticket_access.ticketing_allowed', return_value=ticketing), \
         patch('app.tools.knowledge_search_byagent.KnowledgeSearchByAgent', return_value=Mock()), \
         patch('app.agents.chat_agent.EncryptedPostgresAgentStorage', return_value=storage), \
         patch('app.agents.chat_agent.settings.DATABASE_URL', "mock://test"), \
         patch.dict('os.environ', {}, clear=True), \
         broken:
        mock_get_db.return_value = iter([MagicMock(spec=Session)])
        mock_jira_repo.return_value.get_agent_with_jira_config.return_value = agent_data
        mock_shopify_repo.return_value.get_agent_shopify_config.return_value = shopify_config

        return ChatAgent(
            api_key="test-key",
            model_name="gpt-4",
            model_type="openai",
            org_id=str(uuid4()),
            agent_id=str(uuid4()),
            customer_id=str(uuid4()),
            session_id=str(uuid4()),
            transfer_to_human=transfer_override,
            mcp_tools=mcp_tools,
            channel=channel,
            host_action_functions=host_actions,
        )


def tool_names(agent: ChatAgent) -> set:
    return {type(tool).__name__ for tool in agent.tools}


def prompt_of(agent: ChatAgent) -> str:
    """The prompt on one line: the blocks are indented heredocs."""
    return " ".join((agent.agent.instructions or "").split())


class TestToolsAttachBesideHandover:
    """Handover is one more way out of a conversation, not a mode: an agent must
    be able to look up an order or open a ticket AND hand off to a person."""

    @pytest.mark.parametrize("transfer", [True, False])
    def test_shopify_tools_attach_either_way(self, transfer):
        assert "ShopifyTools" in tool_names(build_agent(transfer=transfer, shopify=True))

    @pytest.mark.parametrize("transfer", [True, False])
    def test_native_ticket_tools_attach_either_way(self, transfer):
        assert "TicketTools" in tool_names(build_agent(transfer=transfer, ticketing=True))

    @pytest.mark.parametrize("transfer", [True, False])
    def test_jira_tools_attach_either_way(self, transfer):
        assert "JiraTools" in tool_names(build_agent(transfer=transfer, jira=True))

    @pytest.mark.parametrize("transfer", [True, False])
    def test_jira_still_wins_over_native_tickets(self, transfer):
        """Two create-ticket functions would confuse the model."""
        names = tool_names(build_agent(transfer=transfer, jira=True, ticketing=True))
        assert "JiraTools" in names
        assert "TicketTools" not in names

    def test_all_of_them_together(self):
        names = tool_names(build_agent(shopify=True, ticketing=True))
        assert {"ShopifyTools", "TicketTools"} <= names

    def test_nothing_attaches_when_nothing_is_configured(self):
        assert tool_names(build_agent()) == set()

    @pytest.mark.parametrize("override", [True, False])
    def test_a_workflow_override_does_not_change_the_tools(self, override):
        """LLM nodes pass transfer_to_human=auto_transfer explicitly."""
        agent = build_agent(transfer=not override, transfer_override=override, shopify=True)
        assert agent.transfer_to_human is override
        assert "ShopifyTools" in tool_names(agent)

    @pytest.mark.parametrize("channel", [None, "web", "telegram", "whatsapp"])
    def test_every_surface_gets_them(self, channel):
        names = tool_names(build_agent(shopify=True, ticketing=True, channel=channel))
        assert {"ShopifyTools", "TicketTools"} <= names


class TestPromptMatchesTheTools:
    """Instructions for a tool the agent doesn't have make it claim lookups it
    never ran, and tools with no instructions go unused."""

    def test_shopify_instructions_come_with_the_tools(self):
        agent = build_agent(shopify=True)
        assert "ShopifyTools" in tool_names(agent)
        assert "you have access to shopify tools" in prompt_of(agent).lower()

    def test_ticket_instructions_stay_with_handover_on(self):
        prompt = prompt_of(build_agent(ticketing=True)).lower()
        assert "native support-ticket tools" in prompt

    def test_jira_instructions_stay_with_handover_on(self):
        prompt = prompt_of(build_agent(jira=True)).lower()
        assert "jira integration tools" in prompt


class TestToolsOrAPerson:
    """With both on, the transfer list and the ticket list overlap ("complex",
    "escalation"), so the prompt must say which one applies."""

    def rules(self, **kwargs) -> str:
        return prompt_of(build_agent(**kwargs)).lower()

    def test_a_request_for_a_person_goes_straight_to_transfer(self):
        prompt = self.rules(shopify=True, ticketing=True)
        assert "do they ask for a person" in prompt
        assert "call no tool and ask them for nothing first" in prompt

    def test_a_decision_goes_to_a_person_not_a_ticket(self):
        prompt = self.rules(ticketing=True)
        assert "approving a refund" in prompt
        assert "do not open a ticket for it" in prompt

    def test_tools_come_first_otherwise(self):
        prompt = self.rules(shopify=True)
        assert "if a tool can do what they asked, use the tool" in prompt

    def test_a_missing_detail_is_not_a_reason_to_transfer(self):
        prompt = self.rules(shopify=True)
        assert "needing a detail from the customer is not a reason to transfer" in prompt

    def test_a_handover_replaces_the_reply(self):
        """The handover line overwrites the reply, so an order status written in
        the same turn would never reach the customer."""
        prompt = self.rules(shopify=True)
        assert "replaces your reply" in prompt

    @pytest.mark.parametrize("kwargs", [{"ticketing": True}, {"jira": True}])
    def test_a_ticket_is_never_opened_as_well_as_a_transfer(self, kwargs):
        prompt = self.rules(**kwargs)
        assert "never open a ticket and transfer for the same issue" in prompt

    @pytest.mark.parametrize("kwargs,broad_criterion", [
        ({"ticketing": True}, "a technical problem you cannot resolve"),
        ({"jira": True}, "complex and requires human intervention"),
    ])
    def test_a_person_replaces_the_broad_ticket_criteria(self, kwargs, broad_criterion):
        """Left in, the model opens a ticket for what a person should take."""
        assert broad_criterion not in self.rules(**kwargs)
        assert "only create a ticket if the customer asks for one" in self.rules(**kwargs)

    @pytest.mark.parametrize("kwargs,broad_criterion", [
        ({"ticketing": True}, "a technical problem you cannot resolve"),
        ({"jira": True}, "complex and requires human intervention"),
    ])
    def test_without_a_person_the_ticket_criteria_stay_broad(self, kwargs, broad_criterion):
        """A ticket is then the only way to reach the team."""
        assert broad_criterion in self.rules(transfer=False, **kwargs)
        assert "open a ticket and transfer" not in self.rules(transfer=False, **kwargs)

    @pytest.mark.parametrize("kwargs,broad_criterion", [
        ({"ticketing": True}, "a technical problem you cannot resolve"),
        ({"jira": True}, "complex and requires human intervention"),
    ])
    def test_with_no_group_a_ticket_is_still_the_way_to_the_team(self, kwargs, broad_criterion):
        """The end of the turn drops a handover that has no group to go to."""
        assert broad_criterion in self.rules(groups=(), **kwargs)

    def test_host_actions_alone_still_get_the_rules(self):
        def open_invoice():
            """Open an invoice."""
        assert "before you call any tool" in self.rules(host_actions=[open_invoice])

    def test_ticket_rules_are_absent_without_ticket_tools(self):
        assert "open a ticket and transfer" not in self.rules(shopify=True)

    def test_mcp_tools_alone_still_get_the_rules(self):
        assert "before you call any tool" in self.rules(mcp_tools=[Mock()])

    def test_no_rules_without_handover(self):
        assert "before you call any tool" not in self.rules(transfer=False, shopify=True, ticketing=True)

    def test_no_rules_without_tools(self):
        assert "before you call any tool" not in self.rules()

    def test_rules_come_after_the_lists_they_settle(self):
        prompt = self.rules(ticketing=True, shopify=True)
        assert prompt.index("only create a ticket if") < prompt.index("before you call any tool")
        assert prompt.index("you have the ability to transfer") < prompt.index("before you call any tool")

    @pytest.mark.parametrize("broken_tool,kwargs", [
        ("ShopifyTools", {"shopify": True}),
        ("JiraTools", {"jira": True}),
    ])
    def test_a_tool_that_failed_to_start_gets_no_rules(self, broken_tool, kwargs):
        """The chat still works; it just must not be told to use what isn't there."""
        agent = build_agent(broken_tool=broken_tool, **kwargs)
        assert tool_names(agent) == set()
        assert "before you call any tool" not in prompt_of(agent).lower()


def finished_turn(agent: ChatAgent, reply: ChatResponse) -> ChatResponse:
    """Run the end of a turn on a reply the model has already produced."""
    agent.knowledge_tool = None
    chat_repo = Mock()
    chat_repo.create_message.return_value = SimpleNamespace(id=1)
    with patch('app.agents.chat_agent.parse_response_content', return_value=reply):
        return asyncio.run(agent._finish_turn(
            Mock(), None, str(uuid4()), agent.org_id, agent.agent_id, agent.customer_id,
            Mock(), chat_repo))


def model_reply(**fields) -> ChatResponse:
    return ChatResponse(message=fields.pop("message", "Here are some options for you."),
                        transfer_to_human=fields.pop("transfer_to_human", False),
                        end_chat=False, request_rating=False, create_ticket=False, **fields)


def with_products(reply: ChatResponse) -> ChatResponse:
    reply.shopify_output = ShopifyOutputData(
        shop_domain="demo.myshopify.com",
        products=[ShopifyProduct(id="1", title="Board", price="99.00", currency="USD", handle="board")],
    )
    return reply


class TestProductsOnEachSurface:
    """The prompt keeps product details out of the reply because the widget shows
    them as cards. A channel has no cards, so without this the customer would get
    "Here are some options for you." followed by nothing."""

    @pytest.mark.parametrize("channel", ["telegram", "whatsapp", "messenger", "sms"])
    def test_a_channel_gets_the_products_as_text(self, channel):
        agent = build_agent(transfer=False, shopify=True, channel=channel)
        with patch('app.agents.chat_agent.enrich_shopify_response', side_effect=lambda r, *a, **k: with_products(r)):
            reply = finished_turn(agent, model_reply())
        assert reply.message.startswith("Here are some options for you.")
        assert "Board" in reply.message
        assert "USD 99.00" in reply.message
        assert "https://demo.myshopify.com/products/board" in reply.message

    @pytest.mark.parametrize("channel", [None, "web", "shopify"])
    def test_the_widget_keeps_its_cards(self, channel):
        agent = build_agent(transfer=False, shopify=True, channel=channel)
        with patch('app.agents.chat_agent.enrich_shopify_response', side_effect=lambda r, *a, **k: with_products(r)):
            reply = finished_turn(agent, model_reply())
        assert reply.message == "Here are some options for you."
        assert reply.shopify_output.products[0].title == "Board"

    def test_the_stored_row_says_what_the_customer_got(self):
        agent = build_agent(transfer=False, shopify=True, channel="telegram")
        stored = []
        agent._store_bot_message = lambda repo, data: stored.append(data["message"])
        with patch('app.agents.chat_agent.enrich_shopify_response', side_effect=lambda r, *a, **k: with_products(r)):
            reply = finished_turn(agent, model_reply())
        assert stored == [reply.message]

    def test_a_reply_with_no_products_is_untouched(self):
        agent = build_agent(transfer=False, shopify=True, channel="telegram")
        reply = finished_turn(agent, model_reply(message="Your order has shipped."))
        assert reply.message == "Your order has shipped."


class TestHandoverStillWorksWithToolsAttached:
    @pytest.mark.parametrize("channel", [None, "telegram"])
    def test_a_requested_transfer_runs_the_handover(self, channel):
        agent = build_agent(shopify=True, ticketing=True, channel=channel)
        handed_over = model_reply(message="Connecting you with the team.")
        agent._handle_transfer = AsyncMock(return_value=handed_over)
        reply = finished_turn(agent, model_reply(
            transfer_to_human=True, transfer_reason=TransferReasonType.DIRECT_REQUEST,
            transfer_description="Asked for a person"))
        agent._handle_transfer.assert_awaited_once()
        assert reply is handed_over

    def test_a_tool_answer_is_not_turned_into_a_handover(self):
        agent = build_agent(shopify=True)
        agent._handle_transfer = AsyncMock()
        reply = finished_turn(agent, model_reply(message="Your order has shipped."))
        agent._handle_transfer.assert_not_awaited()
        assert reply.message == "Your order has shipped."

    def test_a_stray_flag_is_still_cleared_when_handover_is_off(self):
        agent = build_agent(transfer=False, shopify=True)
        agent._handle_transfer = AsyncMock()
        reply = finished_turn(agent, model_reply(transfer_to_human=True))
        agent._handle_transfer.assert_not_awaited()
        assert reply.transfer_to_human is False

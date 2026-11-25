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

A customer describing a dispute and then an assault was asked for their email
five times and handed over ten minutes in. The urgent-handover rules name the
situations that need a person on that message, stop repeated asks, and let
lead capture give way. They roll out per org behind AGENT_URGENT_HANDOVER_RULES.
"""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from app.agents.handover_prompt import (
    LEAD_CAPTURE_YIELDS,
    LEAD_END_CHAT_AFTER_TWO_ASKS,
    LEAD_REQUIRED_FIELD_LEGACY,
    LEAD_REQUIRED_FIELD_LIMIT,
    NO_REPEAT_ASK_RULE,
    TICKET_IDENTITY_SKIP_WHEN_URGENT,
    URGENT_HANDOVER_RULES,
    URGENT_WITHOUT_HANDOVER,
    urgent_handover_on,
)
from app.agents.transfer_agent import (
    BUSY_TEAM_INSTRUCTION,
    BUSY_TEAM_TIMEOUT_MESSAGE,
    TRANSFER_TIMEOUT_MESSAGE,
    TransferResponseAgent,
    get_agent_availability_response,
)
from app.core.config import Settings, settings
from tests.agents.prompt_matrix import CASES, ORG_ID, build_agent, flat_prompt, golden_path, raw_prompt

CAN_TRANSFER = "You have the ability to transfer this conversation to a human agent"
CANNOT_TRANSFER = "You cannot hand this conversation to a human agent"


def flat(text: str) -> str:
    return " ".join(text.split())


@pytest.fixture
def links_legacy(monkeypatch):
    """The recorded prompts predate the links clause; compare against them with it off."""
    monkeypatch.setattr(settings, "AGENT_LINKS_DEFER_TO_INSTRUCTIONS", False)


@pytest.fixture
def urgent_on(monkeypatch):
    monkeypatch.setattr(settings, "AGENT_URGENT_HANDOVER_RULES", True)
    monkeypatch.setattr(settings, "AGENT_URGENT_HANDOVER_ORGS", "")


class TestRollout:
    def test_off_by_default(self):
        assert settings.AGENT_URGENT_HANDOVER_RULES is False
        assert urgent_handover_on(ORG_ID) is False

    def test_an_org_list_limits_it_to_those_orgs(self, monkeypatch):
        monkeypatch.setattr(settings, "AGENT_URGENT_HANDOVER_RULES", True)
        monkeypatch.setattr(settings, "AGENT_URGENT_HANDOVER_ORGS", ORG_ID)

        assert urgent_handover_on(ORG_ID) is True
        assert urgent_handover_on(str(uuid4())) is False
        assert flat(URGENT_HANDOVER_RULES) in flat_prompt(build_agent(transfer=True, groups=["support"]))

    def test_an_org_off_the_list_keeps_its_old_prompt(self, monkeypatch, links_legacy):
        monkeypatch.setattr(settings, "AGENT_URGENT_HANDOVER_RULES", True)
        monkeypatch.setattr(settings, "AGENT_URGENT_HANDOVER_ORGS", str(uuid4()))

        prompt = raw_prompt(build_agent(**CASES["transfer_with_group"]))
        assert prompt == golden_path("transfer_with_group").read_text(encoding="utf-8")

    def test_the_list_ignores_case(self, monkeypatch):
        monkeypatch.setattr(settings, "AGENT_URGENT_HANDOVER_RULES", True)
        monkeypatch.setattr(settings, "AGENT_URGENT_HANDOVER_ORGS", ORG_ID.lower())

        assert urgent_handover_on(ORG_ID.upper()) is True

    def test_a_list_of_orgs_with_spaces_matches_each(self, monkeypatch):
        other = str(uuid4())
        monkeypatch.setattr(settings, "AGENT_URGENT_HANDOVER_RULES", True)
        monkeypatch.setattr(settings, "AGENT_URGENT_HANDOVER_ORGS", f" {other} , {ORG_ID.upper()},")

        assert urgent_handover_on(ORG_ID) is True
        assert urgent_handover_on(other) is True
        assert urgent_handover_on(str(uuid4())) is False

    def test_the_settings_load_a_comma_separated_list_from_the_environment(self, monkeypatch):
        # A set-typed field is JSON-decoded from the environment and crashed startup
        monkeypatch.setenv("AGENT_URGENT_HANDOVER_RULES", "true")
        monkeypatch.setenv("AGENT_URGENT_HANDOVER_ORGS", f"{ORG_ID}, other-org")

        loaded = Settings()

        assert loaded.AGENT_URGENT_HANDOVER_RULES is True
        assert loaded.AGENT_URGENT_HANDOVER_ORGS == f"{ORG_ID}, other-org"

    def test_the_switch_off_wins_over_the_list(self, monkeypatch):
        monkeypatch.setattr(settings, "AGENT_URGENT_HANDOVER_RULES", False)
        monkeypatch.setattr(settings, "AGENT_URGENT_HANDOVER_ORGS", ORG_ID)

        assert urgent_handover_on(ORG_ID) is False


class TestPrompt:
    def test_an_agent_that_can_hand_over_is_told_to_on_that_message(self, urgent_on):
        prompt = flat_prompt(build_agent(transfer=True, groups=["support"]))

        assert flat(URGENT_HANDOVER_RULES) in prompt
        assert flat(URGENT_WITHOUT_HANDOVER) not in prompt
        assert CAN_TRANSFER in prompt
        for situation in ("an active dispute with another person or company", "police", "violence",
                          "may be in danger"):
            assert situation in prompt
        assert "Ask for nothing first, not even an email" in prompt
        assert "HIGH_PRIORITY_ISSUE" in prompt

    def test_an_agent_with_handover_off_is_never_told_to_hand_over(self, urgent_on):
        prompt = flat_prompt(build_agent(transfer=False))

        assert flat(URGENT_WITHOUT_HANDOVER) in prompt
        assert flat(URGENT_HANDOVER_RULES) not in prompt
        assert "set transfer_to_human to true in this reply" not in prompt

    @pytest.mark.parametrize("transfer", [True, False])
    def test_what_to_say_about_danger_is_left_to_the_business(self, urgent_on, transfer):
        """Emergency numbers and wording are the business's to write in its own instructions."""
        prompt = flat_prompt(build_agent(transfer=transfer, groups=["support"]))
        assert "emergency services" not in prompt

    def test_handover_on_with_no_group_is_told_it_cannot_hand_over(self, urgent_on):
        """Its handovers are dropped at the end of the turn, so saying it can
        transfer, then giving it the no-handover rule, contradicted itself."""
        prompt = flat_prompt(build_agent(transfer=True, groups=[]))

        assert CANNOT_TRANSFER in prompt
        assert CAN_TRANSFER not in prompt
        assert flat(URGENT_WITHOUT_HANDOVER) in prompt

    def test_handover_on_with_no_group_is_unchanged_with_the_rules_off(self):
        assert CAN_TRANSFER in flat_prompt(build_agent(transfer=True, groups=[]))

    @pytest.mark.parametrize("transfer", [True, False])
    def test_an_ask_is_not_repeated(self, urgent_on, transfer):
        assert flat(NO_REPEAT_ASK_RULE) in flat_prompt(build_agent(transfer=transfer, groups=["support"]))

    def test_a_workflow_step_gets_none_of_it(self, urgent_on, links_legacy):
        prompt = raw_prompt(build_agent(**CASES["workflow"]))
        assert prompt == golden_path("workflow").read_text(encoding="utf-8")

    @pytest.mark.parametrize("case", [
        "transfer_with_group", "transfer_off", "jira", "shopify", "groq",
        "native_ticketing_with_transfer",
    ])
    def test_it_only_adds_its_own_rules(self, urgent_on, links_legacy, case):
        """Take the new rules out and every other part of the prompt is as recorded."""
        prompt = raw_prompt(build_agent(**CASES[case]))
        for added in ("\n" + NO_REPEAT_ASK_RULE, "\n" + URGENT_HANDOVER_RULES + "\n",
                      "\n" + URGENT_WITHOUT_HANDOVER + "\n", TICKET_IDENTITY_SKIP_WHEN_URGENT):
            prompt = prompt.replace(added, "", 1)

        assert prompt == golden_path(case).read_text(encoding="utf-8")


class TestLeadCapture:
    def test_required_fields_are_asked_for_at_most_twice(self, urgent_on):
        prompt = flat_prompt(build_agent(lead=True))

        assert LEAD_REQUIRED_FIELD_LIMIT in prompt
        assert "keep asking for a required field until you have it" not in prompt
        assert flat(LEAD_CAPTURE_YIELDS) in prompt
        # With asks capped, a visitor who never answers must not keep the chat open
        assert flat(LEAD_END_CHAT_AFTER_TWO_ASKS) in prompt

    def test_unchanged_with_the_rules_off(self):
        prompt = flat_prompt(build_agent(lead=True))

        assert LEAD_REQUIRED_FIELD_LEGACY in prompt
        assert flat(LEAD_CAPTURE_YIELDS) not in prompt
        assert flat(LEAD_END_CHAT_AFTER_TWO_ASKS) not in prompt


class TestTicketIdentity:
    def test_an_urgent_ticket_does_not_wait_for_an_email(self, urgent_on):
        prompt = flat_prompt(build_agent(transfer=False, ticketing=True))
        assert flat(TICKET_IDENTITY_SKIP_WHEN_URGENT) in prompt

    def test_unchanged_with_the_rules_off(self):
        assert flat(TICKET_IDENTITY_SKIP_WHEN_URGENT) not in flat_prompt(build_agent(transfer=False, ticketing=True))


def transfer_agent(busy: bool) -> TransferResponseAgent:
    with patch('app.agents.transfer_agent.create_model', return_value=MagicMock()), \
         patch('app.agents.transfer_agent.Agent') as agent_cls:
        agent = TransferResponseAgent(api_key="k", model_name="gpt-4", busy_team_line=busy)
    agent.instructions = agent_cls.call_args.kwargs["instructions"]
    return agent


def handover_prompt_for(agent: TransferResponseAgent) -> str:
    agent.agent.arun = AsyncMock(return_value=MagicMock(content="ok"))
    with patch('app.agents.transfer_agent.parse_response_content', return_value=SimpleNamespace(message="ok")):
        asyncio.run(agent.get_transfer_response(
            chat_history=[SimpleNamespace(message_type="user", message="I was attacked")],
            business_hours={}, available_agents=2, is_business_hours=True))
    return agent.agent.arun.await_args.kwargs["message"]


class TestBusyTeamHandoverLine:
    """"Let me connect you" read as an instant reply; the customer then waited
    23 minutes. The handover line now says the team is busy, has been
    notified, and will be there as soon as possible."""

    def test_the_handover_line_says_the_team_is_busy_and_notified(self):
        agent = transfer_agent(busy=True)

        assert BUSY_TEAM_INSTRUCTION in handover_prompt_for(agent)
        assert any(BUSY_TEAM_INSTRUCTION in line for line in agent.instructions)
        assert not any("better qualified agent" in line for line in agent.instructions)

    def test_unchanged_with_the_rules_off(self):
        agent = transfer_agent(busy=False)
        prompt = handover_prompt_for(agent)

        assert BUSY_TEAM_INSTRUCTION not in prompt
        assert "explain that you need to transfer to a human agent who can better assist them" in prompt
        assert any("better qualified agent" in line for line in agent.instructions)

    @pytest.mark.parametrize("busy, expected", [(True, BUSY_TEAM_TIMEOUT_MESSAGE), (False, TRANSFER_TIMEOUT_MESSAGE)])
    def test_a_timed_out_handover_line_uses_the_same_wording(self, busy, expected):
        agent = transfer_agent(busy=busy)
        agent.agent.arun = AsyncMock(side_effect=asyncio.TimeoutError)

        reply = asyncio.run(agent.get_transfer_response(
            chat_history=[], business_hours={}, available_agents=1, is_business_hours=True))

        assert reply == {"message": expected, "transfer_to_human": True}

    @pytest.mark.parametrize("org_listed", [True, False])
    def test_it_follows_the_org_rollout(self, monkeypatch, org_listed):
        monkeypatch.setattr(settings, "AGENT_URGENT_HANDOVER_RULES", True)
        monkeypatch.setattr(settings, "AGENT_URGENT_HANDOVER_ORGS", ORG_ID if org_listed else str(uuid4()))
        group = SimpleNamespace(id=str(uuid4()))
        agent = SimpleNamespace(groups=[group], organization=SimpleNamespace(id=ORG_ID, business_hours=None),
                                name="Reception", display_name=None, jira_enabled=False, id=str(uuid4()))
        responder = MagicMock()
        responder.get_transfer_response = AsyncMock(return_value={"message": "ok", "transfer_to_human": True})

        with patch('app.agents.transfer_agent.CustomerRepository'), \
             patch('app.agents.transfer_agent.GroupRepository') as groups, \
             patch('app.agents.transfer_agent.is_within_business_hours', return_value=True), \
             patch('app.agents.transfer_agent.release_connection'), \
             patch('app.agents.transfer_agent.TransferResponseAgent', return_value=responder) as made:
            groups.return_value.get_group_with_users.return_value = SimpleNamespace(users=[])
            asyncio.run(get_agent_availability_response(
                agent, None, [], MagicMock(), "k", "gpt-4", "OPENAI", str(uuid4())))

        assert made.call_args.kwargs["busy_team_line"] is org_listed

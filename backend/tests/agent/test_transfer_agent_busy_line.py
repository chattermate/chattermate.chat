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

"Let me connect you" read as an instant reply; a customer then waited 23
minutes in silence. Behind AGENT_HANDOVER_BUSY_LINE the handover line says the
team is busy, has been notified, and will be there as soon as possible.
"""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from app.agents.transfer_agent import (
    BUSY_TEAM_INSTRUCTION,
    BUSY_TEAM_TIMEOUT_MESSAGE,
    TRANSFER_TIMEOUT_MESSAGE,
    TransferResponseAgent,
    busy_team_line_on,
    get_agent_availability_response,
)
from app.core.config import Settings, settings

ORG_ID = "00000000-0000-0000-0000-0000000000aa"


class TestRollout:
    def test_off_by_default(self):
        assert settings.AGENT_HANDOVER_BUSY_LINE is False
        assert busy_team_line_on(ORG_ID) is False

    def test_on_for_every_org_without_a_list(self, monkeypatch):
        monkeypatch.setattr(settings, "AGENT_HANDOVER_BUSY_LINE", True)
        monkeypatch.setattr(settings, "AGENT_HANDOVER_BUSY_LINE_ORGS", "")
        assert busy_team_line_on(ORG_ID) is True

    def test_a_list_of_orgs_limits_it_to_those_orgs_in_any_case(self, monkeypatch):
        other = str(uuid4())
        monkeypatch.setattr(settings, "AGENT_HANDOVER_BUSY_LINE", True)
        monkeypatch.setattr(settings, "AGENT_HANDOVER_BUSY_LINE_ORGS", f" {other} , {ORG_ID.upper()},")

        assert busy_team_line_on(ORG_ID) is True
        assert busy_team_line_on(other) is True
        assert busy_team_line_on(str(uuid4())) is False

    def test_the_switch_off_wins_over_the_list(self, monkeypatch):
        monkeypatch.setattr(settings, "AGENT_HANDOVER_BUSY_LINE", False)
        monkeypatch.setattr(settings, "AGENT_HANDOVER_BUSY_LINE_ORGS", ORG_ID)
        assert busy_team_line_on(ORG_ID) is False

    def test_the_settings_load_a_comma_separated_list_from_the_environment(self, monkeypatch):
        # A set-typed field is JSON-decoded from the environment and crashed startup
        monkeypatch.setenv("AGENT_HANDOVER_BUSY_LINE", "true")
        monkeypatch.setenv("AGENT_HANDOVER_BUSY_LINE_ORGS", f"{ORG_ID}, other-org")

        loaded = Settings()

        assert loaded.AGENT_HANDOVER_BUSY_LINE is True
        assert loaded.AGENT_HANDOVER_BUSY_LINE_ORGS == f"{ORG_ID}, other-org"


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


class TestBusyTeamLine:
    def test_the_handover_line_says_the_team_is_busy_and_notified(self):
        agent = transfer_agent(busy=True)

        assert BUSY_TEAM_INSTRUCTION in handover_prompt_for(agent)
        assert any(BUSY_TEAM_INSTRUCTION in line for line in agent.instructions)
        assert not any("better qualified agent" in line for line in agent.instructions)

    def test_unchanged_with_the_switch_off(self):
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
        monkeypatch.setattr(settings, "AGENT_HANDOVER_BUSY_LINE", True)
        monkeypatch.setattr(settings, "AGENT_HANDOVER_BUSY_LINE_ORGS", ORG_ID if org_listed else str(uuid4()))
        agent = SimpleNamespace(groups=[SimpleNamespace(id=str(uuid4()))],
                                organization=SimpleNamespace(id=ORG_ID, business_hours=None),
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

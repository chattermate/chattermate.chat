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
from unittest.mock import AsyncMock, MagicMock, Mock, patch
from uuid import uuid4

import pytest

from app.agents.handover_prompt import (
    _URGENT_REPLY_KEPT,
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
from app.core.config import Settings, settings
from app.models.schemas.chat import ChatResponse, TransferReasonType
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
                          "may be in danger", "local emergency services"):
            assert situation in prompt
        assert "Ask for nothing first, not even an email" in prompt
        assert "HIGH_PRIORITY_ISSUE" in prompt

    def test_an_agent_with_handover_off_is_never_told_to_hand_over(self, urgent_on):
        prompt = flat_prompt(build_agent(transfer=False))

        assert flat(URGENT_WITHOUT_HANDOVER) in prompt
        assert flat(URGENT_HANDOVER_RULES) not in prompt
        assert "set transfer_to_human to true in this reply" not in prompt
        assert "local emergency services" in prompt

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

    def test_an_agent_with_tools_is_told_the_urgent_reply_is_kept(self, urgent_on):
        """Its tools-or-person rules say a handover replaces the reply; the
        urgent handover is the one exception, or the model drops the
        emergency line."""
        prompt = flat_prompt(build_agent(transfer=True, groups=["support"], shopify=True))

        assert "the customer sees nothing else you wrote that turn" in prompt
        assert flat(_URGENT_REPLY_KEPT) in prompt
        assert prompt.index(flat(URGENT_HANDOVER_RULES)) < prompt.index(flat(_URGENT_REPLY_KEPT))

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
                      "\n" + URGENT_WITHOUT_HANDOVER + "\n", TICKET_IDENTITY_SKIP_WHEN_URGENT,
                      _URGENT_REPLY_KEPT):
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


def urgent_reply(message="I'm sorry this happened. If you're in danger now, call local emergency services.",
                 reason=TransferReasonType.HIGH_PRIORITY_ISSUE) -> ChatResponse:
    return ChatResponse(message=message, transfer_to_human=True, transfer_reason=reason,
                        transfer_description="Assault reported", end_chat=False,
                        request_rating=False, create_ticket=False)


def finished_turn(agent, reply: ChatResponse):
    chat_repo = Mock()
    chat_repo.create_message.return_value = SimpleNamespace(id=1)
    with patch('app.agents.chat_agent.parse_response_content', return_value=reply):
        return asyncio.run(agent._finish_turn(
            Mock(), None, str(uuid4()), agent.org_id, agent.agent_id, agent.customer_id,
            Mock(), chat_repo))


class TestUrgentLeadIn:
    """Setting transfer_to_human replaces the model's reply with the handover
    line, so "call emergency services" would never reach the customer. On an
    urgent handover the model's words now go first."""

    def _handover(self, agent, reply):
        agent._handle_transfer = AsyncMock(return_value=reply)
        finished_turn(agent, reply)
        return agent._handle_transfer.await_args.kwargs["lead_in"]

    def test_an_urgent_handover_keeps_what_the_model_said(self, urgent_on):
        agent = build_agent(transfer=True, groups=["support"])
        assert self._handover(agent, urgent_reply()) == urgent_reply().message

    def test_any_other_handover_still_replaces_it(self, urgent_on):
        agent = build_agent(transfer=True, groups=["support"])
        assert self._handover(agent, urgent_reply(reason=TransferReasonType.DIRECT_REQUEST)) is None

    def test_not_with_the_rules_off(self):
        agent = build_agent(transfer=True, groups=["support"])
        assert self._handover(agent, urgent_reply()) is None

    def test_not_when_the_model_wrote_nothing(self, urgent_on):
        agent = build_agent(transfer=True, groups=["support"])
        assert self._handover(agent, urgent_reply(message="")) is None

    def test_not_when_the_output_guardrail_replaced_it(self, urgent_on):
        agent = build_agent(transfer=True, groups=["support"])
        with patch('app.agents.chat_agent.check_output', return_value=("Sorry, I can't share that.", ["leak"])):
            assert self._handover(agent, urgent_reply()) is None

    def test_not_when_the_reply_was_a_scope_refusal(self, urgent_on):
        agent = build_agent(transfer=True, groups=["support"])
        reply = urgent_reply(message="I can only help with questions about this business.")
        assert self._handover(agent, reply) is None

    def test_the_models_own_words_survive_a_product_list(self, urgent_on):
        """A channel reply with products gets a product list appended; the
        lead-in is still what the model said."""
        agent = build_agent(transfer=True, groups=["support"])

        def add_list(reply):
            reply.message += "\n\n1. Board - 99.00"

        agent._products_for_surface = add_list
        assert self._handover(agent, urgent_reply()) == urgent_reply().message

    def test_the_customer_sees_it_before_the_handover_line(self, urgent_on):
        agent = build_agent(transfer=True, groups=[SimpleNamespace(id=str(uuid4()))])
        availability = {"message": "A member of our team will be with you shortly.", "transfer_to_human": True}
        db = MagicMock()
        db.query.return_value.join.return_value.filter.return_value.all.return_value = []
        chat_repo = Mock()
        chat_repo.get_session_history = AsyncMock(return_value=[])
        chat_repo.create_message.return_value = SimpleNamespace(id=1)

        with patch('app.agents.chat_agent.get_agent_availability_response', AsyncMock(return_value=availability)), \
             patch('app.agents.chat_agent.notify_chat_event', AsyncMock()), \
             patch('app.agents.chat_agent.SessionToAgentRepository'):
            reply = asyncio.run(agent._handle_transfer(
                urgent_reply(), str(uuid4()), agent.org_id, agent.agent_id, agent.customer_id,
                db, chat_repo, lead_in="Please call local emergency services now."))

        assert reply.message == ("Please call local emergency services now.\n\n"
                                 "A member of our team will be with you shortly.")
        stored = chat_repo.create_message.call_args.args[0]
        assert stored["message"] == reply.message

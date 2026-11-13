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

The redesigned widget's answer extras: what a reply carries, what the agent is
told about follow-ups, and which agents offer them.
"""

from types import SimpleNamespace
from unittest.mock import patch

import pytest

from app.agents.choice_prompt import choice_instructions
from app.channels.interactive_limits import TELEGRAM_LIMITS, WEB_LIMITS, WIDGET_FOLLOW_UP_LIMITS
from app.models.schemas.chat import ChannelChatResponse, ChatResponse
from app.services.handover_payload import handover_payload
from app.services.widget_answers import follow_up_limits, offers_follow_ups, serves_redesign_to_visitors
from app.services.widget_reply import (
    FOLLOW_UPS_SESSION_KEY, REDESIGN_SESSION_KEY, choice_limits_for, reply_payload, widget_agent_kwargs,
)


def _reply(**fields):
    base = dict(message="Hi", transfer_to_human=False, end_chat=False, request_rating=False, create_ticket=False)
    return ChatResponse(**{**base, **fields})


def _agent(metadata):
    return SimpleNamespace(customization=SimpleNamespace(customization_metadata=metadata))


V2 = {"widget_ui": {"version": 2}}


class TestReplyPayload:
    def test_carries_what_the_agent_stored(self):
        trace = {"turn_id": "t-1", "duration_ms": 900, "steps": []}
        agent = SimpleNamespace(last_bot_message_id=42, last_trace=trace, last_handover={"state": "connecting"})
        payload = reply_payload(_reply(transfer_to_human=True), "s-1", agent)
        assert payload["message_id"] == 42 and payload["turn_id"] == "t-1" and payload["trace"] == trace
        assert payload["handover"] == {"state": "connecting"}

    def test_a_canned_transfer_reply_has_no_card(self):
        """The queued-chat replies are not stored with a card: live must match a reload."""
        assert reply_payload(_reply(transfer_to_human=True), "s-1")["handover"] is None

    def test_follow_ups_are_clamped_for_chips(self):
        reply = ChannelChatResponse(message="Hi", transfer_to_human=False, end_chat=False, request_rating=False,
                                    create_ticket=False, quick_replies=["A", "x" * 41, "B", "C", "D"])
        assert reply_payload(reply, "s-1", limits=WIDGET_FOLLOW_UP_LIMITS)["quick_replies"] == ["A", "B", "C"]

    def test_the_agents_choices_are_cut_to_a_button(self):
        """Choices (channel_quick_replies) keep a long one, cut; four fit."""
        reply = ChannelChatResponse(message="Which?", transfer_to_human=False, end_chat=False, request_rating=False,
                                    create_ticket=False, quick_replies=["A", "x" * 41, "B", "C", "D"])
        assert reply_payload(reply, "s-1", limits=WEB_LIMITS)["quick_replies"] == ["A", "x" * 40, "B", "C"]

    @pytest.mark.parametrize("session, expected", [
        ({"offer_choices": True, "follow_ups": True}, "choices"),
        ({"offer_choices": True}, "choices"),
        ({"follow_ups": True}, "follow_ups"),
        ({}, None),
    ])
    def test_the_agents_choices_come_before_follow_ups(self, session, expected):
        limits = choice_limits_for(session)
        kind = None if limits is None else ("follow_ups" if limits.follow_ups else "choices")
        assert kind == expected

    def test_an_old_style_reply_has_empty_extras(self):
        payload = reply_payload(_reply(), "s-1")
        assert payload["message_id"] is None and payload["turn_id"] is None
        assert payload["quick_replies"] is None and payload["handover"] is None

    def test_follow_up_choices_are_sent(self):
        reply = ChannelChatResponse(message="Hi", transfer_to_human=False, end_chat=False, request_rating=False,
                                    create_ticket=False, quick_replies=["Do you ship to Canada?"])
        assert reply_payload(reply, "s-1")["quick_replies"] == ["Do you ship to Canada?"]

    def test_team_notes_are_still_kept_back(self):
        payload = reply_payload(_reply(transfer_description="angry customer"), "s-1")
        assert "transfer_description" not in payload


class TestHandoverPayload:
    def test_a_live_transfer_is_connecting(self):
        assert handover_payload(_reply(transfer_to_human=True)) == {"state": "connecting"}

    def test_nobody_online_is_offline(self):
        reply = _reply()
        reply.request_contact = True
        assert handover_payload(reply) == {"state": "offline"}

    def test_a_plain_answer_has_no_card(self):
        assert handover_payload(_reply()) is None


class TestFollowUpSwitch:
    def test_on_for_a_redesign_agent_that_turned_them_on(self):
        agent = _agent({**V2, "answers": {"follow_ups": True}})
        assert offers_follow_ups(agent) and serves_redesign_to_visitors(agent)

    @pytest.mark.parametrize("metadata", [
        {**V2, "answers": {"follow_ups": "yes"}},
        {**V2},
        {"widget_ui": {"version": 1}, "answers": {"follow_ups": True}},
        {},
    ])
    def test_off_otherwise(self, metadata):
        assert not offers_follow_ups(_agent(metadata))

    def test_the_kill_switch_turns_them_off(self):
        with patch("app.services.widget_ui.settings.WIDGET_UI_V2_ENABLED", False):
            assert not offers_follow_ups(_agent({**V2, "answers": {"follow_ups": True}}))

    def test_an_agent_without_a_customization(self):
        assert not serves_redesign_to_visitors(SimpleNamespace(customization=None))
        assert not serves_redesign_to_visitors(None)

    def test_limits(self):
        assert follow_up_limits(True) is WIDGET_FOLLOW_UP_LIMITS and follow_up_limits(False) is None


class TestFollowUpPrompt:
    def test_follow_ups_are_described_as_next_questions(self):
        text = choice_instructions(WIDGET_FOLLOW_UP_LIMITS)
        assert "follow-up questions" in text and "up to 3" in text and "40 characters" in text
        assert "at most 3 options" in text

    def test_channel_choices_are_unchanged(self):
        assert "follow-up" not in choice_instructions(TELEGRAM_LIMITS)


class TestAgentKwargs:
    def _session(self, **flags):
        config = SimpleNamespace(encrypted_api_key="x", model_name="m", model_type="OPENAI", settings={})
        return {"ai_config": config, "org_id": "o", "agent_id": "a", "customer_id": "c",
                "session_id": "s-1", **flags}

    def test_a_redesign_session_reports_its_steps_and_offers_follow_ups(self):
        with patch("app.services.widget_reply.decrypt_api_key", return_value="k"):
            kwargs = widget_agent_kwargs(self._session(**{REDESIGN_SESSION_KEY: True, FOLLOW_UPS_SESSION_KEY: True}))
        assert kwargs["step_reporter"].session_id == "s-1"
        assert kwargs["choice_limits"] is WIDGET_FOLLOW_UP_LIMITS

    def test_a_classic_session_is_unchanged(self):
        with patch("app.services.widget_reply.decrypt_api_key", return_value="k"):
            kwargs = widget_agent_kwargs(self._session())
        assert kwargs["step_reporter"] is None and kwargs["choice_limits"] is None

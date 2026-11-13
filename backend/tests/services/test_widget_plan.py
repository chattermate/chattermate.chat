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


What the visitor's widget may do on the org's plan.
"""

from types import SimpleNamespace
from unittest.mock import patch

import pytest

from app.services import feature_gate, widget_plan

AGENT = SimpleNamespace(organization_id="o-1", customization=SimpleNamespace(
    quick_actions=["Track my order", {"label": "Does it run small?", "match": "/products/*"}],
    chat_initiation_messages=["Need a hand?"]))


def _rows(on: bool):
    with patch.object(widget_plan, "plan_flags", lambda db, org, keys, *a: {k: on for k in keys}):
        return widget_plan.visitor_rows(None, AGENT)


def test_a_plan_with_them_serves_every_page_quick_actions_and_the_greeting():
    assert _rows(True) == {"quick_actions": ["Track my order"], "chat_initiation_messages": ["Need a hand?"]}


def test_free_serves_neither():
    assert _rows(False) == {"quick_actions": [], "chat_initiation_messages": []}


def test_each_is_its_own_flag():
    """Quick actions and the greeting are checked separately."""
    with patch.object(widget_plan, "plan_flags", lambda db, org, keys, *a: {k: k == "chat_initiation" for k in keys}):
        assert widget_plan.visitor_rows(None, AGENT) == {"quick_actions": [], "chat_initiation_messages": ["Need a hand?"]}


def test_an_agent_with_nothing_saved():
    agent = SimpleNamespace(organization_id="o-1", customization=None)
    with patch.object(widget_plan, "plan_flags", lambda db, org, keys, *a: {k: True for k in keys}):
        assert widget_plan.visitor_rows(None, agent) == {"quick_actions": [], "chat_initiation_messages": []}


def test_a_self_hosted_install_gets_everything():
    with patch("app.services.feature_gate.plan_snapshot", None):
        assert all(widget_plan.features(None, "o-1", widget_plan.SOCKET_FEATURES + widget_plan.PAGE_FEATURES).values())


@pytest.mark.parametrize("session, allowed", [
    ({"plan_features": {"conversation_history": True}}, True),
    ({"plan_features": {"conversation_history": False}}, False),
    ({"plan_features": {}}, False),
    ({}, False),
    ({"plan_features": "yes"}, False),
    (None, False),
])
def test_a_session_allows_only_what_its_plan_read_said(session, allowed):
    assert widget_plan.session_allows(session, "conversation_history") is allowed


class TestPlanFlagOn:
    """feature_gate.plan_flags: newer flags never take a paid feature away before
    the enterprise migration names them."""

    @staticmethod
    def _flag(features, otherwise=True, feature="quick_actions"):
        reads = (lambda db, org: {"features": features}) if not isinstance(features, Exception) \
            else (lambda db, org: (_ for _ in ()).throw(features))
        with patch.object(feature_gate, "plan_snapshot", reads):
            return feature_gate.plan_flag_on(None, "o-1", feature, otherwise=otherwise)

    def test_the_plan_says_yes_or_no(self):
        assert self._flag({"chat": True, "quick_actions": True}) is True
        assert self._flag({"chat": True, "quick_actions": False}) is False

    def test_a_plan_that_does_not_name_it_yet_has_it(self):
        """Between the OSS deploy and the enterprise migration."""
        assert self._flag({"chat": True}) is True

    def test_an_org_with_no_plan_has_nothing(self):
        assert self._flag({}) is False
        assert self._flag(None) is False

    def test_one_read_answers_every_flag(self):
        reads = []
        with patch.object(feature_gate, "plan_snapshot", lambda db, org: reads.append(org) or {"features": {"chat": True}}):
            assert feature_gate.plan_flags(None, "o-1", ("quick_actions", "follow_ups")) == \
                {"quick_actions": True, "follow_ups": True}
        assert reads == ["o-1"]

    def test_a_failed_read_gives_the_callers_choice(self):
        assert self._flag(RuntimeError("redis"), otherwise=True) is True
        assert self._flag(RuntimeError("redis"), otherwise=False) is False

    def test_widget_features_stay_on_through_a_failed_read(self):
        with patch.object(feature_gate, "plan_snapshot", side_effect=RuntimeError("redis")):
            assert all(widget_plan.features(None, "o-1", widget_plan.SOCKET_FEATURES).values())

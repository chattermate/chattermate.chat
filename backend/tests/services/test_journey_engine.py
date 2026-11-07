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

from datetime import datetime, timedelta, timezone

import pytest

from app.models.schemas.journey import Audience, Condition, JourneyDefinition, Start
from app.services.journey_engine import (
    Signals, audience_matches, condition_holds, field_holds, is_new_user, render, start_matches,
    step_reached, url_matches, variables_in,
)


@pytest.mark.parametrize("pattern, url, expected", [
    ("/invoices/new*", "https://app.example.com/invoices/new?x=1", True),
    ("/invoices/new*", "https://app.example.com/invoices/newest", True),
    ("/invoices/new", "https://app.example.com/invoices/new/2", False),
    ("/dashboard*", "https://app.example.com/", False),
    ("https://app.example.com/*", "https://app.example.com/a", True),
    ("/a.b", "https://x/aXb", False),  # dots are literal
    ("/x", None, False),
])
def test_url_matches(pattern, url, expected):
    assert url_matches(pattern, url) is expected


@pytest.mark.parametrize("value, op, operand, expected", [
    ("free", None, None, True),
    ("", "exists", None, False),
    (None, "exists", None, False),
    ("free", "eq", "free", True),
    (3, "eq", "3", True),
    ("pro", "neq", "free", True),
    (2, "gte", 1, True),
    ("2", "gt", 1, True),
    ("abc", "gt", 1, False),
    (True, "gt", 0, False),
    (0, "lt", 1, True),
    (5, "lte", 5, True),
])
def test_field_holds(value, op, operand, expected):
    assert field_holds(value, op, operand) is expected


def test_conditions_by_kind():
    signals = Signals(url="https://a/billing", events={"invoice_sent"}, actions={"open_page"},
                      ctx={"plan": "free"}, user={"email": "a@b.co"})
    assert condition_holds(Condition(kind="url", value="/billing"), signals)
    assert condition_holds(Condition(kind="event", value="invoice_sent"), signals)
    assert condition_holds(Condition(kind="action", value="open_page"), signals)
    assert condition_holds(Condition(kind="ctx", value="plan", op="eq", operand="free"), signals)
    assert condition_holds(Condition(kind="user", value="email"), signals)
    assert not condition_holds(Condition(kind="event", value="other"), signals)


def test_new_users_by_signup_or_first_seen():
    now = datetime(2026, 11, 2, tzinfo=timezone.utc)
    assert is_new_user(None, {"signed_up_at": "2026-10-30T00:00:00Z"}, now, 14)
    assert not is_new_user(now, {"signed_up_at": "2026-01-01T00:00:00Z"}, now, 14)
    assert is_new_user(now - timedelta(days=3), {}, now, 14)
    assert not is_new_user(now - timedelta(days=30), {}, now, 14)
    assert not is_new_user(None, {}, now, 14)
    assert is_new_user(datetime(2026, 11, 1), {"signed_up_at": "garbage"}, now, 14)  # naive first_seen


def test_audience():
    rules = Audience(kind="rules", rules=[Condition(kind="ctx", value="plan", op="eq", operand="free")])
    assert audience_matches(rules, Signals(ctx={"plan": "free"}), new_user=False)
    assert not audience_matches(rules, Signals(ctx={"plan": "pro"}), new_user=True)
    assert not audience_matches(Audience(kind="new_users"), Signals(), new_user=False)
    assert audience_matches(Audience(), Signals(), new_user=False)


def test_start():
    assert start_matches(Start(kind="url", value="/dashboard*"), Signals(url="https://a/dashboard/x"))
    assert start_matches(Start(kind="event", value="signed_up"), Signals(events={"signed_up"}))
    assert not start_matches(Start(kind="manual"), Signals(url="https://a/"))


def test_render_with_fallbacks_and_tidy_spaces():
    signals = Signals(user={"first_name": "Maya"}, ctx={"last_customer": "Acme Ltd"})
    text = render("Hi {{user.first_name}}, invoice {{ ctx.last_customer }} in {{ctx.currency}} now.",
                  signals, {"ctx.currency": "your currency"})
    assert text == "Hi Maya, invoice Acme Ltd in your currency now."
    assert render("Hi {{user.first_name}} there", Signals(), {}) == "Hi there"


def _definition(**step):
    base = {"id": "s1", "title": "One", "done_when": [{"kind": "event", "value": "done"}]}
    return JourneyDefinition(steps=[{**base, **step}])


def test_step_reached_without_triggers_is_immediate():
    definition = _definition()
    assert step_reached(definition.steps[0], Signals())
    definition = _definition(triggers=[{"kind": "url", "value": "/x"}])
    assert not step_reached(definition.steps[0], Signals(url="https://a/y"))


def test_variables_in_messages():
    definition = _definition(message="Hi {{user.first_name}} on {{ctx.plan}}", chips=[{"label": "{{ctx.plan}} it", "value": "x"}])
    assert variables_in(definition) == ["user.first_name", "ctx.plan"]

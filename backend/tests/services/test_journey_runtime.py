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
from unittest.mock import patch

import pytest

from app.models.journey import JourneyProgress, JourneyStatus, JourneyStepProgress, ProgressStatus
from app.models.schemas.agent_action import AgentActionCreate
from app.models.schemas.journey import JourneyWrite
from app.repositories.agent_action import AgentActionRepository
from app.repositories.journey import JourneyProgressRepository, JourneyRepository
from app.services.journey_runtime import JourneyRunner, step_actions_hint, user_fields


def _steps():
    return [
        {"id": "currency", "title": "Set your currency",
         "message": "Hi {{user.first_name}}, pick a currency.",
         "chips": [{"label": "Use GBP", "kind": "action", "value": "set_currency"}, {"label": "Later", "value": "Later"}],
         "allowed_actions": ["set_currency"],
         "done_when": [{"kind": "action", "value": "set_currency"}]},
        {"id": "invoice", "title": "Draft an invoice", "message": "Now draft one for {{ctx.last_customer}}.",
         "triggers": [{"kind": "url", "value": "/invoices/new*"}],
         "done_when": [{"kind": "event", "value": "invoice_drafted"},
                       {"kind": "ctx", "value": "invoices_count", "op": "gte", "operand": 1}],
         "then": {"kind": "block", "value": "```\nnpm i ledgerly\n```"}},
    ]


def _journey(db, agent, key="first_invoice", status="live", priority=0, **definition):
    data = JourneyWrite(key=key, name=key.replace("_", " "), status=status, priority=priority,
                        goal_event="first_invoice_sent",
                        definition={"steps": _steps(), "start": {"kind": "url", "value": "/dashboard*"},
                                    "variable_fallbacks": {"ctx.last_customer": "a customer"}, **definition})
    return JourneyRepository(db).create(agent.organization_id, agent.id, data)


@pytest.fixture
def session(test_agent, test_customer):
    test_customer.full_name = "Maya Patel"
    return {"org_id": test_agent.organization_id, "agent_id": str(test_agent.id),
            "customer_id": str(test_customer.id), "session_id": "s", "host_context": {}}


@pytest.fixture
def action(db, test_agent):
    return AgentActionRepository(db).create(test_agent.organization_id, test_agent.id, AgentActionCreate(
        name="set_currency", label="Set default currency", description="Sets it.", confirm="when_overwriting"))


def _runner(db, session, url=None, **ctx):
    session["host_url"] = url
    session["host_context"] = {**session.get("host_context", {}), **ctx}
    return JourneyRunner(db, session)


def test_nothing_starts_off_the_start_page(db, session, test_agent):
    _journey(db, test_agent)
    assert _runner(db, session, "https://app.x/settings").sync() is None


def test_start_shows_the_first_step_once(db, session, test_agent, action):
    _journey(db, test_agent)
    view = _runner(db, session, "https://app.x/dashboard").sync()
    assert view["step_id"] == "currency" and view["step_index"] == 0 and view["step_count"] == 2
    assert view["step_titles"] == [s["title"] for s in _steps()]
    assert view["message"] == "Hi Maya, pick a currency."
    assert view["chips"][0] == {"label": "Use GBP", "kind": "action", "value": "set_currency",
                                "action": {"label": "Set default currency", "confirm": "when_overwriting", "timeout_s": 20}}
    assert view["fresh"] is True
    # Shown again after a reload (it isn't in the chat until answered), but not fresh.
    again = _runner(db, session, "https://app.x/dashboard").sync()
    assert again["step_id"] == "currency" and again["message"] == "Hi Maya, pick a currency."
    assert again["fresh"] is False


def test_an_action_chip_for_a_missing_action_is_dropped(db, session, test_agent):
    _journey(db, test_agent)
    view = _runner(db, session, "https://app.x/dashboard").sync()
    assert [c["label"] for c in view["chips"]] == ["Later"]


def _hideable_journey(db, agent):
    steps = _steps()
    steps[0]["chips"] = [
        {"label": "Read my site", "value": "Read my site",
         "hide_when": {"kind": "ctx", "value": "sources_learning", "op": "gt", "operand": 0}},
        {"label": "Paste text", "value": "Paste text"},
    ]
    return _journey(db, agent, steps=steps)


@pytest.mark.parametrize("context, labels", [
    ({}, ["Read my site", "Paste text"]),
    ({"sources_learning": 0}, ["Read my site", "Paste text"]),
    ({"sources_learning": 1}, ["Paste text"]),
])
def test_a_chip_shows_only_while_its_hide_when_does_not_hold(db, session, test_agent, context, labels):
    _hideable_journey(db, test_agent)
    session["host_context"] = context
    view = _runner(db, session, "https://app.x/dashboard").sync()
    assert [c["label"] for c in view["chips"]] == labels


def test_a_hidden_chip_comes_back_when_the_condition_stops_holding(db, session, test_agent):
    """A site that couldn't be read: they need the chip again."""
    _hideable_journey(db, test_agent)
    session["host_context"] = {"sources_learning": 1}
    _runner(db, session, "https://app.x/dashboard").sync()
    session["host_context"] = {"sources_learning": 0}
    view = _runner(db, session, "https://app.x/dashboard").sync()
    assert [c["label"] for c in view["chips"]] == ["Read my site", "Paste text"]


def test_done_moves_on_and_waits_for_the_next_page(db, session, test_agent, action):
    _journey(db, test_agent)
    _runner(db, session, "https://app.x/dashboard").sync()
    view = _runner(db, session, "https://app.x/dashboard").sync(actions=["set_currency"])
    assert view["waiting"] is True and view["step_index"] == 1 and view["message"] is None
    view = _runner(db, session, "https://app.x/invoices/new").sync()
    assert view["step_id"] == "invoice" and view["message"] == "Now draft one for a customer."


def test_one_event_finishes_one_step_only(db, session, test_agent, action):
    # Both steps could be "done" by the same action if events carried over.
    steps = _steps()
    steps[1]["triggers"] = []
    steps[1]["done_when"] = [{"kind": "action", "value": "set_currency"}]
    _journey(db, test_agent, steps=steps)
    _runner(db, session, "https://app.x/dashboard").sync()
    view = _runner(db, session).sync(actions=["set_currency"])
    assert view["step_id"] == "invoice"


def test_finishing_shows_the_block_and_the_finish_message(db, session, test_agent, action):
    _journey(db, test_agent, finish={"message": "All done, {{user.first_name}}!"})
    _runner(db, session, "https://app.x/dashboard").sync()
    _runner(db, session, "https://app.x/dashboard").sync(actions=["set_currency"])
    view = _runner(db, session, "https://app.x/invoices/new", invoices_count=1).sync()
    assert view["finished"] is True
    assert view["message"] == "All done, Maya!"
    assert view["notice"]["kind"] == "block" and "npm i ledgerly" in view["notice"]["text"]
    progress = db.query(JourneyProgress).one()
    assert progress.status == "finished" and progress.finished_at is not None
    # Once through, it doesn't start again.
    assert _runner(db, session, "https://app.x/dashboard").sync() is None


def test_goal_event_is_recorded(db, session, test_agent):
    journey = _journey(db, test_agent)
    _runner(db, session, "https://app.x/dashboard").sync()
    _runner(db, session).sync(events=["first_invoice_sent"])
    assert db.query(JourneyProgress).filter_by(journey_id=journey.id).one().goal_at is not None


def test_skip_moves_on(db, session, test_agent):
    _journey(db, test_agent)
    _runner(db, session, "https://app.x/dashboard").sync()
    view = _runner(db, session, "https://app.x/invoices/new").skip()
    assert view["step_id"] == "invoice"
    row = db.get(JourneyStepProgress, (db.query(JourneyProgress).one().id, "currency"))
    assert row.skipped_at is not None and row.done_by == "skip"


def test_a_step_that_cannot_be_skipped_stays(db, session, test_agent):
    steps = _steps()
    steps[0]["skippable"] = False
    _journey(db, test_agent, steps=steps)
    _runner(db, session, "https://app.x/dashboard").sync()
    assert _runner(db, session).skip()["step_id"] == "currency"


def test_dismiss_and_never_again(db, session, test_agent):
    _journey(db, test_agent)
    _runner(db, session, "https://app.x/dashboard").sync()
    _runner(db, session).dismiss()
    assert db.query(JourneyProgress).one().status == ProgressStatus.DISMISSED.value
    assert _runner(db, session, "https://app.x/dashboard").sync() is None


def test_priority_picks_the_first_matching_journey(db, session, test_agent):
    _journey(db, test_agent, key="later", priority=5)
    _journey(db, test_agent, key="first", priority=1)
    assert _runner(db, session, "https://app.x/dashboard").sync()["journey_key"] == "first"


def test_audience_rules_and_new_users(db, session, test_agent, test_customer):
    _journey(db, test_agent, audience={"kind": "rules", "rules": [{"kind": "ctx", "value": "plan", "op": "eq", "operand": "free"}]})
    assert _runner(db, session, "https://app.x/dashboard", plan="pro").sync() is None
    assert _runner(db, session, "https://app.x/dashboard", plan="free").sync() is not None


def test_new_users_only(db, session, test_agent, test_customer):
    _journey(db, test_agent, audience={"kind": "new_users"})
    test_customer.created_at = datetime.now(timezone.utc) - timedelta(days=60)
    db.commit()
    assert _runner(db, session, "https://app.x/dashboard").sync() is None


def test_paused_journey_freezes_progress(db, session, test_agent):
    journey = _journey(db, test_agent)
    _runner(db, session, "https://app.x/dashboard").sync()
    JourneyRepository(db).set_status(journey, JourneyStatus.PAUSED)
    assert _runner(db, session, "https://app.x/dashboard").sync() is None
    JourneyRepository(db).set_status(journey, JourneyStatus.LIVE)
    assert _runner(db, session, "https://app.x/dashboard").sync()["step_id"] == "currency"


def test_editing_a_live_journey_moves_users_off_a_deleted_step(db, session, test_agent):
    journey = _journey(db, test_agent)
    _runner(db, session, "https://app.x/dashboard").sync()
    steps = _steps()[1:]
    JourneyRepository(db).update(journey, JourneyWrite(
        key=journey.key, name=journey.name, status="live",
        definition={"steps": steps, "start": {"kind": "url", "value": "/dashboard*"}}))
    assert journey.version == 2
    view = _runner(db, session, "https://app.x/invoices/new").sync()
    assert view["step_id"] == "invoice"
    assert db.query(JourneyProgress).one().journey_version == 2


def test_then_start_another_journey(db, session, test_agent, action):
    steps = _steps()[:1]
    steps[0]["then"] = {"kind": "start_journey", "value": "second"}
    _journey(db, test_agent, key="first", steps=steps)
    _journey(db, test_agent, key="second", start={"kind": "manual"})
    _runner(db, session, "https://app.x/dashboard").sync()
    view = _runner(db, session, "https://app.x/dashboard").sync(actions=["set_currency"])
    assert view["journey_key"] == "second" and view["step_id"] == "currency"


def test_start_journey_from_code_replaces_the_active_one(db, session, test_agent):
    _journey(db, test_agent, key="first")
    _journey(db, test_agent, key="tour", start={"kind": "manual"})
    _runner(db, session, "https://app.x/dashboard").sync()
    view = _runner(db, session).start("tour")
    assert view["journey_key"] == "tour"
    statuses = {p.status for p in db.query(JourneyProgress).all()}
    assert statuses == {"dismissed", "active"}
    assert _runner(db, session).start("nope") is None


def test_plan_without_journeys_shows_nothing(db, session, test_agent):
    _journey(db, test_agent)
    with patch("app.services.journey_runtime.journeys_allowed", return_value=False):
        assert _runner(db, session, "https://app.x/dashboard").sync() is None
        assert _runner(db, session).start("first_invoice") is None


def test_step_actions_hint_names_the_offered_actions_that_finish_the_step(db, session, test_agent, action):
    other = AgentActionRepository(db).create(test_agent.organization_id, test_agent.id, AgentActionCreate(
        name="open_page", label="Open a page", description="Opens one.", confirm="never"))
    journey = _journey(db, test_agent)
    # No journey yet: nothing to suggest.
    assert step_actions_hint(db, session, [action, other]) is None

    _runner(db, session, "https://app.x/dashboard").sync()
    hint = step_actions_hint(db, session, [action, other])
    assert '"Set your currency"' in hint and "set_currency (Set default currency)" in hint
    # A suggestion only: other actions are still offered, just not named for the step.
    assert "open_page" not in hint and "anything else" in hint
    # The page didn't register the step's action this turn: nothing to suggest.
    assert step_actions_hint(db, session, [other]) is None
    # A paused journey suggests nothing.
    JourneyRepository(db).set_status(journey, JourneyStatus.PAUSED)
    assert step_actions_hint(db, session, [action]) is None
    JourneyRepository(db).set_status(journey, JourneyStatus.LIVE)

    # The step after it allows no actions.
    _runner(db, session, "https://app.x/dashboard").sync(actions=["set_currency"])
    assert step_actions_hint(db, session, [action, other]) is None


def test_step_actions_hint_follows_the_plan(db, session, test_agent, action):
    _journey(db, test_agent)
    _runner(db, session, "https://app.x/dashboard").sync()
    with patch("app.services.journey_runtime.journeys_allowed", return_value=False):
        assert step_actions_hint(db, session, [action]) is None


def test_user_fields_from_the_person():
    class Person:
        full_name = "Maya Patel"
        email = "maya@x.co"
        meta_data = {"plan": "pro", "nested": {"no": 1}, 5: "bad"}
    assert user_fields(Person()) == {"plan": "pro", "name": "Maya Patel", "first_name": "Maya", "email": "maya@x.co"}
    assert user_fields(None) == {}


def test_funnel_counts_steps(db, session, test_agent, action):
    journey = _journey(db, test_agent)
    _runner(db, session, "https://app.x/dashboard").sync()
    _runner(db, session, "https://app.x/dashboard").sync(actions=["set_currency"])
    funnel = JourneyProgressRepository(db).funnel(journey, datetime.now(timezone.utc) - timedelta(days=1))
    assert funnel["started"] == 1
    first, second = funnel["steps"]
    assert (first["reached"], first["done"], first["dropped"]) == (1, 1, 0)
    assert first["median_seconds"] is not None
    assert (second["reached"], second["done"]) == (0, 0)


def test_saving_an_older_journey_unchanged_does_not_bump_its_version(db, test_agent):
    journey = _journey(db, test_agent)
    data = JourneyWrite(key=journey.key, name=journey.name, status=journey.status, priority=journey.priority,
                        goal_event=journey.goal_event, definition=journey.definition)
    assert JourneyRepository(db).update(journey, data).version == 1

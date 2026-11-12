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
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID, uuid4

import pytest
from agno.models.response import ToolExecution

from app.agents.chat_agent import ChatResponse
from app.agents.host_actions.turns import PausedTurn
from app.core.config import settings
from app.models.agent_action import ActionCallStatus, AgentActionCall
from app.models.chat_history import ChatHistory
from app.models.schemas.agent_action import AgentActionCreate
from app.repositories.agent_action import AgentActionRepository
from app.repositories.agent_action_call import AgentActionCallRepository
from app.services import host_action_runtime as runtime, widget_journeys, widget_reply


@pytest.fixture
def sio(monkeypatch):
    mock = MagicMock()
    mock.emit = AsyncMock()
    mock.save_session = AsyncMock()
    monkeypatch.setattr(runtime, "sio", mock)
    monkeypatch.setattr(widget_reply, "sio", mock)
    monkeypatch.setattr(widget_journeys, "sio", mock)
    return mock


@pytest.fixture
def actions(db, test_agent):
    repo = AgentActionRepository(db)
    org = test_agent.organization_id
    return {
        "open_page": repo.create(org, test_agent.id, AgentActionCreate(
            name="open_page", label="Go to a page", description="Navigates.", timeout_s=10)),
        "send_invoice": repo.create(org, test_agent.id, AgentActionCreate(
            name="send_invoice", label="Send an invoice", description="Emails it.", confirm="always")),
        "off": repo.create(org, test_agent.id, AgentActionCreate(
            name="off", label="Off", description="Disabled.", enabled=False)),
    }


@pytest.fixture
def session(test_agent, test_customer):
    # As a live socket session holds it: the org id as a UUID, the rest as strings.
    return {
        "widget_id": "w", "org_id": test_agent.organization_id, "agent_id": str(test_agent.id),
        "customer_id": str(test_customer.id), "session_id": str(uuid4()),
    }


def _paused(*calls):
    return PausedTurn(run_id="run-1", calls=[
        ToolExecution(tool_call_id=cid, tool_name=name, tool_args=args, external_execution_required=True)
        for cid, name, args in calls
    ])


def _call_id(db, tool_call_id):
    """The id the widget is given for a call (the row's own id)."""
    return str(db.query(AgentActionCall).filter(AgentActionCall.tool_call_id == tool_call_id).one().id)


def _result(db, tool_call_id, status, **extra):
    return {"call_id": _call_id(db, tool_call_id), "status": status, **extra}


def _emitted(sio, event):
    return [c.args[1] for c in sio.emit.call_args_list if c.args[0] == event]


# --- trust and registration --------------------------------------------------

def test_actions_need_allowed_domains_and_a_matching_origin(db, test_widget):
    assert runtime.page_may_offer_actions(db, str(test_widget.id), "https://app.example.com") is False
    test_widget.allowed_domains = ["app.example.com"]
    db.commit()
    assert runtime.page_may_offer_actions(db, str(test_widget.id), "https://app.example.com") is True
    assert runtime.page_may_offer_actions(db, str(test_widget.id), "https://evil.example.net") is False
    assert runtime.page_may_offer_actions(db, str(test_widget.id), None) is False
    assert runtime.page_may_offer_actions(db, str(uuid4()), "https://app.example.com") is False


def test_registration_keeps_declared_enabled_names(db, session, actions):
    offered = runtime.register_page_actions(db, session, ["open_page", "off", "unknown"])
    assert offered == ["open_page"]
    assert session[runtime.OFFERED_KEY] == ["open_page"]
    assert actions["open_page"].last_registered_at is not None
    assert [a.name for a in runtime.offered_actions(db, session)] == ["open_page"]


def test_disabling_an_action_withdraws_it_from_the_next_turn(db, session, actions):
    runtime.register_page_actions(db, session, ["open_page"])
    AgentActionRepository(db).set_enabled(actions["open_page"], False)
    assert runtime.offered_actions(db, session) == []


# --- pausing -----------------------------------------------------------------

@pytest.mark.asyncio
async def test_pause_records_calls_and_sends_the_first(db, sio, session, actions):
    paused = _paused(("c1", "open_page", {"path": "/billing"}), ("c2", "send_invoice", {"to": "a@b.c"}))
    await runtime.start_paused_turn("sid", session, paused, list(actions.values()), db)

    rows = AgentActionCallRepository(db).batch("run-1")
    assert [(r.tool_call_id, r.status, r.seq) for r in rows] == [("c1", "pending", 0), ("c2", "pending", 1)]
    assert all(r.args_ciphertext and "billing" not in r.args_ciphertext for r in rows)
    [request] = _emitted(sio, "action_request")
    assert request == {"call_id": str(rows[0].id), "name": "open_page", "label": "Go to a page",
                       "args": {"path": "/billing"}, "confirm": "never", "timeout_s": 10}
    assert session[runtime.PAUSES_KEY] == 1


@pytest.mark.asyncio
async def test_a_call_to_a_deleted_action_asks_first(db, sio, session, actions):
    paused = _paused(("c1", "gone", {}))
    await runtime.start_paused_turn("sid", session, paused, [], db)
    [request] = _emitted(sio, "action_request")
    assert request["confirm"] == "always"
    assert request["timeout_s"] == settings.ACTION_TIMEOUT_DEFAULT_S


# --- results -----------------------------------------------------------------

@pytest.fixture
def resumed(monkeypatch):
    mock = AsyncMock()
    monkeypatch.setattr(runtime, "resume_reply", mock)
    return mock


@pytest.mark.asyncio
async def test_ok_result_sends_the_next_call(db, sio, session, actions, resumed):
    await runtime.start_paused_turn("sid", session, _paused(("c1", "open_page", {}), ("c2", "send_invoice", {})),
                                    list(actions.values()), db)
    await runtime.handle_page_result("sid", session, _result(db, "c1", "ok", result={"ok": 1}), db)
    assert [r["call_id"] for r in _emitted(sio, "action_request")] == [_call_id(db, "c1"), _call_id(db, "c2")]
    resumed.assert_not_called()

    await runtime.handle_page_result("sid", session, _result(db, "c2", "ok", result="sent", confirmed=True), db)
    run_id, results = resumed.call_args.args[2], resumed.call_args.args[3]
    assert run_id == "run-1"
    assert '"ok": 1' in results["c1"] and "sent" in results["c2"]
    rows = AgentActionCallRepository(db).batch("run-1")
    assert [(r.status, r.confirmed) for r in rows] == [("ok", None), ("ok", True)]
    assert all(r.latency_ms is not None for r in rows)


@pytest.mark.asyncio
async def test_a_failure_skips_the_rest_and_resumes(db, sio, session, actions, resumed):
    await runtime.start_paused_turn("sid", session, _paused(("c1", "open_page", {}), ("c2", "send_invoice", {})),
                                    list(actions.values()), db)
    await runtime.handle_page_result("sid", session, _result(db, "c1", "declined"), db)
    assert len(_emitted(sio, "action_request")) == 1
    results = resumed.call_args.args[3]
    assert "declined" in results["c1"]
    assert results["c2"] is None  # filled as skipped when the run resumes
    assert [r.status for r in AgentActionCallRepository(db).batch("run-1")] == ["declined", "skipped"]


@pytest.fixture
def strict_action(db, test_agent):
    return AgentActionRepository(db).create(test_agent.organization_id, test_agent.id, AgentActionCreate(
        name="set_currency", label="Change currency", description="Changes it.",
        parameters={"type": "object", "properties": {"code": {"type": "string", "enum": ["USD", "GBP"]}},
                    "required": ["code"]}))


@pytest.mark.asyncio
async def test_arguments_that_break_the_schema_never_reach_the_page(db, sio, session, strict_action, resumed):
    await runtime.start_paused_turn("sid", session, _paused(("c1", "set_currency", {"code": "rm -rf"})),
                                    [strict_action], db)
    assert _emitted(sio, "action_request") == []
    results = resumed.call_args.args[3]
    assert "don't match this action's schema" in results["c1"] and "code" in results["c1"]
    [row] = AgentActionCallRepository(db).batch("run-1")
    assert (row.status, row.error_code) == ("error", "invalid_arguments")


@pytest.mark.asyncio
async def test_a_bad_later_call_is_settled_after_a_good_one(db, sio, session, actions, strict_action, resumed):
    await runtime.start_paused_turn("sid", session, _paused(("c1", "open_page", {}), ("c2", "set_currency", {})),
                                    list(actions.values()) + [strict_action], db)
    await runtime.handle_page_result("sid", session, _result(db, "c1", "ok", result={"ok": 1}), db)
    # Only the first call went to the page; the second was missing its required code.
    assert [r["name"] for r in _emitted(sio, "action_request")] == ["open_page"]
    results = resumed.call_args.args[3]
    assert "'code' is a required property" in results["c2"]


@pytest.mark.asyncio
async def test_arguments_that_fit_are_sent(db, sio, session, strict_action, resumed):
    await runtime.start_paused_turn("sid", session, _paused(("c1", "set_currency", {"code": "GBP"})),
                                    [strict_action], db)
    [request] = _emitted(sio, "action_request")
    assert request["args"] == {"code": "GBP"}
    resumed.assert_not_called()


@pytest.mark.asyncio
async def test_duplicate_and_unknown_results_are_ignored(db, sio, session, actions, resumed):
    await runtime.start_paused_turn("sid", session, _paused(("c1", "open_page", {})), list(actions.values()), db)
    await runtime.handle_page_result("sid", session, _result(db, "c1", "ok"), db)
    await runtime.handle_page_result("sid", session, _result(db, "c1", "error"), db)
    await runtime.handle_page_result("sid", session, {"call_id": str(uuid4()), "status": "ok"}, db)
    assert resumed.call_count == 1
    assert AgentActionCallRepository(db).batch("run-1")[0].status == "ok"


@pytest.mark.asyncio
async def test_only_the_call_that_was_sent_may_be_answered(db, sio, session, actions, resumed):
    await runtime.start_paused_turn("sid", session, _paused(("c1", "open_page", {}), ("c2", "send_invoice", {})),
                                    list(actions.values()), db)
    await runtime.handle_page_result("sid", session, _result(db, "c2", "ok"), db)
    assert [r.status for r in AgentActionCallRepository(db).batch("run-1")] == ["pending", "pending"]
    resumed.assert_not_called()


@pytest.mark.asyncio
async def test_providers_reusing_call_ids_across_runs(db, sio, session, actions, resumed):
    first = PausedTurn(run_id="run-a", calls=[ToolExecution(tool_call_id="call_0", tool_name="open_page",
                                                             tool_args={}, external_execution_required=True)])
    second = PausedTurn(run_id="run-b", calls=[ToolExecution(tool_call_id="call_0", tool_name="open_page",
                                                              tool_args={}, external_execution_required=True)])
    await runtime.start_paused_turn("sid", session, first, list(actions.values()), db)
    await runtime.start_paused_turn("sid", session, second, list(actions.values()), db)
    ids = [r["call_id"] for r in _emitted(sio, "action_request")]
    assert len(set(ids)) == 2


@pytest.mark.asyncio
async def test_another_conversation_cannot_answer_a_call(db, sio, session, actions, resumed):
    await runtime.start_paused_turn("sid", session, _paused(("c1", "open_page", {})), list(actions.values()), db)
    intruder = {**session, "session_id": str(uuid4())}
    await runtime.handle_page_result("sid2", intruder, _result(db, "c1", "ok"), db)
    resumed.assert_not_called()


@pytest.mark.asyncio
@pytest.mark.parametrize("data", [
    {"call_id": str(uuid4()), "status": "maybe"}, {"call_id": 5, "status": "ok"},
    {"call_id": "not-a-uuid", "status": "ok"}, {},
])
async def test_malformed_results_are_refused(db, sio, session, data):
    await runtime.handle_page_result("sid", session, data, db)
    [error] = _emitted(sio, "error")
    assert error["type"] == "validation_error"


# --- expiry and replay -------------------------------------------------------

def _age(db, run_id, seconds):
    for row in AgentActionCallRepository(db).batch(run_id):
        row.created_at = datetime.now(timezone.utc) - timedelta(seconds=seconds)
    db.commit()


@pytest.mark.asyncio
async def test_waiting_on_page_until_the_deadline(db, sio, session, actions):
    await runtime.start_paused_turn("sid", session, _paused(("c1", "open_page", {}), ("c2", "send_invoice", {})),
                                    list(actions.values()), db)
    assert runtime.waiting_on_page(db, session["session_id"]) is True
    _age(db, "run-1", 10 + settings.ACTION_GRACE_S + 1)
    assert runtime.waiting_on_page(db, session["session_id"]) is False
    assert [r.status for r in AgentActionCallRepository(db).batch("run-1")] == ["abandoned", "skipped"]


@pytest.mark.asyncio
async def test_confirm_actions_get_the_confirm_window(db, sio, session, actions):
    await runtime.start_paused_turn("sid", session, _paused(("c1", "send_invoice", {})), list(actions.values()), db)
    _age(db, "run-1", settings.ACTION_TIMEOUT_DEFAULT_S + settings.ACTION_GRACE_S + 1)
    assert runtime.waiting_on_page(db, session["session_id"]) is True


@pytest.mark.asyncio
async def test_reconnect_replays_the_open_call(db, sio, session, actions):
    await runtime.start_paused_turn("sid", session, _paused(("c1", "open_page", {"path": "/x"})),
                                    list(actions.values()), db)
    await runtime.replay_open_call("sid-new", session["session_id"], db)
    replay = sio.emit.call_args_list[-1]
    assert replay.args[0] == "action_request" and replay.kwargs["to"] == "sid-new"
    assert replay.args[1]["args"] == {"path": "/x"}


@pytest.mark.asyncio
async def test_nothing_to_replay(db, sio, session):
    await runtime.replay_open_call("sid", session["session_id"], db)
    sio.emit.assert_not_called()


# --- resuming ----------------------------------------------------------------

@pytest.fixture
def agent(monkeypatch):
    built = MagicMock()
    built.safe_cleanup_mcp_tools = AsyncMock()
    built.continue_response = AsyncMock()
    monkeypatch.setattr(runtime, "build_widget_agent", AsyncMock(return_value=built))
    delivered = AsyncMock()
    monkeypatch.setattr(runtime, "deliver_ai_reply", delivered)
    return SimpleNamespace(built=built, delivered=delivered)


def _reply(text="Done."):
    return ChatResponse(message=text, transfer_to_human=False, end_chat=False, request_rating=False, create_ticket=False)


@pytest.mark.asyncio
async def test_resume_delivers_the_reply(db, sio, session, agent):
    agent.built.continue_response.return_value = _reply()
    await runtime.resume_reply("sid", session, "run-1", {"c1": "ok"}, db)
    assert _emitted(sio, "bot_typing") == [{"session_id": session["session_id"]}]
    assert agent.built.continue_response.call_args.args == ("run-1", {"c1": "ok"})
    assert agent.delivered.call_args.args[2].message == "Done."
    agent.built.safe_cleanup_mcp_tools.assert_awaited()


@pytest.mark.asyncio
async def test_resume_can_pause_again(db, sio, session, actions, agent):
    session[runtime.PAUSES_KEY] = 1
    agent.built.continue_response.return_value = _paused(("c9", "open_page", {}))
    await runtime.resume_reply("sid", session, "run-0", {"c1": "ok"}, db)
    assert [r["call_id"] for r in _emitted(sio, "action_request")] == [_call_id(db, "c9")]
    assert session[runtime.PAUSES_KEY] == 2
    agent.delivered.assert_not_called()


@pytest.mark.asyncio
async def test_pause_limit_tells_the_model_and_answers_for_it(db, sio, session, agent, test_customer):
    session[runtime.PAUSES_KEY] = settings.ACTION_PAUSES_PER_TURN
    agent.built.continue_response.return_value = _paused(("c9", "open_page", {}))
    await runtime.resume_reply("sid", session, "run-0", {"c1": "ok"}, db)
    assert runtime.ACTIONS_LIMIT_NOTE in agent.built.continue_response.call_args.args[1]["c1"]
    assert _emitted(sio, "action_request") == []
    assert agent.delivered.call_args.args[2].message == runtime.UNFINISHED_REPLY
    # Stored like any reply (message text is encrypted at rest, so look it up by session).
    stored = db.query(ChatHistory).filter(ChatHistory.session_id == UUID(session["session_id"])).one()
    assert stored.message_type == "bot" and stored.message == runtime.UNFINISHED_REPLY


@pytest.mark.asyncio
async def test_resume_after_reconnect_keeps_the_runs_own_actions(db, sio, session, actions, agent, monkeypatch):
    await runtime.start_paused_turn("sid", session, _paused(("c1", "open_page", {})), list(actions.values()), db)
    fresh = {**session}
    fresh.pop(runtime.OFFERED_KEY, None)  # a new socket before the page registered again
    agent.built.continue_response.return_value = _reply()
    built_with = AsyncMock(return_value=agent.built)
    monkeypatch.setattr(runtime, "build_widget_agent", built_with)
    await runtime.resume_reply("sid", fresh, "run-1", {"c1": "ok"}, db)
    assert [a.name for a in built_with.call_args.args[1]] == ["open_page"]

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

The live work trace: what reaches the widget while the agent uses its tools.
"""

import pytest

from app.agents.tool_labels import label_for
from app.services.agent_steps import MAX_STEPS, StepReporter


class Recorder:
    def __init__(self, fail=False):
        self.sent = []
        self.fail = fail

    async def __call__(self, event, payload, room):
        if self.fail:
            raise RuntimeError("socket down")
        self.sent.append((event, payload, room))


async def search_kb(query):
    return f"secret result for {query}"


def sync_tool(order_number):
    return {"status": "shipped", "email": "jane@acme.com"}


async def broken(**_):
    raise ValueError("upstream 500")


@pytest.mark.asyncio
class TestStepReporter:
    async def test_a_tool_call_is_a_start_and_a_finish(self):
        emit = Recorder()
        reporter = StepReporter("s-1", emit=emit, turn_id="t-1")
        result = await reporter.tool_hook("search_knowledge_base", search_kb, {"query": "refunds"})
        assert result == "secret result for refunds"
        (start_event, start, room), (_, finish, _) = emit.sent
        assert start_event == "agent_step" and room == "s-1"
        assert start["phase"] == "start" and start["label"] == "Searching the help center"
        assert start["kind"] == "knowledge" and start["turn_id"] == "t-1" and start["seq"] == 1
        assert finish["phase"] == "finish" and finish["done_label"] == "Searched the help center"
        assert finish["status"] == "ok" and finish["step_id"] == start["step_id"]

    async def test_arguments_and_results_never_leave_the_server(self):
        emit = Recorder()
        reporter = StepReporter("s-1", emit=emit)
        await reporter.tool_hook("get_order_status", sync_tool, {"order_number": "#1001"})
        sent = repr([payload for _, payload, _ in emit.sent]) + repr(reporter.summary())
        for private in ("#1001", "jane@acme.com", "shipped", "order_number"):
            assert private not in sent

    async def test_a_sync_tool_runs_too(self):
        reporter = StepReporter("s-1", emit=Recorder())
        assert await reporter.tool_hook("get_order_status", sync_tool, {"order_number": "1"}) == {
            "status": "shipped", "email": "jane@acme.com"}

    async def test_the_groq_capture_tool_is_not_shown(self):
        emit = Recorder()
        reporter = StepReporter("s-1", emit=emit)
        await reporter.tool_hook("json", search_kb, {"query": "x"})
        assert emit.sent == [] and reporter.summary() is None

    async def test_a_failing_tool_finishes_as_an_error_and_still_raises(self):
        emit = Recorder()
        reporter = StepReporter("s-1", emit=emit)
        with pytest.raises(ValueError):
            await reporter.tool_hook("create_ticket", broken, {})
        assert emit.sent[-1][1]["status"] == "error"
        assert reporter.summary()["steps"][0]["status"] == "error"

    async def test_a_dead_socket_never_fails_the_tool(self):
        reporter = StepReporter("s-1", emit=Recorder(fail=True))
        assert await reporter.tool_hook("search_knowledge_base", search_kb, {"query": "q"}) == "secret result for q"

    async def test_steps_past_the_cap_run_but_are_not_shown(self):
        emit = Recorder()
        reporter = StepReporter("s-1", emit=emit)
        for _ in range(MAX_STEPS + 3):
            await reporter.tool_hook("search_knowledge_base", search_kb, {"query": "q"})
        assert len(emit.sent) == MAX_STEPS * 2
        assert len(reporter.summary()["steps"]) == MAX_STEPS

    async def test_the_receipt_lists_each_step(self):
        reporter = StepReporter("s-1", emit=Recorder(), turn_id="t-9")
        await reporter.tool_hook("search_knowledge_base", search_kb, {"query": "q"})
        await reporter.tool_hook("get_order_status", sync_tool, {"order_number": "1"})
        summary = reporter.summary()
        assert summary["turn_id"] == "t-9" and summary["duration_ms"] >= 0
        assert [s["done_label"] for s in summary["steps"]] == ["Searched the help center", "Checked your order"]
        assert set(summary["steps"][0]) == {"kind", "done_label", "status", "duration_ms"}

    async def test_a_connector_tool_is_named_after_its_connector(self):
        class Connector:
            _connector_name = "Stripe"
            functions = {"list_charges": object()}

        emit = Recorder()
        reporter = StepReporter("s-1", emit=emit)
        reporter.map_connectors([Connector()])
        await reporter.tool_hook("list_charges", search_kb, {"query": "q"})
        assert emit.sent[0][1]["label"] == "Checking Stripe"


def test_an_unknown_tool_gets_a_generic_label():
    assert label_for("something_new").label == "Working on it"

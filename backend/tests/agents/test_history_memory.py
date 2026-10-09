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

from agno.models.message import Message
from agno.run.response import RunResponse, RunStatus

from app.agents.history_memory import (
    TOOL_RESULT_STUB,
    BoundedHistoryMemory,
    bound_history,
    is_context_overflow,
)


def _turn(n: int, tool_result: str = "", answer: str = "answer") -> list:
    """user -> (assistant tool call -> tool result) -> assistant answer."""
    messages = [Message(role="user", content=f"question {n}")]
    if tool_result:
        messages.append(
            Message(
                role="assistant",
                content="",
                tool_calls=[{"id": f"call{n}", "type": "function", "function": {"name": "search_knowledge_base", "arguments": "{}"}}],
            )
        )
        messages.append(
            Message(role="tool", tool_call_id=f"call{n}", tool_name="search_knowledge_base", content=tool_result)
        )
    messages.append(Message(role="assistant", content=answer))
    return messages


class TestBoundHistory:
    def test_tool_results_are_stubbed_and_pairing_kept(self):
        messages = _turn(1, tool_result="x" * 50_000)
        bounded = bound_history(messages, max_chars=100_000)
        tool = [m for m in bounded if m.role == "tool"][0]
        assert tool.content == TOOL_RESULT_STUB.format(tool="search_knowledge_base")
        assert tool.tool_call_id == "call1"
        assert [m.role for m in bounded] == ["user", "assistant", "tool", "assistant"]

    def test_originals_untouched(self):
        messages = _turn(1, tool_result="original")
        bound_history(messages, max_chars=100_000)
        assert messages[2].content == "original"

    def test_oldest_turns_dropped_whole_past_budget(self):
        messages = _turn(1, answer="a" * 300) + _turn(2, answer="b" * 300) + _turn(3, answer="c" * 300)
        bounded = bound_history(messages, max_chars=700)
        assert [m.content for m in bounded if m.role == "user"] == ["question 2", "question 3"]

    def test_zero_budget_keeps_nothing(self):
        assert bound_history(_turn(1) + _turn(2), max_chars=0) == []

    def test_tool_pair_never_split(self):
        messages = _turn(1, tool_result="t" * 10, answer="z" * 200) + _turn(2, answer="w" * 10)
        bounded = bound_history(messages, max_chars=120)
        roles = [m.role for m in bounded]
        assert roles == ["user", "assistant"]

    def test_unknown_tool_name_still_stubbed(self):
        msg = Message(role="tool", tool_call_id="c", content="big")
        assert bound_history([msg], max_chars=1000)[0].content == TOOL_RESULT_STUB.format(tool="tool")


class TestBoundedHistoryMemory:
    def _memory(self) -> BoundedHistoryMemory:
        memory = BoundedHistoryMemory()
        memory.history_max_chars = 10_000
        run = RunResponse(run_id="r1", session_id="s1", messages=_turn(1, tool_result="k" * 5_000))
        run.status = RunStatus.completed
        memory.runs = {"s1": [run]}
        return memory

    def test_replayed_history_is_bounded_but_stored_run_is_not(self):
        memory = self._memory()
        history = memory.get_messages_from_last_n_runs(session_id="s1", last_n=5)
        tool = [m for m in history if m.role == "tool"][0]
        assert tool.content.startswith("[")
        stored_tool = [m for m in memory.runs["s1"][0].messages if m.role == "tool"][0]
        assert stored_tool.content == "k" * 5_000

    def test_without_history_is_temporary(self):
        memory = self._memory()
        with memory.without_history():
            assert memory.get_messages_from_last_n_runs(session_id="s1", last_n=5) == []
        assert memory.get_messages_from_last_n_runs(session_id="s1", last_n=5)


class TestIsContextOverflow:
    def test_provider_wordings(self):
        assert is_context_overflow(Exception("This model's maximum context length is 128000 tokens"))
        assert is_context_overflow(Exception("Error code: 400 - context_length_exceeded"))
        assert is_context_overflow(Exception("prompt is too long: 210000 tokens > 200000 maximum"))
        assert is_context_overflow(Exception("The input token count (1200000) exceeds the maximum"))

    def test_other_errors_not_matched(self):
        assert not is_context_overflow(Exception("rate limit exceeded"))
        assert not is_context_overflow(Exception("invalid api key"))

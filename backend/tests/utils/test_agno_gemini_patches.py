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

import json
import logging

import pytest

pytest.importorskip("google.genai")

from agno.agent import Agent
from agno.models.base import Model
from agno.models.google import Gemini
from agno.models.message import Message
from google.genai.types import (
    Candidate,
    Content,
    FunctionCall,
    GenerateContentResponse,
    Part,
)

from app.utils.agno_gemini_patches import (
    SKIP_SIGNATURE,
    _restore_signatures,
    apply_gemini_patches,
)

SIG_A = b"\x01signature-a\xff"
SIG_B = b"\x02signature-b\xfe"


@pytest.fixture
def gemini():
    apply_gemini_patches()
    return Gemini(id="gemini-3.8-flash", api_key="test")


def _response(*parts):
    return GenerateContentResponse(
        candidates=[Candidate(content=Content(role="model", parts=list(parts)))]
    )


def _call_part(name, signature=None, call_id=None):
    return Part(
        function_call=FunctionCall(name=name, args={"q": name}, id=call_id),
        thought_signature=signature,
    )


def _assistant_from(model, model_response):
    """Build the assistant Message the way agno's loop does: tool calls and
    provider_data copied straight off the ModelResponse."""
    message = Message(role="assistant", tool_calls=model_response.tool_calls)
    message.provider_data = model_response.provider_data
    return message


def _tool_result(tool_call, content="result"):
    return Message(
        role="tool",
        content=content,
        tool_call_id=tool_call["id"],
        tool_name=tool_call["function"]["name"],
        tool_calls=[{"tool_name": tool_call["function"]["name"], "content": content}],
    )


def _call_parts(contents):
    return [
        p for c in contents if c.role == "model" for p in c.parts if p.function_call is not None
    ]


def _roundtrip(model, response, parse="parse_provider_response"):
    model_response = getattr(model, parse)(response)
    return model_response, _assistant_from(model, model_response)


def test_signature_survives_into_the_next_request(gemini):
    """The production failure: the second tool call of a turn 400s because the
    first call was replayed without its signature."""
    model_response, assistant = _roundtrip(gemini, _response(_call_part("search", SIG_A)))
    history = [
        Message(role="user", content="hi"),
        assistant,
        _tool_result(model_response.tool_calls[0]),
    ]

    contents, _ = gemini._format_messages(history)

    assert [p.thought_signature for p in _call_parts(contents)] == [SIG_A]


def test_streaming_deltas_carry_the_signature(gemini):
    """The live chat streams, and that path parses with a different method."""
    model_response, assistant = _roundtrip(
        gemini, _response(_call_part("search", SIG_A)), parse="parse_provider_response_delta"
    )
    contents, _ = gemini._format_messages(
        [Message(role="user", content="hi"), assistant, _tool_result(model_response.tool_calls[0])]
    )

    assert _call_parts(contents)[0].thought_signature == SIG_A


def test_streaming_merge_keeps_signatures_from_every_chunk(gemini):
    """agno merges delta provider_data with dict.update, so two chunks must not
    overwrite each other's signatures."""
    first = gemini.parse_provider_response_delta(_response(_call_part("a", SIG_A)))
    second = gemini.parse_provider_response_delta(_response(_call_part("b", SIG_B)))
    merged = {}
    merged.update(first.provider_data)
    merged.update(second.provider_data)

    assistant = Message(role="assistant", tool_calls=first.tool_calls + second.tool_calls)
    assistant.provider_data = merged
    contents, _ = gemini._format_messages(
        [
            Message(role="user", content="hi"),
            assistant,
            _tool_result(first.tool_calls[0]),
            _tool_result(second.tool_calls[0]),
        ]
    )

    assert [p.thought_signature for p in _call_parts(contents)] == [SIG_A, SIG_B]


def test_parallel_calls_keep_the_signature_on_the_first_part_only(gemini):
    model_response, assistant = _roundtrip(
        gemini, _response(_call_part("a", SIG_A), _call_part("b"))
    )
    contents, _ = gemini._format_messages(
        [Message(role="user", content="hi"), assistant]
        + [_tool_result(tc) for tc in model_response.tool_calls]
    )

    assert [p.thought_signature for p in _call_parts(contents)] == [SIG_A, None]


def test_sequential_calls_each_keep_their_own_signature(gemini):
    first, first_msg = _roundtrip(gemini, _response(_call_part("a", SIG_A)))
    second, second_msg = _roundtrip(gemini, _response(_call_part("b", SIG_B)))
    contents, _ = gemini._format_messages(
        [
            Message(role="user", content="hi"),
            first_msg,
            _tool_result(first.tool_calls[0]),
            second_msg,
            _tool_result(second.tool_calls[0]),
        ]
    )

    assert [p.thought_signature for p in _call_parts(contents)] == [SIG_A, SIG_B]


def test_gemini_supplied_call_ids_are_used(gemini):
    model_response, assistant = _roundtrip(
        gemini, _response(_call_part("search", SIG_A, call_id="fc_1"))
    )

    assert model_response.tool_calls[0]["id"] == "fc_1"
    contents, _ = gemini._format_messages(
        [Message(role="user", content="hi"), assistant, _tool_result(model_response.tool_calls[0])]
    )
    assert _call_parts(contents)[0].thought_signature == SIG_A


def test_provider_data_is_json_serialisable(gemini):
    """Messages are persisted with the session; raw bytes would break that."""
    model_response = gemini.parse_provider_response(_response(_call_part("search", SIG_A)))

    json.dumps(model_response.provider_data)


def test_unsigned_call_in_the_current_turn_gets_the_bypass(gemini):
    """A call with no signature — Gemini 2.5 history, or another provider's —
    would 400 the request; Google's documented bypass lets it through."""
    tool_call = {"id": "c1", "type": "function", "function": {"name": "a", "arguments": "{}"}}
    contents, _ = gemini._format_messages(
        [
            Message(role="user", content="hi"),
            Message(role="assistant", tool_calls=[tool_call]),
            _tool_result(tool_call),
        ]
    )

    assert _call_parts(contents)[0].thought_signature == SKIP_SIGNATURE


def test_earlier_turns_are_not_given_the_bypass(gemini):
    """Only the current turn is validated, and the bypass costs reasoning
    quality, so it is not spread over old history."""
    old = {"id": "c1", "type": "function", "function": {"name": "a", "arguments": "{}"}}
    contents, _ = gemini._format_messages(
        [
            Message(role="user", content="first question"),
            Message(role="assistant", tool_calls=[old]),
            _tool_result(old),
            Message(role="assistant", content="first answer"),
            Message(role="user", content="second question"),
        ]
    )

    assert _call_parts(contents)[0].thought_signature is None


def test_bypass_only_on_the_first_of_parallel_unsigned_calls(gemini):
    calls = [
        {"id": f"c{i}", "type": "function", "function": {"name": n, "arguments": "{}"}}
        for i, n in enumerate("ab")
    ]
    contents, _ = gemini._format_messages(
        [Message(role="user", content="hi"), Message(role="assistant", tool_calls=calls)]
        + [_tool_result(tc) for tc in calls]
    )

    assert [p.thought_signature for p in _call_parts(contents)] == [SKIP_SIGNATURE, None]


def test_text_reply_and_system_prompt_are_untouched(gemini):
    contents, system = gemini._format_messages(
        [
            Message(role="system", content="be nice"),
            Message(role="user", content="hi"),
            Message(role="assistant", content="hello"),
        ]
    )

    assert system == "be nice"
    assert [c.parts[0].text for c in contents] == ["hi", "hello"]
    assert all(p.thought_signature is None for c in contents for p in c.parts)


def test_response_without_tool_calls_adds_no_provider_data(gemini):
    model_response = gemini.parse_provider_response(_response(Part(text="hello")))

    assert model_response.content == "hello"
    assert model_response.provider_data is None


def test_signatures_reach_the_assistant_message_via_agno(gemini):
    """agno itself, not our test helper, must move provider_data onto the
    Message — that is what the whole carry relies on."""
    model_response = gemini.parse_provider_response(_response(_call_part("search", SIG_A)))
    assistant = Message(role="assistant")

    Model._populate_assistant_message(gemini, assistant, model_response)

    assert assistant.provider_data == model_response.provider_data
    assert assistant.tool_calls == model_response.tool_calls


def test_gemini_2_5_never_gets_the_bypass():
    """2.5 doesn't enforce signatures and isn't documented to accept the
    bypass value, so an unsigned call there is sent exactly as before."""
    apply_gemini_patches()
    model = Gemini(id="gemini-2.5-flash-lite", api_key="test")
    tool_call = {"id": "c1", "type": "function", "function": {"name": "a", "arguments": "{}"}}
    contents, _ = model._format_messages(
        [
            Message(role="user", content="hi"),
            Message(role="assistant", tool_calls=[tool_call]),
            _tool_result(tool_call),
        ]
    )

    assert _call_parts(contents)[0].thought_signature is None


def test_misaligned_history_is_left_alone(gemini, caplog):
    """If agno's formatting ever stops producing one content per calling
    message, no signature may land on the wrong call."""
    _, assistant = _roundtrip(gemini, _response(_call_part("search", SIG_A)))
    contents = [
        Content(role="user", parts=[Part(text="hi")]),
        Content(role="model", parts=[_call_part("search")]),
        Content(role="model", parts=[_call_part("other")]),
    ]

    with caplog.at_level(logging.WARNING):
        _restore_signatures([Message(role="user", content="hi"), assistant], contents, True)

    assert "did not line up" in caplog.text
    assert [p.thought_signature for p in _call_parts(contents)] == [None, None]


@pytest.mark.asyncio
async def test_real_agno_streaming_loop_with_stored_history(tmp_path):
    """Drive agno's own streaming run loop, with storage and history, across two
    runs: every call in the current turn goes back with its own signature, and
    earlier turns (whose provider_data storage drops) get no bypass."""
    from agno.storage.sqlite import SqliteStorage

    apply_gemini_patches()
    sent = []
    script = []

    async def fake_stream(self, messages, **kwargs):
        contents, _ = self._format_messages(messages)
        sent.append([p.thought_signature for p in _call_parts(contents)])
        yield script.pop(0)

    def lookup(q: str) -> str:
        """Look something up."""
        return "result " + q

    storage = SqliteStorage(table_name="runs", db_file=str(tmp_path / "s.db"))

    def agent():
        return Agent(
            model=Gemini(id="gemini-3.8-flash", api_key="test"),
            tools=[lookup],
            add_history_to_messages=True,
            storage=storage,
            session_id="s1",
        )

    original_stream = Gemini.ainvoke_stream
    Gemini.ainvoke_stream = fake_stream
    try:
        script[:] = [
            _response(_call_part("lookup", SIG_A)),
            _response(_call_part("lookup", SIG_B)),
            _response(Part(text="done")),
        ]
        async for _ in await agent().arun("hi", stream=True):
            pass
        assert sent == [[], [SIG_A], [SIG_A, SIG_B]]

        sent.clear()
        script[:] = [_response(Part(text="again"))]
        async for _ in await agent().arun("and again", stream=True):
            pass
        assert sent == [[None, None]]
    finally:
        Gemini.ainvoke_stream = original_stream


def test_apply_is_idempotent():
    apply_gemini_patches()
    patched = Gemini._format_messages
    apply_gemini_patches()

    assert Gemini._format_messages is patched

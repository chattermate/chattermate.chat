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

# Gemini 3+ thought signatures for the pinned agno==1.7.6. Remove with the agno
# 2.x upgrade, together with app.utils.agno_patches.
#
# Gemini 3 and later attach an opaque `thought_signature` to the functionCall
# part of a response and reject the next request of the same turn with a 400 when
# that call is replayed without it. agno 1.7.6 drops it twice over: the response
# parser keeps only the call's name and arguments, and _format_messages rebuilds
# the replayed call with Part.from_function_call(name, args). So the first tool
# call works and the second one in the turn fails — every agent with tools.
#
# The fix carries the signature on the assistant Message's provider_data, which
# agno already copies from the ModelResponse onto the Message in both the
# streaming and non-streaming loops, and puts it back on the Part when the
# history is formatted for the next request.
#
# One provider_data key per call ("<prefix><call id>") rather than one nested
# dict: the streaming loop merges each delta's provider_data with dict.update, so
# a nested dict from a later chunk would replace an earlier one.

import base64
from typing import Dict, List, Optional

from agno.models.message import Message

from app.core.logger import get_logger

logger = get_logger(__name__)

_PATCHED_FLAG = "_chattermate_thought_signatures"

SIGNATURE_KEY_PREFIX = "gemini_thought_signature:"

# Google's documented bypass for a functionCall that has no signature, such as
# history written by another model or by Gemini 2.5. Only ever used for the
# current turn — the only one Gemini validates — and only when the real one is
# missing, because Google warns it degrades the model's reasoning.
SKIP_SIGNATURE = b"skip_thought_signature_validator"


def _signature_key(call_id: str) -> str:
    return f"{SIGNATURE_KEY_PREFIX}{call_id}"


def _capture_signatures(response, model_response) -> None:
    """Record each functionCall part's signature against the tool call agno made
    from it.

    agno appends one tool call per functionCall part, in part order, and invents
    an id when Gemini sends none — so the parts are matched to the tool calls by
    position, not by id.
    """
    candidates = getattr(response, "candidates", None)
    content = candidates[0].content if candidates else None
    parts = getattr(content, "parts", None) or []
    call_parts = [p for p in parts if getattr(p, "function_call", None) is not None]
    tool_calls = model_response.tool_calls or []
    if len(call_parts) != len(tool_calls):
        return

    signatures: Dict[str, str] = {}
    for part, tool_call in zip(call_parts, tool_calls):
        signature = getattr(part, "thought_signature", None)
        if signature:
            signatures[_signature_key(tool_call["id"])] = base64.b64encode(signature).decode("ascii")
    if signatures:
        model_response.provider_data = {**(model_response.provider_data or {}), **signatures}


def _stored_signature(message: Message, tool_call: dict) -> Optional[bytes]:
    encoded = (message.provider_data or {}).get(_signature_key(tool_call.get("id", "")))
    return base64.b64decode(encoded) if encoded else None


def _current_turn_start(contents: List) -> int:
    """Index of the first content in the current turn.

    Google's definition: a turn starts at the most recent user message that is
    not a functionResponse. Tool results are sent as role "user" too, so role
    alone is not enough.
    """
    for index in range(len(contents) - 1, -1, -1):
        content = contents[index]
        if getattr(content, "role", None) != "user":
            continue
        parts = getattr(content, "parts", None) or []
        if not any(getattr(p, "function_response", None) is not None for p in parts):
            return index
    return 0


def _restore_signatures(messages: List[Message], contents: List) -> None:
    """Put each replayed functionCall's signature back on its Part.

    Every assistant message with tool calls becomes exactly one "model" content
    made of function-call parts, in the same order, so the two lists are walked
    together.
    """
    calling_messages = [m for m in messages if m.role == "assistant" and m.tool_calls]
    calling_contents = [
        (index, c) for index, c in enumerate(contents)
        if getattr(c, "role", None) == "model"
        and any(getattr(p, "function_call", None) is not None for p in (c.parts or []))
    ]
    if len(calling_messages) != len(calling_contents):
        logger.warning(
            "Gemini history did not line up with its messages; thought signatures not restored"
        )
        return

    turn_start = _current_turn_start(contents)
    for message, (index, content) in zip(calling_messages, calling_contents):
        call_parts = [p for p in content.parts if getattr(p, "function_call", None) is not None]
        for part, tool_call in zip(call_parts, message.tool_calls):
            signature = _stored_signature(message, tool_call)
            if signature:
                part.thought_signature = signature
        # Parallel calls carry one signature, on the first part. If none of them
        # has one, the first part is the one Gemini checks.
        if index >= turn_start and not any(p.thought_signature for p in call_parts):
            call_parts[0].thought_signature = SKIP_SIGNATURE


def apply_gemini_patches() -> None:
    """Carry Gemini thought signatures through agno 1.7.6. Safe to call more than once."""
    try:
        from agno.models.google import Gemini
    except ImportError:
        # google-genai is optional: without it no Gemini model can be built,
        # so there is nothing to patch.
        return

    if getattr(Gemini._format_messages, _PATCHED_FLAG, False):
        return

    original_format = Gemini._format_messages
    original_parse = Gemini.parse_provider_response
    original_parse_delta = Gemini.parse_provider_response_delta

    def _format_messages(self, messages):
        contents, system_message = original_format(self, messages)
        _restore_signatures(messages, contents)
        return contents, system_message

    def parse_provider_response(self, response, **kwargs):
        model_response = original_parse(self, response, **kwargs)
        _capture_signatures(response, model_response)
        return model_response

    def parse_provider_response_delta(self, response_delta):
        model_response = original_parse_delta(self, response_delta)
        _capture_signatures(response_delta, model_response)
        return model_response

    setattr(_format_messages, _PATCHED_FLAG, True)
    Gemini._format_messages = _format_messages
    Gemini.parse_provider_response = parse_provider_response
    Gemini.parse_provider_response_delta = parse_provider_response_delta

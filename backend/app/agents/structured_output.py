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

Groq-safe structured output helpers.

Groq's API rejects response_format (JSON mode) whenever tools are present
("json mode cannot be combined with tool/function calling"), so agno's
structured-output path degrades to prompt-only JSON — which GPT-OSS/Llama
drift away from. GPT-OSS's native structured-output convention on Groq IS a
tool call named `json`, so callers register a real `json` tool whose
parameters are the response-model fields, mark it stop_after_tool_call, and
read the result from the captured arguments. Shared by the chat agent and the
FAQ generator; other providers keep using agno's native response_model path.
"""

import json
import re

from app.core.logger import get_logger

logger = get_logger(__name__)


def build_groq_json_tool(capture: dict, parameters: dict, description: str):
    """Return an agno `json` tool that records its call arguments into `capture`.

    `capture` is mutated in place with the model's tool-call arguments; the
    caller reads it after `agent.arun()` and builds its response model from it.
    `parameters` is the JSON schema of the expected structured output.
    """
    from agno.tools.function import Function

    def _record(**kwargs):
        capture.clear()
        capture.update(kwargs)
        return "recorded"

    return Function(
        name="json",
        description=description,
        parameters=parameters,
        entrypoint=_record,
        stop_after_tool_call=True,
        skip_entrypoint_processing=True,
    )


def _scan_json(s: str):
    """Single pass over a JSON fragment tracking string state, the stack of
    open brackets, and the last comma outside any string. The building block
    for repairing truncated output of ANY shape (nested arrays included), not
    just flat objects."""
    stack = []
    in_string = False
    escaped = False
    last_comma = -1
    for i, ch in enumerate(s):
        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == '"':
                in_string = False
        elif ch == '"':
            in_string = True
        elif ch in "{[":
            stack.append(ch)
        elif ch in "}]":
            if stack:
                stack.pop()
        elif ch == ",":
            last_comma = i
    closers = ('"' if in_string else "") + "".join(
        "}" if opener == "{" else "]" for opener in reversed(stack)
    )
    return closers, last_comma


def lenient_json_load(s: str):
    """Best-effort parse of a possibly-truncated JSON object. Returns dict or None.

    When Groq truncates a `json` tool call, the trailing field is cut mid-value.
    Close any open string/brackets; if the tail is still malformed (e.g. a
    dangling key), progressively drop the last comma-separated fragment so the
    earlier complete fields survive. Complete objects followed by trailing
    wrapper braces parse via raw_decode.
    """
    s = (s or "").strip()
    if not s:
        return None
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        pass
    # Complete value with trailing junk (e.g. the tool-call wrapper's braces).
    try:
        obj, _ = json.JSONDecoder().raw_decode(s)
        if isinstance(obj, dict):
            return obj
    except json.JSONDecodeError:
        pass
    candidate = s
    for _ in range(16):
        closers, last_comma = _scan_json(candidate)
        try:
            return json.loads(candidate + closers)
        except json.JSONDecodeError:
            pass
        if last_comma == -1:
            break
        candidate = candidate[:last_comma]
    return None


def salvage_groq_json_error(exc: Exception):
    """Recover structured-output arguments from a Groq `tool_use_failed` error.

    Groq returns the (truncated) tool-call text in `failed_generation`; every
    field before the truncation point is intact. Returns a dict of arguments
    or None.
    """
    text = getattr(exc, "message", None) or str(exc)
    if "failed_generation" not in text:
        return None
    fg = None
    try:
        fg = json.loads(text).get("error", {}).get("failed_generation")
    except Exception:
        m = re.search(r'"failed_generation"\s*:\s*"(.*)"\s*\}\s*\}\s*$', text, re.DOTALL)
        if m:
            try:
                # Decode JSON string escapes (\n, \", \uXXXX, non-ASCII) correctly —
                # unicode_escape would corrupt emoji/accented characters.
                fg = json.loads('"' + m.group(1) + '"')
            except Exception:
                fg = m.group(1)
    if not fg:
        return None
    # fg looks like: {"name": "json", "arguments": {<fields, possibly truncated>}}
    idx = fg.find('"arguments"')
    brace = fg.find('{', idx) if idx != -1 else -1
    if brace == -1:
        return None
    return lenient_json_load(fg[brace:])

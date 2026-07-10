"""Tests for the Groq structured-output path and null-tolerant ChatResponse parsing.

Groq can't combine response_format with tools, so the agent uses a `json` tool for
structured output and salvages truncated tool calls. These tests lock in:
  - ChatResponse tolerates explicit `null` on non-nullable boolean fields (the models
    routinely emit them), instead of discarding the whole response.
  - The Groq truncation salvage recovers the lead/end_chat fields from a failed tool call.
"""
import json

from app.models.schemas.chat import ChatResponse, EndChatReasonType
from app.agents.chat_agent import (
    _salvage_groq_json_error,
    _build_chat_response_from_capture,
    _lenient_json_load,
)


def test_chat_response_tolerates_explicit_null_booleans():
    """A dict with explicit null on non-nullable bools must still build, with the
    real flags (end_chat, request_lead_capture) preserved rather than discarded."""
    data = {
        "message": "Thanks, we'll be in touch!",
        "end_chat": True,
        "end_chat_reason": "CUSTOMER_REQUEST",
        "request_lead_capture": True,
        "lead_email": "sam@example.com",
        "lead_consent": True,
        "transfer_to_human": None,   # non-nullable bool -> must coerce to default
        "create_ticket": None,       # non-nullable bool -> must coerce to default
        "request_contact": None,
        "transfer_reason": None,
        "lead_name": None,
    }
    cr = ChatResponse(**data)
    assert cr.end_chat is True
    assert cr.end_chat_reason == EndChatReasonType.CUSTOMER_REQUEST
    assert cr.request_lead_capture is True
    assert cr.lead_email == "sam@example.com"
    assert cr.lead_consent is True
    assert cr.transfer_to_human is False   # null -> default
    assert cr.create_ticket is False       # null -> default


def test_build_chat_response_from_capture_drops_none():
    cr = _build_chat_response_from_capture(
        {"message": "hi", "end_chat": True, "transfer_to_human": None, "create_ticket": None}
    )
    assert cr.message == "hi"
    assert cr.end_chat is True
    assert cr.transfer_to_human is False


def test_salvage_recovers_truncated_groq_tool_call():
    """A Groq tool_use_failed error with a message truncated mid-string still yields
    the completed lead fields."""
    failed_generation = (
        '{"name": "json", "arguments": {'
        '"lead_name": "Arun", "lead_email": "yohan@gmail.com", "lead_phone": "7676767676", '
        '"lead_consent": true, "request_lead_capture": true, '
        '"message": "Thanks for confirming, Arun. Which modules are you most'  # truncated
    )
    body = json.dumps({"error": {"code": "tool_use_failed", "failed_generation": failed_generation}})

    class _Exc(Exception):
        def __init__(self, msg):
            self.message = msg
            super().__init__(msg)

    salvaged = _salvage_groq_json_error(_Exc(body))
    assert salvaged is not None
    cr = _build_chat_response_from_capture(salvaged)
    assert cr.request_lead_capture is True
    assert cr.lead_email == "yohan@gmail.com"
    assert cr.lead_name == "Arun"
    assert cr.lead_consent is True


def test_salvage_returns_none_for_non_truncation_errors():
    """Rate-limit/auth errors have no failed_generation -> salvage returns None so the
    caller re-raises them unchanged."""
    class _Exc(Exception):
        def __init__(self, msg):
            self.message = msg
            super().__init__(msg)

    body = json.dumps({"error": {"message": "Rate limit reached", "type": "rate_limit_error"}})
    assert _salvage_groq_json_error(_Exc(body)) is None


def test_lenient_json_load_handles_complete_and_truncated():
    assert _lenient_json_load('{"a": 1, "b": "x"}') == {"a": 1, "b": "x"}
    # truncated mid-string -> drops the incomplete trailing key, keeps the rest
    out = _lenient_json_load('{"a": "done", "b": "unterminated')
    assert out is not None and out.get("a") == "done"

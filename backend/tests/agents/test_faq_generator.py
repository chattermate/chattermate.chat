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

Tests for the FAQ generator agent: structured-output parsing on both provider
paths (native response_model and the Groq json tool), output validation, and
prompt assembly (dedup list + category steering).
"""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.agents.faq_generator import (
    FAQExtractionResult,
    FAQGeneratorAgent,
    GeneratedFAQ,
)
from app.models.schemas.faq import MAX_QUESTION_LENGTH


def _agent(model_type: str = "OPENAI") -> FAQGeneratorAgent:
    return FAQGeneratorAgent(api_key="k", model_name="m", model_type=model_type)


def test_validate_drops_malformed_and_truncates():
    data = {
        "faqs": [
            {"question": "How do I sign up?", "answer": "Use your work email.", "category": "Getting started"},
            {"question": "", "answer": "orphan answer", "category": "X"},          # blank question
            {"question": "No answer?", "answer": "", "category": "X"},             # blank answer
            "not-a-dict",
            {"question": "Q" * (MAX_QUESTION_LENGTH + 50), "answer": "A", "category": ""},  # over-long + no category
        ]
    }
    faqs = _agent()._validate(data)
    assert len(faqs) == 2
    assert faqs[0].category == "Getting started"
    assert len(faqs[1].question) == MAX_QUESTION_LENGTH
    assert faqs[1].category == "General"


def test_validate_caps_batch_size():
    agent = _agent()
    items = [
        {"question": f"Q{i}", "answer": "A", "category": "C"} for i in range(agent.max_faqs + 10)
    ]
    assert len(agent._validate({"faqs": items})) == agent.max_faqs


def test_validate_handles_empty_and_none():
    assert _agent()._validate({}) == []
    assert _agent()._validate({"faqs": None}) == []


def test_batch_sizing_follows_model_context():
    """A big-context model gets larger batches (and a bigger FAQ cap) than a
    small-context one — the whole point of context-aware batching."""
    small = FAQGeneratorAgent(api_key="k", model_name="llama3-8b-8192", model_type="GROQ")
    big = FAQGeneratorAgent(api_key="k", model_name="claude-sonnet-5", model_type="ANTHROPIC")
    assert big.batch_chars > small.batch_chars
    assert big.max_faqs >= small.max_faqs
    assert big.max_tokens >= small.max_tokens >= 4000


@pytest.mark.asyncio
async def test_native_path_returns_validated_faqs():
    """Non-Groq providers: agno returns FAQExtractionResult via response_model."""
    result = FAQExtractionResult(
        faqs=[GeneratedFAQ(question="How does billing work?", answer="Per seat.", category="Billing")]
    )
    response = MagicMock()
    response.content = result
    with patch("app.agents.faq_generator.create_model", return_value=MagicMock()), \
         patch("agno.agent.Agent") as MockAgent:
        MockAgent.return_value.arun = AsyncMock(return_value=response)
        faqs = await _agent("OPENAI").generate_from_text("Billing docs...")
    assert [f.question for f in faqs] == ["How does billing work?"]
    # Native path must configure structured outputs, not the json tool.
    kwargs = MockAgent.call_args.kwargs
    assert kwargs["response_model"] is FAQExtractionResult
    assert kwargs["structured_outputs"] is True
    assert kwargs["tools"] == []


@pytest.mark.asyncio
async def test_groq_path_reads_capture_from_json_tool():
    """Groq: the json tool records arguments into the capture dict."""
    captured_tools = {}

    def fake_agent(**kwargs):
        captured_tools["tools"] = kwargs["tools"]
        agent = MagicMock()

        async def arun(message, stream):
            # Simulate the model calling the registered `json` tool.
            kwargs["tools"][0].entrypoint(
                faqs=[{"question": "Is data encrypted?", "answer": "Yes, AES-256.", "category": "Security"}]
            )
            return MagicMock(content="tool called")

        agent.arun = arun
        return agent

    with patch("app.agents.faq_generator.create_model", return_value=MagicMock()), \
         patch("agno.agent.Agent", side_effect=fake_agent) as MockAgent:
        faqs = await _agent("GROQ").generate_from_text("Security docs...")

    assert [f.category for f in faqs] == ["Security"]
    kwargs = MockAgent.call_args.kwargs
    assert kwargs["response_model"] is None
    assert kwargs["structured_outputs"] is False
    assert len(captured_tools["tools"]) == 1
    assert captured_tools["tools"][0].name == "json"


async def _salvage(failed_generation: str):
    """Run the Groq path against an arun() failure carrying failed_generation."""
    import json as _json

    exc = Exception(_json.dumps({"error": {"failed_generation": failed_generation}}))
    with patch("app.agents.faq_generator.create_model", return_value=MagicMock()), \
         patch("agno.agent.Agent") as MockAgent:
        MockAgent.return_value.arun = AsyncMock(side_effect=exc)
        return await _agent("GROQ").generate_from_text("Account docs...")


@pytest.mark.asyncio
async def test_groq_salvage_complete_tool_call():
    """A complete tool call inside failed_generation (rejected for another
    reason) parses despite the trailing wrapper braces."""
    faqs = await _salvage(
        '{"name": "json", "arguments": {"faqs": [{"question": "How do I reset my password?", '
        '"answer": "Use the forgot-password link.", "category": "Account"}]}}'
    )
    assert [f.question for f in faqs] == ["How do I reset my password?"]


@pytest.mark.asyncio
async def test_groq_salvage_truncated_mid_array():
    """Truncation mid-answer inside the faqs ARRAY still yields every pair up
    to the cut (needs bracket-aware repair, not flat closers). The final,
    partially-cut answer survives as a reviewable draft — same policy as the
    chat agent's truncated messages."""
    faqs = await _salvage(
        '{"name": "json", "arguments": {"faqs": ['
        '{"question": "How do I reset my password?", "answer": "Use the forgot-password link.", "category": "Account"}, '
        '{"question": "Can I invite my team?", "answer": "Yes — go to Settings and se'
    )
    assert [f.question for f in faqs] == ["How do I reset my password?", "Can I invite my team?"]
    assert faqs[1].answer.endswith("and se")  # truncated tail kept for review


@pytest.mark.asyncio
async def test_non_groq_errors_reraise():
    with patch("app.agents.faq_generator.create_model", return_value=MagicMock()), \
         patch("agno.agent.Agent") as MockAgent:
        MockAgent.return_value.arun = AsyncMock(side_effect=RuntimeError("provider down"))
        with pytest.raises(RuntimeError):
            await _agent("OPENAI").generate_from_text("docs")


@pytest.mark.asyncio
async def test_prompt_includes_dedup_and_categories():
    response = MagicMock()
    response.content = FAQExtractionResult(faqs=[])
    with patch("app.agents.faq_generator.create_model", return_value=MagicMock()), \
         patch("agno.agent.Agent") as MockAgent:
        arun = AsyncMock(return_value=response)
        MockAgent.return_value.arun = arun
        await _agent("OPENAI").generate_from_text(
            "content body",
            existing_questions=["How do I sign up?"],
            existing_categories=["Billing"],
        )
    message = arun.call_args.kwargs["message"]
    instructions = MockAgent.call_args.kwargs["instructions"]
    assert "How do I sign up?" in message
    assert "content body" in message
    assert "Billing" in instructions

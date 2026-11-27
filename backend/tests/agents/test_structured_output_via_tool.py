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

Which providers get structured output through the `json` tool instead of
response_format. Groq always does; JSON_TOOL_OUTPUT_PROVIDERS adds more, e.g.
OPENAI_COMPATIBLE for llama.cpp, which rejects response_format sent with tools
("failed to parse grammar").
"""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, Mock, patch
from uuid import uuid4

import pytest
from sqlalchemy.orm import Session

from app.agents.chat_agent import ChatAgent
from app.agents.faq_generator import FAQGeneratorAgent
from app.agents.ticket_investigator import TicketInvestigatorAgent
from app.core.config import settings
from app.core.model_catalog import list_providers, min_output_tokens, structured_output_via_tool

NATIVE_PROVIDERS = ["OPENAI", "OPENAI_COMPATIBLE", "ANTHROPIC", "GOOGLE", "DEEPSEEK", "CHATTERMATE"]


def _opt_in(value: str):
    return patch.object(settings, "JSON_TOOL_OUTPUT_PROVIDERS", value)


@pytest.fixture(autouse=True)
def _no_opt_in():
    with _opt_in(""):
        yield


def test_groq_always_uses_the_json_tool():
    assert structured_output_via_tool("GROQ")
    assert structured_output_via_tool("groq")


@pytest.mark.parametrize("provider", NATIVE_PROVIDERS + ["", "NOT_A_PROVIDER"])
def test_other_providers_keep_response_format_by_default(provider):
    assert not structured_output_via_tool(provider)


@pytest.mark.parametrize("value", ["OPENAI_COMPATIBLE", "openai_compatible", " DEEPSEEK , OPENAI_COMPATIBLE ,"])
def test_the_setting_adds_providers(value):
    with _opt_in(value):
        assert structured_output_via_tool("OPENAI_COMPATIBLE")
        assert structured_output_via_tool("GROQ")
        assert not structured_output_via_tool("OPENAI")


def test_only_the_catalog_sets_an_output_floor():
    """An opted-in self-hosted server keeps its normal budget: its context
    window may not fit Groq's 4000-token floor."""
    assert min_output_tokens("GROQ") >= 4000
    with _opt_in("OPENAI_COMPATIBLE"):
        assert min_output_tokens("OPENAI_COMPATIBLE") == 0
    assert min_output_tokens("NOT_A_PROVIDER") == 0


def test_the_setting_cannot_add_an_unknown_provider():
    with _opt_in("NOT_A_PROVIDER"):
        assert not structured_output_via_tool("NOT_A_PROVIDER")


def test_the_flag_stays_out_of_the_providers_endpoint():
    """A backend detail: the setup UI has no use for it."""
    assert all("structured_output_via_tool" not in p for p in list_providers())


CASES = [("OPENAI_COMPATIBLE", "OPENAI_COMPATIBLE", True), ("OPENAI_COMPATIBLE", "", False),
         ("GROQ", "", True), ("OPENAI", "OPENAI_COMPATIBLE", False)]


@pytest.mark.parametrize("provider,opt_in,expected", CASES)
def test_faq_generator_follows_the_option(provider, opt_in, expected):
    with _opt_in(opt_in):
        agent = FAQGeneratorAgent(api_key="k", model_name="m", model_type=provider,
                              base_url="http://localhost:8080/v1")
    assert agent._use_json_tool_output is expected


@pytest.mark.parametrize("provider,opt_in,expected", CASES)
def test_ticket_investigator_follows_the_option(provider, opt_in, expected):
    with _opt_in(opt_in):
        agent = TicketInvestigatorAgent(api_key="k", model_name="m", model_type=provider,
                                    base_url="http://localhost:8080/v1")
    assert agent._use_json_tool_output is expected


def _chat_agent(model_type: str):
    """A ChatAgent with everything external stubbed; returns it and the
    create_model mock so the request budget can be read."""
    agent_data = Mock()
    agent_data.name = "Support"
    agent_data.jira_enabled = False
    agent_data.transfer_to_human = False
    agent_data.ask_for_rating = False
    agent_data.ticketing_enabled = False
    agent_data.instructions = ["You are a helpful assistant"]
    storage = Mock()
    storage.get_session_state.return_value = {"status": "active"}

    with patch('app.agents.chat_agent.get_db') as mock_get_db, \
         patch('app.agents.chat_agent.JiraRepository') as mock_jira_repo, \
         patch('app.agents.chat_agent.create_model', return_value=MagicMock()) as mock_create, \
         patch('app.tools.knowledge_search_byagent.KnowledgeSearchByAgent', return_value=Mock()), \
         patch('app.agents.chat_agent.EncryptedPostgresAgentStorage', return_value=storage), \
         patch('app.agents.chat_agent.settings.DATABASE_URL', "mock://test"), \
         patch.dict('os.environ', {}, clear=True):
        mock_get_db.return_value = iter([MagicMock(spec=Session)])
        mock_jira_repo.return_value.get_agent_with_jira_config.return_value = agent_data
        agent = ChatAgent(api_key="test-key", model_name="qwen3-8b", model_type=model_type,
                          org_id=str(uuid4()), agent_id=str(uuid4()),
                          customer_id=str(uuid4()), session_id=str(uuid4()),
                          base_url="http://localhost:8080/v1")
    return agent, mock_create


def _tool_names(agent: ChatAgent) -> list:
    return [getattr(t, "name", None) for t in agent.agent.tools]


def _prompt(agent: ChatAgent) -> str:
    instructions = agent.agent.instructions
    return "\n".join(instructions) if isinstance(instructions, list) else instructions


def test_opted_in_openai_compatible_chat_answers_through_the_json_tool():
    with _opt_in("OPENAI_COMPATIBLE"):
        agent, mock_create = _chat_agent("OPENAI_COMPATIBLE")
    assert agent._use_json_tool_output
    assert "json" in _tool_names(agent)
    # No response_model means agno sends no response_format next to the tools.
    assert agent.agent.response_model is None
    assert not agent.agent.structured_outputs
    assert "calling the `json` tool" in _prompt(agent)
    # No Groq floor: a local context window may not fit 4000 output tokens.
    assert mock_create.call_args.kwargs["max_tokens"] < 4000
    # The line that talks the model out of searching is left out.
    assert "Do not keep searching indefinitely" not in _prompt(agent)


@pytest.mark.parametrize("provider", ["OPENAI", "OPENAI_COMPATIBLE"])
def test_chat_keeps_native_structured_output_without_the_option(provider):
    agent, mock_create = _chat_agent(provider)
    assert not agent._use_json_tool_output
    assert "json" not in _tool_names(agent)
    assert agent.agent.response_model is not None
    assert agent.agent.structured_outputs
    assert mock_create.call_args.kwargs["max_tokens"] < 4000
    assert "Do not keep searching indefinitely" in _prompt(agent)


def test_groq_chat_keeps_its_output_floor():
    agent, mock_create = _chat_agent("GROQ")
    assert agent._use_json_tool_output
    assert mock_create.call_args.kwargs["max_tokens"] >= 4000


# --- A whole turn on the json-tool path -------------------------------------

def _json_tool(agent: ChatAgent):
    return next(t for t in agent.agent.tools if getattr(t, "name", None) == "json")


async def _workflow_turn(agent: ChatAgent, arun) -> object:
    with patch.object(agent, "_arun", side_effect=arun), \
         patch("app.agents.chat_agent.check_inbound"), \
         patch("app.agents.chat_agent.check_output", side_effect=lambda msg, **_: (msg, None)):
        return await agent._get_llm_response_only("Do you ship to Canada?", session_id=str(uuid4()))


@pytest.mark.asyncio
async def test_opted_in_turn_reads_the_reply_from_the_json_tool():
    with _opt_in("OPENAI_COMPATIBLE"):
        agent, _ = _chat_agent("OPENAI_COMPATIBLE")
    tool = _json_tool(agent)

    async def arun(message, session_id):
        tool.entrypoint(message="Yes, we ship to Canada.", end_chat=True)
        return SimpleNamespace(content="recorded", messages=[])

    response = await _workflow_turn(agent, arun)
    assert response.message == "Yes, we ship to Canada."
    assert response.end_chat is True


@pytest.mark.asyncio
async def test_opted_in_turn_recovers_when_the_model_skips_the_json_tool():
    """Small local models often answer in plain text instead of calling `json`."""
    with _opt_in("OPENAI_COMPATIBLE"):
        agent, _ = _chat_agent("OPENAI_COMPATIBLE")
    answer = SimpleNamespace(role="assistant", content="We ship to Canada in 5 days.", tool_calls=None)

    async def arun(message, session_id):
        return SimpleNamespace(content="We ship to Canada in 5 days.", messages=[answer])

    response = await _workflow_turn(agent, arun)
    assert response.message == "We ship to Canada in 5 days."


@pytest.mark.asyncio
async def test_a_fresh_turn_does_not_reuse_the_last_capture():
    with _opt_in("OPENAI_COMPATIBLE"):
        agent, _ = _chat_agent("OPENAI_COMPATIBLE")
    tool = _json_tool(agent)

    async def first(message, session_id):
        tool.entrypoint(message="First answer.", end_chat=True)
        return SimpleNamespace(content="recorded", messages=[])

    async def second(message, session_id):
        return SimpleNamespace(content="Second answer.",
                               messages=[SimpleNamespace(role="assistant", content="Second answer.", tool_calls=None)])

    await _workflow_turn(agent, first)
    response = await _workflow_turn(agent, second)
    assert response.message == "Second answer."
    assert not response.end_chat


# --- FAQ generation on an opted-in server ------------------------------------

def _faq_agent():
    with _opt_in("OPENAI_COMPATIBLE"):
        return FAQGeneratorAgent(api_key="k", model_name="qwen3-8b", model_type="OPENAI_COMPATIBLE",
                                 base_url="http://localhost:8080/v1")


@pytest.mark.asyncio
async def test_opted_in_faq_generation_reads_the_json_tool():
    def fake_agent(**kwargs):
        assert kwargs["response_model"] is None and kwargs["structured_outputs"] is False
        agent = MagicMock()

        async def arun(message, stream):
            kwargs["tools"][0].entrypoint(
                faqs=[{"question": "Do you ship abroad?", "answer": "Yes, to 30 countries.", "category": "Shipping"}])
            return MagicMock(content="recorded")

        agent.arun = arun
        return agent

    with patch("app.agents.faq_generator.create_model", return_value=MagicMock()), \
         patch("agno.agent.Agent", side_effect=fake_agent):
        faqs = await _faq_agent().generate_from_text("Shipping policy...")
    assert [f.question for f in faqs] == ["Do you ship abroad?"]


@pytest.mark.asyncio
async def test_opted_in_faq_generation_falls_back_to_plain_json():
    """A local model that ignores the `json` tool still yields FAQs."""
    calls = []

    def fake_agent(**kwargs):
        agent = MagicMock()
        if not calls:
            calls.append("json-tool")
            agent.arun = AsyncMock(return_value=MagicMock(content="Here are some FAQs."))
        else:
            calls.append("plain-json")
            agent.arun = AsyncMock(return_value=MagicMock(content=(
                '{"faqs": [{"question": "Do you ship abroad?", '
                '"answer": "Yes, to 30 countries.", "category": "Shipping"}]}')))
        return agent

    with patch("app.agents.faq_generator.create_model", return_value=MagicMock()), \
         patch("agno.agent.Agent", side_effect=fake_agent):
        faqs = await _faq_agent().generate_from_text("Shipping policy...")
    assert calls == ["json-tool", "plain-json"]
    assert [f.question for f in faqs] == ["Do you ship abroad?"]

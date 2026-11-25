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

The system prompts a set of typical agents are built with, for golden-prompt
tests: with a prompt change switched off, every agent here must get exactly
the prompt it got before the change. Regenerate the files only when a change is
meant to alter the default prompt:

    UPDATE_GOLDEN_PROMPTS=1 python -m pytest tests/agents/test_golden_prompts.py
"""

from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock, Mock, patch

from sqlalchemy.orm import Session

from app.agents.chat_agent import ChatAgent

GOLDEN_DIR = Path(__file__).parent / "golden_prompts"

# Fixed ids: nothing in the prompt depends on them, but fixed values keep a
# failing diff readable.
ORG_ID = "00000000-0000-0000-0000-0000000000aa"
AGENT_ID = "00000000-0000-0000-0000-0000000000bb"
CUSTOMER_ID = "00000000-0000-0000-0000-0000000000cc"
SESSION_ID = "00000000-0000-0000-0000-0000000000dd"

LEAD_FIELDS = [
    {"key": "email", "standard": True, "enabled": True, "required": True},
    {"key": "name", "standard": True, "enabled": True, "required": False},
]

# name -> the agent's setup. Keys: transfer, groups, lead, ticketing, jira,
# shopify, model_type, workflow.
CASES = {
    "transfer_with_group": dict(transfer=True, groups=["support"]),
    "transfer_without_group": dict(transfer=True, groups=[]),
    "transfer_off": dict(transfer=False),
    "lead_capture_pending": dict(transfer=False, lead=True),
    "lead_capture_with_transfer": dict(transfer=True, groups=["support"], lead=True),
    "native_ticketing_with_transfer": dict(transfer=True, groups=["support"], ticketing=True),
    "native_ticketing_without_transfer": dict(transfer=False, ticketing=True),
    "jira": dict(transfer=True, groups=["support"], jira=True),
    "shopify": dict(transfer=True, groups=["support"], shopify=True),
    "groq": dict(transfer=True, groups=["support"], model_type="groq"),
    "workflow": dict(transfer=True, groups=["support"], workflow=True),
}


def build_agent(*, transfer=False, groups=(), lead=False, ticketing=False, jira=False,
                shopify=False, model_type="openai", workflow=False,
                instructions=("You are a helpful assistant",)) -> ChatAgent:
    """A ChatAgent with everything external stubbed, to read the prompt it built."""
    agent_data = Mock()
    agent_data.name = "Support"
    agent_data.jira_enabled = jira
    agent_data.transfer_to_human = transfer
    agent_data.ask_for_rating = False
    agent_data.ticketing_enabled = ticketing
    agent_data.instructions = list(instructions)
    agent_data.groups = list(groups)

    lead_config = SimpleNamespace(enabled=True, fields=LEAD_FIELDS, require_consent=True, guidance=None)
    lead_repo = MagicMock()
    lead_repo.return_value.get_by_agent.return_value = lead_config if lead else None

    customer_repo = MagicMock()
    customer_repo.return_value.get_by_id.return_value = None

    storage = Mock()
    storage.get_session_state.return_value = {"status": "active"}
    shopify_config = SimpleNamespace(enabled=True) if shopify else None

    with patch('app.agents.chat_agent.get_db') as mock_get_db, \
         patch('app.agents.chat_agent.JiraRepository') as mock_jira_repo, \
         patch('app.agents.chat_agent.AgentShopifyConfigRepository') as mock_shopify_repo, \
         patch('app.repositories.customer.CustomerRepository', customer_repo), \
         patch('app.repositories.lead_capture.LeadCaptureConfigRepository', lead_repo), \
         patch('app.services.lead_capture.has_captured_lead', return_value=False), \
         patch('app.services.ticket_access.ticketing_allowed', return_value=ticketing), \
         patch('app.tools.knowledge_search_byagent.KnowledgeSearchByAgent', return_value=Mock()), \
         patch('app.agents.chat_agent.EncryptedPostgresAgentStorage', return_value=storage), \
         patch('app.agents.chat_agent.settings.DATABASE_URL', "mock://test"), \
         patch.dict('os.environ', {}, clear=True), \
         patch('app.agents.chat_agent.plan_feature_on', lambda db, org, feature: True), \
         patch('app.services.widget_plan.plan_flags', lambda db, org, keys, *a: {k: False for k in keys}):
        mock_get_db.return_value = iter([MagicMock(spec=Session)])
        mock_jira_repo.return_value.get_agent_with_jira_config.return_value = agent_data
        mock_shopify_repo.return_value.get_agent_shopify_config.return_value = shopify_config

        return ChatAgent(
            api_key="test-key",
            model_name="gpt-4",
            model_type=model_type,
            org_id=ORG_ID,
            agent_id=AGENT_ID,
            customer_id=CUSTOMER_ID,
            session_id=SESSION_ID,
            custom_system_prompt="You are the billing step of a workflow." if workflow else None,
        )


def raw_prompt(agent: ChatAgent) -> str:
    """The prompt exactly as the model gets it."""
    instructions = agent.agent.instructions
    return "\n".join(instructions) if isinstance(instructions, list) else (instructions or "")


def flat_prompt(agent: ChatAgent) -> str:
    """The prompt on one line: the blocks are indented heredocs, so a sentence
    is only contiguous once the wrapping whitespace is collapsed."""
    return " ".join(raw_prompt(agent).split())


def golden_path(case: str) -> Path:
    return GOLDEN_DIR / f"{case}.txt"

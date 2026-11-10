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

from unittest.mock import MagicMock, Mock, patch
from uuid import uuid4

from sqlalchemy.orm import Session

from app.agents.chat_agent import ChatAgent

LEAD_FIELDS = [
    {"key": "email", "standard": True, "enabled": True, "required": True},
    {"key": "name", "standard": True, "enabled": True, "required": True},
    {"key": "company", "standard": True, "enabled": True, "required": False},
]


def build_agent(known_email: str = None, known_name: str = None, trusted: bool = True) -> ChatAgent:
    """A ChatAgent with everything external stubbed, to read the prompt it built.

    `known_email`/`known_name` stand for a visitor we already hold details for:
    one who passed the email gate, or who an embedding app identified.
    `trusted` is whether this conversation may be told them (widget_identity).
    """
    agent_data = Mock()
    agent_data.name = "Sales"
    agent_data.jira_enabled = False
    agent_data.transfer_to_human = False
    agent_data.ask_for_rating = False
    agent_data.ticketing_enabled = False
    agent_data.instructions = ["You are a helpful assistant"]

    lead_config = Mock()
    lead_config.enabled = True
    lead_config.fields = LEAD_FIELDS
    lead_config.require_consent = True
    lead_config.guidance = None

    customer = Mock()
    customer.email = known_email
    customer.full_name = known_name

    storage = Mock()
    storage.get_session_state.return_value = {"status": "active"}

    customer_repo = MagicMock()
    customer_repo.return_value.get_by_id.return_value = customer
    # The real staticmethod decides what counts as a stand-in address.
    customer_repo.is_placeholder_email = staticmethod(
        lambda email: (not email) or ('@noemail.com' in email) or email.endswith('.channel')
    )

    lead_repo = MagicMock()
    lead_repo.return_value.get_by_agent.return_value = lead_config

    with patch('app.agents.chat_agent.get_db') as mock_get_db, \
         patch('app.agents.chat_agent.JiraRepository') as mock_jira_repo, \
         patch('app.repositories.customer.CustomerRepository', customer_repo), \
         patch('app.repositories.lead_capture.LeadCaptureConfigRepository', lead_repo), \
         patch('app.services.lead_capture.has_captured_lead', return_value=False), \
         patch('app.agents.chat_agent.trusts_identity_in_session', return_value=trusted), \
         patch('app.tools.knowledge_search_byagent.KnowledgeSearchByAgent', return_value=Mock()), \
         patch('app.agents.chat_agent.EncryptedPostgresAgentStorage', return_value=storage), \
         patch('app.agents.chat_agent.settings.DATABASE_URL', "mock://test"), \
         patch.dict('os.environ', {}, clear=True):
        mock_get_db.return_value = iter([MagicMock(spec=Session)])
        mock_jira_repo.return_value.get_agent_with_jira_config.return_value = agent_data

        return ChatAgent(
            api_key="test-key",
            model_name="gpt-4",
            model_type="openai",
            org_id=str(uuid4()),
            agent_id=str(uuid4()),
            customer_id=str(uuid4()),
            session_id=str(uuid4()),
        )


def prompt_of(agent: ChatAgent) -> str:
    """The built prompt on one line: the blocks are indented heredocs, so a
    sentence is only contiguous once the wrapping whitespace is collapsed."""
    instructions = agent.agent.instructions
    text = "\n".join(instructions) if isinstance(instructions, list) else instructions
    return " ".join((text or "").split())


class TestLeadCapturePrompt:
    """A visitor who passed the email gate, or who an embedding app identified,
    was still asked to type their address again — and then told "Email: Not
    provided". The details we already hold have to reach the lead-capture block
    the same way they reach the ticket block."""

    def test_a_known_email_is_handed_over_not_asked_for(self):
        agent = build_agent(known_email="ravi@academy.example", known_name="Ravi Kumar")
        prompt = prompt_of(agent)

        assert "ALREADY KNOWN" in prompt
        assert 'their email is "ravi@academy.example" - put exactly that in lead_email' in prompt
        assert 'their name is "Ravi Kumar" - put exactly that in lead_name' in prompt
        assert "Do NOT ask for these" in prompt
        # It must still count toward recording, or the agent stalls waiting for
        # a detail it was told not to ask for.
        assert "count them as collected" in prompt
        # And the visitor can still correct us.
        assert "volunteers a different value" in prompt

    def test_details_are_not_recited_to_a_visitor_who_only_claimed_the_customer(self):
        """Someone who typed another person's email into the widget is bound to
        that customer, but must not hear their name or address from the bot."""
        prompt = prompt_of(build_agent(known_email="ravi@academy.example", known_name="Ravi Kumar",
                                       trusted=False))

        assert "ALREADY KNOWN" not in prompt
        assert "Ravi Kumar" not in prompt
        assert "ravi@academy.example" not in prompt

    def test_an_unknown_visitor_is_still_asked(self):
        prompt = prompt_of(build_agent())

        assert "ALREADY KNOWN" not in prompt
        # The ordinary collection instructions are untouched.
        assert "LEAD CAPTURE (IMPORTANT)" in prompt
        assert "REQUIRED: email, name" in prompt

    def test_a_placeholder_address_does_not_count_as_known(self):
        """Anonymous widget visitors carry a …@noemail.com stand-in. Handing that
        to the agent as the lead's email would record an address nobody can reach."""
        prompt = prompt_of(build_agent(known_email="1738000000000@noemail.com"))

        assert "ALREADY KNOWN" not in prompt
        assert "noemail.com" not in prompt


class TestLeadCaptureOnThePlan:
    def test_a_plan_without_it_leaves_the_prompt_alone(self):
        with patch('app.agents.chat_agent.plan_feature_on', return_value=False):
            agent = build_agent()

        assert agent.lead_capture_enabled is False

    def test_a_plan_with_it_turns_it_on(self):
        with patch('app.agents.chat_agent.plan_feature_on', return_value=True):
            agent = build_agent()

        assert agent.lead_capture_enabled is True

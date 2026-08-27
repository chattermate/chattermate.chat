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

"""
ChatterMate - Ticket investigator agent tests
"""

import pytest
from agno.exceptions import ModelProviderError, ModelRateLimitError

from app.agents.ticket_investigator import TicketInvestigatorAgent


def _agent():
    return TicketInvestigatorAgent(api_key="k", model_name="gpt-4o-mini", model_type="OPENAI")


def test_a_refused_request_is_classified_as_a_provider_error():
    """Every failed run returns None, so the reason has to be recorded
    separately or a hard 400 is indistinguishable from a quiet model (#303)."""
    agent = _agent()

    agent._note_provider_error(
        ModelProviderError(
            message=(
                "Invalid schema for function 'search': In context="
                "('properties', 'queryBody', 'additionalProperties'), schema "
                "must have a 'type' key."
            ),
            status_code=400,
        )
    )

    assert "rejected the request (400)" in agent.last_provider_error
    # The provider's own words reach the operator, whatever the vendor.
    assert "Invalid schema for function 'search'" in agent.last_provider_error
    assert agent.provider_errors == [agent.last_provider_error]


@pytest.mark.parametrize("status", [400, 403, 404, 422])
def test_any_client_error_counts_no_matter_the_wording(status):
    """Classification is on the status agno attaches, not on vendor phrasing —
    the same failure on Anthropic or Gemini has to land the same way."""
    agent = _agent()

    agent._note_provider_error(ModelProviderError(message="refused", status_code=status))

    assert f"({status})" in agent.last_provider_error


def test_rate_limiting_is_left_unclassified():
    """429 is transient — retrying can succeed, so it is not a configuration
    problem to report."""
    agent = _agent()

    agent._note_provider_error(ModelRateLimitError(message="slow down"))

    assert agent.last_provider_error is None
    assert agent.provider_errors == []


def test_a_request_timeout_is_left_unclassified():
    """408 is the other 4xx a retry can clear."""
    agent = _agent()

    agent._note_provider_error(ModelProviderError(message="timeout", status_code=408))

    assert agent.last_provider_error is None


def test_a_server_side_failure_is_left_unclassified():
    """agno defaults to 502 when there was no response at all (a connection
    error); "no verdict" already describes that."""
    agent = _agent()

    agent._note_provider_error(ModelProviderError(message="connection reset"))

    assert agent.last_provider_error is None


def test_a_non_provider_exception_is_ignored():
    agent = _agent()

    agent._note_provider_error(ValueError("something else entirely"))

    assert agent.last_provider_error is None


def test_a_long_provider_message_is_capped():
    agent = _agent()

    agent._note_provider_error(ModelProviderError(message="x" * 5000, status_code=400))

    assert len(agent.last_provider_error) < 400
    assert agent.last_provider_error.endswith("…")


def test_the_same_rejection_is_recorded_once_for_the_banner():
    """Every hypothesis in the run hits the identical 400; the banner says it
    once."""
    agent = _agent()
    error = ModelProviderError(message="refused", status_code=400)

    agent._note_provider_error(error)
    agent._note_provider_error(error)

    assert len(agent.provider_errors) == 1

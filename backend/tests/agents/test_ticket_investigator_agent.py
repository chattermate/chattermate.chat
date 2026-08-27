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

from app.agents.ticket_investigator import TicketInvestigatorAgent


def _agent():
    return TicketInvestigatorAgent(api_key="k", model_name="gpt-4o-mini", model_type="OPENAI")


def test_a_schema_rejection_is_classified_as_a_provider_error():
    """Every failed run returns None, so the reason has to be recorded
    separately or a hard 400 is indistinguishable from a quiet model (#303)."""
    agent = _agent()

    agent._note_provider_error(
        Exception(
            "Error code: 400 - Invalid schema for function 'search': In "
            "context=('properties', 'queryBody', 'additionalProperties'), schema "
            "must have a 'type' key."
        )
    )

    assert "rejected a connected tool's schema" in agent.last_provider_error
    assert agent.provider_errors == [agent.last_provider_error]


def test_an_ordinary_failure_is_left_unclassified():
    """Only deterministic provider rejections get their own message — a
    network blip should still read as "no verdict"."""
    agent = _agent()

    agent._note_provider_error(Exception("Connection reset by peer"))

    assert agent.last_provider_error is None
    assert agent.provider_errors == []


def test_the_same_rejection_is_recorded_once_for_the_banner():
    """Every hypothesis in the run hits the identical 400; the banner should
    say it once."""
    agent = _agent()
    error = Exception("400 invalid_function_parameters")

    agent._note_provider_error(error)
    agent._note_provider_error(error)

    assert len(agent.provider_errors) == 1

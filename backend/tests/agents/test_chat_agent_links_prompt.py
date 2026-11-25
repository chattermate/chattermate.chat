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

The knowledge tool tells the agent it MUST share the URLs search returns. That
text sits after the business's own instructions and outside their fence, so
an agent told "never share links" sent its own site's pages anyway. The rule
now gives way to the instructions.
"""

import pytest

from app.agents.chat_agent import LINKS_DEFER_TO_INSTRUCTIONS
from app.core.config import settings
from tests.agents.prompt_matrix import (
    CASES,
    build_agent,
    flat_prompt,
    golden_path,
    raw_prompt,
)

URL_RULE_END = "Always preserve and share URLs that are relevant to the customer's query."


@pytest.fixture
def links_defer(monkeypatch):
    monkeypatch.setattr(settings, "AGENT_LINKS_DEFER_TO_INSTRUCTIONS", True)


@pytest.fixture
def links_legacy(monkeypatch):
    monkeypatch.setattr(settings, "AGENT_LINKS_DEFER_TO_INSTRUCTIONS", False)


class TestLinksDeferToInstructions:
    def test_the_url_rule_gives_way_to_the_instructions(self, links_defer):
        prompt = flat_prompt(build_agent(instructions=["Never share links or pages."]))

        assert " ".join(LINKS_DEFER_TO_INSTRUCTIONS.split()) in prompt
        # Right after the rule it qualifies, so the two read as one
        assert URL_RULE_END + " If your instructions above say not to share links" in prompt

    def test_the_instructions_come_before_the_rule_that_refers_to_them(self, links_defer):
        prompt = flat_prompt(build_agent(instructions=["Never share links or pages."]))

        assert prompt.index("Never share links or pages.") < prompt.index(URL_RULE_END)

    def test_switched_off_the_rule_is_as_it_was(self, links_legacy):
        prompt = flat_prompt(build_agent())

        assert URL_RULE_END in prompt
        assert "they win over this" not in prompt

    @pytest.mark.parametrize("case", sorted(CASES))
    def test_on_it_adds_exactly_the_clause_and_nothing_else(self, case, links_defer):
        """Every other part of every agent's prompt is untouched."""
        golden = golden_path(case).read_text(encoding="utf-8")
        prompt = raw_prompt(build_agent(**CASES[case]))

        if URL_RULE_END in golden:
            assert prompt == golden.replace(URL_RULE_END, URL_RULE_END + LINKS_DEFER_TO_INSTRUCTIONS, 1)
        else:
            # A workflow agent never had the URL rule, so nothing changes
            assert prompt == golden

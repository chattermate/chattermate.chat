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

Prompt changes ship behind switches. With every switch off, each agent in the
matrix must get the prompt byte for byte as it was recorded, so turning a
change off really is going back to the old behaviour.
"""

import os

import pytest

from app.core.config import settings
from tests.agents.prompt_matrix import CASES, build_agent, golden_path, raw_prompt

# Every prompt switch, off. A new switch is added here with its off value.
SWITCHES_OFF = {
    "AGENT_LINKS_DEFER_TO_INSTRUCTIONS": False,
    "AGENT_URGENT_HANDOVER_RULES": False,
}


@pytest.fixture
def switches_off(monkeypatch):
    for name, value in SWITCHES_OFF.items():
        monkeypatch.setattr(settings, name, value, raising=False)


@pytest.mark.parametrize("case", sorted(CASES))
def test_prompt_is_unchanged_with_every_switch_off(case, switches_off):
    prompt = raw_prompt(build_agent(**CASES[case]))
    path = golden_path(case)

    if os.environ.get("UPDATE_GOLDEN_PROMPTS") == "1":
        path.parent.mkdir(exist_ok=True)
        path.write_text(prompt, encoding="utf-8")

    assert prompt == path.read_text(encoding="utf-8")

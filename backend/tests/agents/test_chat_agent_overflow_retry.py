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

import asyncio
from types import SimpleNamespace
from typing import List

import pytest

from app.agents.chat_agent import ChatAgent
from app.agents.history_memory import BoundedHistoryMemory

OVERFLOW = Exception(
    "This model's maximum context length is 128000 tokens. However, your messages resulted in 145155 tokens"
)


class _FakeAgent:
    """Stands in for the agno Agent: each arun() consumes the next outcome and
    records the history budget in force at that moment."""

    def __init__(self, outcomes: List):
        self.outcomes = list(outcomes)
        self.memory = BoundedHistoryMemory()
        self.calls = 0
        self.budgets: List[int] = []

    async def arun(self, **kwargs):
        self.calls += 1
        self.budgets.append(getattr(self.memory, "history_max_chars", None))
        outcome = self.outcomes.pop(0)
        if isinstance(outcome, BaseException):
            raise outcome
        return outcome


def _chat_agent(outcomes: List) -> ChatAgent:
    shell = ChatAgent.__new__(ChatAgent)
    shell.agent = _FakeAgent(outcomes)
    return shell


@pytest.mark.asyncio
async def test_overflow_retries_once_without_history_then_restores_budget():
    shell = _chat_agent([OVERFLOW, "ok"])
    assert await shell._arun("hi", "s1") == "ok"
    assert shell.agent.calls == 2
    assert shell.agent.budgets[1] == 0
    assert shell.agent.memory.history_max_chars > 0


@pytest.mark.asyncio
async def test_other_errors_are_not_retried():
    shell = _chat_agent([Exception("rate limit exceeded")])
    with pytest.raises(Exception, match="rate limit"):
        await shell._arun("hi", "s1")
    assert shell.agent.calls == 1


@pytest.mark.asyncio
async def test_second_overflow_surfaces():
    shell = _chat_agent([OVERFLOW, OVERFLOW])
    with pytest.raises(Exception, match="maximum context length"):
        await shell._arun("hi", "s1")
    assert shell.agent.calls == 2


@pytest.mark.asyncio
async def test_timeout_is_not_retried():
    shell = _chat_agent([asyncio.TimeoutError()])
    with pytest.raises(asyncio.TimeoutError):
        await shell._arun("hi", "s1")
    assert shell.agent.calls == 1


@pytest.mark.asyncio
async def test_plain_memory_is_not_retried():
    shell = _chat_agent([OVERFLOW])
    shell.agent.memory = SimpleNamespace()
    with pytest.raises(Exception, match="maximum context length"):
        await shell._arun("hi", "s1")
    assert shell.agent.calls == 1

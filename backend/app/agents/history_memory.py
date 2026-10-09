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

Bounding what previous turns contribute to the model's prompt.

agno replays the messages of the last N runs on every turn, tool results
included. A knowledge search can return thousands of chars, and the answer
built from it is already in the replayed assistant message, so re-sending the
raw result is pure cost — a few searches in, the prompt no longer fits the
model's window and every later turn fails the same way.

This memory keeps the stored runs intact and only changes what is handed to the
model: tool results from earlier turns are replaced with a stub (the pairing
with their tool call is kept — providers need it), and the oldest whole turns
are dropped past a char budget. Nothing is lost from the database.
"""

import asyncio
import re
from contextlib import contextmanager
from typing import Any, Callable, Iterator, List, Optional

from agno.agent import Agent
from agno.memory.v2.memory import Memory
from agno.models.message import Message
from agno.run.response import RunStatus

from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

TOOL_RESULT_STUB = "[{tool} result from an earlier turn omitted]"

# How the major providers word a prompt that does not fit the model's window.
_OVERFLOW_RE = re.compile(
    r"context_length_exceeded|maximum context length|prompt is too long"
    r"|input token count|exceeds the maximum|too many tokens|context window",
    re.IGNORECASE,
)


def is_context_overflow(exc: BaseException) -> bool:
    """True when a provider rejected the request for being too long. The
    message is the only portable signal: agno re-raises each SDK's own error."""
    return bool(_OVERFLOW_RE.search(str(exc)))


class BoundedHistoryMemory(Memory):
    """agno ``Memory`` whose replayed history is bounded in size.

    ``get_messages_from_last_n_runs`` is the hook the agent uses to build the
    prompt's history; the agent deep-copies what it returns, so the copies made
    here never reach the stored runs.
    """

    history_max_chars: int = settings.AGENT_HISTORY_MAX_CHARS

    def get_messages_from_last_n_runs(
        self,
        session_id: str,
        agent_id: Optional[str] = None,
        team_id: Optional[str] = None,
        last_n: Optional[int] = None,
        skip_role: Optional[str] = None,
        skip_status: Optional[List[RunStatus]] = None,
        skip_history_messages: bool = True,
    ) -> List[Message]:
        messages = super().get_messages_from_last_n_runs(
            session_id=session_id,
            agent_id=agent_id,
            team_id=team_id,
            last_n=last_n,
            skip_role=skip_role,
            skip_status=skip_status,
            skip_history_messages=skip_history_messages,
        )
        return bound_history(messages, self.history_max_chars)

    @contextmanager
    def without_history(self) -> Iterator[None]:
        """Temporarily replay no history at all — the recovery path when a
        prompt still does not fit."""
        previous = self.history_max_chars
        self.history_max_chars = 0
        try:
            yield
        finally:
            self.history_max_chars = previous


async def run_with_overflow_recovery(
    agent: Agent,
    message: str,
    session_id: str,
    timeout: float,
    before_retry: Optional[Callable[[], None]] = None,
) -> Any:
    """One agent run under ``timeout``.

    If the provider rejects the prompt as too long, retry once with no
    replayed history inside what is left of the timeout. Without this a
    session whose history outgrew the window fails on every later turn.
    ``before_retry`` resets per-turn tool state so the retry is a fresh turn.
    """
    loop = asyncio.get_running_loop()
    deadline = loop.time() + timeout
    try:
        return await asyncio.wait_for(
            agent.arun(message=message, session_id=session_id, stream=False), timeout=timeout
        )
    except asyncio.TimeoutError:
        raise
    except Exception as exc:
        memory = agent.memory
        if not is_context_overflow(exc) or not isinstance(memory, BoundedHistoryMemory):
            raise
        remaining = deadline - loop.time()
        if remaining <= 0:
            raise
        logger.warning(
            f"Prompt exceeded the model's context window; retrying without history "
            f"(session_id={session_id}): {exc}"
        )
        if before_retry is not None:
            before_retry()
        with memory.without_history():
            return await asyncio.wait_for(
                agent.arun(message=message, session_id=session_id, stream=False),
                timeout=remaining,
            )


def bound_history(messages: List[Message], max_chars: int) -> List[Message]:
    """Stub earlier tool results, then drop the oldest turns until the rest
    fits ``max_chars``. Turns are split at user messages so a tool call and its
    result are never separated."""
    stubbed = [_stub_tool_result(message) for message in messages]
    turns = _split_turns(stubbed)
    kept: List[List[Message]] = []
    total = 0
    for turn in reversed(turns):
        size = sum(_size(message) for message in turn)
        if kept and total + size > max_chars:
            break
        if not kept and size > max_chars:
            break
        kept.append(turn)
        total += size
    return [message for turn in reversed(kept) for message in turn]


def _stub_tool_result(message: Message) -> Message:
    if message.role != "tool":
        return message
    return message.model_copy(
        update={"content": TOOL_RESULT_STUB.format(tool=message.tool_name or "tool")}
    )


def _split_turns(messages: List[Message]) -> List[List[Message]]:
    turns: List[List[Message]] = []
    for message in messages:
        if message.role == "user" or not turns:
            turns.append([])
        turns[-1].append(message)
    return turns


def _size(message: Message) -> int:
    content = message.content
    if isinstance(content, str):
        return len(content)
    return len(str(content)) if content else 0

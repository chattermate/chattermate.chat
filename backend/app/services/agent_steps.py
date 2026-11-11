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

The live work trace: while the widget's agent answers, each tool call is shown
to the visitor as a step ("Searching the help center" → "Searched the help
center"), and the finished reply carries a short receipt of those steps.

Only the tool's name is used. Arguments and results never leave the server:
they can hold the visitor's own data, other customers' data or internal notes.
"""

import asyncio
import inspect
import time
import uuid
from typing import Any, Awaitable, Callable, Dict, List, Optional

from app.agents.tool_labels import HIDDEN_TOOLS, label_for
from app.core.logger import get_logger

logger = get_logger(__name__)

# More steps than this in one turn are run but not shown.
MAX_STEPS = 20

Emit = Callable[[str, dict, str], Awaitable[None]]


async def _socket_emit(event: str, payload: dict, room: str) -> None:
    from app.core.socketio import sio
    await sio.emit(event, payload, room=room, namespace='/widget')


def _is_sync_tool(agent: Any, function_name: str) -> bool:
    """Whether the agent's tool of that name is a plain function. agno runs those
    in a worker thread, but with an async hook in the chain it would call them on
    the event loop and freeze the server for the length of the call."""
    functions = getattr(agent, '_functions_for_model', None) or {}
    entrypoint = getattr(functions.get(function_name), 'entrypoint', None)
    return (entrypoint is not None and not inspect.iscoroutinefunction(entrypoint)
            and not inspect.isasyncgenfunction(entrypoint))


def _run_to_completion(function: Callable, arguments: Dict[str, Any]) -> Any:
    """Run the rest of agno's chain (a coroutine around a sync tool) on this thread."""
    result = function(**arguments)
    return asyncio.run(result) if inspect.iscoroutine(result) else result


async def _call(function: Callable, arguments: Dict[str, Any], in_thread: bool = False) -> Any:
    if in_thread:
        return await asyncio.to_thread(_run_to_completion, function, arguments)
    result = function(**arguments)
    if inspect.isawaitable(result):
        result = await result
    return result


class StepReporter:
    """An agno tool hook that reports one turn's tool calls to the widget."""

    def __init__(self, session_id: str, emit: Optional[Emit] = None, turn_id: Optional[str] = None):
        self.session_id = session_id
        self.turn_id = turn_id or uuid.uuid4().hex
        self._emit = emit or _socket_emit
        self.reset()

    def reset(self) -> None:
        """Forget the steps so far: the turn starts again (a context-overflow retry)."""
        self._started: Optional[float] = None
        self._seq = 0
        self._steps: List[dict] = []

    async def tool_hook(self, function_name: str, function: Callable, arguments: Dict[str, Any], agent: Any = None):
        in_thread = _is_sync_tool(agent, function_name)
        if function_name in HIDDEN_TOOLS or len(self._steps) >= MAX_STEPS:
            return await _call(function, arguments, in_thread)
        label = label_for(function_name)
        if self._started is None:
            self._started = time.monotonic()
        self._seq += 1
        step = {'step_id': uuid.uuid4().hex, 'seq': self._seq, 'kind': label.kind}
        self._steps.append(step)
        await self._send({**step, 'phase': 'start', 'label': label.label})
        started = time.monotonic()
        status = 'ok'
        try:
            return await _call(function, arguments, in_thread)
        except BaseException:  # a timeout's cancellation is a step that did not finish too
            status = 'error'
            raise
        finally:
            step.update(done_label=label.done_label, status=status,
                        duration_ms=int((time.monotonic() - started) * 1000))
            await self._send({**step, 'phase': 'finish'})

    async def _send(self, step: dict) -> None:
        payload = {'v': 1, 'session_id': self.session_id, 'turn_id': self.turn_id, **step}
        try:
            await self._emit('agent_step', payload, self.session_id)
        except Exception as e:  # the trace is a nicety: never fail the tool over it
            logger.warning(f"Could not send agent step: {e}")

    def summary(self) -> Optional[dict]:
        """The receipt stored on the reply, or None when no tool ran."""
        finished = [s for s in self._steps if 'status' in s]
        if not finished or self._started is None:
            return None
        return {
            'turn_id': self.turn_id,
            'duration_ms': int((time.monotonic() - self._started) * 1000),
            'steps': [{k: s[k] for k in ('kind', 'done_label', 'status', 'duration_ms')} for s in finished],
        }

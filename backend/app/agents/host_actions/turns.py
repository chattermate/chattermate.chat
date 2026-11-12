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

A reply that is waiting on the host page: what the model asked for, and how
the page's answers are handed back so the run can resume.
"""

import hashlib
import json
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from agno.agent import Agent
from jsonschema.validators import Draft202012Validator
from agno.memory.v2.memory import Memory
from agno.models.response import ToolExecution

from app.agents.guardrail_policy import visitor_data_block
from app.core.config import settings
from app.models.agent_action import ActionCallStatus

RESULT_LABEL = "APP ACTION RESULT"

# What the model is told for each way a call can end without a result.
OUTCOME_TEXT = {
    ActionCallStatus.DECLINED: "The user declined this action. It did not run.",
    ActionCallStatus.TIMEOUT: "The app did not answer in time. The action may not have run.",
    ActionCallStatus.SKIPPED: "Not run, because an earlier action in this step did not succeed.",
    ActionCallStatus.ERROR: "The action failed in the app.",
    ActionCallStatus.ABANDONED: "The app went away before the action finished.",
}


@dataclass
class PausedTurn:
    """The model called host actions; the reply resumes once each has an outcome."""
    run_id: str
    calls: List[ToolExecution]


def args_hash(args: Optional[Dict[str, Any]]) -> str:
    """A stable fingerprint of the arguments, so calls can be compared in the
    audit log without storing what the visitor typed."""
    return hashlib.sha256(json.dumps(args or {}, sort_keys=True, default=str).encode()).hexdigest()


def result_text(status: ActionCallStatus, result: Any = None, error: Optional[str] = None) -> str:
    """The tool message the model reads for one call, fenced as data."""
    if status == ActionCallStatus.OK:
        body = json.dumps(result, ensure_ascii=False, default=str)
        body = body[: settings.ACTION_RESULT_MAX_BYTES]
    else:
        body = OUTCOME_TEXT[status]
        if error:
            body = f"{body} {error}"
    return visitor_data_block(RESULT_LABEL, body, limit=settings.ACTION_RESULT_MAX_BYTES)


def argument_problem(schema: Optional[Dict[str, Any]], args: Optional[Dict[str, Any]]) -> Optional[str]:
    """Why the model's arguments don't fit the action's schema, or None when they do."""
    if not schema:
        return None
    error = next(iter(Draft202012Validator(schema).iter_errors(args or {})), None)
    if error is None:
        return None
    where = ".".join(str(p) for p in error.absolute_path)
    return (f"{where}: {error.message}" if where else error.message)[:200]


def invalid_args_text(problem: str) -> str:
    """The tool message for a call that never reached the page, fenced as data."""
    body = f"Not run: the arguments don't match this action's schema ({problem}). Fix them and call it again."
    return visitor_data_block(RESULT_LABEL, body, limit=settings.ACTION_RESULT_MAX_BYTES)


def fill_results(tools: List[ToolExecution], results: Dict[str, str]) -> List[ToolExecution]:
    """Put each call's outcome on the paused run's tools. Every paused call
    must get one, or agno refuses to continue."""
    for tool in tools:
        if tool.external_execution_required:
            tool.result = results.get(tool.tool_call_id) or OUTCOME_TEXT[ActionCallStatus.SKIPPED]
    return tools


def paused_turn(response: Any) -> Optional[PausedTurn]:
    """The paused turn when an agno run stopped for host actions, else None."""
    if response is None or getattr(response, "is_paused", False) is not True:
        return None
    calls = list(response.tools_awaiting_external_execution)
    return PausedTurn(run_id=response.run_id, calls=calls) if calls else None


def paused_run_tools(agent: Agent, run_id: str, session_id: str) -> Optional[List[ToolExecution]]:
    """The tools of a paused run, read back from storage so any worker can
    resume it. None when the run is gone or no longer waiting."""
    agent.read_from_storage(session_id=session_id)
    if not isinstance(agent.memory, Memory):
        return None
    runs = agent.memory.get_runs(session_id=session_id) or []
    run = next((r for r in runs if r.run_id == run_id), None)
    if run is None or not run.tools or not any(t.external_execution_required for t in run.tools):
        return None
    return run.tools

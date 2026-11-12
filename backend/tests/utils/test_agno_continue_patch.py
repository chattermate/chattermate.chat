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

import json

import httpx
import pytest
from agno.agent import Agent
from agno.memory.v2.memory import Memory
from agno.models.openai import OpenAIChat
from agno.storage.sqlite import SqliteStorage
from agno.tools.function import Function
from pydantic import BaseModel

from app.agents.host_actions.turns import fill_results, paused_run_tools, paused_turn
from app.utils.agno_continue_patch import install_continue_patch


class Reply(BaseModel):
    message: str


def _model(requests):
    def handler(request: httpx.Request):
        body = json.loads(request.content)
        requests.append(body)
        last = body["messages"][-1]
        if last["role"] == "tool":
            message = {"role": "assistant", "content": json.dumps({"message": "Opened it."})}
        else:
            message = {"role": "assistant", "content": None, "tool_calls": [{
                "id": "call_1", "type": "function",
                "function": {"name": "open_page", "arguments": json.dumps({"path": "/billing"})},
            }]}
        return httpx.Response(200, json={
            "id": "x", "object": "chat.completion", "created": 1, "model": "m",
            "choices": [{"index": 0, "message": message, "finish_reason": "stop"}],
            "usage": {"prompt_tokens": 1, "completion_tokens": 1, "total_tokens": 2},
        })
    return OpenAIChat(id="m", api_key="k", http_client=httpx.AsyncClient(transport=httpx.MockTransport(handler)))


def _agent(requests, db_file):
    action = Function(name="open_page", description="Open a page",
                      parameters={"type": "object", "properties": {"path": {"type": "string"}}},
                      external_execution=True)
    return Agent(model=_model(requests), tools=[action], instructions="Help the user.",
                 storage=SqliteStorage(table_name="sessions", db_file=db_file), memory=Memory(),
                 session_id="s1", user_id="u1", add_history_to_messages=True,
                 response_model=Reply, structured_outputs=True, system_message_role="system")


@pytest.mark.asyncio
async def test_a_paused_run_resumes_on_a_fresh_agent_with_the_user_message(tmp_path):
    install_continue_patch()
    requests = []
    db_file = str(tmp_path / "agno.db")

    first = await _agent(requests, db_file).arun("Take me to billing", session_id="s1")
    paused = paused_turn(first)
    assert paused is not None
    assert [c.tool_args for c in paused.calls] == [{"path": "/billing"}]

    # Another worker: a new agent reads the paused run back from storage.
    second = _agent(requests, db_file)
    tools = paused_run_tools(second, paused.run_id, "s1")
    assert tools is not None
    resumed = await second.acontinue_run(
        run_id=paused.run_id, updated_tools=fill_results(tools, {"call_1": '{"ok": true}'}), session_id="s1",
    )
    assert paused_turn(resumed) is None
    assert resumed.content.message == "Opened it."

    sent = requests[-1]["messages"]
    # OpenAI sends the system message as "developer".
    assert [m["role"] for m in sent][:2] == ["developer", "user"]
    assert sent[1]["content"] == "Take me to billing"
    assert sent[-1]["role"] == "tool"

    # The finished run is no longer waiting.
    assert paused_run_tools(_agent(requests, db_file), paused.run_id, "s1") is None


def test_patch_is_idempotent():
    install_continue_patch()
    patched = Agent.get_continue_run_messages
    install_continue_patch()
    assert Agent.get_continue_run_messages is patched

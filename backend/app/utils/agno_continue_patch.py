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

Keeps the user's message when agno 1.7.6 resumes a paused run.

`Agent.acontinue_run` takes the run's first user message out of the stored
messages (to set `run_input`) and never puts it back, so the model answers a
host action's result without seeing what the user asked, and the turn is saved
to history without it. Remove with the agno 2.x upgrade.
"""

from agno.agent import Agent
from agno.models.message import Message

_PATCHED_FLAG = "_chattermate_keeps_user_message"


def install_continue_patch() -> None:
    """Patch `Agent.get_continue_run_messages`. Safe to call more than once."""
    if getattr(Agent.get_continue_run_messages, _PATCHED_FLAG, False):
        return
    original = Agent.get_continue_run_messages

    def get_continue_run_messages(self, messages):
        run_input = self.run_input
        has_user = any(m.role == self.user_message_role for m in messages)
        if not has_user and isinstance(run_input, dict) and run_input.get("role") == self.user_message_role:
            user_message = Message.model_validate(run_input)
            system_index = next(
                (i for i, m in enumerate(messages) if m.role == self.system_message_role), None,
            )
            messages.insert(0 if system_index is None else system_index + 1, user_message)
        return original(self, messages)

    setattr(get_continue_run_messages, _PATCHED_FLAG, True)
    Agent.get_continue_run_messages = get_continue_run_messages

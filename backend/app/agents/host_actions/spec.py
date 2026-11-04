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

How a declared action is described to the model. One place, so the dashboard's
"Preview what the model sees" and the real tool definition can never differ.
"""

from app.models.agent_action import AgentAction
from app.models.schemas.agent_action import AgentActionModelView

SENSITIVE_FORM_NOTE = (
    "This opens a form in the app where the user types private details "
    "(IDs, bank or health information) themselves. Never pass such details as "
    "arguments and never ask the user to type them in chat."
)


def model_description(action: AgentAction) -> str:
    if action.sensitive_form:
        return f"{action.description}\n\n{SENSITIVE_FORM_NOTE}"
    return action.description


def model_view(action: AgentAction) -> AgentActionModelView:
    return AgentActionModelView(
        name=action.name,
        description=model_description(action),
        parameters=action.parameters,
    )

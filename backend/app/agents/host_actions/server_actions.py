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

Actions the server runs once the visitor approves them.

An installed extension gives the agent a tool that pauses the run like a host
action (agno external execution) and registers a ServerAction under the same
name. The widget shows the confirm card the server describes, and on approval
the server runs the action itself instead of the page. The visitor always
answers the card: the model can't skip it, and nothing runs without a yes.

`prepare` runs before the card is shown: it checks the call (who may, limits,
what state things are in) and either describes what will happen or refuses.
`run` runs after the yes, and must check again, because time has passed.
Both are blocking (they may call another service); the runtime runs them off
the event loop.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Protocol, Tuple, Union


@dataclass
class ServerActionContext:
    organization_id: str
    agent_id: str
    session_id: str
    customer_id: Optional[str]
    # The agent_action_calls row: an action that changes something can use it
    # as its idempotency key
    call_id: str


@dataclass
class Approval:
    """What the confirm card says: `label` is the approve button ("Refund
    $20.00 on #1005"), `details` are lines under it."""
    label: str
    details: List[Tuple[str, str]] = field(default_factory=list)
    decline: str = "Not now"


@dataclass
class Refusal:
    """The call can't run: `reason` tells the model why and what to do instead
    (ask for a detail, or hand over). No card is shown."""
    reason: str


class ActionFailed(Exception):
    """The action ran and didn't work. The message is shown to the visitor and
    told to the model, so it must be safe to show."""


class ServerAction(Protocol):
    name: str

    def prepare(self, ctx: ServerActionContext, args: Dict[str, Any]) -> Union[Approval, Refusal]: ...

    def run(self, ctx: ServerActionContext, args: Dict[str, Any]) -> Dict[str, Any]:
        """The result the model reads. Its `summary` (one line) is shown in the
        chat. Raise ActionFailed when it didn't work."""
        ...

    # Optional: `async def announce(ctx, result)`, awaited on the event loop
    # after a run that worked (to tell open dashboards, say). A failure there
    # is logged and changes nothing.


_actions: Dict[str, ServerAction] = {}


def register(action: ServerAction) -> None:
    _actions[action.name] = action


def get(name: Optional[str]) -> Optional[ServerAction]:
    return _actions.get(name) if name else None


def reset() -> None:
    """Forget every registration (tests)."""
    _actions.clear()

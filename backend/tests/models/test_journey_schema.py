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

import pytest
from pydantic import ValidationError

from app.core.config import settings
from app.models.schemas.journey import JourneyDefinition, JourneyWrite

DONE = [{"kind": "event", "value": "done"}]


def _step(**extra):
    return {"id": "s1", "title": "One", "done_when": DONE, **extra}


def test_minimal_definition():
    definition = JourneyDefinition(steps=[_step()])
    assert definition.start.kind == "manual"
    assert definition.audience.kind == "everyone"


@pytest.mark.parametrize("step, message", [
    (_step(chips=[{"label": "Go", "kind": "action", "value": "send_invoice"}]), "isn't allowed on this step"),
    (_step(done_when=[]), "at least 1"),
    (_step(done_when=[{"kind": "url", "value": "/x"}]), "visiting a page"),
    (_step(triggers=[{"kind": "action", "value": "open_page"}]), "start on an action"),
    (_step(done_when=[{"kind": "ctx", "value": "Bad-Field"}]), "not a field name"),
    (_step(done_when=[{"kind": "ctx", "value": "count", "op": "gte"}]), "needs a value"),
    (_step(then={"kind": "start_journey"}), "needs a value"),
    (_step(id="has space"), "Step ids"),
    (_step(chips=[{"label": str(i), "value": "x"} for i in range(5)]), "at most 4"),
])
def test_invalid_steps(step, message):
    with pytest.raises(ValidationError) as exc:
        JourneyDefinition(steps=[step])
    assert message in str(exc.value)


def test_step_ids_unique_and_capped():
    with pytest.raises(ValidationError, match="its own id"):
        JourneyDefinition(steps=[_step(), _step()])
    steps = [_step(id=f"s{i}") for i in range(settings.JOURNEY_MAX_STEPS + 1)]
    with pytest.raises(ValidationError, match="at most"):
        JourneyDefinition(steps=steps)


def test_audience_and_start_rules():
    with pytest.raises(ValidationError, match="at least one rule"):
        JourneyDefinition(steps=[_step()], audience={"kind": "rules"})
    with pytest.raises(ValidationError, match="page or user fields"):
        JourneyDefinition(steps=[_step()], audience={"kind": "rules", "rules": [{"kind": "url", "value": "/x"}]})
    with pytest.raises(ValidationError, match="Say which"):
        JourneyDefinition(steps=[_step()], start={"kind": "url"})


def test_write_checks_key_and_goal():
    base = {"name": "First invoice", "definition": {"steps": [_step()]}}
    with pytest.raises(ValidationError, match="lowercase"):
        JourneyWrite(key="First-Invoice", **base)
    with pytest.raises(ValidationError, match="goal"):
        JourneyWrite(key="first_invoice", goal_event="Sent!", **base)
    assert JourneyWrite(key="first_invoice", goal_event="", **base).goal_event is None

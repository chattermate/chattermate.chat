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

from datetime import datetime, timedelta, timezone

from app.agents.host_actions.spec import SENSITIVE_FORM_NOTE, model_view
from app.models.schemas.agent_action import AgentActionCreate
from app.repositories.agent_action import REGISTRATION_TOUCH_INTERVAL, AgentActionRepository


def _make(repo, org_id, agent_id, name, **extra):
    data = AgentActionCreate(name=name, label=name, description=f"{name} it", **extra)
    return repo.create(org_id, agent_id, data)


def test_enabled_by_names_filters_disabled_and_unknown(db, test_agent):
    repo = AgentActionRepository(db)
    _make(repo, test_agent.organization_id, test_agent.id, "open_page")
    _make(repo, test_agent.organization_id, test_agent.id, "send_invoice", enabled=False)
    found = repo.enabled_by_names(test_agent.id, ["open_page", "send_invoice", "nope", "open_page"])
    assert [a.name for a in found] == ["open_page"]
    assert repo.enabled_by_names(test_agent.id, []) == []


def test_touch_registered_is_throttled(db, test_agent):
    repo = AgentActionRepository(db)
    action = _make(repo, test_agent.organization_id, test_agent.id, "open_page")
    repo.touch_registered([action])
    first = action.last_registered_at
    assert first is not None

    repo.touch_registered([action])
    assert action.last_registered_at == first

    action.last_registered_at = datetime.now(timezone.utc) - REGISTRATION_TOUCH_INTERVAL - timedelta(seconds=1)
    db.commit()
    repo.touch_registered([action])
    assert action.last_registered_at > first


def test_model_view_plain_description(db, test_agent):
    repo = AgentActionRepository(db)
    action = _make(repo, test_agent.organization_id, test_agent.id, "open_page")
    view = model_view(action)
    assert view.description == "open_page it"
    assert SENSITIVE_FORM_NOTE not in view.description

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

from app.repositories.lead_capture import LeadCaptureConfigRepository
from app.models.schemas.lead_capture import LeadCaptureConfigUpdate, LeadField


@pytest.fixture
def repo(db):
    return LeadCaptureConfigRepository(db)


def test_get_by_agent_none_initially(repo, test_agent):
    assert repo.get_by_agent(test_agent.id) is None


def test_get_or_create_lazily_creates_off_config(repo, test_agent):
    cfg = repo.get_or_create(test_agent.id)
    assert cfg is not None
    assert cfg.agent_id == test_agent.id
    assert cfg.enabled is False
    # Idempotent — a second call returns the same row.
    again = repo.get_or_create(test_agent.id)
    assert again.id == cfg.id


def test_update_replaces_config(repo, test_agent):
    repo.get_or_create(test_agent.id)
    data = LeadCaptureConfigUpdate(
        enabled=True,
        require_consent=False,
        guidance="Ask after pricing questions",
        fields=[
            LeadField(key="email", standard=True, enabled=True, required=True),
            LeadField(key="custom_team", standard=False, enabled=True, label="Team size",
                      options=["1-10", "11-50"]),
        ],
    )
    updated = repo.update(test_agent.id, data)
    assert updated.enabled is True
    assert updated.require_consent is False
    assert updated.guidance == "Ask after pricing questions"
    keys = {f["key"] for f in (updated.fields or [])}
    assert keys == {"email", "custom_team"}

    # Persisted: a fresh fetch reflects the update.
    fetched = repo.get_by_agent(test_agent.id)
    assert fetched.enabled is True
    assert len(fetched.fields) == 2

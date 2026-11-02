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
from uuid import uuid4

from app.core.config import settings
from app.models.agent_action import AgentActionCall
from app.models.journey import JourneyProgress, JourneyStepProgress
from app.models.schemas.journey import JourneyWrite
from app.repositories.journey import JourneyRepository
from app.workers.journey_data_purge import purge_old_rows


def test_purges_only_rows_past_retention(db, test_agent, test_customer):
    now = datetime.now(timezone.utc)
    old = now - timedelta(days=settings.JOURNEY_DATA_RETENTION_DAYS + 1)
    journey = JourneyRepository(db).create(test_agent.organization_id, test_agent.id, JourneyWrite(
        key="j", name="J", definition={"steps": [{"id": "s", "title": "S", "done_when": [{"kind": "event", "value": "e"}]}]}))
    def call(created):
        return AgentActionCall(organization_id=test_agent.organization_id, agent_id=test_agent.id, action_name="a",
                               session_id=uuid4(), run_id="r", tool_call_id=str(uuid4()), seq=0, args_hash="h",
                               created_at=created)
    db.add_all([call(old), call(now)])
    stale = JourneyProgress(journey_id=journey.id, agent_id=test_agent.id, customer_id=test_customer.id,
                            journey_version=1, status="finished", last_seen_at=old)
    db.add(stale)
    db.commit()
    db.add(JourneyStepProgress(progress_id=stale.id, step_id="s", reached_at=old))
    db.commit()

    removed = purge_old_rows(db, now)

    assert removed == {"action_calls": 1, "journey_progress": 1}
    assert db.query(AgentActionCall).count() == 1
    assert db.query(JourneyProgress).count() == 0

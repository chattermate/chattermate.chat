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
from statistics import median
from typing import Dict, Iterable, List, Optional
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.journey import (
    AgentContextKey, Journey, JourneyProgress, JourneyStatus, JourneyStepProgress, ProgressStatus,
)
from app.models.schemas.journey import JourneyWrite

# How stale a context key's "last seen" may get before it is written again.
CONTEXT_KEY_TOUCH_INTERVAL = timedelta(hours=1)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _aware(moment: Optional[datetime]) -> Optional[datetime]:
    if moment is None:
        return None
    return moment if moment.tzinfo else moment.replace(tzinfo=timezone.utc)


class DuplicateJourneyKey(Exception):
    """Another journey on the same agent already has this key."""


class JourneyRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_for_agent(self, agent_id: UUID) -> List[Journey]:
        return (self.db.query(Journey).filter(Journey.agent_id == agent_id)
                .order_by(Journey.priority, Journey.created_at).all())

    def live_for_agent(self, agent_id: UUID) -> List[Journey]:
        return (self.db.query(Journey)
                .filter(Journey.agent_id == agent_id, Journey.status == JourneyStatus.LIVE.value)
                .order_by(Journey.priority, Journey.created_at).all())

    def count_for_agent(self, agent_id: UUID) -> int:
        return self.db.query(Journey).filter(Journey.agent_id == agent_id).count()

    def get(self, agent_id: UUID, journey_id: UUID) -> Optional[Journey]:
        return self.db.query(Journey).filter(Journey.agent_id == agent_id, Journey.id == journey_id).first()

    def get_by_key(self, agent_id: UUID, key: str) -> Optional[Journey]:
        return self.db.query(Journey).filter(Journey.agent_id == agent_id, Journey.key == key).first()

    def create(self, organization_id: UUID, agent_id: UUID, data: JourneyWrite) -> Journey:
        journey = Journey(organization_id=organization_id, agent_id=agent_id, version=1)
        self._apply(journey, data)
        self.db.add(journey)
        self._commit_unique()
        self.db.refresh(journey)
        return journey

    def update(self, journey: Journey, data: JourneyWrite) -> Journey:
        definition = data.definition.model_dump(mode="json")
        if definition != journey.definition:
            # Users part-way through move on by step id (see journey_runtime).
            journey.version = (journey.version or 1) + 1
        self._apply(journey, data)
        self._commit_unique()
        self.db.refresh(journey)
        return journey

    def set_status(self, journey: Journey, status: JourneyStatus) -> Journey:
        journey.status = status.value
        self.db.commit()
        self.db.refresh(journey)
        return journey

    def reorder(self, agent_id: UUID, ids: Iterable[UUID]) -> List[Journey]:
        by_id = {j.id: j for j in self.list_for_agent(agent_id)}
        for priority, journey_id in enumerate(ids):
            if journey_id in by_id:
                by_id[journey_id].priority = priority
        self.db.commit()
        return self.list_for_agent(agent_id)

    def delete(self, journey: Journey) -> None:
        self.db.delete(journey)
        self.db.commit()

    def _commit_unique(self) -> None:
        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise DuplicateJourneyKey() from exc

    @staticmethod
    def _apply(journey: Journey, data: JourneyWrite) -> None:
        journey.key = data.key
        journey.name = data.name
        journey.status = data.status.value
        journey.priority = data.priority
        journey.auto_open = data.auto_open
        journey.goal_event = data.goal_event
        journey.template_key = data.template_key
        journey.definition = data.definition.model_dump(mode="json")


class JourneyProgressRepository:
    def __init__(self, db: Session):
        self.db = db

    def active(self, agent_id: UUID, customer_id: UUID) -> Optional[JourneyProgress]:
        return (self.db.query(JourneyProgress)
                .filter(JourneyProgress.agent_id == agent_id, JourneyProgress.customer_id == customer_id,
                        JourneyProgress.status == ProgressStatus.ACTIVE.value)
                .first())

    def taken(self, agent_id: UUID, customer_id: UUID) -> Dict[UUID, JourneyProgress]:
        """Every journey this user has started, finished or dismissed with the agent."""
        rows = (self.db.query(JourneyProgress)
                .filter(JourneyProgress.agent_id == agent_id, JourneyProgress.customer_id == customer_id).all())
        return {p.journey_id: p for p in rows}

    def start(self, journey: Journey, customer_id: UUID, step_id: str) -> Optional[JourneyProgress]:
        """Start the user on the journey. None when another worker started one first."""
        progress = JourneyProgress(
            journey_id=journey.id, agent_id=journey.agent_id, customer_id=customer_id,
            journey_version=journey.version, current_step_id=step_id,
        )
        self.db.add(progress)
        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            return None
        self.db.refresh(progress)
        return progress

    def step(self, progress: JourneyProgress, step_id: str) -> JourneyStepProgress:
        row = self.db.get(JourneyStepProgress, (progress.id, step_id))
        if row is None:
            row = JourneyStepProgress(progress_id=progress.id, step_id=step_id)
            self.db.add(row)
        return row

    def steps(self, progress_id: UUID) -> List[JourneyStepProgress]:
        return self.db.query(JourneyStepProgress).filter(JourneyStepProgress.progress_id == progress_id).all()

    def commit(self) -> None:
        self.db.commit()

    def mark_goal(self, journey_id: UUID, customer_id: UUID) -> None:
        progress = (self.db.query(JourneyProgress)
                    .filter(JourneyProgress.journey_id == journey_id, JourneyProgress.customer_id == customer_id)
                    .first())
        if progress is not None and progress.goal_at is None:
            progress.goal_at = _now()
            self.db.commit()

    # --- reporting -------------------------------------------------------

    def funnel(self, journey: Journey, since: datetime) -> dict:
        progresses = (self.db.query(JourneyProgress)
                      .filter(JourneyProgress.journey_id == journey.id, JourneyProgress.started_at >= since).all())
        ids = [p.id for p in progresses]
        rows = (self.db.query(JourneyStepProgress).filter(JourneyStepProgress.progress_id.in_(ids)).all()
                if ids else [])
        by_step: Dict[str, List[JourneyStepProgress]] = {}
        for row in rows:
            by_step.setdefault(row.step_id, []).append(row)
        steps = []
        for step in journey.definition.get("steps", []):
            step_rows = by_step.get(step["id"], [])
            reached = [r for r in step_rows if r.reached_at]
            done = [r for r in reached if r.done_at]
            skipped = [r for r in reached if r.skipped_at]
            durations = [(_aware(r.done_at) - _aware(r.reached_at)).total_seconds() for r in done]
            steps.append({
                "step_id": step["id"],
                "title": step["title"],
                "reached": len(reached),
                "done": len(done),
                "skipped": len(skipped),
                "dropped": len(reached) - len(done) - len(skipped),
                "median_seconds": median(durations) if durations else None,
            })
        finished = [p for p in progresses if p.status == ProgressStatus.FINISHED.value]
        finish_durations = [(_aware(p.finished_at) - _aware(p.started_at)).total_seconds() for p in finished if p.finished_at]
        return {
            "started": len(progresses),
            "finished": len(finished),
            "goal_reached": sum(1 for p in progresses if p.goal_at),
            "median_seconds_to_finish": median(finish_durations) if finish_durations else None,
            "steps": steps,
        }

    def stuck_on(self, journey: Journey, step_id: str, limit: int = 500) -> List[dict]:
        """Users whose journey is waiting on this step, longest-waiting first."""
        rows = (self.db.query(JourneyProgress, Customer, JourneyStepProgress)
                .join(Customer, Customer.id == JourneyProgress.customer_id)
                .outerjoin(JourneyStepProgress, (JourneyStepProgress.progress_id == JourneyProgress.id)
                           & (JourneyStepProgress.step_id == step_id))
                .filter(JourneyProgress.journey_id == journey.id,
                        JourneyProgress.status == ProgressStatus.ACTIVE.value,
                        JourneyProgress.current_step_id == step_id)
                .order_by(JourneyProgress.last_seen_at)
                .limit(limit).all())
        return [{
            "customer_id": customer.id,
            "name": customer.full_name,
            "email": customer.email,
            "reached_at": step_row.reached_at if step_row else None,
            "last_seen_at": progress.last_seen_at,
        } for progress, customer, step_row in rows]

    def timeline(self, customer_id: UUID, organization_id: UUID) -> List[dict]:
        """A person's journeys, newest first, with each step's times."""
        rows = (self.db.query(JourneyProgress, Journey)
                .join(Journey, Journey.id == JourneyProgress.journey_id)
                .filter(JourneyProgress.customer_id == customer_id, Journey.organization_id == organization_id)
                .order_by(JourneyProgress.started_at.desc()).all())
        out = []
        for progress, journey in rows:
            step_rows = {r.step_id: r for r in self.steps(progress.id)}
            out.append({
                "journey_id": journey.id,
                "journey_name": journey.name,
                "status": progress.status,
                "started_at": progress.started_at,
                "finished_at": progress.finished_at,
                "goal_at": progress.goal_at,
                "current_step_id": progress.current_step_id,
                "steps": [{
                    "step_id": s["id"],
                    "title": s["title"],
                    "reached_at": step_rows[s["id"]].reached_at if s["id"] in step_rows else None,
                    "done_at": step_rows[s["id"]].done_at if s["id"] in step_rows else None,
                    "skipped_at": step_rows[s["id"]].skipped_at if s["id"] in step_rows else None,
                    "done_by": step_rows[s["id"]].done_by if s["id"] in step_rows else None,
                } for s in journey.definition.get("steps", [])],
            })
        return out


class AgentContextKeyRepository:
    def __init__(self, db: Session):
        self.db = db

    def record(self, agent_id: UUID, keys: Iterable[str], source: str) -> None:
        """Remember the fields a page sent, at most once an hour per field."""
        now = _now()
        existing = {k.key: k for k in self.db.query(AgentContextKey).filter(AgentContextKey.agent_id == agent_id).all()}
        changed = False
        for key in keys:
            row = existing.get(key)
            if row is None:
                self.db.add(AgentContextKey(agent_id=agent_id, key=key, source=source, last_seen_at=now))
                changed = True
            elif now - _aware(row.last_seen_at) >= CONTEXT_KEY_TOUCH_INTERVAL:
                row.last_seen_at = now
                changed = True
        if changed:
            try:
                self.db.commit()
            except IntegrityError:
                self.db.rollback()  # another worker recorded it first

    def for_agent(self, agent_id: UUID) -> List[AgentContextKey]:
        return (self.db.query(AgentContextKey).filter(AgentContextKey.agent_id == agent_id)
                .order_by(AgentContextKey.key).all())

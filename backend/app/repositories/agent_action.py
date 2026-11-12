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
from typing import Iterable, List, Optional
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.agent_action import AgentAction
from app.models.schemas.agent_action import AgentActionWrite

# How stale "last seen" may get before a fresh registration is written again;
# keeps a busy widget from writing on every page load.
REGISTRATION_TOUCH_INTERVAL = timedelta(minutes=5)


class DuplicateActionName(Exception):
    """Another action on the same agent already has this name."""


class AgentActionRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_for_agent(self, agent_id: UUID) -> List[AgentAction]:
        return (
            self.db.query(AgentAction)
            .filter(AgentAction.agent_id == agent_id)
            .order_by(AgentAction.created_at, AgentAction.name)
            .all()
        )

    def count_for_agent(self, agent_id: UUID) -> int:
        return self.db.query(AgentAction).filter(AgentAction.agent_id == agent_id).count()

    def get(self, agent_id: UUID, action_id: UUID) -> Optional[AgentAction]:
        return (
            self.db.query(AgentAction)
            .filter(AgentAction.agent_id == agent_id, AgentAction.id == action_id)
            .first()
        )

    def get_by_name(self, agent_id: UUID, name: str) -> Optional[AgentAction]:
        return (
            self.db.query(AgentAction)
            .filter(AgentAction.agent_id == agent_id, AgentAction.name == name)
            .first()
        )

    def enabled_by_names(self, agent_id: UUID, names: Iterable[str]) -> List[AgentAction]:
        """The enabled actions among `names` (what a page registered)."""
        wanted = list(set(names))
        if not wanted:
            return []
        return (
            self.db.query(AgentAction)
            .filter(
                AgentAction.agent_id == agent_id,
                AgentAction.enabled.is_(True),
                AgentAction.name.in_(wanted),
            )
            .order_by(AgentAction.name)
            .all()
        )

    def create(self, organization_id: UUID, agent_id: UUID, data: AgentActionWrite) -> AgentAction:
        action = AgentAction(organization_id=organization_id, agent_id=agent_id)
        self._apply(action, data)
        self.db.add(action)
        self._commit_unique()
        self.db.refresh(action)
        return action

    def update(self, action: AgentAction, data: AgentActionWrite) -> AgentAction:
        self._apply(action, data)
        self._commit_unique()
        self.db.refresh(action)
        return action

    def set_enabled(self, action: AgentAction, enabled: bool) -> AgentAction:
        action.enabled = enabled
        self.db.commit()
        self.db.refresh(action)
        return action

    def _commit_unique(self) -> None:
        """Commit, turning a lost race on the (agent, name) constraint into
        DuplicateActionName instead of a raw IntegrityError."""
        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise DuplicateActionName() from exc

    def delete(self, action: AgentAction) -> None:
        self.db.delete(action)
        self.db.commit()

    def touch_registered(self, actions: Iterable[AgentAction]) -> None:
        """Record that a page supplied code for these actions, at most once per
        REGISTRATION_TOUCH_INTERVAL each."""
        now = datetime.now(timezone.utc)
        stale = [
            a for a in actions
            if a.last_registered_at is None or now - _aware(a.last_registered_at) >= REGISTRATION_TOUCH_INTERVAL
        ]
        if not stale:
            return
        for action in stale:
            action.last_registered_at = now
        self.db.commit()

    @staticmethod
    def _apply(action: AgentAction, data: AgentActionWrite) -> None:
        action.name = data.name
        action.label = data.label
        action.description = data.description
        action.parameters = data.parameters
        action.confirm = data.confirm.value
        action.timeout_s = data.timeout_s
        action.sensitive_form = data.sensitive_form
        action.enabled = data.enabled


def _aware(moment: datetime) -> datetime:
    """SQLite hands back naive datetimes; treat them as UTC."""
    return moment if moment.tzinfo else moment.replace(tzinfo=timezone.utc)

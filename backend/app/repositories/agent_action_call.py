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

from datetime import datetime, timezone
from typing import List, Optional, Sequence
from uuid import UUID

from sqlalchemy import update
from sqlalchemy.orm import Session

from app.models.agent_action import ActionCallStatus, AgentActionCall



class AgentActionCallRepository:
    def __init__(self, db: Session):
        self.db = db

    def record_pending(self, rows: Sequence[AgentActionCall]) -> List[AgentActionCall]:
        self.db.add_all(rows)
        self.db.commit()
        for row in rows:
            self.db.refresh(row)
        return list(rows)

    def batch(self, run_id: str) -> List[AgentActionCall]:
        """Every call of one paused run, in the order the model made them."""
        return (
            self.db.query(AgentActionCall)
            .filter(AgentActionCall.run_id == run_id)
            .order_by(AgentActionCall.seq)
            .all()
        )

    def get(self, call_id: UUID, session_id: UUID) -> Optional[AgentActionCall]:
        """A call by the id the widget was given, only within its own conversation."""
        return (
            self.db.query(AgentActionCall)
            .filter(AgentActionCall.id == call_id, AgentActionCall.session_id == session_id)
            .first()
        )

    def open_call(self, session_id: UUID) -> Optional[AgentActionCall]:
        """The call this conversation is waiting on, if any."""
        return (
            self.db.query(AgentActionCall)
            .filter(
                AgentActionCall.session_id == session_id,
                AgentActionCall.status == ActionCallStatus.PENDING.value,
            )
            .order_by(AgentActionCall.created_at, AgentActionCall.seq)
            .first()
        )

    def claim(self, call: AgentActionCall, status: ActionCallStatus, *,
              error_code: Optional[str] = None, confirmed: Optional[bool] = None,
              result_ciphertext: Optional[str] = None) -> bool:
        """Record a call's outcome once. Returns False when another request
        already did (a duplicate or late result), so it must be ignored."""
        now = datetime.now(timezone.utc)
        created = call.created_at if call.created_at.tzinfo else call.created_at.replace(tzinfo=timezone.utc)
        result = self.db.execute(
            update(AgentActionCall)
            .where(AgentActionCall.id == call.id, AgentActionCall.status == ActionCallStatus.PENDING.value)
            .values(
                status=status.value,
                error_code=error_code,
                confirmed=confirmed,
                result_ciphertext=result_ciphertext,
                resolved_at=now,
                latency_ms=int((now - created).total_seconds() * 1000),
            )
        )
        self.db.commit()
        if result.rowcount == 1:
            self.db.refresh(call)
            return True
        return False

    def skip_pending(self, run_id: str, status: ActionCallStatus = ActionCallStatus.SKIPPED) -> None:
        """Close every call of the run that is still waiting."""
        self.db.execute(
            update(AgentActionCall)
            .where(AgentActionCall.run_id == run_id, AgentActionCall.status == ActionCallStatus.PENDING.value)
            .values(status=status.value, resolved_at=datetime.now(timezone.utc))
        )
        self.db.commit()

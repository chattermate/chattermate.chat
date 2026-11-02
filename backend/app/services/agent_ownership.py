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

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.agent import Agent


def get_owned_agent(db: Session, agent_id: UUID, organization_id: UUID, for_update: bool = False) -> Agent:
    """The agent, or 404 when it is missing or belongs to another org (never
    reveal that another org's agent exists). ``for_update`` row-locks it for
    the rest of the transaction, to serialise count-then-insert checks."""
    query = db.query(Agent).filter(Agent.id == agent_id)
    if for_update:
        # OF agents: Agent eager-joins its relationships, and Postgres refuses to
        # lock the nullable side of those outer joins.
        query = query.with_for_update(of=Agent)
    agent = query.first()
    if not agent or agent.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

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

Which agent a new knowledge source is for.

Agents only answer from sources linked to them. A source added without an
agent (the organization's Knowledge page, the API) stays unused until someone
links it, and in an organization with one agent nobody thinks to: its agent
silently answers from nothing. So there, the source goes to that agent.
"""
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.agent import AgentRepository


def resolve_source_agent(db: Session, org_id: UUID, agent_id: Optional[str]) -> Optional[UUID]:
    """The agent to link a new source to, or None to leave it unlinked.

    An explicit agent_id must be a UUID (400) of this organization's agent
    (404, so another tenant's agent is not revealed). Without one, the
    organization's only agent; with none or several, no agent.
    """
    repo = AgentRepository(db)
    if agent_id:
        try:
            agent_uuid = UUID(str(agent_id))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid agent_id")
        if not repo.get_agent_in_org(agent_uuid, org_id):
            raise HTTPException(status_code=404, detail="Agent not found")
        return agent_uuid

    agents = repo.get_all_agents(org_id)
    return agents[0].id if len(agents) == 1 else None

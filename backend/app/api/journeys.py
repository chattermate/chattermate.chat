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

import csv
import io
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.auth import require_any_permission, require_permissions
from app.core.config import settings
from app.core.logger import get_logger
from app.database import get_db
from app.models.customer import Customer
from app.models.journey import Journey, JourneyStatus
from app.models.schemas.journey import (
    JourneyOrder, JourneyResponse, JourneyStatusUpdate, JourneyWrite,
)
from app.models.user import User
from app.repositories.journey import (
    AgentContextKeyRepository, DuplicateJourneyKey, JourneyProgressRepository, JourneyRepository,
)
from app.services.agent_ownership import get_owned_agent
from app.services.journey_access import check_journeys_access
from app.services.journey_templates import get_template, list_templates

router = APIRouter()
people_router = APIRouter()
logger = get_logger(__name__)

VIEW = require_any_permission("view_agents", "manage_agents")
MANAGE = require_permissions("manage_agents")
FUNNEL_DAYS_MAX = 365


class FromTemplate(BaseModel):
    template_key: str
    key: Optional[str] = None


def _scope(db: Session, agent_id: UUID, user: User) -> None:
    """Every journeys route: the plan has journeys, and the agent is the caller's."""
    check_journeys_access(db, user.organization_id)
    get_owned_agent(db, agent_id, user.organization_id)


def _journey(repo: JourneyRepository, agent_id: UUID, journey_id: UUID) -> Journey:
    journey = repo.get(agent_id, journey_id)
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    return journey


def _duplicate(key: str) -> HTTPException:
    return HTTPException(status_code=409, detail=f"This agent already has a journey with the key '{key}'")


def _create(db: Session, user: User, agent_id: UUID, data: JourneyWrite) -> Journey:
    repo = JourneyRepository(db)
    if repo.count_for_agent(agent_id) >= settings.JOURNEY_MAX_PER_AGENT:
        raise HTTPException(status_code=403, detail=f"An agent can have at most {settings.JOURNEY_MAX_PER_AGENT} journeys")
    if repo.get_by_key(agent_id, data.key):
        raise _duplicate(data.key)
    try:
        return repo.create(user.organization_id, agent_id, data)
    except DuplicateJourneyKey:
        raise _duplicate(data.key)


@router.get("/{agent_id}/journeys", response_model=List[JourneyResponse])
async def list_journeys(agent_id: UUID, current_user: User = Depends(VIEW), db: Session = Depends(get_db)):
    _scope(db, agent_id, current_user)
    return JourneyRepository(db).list_for_agent(agent_id)


@router.get("/{agent_id}/journeys/templates")
async def journey_templates(agent_id: UUID, current_user: User = Depends(VIEW), db: Session = Depends(get_db)):
    _scope(db, agent_id, current_user)
    return list_templates()


@router.get("/{agent_id}/journeys/context-keys")
async def context_keys(agent_id: UUID, current_user: User = Depends(VIEW), db: Session = Depends(get_db)):
    """Fields pages have sent for this agent: what {{ctx.*}} can use."""
    _scope(db, agent_id, current_user)
    return [{"key": k.key, "source": k.source, "last_seen_at": k.last_seen_at}
            for k in AgentContextKeyRepository(db).for_agent(agent_id)]


@router.post("/{agent_id}/journeys", response_model=JourneyResponse, status_code=status.HTTP_201_CREATED)
async def create_journey(agent_id: UUID, data: JourneyWrite, current_user: User = Depends(MANAGE), db: Session = Depends(get_db)):
    _scope(db, agent_id, current_user)
    return _create(db, current_user, agent_id, data)


@router.post("/{agent_id}/journeys/from-template", response_model=JourneyResponse, status_code=status.HTTP_201_CREATED)
async def create_from_template(agent_id: UUID, data: FromTemplate, current_user: User = Depends(MANAGE), db: Session = Depends(get_db)):
    """A draft copy of a template, to map to the agent's own actions."""
    _scope(db, agent_id, current_user)
    template = get_template(data.template_key)
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    write = JourneyWrite(
        key=data.key or template["key"], name=template["name"], status=JourneyStatus.DRAFT,
        goal_event=template.get("goal_event"), template_key=template["key"], definition=template["definition"],
    )
    return _create(db, current_user, agent_id, write)


@router.put("/{agent_id}/journeys/order", response_model=List[JourneyResponse])
async def reorder_journeys(agent_id: UUID, data: JourneyOrder, current_user: User = Depends(MANAGE), db: Session = Depends(get_db)):
    _scope(db, agent_id, current_user)
    return JourneyRepository(db).reorder(agent_id, data.ids)


@router.get("/{agent_id}/journeys/{journey_id}", response_model=JourneyResponse)
async def get_journey(agent_id: UUID, journey_id: UUID, current_user: User = Depends(VIEW), db: Session = Depends(get_db)):
    _scope(db, agent_id, current_user)
    return _journey(JourneyRepository(db), agent_id, journey_id)


@router.put("/{agent_id}/journeys/{journey_id}", response_model=JourneyResponse)
async def update_journey(agent_id: UUID, journey_id: UUID, data: JourneyWrite,
                         current_user: User = Depends(MANAGE), db: Session = Depends(get_db)):
    _scope(db, agent_id, current_user)
    repo = JourneyRepository(db)
    journey = _journey(repo, agent_id, journey_id)
    other = repo.get_by_key(agent_id, data.key)
    if other and other.id != journey.id:
        raise _duplicate(data.key)
    try:
        return repo.update(journey, data)
    except DuplicateJourneyKey:
        raise _duplicate(data.key)


@router.patch("/{agent_id}/journeys/{journey_id}/status", response_model=JourneyResponse)
async def set_journey_status(agent_id: UUID, journey_id: UUID, data: JourneyStatusUpdate,
                             current_user: User = Depends(MANAGE), db: Session = Depends(get_db)):
    _scope(db, agent_id, current_user)
    repo = JourneyRepository(db)
    return repo.set_status(_journey(repo, agent_id, journey_id), data.status)


@router.delete("/{agent_id}/journeys/{journey_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_journey(agent_id: UUID, journey_id: UUID, current_user: User = Depends(MANAGE), db: Session = Depends(get_db)):
    _scope(db, agent_id, current_user)
    repo = JourneyRepository(db)
    repo.delete(_journey(repo, agent_id, journey_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{agent_id}/journeys/{journey_id}/funnel")
async def journey_funnel(agent_id: UUID, journey_id: UUID, days: int = Query(30, ge=1, le=FUNNEL_DAYS_MAX),
                         current_user: User = Depends(VIEW), db: Session = Depends(get_db)):
    _scope(db, agent_id, current_user)
    journey = _journey(JourneyRepository(db), agent_id, journey_id)
    since = datetime.now(timezone.utc) - timedelta(days=days)
    return JourneyProgressRepository(db).funnel(journey, since)


@router.get("/{agent_id}/journeys/{journey_id}/steps/{step_id}/users")
async def stuck_users(agent_id: UUID, journey_id: UUID, step_id: str, format: str = Query("json", pattern="^(json|csv)$"),
                      current_user: User = Depends(VIEW), db: Session = Depends(get_db)):
    """Users waiting on this step, for follow-up. ?format=csv to download."""
    _scope(db, agent_id, current_user)
    journey = _journey(JourneyRepository(db), agent_id, journey_id)
    if step_id not in {s["id"] for s in journey.definition.get("steps", [])}:
        raise HTTPException(status_code=404, detail="Step not found")
    users = JourneyProgressRepository(db).stuck_on(journey, step_id)
    if format == "json":
        return users
    out = io.StringIO()
    writer = csv.DictWriter(out, fieldnames=["name", "email", "reached_at", "last_seen_at"], extrasaction="ignore")
    writer.writeheader()
    writer.writerows(users)
    return Response(content=out.getvalue(), media_type="text/csv",
                    headers={"Content-Disposition": f'attachment; filename="{journey.key}-{step_id}.csv"'})


@people_router.get("/{customer_id}/journeys")
async def person_journeys(customer_id: UUID, current_user: User = Depends(VIEW), db: Session = Depends(get_db)):
    """One person's journeys, for their page in People."""
    check_journeys_access(db, current_user.organization_id)
    customer = db.get(Customer, customer_id)
    if not customer or customer.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Person not found")
    return JourneyProgressRepository(db).timeline(customer_id, current_user.organization_id)

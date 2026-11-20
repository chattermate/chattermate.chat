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

Duplicating an agent: a new agent with the same settings, look, knowledge,
team groups, MCP tools, lead capture and Jira/Shopify settings, under a free
"(copy)" name.

Left out on purpose, because each belongs to one agent at a time or to the
site it runs on: widgets (an install code points at one agent), channel
accounts (one agent answers a number), workflows and journeys (built for the
agent they run on), and in-app actions (the site registers them).
"""

import uuid
from typing import Any, Dict, Iterable, Optional

from sqlalchemy import insert, select
from sqlalchemy.orm import Session

from app.models.agent import Agent, AgentCustomization, agent_usergroup
from app.models.jira import AgentJiraConfig
from app.models.knowledge_to_agent import KnowledgeToAgent
from app.models.lead_capture import LeadCaptureConfig
from app.models.mcp_tool import MCPToolToAgent
from app.models.shopify.agent_shopify_config import AgentShopifyConfig
from app.repositories.agent import AgentRepository

NAME_MAX = Agent.__table__.c.name.type.length or 100
COPY_SUFFIX = " (copy)"
MAX_COPY_NUMBER = 999

# Agent columns a copy never inherits: who it is, and what only the original runs
_AGENT_SKIP = {"id", "name", "is_default", "active_workflow_id", "use_workflow",
               "created_at", "updated_at"}
# Columns every copied per-agent row gets fresh
_ROW_SKIP = {"id", "agent_id", "created_at", "updated_at"}
# The per-agent rows a copy takes over, keyed by the agent's UUID
_COPIED_MODELS = (AgentCustomization, LeadCaptureConfig, KnowledgeToAgent, MCPToolToAgent)
# Integration settings that keep the agent's id as text (no foreign key)
_COPIED_TEXT_KEYED = (AgentJiraConfig, AgentShopifyConfig)


def copy_name(db: Session, name: str, organization_id: uuid.UUID) -> str:
    """'Support (copy)', then 'Support (copy 2)', ... the first free one,
    trimmed to fit the column."""
    repo = AgentRepository(db)
    for n in range(1, MAX_COPY_NUMBER + 1):
        suffix = COPY_SUFFIX if n == 1 else f" (copy {n})"
        candidate = name[:NAME_MAX - len(suffix)] + suffix
        if repo.get_by_name(candidate, organization_id) is None:
            return candidate
    raise ValueError(f"No free copy name left for '{name}'")


def _columns(row: Any, skip: Iterable[str]) -> Dict[str, Any]:
    """The row's mapped column values, minus `skip`."""
    skip = set(skip)
    return {attr.key: getattr(row, attr.key)
            for attr in row.__mapper__.column_attrs if attr.key not in skip}


def _copy_rows(db: Session, model: Any, source_key: Any, copy_key: Any) -> None:
    for row in db.query(model).filter(model.agent_id == source_key).all():
        fresh = _columns(row, _ROW_SKIP)
        # A text primary key has no default of its own (AgentShopifyConfig)
        if model.__table__.c.id.type.python_type is str:
            fresh["id"] = str(uuid.uuid4())
        db.add(model(agent_id=copy_key, **fresh))


def duplicate_agent(db: Session, source: Agent) -> Agent:
    """Copy `source` into a new agent in the same organization, in one
    transaction. The caller has checked access and the plan's agent limit."""
    copy = Agent(id=uuid.uuid4(), name=copy_name(db, source.name, source.organization_id),
                 is_default=False, use_workflow=False, **_columns(source, _AGENT_SKIP))
    db.add(copy)
    db.flush()

    for model in _COPIED_MODELS:
        _copy_rows(db, model, source.id, copy.id)
    for model in _COPIED_TEXT_KEYED:
        _copy_rows(db, model, str(source.id), str(copy.id))
    groups = db.execute(select(agent_usergroup.c.group_id)
                        .where(agent_usergroup.c.agent_id == source.id)).scalars().all()
    if groups:
        db.execute(insert(agent_usergroup), [{"agent_id": copy.id, "group_id": g} for g in groups])

    db.commit()
    db.refresh(copy)
    return copy


def other_agent_uses_photo(db: Session, photo_url: Optional[str], agent_id: uuid.UUID) -> bool:
    """Whether another agent's look points at the same stored photo (a
    duplicate shares its original's until either uploads a new one), so it
    must not be deleted yet."""
    if not photo_url:
        return False
    return db.query(AgentCustomization.id).filter(
        AgentCustomization.photo_url == photo_url,
        AgentCustomization.agent_id != agent_id,
    ).first() is not None

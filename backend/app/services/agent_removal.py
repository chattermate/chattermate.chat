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

Deleting an agent for good. Its conversations, tickets, ratings and leads stay
(their agent becomes empty, as the database already says); what only made
sense for this agent goes with it: its widgets (their install code stops
working), workflows, MCP tool links, Jira and Shopify settings, and through
the database's own cascades
its look, knowledge links, channel assignments, actions, journeys and lead
capture. The organization's last agent is kept: every surface that answers
customers needs one.
"""

import uuid
from dataclasses import dataclass

from sqlalchemy import delete, func, select, update
from sqlalchemy.orm import Session

from app.models.agent import Agent
from app.models.channels.agent_channel_config import AgentChannelConfig
from app.models.jira import AgentJiraConfig
from app.models.mcp_tool import MCPToolToAgent
from app.models.shopify.agent_shopify_config import AgentShopifyConfig
from app.models.widget import Widget
from app.models.workflow import Workflow


class LastAgentError(Exception):
    """The organization's only agent can't be deleted."""


@dataclass(frozen=True)
class RemovalImpact:
    """What deleting an agent takes with it, for the confirm dialog."""
    widgets: int
    channels: int
    workflows: int


def _count(db: Session, model, agent_id: uuid.UUID) -> int:
    return db.execute(select(func.count()).select_from(model)
                      .where(model.agent_id == agent_id)).scalar_one()


def removal_impact(db: Session, agent: Agent) -> RemovalImpact:
    return RemovalImpact(
        widgets=_count(db, Widget, agent.id),
        channels=_count(db, AgentChannelConfig, agent.id),
        workflows=_count(db, Workflow, agent.id),
    )


def delete_agent(db: Session, agent: Agent) -> None:
    """Delete `agent` and what only it used, in one transaction. Raises
    LastAgentError for the organization's only agent."""
    others = db.execute(select(func.count()).select_from(Agent).where(
        Agent.organization_id == agent.organization_id, Agent.id != agent.id)).scalar_one()
    if others == 0:
        raise LastAgentError()

    agent_id = agent.id
    # These three point at the agent without a cascade of their own. Core
    # statements throughout, so the ORM never tries to null a child's agent_id.
    db.execute(update(Agent).where(Agent.id == agent_id)
               .values(active_workflow_id=None, use_workflow=False))
    db.execute(delete(Workflow).where(Workflow.agent_id == agent_id))
    db.execute(delete(MCPToolToAgent).where(MCPToolToAgent.agent_id == agent_id))
    db.execute(delete(Widget).where(Widget.agent_id == agent_id))
    # Kept by the agent's id as text, with no foreign key to cascade
    for model in (AgentJiraConfig, AgentShopifyConfig):
        db.execute(delete(model).where(model.agent_id == str(agent_id)))
    # An ORM-enabled delete: the session drops the loaded agent itself
    db.execute(delete(Agent).where(Agent.id == agent_id))
    db.commit()

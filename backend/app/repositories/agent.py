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

from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.agent import Agent, AgentType
import json
from sqlalchemy.orm import joinedload
from uuid import UUID
from app.core.logger import get_logger

logger = get_logger(__name__)

class AgentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_agent(self, **kwargs) -> Agent:
        """Create a new agent"""
        # Handle instructions
        # We don't need to do any conversion here, as the Agent model will handle it
        # through its property setter

        # Handle tools if present
        if 'tools' in kwargs and kwargs['tools']:
            if not isinstance(kwargs['tools'], str):
                kwargs['tools'] = json.dumps(kwargs['tools'])
            
        # Handle org_id to organization_id conversion for backward compatibility
        if 'org_id' in kwargs:
            kwargs['organization_id'] = kwargs.pop('org_id')

        # Create new agent
        agent = Agent(**kwargs)
        self.db.add(agent)
        self.db.commit()
        self.db.refresh(agent)
        return agent

    def get_by_name(self, name: str, organization_id: UUID) -> Optional[Agent]:
        """Get agent by name within an organization"""
        return self.db.query(Agent).filter(
            Agent.name == name,
            Agent.organization_id == organization_id
        ).first()

    def get_agent(self, agent_id: UUID) -> Optional[Agent]:
        """Get template by ID"""
        return self.db.query(Agent).filter(
            Agent.id == agent_id
        ).first()

    def get_org_agents(self, org_id: UUID, active_only: bool = True) -> List[Agent]:
        """Get all templates for an organization"""
        query = self.db.query(Agent).filter(
            Agent.organization_id == org_id
        )
        if active_only:
            query = query.filter(Agent.is_active == True)
        return query.all()

    def get_default_agents(self, org_id: UUID) -> Optional[Agent]:
        """Get default template for an organization"""
        return self.db.query(Agent).filter(
            Agent.organization_id == org_id,
            Agent.is_default == True,
            Agent.is_active == True
        ).first()

    def update_agent(self, agent_id: UUID, **kwargs) -> Optional[Agent]:
        """Update an existing template"""
        agent = self.get_agent(agent_id)
        if not agent:
            return None

        # Handle special fields
        if 'instructions' in kwargs:
            instructions = kwargs['instructions']
            if isinstance(instructions, str):
                try:
                    # Try to parse if it's a JSON string
                    parsed = json.loads(instructions)
                    if isinstance(parsed, list):
                        kwargs['instructions'] = parsed
                    else:
                        # If it's a single instruction, wrap in list
                        kwargs['instructions'] = [instructions]
                except json.JSONDecodeError:
                    # If not JSON, treat as single instruction
                    kwargs['instructions'] = [instructions]
        if 'tools' in kwargs:
            kwargs['tools'] = json.dumps(kwargs['tools'])

        # Handle default flag
        if kwargs.get('is_default'):
            existing_defaults = self.db.query(Agent).filter(
                Agent.organization_id == agent.organization_id,
                Agent.is_default == True,
                Agent.id != agent_id
            ).all()
            for existing in existing_defaults:
                existing.is_default = False

        for key, value in kwargs.items():
            setattr(agent, key, value)

        self.db.commit()
        self.db.refresh(agent)
        return agent

    def delete_agent(self, agent_id: str) -> bool:
        """Soft delete a template by setting is_active to False"""
        template = self.get_agent(agent_id)
        if not template:
            return False

        template.is_active = False
        self.db.commit()
        return True

    def get_active_agents(self, org_id: UUID) -> List[Agent]:
        """Get the active agent template for an organization"""
        return self.db.query(Agent)\
            .filter(Agent.organization_id == org_id)\
            .filter(Agent.is_active == True)\
            .all()

    def get_by_agent_id(self, agent_id: str):
        """Get agent by ID with relationships loaded"""
        if isinstance(agent_id, str):
            agent_id = UUID(agent_id)
        return self.db.query(Agent)\
            .options(
                joinedload(Agent.groups),
                joinedload(Agent.organization)
            )\
            .filter(Agent.id == agent_id)\
            .first()

    def get_all(self) -> list[Agent]:
        return self.db.query(Agent).all()

    def get_by_id(self, agent_id: str) -> Agent | None:
        return self.db.query(Agent).filter(Agent.id == agent_id).first()

    def get_all_agents(self, org_id: UUID) -> List[Agent]:
        """Get all agents for organization"""
        return self.db.query(Agent)\
            .filter(Agent.organization_id == org_id)\
            .all()

    def count_by_organization(self, org_id: UUID) -> int:
        """Count agents for an organization"""
        from sqlalchemy import func
        return self.db.query(func.count(Agent.id))\
            .filter(Agent.organization_id == org_id)\
            .scalar() or 0

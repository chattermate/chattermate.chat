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

    def create_agent(self,
                     name: str,
                     agent_type: AgentType,
                     instructions: List[str],
                     org_id: UUID,
                     description: Optional[str] = None,
                     tools: Optional[List[dict]] = None,
                     is_default: bool = False,
                     is_active: bool = False
                     ) -> Agent:
        """Create a new agent template"""
        # If this is a default template, unset other defaults
        if is_default:
            existing_defaults = self.db.query(Agent).filter(
                Agent.organization_id == org_id,
                Agent.is_default == True
            ).all()
            for template in existing_defaults:
                template.is_default = False

        # Handle instructions
        if isinstance(instructions, str):
            try:
                parsed = json.loads(instructions)
                if isinstance(parsed, list):
                    instructions = parsed
                else:
                    instructions = [instructions]
            except json.JSONDecodeError:
                instructions = [instructions]

        template = Agent(
            name=name,
            description=description,
            agent_type=agent_type,
            instructions=instructions,
            tools=json.dumps(tools) if tools else None,
            organization_id=org_id,
            is_default=is_default,
            is_active=is_active
        )

        self.db.add(template)
        self.db.flush()
        self.db.refresh(template)
        return template

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

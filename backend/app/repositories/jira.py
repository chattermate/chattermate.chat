"""
ChatterMate - Jira Repository
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import cast, String, func
from typing import Optional, Dict, Any
from app.models.jira import AgentJiraConfig
from app.models.agent import Agent
from uuid import UUID
from app.core.logger import get_logger
from app.models.schemas.jira import AgentWithJiraConfig
import json

logger = get_logger(__name__)

class JiraRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_agent_with_jira_config(self, agent_id: str) -> Optional[AgentWithJiraConfig]:
        """
        Get agent with its Jira configuration in a single optimized query.
        Returns an AgentWithJiraConfig object that can be accessed with dot notation.
        """
        try:
            if isinstance(agent_id, str):
                agent_id = UUID(agent_id)
                
            # First get the agent
            agent = self.db.query(Agent).options(
                joinedload(Agent.groups),
                joinedload(Agent.organization)
            ).filter(
                Agent.id == agent_id
            ).first()
            
            if not agent:
                return None
                
            # Then get the Jira config
            jira_config = self.db.query(AgentJiraConfig).filter(
                AgentJiraConfig.agent_id == str(agent.id)
            ).first()
            
            # Parse tools JSON if it exists
            tools_list = []
            if agent.tools:
                try:
                    if isinstance(agent.tools, str):
                        # Parse JSON string
                        parsed = json.loads(agent.tools)
                        tools_list = parsed if isinstance(parsed, list) else []
                    elif isinstance(agent.tools, list):
                        # Already a list
                        tools_list = agent.tools
                    elif isinstance(agent.tools, dict):
                        # If it's a dict (empty or not), convert to empty list
                        logger.warning(f"Agent {agent.id} has tools as dict instead of list, converting to empty list")
                        tools_list = []
                    else:
                        # Unknown type
                        logger.warning(f"Agent {agent.id} has tools of unexpected type: {type(agent.tools)}")
                        tools_list = []
                except (json.JSONDecodeError, TypeError) as e:
                    logger.warning(f"Error parsing tools for agent {agent.id}: {str(e)}")
                    tools_list = []
            
            # Create an AgentWithJiraConfig object
            agent_data = AgentWithJiraConfig(
                id=agent.id,
                name=agent.name,
                display_name=agent.display_name,
                description=agent.description,
                instructions=agent.instructions,
                tools=tools_list,
                agent_type=agent.agent_type,
                is_default=agent.is_default,
                is_active=agent.is_active,
                organization_id=agent.organization_id,
                transfer_to_human=agent.transfer_to_human,
                ask_for_rating=agent.ask_for_rating,
                groups=agent.groups,
                organization=agent.organization,
                knowledge=[],  # Empty list as default
                jira_enabled=False,
                jira_project_key=None,
                jira_issue_type_id=None
            )
            
            # Add Jira configuration if it exists
            if jira_config:
                agent_data.jira_enabled = jira_config.enabled
                agent_data.jira_project_key = jira_config.project_key
                agent_data.jira_issue_type_id = jira_config.issue_type_id
            
            return agent_data
        except Exception as e:
            logger.error(f"Error getting agent with Jira config: {str(e)}")
            return None 
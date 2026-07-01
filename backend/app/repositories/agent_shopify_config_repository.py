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

import uuid
from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.shopify.agent_shopify_config import AgentShopifyConfig
from app.models.schemas.shopify.agent_shopify_config import (
    AgentShopifyConfigCreate,
    AgentShopifyConfigUpdate
)
from app.core.logger import get_logger
from sqlalchemy import cast, String

logger = get_logger(__name__)

class AgentShopifyConfigRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_agent_shopify_config(self, agent_id: str) -> Optional[AgentShopifyConfig]:
        """Get Shopify configuration for an agent."""
        return self.db.query(AgentShopifyConfig).filter(AgentShopifyConfig.agent_id == agent_id).first()
    
    def get_config_by_agent_and_shop(self, agent_id: str, shop_id: str) -> Optional[AgentShopifyConfig]:
        """Get Shopify configuration for a specific agent and shop combination."""
        return self.db.query(AgentShopifyConfig).filter(
            AgentShopifyConfig.agent_id == agent_id,
            AgentShopifyConfig.shop_id == shop_id
        ).first()
    
    def get_configs_by_shop(self, shop_id: str, enabled_only: bool = False) -> List[AgentShopifyConfig]:
        """Get all agent configurations for a specific shop.
        
        Args:
            shop_id: The shop ID to filter by
            enabled_only: If True, only return enabled configurations (default: False)
        
        Returns:
            List of AgentShopifyConfig objects
        """
        query = self.db.query(AgentShopifyConfig).filter(AgentShopifyConfig.shop_id == shop_id)
        
        if enabled_only:
            query = query.filter(AgentShopifyConfig.enabled == True)
        
        return query.all()
    
    def get_enabled_configs_for_org(self, organization_id: str) -> List[AgentShopifyConfig]:
        """
        Get all enabled Shopify configurations for agents belonging to a specific organization.
        
        Args:
            organization_id: The ID of the organization to check
            
        Returns:
            List of AgentShopifyConfig objects that are enabled and belong to the organization
        """
        # We need to join with the User/Agent table to filter by organization_id
        from app.models.user import User
        
        return (self.db.query(AgentShopifyConfig)
                .join(User, User.id.cast(String) == AgentShopifyConfig.agent_id)
                .filter(
                    AgentShopifyConfig.enabled == True,
                    User.organization_id == organization_id
                )
                .all())
    
    def create_agent_shopify_config(self, config: AgentShopifyConfigCreate) -> AgentShopifyConfig:
        """Create a new Shopify configuration for an agent."""
        db_config = AgentShopifyConfig(
            id=str(uuid.uuid4()),
            agent_id=config.agent_id,
            shop_id=config.shop_id,
            enabled=config.enabled
        )
        self.db.add(db_config)
        self.db.commit()
        self.db.refresh(db_config)
        return db_config
    
    def create_or_update_agent_shopify_config(self, config: AgentShopifyConfigCreate) -> AgentShopifyConfig:
        """Create or update a Shopify configuration for an agent.
        
        One agent can only be connected to one shop at a time.
        If a configuration already exists for this agent (regardless of shop),
        it will be updated with the new shop_id and enabled status.
        Otherwise, a new configuration will be created.
        """
        # Check if config already exists for this agent (one agent = one shop only)
        existing_config = self.get_agent_shopify_config(config.agent_id)
        
        if existing_config:
            # Update existing config with new shop_id and enabled status
            logger.info(f"Updating existing Shopify config for agent {config.agent_id}: "
                       f"changing shop from {existing_config.shop_id} to {config.shop_id}, enabled={config.enabled}")
            existing_config.shop_id = config.shop_id
            existing_config.enabled = config.enabled
            self.db.commit()
            self.db.refresh(existing_config)
            return existing_config
        else:
            # Create new config
            logger.info(f"Creating new Shopify config for agent {config.agent_id} and shop {config.shop_id}")
            db_config = AgentShopifyConfig(
                id=str(uuid.uuid4()),
                agent_id=config.agent_id,
                shop_id=config.shop_id,
                enabled=config.enabled
            )
            self.db.add(db_config)
            self.db.commit()
            self.db.refresh(db_config)
            return db_config
    
    def update_agent_shopify_config(self, agent_id: str, config: AgentShopifyConfigUpdate) -> Optional[AgentShopifyConfig]:
        """Update an existing Shopify configuration for an agent."""
        db_config = self.get_agent_shopify_config(agent_id)
        if not db_config:
            return None
        
        for key, value in config.dict(exclude_unset=True).items():
            setattr(db_config, key, value)
        
        self.db.commit()
        self.db.refresh(db_config)
        return db_config
    
    def delete_agent_shopify_config(self, agent_id: str) -> bool:
        """Delete a Shopify configuration for an agent."""
        db_config = self.get_agent_shopify_config(agent_id)
        if not db_config:
            return False
        
        self.db.delete(db_config)
        self.db.commit()
        return True
    
    def update(self, config: AgentShopifyConfig) -> AgentShopifyConfig:
        """Update an existing Shopify configuration object."""
        self.db.commit()
        self.db.refresh(config)
        return config 
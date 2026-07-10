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

from typing import Optional, List
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.channels import AgentChannelConfig
from app.core.logger import get_logger

logger = get_logger(__name__)


class AgentChannelConfigRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_account(self, channel_account_id: UUID) -> Optional[AgentChannelConfig]:
        try:
            return self.db.query(AgentChannelConfig).filter(
                AgentChannelConfig.channel_account_id == channel_account_id
            ).first()
        except Exception as e:
            logger.error(f"Error getting agent channel config: {str(e)}")
            return None

    def get_active_agent_id(self, channel_account_id: UUID) -> Optional[UUID]:
        """Agent that answers inbound messages on this account, if enabled."""
        config = self.get_by_account(channel_account_id)
        if config and config.is_active:
            return config.agent_id
        return None

    def map_by_accounts(self, channel_account_ids: List[UUID]) -> dict:
        """Configs for many accounts in one query, keyed by channel_account_id."""
        if not channel_account_ids:
            return {}
        try:
            configs = self.db.query(AgentChannelConfig).filter(
                AgentChannelConfig.channel_account_id.in_(channel_account_ids)
            ).all()
            return {config.channel_account_id: config for config in configs}
        except Exception as e:
            logger.error(f"Error mapping agent channel configs: {str(e)}")
            return {}

    def list_by_agent(self, agent_id: UUID) -> List[AgentChannelConfig]:
        try:
            return self.db.query(AgentChannelConfig).filter(
                AgentChannelConfig.agent_id == agent_id
            ).all()
        except Exception as e:
            logger.error(f"Error listing agent channel configs: {str(e)}")
            return []

    def set_agent(self, channel_account_id: UUID, agent_id: UUID, is_active: bool = True) -> AgentChannelConfig:
        """Upsert the single agent mapping for a channel account."""
        try:
            config = self.get_by_account(channel_account_id)
            if config:
                config.agent_id = agent_id
                config.is_active = is_active
            else:
                config = AgentChannelConfig(
                    channel_account_id=channel_account_id,
                    agent_id=agent_id,
                    is_active=is_active,
                )
                self.db.add(config)
            self.db.commit()
            self.db.refresh(config)
            return config
        except Exception as e:
            logger.error(f"Error setting agent channel config: {str(e)}")
            self.db.rollback()
            raise

    def delete_by_account(self, channel_account_id: UUID) -> bool:
        try:
            config = self.get_by_account(channel_account_id)
            if not config:
                return False
            self.db.delete(config)
            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Error deleting agent channel config: {str(e)}")
            self.db.rollback()
            return False

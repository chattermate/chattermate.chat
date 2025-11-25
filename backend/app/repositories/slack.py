"""
ChatterMate - Slack Repository
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

from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from app.models.slack import (
    SlackToken,
    SlackWorkspaceConfig,
    AgentSlackConfig,
    SlackConversation,
    StorageMode
)
from app.models.chat_history import ChatHistory
from app.core.logger import get_logger

logger = get_logger(__name__)


class SlackRepository:
    def __init__(self, db: Session):
        self.db = db

    # ==================== SlackToken CRUD ====================

    def create_token(
        self,
        organization_id: UUID,
        access_token: str,
        bot_user_id: str,
        team_id: str,
        team_name: str,
        authed_user_id: Optional[str] = None,
        scope: Optional[str] = None
    ) -> SlackToken:
        """Create a new Slack token for an organization."""
        try:
            token = SlackToken(
                organization_id=organization_id,
                access_token=access_token,
                bot_user_id=bot_user_id,
                team_id=team_id,
                team_name=team_name,
                authed_user_id=authed_user_id,
                scope=scope
            )
            self.db.add(token)
            self.db.commit()
            self.db.refresh(token)
            logger.info(f"Created Slack token for org {organization_id}, team {team_id}")
            return token
        except Exception as e:
            logger.error(f"Error creating Slack token: {str(e)}")
            self.db.rollback()
            raise

    def get_token_by_org(self, organization_id: UUID) -> Optional[SlackToken]:
        """Get Slack token by organization ID."""
        try:
            if isinstance(organization_id, str):
                organization_id = UUID(organization_id)
            return self.db.query(SlackToken).filter(
                SlackToken.organization_id == organization_id
            ).first()
        except Exception as e:
            logger.error(f"Error getting Slack token by org: {str(e)}")
            return None

    def get_token_by_team(self, team_id: str) -> Optional[SlackToken]:
        """Get Slack token by Slack team/workspace ID."""
        try:
            return self.db.query(SlackToken).filter(
                SlackToken.team_id == team_id
            ).first()
        except Exception as e:
            logger.error(f"Error getting Slack token by team: {str(e)}")
            return None

    def update_token(self, token_id: int, **kwargs) -> Optional[SlackToken]:
        """Update a Slack token."""
        try:
            token = self.db.query(SlackToken).filter(SlackToken.id == token_id).first()
            if not token:
                return None
            for key, value in kwargs.items():
                if hasattr(token, key):
                    setattr(token, key, value)
            self.db.commit()
            self.db.refresh(token)
            return token
        except Exception as e:
            logger.error(f"Error updating Slack token: {str(e)}")
            self.db.rollback()
            return None

    def delete_token_by_org(self, organization_id: UUID) -> bool:
        """Delete Slack token by organization ID."""
        try:
            if isinstance(organization_id, str):
                organization_id = UUID(organization_id)
            result = self.db.query(SlackToken).filter(
                SlackToken.organization_id == organization_id
            ).delete()
            self.db.commit()
            return result > 0
        except Exception as e:
            logger.error(f"Error deleting Slack token: {str(e)}")
            self.db.rollback()
            return False

    def delete_token_by_team(self, team_id: str) -> bool:
        """Delete Slack token by team ID."""
        try:
            result = self.db.query(SlackToken).filter(
                SlackToken.team_id == team_id
            ).delete()
            self.db.commit()
            return result > 0
        except Exception as e:
            logger.error(f"Error deleting Slack token by team: {str(e)}")
            self.db.rollback()
            return False

    # ==================== SlackWorkspaceConfig CRUD ====================

    def create_workspace_config(
        self,
        organization_id: UUID,
        team_id: str,
        storage_mode: StorageMode = StorageMode.FULL_CONTENT,
        allowed_channel_ids: Optional[List[str]] = None,
        default_agent_id: Optional[UUID] = None
    ) -> SlackWorkspaceConfig:
        """Create workspace configuration."""
        try:
            config = SlackWorkspaceConfig(
                organization_id=organization_id,
                team_id=team_id,
                storage_mode=storage_mode,
                allowed_channel_ids=allowed_channel_ids or [],
                default_agent_id=default_agent_id
            )
            self.db.add(config)
            self.db.commit()
            self.db.refresh(config)
            logger.info(f"Created workspace config for org {organization_id}, team {team_id}")
            return config
        except Exception as e:
            logger.error(f"Error creating workspace config: {str(e)}")
            self.db.rollback()
            raise

    def get_workspace_config_by_org(self, organization_id: UUID) -> Optional[SlackWorkspaceConfig]:
        """Get workspace config by organization ID."""
        try:
            if isinstance(organization_id, str):
                organization_id = UUID(organization_id)
            return self.db.query(SlackWorkspaceConfig).filter(
                SlackWorkspaceConfig.organization_id == organization_id
            ).first()
        except Exception as e:
            logger.error(f"Error getting workspace config by org: {str(e)}")
            return None

    def get_workspace_config_by_team(self, team_id: str) -> Optional[SlackWorkspaceConfig]:
        """Get workspace config by Slack team ID."""
        try:
            return self.db.query(SlackWorkspaceConfig).filter(
                SlackWorkspaceConfig.team_id == team_id
            ).first()
        except Exception as e:
            logger.error(f"Error getting workspace config by team: {str(e)}")
            return None

    def update_workspace_config(self, config_id: int, **kwargs) -> Optional[SlackWorkspaceConfig]:
        """Update workspace configuration."""
        try:
            config = self.db.query(SlackWorkspaceConfig).filter(
                SlackWorkspaceConfig.id == config_id
            ).first()
            if not config:
                return None
            for key, value in kwargs.items():
                if hasattr(config, key):
                    setattr(config, key, value)
            self.db.commit()
            self.db.refresh(config)
            return config
        except Exception as e:
            logger.error(f"Error updating workspace config: {str(e)}")
            self.db.rollback()
            return None

    def delete_workspace_config_by_team(self, team_id: str) -> bool:
        """Delete workspace config by team ID."""
        try:
            result = self.db.query(SlackWorkspaceConfig).filter(
                SlackWorkspaceConfig.team_id == team_id
            ).delete()
            self.db.commit()
            return result > 0
        except Exception as e:
            logger.error(f"Error deleting workspace config: {str(e)}")
            self.db.rollback()
            return False

    # ==================== AgentSlackConfig CRUD ====================

    def create_agent_config(
        self,
        organization_id: UUID,
        team_id: str,
        agent_id: UUID,
        channel_id: str,
        channel_name: str,
        enabled: bool = True,
        respond_to_mentions: bool = True,
        respond_to_reactions: bool = True,
        respond_to_commands: bool = True,
        reaction_emoji: str = "robot_face"
    ) -> AgentSlackConfig:
        """Create agent-to-channel configuration."""
        try:
            if isinstance(organization_id, str):
                organization_id = UUID(organization_id)
            if isinstance(agent_id, str):
                agent_id = UUID(agent_id)

            config = AgentSlackConfig(
                organization_id=organization_id,
                team_id=team_id,
                agent_id=agent_id,
                channel_id=channel_id,
                channel_name=channel_name,
                enabled=enabled,
                respond_to_mentions=respond_to_mentions,
                respond_to_reactions=respond_to_reactions,
                respond_to_commands=respond_to_commands,
                reaction_emoji=reaction_emoji
            )
            self.db.add(config)
            self.db.commit()
            self.db.refresh(config)
            logger.info(f"Created agent Slack config for agent {agent_id}, channel {channel_id}")
            return config
        except Exception as e:
            logger.error(f"Error creating agent Slack config: {str(e)}")
            self.db.rollback()
            raise

    def get_config_by_channel(self, team_id: str, channel_id: str) -> Optional[AgentSlackConfig]:
        """Get agent config by channel ID within a team."""
        try:
            return self.db.query(AgentSlackConfig).filter(
                AgentSlackConfig.team_id == team_id,
                AgentSlackConfig.channel_id == channel_id,
                AgentSlackConfig.enabled == True
            ).first()
        except Exception as e:
            logger.error(f"Error getting config by channel: {str(e)}")
            return None

    def get_configs_by_agent(self, agent_id: UUID) -> List[AgentSlackConfig]:
        """Get all Slack configs for an agent."""
        try:
            if isinstance(agent_id, str):
                agent_id = UUID(agent_id)
            return self.db.query(AgentSlackConfig).filter(
                AgentSlackConfig.agent_id == agent_id
            ).all()
        except Exception as e:
            logger.error(f"Error getting configs by agent: {str(e)}")
            return []

    def get_configs_by_org(self, organization_id: UUID) -> List[AgentSlackConfig]:
        """Get all Slack configs for an organization."""
        try:
            if isinstance(organization_id, str):
                organization_id = UUID(organization_id)
            return self.db.query(AgentSlackConfig).filter(
                AgentSlackConfig.organization_id == organization_id
            ).all()
        except Exception as e:
            logger.error(f"Error getting configs by org: {str(e)}")
            return []

    def update_agent_config(self, config_id: int, **kwargs) -> Optional[AgentSlackConfig]:
        """Update agent Slack configuration."""
        try:
            config = self.db.query(AgentSlackConfig).filter(
                AgentSlackConfig.id == config_id
            ).first()
            if not config:
                return None
            for key, value in kwargs.items():
                if hasattr(config, key):
                    setattr(config, key, value)
            self.db.commit()
            self.db.refresh(config)
            return config
        except Exception as e:
            logger.error(f"Error updating agent Slack config: {str(e)}")
            self.db.rollback()
            return None

    def delete_agent_config(self, organization_id: UUID, channel_id: str) -> bool:
        """Delete agent config by org and channel."""
        try:
            if isinstance(organization_id, str):
                organization_id = UUID(organization_id)
            result = self.db.query(AgentSlackConfig).filter(
                AgentSlackConfig.organization_id == organization_id,
                AgentSlackConfig.channel_id == channel_id
            ).delete()
            self.db.commit()
            return result > 0
        except Exception as e:
            logger.error(f"Error deleting agent Slack config: {str(e)}")
            self.db.rollback()
            return False

    def delete_configs_by_team(self, team_id: str) -> int:
        """Delete all agent configs for a team. Returns count of deleted records."""
        try:
            result = self.db.query(AgentSlackConfig).filter(
                AgentSlackConfig.team_id == team_id
            ).delete()
            self.db.commit()
            return result
        except Exception as e:
            logger.error(f"Error deleting agent configs by team: {str(e)}")
            self.db.rollback()
            return 0

    # ==================== SlackConversation CRUD ====================

    def get_or_create_conversation(
        self,
        team_id: str,
        channel_id: str,
        thread_ts: str,
        session_id: UUID,
        agent_id: UUID,
        organization_id: UUID,
        slack_user_id: str
    ) -> SlackConversation:
        """Get existing conversation or create a new one."""
        try:
            if isinstance(session_id, str):
                session_id = UUID(session_id)
            if isinstance(agent_id, str):
                agent_id = UUID(agent_id)
            if isinstance(organization_id, str):
                organization_id = UUID(organization_id)

            # Try to find existing conversation
            conversation = self.db.query(SlackConversation).filter(
                SlackConversation.team_id == team_id,
                SlackConversation.channel_id == channel_id,
                SlackConversation.thread_ts == thread_ts
            ).first()

            if conversation:
                logger.debug(f"Found existing conversation for thread {thread_ts}")
                return conversation

            # Create new conversation
            conversation = SlackConversation(
                team_id=team_id,
                channel_id=channel_id,
                thread_ts=thread_ts,
                session_id=session_id,
                agent_id=agent_id,
                organization_id=organization_id,
                slack_user_id=slack_user_id
            )
            self.db.add(conversation)
            self.db.commit()
            self.db.refresh(conversation)
            logger.info(f"Created new Slack conversation for thread {thread_ts}")
            return conversation
        except Exception as e:
            logger.error(f"Error in get_or_create_conversation: {str(e)}")
            self.db.rollback()
            raise

    def get_conversation_by_thread(
        self,
        team_id: str,
        channel_id: str,
        thread_ts: str
    ) -> Optional[SlackConversation]:
        """Get conversation by thread."""
        try:
            return self.db.query(SlackConversation).filter(
                SlackConversation.team_id == team_id,
                SlackConversation.channel_id == channel_id,
                SlackConversation.thread_ts == thread_ts
            ).first()
        except Exception as e:
            logger.error(f"Error getting conversation by thread: {str(e)}")
            return None

    def get_conversations_by_session(self, session_id: UUID) -> List[SlackConversation]:
        """Get all Slack conversations for a session."""
        try:
            if isinstance(session_id, str):
                session_id = UUID(session_id)
            return self.db.query(SlackConversation).filter(
                SlackConversation.session_id == session_id
            ).all()
        except Exception as e:
            logger.error(f"Error getting conversations by session: {str(e)}")
            return []

    def delete_conversations_by_team(self, team_id: str) -> int:
        """Delete all conversations for a team. Returns count of deleted records."""
        try:
            result = self.db.query(SlackConversation).filter(
                SlackConversation.team_id == team_id
            ).delete()
            self.db.commit()
            return result
        except Exception as e:
            logger.error(f"Error deleting conversations by team: {str(e)}")
            self.db.rollback()
            return 0

    def delete_conversations_by_user(self, team_id: str, slack_user_id: str) -> int:
        """Delete all conversations for a specific Slack user. Returns count of deleted records."""
        try:
            result = self.db.query(SlackConversation).filter(
                SlackConversation.team_id == team_id,
                SlackConversation.slack_user_id == slack_user_id
            ).delete()
            self.db.commit()
            return result
        except Exception as e:
            logger.error(f"Error deleting conversations by user: {str(e)}")
            self.db.rollback()
            return 0

    # ==================== GDPR Data Deletion ====================

    def delete_workspace_data(self, team_id: str) -> dict:
        """
        Delete all data for a workspace (GDPR compliance).
        Called when workspace uninstalls the app.
        Returns count of deleted records per table.
        """
        try:
            results = {}

            # 1. Get conversations to anonymize chat history
            conversations = self.db.query(SlackConversation).filter(
                SlackConversation.team_id == team_id
            ).all()

            # 2. Anonymize chat history for these sessions
            session_ids = [conv.session_id for conv in conversations]
            if session_ids:
                chat_history_count = self.db.query(ChatHistory).filter(
                    ChatHistory.session_id.in_(session_ids)
                ).update(
                    {
                        "message": "[deleted per data retention policy]",
                        "attributes": {"deleted": True, "deleted_at": datetime.utcnow().isoformat()}
                    },
                    synchronize_session=False
                )
                results["chat_history_anonymized"] = chat_history_count

            # 3. Delete SlackConversations
            results["conversations"] = self.db.query(SlackConversation).filter(
                SlackConversation.team_id == team_id
            ).delete(synchronize_session=False)

            # 4. Delete AgentSlackConfigs
            results["agent_configs"] = self.db.query(AgentSlackConfig).filter(
                AgentSlackConfig.team_id == team_id
            ).delete(synchronize_session=False)

            # 5. Delete SlackWorkspaceConfig
            results["workspace_config"] = self.db.query(SlackWorkspaceConfig).filter(
                SlackWorkspaceConfig.team_id == team_id
            ).delete(synchronize_session=False)

            # 6. Delete SlackToken
            results["token"] = self.db.query(SlackToken).filter(
                SlackToken.team_id == team_id
            ).delete(synchronize_session=False)

            self.db.commit()
            logger.info(f"Deleted workspace data for team {team_id}: {results}")
            return results
        except Exception as e:
            logger.error(f"Error deleting workspace data: {str(e)}")
            self.db.rollback()
            raise

    def delete_user_data(self, team_id: str, slack_user_id: str) -> dict:
        """
        Delete all data for a specific user (GDPR compliance).
        Called when a user requests data deletion.
        Returns count of deleted/anonymized records.
        """
        try:
            results = {}

            # 1. Get conversations for this user
            conversations = self.db.query(SlackConversation).filter(
                SlackConversation.team_id == team_id,
                SlackConversation.slack_user_id == slack_user_id
            ).all()

            # 2. Anonymize chat history for these sessions
            session_ids = [conv.session_id for conv in conversations]
            if session_ids:
                chat_history_count = self.db.query(ChatHistory).filter(
                    ChatHistory.session_id.in_(session_ids)
                ).update(
                    {
                        "message": "[deleted per user request]",
                        "attributes": {"deleted": True, "deleted_at": datetime.utcnow().isoformat(), "deleted_by": "user_request"}
                    },
                    synchronize_session=False
                )
                results["chat_history_anonymized"] = chat_history_count

            # 3. Delete user's conversations
            results["conversations"] = self.db.query(SlackConversation).filter(
                SlackConversation.team_id == team_id,
                SlackConversation.slack_user_id == slack_user_id
            ).delete(synchronize_session=False)

            self.db.commit()
            logger.info(f"Deleted user data for {slack_user_id} in team {team_id}: {results}")
            return results
        except Exception as e:
            logger.error(f"Error deleting user data: {str(e)}")
            self.db.rollback()
            raise

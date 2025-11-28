"""
ChatterMate - Slack Repository Tests
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

import pytest
from uuid import uuid4
from sqlalchemy.orm import Session

from app.repositories.slack import SlackRepository
from app.models.slack import (
    SlackToken,
    SlackWorkspaceConfig,
    AgentSlackConfig,
    SlackConversation,
    StorageMode
)
from tests.conftest import TestingSessionLocal, create_tables, Base, engine


@pytest.fixture(scope="function")
def db() -> Session:
    """Create a fresh database for each test."""
    Base.metadata.drop_all(bind=engine)
    create_tables()
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def slack_repo(db: Session) -> SlackRepository:
    """Create a SlackRepository instance."""
    return SlackRepository(db)


@pytest.fixture
def org_id():
    """Generate a random organization ID."""
    return uuid4()


@pytest.fixture
def team_id():
    """Generate a test team ID."""
    return "T12345TEST"


class TestSlackTokenCRUD:
    """Tests for SlackToken CRUD operations."""

    def test_create_token(self, slack_repo, org_id, team_id):
        """Test creating a Slack token."""
        token = slack_repo.create_token(
            organization_id=org_id,
            access_token="xoxb-test-token-12345",
            bot_user_id="B12345",
            team_id=team_id,
            team_name="Test Team",
            authed_user_id="U67890",
            scope="chat:write,commands"
        )

        assert token is not None
        assert token.id is not None
        assert token.organization_id == org_id
        assert token.access_token == "xoxb-test-token-12345"
        assert token.bot_user_id == "B12345"
        assert token.team_id == team_id
        assert token.team_name == "Test Team"
        assert token.authed_user_id == "U67890"
        assert token.scope == "chat:write,commands"

    def test_get_token_by_org(self, slack_repo, org_id, team_id):
        """Test getting token by organization ID."""
        slack_repo.create_token(
            organization_id=org_id,
            access_token="xoxb-test-token",
            bot_user_id="B12345",
            team_id=team_id,
            team_name="Test Team"
        )

        token = slack_repo.get_token_by_org(org_id)
        assert token is not None
        assert token.organization_id == org_id

        # Test with string UUID
        token_str = slack_repo.get_token_by_org(str(org_id))
        assert token_str is not None

        # Test non-existent org
        token_none = slack_repo.get_token_by_org(uuid4())
        assert token_none is None

    def test_get_token_by_team(self, slack_repo, org_id, team_id):
        """Test getting token by team ID."""
        slack_repo.create_token(
            organization_id=org_id,
            access_token="xoxb-test-token",
            bot_user_id="B12345",
            team_id=team_id,
            team_name="Test Team"
        )

        token = slack_repo.get_token_by_team(team_id)
        assert token is not None
        assert token.team_id == team_id

        # Test non-existent team
        token_none = slack_repo.get_token_by_team("NONEXISTENT")
        assert token_none is None

    def test_update_token(self, slack_repo, org_id, team_id):
        """Test updating a Slack token."""
        token = slack_repo.create_token(
            organization_id=org_id,
            access_token="xoxb-old-token",
            bot_user_id="B12345",
            team_id=team_id,
            team_name="Test Team"
        )

        updated = slack_repo.update_token(
            token.id,
            access_token="xoxb-new-token",
            team_name="Updated Team"
        )

        assert updated is not None
        assert updated.access_token == "xoxb-new-token"
        assert updated.team_name == "Updated Team"

        # Test update non-existent token
        result = slack_repo.update_token(99999, access_token="test")
        assert result is None

    def test_delete_token_by_org(self, slack_repo, org_id, team_id):
        """Test deleting token by organization ID."""
        slack_repo.create_token(
            organization_id=org_id,
            access_token="xoxb-test-token",
            bot_user_id="B12345",
            team_id=team_id,
            team_name="Test Team"
        )

        result = slack_repo.delete_token_by_org(org_id)
        assert result is True

        token = slack_repo.get_token_by_org(org_id)
        assert token is None

        # Test delete non-existent
        result_none = slack_repo.delete_token_by_org(uuid4())
        assert result_none is False

    def test_delete_token_by_team(self, slack_repo, org_id, team_id):
        """Test deleting token by team ID."""
        slack_repo.create_token(
            organization_id=org_id,
            access_token="xoxb-test-token",
            bot_user_id="B12345",
            team_id=team_id,
            team_name="Test Team"
        )

        result = slack_repo.delete_token_by_team(team_id)
        assert result is True

        token = slack_repo.get_token_by_team(team_id)
        assert token is None


class TestSlackWorkspaceConfigCRUD:
    """Tests for SlackWorkspaceConfig CRUD operations."""

    def test_create_workspace_config(self, slack_repo, org_id, team_id):
        """Test creating workspace configuration."""
        agent_id = uuid4()
        config = slack_repo.create_workspace_config(
            organization_id=org_id,
            team_id=team_id,
            storage_mode=StorageMode.METADATA_ONLY,
            allowed_channel_ids=["C12345", "C67890"],
            default_agent_id=agent_id
        )

        assert config is not None
        assert config.id is not None
        assert config.organization_id == org_id
        assert config.team_id == team_id
        assert config.storage_mode == StorageMode.METADATA_ONLY
        assert config.allowed_channel_ids == ["C12345", "C67890"]
        assert config.default_agent_id == agent_id

    def test_create_workspace_config_defaults(self, slack_repo, org_id, team_id):
        """Test creating workspace config with defaults."""
        config = slack_repo.create_workspace_config(
            organization_id=org_id,
            team_id=team_id
        )

        assert config.storage_mode == StorageMode.FULL_CONTENT
        assert config.allowed_channel_ids == []
        assert config.default_agent_id is None

    def test_get_workspace_config_by_org(self, slack_repo, org_id, team_id):
        """Test getting workspace config by organization ID."""
        slack_repo.create_workspace_config(
            organization_id=org_id,
            team_id=team_id
        )

        config = slack_repo.get_workspace_config_by_org(org_id)
        assert config is not None
        assert config.organization_id == org_id

        # Test with string UUID
        config_str = slack_repo.get_workspace_config_by_org(str(org_id))
        assert config_str is not None

        # Test non-existent
        config_none = slack_repo.get_workspace_config_by_org(uuid4())
        assert config_none is None

    def test_get_workspace_config_by_team(self, slack_repo, org_id, team_id):
        """Test getting workspace config by team ID."""
        slack_repo.create_workspace_config(
            organization_id=org_id,
            team_id=team_id
        )

        config = slack_repo.get_workspace_config_by_team(team_id)
        assert config is not None
        assert config.team_id == team_id

        # Test non-existent
        config_none = slack_repo.get_workspace_config_by_team("NONEXISTENT")
        assert config_none is None

    def test_update_workspace_config(self, slack_repo, org_id, team_id):
        """Test updating workspace configuration."""
        config = slack_repo.create_workspace_config(
            organization_id=org_id,
            team_id=team_id,
            storage_mode=StorageMode.FULL_CONTENT
        )

        updated = slack_repo.update_workspace_config(
            config.id,
            storage_mode=StorageMode.METADATA_ONLY,
            allowed_channel_ids=["C11111"]
        )

        assert updated is not None
        assert updated.storage_mode == StorageMode.METADATA_ONLY
        assert updated.allowed_channel_ids == ["C11111"]

        # Test update non-existent
        result = slack_repo.update_workspace_config(99999, storage_mode=StorageMode.FULL_CONTENT)
        assert result is None

    def test_delete_workspace_config_by_team(self, slack_repo, org_id, team_id):
        """Test deleting workspace config by team ID."""
        slack_repo.create_workspace_config(
            organization_id=org_id,
            team_id=team_id
        )

        result = slack_repo.delete_workspace_config_by_team(team_id)
        assert result is True

        config = slack_repo.get_workspace_config_by_team(team_id)
        assert config is None


class TestAgentSlackConfigCRUD:
    """Tests for AgentSlackConfig CRUD operations."""

    def test_create_agent_config(self, slack_repo, org_id, team_id):
        """Test creating agent Slack configuration."""
        agent_id = uuid4()
        config = slack_repo.create_agent_config(
            organization_id=org_id,
            team_id=team_id,
            agent_id=agent_id,
            channel_id="C12345",
            channel_name="general",
            enabled=True,
            respond_to_mentions=True,
            respond_to_reactions=False,
            respond_to_commands=True,
            reaction_emoji="thumbsup"
        )

        assert config is not None
        assert config.id is not None
        assert config.organization_id == org_id
        assert config.agent_id == agent_id
        assert config.channel_id == "C12345"
        assert config.channel_name == "general"
        assert config.enabled is True
        assert config.respond_to_mentions is True
        assert config.respond_to_reactions is False
        assert config.reaction_emoji == "thumbsup"

    def test_create_agent_config_with_string_uuids(self, slack_repo, org_id, team_id):
        """Test creating agent config with string UUIDs."""
        agent_id = uuid4()
        config = slack_repo.create_agent_config(
            organization_id=str(org_id),
            team_id=team_id,
            agent_id=str(agent_id),
            channel_id="C12345",
            channel_name="general"
        )

        assert config is not None
        assert config.organization_id == org_id
        assert config.agent_id == agent_id

    def test_get_config_by_channel(self, slack_repo, org_id, team_id):
        """Test getting agent config by channel."""
        agent_id = uuid4()
        slack_repo.create_agent_config(
            organization_id=org_id,
            team_id=team_id,
            agent_id=agent_id,
            channel_id="C12345",
            channel_name="general",
            enabled=True
        )

        config = slack_repo.get_config_by_channel(team_id, "C12345")
        assert config is not None
        assert config.channel_id == "C12345"

        # Test disabled config is not returned
        slack_repo.create_agent_config(
            organization_id=org_id,
            team_id=team_id,
            agent_id=agent_id,
            channel_id="C67890",
            channel_name="disabled-channel",
            enabled=False
        )
        config_disabled = slack_repo.get_config_by_channel(team_id, "C67890")
        assert config_disabled is None

        # Test non-existent channel
        config_none = slack_repo.get_config_by_channel(team_id, "NONEXISTENT")
        assert config_none is None

    def test_get_configs_by_agent(self, slack_repo, org_id, team_id):
        """Test getting all configs for an agent."""
        agent_id = uuid4()

        slack_repo.create_agent_config(
            organization_id=org_id,
            team_id=team_id,
            agent_id=agent_id,
            channel_id="C12345",
            channel_name="channel1"
        )
        slack_repo.create_agent_config(
            organization_id=org_id,
            team_id=team_id,
            agent_id=agent_id,
            channel_id="C67890",
            channel_name="channel2"
        )

        configs = slack_repo.get_configs_by_agent(agent_id)
        assert len(configs) == 2

        # Test with string UUID
        configs_str = slack_repo.get_configs_by_agent(str(agent_id))
        assert len(configs_str) == 2

        # Test non-existent agent
        configs_none = slack_repo.get_configs_by_agent(uuid4())
        assert len(configs_none) == 0

    def test_get_configs_by_org(self, slack_repo, org_id, team_id):
        """Test getting all configs for an organization."""
        agent1 = uuid4()
        agent2 = uuid4()

        slack_repo.create_agent_config(
            organization_id=org_id,
            team_id=team_id,
            agent_id=agent1,
            channel_id="C12345",
            channel_name="channel1"
        )
        slack_repo.create_agent_config(
            organization_id=org_id,
            team_id=team_id,
            agent_id=agent2,
            channel_id="C67890",
            channel_name="channel2"
        )

        configs = slack_repo.get_configs_by_org(org_id)
        assert len(configs) == 2

    def test_update_agent_config(self, slack_repo, org_id, team_id):
        """Test updating agent Slack configuration."""
        agent_id = uuid4()
        config = slack_repo.create_agent_config(
            organization_id=org_id,
            team_id=team_id,
            agent_id=agent_id,
            channel_id="C12345",
            channel_name="general",
            enabled=True
        )

        updated = slack_repo.update_agent_config(
            config.id,
            enabled=False,
            reaction_emoji="wave"
        )

        assert updated is not None
        assert updated.enabled is False
        assert updated.reaction_emoji == "wave"

        # Test update non-existent
        result = slack_repo.update_agent_config(99999, enabled=True)
        assert result is None

    def test_delete_agent_config(self, slack_repo, org_id, team_id):
        """Test deleting agent config."""
        agent_id = uuid4()
        slack_repo.create_agent_config(
            organization_id=org_id,
            team_id=team_id,
            agent_id=agent_id,
            channel_id="C12345",
            channel_name="general"
        )

        result = slack_repo.delete_agent_config(org_id, "C12345")
        assert result is True

        # Verify deleted
        configs = slack_repo.get_configs_by_org(org_id)
        assert len(configs) == 0

        # Test delete non-existent
        result_none = slack_repo.delete_agent_config(org_id, "NONEXISTENT")
        assert result_none is False

    def test_delete_configs_by_team(self, slack_repo, org_id, team_id):
        """Test deleting all configs for a team."""
        agent_id = uuid4()
        slack_repo.create_agent_config(
            organization_id=org_id,
            team_id=team_id,
            agent_id=agent_id,
            channel_id="C12345",
            channel_name="channel1"
        )
        slack_repo.create_agent_config(
            organization_id=org_id,
            team_id=team_id,
            agent_id=agent_id,
            channel_id="C67890",
            channel_name="channel2"
        )

        count = slack_repo.delete_configs_by_team(team_id)
        assert count == 2

        configs = slack_repo.get_configs_by_org(org_id)
        assert len(configs) == 0


class TestSlackConversationCRUD:
    """Tests for SlackConversation CRUD operations."""

    def test_get_or_create_conversation_new(self, slack_repo, org_id, team_id):
        """Test creating a new conversation."""
        session_id = uuid4()
        agent_id = uuid4()

        conversation = slack_repo.get_or_create_conversation(
            team_id=team_id,
            channel_id="D12345",
            thread_ts="1234567890.123456",
            session_id=session_id,
            agent_id=agent_id,
            organization_id=org_id,
            slack_user_id="U12345"
        )

        assert conversation is not None
        assert conversation.id is not None
        assert conversation.team_id == team_id
        assert conversation.channel_id == "D12345"
        assert conversation.thread_ts == "1234567890.123456"
        assert conversation.session_id == session_id
        assert conversation.agent_id == agent_id
        assert conversation.slack_user_id == "U12345"

    def test_get_or_create_conversation_existing(self, slack_repo, org_id, team_id):
        """Test getting an existing conversation."""
        session_id = uuid4()
        agent_id = uuid4()

        # Create first
        conv1 = slack_repo.get_or_create_conversation(
            team_id=team_id,
            channel_id="D12345",
            thread_ts="1234567890.123456",
            session_id=session_id,
            agent_id=agent_id,
            organization_id=org_id,
            slack_user_id="U12345"
        )

        # Get existing
        conv2 = slack_repo.get_or_create_conversation(
            team_id=team_id,
            channel_id="D12345",
            thread_ts="1234567890.123456",
            session_id=uuid4(),  # Different session
            agent_id=uuid4(),    # Different agent
            organization_id=org_id,
            slack_user_id="U99999"  # Different user
        )

        # Should return the same conversation
        assert conv2.id == conv1.id
        assert conv2.session_id == conv1.session_id

    def test_get_conversation_by_thread(self, slack_repo, org_id, team_id):
        """Test getting conversation by thread."""
        session_id = uuid4()
        agent_id = uuid4()

        slack_repo.get_or_create_conversation(
            team_id=team_id,
            channel_id="D12345",
            thread_ts="1234567890.123456",
            session_id=session_id,
            agent_id=agent_id,
            organization_id=org_id,
            slack_user_id="U12345"
        )

        conv = slack_repo.get_conversation_by_thread(
            team_id=team_id,
            channel_id="D12345",
            thread_ts="1234567890.123456"
        )
        assert conv is not None
        assert conv.thread_ts == "1234567890.123456"

        # Test non-existent
        conv_none = slack_repo.get_conversation_by_thread(
            team_id=team_id,
            channel_id="D12345",
            thread_ts="9999999999.999999"
        )
        assert conv_none is None

    def test_get_conversations_by_session(self, slack_repo, org_id, team_id):
        """Test getting conversations by session."""
        session_id = uuid4()
        agent_id = uuid4()

        slack_repo.get_or_create_conversation(
            team_id=team_id,
            channel_id="D12345",
            thread_ts="1111111111.111111",
            session_id=session_id,
            agent_id=agent_id,
            organization_id=org_id,
            slack_user_id="U12345"
        )
        slack_repo.get_or_create_conversation(
            team_id=team_id,
            channel_id="D12345",
            thread_ts="2222222222.222222",
            session_id=session_id,
            agent_id=agent_id,
            organization_id=org_id,
            slack_user_id="U12345"
        )

        conversations = slack_repo.get_conversations_by_session(session_id)
        assert len(conversations) == 2

        # Test with string UUID
        conversations_str = slack_repo.get_conversations_by_session(str(session_id))
        assert len(conversations_str) == 2

    def test_delete_conversations_by_team(self, slack_repo, org_id, team_id):
        """Test deleting all conversations for a team."""
        session_id = uuid4()
        agent_id = uuid4()

        slack_repo.get_or_create_conversation(
            team_id=team_id,
            channel_id="D12345",
            thread_ts="1111111111.111111",
            session_id=session_id,
            agent_id=agent_id,
            organization_id=org_id,
            slack_user_id="U12345"
        )
        slack_repo.get_or_create_conversation(
            team_id=team_id,
            channel_id="D67890",
            thread_ts="2222222222.222222",
            session_id=session_id,
            agent_id=agent_id,
            organization_id=org_id,
            slack_user_id="U67890"
        )

        count = slack_repo.delete_conversations_by_team(team_id)
        assert count == 2

    def test_delete_conversations_by_user(self, slack_repo, org_id, team_id):
        """Test deleting conversations for a specific user."""
        session_id = uuid4()
        agent_id = uuid4()

        # Create conversations for two users
        slack_repo.get_or_create_conversation(
            team_id=team_id,
            channel_id="D12345",
            thread_ts="1111111111.111111",
            session_id=session_id,
            agent_id=agent_id,
            organization_id=org_id,
            slack_user_id="U12345"
        )
        slack_repo.get_or_create_conversation(
            team_id=team_id,
            channel_id="D67890",
            thread_ts="2222222222.222222",
            session_id=uuid4(),
            agent_id=agent_id,
            organization_id=org_id,
            slack_user_id="U67890"
        )

        # Delete only first user's conversations
        count = slack_repo.delete_conversations_by_user(team_id, "U12345")
        assert count == 1

        # Verify second user's conversation still exists
        conv = slack_repo.get_conversation_by_thread(team_id, "D67890", "2222222222.222222")
        assert conv is not None


class TestGDPRDataDeletion:
    """Tests for GDPR data deletion methods."""

    def test_delete_workspace_data(self, slack_repo, org_id, team_id):
        """Test deleting all workspace data."""
        agent_id = uuid4()
        session_id = uuid4()

        # Create token
        slack_repo.create_token(
            organization_id=org_id,
            access_token="xoxb-test-token",
            bot_user_id="B12345",
            team_id=team_id,
            team_name="Test Team"
        )

        # Create workspace config
        slack_repo.create_workspace_config(
            organization_id=org_id,
            team_id=team_id
        )

        # Create agent config
        slack_repo.create_agent_config(
            organization_id=org_id,
            team_id=team_id,
            agent_id=agent_id,
            channel_id="C12345",
            channel_name="general"
        )

        # Create conversation
        slack_repo.get_or_create_conversation(
            team_id=team_id,
            channel_id="D12345",
            thread_ts="1234567890.123456",
            session_id=session_id,
            agent_id=agent_id,
            organization_id=org_id,
            slack_user_id="U12345"
        )

        # Delete all workspace data
        results = slack_repo.delete_workspace_data(team_id)

        assert "token" in results
        assert "workspace_config" in results
        assert "agent_configs" in results
        assert "conversations" in results

        # Verify everything is deleted
        assert slack_repo.get_token_by_team(team_id) is None
        assert slack_repo.get_workspace_config_by_team(team_id) is None
        assert len(slack_repo.get_configs_by_org(org_id)) == 0

    def test_delete_user_data(self, slack_repo, org_id, team_id):
        """Test deleting all data for a specific user."""
        agent_id = uuid4()

        # Create conversations for two users
        slack_repo.get_or_create_conversation(
            team_id=team_id,
            channel_id="D12345",
            thread_ts="1111111111.111111",
            session_id=uuid4(),
            agent_id=agent_id,
            organization_id=org_id,
            slack_user_id="U12345"
        )
        slack_repo.get_or_create_conversation(
            team_id=team_id,
            channel_id="D67890",
            thread_ts="2222222222.222222",
            session_id=uuid4(),
            agent_id=agent_id,
            organization_id=org_id,
            slack_user_id="U67890"
        )

        # Delete user U12345's data
        results = slack_repo.delete_user_data(team_id, "U12345")

        assert "conversations" in results
        assert results["conversations"] == 1

        # Verify U12345's conversation is deleted
        conv = slack_repo.get_conversation_by_thread(team_id, "D12345", "1111111111.111111")
        assert conv is None

        # Verify U67890's conversation still exists
        conv = slack_repo.get_conversation_by_thread(team_id, "D67890", "2222222222.222222")
        assert conv is not None

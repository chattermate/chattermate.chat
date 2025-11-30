"""
ChatterMate - Test Slack Chat Handlers
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
import json
from unittest.mock import patch, MagicMock, AsyncMock
from uuid import uuid4, UUID
from app.services.slack_chat import (
    clean_mention_text,
    get_or_create_slack_customer,
    handle_app_home_opened,
    handle_assistant_thread_started,
    handle_assistant_context_changed,
    handle_direct_message,
    build_agent_selection_modal,
    process_config_command,
    handle_block_action,
    handle_view_submission
)


class TestCleanMentionText:
    """Tests for clean_mention_text function"""

    def test_clean_single_mention(self):
        """Test cleaning a single mention"""
        text = "<@U12345> Hello there"
        result = clean_mention_text(text)
        assert result == "Hello there"

    def test_clean_multiple_mentions(self):
        """Test cleaning multiple mentions"""
        text = "<@U12345> <@U67890> Hello everyone"
        result = clean_mention_text(text)
        assert result == "Hello everyone"

    def test_clean_empty_text(self):
        """Test cleaning empty text"""
        result = clean_mention_text("")
        assert result == ""

    def test_clean_none_text(self):
        """Test cleaning None text"""
        result = clean_mention_text(None)
        assert result == ""

    def test_clean_no_mentions(self):
        """Test text without mentions"""
        text = "Hello there"
        result = clean_mention_text(text)
        assert result == "Hello there"

    def test_clean_mention_only(self):
        """Test text that is only a mention"""
        text = "<@U12345>"
        result = clean_mention_text(text)
        assert result == ""


class TestBuildAgentSelectionModal:
    """Tests for build_agent_selection_modal function"""

    def test_build_modal_with_agents(self):
        """Test building modal with agents"""
        mock_agents = [
            MagicMock(id=uuid4(), name="Sales Agent", display_name=None),
            MagicMock(id=uuid4(), name="Support Agent", display_name=None)
        ]

        modal = build_agent_selection_modal(
            channel_id="C12345",
            channel_name="general",
            agents=mock_agents
        )

        assert modal["type"] == "modal"
        assert modal["callback_id"] == "cm_agent_selected"
        assert "general" in modal["blocks"][0]["text"]["text"]
        assert len(modal["blocks"]) > 0

    def test_build_modal_agent_options(self):
        """Test modal contains correct agent options"""
        # Create proper mock agents with name as a simple property
        agent1 = MagicMock()
        agent1.id = uuid4()
        agent1.name = "Agent One"
        agent1.display_name = None  # Falls back to name

        agent2 = MagicMock()
        agent2.id = uuid4()
        agent2.name = "Agent Two"
        agent2.display_name = None  # Falls back to name

        mock_agents = [agent1, agent2]

        modal = build_agent_selection_modal(
            channel_id="C12345",
            channel_name="test",
            agents=mock_agents
        )

        # Find the agent picker block
        agent_picker = None
        for block in modal["blocks"]:
            if block.get("block_id") == "agent_picker":
                agent_picker = block
                break

        assert agent_picker is not None
        options = agent_picker["element"]["options"]
        assert len(options) == 2
        assert options[0]["text"]["text"] == "Agent One"


class TestGetOrCreateSlackCustomer:
    """Tests for get_or_create_slack_customer function"""

    @pytest.mark.asyncio
    async def test_get_or_create_customer(self):
        """Test creating a customer for Slack user"""
        mock_db = MagicMock()
        mock_customer = MagicMock()
        mock_customer.id = uuid4()

        with patch('app.services.slack_chat.CustomerRepository') as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.get_or_create_customer.return_value = mock_customer
            mock_repo_class.return_value = mock_repo

            result = await get_or_create_slack_customer(
                db=mock_db,
                slack_user_id="U12345",
                organization_id=str(uuid4())
            )

            assert result == str(mock_customer.id)
            mock_repo.get_or_create_customer.assert_called_once()


class TestHandleAppHomeOpened:
    """Tests for handle_app_home_opened function"""

    @pytest.mark.asyncio
    async def test_app_home_opened_with_agents(self):
        """Test App Home opened with agents"""
        mock_db = MagicMock()
        mock_token = MagicMock()
        mock_token.access_token = "xoxb-test-token"
        mock_token.organization_id = uuid4()

        mock_agent = MagicMock()
        mock_agent.name = "Test Agent"
        mock_agent.display_name = "Test Display Name"
        mock_agent.is_active = True
        mock_agent.instructions = ["Be helpful and friendly"]

        event = {
            "user": "U12345",
            "tab": "home"
        }

        with patch('app.services.slack_chat.SlackRepository') as mock_slack_repo_class, \
             patch('app.services.slack_chat.AgentRepository') as mock_agent_repo_class, \
             patch('app.services.slack_chat.slack_service') as mock_slack_service, \
             patch('app.core.config.settings') as mock_settings:

            mock_settings.FRONTEND_URL = "https://app.chattermate.chat"

            mock_slack_repo = MagicMock()
            mock_slack_repo.get_token_by_team.return_value = mock_token
            mock_slack_repo_class.return_value = mock_slack_repo

            mock_agent_repo = MagicMock()
            mock_agent_repo.get_org_agents.return_value = [mock_agent]
            mock_agent_repo_class.return_value = mock_agent_repo

            mock_slack_service.publish_home_view = AsyncMock()

            await handle_app_home_opened(event, "T12345", mock_db)

            mock_slack_service.publish_home_view.assert_called_once()
            call_args = mock_slack_service.publish_home_view.call_args
            assert call_args.kwargs["user_id"] == "U12345"

    @pytest.mark.asyncio
    async def test_app_home_opened_no_token(self):
        """Test App Home opened with no token"""
        mock_db = MagicMock()
        event = {"user": "U12345", "tab": "home"}

        with patch('app.services.slack_chat.SlackRepository') as mock_slack_repo_class:
            mock_slack_repo = MagicMock()
            mock_slack_repo.get_token_by_team.return_value = None
            mock_slack_repo_class.return_value = mock_slack_repo

            # Should return early without error
            await handle_app_home_opened(event, "T12345", mock_db)

    @pytest.mark.asyncio
    async def test_app_home_opened_messages_tab(self):
        """Test App Home opened on messages tab (should be ignored)"""
        mock_db = MagicMock()
        mock_token = MagicMock()

        event = {"user": "U12345", "tab": "messages"}

        with patch('app.services.slack_chat.SlackRepository') as mock_slack_repo_class, \
             patch('app.services.slack_chat.slack_service') as mock_slack_service:

            mock_slack_repo = MagicMock()
            mock_slack_repo.get_token_by_team.return_value = mock_token
            mock_slack_repo_class.return_value = mock_slack_repo

            await handle_app_home_opened(event, "T12345", mock_db)

            # Should not call publish_home_view for messages tab
            mock_slack_service.publish_home_view.assert_not_called()


class TestHandleAssistantThreadStarted:
    """Tests for handle_assistant_thread_started function"""

    @pytest.mark.asyncio
    async def test_assistant_thread_started(self):
        """Test assistant thread started handler"""
        mock_db = MagicMock()
        mock_token = MagicMock()
        mock_token.access_token = "xoxb-test-token"
        mock_token.organization_id = uuid4()

        mock_agent = MagicMock()
        mock_agent.name = "Sales Agent"
        mock_agent.display_name = None  # Will fall back to name
        mock_agent.id = uuid4()

        event = {
            "assistant_thread": {
                "channel_id": "D12345",
                "thread_ts": "1234567890.123456"
            }
        }

        with patch('app.services.slack_chat.SlackRepository') as mock_slack_repo_class, \
             patch('app.services.slack_chat.AgentRepository') as mock_agent_repo_class, \
             patch('app.services.slack_chat.slack_service') as mock_slack_service:

            mock_slack_repo = MagicMock()
            mock_slack_repo.get_token_by_team.return_value = mock_token
            mock_slack_repo_class.return_value = mock_slack_repo

            mock_agent_repo = MagicMock()
            mock_agent_repo.get_org_agents.return_value = [mock_agent]
            mock_agent_repo_class.return_value = mock_agent_repo

            mock_slack_service.set_assistant_status = AsyncMock()
            mock_slack_service.set_suggested_prompts = AsyncMock()
            mock_slack_service.send_message = AsyncMock()

            await handle_assistant_thread_started(event, "T12345", mock_db)

            # Verify status was set
            mock_slack_service.set_assistant_status.assert_called()
            # Verify prompts were set
            mock_slack_service.set_suggested_prompts.assert_called()
            # Verify welcome message was sent
            mock_slack_service.send_message.assert_called()

    @pytest.mark.asyncio
    async def test_assistant_thread_started_no_channel(self):
        """Test assistant thread started with missing channel"""
        mock_db = MagicMock()
        mock_token = MagicMock()

        event = {"assistant_thread": {}}

        with patch('app.services.slack_chat.SlackRepository') as mock_slack_repo_class:
            mock_slack_repo = MagicMock()
            mock_slack_repo.get_token_by_team.return_value = mock_token
            mock_slack_repo_class.return_value = mock_slack_repo

            # Should return early without error
            await handle_assistant_thread_started(event, "T12345", mock_db)


class TestHandleAssistantContextChanged:
    """Tests for handle_assistant_context_changed function"""

    @pytest.mark.asyncio
    async def test_assistant_context_changed(self):
        """Test assistant context changed handler"""
        mock_db = MagicMock()

        event = {
            "assistant_thread": {
                "channel_id": "D12345",
                "context": {
                    "channel_id": "C67890"
                }
            }
        }

        # Should not raise any errors
        await handle_assistant_context_changed(event, "T12345", mock_db)


class TestHandleDirectMessage:
    """Tests for handle_direct_message function"""

    @pytest.mark.asyncio
    async def test_direct_message_with_agent_prefix(self):
        """Test DM with agent selection prefix"""
        mock_db = MagicMock()
        mock_token = MagicMock()
        mock_token.access_token = "xoxb-test-token"
        mock_token.bot_user_id = "BOT123"
        mock_token.organization_id = uuid4()

        mock_workspace_config = MagicMock()
        mock_workspace_config.default_agent_id = None
        mock_workspace_config.storage_mode = MagicMock()

        mock_agent = MagicMock()
        mock_agent.name = "Sales Agent"
        mock_agent.id = uuid4()

        event = {
            "user": "U12345",
            "text": "Hi! I'd like to chat with Sales Agent",
            "channel": "D12345",
            "ts": "1234567890.123456"
        }

        with patch('app.services.slack_chat.SlackRepository') as mock_slack_repo_class, \
             patch('app.services.slack_chat.AgentRepository') as mock_agent_repo_class, \
             patch('app.services.slack_chat.slack_service') as mock_slack_service, \
             patch('app.services.slack_chat.process_slack_chat') as mock_process_chat:

            mock_slack_repo = MagicMock()
            mock_slack_repo.get_token_by_team.return_value = mock_token
            mock_slack_repo.get_workspace_config_by_team.return_value = mock_workspace_config
            mock_slack_repo_class.return_value = mock_slack_repo

            mock_agent_repo = MagicMock()
            mock_agent_repo.get_org_agents.return_value = [mock_agent]
            mock_agent_repo_class.return_value = mock_agent_repo

            mock_slack_service.set_assistant_status = AsyncMock()
            mock_process_chat.return_value = AsyncMock()

            await handle_direct_message(event, "T12345", mock_db)

            # Should have selected the agent by name
            mock_process_chat.assert_called_once()

    @pytest.mark.asyncio
    async def test_direct_message_ignore_bot_message(self):
        """Test DM ignores bot's own messages"""
        mock_db = MagicMock()
        mock_token = MagicMock()
        mock_token.bot_user_id = "BOT123"

        event = {
            "user": "BOT123",  # Bot's own message
            "text": "Hello",
            "channel": "D12345",
            "ts": "1234567890.123456"
        }

        with patch('app.services.slack_chat.SlackRepository') as mock_slack_repo_class, \
             patch('app.services.slack_chat.process_slack_chat') as mock_process_chat:

            mock_slack_repo = MagicMock()
            mock_slack_repo.get_token_by_team.return_value = mock_token
            mock_slack_repo_class.return_value = mock_slack_repo

            await handle_direct_message(event, "T12345", mock_db)

            # Should not process bot's own messages
            mock_process_chat.assert_not_called()

    @pytest.mark.asyncio
    async def test_direct_message_no_workspace_config(self):
        """Test DM with no workspace config"""
        mock_db = MagicMock()
        mock_token = MagicMock()
        mock_token.bot_user_id = "BOT123"

        event = {
            "user": "U12345",
            "text": "Hello",
            "channel": "D12345",
            "ts": "1234567890.123456"
        }

        with patch('app.services.slack_chat.SlackRepository') as mock_slack_repo_class, \
             patch('app.services.slack_chat.process_slack_chat') as mock_process_chat:

            mock_slack_repo = MagicMock()
            mock_slack_repo.get_token_by_team.return_value = mock_token
            mock_slack_repo.get_workspace_config_by_team.return_value = None
            mock_slack_repo_class.return_value = mock_slack_repo

            await handle_direct_message(event, "T12345", mock_db)

            # Should not process without workspace config
            mock_process_chat.assert_not_called()

    @pytest.mark.asyncio
    async def test_direct_message_fallback_to_first_agent(self):
        """Test DM falls back to first available agent"""
        mock_db = MagicMock()
        mock_token = MagicMock()
        mock_token.access_token = "xoxb-test-token"
        mock_token.bot_user_id = "BOT123"
        mock_token.organization_id = uuid4()

        mock_workspace_config = MagicMock()
        mock_workspace_config.default_agent_id = None  # No default
        mock_workspace_config.storage_mode = MagicMock()

        mock_agent = MagicMock()
        mock_agent.name = "First Agent"
        mock_agent.id = uuid4()

        event = {
            "user": "U12345",
            "text": "Hello there",
            "channel": "D12345",
            "ts": "1234567890.123456"
        }

        with patch('app.services.slack_chat.SlackRepository') as mock_slack_repo_class, \
             patch('app.services.slack_chat.AgentRepository') as mock_agent_repo_class, \
             patch('app.services.slack_chat.slack_service') as mock_slack_service, \
             patch('app.services.slack_chat.process_slack_chat') as mock_process_chat:

            mock_slack_repo = MagicMock()
            mock_slack_repo.get_token_by_team.return_value = mock_token
            mock_slack_repo.get_workspace_config_by_team.return_value = mock_workspace_config
            mock_slack_repo.get_conversation_by_thread.return_value = None  # No existing conversation
            mock_slack_repo_class.return_value = mock_slack_repo

            mock_agent_repo = MagicMock()
            mock_agent_repo.get_org_agents.return_value = [mock_agent]
            mock_agent_repo_class.return_value = mock_agent_repo

            mock_slack_service.set_assistant_status = AsyncMock()
            mock_process_chat.return_value = AsyncMock()

            await handle_direct_message(event, "T12345", mock_db)

            # Should fall back to first agent
            mock_process_chat.assert_called_once()
            call_args = mock_process_chat.call_args
            assert call_args.kwargs["agent_id"] == str(mock_agent.id)


class TestProcessConfigCommand:
    """Tests for process_config_command function"""

    @pytest.mark.asyncio
    async def test_config_command_in_channel(self):
        """Test config command in a channel opens modal"""
        mock_db = MagicMock()
        mock_token = MagicMock()
        mock_token.access_token = "xoxb-test-token"
        mock_token.organization_id = uuid4()

        mock_agent = MagicMock()
        mock_agent.id = uuid4()
        mock_agent.name = "Test Agent"
        mock_agent.display_name = None

        form_data = {
            "team_id": "T12345",
            "channel_id": "C12345",  # Channel (not DM)
            "channel_name": "general",
            "trigger_id": "12345.67890",
            "response_url": "https://hooks.slack.com/response"
        }

        with patch('app.services.slack_chat.SessionLocal') as mock_session_local, \
             patch('app.services.slack_chat.SlackRepository') as mock_slack_repo_class, \
             patch('app.services.slack_chat.AgentRepository') as mock_agent_repo_class, \
             patch('app.services.slack_chat.slack_service') as mock_slack_service:

            mock_session_local.return_value = mock_db
            mock_db.close = MagicMock()

            mock_slack_repo = MagicMock()
            mock_slack_repo.get_token_by_team.return_value = mock_token
            mock_slack_repo_class.return_value = mock_slack_repo

            mock_agent_repo = MagicMock()
            mock_agent_repo.get_org_agents.return_value = [mock_agent]
            mock_agent_repo_class.return_value = mock_agent_repo

            mock_slack_service.get_conversation_info = AsyncMock(return_value={"name": "general"})
            mock_slack_service.open_view = AsyncMock()

            await process_config_command(form_data, mock_db)

            # Should open modal for channel
            mock_slack_service.open_view.assert_called_once()

    @pytest.mark.asyncio
    async def test_config_command_in_dm(self):
        """Test config command in DM shows agent buttons"""
        mock_db = MagicMock()
        mock_token = MagicMock()
        mock_token.access_token = "xoxb-test-token"
        mock_token.organization_id = uuid4()

        mock_workspace_config = MagicMock()
        mock_workspace_config.default_agent_id = uuid4()

        mock_agent = MagicMock()
        mock_agent.id = mock_workspace_config.default_agent_id
        mock_agent.name = "Test Agent"
        mock_agent.display_name = "Display Name"

        form_data = {
            "team_id": "T12345",
            "channel_id": "D12345",  # DM (starts with D)
            "channel_name": "",
            "trigger_id": "12345.67890",
            "response_url": "https://hooks.slack.com/response"
        }

        with patch('app.services.slack_chat.SessionLocal') as mock_session_local, \
             patch('app.services.slack_chat.SlackRepository') as mock_slack_repo_class, \
             patch('app.services.slack_chat.AgentRepository') as mock_agent_repo_class, \
             patch('app.services.slack_chat.slack_service') as mock_slack_service:

            mock_session_local.return_value = mock_db
            mock_db.close = MagicMock()

            mock_slack_repo = MagicMock()
            mock_slack_repo.get_token_by_team.return_value = mock_token
            mock_slack_repo.get_workspace_config_by_team.return_value = mock_workspace_config
            mock_slack_repo_class.return_value = mock_slack_repo

            mock_agent_repo = MagicMock()
            mock_agent_repo.get_org_agents.return_value = [mock_agent]
            mock_agent_repo_class.return_value = mock_agent_repo

            mock_slack_service.respond_to_response_url = AsyncMock()

            await process_config_command(form_data, mock_db)

            # Should respond with buttons for DM
            mock_slack_service.respond_to_response_url.assert_called_once()
            call_args = mock_slack_service.respond_to_response_url.call_args
            assert "blocks" in call_args.kwargs

    @pytest.mark.asyncio
    async def test_config_command_no_token(self):
        """Test config command with no token"""
        mock_db = MagicMock()

        form_data = {
            "team_id": "T12345",
            "channel_id": "C12345",
            "response_url": "https://hooks.slack.com/response"
        }

        with patch('app.services.slack_chat.SessionLocal') as mock_session_local, \
             patch('app.services.slack_chat.SlackRepository') as mock_slack_repo_class, \
             patch('app.services.slack_chat.slack_service') as mock_slack_service:

            mock_session_local.return_value = mock_db
            mock_db.close = MagicMock()

            mock_slack_repo = MagicMock()
            mock_slack_repo.get_token_by_team.return_value = None
            mock_slack_repo_class.return_value = mock_slack_repo

            mock_slack_service.respond_to_response_url = AsyncMock()

            await process_config_command(form_data, mock_db)

            # Should respond with error message
            mock_slack_service.respond_to_response_url.assert_called_once()
            call_args = mock_slack_service.respond_to_response_url.call_args
            assert "not configured" in call_args.kwargs["text"]

    @pytest.mark.asyncio
    async def test_config_command_no_agents(self):
        """Test config command with no agents"""
        mock_db = MagicMock()
        mock_token = MagicMock()
        mock_token.organization_id = uuid4()

        form_data = {
            "team_id": "T12345",
            "channel_id": "C12345",
            "response_url": "https://hooks.slack.com/response"
        }

        with patch('app.services.slack_chat.SessionLocal') as mock_session_local, \
             patch('app.services.slack_chat.SlackRepository') as mock_slack_repo_class, \
             patch('app.services.slack_chat.AgentRepository') as mock_agent_repo_class, \
             patch('app.services.slack_chat.slack_service') as mock_slack_service:

            mock_session_local.return_value = mock_db
            mock_db.close = MagicMock()

            mock_slack_repo = MagicMock()
            mock_slack_repo.get_token_by_team.return_value = mock_token
            mock_slack_repo_class.return_value = mock_slack_repo

            mock_agent_repo = MagicMock()
            mock_agent_repo.get_org_agents.return_value = []
            mock_agent_repo_class.return_value = mock_agent_repo

            mock_slack_service.respond_to_response_url = AsyncMock()

            await process_config_command(form_data, mock_db)

            # Should respond with no agents message
            mock_slack_service.respond_to_response_url.assert_called_once()
            call_args = mock_slack_service.respond_to_response_url.call_args
            assert "No agents" in call_args.kwargs["text"]


class TestHandleBlockAction:
    """Tests for handle_block_action function"""

    @pytest.mark.asyncio
    async def test_block_action_select_agent_modal(self):
        """Test block action to open agent selection modal"""
        mock_db = MagicMock()
        mock_token = MagicMock()
        mock_token.access_token = "xoxb-test-token"
        mock_token.organization_id = uuid4()

        mock_agent = MagicMock()
        mock_agent.id = uuid4()
        mock_agent.name = "Test Agent"
        mock_agent.display_name = None

        payload = {
            "trigger_id": "12345.67890",
            "actions": [{
                "action_id": "cm_select_agent_modal",
                "value": json.dumps({"channel_id": "C12345", "channel_name": "general"})
            }],
            "response_url": "https://hooks.slack.com/response"
        }

        with patch('app.services.slack_chat.SlackRepository') as mock_slack_repo_class, \
             patch('app.services.slack_chat.AgentRepository') as mock_agent_repo_class, \
             patch('app.services.slack_chat.slack_service') as mock_slack_service:

            mock_slack_repo = MagicMock()
            mock_slack_repo.get_token_by_team.return_value = mock_token
            mock_slack_repo_class.return_value = mock_slack_repo

            mock_agent_repo = MagicMock()
            mock_agent_repo.get_org_agents.return_value = [mock_agent]
            mock_agent_repo_class.return_value = mock_agent_repo

            mock_slack_service.open_view = AsyncMock()

            await handle_block_action(payload, "T12345", mock_db)

            # Should open modal
            mock_slack_service.open_view.assert_called_once()

    @pytest.mark.asyncio
    async def test_block_action_dm_select_agent(self):
        """Test block action to select agent in DM"""
        mock_db = MagicMock()
        mock_token = MagicMock()
        mock_token.access_token = "xoxb-test-token"
        mock_token.organization_id = uuid4()

        mock_workspace_config = MagicMock()
        mock_workspace_config.id = 1

        agent_id = uuid4()
        mock_agent = MagicMock()
        mock_agent.id = agent_id
        mock_agent.name = "Test Agent"
        mock_agent.display_name = "Display Agent"

        payload = {
            "trigger_id": "12345.67890",
            "actions": [{
                "action_id": f"dm_select_agent_{agent_id}",
                "value": str(agent_id)
            }],
            "channel": {"id": "D12345"},
            "response_url": "https://hooks.slack.com/response"
        }

        with patch('app.services.slack_chat.SlackRepository') as mock_slack_repo_class, \
             patch('app.services.slack_chat.AgentRepository') as mock_agent_repo_class, \
             patch('app.services.slack_chat.slack_service') as mock_slack_service:

            mock_slack_repo = MagicMock()
            mock_slack_repo.get_token_by_team.return_value = mock_token
            mock_slack_repo.get_workspace_config_by_team.return_value = mock_workspace_config
            mock_slack_repo_class.return_value = mock_slack_repo

            mock_agent_repo = MagicMock()
            mock_agent_repo.get_by_id.return_value = mock_agent
            mock_agent_repo_class.return_value = mock_agent_repo

            mock_slack_service.respond_to_response_url = AsyncMock()

            await handle_block_action(payload, "T12345", mock_db)

            # Should update workspace config
            mock_slack_repo.update_workspace_config.assert_called_once()
            # Should respond with confirmation
            mock_slack_service.respond_to_response_url.assert_called_once()
            call_args = mock_slack_service.respond_to_response_url.call_args
            assert "Display Agent" in call_args.kwargs["text"]


class TestHandleViewSubmission:
    """Tests for handle_view_submission function"""

    @pytest.mark.asyncio
    async def test_view_submission_agent_selected(self):
        """Test view submission for agent selection"""
        mock_db = MagicMock()
        mock_token = MagicMock()
        mock_token.access_token = "xoxb-test-token"
        mock_token.organization_id = uuid4()

        agent_id = uuid4()
        mock_agent = MagicMock()
        mock_agent.id = agent_id
        mock_agent.name = "Test Agent"
        mock_agent.display_name = None

        payload = {
            "view": {
                "callback_id": "cm_agent_selected",
                "private_metadata": json.dumps({"channel_id": "C12345", "channel_name": "general"}),
                "state": {
                    "values": {
                        "agent_picker": {
                            "agent_selection": {
                                "selected_option": {"value": str(agent_id)}
                            }
                        },
                        "respond_mentions": {
                            "mentions_check": {"selected_options": [{"value": "yes"}]}
                        },
                        "respond_commands": {
                            "commands_check": {"selected_options": []}
                        }
                    }
                }
            }
        }

        with patch('app.services.slack_chat.SlackRepository') as mock_slack_repo_class, \
             patch('app.services.slack_chat.AgentRepository') as mock_agent_repo_class, \
             patch('app.services.slack_chat.slack_service') as mock_slack_service:

            mock_slack_repo = MagicMock()
            mock_slack_repo.get_token_by_team.return_value = mock_token
            mock_slack_repo.get_config_by_channel.return_value = None  # New config
            mock_slack_repo_class.return_value = mock_slack_repo

            mock_agent_repo = MagicMock()
            mock_agent_repo.get_by_id.return_value = mock_agent
            mock_agent_repo_class.return_value = mock_agent_repo

            mock_slack_service.send_message = AsyncMock()

            result = await handle_view_submission(payload, "T12345", mock_db)

            # Should create new config
            mock_slack_repo.create_agent_config.assert_called_once()
            # Should send confirmation message
            mock_slack_service.send_message.assert_called_once()
            # Should return None (success)
            assert result is None

    @pytest.mark.asyncio
    async def test_view_submission_update_existing(self):
        """Test view submission updating existing config"""
        mock_db = MagicMock()
        mock_token = MagicMock()
        mock_token.access_token = "xoxb-test-token"
        mock_token.organization_id = uuid4()

        agent_id = uuid4()
        mock_agent = MagicMock()
        mock_agent.id = agent_id
        mock_agent.name = "Test Agent"
        mock_agent.display_name = "Display Name"

        mock_existing_config = MagicMock()
        mock_existing_config.id = 1

        payload = {
            "view": {
                "callback_id": "cm_agent_selected",
                "private_metadata": json.dumps({"channel_id": "C12345", "channel_name": "general"}),
                "state": {
                    "values": {
                        "agent_picker": {
                            "agent_selection": {
                                "selected_option": {"value": str(agent_id)}
                            }
                        },
                        "respond_mentions": {
                            "mentions_check": {"selected_options": []}
                        },
                        "respond_commands": {
                            "commands_check": {"selected_options": [{"value": "yes"}]}
                        }
                    }
                }
            }
        }

        with patch('app.services.slack_chat.SlackRepository') as mock_slack_repo_class, \
             patch('app.services.slack_chat.AgentRepository') as mock_agent_repo_class, \
             patch('app.services.slack_chat.slack_service') as mock_slack_service:

            mock_slack_repo = MagicMock()
            mock_slack_repo.get_token_by_team.return_value = mock_token
            mock_slack_repo.get_config_by_channel.return_value = mock_existing_config
            mock_slack_repo_class.return_value = mock_slack_repo

            mock_agent_repo = MagicMock()
            mock_agent_repo.get_by_id.return_value = mock_agent
            mock_agent_repo_class.return_value = mock_agent_repo

            mock_slack_service.send_message = AsyncMock()

            result = await handle_view_submission(payload, "T12345", mock_db)

            # Should update existing config
            mock_slack_repo.update_agent_config.assert_called_once()
            # Should return None (success)
            assert result is None

    @pytest.mark.asyncio
    async def test_view_submission_no_agent_selected(self):
        """Test view submission with no agent selected returns error"""
        mock_db = MagicMock()

        payload = {
            "view": {
                "callback_id": "cm_agent_selected",
                "private_metadata": json.dumps({"channel_id": "C12345"}),
                "state": {
                    "values": {
                        "agent_picker": {
                            "agent_selection": {
                                "selected_option": None
                            }
                        }
                    }
                }
            }
        }

        result = await handle_view_submission(payload, "T12345", mock_db)

        # Should return error response
        assert result is not None
        assert result["response_action"] == "errors"
        assert "agent_picker" in result["errors"]

    @pytest.mark.asyncio
    async def test_view_submission_unknown_callback(self):
        """Test view submission with unknown callback_id"""
        mock_db = MagicMock()

        payload = {
            "view": {
                "callback_id": "unknown_callback",
                "private_metadata": "{}",
                "state": {"values": {}}
            }
        }

        result = await handle_view_submission(payload, "T12345", mock_db)

        # Should return None (no action taken)
        assert result is None


class TestBuildAgentSelectionModalDisplayName:
    """Tests for build_agent_selection_modal with display_name"""

    def test_build_modal_uses_display_name(self):
        """Test modal uses display_name when available"""
        agent1 = MagicMock()
        agent1.id = uuid4()
        agent1.name = "Internal Name"
        agent1.display_name = "Customer Facing Name"

        agent2 = MagicMock()
        agent2.id = uuid4()
        agent2.name = "Agent Two"
        agent2.display_name = None  # Falls back to name

        mock_agents = [agent1, agent2]

        modal = build_agent_selection_modal(
            channel_id="C12345",
            channel_name="test",
            agents=mock_agents
        )

        # Find the agent picker block
        agent_picker = None
        for block in modal["blocks"]:
            if block.get("block_id") == "agent_picker":
                agent_picker = block
                break

        assert agent_picker is not None
        options = agent_picker["element"]["options"]
        assert options[0]["text"]["text"] == "Customer Facing Name"
        assert options[1]["text"]["text"] == "Agent Two"

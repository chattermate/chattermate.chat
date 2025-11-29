"""
ChatterMate - Test Slack Service
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
import hmac
import hashlib
import time
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.slack import SlackService, SlackAuthError, SlackAPIError


@pytest.fixture
def slack_service():
    """Create a SlackService instance with mocked settings"""
    with patch('app.services.slack.settings') as mock_settings:
        mock_settings.SLACK_CLIENT_ID = "test_client_id"
        mock_settings.SLACK_CLIENT_SECRET = "test_client_secret"
        mock_settings.SLACK_SIGNING_SECRET = "test_signing_secret"
        mock_settings.BACKEND_URL = "https://test.example.com"

        service = SlackService()
        return service


class TestSlackServiceSignatureVerification:
    """Tests for Slack signature verification"""

    def test_verify_signature_valid(self, slack_service):
        """Test valid signature verification"""
        timestamp = str(int(time.time()))
        body = b'{"test": "data"}'

        # Generate valid signature
        sig_basestring = f"v0:{timestamp}:{body.decode('utf-8')}"
        signature = "v0=" + hmac.new(
            b"test_signing_secret",
            sig_basestring.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        result = slack_service.verify_signature(body, timestamp, signature)
        assert result is True

    def test_verify_signature_invalid(self, slack_service):
        """Test invalid signature verification"""
        timestamp = str(int(time.time()))
        body = b'{"test": "data"}'

        result = slack_service.verify_signature(body, timestamp, "v0=invalid_signature")
        assert result is False

    def test_verify_signature_expired_timestamp(self, slack_service):
        """Test expired timestamp rejection"""
        # Timestamp from 10 minutes ago
        timestamp = str(int(time.time()) - 600)
        body = b'{"test": "data"}'

        result = slack_service.verify_signature(body, timestamp, "v0=some_signature")
        assert result is False

    def test_verify_signature_missing_params(self, slack_service):
        """Test missing parameters"""
        result = slack_service.verify_signature(b'', '', '')
        assert result is False


class TestSlackServiceAuthorization:
    """Tests for Slack OAuth authorization"""

    def test_get_authorization_url(self, slack_service):
        """Test authorization URL generation"""
        state = "test_state_123"
        url = slack_service.get_authorization_url(state)

        assert "https://slack.com/oauth/v2/authorize" in url
        assert "client_id=test_client_id" in url
        assert "state=test_state_123" in url
        assert "scope=" in url

    @pytest.mark.asyncio
    async def test_exchange_code_for_token_success(self, slack_service):
        """Test successful token exchange"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "ok": True,
            "access_token": "xoxb-test-token",
            "bot_user_id": "U12345",
            "team": {"id": "T12345", "name": "Test Team"},
            "authed_user": {"id": "U67890"},
            "scope": "chat:write,commands"
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_instance

            result = await slack_service.exchange_code_for_token("test_code")

            assert result["access_token"] == "xoxb-test-token"
            assert result["bot_user_id"] == "U12345"
            assert result["team_id"] == "T12345"
            assert result["team_name"] == "Test Team"

    @pytest.mark.asyncio
    async def test_exchange_code_for_token_failure(self, slack_service):
        """Test failed token exchange"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "ok": False,
            "error": "invalid_code"
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_instance

            with pytest.raises(SlackAuthError) as exc_info:
                await slack_service.exchange_code_for_token("invalid_code")

            assert "invalid_code" in str(exc_info.value)


class TestSlackServiceMessaging:
    """Tests for Slack messaging methods"""

    @pytest.mark.asyncio
    async def test_send_message_success(self, slack_service):
        """Test successful message sending"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "ok": True,
            "ts": "1234567890.123456",
            "channel": "C12345"
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            result = await slack_service.send_message(
                access_token="xoxb-test-token",
                channel="C12345",
                text="Hello, World!",
                thread_ts="1234567890.000000"
            )

            assert result["ok"] is True
            assert result["ts"] == "1234567890.123456"

    @pytest.mark.asyncio
    async def test_send_message_failure(self, slack_service):
        """Test failed message sending"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "ok": False,
            "error": "channel_not_found"
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            with pytest.raises(SlackAPIError) as exc_info:
                await slack_service.send_message(
                    access_token="xoxb-test-token",
                    channel="invalid_channel",
                    text="Hello, World!"
                )

            assert "channel_not_found" in str(exc_info.value)


class TestSlackServiceConversations:
    """Tests for Slack conversation methods"""

    @pytest.mark.asyncio
    async def test_get_conversations_list(self, slack_service):
        """Test getting conversations list"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "ok": True,
            "channels": [
                {"id": "C12345", "name": "general", "is_member": True},
                {"id": "C67890", "name": "random", "is_member": False}
            ]
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            result = await slack_service.get_conversations_list("xoxb-test-token")

            assert len(result) == 2
            assert result[0]["name"] == "general"

    @pytest.mark.asyncio
    async def test_auth_test(self, slack_service):
        """Test auth.test method"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "ok": True,
            "user_id": "U12345",
            "team_id": "T12345"
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post = AsyncMock(return_value=mock_response)
            mock_client.return_value.__aenter__.return_value = mock_instance

            result = await slack_service.auth_test("xoxb-test-token")

            assert result["ok"] is True
            assert result["user_id"] == "U12345"

    @pytest.mark.asyncio
    async def test_auth_test_invalid_token(self, slack_service):
        """Test auth.test with invalid token"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "ok": False,
            "error": "invalid_auth"
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post = AsyncMock(return_value=mock_response)
            mock_client.return_value.__aenter__.return_value = mock_instance

            with pytest.raises(SlackAuthError):
                await slack_service.auth_test("invalid_token")


class TestSlackServiceAssistant:
    """Tests for Slack AI Assistant methods"""

    @pytest.mark.asyncio
    async def test_set_assistant_status(self, slack_service):
        """Test setting assistant status"""
        mock_response = MagicMock()
        mock_response.json.return_value = {"ok": True}

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            result = await slack_service.set_assistant_status(
                access_token="xoxb-test-token",
                channel="D12345",
                thread_ts="1234567890.123456",
                status="is thinking..."
            )

            assert result["ok"] is True

    @pytest.mark.asyncio
    async def test_set_suggested_prompts(self, slack_service):
        """Test setting suggested prompts"""
        mock_response = MagicMock()
        mock_response.json.return_value = {"ok": True}

        prompts = [
            {"title": "Ask Sales Agent", "message": "Hi! I'd like to chat with Sales Agent"},
            {"title": "Ask Support", "message": "Hi! I'd like to chat with Support"}
        ]

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            result = await slack_service.set_suggested_prompts(
                access_token="xoxb-test-token",
                channel="D12345",
                thread_ts="1234567890.123456",
                prompts=prompts,
                title="Choose an agent:"
            )

            assert result["ok"] is True

    @pytest.mark.asyncio
    async def test_publish_home_view(self, slack_service):
        """Test publishing home view"""
        mock_response = MagicMock()
        mock_response.json.return_value = {"ok": True}

        view = {
            "type": "home",
            "blocks": [
                {"type": "section", "text": {"type": "mrkdwn", "text": "Welcome!"}}
            ]
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            result = await slack_service.publish_home_view(
                access_token="xoxb-test-token",
                user_id="U12345",
                view=view
            )

            assert result["ok"] is True

    @pytest.mark.asyncio
    async def test_publish_home_view_failure(self, slack_service):
        """Test publish home view failure"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "ok": False,
            "error": "invalid_blocks"
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            with pytest.raises(SlackAPIError) as exc_info:
                await slack_service.publish_home_view(
                    access_token="xoxb-test-token",
                    user_id="U12345",
                    view={"type": "home", "blocks": []}
                )

            assert "invalid_blocks" in str(exc_info.value)


class TestSlackServiceViews:
    """Tests for Slack views methods"""

    @pytest.mark.asyncio
    async def test_open_view(self, slack_service):
        """Test opening a modal view"""
        mock_response = MagicMock()
        mock_response.json.return_value = {"ok": True}

        view = {
            "type": "modal",
            "title": {"type": "plain_text", "text": "Test Modal"},
            "blocks": []
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            result = await slack_service.open_view(
                access_token="xoxb-test-token",
                trigger_id="12345.67890",
                view=view
            )

            assert result["ok"] is True

    @pytest.mark.asyncio
    async def test_auth_revoke(self, slack_service):
        """Test token revocation"""
        mock_response = MagicMock()
        mock_response.json.return_value = {"ok": True, "revoked": True}

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            result = await slack_service.auth_revoke("xoxb-test-token")

            assert result is True

    @pytest.mark.asyncio
    async def test_auth_revoke_failure(self, slack_service):
        """Test token revocation failure"""
        mock_response = MagicMock()
        mock_response.json.return_value = {"ok": False, "error": "token_revoked"}

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )

            result = await slack_service.auth_revoke("invalid_token")

            # Should return False but not raise
            assert result is False


class TestSlackServiceAdditionalMethods:
    """Additional tests for Slack service methods"""

    @pytest.mark.asyncio
    async def test_exchange_code_non_200_status(self, slack_service):
        """Test token exchange with non-200 status code"""
        mock_response = MagicMock()
        mock_response.status_code = 500

        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_instance

            with pytest.raises(SlackAuthError) as exc_info:
                await slack_service.exchange_code_for_token("test_code")

            assert "Failed to exchange code" in str(exc_info.value)

    def test_verify_signature_missing_signing_secret(self):
        """Test signature verification with missing signing secret"""
        with patch('app.services.slack.settings') as mock_settings:
            mock_settings.SLACK_CLIENT_ID = "test_client_id"
            mock_settings.SLACK_CLIENT_SECRET = "test_client_secret"
            mock_settings.SLACK_SIGNING_SECRET = None
            mock_settings.BACKEND_URL = "https://test.example.com"

            service = SlackService()
            result = service.verify_signature(b'test', '12345', 'v0=signature')
            assert result is False

    def test_verify_signature_invalid_timestamp(self, slack_service):
        """Test signature verification with invalid timestamp"""
        result = slack_service.verify_signature(b'test', 'invalid', 'v0=signature')
        assert result is False

    @pytest.mark.asyncio
    async def test_respond_to_response_url_success(self, slack_service):
        """Test responding to response URL"""
        mock_response = MagicMock()
        mock_response.status_code = 200

        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_instance

            result = await slack_service.respond_to_response_url(
                response_url="https://hooks.slack.com/response",
                text="Test message",
                response_type="ephemeral"
            )

            assert result is True

    @pytest.mark.asyncio
    async def test_respond_to_response_url_with_blocks(self, slack_service):
        """Test responding to response URL with blocks"""
        mock_response = MagicMock()
        mock_response.status_code = 200

        blocks = [{"type": "section", "text": {"type": "mrkdwn", "text": "Test"}}]

        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_instance

            result = await slack_service.respond_to_response_url(
                response_url="https://hooks.slack.com/response",
                text="Test message",
                blocks=blocks,
                replace_original=True
            )

            assert result is True

    @pytest.mark.asyncio
    async def test_respond_to_response_url_failure(self, slack_service):
        """Test responding to response URL failure"""
        mock_response = MagicMock()
        mock_response.status_code = 500

        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_instance

            result = await slack_service.respond_to_response_url(
                response_url="https://hooks.slack.com/response",
                text="Test message"
            )

            assert result is False

    @pytest.mark.asyncio
    async def test_get_conversation_info_success(self, slack_service):
        """Test getting conversation info"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "ok": True,
            "channel": {
                "id": "C12345",
                "name": "general",
                "is_channel": True
            }
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_instance.get.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_instance

            result = await slack_service.get_conversation_info(
                access_token="xoxb-test-token",
                channel_id="C12345"
            )

            assert result["id"] == "C12345"
            assert result["name"] == "general"

    @pytest.mark.asyncio
    async def test_get_conversation_info_failure(self, slack_service):
        """Test getting conversation info failure"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "ok": False,
            "error": "channel_not_found"
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_instance.get.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_instance

            with pytest.raises(SlackAPIError) as exc_info:
                await slack_service.get_conversation_info(
                    access_token="xoxb-test-token",
                    channel_id="invalid"
                )

            assert "channel_not_found" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_get_conversations_list_failure(self, slack_service):
        """Test getting conversations list failure"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "ok": False,
            "error": "invalid_auth"
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_instance.get.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_instance

            with pytest.raises(SlackAPIError) as exc_info:
                await slack_service.get_conversations_list("invalid_token")

            assert "invalid_auth" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_open_view_failure(self, slack_service):
        """Test opening view failure"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "ok": False,
            "error": "trigger_expired"
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_instance

            with pytest.raises(SlackAPIError) as exc_info:
                await slack_service.open_view(
                    access_token="xoxb-test-token",
                    trigger_id="12345",
                    view={"type": "modal"}
                )

            assert "trigger_expired" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_get_permalink_success(self, slack_service):
        """Test getting message permalink"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "ok": True,
            "permalink": "https://team.slack.com/archives/C12345/p1234567890"
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_instance.get.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_instance

            result = await slack_service.get_permalink(
                access_token="xoxb-test-token",
                channel="C12345",
                message_ts="1234567890.123456"
            )

            assert result == "https://team.slack.com/archives/C12345/p1234567890"

    @pytest.mark.asyncio
    async def test_get_permalink_failure(self, slack_service):
        """Test getting message permalink failure"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "ok": False,
            "error": "message_not_found"
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_instance.get.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_instance

            result = await slack_service.get_permalink(
                access_token="xoxb-test-token",
                channel="C12345",
                message_ts="invalid"
            )

            assert result is None

    @pytest.mark.asyncio
    async def test_set_assistant_status_failure(self, slack_service):
        """Test setting assistant status failure (should not raise)"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "ok": False,
            "error": "not_in_assistant_channel"
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_instance

            # Should not raise, just return the response
            result = await slack_service.set_assistant_status(
                access_token="xoxb-test-token",
                channel="C12345",
                thread_ts="12345",
                status="thinking"
            )

            assert result["ok"] is False

    @pytest.mark.asyncio
    async def test_set_suggested_prompts_failure(self, slack_service):
        """Test setting suggested prompts failure"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "ok": False,
            "error": "invalid_prompts"
        }

        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_instance

            result = await slack_service.set_suggested_prompts(
                access_token="xoxb-test-token",
                channel="C12345",
                thread_ts="12345",
                prompts=[],
                title="Test"
            )

            assert result["ok"] is False

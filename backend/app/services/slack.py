"""
ChatterMate - Slack Service
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

import hmac
import hashlib
import time
from typing import Dict, Any, Optional, List
from urllib.parse import urlencode

import httpx
from fastapi import Request

from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)


class SlackAuthError(Exception):
    """Custom exception for Slack authentication errors."""
    pass


class SlackAPIError(Exception):
    """Custom exception for Slack API errors."""
    pass


class SlackService:
    """Service for handling Slack OAuth 2.0 flow and API interactions."""

    # Slack OAuth and API URLs
    OAUTH_AUTHORIZE_URL = "https://slack.com/oauth/v2/authorize"
    OAUTH_ACCESS_URL = "https://slack.com/api/oauth.v2.access"
    API_BASE_URL = "https://slack.com/api"

    # Required OAuth scopes (privacy-focused for App Store approval)
    SCOPES = [
        "app_mentions:read",  # Receive @mentions
        "channels:read",  # List public channels bot is in
        "chat:write",  # Send messages (bot must be added to channel)
        "commands",  # Slash commands
        "groups:read",  # List private channels bot is in
        "im:history",  # Read DM history (for context in DMs only)
    ]

    def __init__(self):
        self.client_id = settings.SLACK_CLIENT_ID
        self.client_secret = settings.SLACK_CLIENT_SECRET
        self.signing_secret = settings.SLACK_SIGNING_SECRET
        self.redirect_uri = settings.SLACK_REDIRECT_URI

    def get_authorization_url(self, state: str) -> str:
        """
        Generate the authorization URL for Slack OAuth flow.

        Args:
            state: State parameter for CSRF protection (should include org_id)

        Returns:
            Authorization URL to redirect user to
        """
        params = {
            "client_id": self.client_id,
            "scope": ",".join(self.SCOPES),
            "redirect_uri": self.redirect_uri,
            "state": state,
        }
        return f"{self.OAUTH_AUTHORIZE_URL}?{urlencode(params)}"

    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """
        Exchange authorization code for access token.

        Args:
            code: Authorization code from Slack callback

        Returns:
            Dict containing access_token, bot_user_id, team info, etc.

        Raises:
            SlackAuthError: If token exchange fails
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.OAUTH_ACCESS_URL,
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "redirect_uri": self.redirect_uri,
                }
            )

            if response.status_code != 200:
                logger.error(f"Slack OAuth failed with status {response.status_code}")
                raise SlackAuthError("Failed to exchange code for token")

            data = response.json()

            if not data.get("ok"):
                error = data.get("error", "unknown_error")
                logger.error(f"Slack OAuth error: {error}")
                raise SlackAuthError(f"Slack OAuth failed: {error}")

            return {
                "access_token": data["access_token"],
                "bot_user_id": data["bot_user_id"],
                "team_id": data["team"]["id"],
                "team_name": data["team"]["name"],
                "authed_user_id": data.get("authed_user", {}).get("id"),
                "scope": data.get("scope"),
            }

    def verify_signature(self, request_body: bytes, timestamp: str, signature: str) -> bool:
        """
        Verify Slack request signature.

        Args:
            request_body: Raw request body bytes
            timestamp: X-Slack-Request-Timestamp header
            signature: X-Slack-Signature header

        Returns:
            True if signature is valid, False otherwise
        """
        if not self.signing_secret:
            logger.error("Slack signing secret not configured")
            return False

        # Check timestamp to prevent replay attacks (within 5 minutes)
        try:
            request_time = int(timestamp)
            current_time = int(time.time())
            if abs(current_time - request_time) > 300:
                logger.warning("Slack request timestamp too old")
                return False
        except ValueError:
            logger.error("Invalid Slack request timestamp")
            return False

        # Compute expected signature
        sig_basestring = f"v0:{timestamp}:{request_body.decode('utf-8')}"
        expected_signature = "v0=" + hmac.new(
            self.signing_secret.encode(),
            sig_basestring.encode(),
            hashlib.sha256
        ).hexdigest()

        # Compare signatures (timing-safe)
        return hmac.compare_digest(expected_signature, signature)

    async def verify_request(self, request: Request) -> bool:
        """
        Verify incoming Slack request using signature verification.

        Args:
            request: FastAPI Request object

        Returns:
            True if request is valid, False otherwise
        """
        timestamp = request.headers.get("X-Slack-Request-Timestamp", "")
        signature = request.headers.get("X-Slack-Signature", "")

        if not timestamp or not signature:
            logger.warning("Missing Slack signature headers")
            return False

        body = await request.body()
        return self.verify_signature(body, timestamp, signature)

    async def send_message(
        self,
        access_token: str,
        channel: str,
        text: str,
        thread_ts: Optional[str] = None,
        blocks: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """
        Send a message to a Slack channel.

        Args:
            access_token: Bot OAuth token
            channel: Channel ID to send to
            text: Message text (fallback for notifications)
            thread_ts: Optional thread timestamp to reply in thread
            blocks: Optional Block Kit blocks for rich formatting

        Returns:
            Slack API response

        Raises:
            SlackAPIError: If sending fails
        """
        payload = {
            "channel": channel,
            "text": text,
        }

        if thread_ts:
            payload["thread_ts"] = thread_ts

        if blocks:
            payload["blocks"] = blocks

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.API_BASE_URL}/chat.postMessage",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                },
                json=payload
            )

            data = response.json()

            if not data.get("ok"):
                error = data.get("error", "unknown_error")
                logger.error(f"Slack chat.postMessage failed: {error}")
                raise SlackAPIError(f"Failed to send message: {error}")

            return data

    async def post_ephemeral(
        self,
        access_token: str,
        channel: str,
        user: str,
        text: str,
        thread_ts: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send an ephemeral message visible only to one user.

        Args:
            access_token: Bot OAuth token
            channel: Channel ID
            user: User ID to show message to
            text: Message text
            thread_ts: Optional thread timestamp

        Returns:
            Slack API response
        """
        payload = {
            "channel": channel,
            "user": user,
            "text": text,
        }

        if thread_ts:
            payload["thread_ts"] = thread_ts

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.API_BASE_URL}/chat.postEphemeral",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                },
                json=payload
            )

            data = response.json()

            if not data.get("ok"):
                error = data.get("error", "unknown_error")
                logger.error(f"Slack chat.postEphemeral failed: {error}")
                raise SlackAPIError(f"Failed to send ephemeral message: {error}")

            return data

    async def get_conversations_list(
        self,
        access_token: str,
        types: str = "public_channel,private_channel"
    ) -> List[Dict[str, Any]]:
        """
        Get list of channels the bot is a member of.

        Args:
            access_token: Bot OAuth token
            types: Channel types to include

        Returns:
            List of channel objects
        """
        channels = []
        cursor = None

        async with httpx.AsyncClient() as client:
            while True:
                params = {
                    "types": types,
                    "exclude_archived": "true",
                    "limit": 200,
                }
                if cursor:
                    params["cursor"] = cursor

                response = await client.get(
                    f"{self.API_BASE_URL}/conversations.list",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                    },
                    params=params
                )

                data = response.json()

                if not data.get("ok"):
                    error = data.get("error", "unknown_error")
                    logger.error(f"Slack conversations.list failed: {error}")
                    raise SlackAPIError(f"Failed to get channels: {error}")

                channels.extend(data.get("channels", []))

                # Check for pagination
                cursor = data.get("response_metadata", {}).get("next_cursor")
                if not cursor:
                    break

        return channels

    async def get_conversation_info(
        self,
        access_token: str,
        channel_id: str
    ) -> Dict[str, Any]:
        """
        Get information about a channel.

        Args:
            access_token: Bot OAuth token
            channel_id: Channel ID

        Returns:
            Channel info object
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.API_BASE_URL}/conversations.info",
                headers={
                    "Authorization": f"Bearer {access_token}",
                },
                params={"channel": channel_id}
            )

            data = response.json()

            if not data.get("ok"):
                error = data.get("error", "unknown_error")
                logger.error(f"Slack conversations.info failed: {error}")
                raise SlackAPIError(f"Failed to get channel info: {error}")

            return data.get("channel", {})

    async def respond_to_response_url(
        self,
        response_url: str,
        text: str,
        response_type: str = "ephemeral",
        replace_original: bool = False
    ) -> bool:
        """
        Respond to a slash command or interaction using response_url.

        Args:
            response_url: URL provided by Slack for delayed responses
            text: Message text
            response_type: 'ephemeral' or 'in_channel'
            replace_original: Whether to replace original message

        Returns:
            True if successful
        """
        payload = {
            "text": text,
            "response_type": response_type,
            "replace_original": replace_original,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(response_url, json=payload)
            return response.status_code == 200

    async def get_permalink(
        self,
        access_token: str,
        channel: str,
        message_ts: str
    ) -> Optional[str]:
        """
        Get permalink for a message.

        Args:
            access_token: Bot OAuth token
            channel: Channel ID
            message_ts: Message timestamp

        Returns:
            Permalink URL or None
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.API_BASE_URL}/chat.getPermalink",
                headers={
                    "Authorization": f"Bearer {access_token}",
                },
                params={
                    "channel": channel,
                    "message_ts": message_ts,
                }
            )

            data = response.json()

            if data.get("ok"):
                return data.get("permalink")

            return None

    async def auth_test(self, access_token: str) -> Dict[str, Any]:
        """
        Test authentication and get bot info.

        Args:
            access_token: Bot OAuth token

        Returns:
            Auth test response with bot/team info
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.API_BASE_URL}/auth.test",
                headers={
                    "Authorization": f"Bearer {access_token}",
                }
            )

            data = response.json()

            if not data.get("ok"):
                error = data.get("error", "unknown_error")
                logger.error(f"Slack auth.test failed: {error}")
                raise SlackAuthError(f"Auth test failed: {error}")

            return data

    async def open_view(
        self,
        access_token: str,
        trigger_id: str,
        view: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Open a modal view.

        Args:
            access_token: Bot OAuth token
            trigger_id: Trigger ID from interaction payload
            view: Modal view definition

        Returns:
            Slack API response
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.API_BASE_URL}/views.open",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                },
                json={
                    "trigger_id": trigger_id,
                    "view": view
                }
            )

            data = response.json()

            if not data.get("ok"):
                error = data.get("error", "unknown_error")
                logger.error(f"Slack views.open failed: {error}")
                raise SlackAPIError(f"Failed to open view: {error}")

            return data

    async def set_assistant_status(
        self,
        access_token: str,
        channel: str,
        thread_ts: str,
        status: str
    ) -> Dict[str, Any]:
        """
        Set assistant status in an AI assistant thread (e.g., 'is thinking...').

        This is used for Slack's Agents & AI Apps feature to show
        a status indicator while the bot is processing.

        Args:
            access_token: Bot OAuth token
            channel: Channel ID of the assistant thread
            thread_ts: Thread timestamp
            status: Status text to display (e.g., "is thinking...")

        Returns:
            Slack API response
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.API_BASE_URL}/assistant.threads.setStatus",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                },
                json={
                    "channel_id": channel,
                    "thread_ts": thread_ts,
                    "status": status
                }
            )

            data = response.json()

            if not data.get("ok"):
                error = data.get("error", "unknown_error")
                logger.debug(f"Slack assistant.threads.setStatus: {error}")
                # Don't raise - status is optional functionality

            return data

    async def set_suggested_prompts(
        self,
        access_token: str,
        channel: str,
        thread_ts: str,
        prompts: list,
        title: str = None
    ) -> Dict[str, Any]:
        """
        Set suggested prompts in an AI assistant thread.

        Args:
            access_token: Bot OAuth token
            channel: Channel ID of the assistant thread
            thread_ts: Thread timestamp
            prompts: List of prompt objects with 'title' and 'message' keys (max 4)
            title: Optional title for the prompt list

        Returns:
            Slack API response
        """
        async with httpx.AsyncClient() as client:
            payload = {
                "channel_id": channel,
                "thread_ts": thread_ts,
                "prompts": prompts[:4]  # Max 4 prompts
            }
            if title:
                payload["title"] = title

            response = await client.post(
                f"{self.API_BASE_URL}/assistant.threads.setSuggestedPrompts",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                },
                json=payload
            )

            data = response.json()

            if not data.get("ok"):
                error = data.get("error", "unknown_error")
                logger.debug(f"Slack assistant.threads.setSuggestedPrompts: {error}")

            return data

    async def auth_revoke(self, access_token: str) -> bool:
        """
        Revoke the access token and uninstall the app from the workspace.

        Args:
            access_token: Bot OAuth token to revoke

        Returns:
            True if revocation was successful
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.API_BASE_URL}/auth.revoke",
                headers={
                    "Authorization": f"Bearer {access_token}",
                }
            )

            data = response.json()

            if not data.get("ok"):
                error = data.get("error", "unknown_error")
                logger.warning(f"Slack auth.revoke failed: {error}")
                # Don't raise - we still want to clean up local data even if revoke fails
                return False

            logger.info("Slack token revoked successfully")
            return True


# Singleton instance
slack_service = SlackService()

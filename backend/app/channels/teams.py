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

import json
import time
from datetime import datetime, timezone
from typing import ClassVar, List, Optional

import httpx
import jwt

from app.channels.base import ChannelAdapter, InboundMessage, SendResult
from app.channels.registry import register_adapter
from app.core.logger import get_logger
from app.core.security import decrypt_api_key
from app.models.channels import ChannelAccount, ChannelConversation, ChannelType

logger = get_logger(__name__)

# Bot Framework Connector auth endpoints (see Microsoft Bot Framework docs).
BOT_JWKS_URL = "https://login.botframework.com/v1/.well-known/keys"
BOT_TOKEN_ISSUER = "https://api.botframework.com"
BOT_TOKEN_URL = "https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token"
BOT_TOKEN_SCOPE = "https://api.botframework.com/.default"
MAX_MESSAGE_LENGTH = 28000  # Teams hard limit is 40k; stay comfortably under
REQUEST_TIMEOUT_SECONDS = 15.0
# Bot Framework tokens are short-lived; allow small clock drift vs. Microsoft.
JWT_LEEWAY_SECONDS = 300

_http_client: Optional[httpx.AsyncClient] = None
# Reuse one JWKS client so Microsoft's signing keys are fetched+cached once.
_jwks_client: Optional[jwt.PyJWKClient] = None
# Cache outbound Connector tokens per app id: {app_id: (token, expires_at)}.
_outbound_tokens: dict = {}


def _get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS)
    return _http_client


def _get_jwks_client() -> jwt.PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = jwt.PyJWKClient(BOT_JWKS_URL)
    return _jwks_client


async def request_connector_token(app_id: str, app_password: str) -> Optional[str]:
    """Request a Bot Connector client-credentials token; None if the Azure AD
    app id / secret are invalid. Used to validate credentials on connect."""
    try:
        response = await _get_http_client().post(BOT_TOKEN_URL, data={
            "grant_type": "client_credentials",
            "client_id": app_id,
            "client_secret": app_password,
            "scope": BOT_TOKEN_SCOPE,
        })
        if response.status_code != 200:
            logger.warning(f"Teams credential validation failed: HTTP {response.status_code}")
            return None
        return response.json().get("access_token")
    except Exception as e:
        logger.error(f"Teams credential validation error: {e}")
        return None


class TeamsAdapter(ChannelAdapter):
    """Microsoft Teams as a customer/employee messaging channel via the Bot
    Framework. Inbound Activities are authenticated with the Connector's JWT;
    replies are posted back to the Activity's serviceUrl with a client-
    credentials token minted from the org's Azure AD app id + secret."""

    channel_type: ClassVar[str] = ChannelType.TEAMS.value

    async def verify_webhook(self, headers: dict, raw_body: bytes, account: Optional[ChannelAccount]) -> bool:
        """Validate the Bot Connector JWT (RS256) and confirm its audience is
        this account's app id. Fails closed on any error."""
        if account is None:
            return False
        auth = headers.get("authorization", "")
        if not auth.lower().startswith("bearer "):
            return False
        token = auth.split(" ", 1)[1]
        try:
            signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
            claims = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=self._app_id(account),
                issuer=BOT_TOKEN_ISSUER,
                leeway=JWT_LEEWAY_SECONDS,
            )
        except Exception as e:
            logger.warning(f"Teams JWT validation failed: {e}")
            return False

        # Bot Framework spec: the token's serviceurl claim must match the
        # activity's serviceUrl. Without this, a replayed valid token carrying a
        # substituted serviceUrl would redirect our authenticated reply (bearing
        # the bot's Connector token) to an attacker-controlled host.
        claim_url = (claims.get("serviceurl") or "").rstrip("/")
        if claim_url:
            try:
                body_url = (json.loads(raw_body).get("serviceUrl") or "").rstrip("/")
            except (ValueError, AttributeError):
                return False
            if body_url != claim_url:
                logger.warning("Teams serviceUrl does not match the token's serviceurl claim")
                return False
        return True

    def parse_inbound(self, payload: dict) -> List[InboundMessage]:
        """Normalize a Bot Framework Activity. Only user 'message' activities
        become InboundMessages; typing/conversationUpdate/etc. are ignored."""
        if payload.get("type") != "message":
            return []
        text = (payload.get("text") or "").strip()
        conversation = payload.get("conversation") or {}
        sender = payload.get("from") or {}
        if not text or "id" not in conversation:
            return []

        timestamp = None
        raw_ts = payload.get("timestamp")
        if raw_ts:
            try:
                timestamp = datetime.fromisoformat(raw_ts.replace("Z", "+00:00"))
            except (ValueError, TypeError):
                timestamp = datetime.now(timezone.utc)

        return [InboundMessage(
            external_account_id=payload.get("recipient", {}).get("id", ""),
            external_conversation_id=str(conversation["id"]),
            external_user_id=str(sender.get("id", conversation["id"])),
            external_message_id=str(payload.get("id", "")),
            text=text,
            # serviceUrl is per-conversation and required to reply; stash it so
            # conversation_state persists it on the conversation.
            profile={"name": sender.get("name"), "service_url": payload.get("serviceUrl")},
            timestamp=timestamp,
        )]

    def conversation_state(self, inbound: InboundMessage) -> dict:
        service_url = (inbound.profile or {}).get("service_url")
        return {"service_url": service_url} if service_url else {}

    async def send_text(self, account: ChannelAccount, conversation: ChannelConversation, text: str) -> SendResult:
        service_url = (conversation.extra or {}).get("service_url")
        if not service_url:
            return SendResult(ok=False, error="No Teams serviceUrl recorded for this conversation")
        try:
            token = await self._outbound_token(account)
        except Exception as e:
            logger.error(f"Teams token acquisition failed: {e}")
            return SendResult(ok=False, error=str(e))

        url = (f"{service_url.rstrip('/')}/v3/conversations/"
               f"{conversation.external_conversation_id}/activities")
        try:
            response = await _get_http_client().post(
                url,
                headers={"Authorization": f"Bearer {token}"},
                json={"type": "message", "text": text},
            )
            if response.status_code >= 300:
                return SendResult(ok=False, error=f"HTTP {response.status_code}: {response.text[:200]}")
            # A 2xx with an empty/non-JSON body is still a successful send.
            try:
                message_id = str((response.json() or {}).get("id", ""))
            except ValueError:
                message_id = ""
            return SendResult(ok=True, external_message_id=message_id)
        except Exception as e:
            logger.error(f"Teams send failed: {e}")
            return SendResult(ok=False, error=str(e))

    def format_outbound(self, markdown: str) -> str:
        # Teams renders a useful subset of markdown; just enforce the length cap.
        return markdown[:MAX_MESSAGE_LENGTH]

    async def _outbound_token(self, account: ChannelAccount) -> str:
        """Client-credentials token for the Bot Connector, cached until expiry."""
        app_id = self._app_id(account)
        cached = _outbound_tokens.get(app_id)
        if cached and cached[1] > time.time() + 60:
            return cached[0]

        creds = self._credentials(account)
        response = await _get_http_client().post(BOT_TOKEN_URL, data={
            "grant_type": "client_credentials",
            "client_id": app_id,
            "client_secret": creds["app_password"],
            "scope": BOT_TOKEN_SCOPE,
        })
        if response.status_code != 200:
            raise RuntimeError(f"Bot token request failed: HTTP {response.status_code}")
        payload = response.json()
        token = payload["access_token"]
        _outbound_tokens[app_id] = (token, time.time() + int(payload.get("expires_in", 3600)))
        return token

    @staticmethod
    def _credentials(account: ChannelAccount) -> dict:
        return json.loads(decrypt_api_key(account.encrypted_credentials))

    @classmethod
    def _app_id(cls, account: ChannelAccount) -> str:
        return cls._credentials(account)["app_id"]


register_adapter(TeamsAdapter())

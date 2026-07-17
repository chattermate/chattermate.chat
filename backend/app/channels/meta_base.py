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

import asyncio
import hashlib
import hmac
import json
from datetime import datetime, timezone
from typing import ClassVar, Optional

import httpx

from app.channels.base import ChannelAdapter, SendResult, WindowStatus
from app.core.config import settings
from app.core.security import decrypt_api_key
from app.models.channels import ChannelAccount, ChannelConversation
from app.core.logger import get_logger

logger = get_logger(__name__)

GRAPH_BASE = "https://graph.facebook.com"
REQUEST_TIMEOUT_SECONDS = 15.0
SEND_RETRIES = 2
# Meta customer-service window: free-form replies allowed for 24h after the
# customer's last inbound message (applies to WhatsApp, Messenger and Instagram).
WINDOW_HOURS = 24

# Shared keep-alive client to graph.facebook.com (process-lifetime, like the
# Telegram adapter's) — avoids a TCP+TLS handshake per outbound message.
_http_client: Optional[httpx.AsyncClient] = None


def _get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS)
    return _http_client


def graph_url(path: str) -> str:
    return f"{GRAPH_BASE}/{settings.META_GRAPH_VERSION}/{path}"


def verify_meta_signature(raw_body: bytes, signature_header: str) -> bool:
    """Validate the X-Hub-Signature-256 header against META_APP_SECRET.

    The signature covers the raw request body; it must be checked before the
    body is parsed. Uses a constant-time comparison.
    """
    app_secret = settings.META_APP_SECRET
    if not app_secret or not signature_header:
        return False
    if not signature_header.startswith("sha256="):
        return False
    expected = hmac.new(
        app_secret.encode(), raw_body, hashlib.sha256
    ).hexdigest()
    provided = signature_header[len("sha256="):]
    return hmac.compare_digest(expected, provided)


def verify_challenge(mode: Optional[str], token: Optional[str], challenge: Optional[str]) -> Optional[str]:
    """Answer a webhook GET verification handshake.

    Returns the challenge string to echo when the subscribe token matches, else
    None (caller should 403).
    """
    if mode == "subscribe" and token and token == settings.META_WEBHOOK_VERIFY_TOKEN:
        return challenge
    return None


async def graph_post(path: str, access_token: str, payload: dict) -> SendResult:
    """POST to the Graph API with small exponential backoff on transient errors.

    Returns a SendResult; 4xx errors are terminal (no retry), network/5xx are
    retried up to SEND_RETRIES times.
    """
    url = graph_url(path)
    headers = {"Authorization": f"Bearer {access_token}"}
    last_error = "unknown error"
    for attempt in range(SEND_RETRIES + 1):
        try:
            response = await _get_http_client().post(url, json=payload, headers=headers)
            if response.status_code < 300:
                data = response.json()
                message_id = _extract_message_id(data)
                return SendResult(ok=True, external_message_id=message_id)
            # 4xx are our fault (bad token, closed window) — don't retry
            if response.status_code < 500:
                return SendResult(ok=False, error=_graph_error(response))
            last_error = _graph_error(response)
        except Exception as e:
            last_error = str(e)
        if attempt < SEND_RETRIES:
            await asyncio.sleep(0.5 * (2 ** attempt))
    return SendResult(ok=False, error=last_error)


async def _graph_request(method: str, path: str, access_token: Optional[str],
                         params: Optional[dict] = None,
                         json_body: Optional[dict] = None) -> tuple[bool, dict]:
    """Issue a Graph call and return (ok, decoded-json).

    Unlike graph_post this keeps the whole response body, for calls where the
    body is the result rather than just a message id. The token goes in the
    Authorization header so it never appears in URLs or proxy logs; pass None
    for the one endpoint that authenticates with app credentials instead. These
    are management calls, not sends, so a failure surfaces to the caller
    instead of being retried.
    """
    try:
        response = await _get_http_client().request(
            method,
            graph_url(path),
            params=params or None,
            json=json_body,
            headers={"Authorization": f"Bearer {access_token}"} if access_token else {},
        )
        return (response.status_code < 300, response.json())
    except Exception as e:
        logger.error(f"Graph {method} {path} failed: {e}")
        return (False, {"error": {"message": str(e)}})


async def graph_get(path: str, access_token: str, params: Optional[dict] = None) -> tuple[bool, dict]:
    """GET a Graph node (validating tokens during onboarding, listing templates)."""
    return await _graph_request("GET", path, access_token, params=params)


async def graph_post_json(path: str, access_token: str, payload: dict) -> tuple[bool, dict]:
    """POST to a Graph node, keeping the response body (e.g. creating a message
    template returns its id, status and category)."""
    return await _graph_request("POST", path, access_token, json_body=payload)


async def exchange_signup_code(code: str) -> tuple[bool, dict]:
    """Trade an Embedded Signup code for the customer's business access token.

    The app credentials authenticate this call, so it is the one Graph request
    that carries no bearer token. There is no redirect_uri: Embedded Signup
    hands the code back through the JS SDK rather than a redirect, so none was
    ever issued and sending one is rejected as a mismatch.
    """
    return await _graph_request("GET", "oauth/access_token", None, params={
        "client_id": settings.META_APP_ID,
        "client_secret": settings.META_APP_SECRET,
        "code": code,
    })


async def register_phone_number(phone_number_id: str, access_token: str, pin: str) -> tuple[bool, dict]:
    """Enable a number for Cloud API sending.

    A number onboarded through Embedded Signup is attached to the WABA but not
    yet usable; registering it with a two-step-verification PIN is what makes it
    able to send.
    """
    return await _graph_request("POST", f"{phone_number_id}/register", access_token,
                                json_body={"messaging_product": "whatsapp", "pin": pin})


# Template fields worth reading back from Graph; components carries the body
# text and any {{n}} variables the UI has to prompt for.
TEMPLATE_FIELDS = "name,status,category,language,components"
TEMPLATE_PAGE_LIMIT = 100
# Backstop against paging forever on a malformed cursor. Well above Meta's own
# per-WABA template ceiling, so a real account never reaches it.
TEMPLATE_MAX_PAGES = 10


async def fetch_message_templates(waba_id: str, access_token: str) -> tuple[bool, list | dict]:
    """Every template on the WABA, following Graph's cursor.

    A template that exists but isn't listed is an invisible failure — an agent
    picking one would never see it — so this pages rather than showing the
    first hundred and stopping. Returns (True, [template dicts]) or
    (False, graph error body), matching the other helpers here.
    """
    templates: list = []
    params = {"fields": TEMPLATE_FIELDS, "limit": TEMPLATE_PAGE_LIMIT}
    for _ in range(TEMPLATE_MAX_PAGES):
        ok, data = await graph_get(f"{waba_id}/message_templates", access_token, params=params)
        if not ok:
            return False, data
        page = data.get("data")
        if not isinstance(page, list):
            return False, data
        templates.extend(page)

        after = (data.get("paging") or {}).get("cursors", {}).get("after")
        if not after or len(page) < TEMPLATE_PAGE_LIMIT:
            return True, templates
        params = {**params, "after": after}

    logger.warning(f"Stopped paging templates for WABA {waba_id} at {TEMPLATE_MAX_PAGES} pages")
    return True, templates


async def subscribe_app(node_id: str, access_token: str, subscribed_fields: Optional[str] = None) -> bool:
    """Subscribe our app to a Page/WABA so its messages reach our webhook.
    Best-effort: onboarding still succeeds if this fails (can be retried)."""
    payload = {}
    if subscribed_fields:
        payload["subscribed_fields"] = subscribed_fields
    result = await graph_post(f"{node_id}/subscribed_apps", access_token, payload)
    return result.ok


def _extract_message_id(data: dict) -> Optional[str]:
    # WhatsApp: {"messages":[{"id":...}]}; Messenger/IG: {"message_id":...}
    if isinstance(data.get("messages"), list) and data["messages"]:
        return str(data["messages"][0].get("id", "")) or None
    return data.get("message_id")


def _graph_error(response: httpx.Response) -> str:
    try:
        body = response.json()
        return str(body.get("error", {}).get("message") or body)
    except Exception:
        return f"HTTP {response.status_code}"


class MetaBaseAdapter(ChannelAdapter):
    """Shared behavior for the Meta messaging channels (WhatsApp, Messenger,
    Instagram): one webhook signature scheme, one Graph client, one 24h
    customer-service window. Subclasses implement parse_inbound and send_text."""

    # What an expired window means for this channel: WhatsApp can reopen with a
    # template, Messenger/Instagram simply cannot deliver.
    expired_status: ClassVar[WindowStatus] = WindowStatus.UNDELIVERABLE

    async def verify_webhook(self, headers: dict, raw_body: bytes, account: Optional[ChannelAccount]) -> bool:
        return verify_meta_signature(raw_body, headers.get("x-hub-signature-256", ""))

    def check_delivery_window(self, conversation: ChannelConversation) -> WindowStatus:
        last_inbound = conversation.last_inbound_at
        if last_inbound is None:
            return self.expired_status
        if last_inbound.tzinfo is None:
            last_inbound = last_inbound.replace(tzinfo=timezone.utc)
        age_hours = (datetime.now(timezone.utc) - last_inbound).total_seconds() / 3600
        return WindowStatus.OK if age_hours < WINDOW_HOURS else self.expired_status

    @staticmethod
    def access_token(account: ChannelAccount) -> str:
        """Decrypt the account's Graph access token (page or WABA token)."""
        return json.loads(decrypt_api_key(account.encrypted_credentials))["access_token"]

    @staticmethod
    def _timestamp(value) -> Optional[datetime]:
        try:
            return datetime.fromtimestamp(int(value), tz=timezone.utc)
        except (TypeError, ValueError):
            return None

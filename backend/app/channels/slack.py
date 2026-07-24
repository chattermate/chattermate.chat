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

import hashlib
import hmac
import json
import re
import time
from datetime import datetime, timezone
from typing import ClassVar, List, Optional

import httpx

from app.channels.base import ChannelAdapter, InboundMessage, SendResult
from app.channels.registry import register_adapter
from app.core.config import settings
from app.core.security import decrypt_api_key
from app.models.channels import ChannelAccount, ChannelConversation, ChannelType
from app.core.logger import get_logger

logger = get_logger(__name__)

SLACK_API_BASE = "https://slack.com/api"
REQUEST_TIMEOUT_SECONDS = 15.0
# Reject webhook timestamps older than this (replay protection, per Slack docs)
MAX_SIGNATURE_AGE_SECONDS = 60 * 5
# Slack recommends keeping messages well under the 40k hard limit
MAX_MESSAGE_LENGTH = 12000

# App Home / Assistant (Agents & AI Apps) copy — kept in one place so the tone
# stays consistent across the Messages tab, the Home tab, and the sidebar.
MAX_SUGGESTED_PROMPTS = 4  # Slack caps setSuggestedPrompts at 4
ASSISTANT_READY_STATUS = "is getting ready…"
WELCOME_WITH_AGENT = (
    "Hi! I'm {agent}. 👋\n\n"
    "Ask me anything and I'll help right away — I answer from your team's "
    "knowledge and can bring in a human when you need one."
)
WELCOME_NO_AGENT = (
    "Hi! I'm ChatterMate. 👋\n\n"
    "No agent is connected to this workspace yet. Set one up in ChatterMate and "
    "I'll start answering here."
)
SUGGESTED_PROMPTS_TITLE = "Try asking:"
STARTER_PROMPTS = [
    {"title": "What can you help with?", "message": "What can you help me with?"},
    {"title": "Talk to a human", "message": "I'd like to talk to a human."},
]

_MENTION_RE = re.compile(r"<@[A-Z0-9]+>")

_http_client: Optional[httpx.AsyncClient] = None


def _get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS)
    return _http_client


async def slack_api(method: str, access_token: str, payload: dict, form: bool = False) -> dict:
    # Write methods (chat.postMessage/update) accept JSON; read/query methods
    # like users.info only read args from form-encoded params.
    kwargs = {"data": payload} if form else {"json": payload}
    response = await _get_http_client().post(
        f"{SLACK_API_BASE}/{method}",
        headers={"Authorization": f"Bearer {access_token}"},
        **kwargs,
    )
    return response.json()


# --- App Home / Assistant API wrappers (Agents & AI Apps) -------------------
# All take JSON, so they go through slack_api directly. Status and prompts are
# cosmetic — failures are logged, never raised, so a hiccup can't break the flow.

async def set_assistant_status(token: str, channel_id: str, thread_ts: str, status: str) -> dict:
    """Show a transient status line (e.g. 'is thinking…') in an assistant thread."""
    data = await slack_api("assistant.threads.setStatus", token,
                           {"channel_id": channel_id, "thread_ts": thread_ts, "status": status})
    if not data.get("ok"):
        logger.debug(f"Slack assistant.threads.setStatus: {data.get('error')}")
    return data


async def set_suggested_prompts(token: str, channel_id: str, thread_ts: str,
                                prompts: List[dict], title: Optional[str] = None) -> dict:
    """Offer starter prompts in an assistant thread. `prompts` is capped at 4."""
    payload = {"channel_id": channel_id, "thread_ts": thread_ts,
               "prompts": prompts[:MAX_SUGGESTED_PROMPTS]}
    if title:
        payload["title"] = title
    data = await slack_api("assistant.threads.setSuggestedPrompts", token, payload)
    if not data.get("ok"):
        logger.debug(f"Slack assistant.threads.setSuggestedPrompts: {data.get('error')}")
    return data


async def publish_home_view(token: str, user_id: str, view: dict) -> dict:
    """Publish the App Home (Home tab) view for one user."""
    data = await slack_api("views.publish", token, {"user_id": user_id, "view": view})
    if not data.get("ok"):
        logger.error(f"Slack views.publish failed: {data.get('error')}")
    return data


# Home-tab presentation. The card is pre-resolved by the caller (photo URL
# signed) so this stays a pure, testable Block Kit builder. Per Slack's App Home
# guidance: lead with what the app does, surface the most relevant thing (the
# connected agent), keep call-to-actions minimal, link out to settings.
HOME_INSTRUCTION_MAX = 250
_STATUS_ONLINE = ":large_green_circle: Online"
_STATUS_OFFLINE = ":white_circle: Offline"
HOME_INTRO = (
    "AI customer support, right inside Slack. @mention me in a channel and I'll "
    "answer in the thread, or send me a direct message. My answers come from your "
    "team's own knowledge, and I hand off to a human when a conversation needs one."
)
HOME_HOW_TO = (
    "*How to use me*\n"
    "• @mention *ChatterMate* in any channel — I reply in the thread\n"
    "• Send me a *direct message* for a private conversation\n"
    "• Open me from the *assistant* in the top bar for a side-by-side chat"
)
HOME_NO_AGENT = (
    "*No agent connected yet*\nConnect an agent to this workspace from the "
    "ChatterMate dashboard and I'll start answering here."
)
DASHBOARD_LINK_LABEL = "Open the ChatterMate dashboard →"


def build_home_view(agent_card: Optional[dict], dashboard_url: str) -> dict:
    """Assemble the App Home view: what the app does, the connected agent, how to
    use it, and a link to the dashboard.

    `agent_card` (or None if no agent is assigned): {"name", "is_active",
    "instruction", "photo_url" | None}.
    """
    blocks: List[dict] = [
        {"type": "header", "text": {"type": "plain_text", "text": "ChatterMate", "emoji": True}},
        {"type": "section", "text": {"type": "mrkdwn", "text": HOME_INTRO}},
        {"type": "divider"},
    ]

    if agent_card:
        status = _STATUS_ONLINE if agent_card.get("is_active") else _STATUS_OFFLINE
        header: List[dict] = []
        if agent_card.get("photo_url"):
            header.append({"type": "image", "image_url": agent_card["photo_url"],
                           "alt_text": agent_card["name"]})
        header.append({"type": "mrkdwn", "text": f"*{agent_card['name']}*  ·  {status}"})
        blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": "*Connected agent*"}})
        blocks.append({"type": "context", "elements": header})

        instruction = (agent_card.get("instruction") or "").strip()
        if instruction:
            if len(instruction) > HOME_INSTRUCTION_MAX:
                instruction = instruction[:HOME_INSTRUCTION_MAX - 1].rstrip() + "…"
            blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": instruction}})
    else:
        blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": HOME_NO_AGENT}})

    blocks.append({"type": "divider"})
    blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": HOME_HOW_TO}})
    # A markdown link, not a Block Kit button — link buttons still require
    # Interactivity to be enabled, which this app intentionally leaves off.
    blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": f"<{dashboard_url}|{DASHBOARD_LINK_LABEL}>"}})

    return {"type": "home", "blocks": blocks}


# Placeholder "typing…" message ts per (account, conversation) — set by
# send_typing, consumed by send_text which edits it into the real reply.
# In-memory is fine: a message's send_typing + send_text run in the same
# background task / worker. Each entry is (ts, created_at); stale entries are
# pruned so a bypassed send_text (e.g. AI error, empty reply) can't leak them.
_typing_placeholders: dict = {}
# A placeholder is only useful for the seconds between typing and the reply;
# anything older is a leak from a path that never called send_text.
_PLACEHOLDER_TTL_SECONDS = 300


def _prune_placeholders(now: float) -> None:
    stale = [key for key, (_, created) in _typing_placeholders.items()
             if now - created > _PLACEHOLDER_TTL_SECONDS]
    for key in stale:
        _typing_placeholders.pop(key, None)


def verify_slack_signature(headers: dict, raw_body: bytes) -> bool:
    """Validate X-Slack-Signature (v0 HMAC-SHA256 over 'v0:{ts}:{body}') with
    replay protection. Fails closed when SLACK_SIGNING_SECRET is unset."""
    signing_secret = settings.SLACK_SIGNING_SECRET
    timestamp = headers.get("x-slack-request-timestamp", "")
    signature = headers.get("x-slack-signature", "")
    if not signing_secret or not timestamp or not signature:
        return False
    try:
        if abs(time.time() - int(timestamp)) > MAX_SIGNATURE_AGE_SECONDS:
            return False
    except ValueError:
        return False
    base = f"v0:{timestamp}:".encode() + raw_body
    expected = "v0=" + hmac.new(signing_secret.encode(), base, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


class SlackAdapter(ChannelAdapter):
    """Slack as a customer messaging channel on the unified stack.

    Conversation keying: DMs to the bot use the IM channel id (one continuous
    conversation, like Telegram); @mentions in channels use `{channel}:{thread_ts}`
    so each thread is its own conversation and replies stay in-thread.
    """

    channel_type: ClassVar[str] = ChannelType.SLACK.value

    async def verify_webhook(self, headers: dict, raw_body: bytes, account: Optional[ChannelAccount]) -> bool:
        return verify_slack_signature(headers, raw_body)

    def parse_inbound(self, payload: dict) -> List[InboundMessage]:
        """Normalize an Events API callback. Handles app_mention and direct
        messages; bot echoes, edits, and other subtypes yield nothing."""
        event = payload.get("event") or {}
        event_type = event.get("type")
        team_id = payload.get("team_id", "")

        is_mention = event_type == "app_mention"
        is_dm = event_type == "message" and event.get("channel_type") == "im"
        if not (is_mention or is_dm):
            return []
        # Ignore bot messages and subtypes (edits, joins, message_changed...)
        if event.get("bot_id") or event.get("subtype"):
            return []

        text = _MENTION_RE.sub("", event.get("text") or "").strip()
        if not text:
            return []

        channel = event.get("channel", "")
        ts = event.get("ts", "")
        if is_mention:
            thread_ts = event.get("thread_ts") or ts
            conversation_id = f"{channel}:{thread_ts}"
        elif event.get("thread_ts"):
            # Assistant-sidebar messages are DMs that carry the assistant thread's
            # ts; key by thread so the reply posts back into that thread. Plain
            # DMs have no thread_ts and stay one continuous conversation.
            conversation_id = f"{channel}:{event['thread_ts']}"
        else:
            conversation_id = channel

        timestamp = None
        try:
            timestamp = datetime.fromtimestamp(float(ts), tz=timezone.utc)
        except (TypeError, ValueError):
            pass

        return [InboundMessage(
            external_account_id=team_id,
            external_conversation_id=conversation_id,
            external_user_id=str(event.get("user", "")),
            external_message_id=payload.get("event_id") or ts,
            text=text,
            timestamp=timestamp,
        )]

    async def fetch_profile(self, account: ChannelAccount, external_user_id: str) -> dict:
        """Resolve the Slack user's real name (and email, if the scope allows)
        via users.info so customers show as a name, not a raw U0… id."""
        try:
            data = await slack_api("users.info", self._access_token(account),
                                   {"user": external_user_id}, form=True)
            if not data.get("ok"):
                return {}
            user = data.get("user") or {}
            profile = user.get("profile") or {}
            name = (user.get("real_name") or profile.get("display_name")
                    or profile.get("real_name"))
            return {"name": name or None, "email": profile.get("email")}
        except Exception as e:
            logger.error(f"Slack users.info failed: {e}")
            return {}

    async def send_typing(self, account: ChannelAccount, conversation: ChannelConversation) -> None:
        # Slack has no bot typing indicator; post a placeholder we later edit
        # into the real reply so the customer sees an immediate "typing…".
        channel, thread_ts = self._split_conversation(conversation.external_conversation_id)
        payload = {"channel": channel, "text": "_typing…_", "mrkdwn": True}
        if thread_ts:
            payload["thread_ts"] = thread_ts
        try:
            _prune_placeholders(time.time())
            data = await slack_api("chat.postMessage", self._access_token(account), payload)
            if data.get("ok"):
                _typing_placeholders[self._placeholder_key(account, conversation)] = (data["ts"], time.time())
        except Exception as e:
            logger.debug(f"Slack typing placeholder failed (non-critical): {e}")

    async def send_text(self, account: ChannelAccount, conversation: ChannelConversation, text: str) -> SendResult:
        channel, thread_ts = self._split_conversation(conversation.external_conversation_id)
        token = self._access_token(account)

        # If we posted a "typing…" placeholder, edit it into the reply
        entry = _typing_placeholders.pop(self._placeholder_key(account, conversation), None)
        placeholder_ts = entry[0] if entry else None
        if placeholder_ts:
            try:
                data = await slack_api("chat.update", token,
                                       {"channel": channel, "ts": placeholder_ts, "text": text})
                if data.get("ok"):
                    return SendResult(ok=True, external_message_id=str(data.get("ts", "")))
                # Update failed (e.g. placeholder deleted) — remove the stale
                # "typing…" so we don't leave it beside the fresh reply.
                await slack_api("chat.delete", token, {"channel": channel, "ts": placeholder_ts})
            except Exception as e:
                logger.debug(f"Slack chat.update failed, posting new message: {e}")

        payload = {"channel": channel, "text": text}
        if thread_ts:
            payload["thread_ts"] = thread_ts
        try:
            data = await slack_api("chat.postMessage", token, payload)
            if not data.get("ok"):
                return SendResult(ok=False, error=str(data.get("error") or "chat.postMessage failed"))
            return SendResult(ok=True, external_message_id=str(data.get("ts", "")))
        except Exception as e:
            logger.error(f"Slack send failed: {e}")
            return SendResult(ok=False, error=str(e))

    def format_outbound(self, markdown: str) -> str:
        # Slack mrkdwn uses single markers: **bold** -> *bold*
        return markdown.replace("**", "*")[:MAX_MESSAGE_LENGTH]

    @staticmethod
    def _placeholder_key(account: ChannelAccount, conversation: ChannelConversation) -> tuple:
        return (str(account.id), conversation.external_conversation_id)

    @staticmethod
    def _split_conversation(conversation_id: str) -> tuple[str, Optional[str]]:
        if ":" in conversation_id:
            channel, thread_ts = conversation_id.split(":", 1)
            return channel, thread_ts
        return conversation_id, None

    @staticmethod
    def _access_token(account: ChannelAccount) -> str:
        return json.loads(decrypt_api_key(account.encrypted_credentials))["access_token"]


register_adapter(SlackAdapter())

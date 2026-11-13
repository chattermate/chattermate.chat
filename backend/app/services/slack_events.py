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

"""Slack App Home / Assistant lifecycle handlers.

These run as FastAPI background tasks (the webhook acks within 3s and hands off
here), so each opens its own DB session. They cover the non-message surfaces:
the Messages-tab welcome, the Home tab view, and the Assistant sidebar — all of
which the Slack Marketplace requires an app with the Messages tab enabled to use.
"""

from typing import Optional
from uuid import UUID

from app.channels.slack import (
    SUGGESTED_PROMPTS_TITLE,
    STARTER_PROMPTS,
    WELCOME_NO_AGENT,
    WELCOME_WITH_AGENT,
    ASSISTANT_READY_STATUS,
    SlackAdapter,
    build_home_view,
    publish_home_view,
    set_assistant_status,
    set_suggested_prompts,
    slack_api,
)
from app.core.config import settings
from app.core.logger import get_logger
from app.core.redis import get_redis
from app.core.s3 import get_s3_signed_url
from app.database import close_session, release_connection, session_off_loop
from app.repositories.agent import AgentRepository
from app.repositories.channels import ChannelAccountRepository
from app.repositories.channels.agent_config import AgentChannelConfigRepository

logger = get_logger(__name__)

# One welcome per user, forever — this flag is never meant to expire (a re-welcome
# on a Redis flush is harmless). SETNX; TTL only as a backstop against orphans.
_WELCOME_FLAG_TTL_SECONDS = 60 * 60 * 24 * 365


def _assigned_agent(db, account):
    """The single agent answering this Slack workspace, or None if unassigned."""
    agent_id = AgentChannelConfigRepository(db).get_active_agent_id(account.id)
    if not agent_id:
        return None
    return AgentRepository(db).get_agent(agent_id)


def _welcome_text(agent) -> str:
    if agent is None:
        return WELCOME_NO_AGENT
    return WELCOME_WITH_AGENT.format(agent=agent.display_name or agent.name)


def _already_welcomed(account_id, user_id: str) -> bool:
    """Claim the first-welcome slot for (account, user). True if already welcomed.

    Without Redis we can't dedupe, so we welcome (once per process start is the
    worst case) rather than stay silent — the review requires a welcome to be sent.
    """
    redis_client = get_redis()
    if redis_client is None:
        return False
    try:
        key = f"slack_home_welcomed:{account_id}:{user_id}"
        claimed = redis_client.set(key, "1", nx=True, ex=_WELCOME_FLAG_TTL_SECONDS)
        return not claimed
    except Exception as e:
        logger.error(f"Slack welcome dedupe failed (welcoming anyway): {e}")
        return False


async def deliver_home_welcome(account_id: UUID, user_id: str, channel: str) -> None:
    """Send the one-time welcome DM when a user first opens the Messages tab."""
    if not user_id or not channel:
        return
    if _already_welcomed(account_id, user_id):
        return
    db = await session_off_loop()
    try:
        account = ChannelAccountRepository(db).get_by_id(account_id)
        if account is None or not account.is_active:
            return
        token = SlackAdapter._access_token(account)
        text = _welcome_text(_assigned_agent(db, account))
        release_connection(db)  # read all it needs; don't hold a connection slot through Slack's reply
        await slack_api("chat.postMessage", token, {"channel": channel, "text": text})
    except Exception as e:
        logger.error(f"Slack Messages-tab welcome failed: {e}")
    finally:
        close_session(db)


async def handle_assistant_thread_started(account_id: UUID, channel_id: str, thread_ts: str) -> None:
    """On assistant-sidebar open: show a status, offer starter prompts, welcome."""
    if not channel_id or not thread_ts:
        return
    db = await session_off_loop()
    try:
        account = ChannelAccountRepository(db).get_by_id(account_id)
        if account is None or not account.is_active:
            return
        token = SlackAdapter._access_token(account)
        text = _welcome_text(_assigned_agent(db, account))
        release_connection(db)  # read all it needs; don't hold a connection slot through Slack's replies
        await set_assistant_status(token, channel_id, thread_ts, ASSISTANT_READY_STATUS)
        await set_suggested_prompts(token, channel_id, thread_ts, STARTER_PROMPTS, SUGGESTED_PROMPTS_TITLE)
        await slack_api("chat.postMessage", token,
                        {"channel": channel_id, "text": text, "thread_ts": thread_ts})
    except Exception as e:
        logger.error(f"Slack assistant welcome failed: {e}")
    finally:
        close_session(db)


def _agent_card(agent) -> dict:
    """Flatten an Agent into the shape build_home_view expects; the photo URL
    is the stored one until _signed_photo_url resolves it."""
    customization = getattr(agent, "customization", None)
    photo_url = customization.photo_url if customization and customization.photo_url else None
    instructions = agent.instructions or []
    return {
        "name": agent.display_name or agent.name,
        "is_active": agent.is_active,
        "instruction": instructions[0] if instructions else "",
        "photo_url": photo_url,
    }


async def _signed_photo_url(photo_url: Optional[str]) -> Optional[str]:
    """A photo URL Slack can load: signed when files live in S3."""
    if not photo_url or not settings.S3_FILE_STORAGE:
        return photo_url
    try:
        return await get_s3_signed_url(photo_url)
    except Exception as e:
        logger.debug(f"Could not sign agent photo URL: {e}")
        return photo_url


def _dashboard_url() -> str:
    return settings.FRONTEND_URL.rstrip("/")


async def publish_agent_home(account_id: UUID, user_id: str) -> None:
    """Publish the Home tab: what ChatterMate does, the agent connected to this
    workspace, how to use it, and a link to the dashboard."""
    if not user_id:
        return
    db = await session_off_loop()
    try:
        account = ChannelAccountRepository(db).get_by_id(account_id)
        if account is None or not account.is_active:
            return
        token = SlackAdapter._access_token(account)
        agent = _assigned_agent(db, account)
        card = _agent_card(agent) if agent is not None else None
        release_connection(db)  # read all it needs; don't hold a connection slot through Slack's reply
        if card is not None:
            card["photo_url"] = await _signed_photo_url(card["photo_url"])
        view = build_home_view(card, _dashboard_url())
        await publish_home_view(token, user_id, view)
    except Exception as e:
        logger.error(f"Slack Home tab publish failed: {e}")
    finally:
        close_session(db)

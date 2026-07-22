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

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.webhooks.common import is_duplicate_message
from app.channels import get_adapter
from app.channels.slack import verify_slack_signature
from app.core.logger import get_logger
from app.database import get_db
from app.models.channels import ChannelType
from app.repositories.channels import ChannelAccountRepository
from app.services.channel_chat import process_channel_message

router = APIRouter()
logger = get_logger(__name__)

# Workspace-level events that end our access: the app was removed, or its
# tokens were revoked. Both mean the stored credentials are dead.
LIFECYCLE_EVENT_TYPES = frozenset({"app_uninstalled", "tokens_revoked"})


def _revokes_bot_access(event: dict) -> bool:
    """Whether the event actually kills the credentials we hold.

    An uninstall always does. tokens_revoked also fires when a *user* token
    is revoked, which leaves the bot working — we only ever store a bot
    token, so acting on those would disconnect a healthy workspace.
    """
    if event.get("type") == "app_uninstalled":
        return True
    return bool((event.get("tokens") or {}).get("bot"))


def _handle_lifecycle_event(payload: dict, account_repo: ChannelAccountRepository) -> None:
    """Drop the workspace's stored credentials after an uninstall or revoke.

    Deleting the account closes any open sessions and cascades to its
    conversations and agent config, so no agent is left holding a
    conversation on a channel we can no longer reach.
    """
    if not _revokes_bot_access(payload.get("event") or {}):
        logger.info("Slack tokens_revoked without a bot token; keeping the account")
        return

    team_id = payload.get("team_id", "")
    if not team_id:
        logger.warning("Slack lifecycle event without a team_id; ignoring")
        return

    account = account_repo.get_by_external_id(ChannelType.SLACK.value, team_id)
    if account is None:
        # Already disconnected our side, or a workspace we never stored.
        logger.info(f"Slack lifecycle event for unknown team {team_id}")
        return

    # delete() reports failure by returning False rather than raising.
    if account_repo.delete(account):
        logger.info(f"Removed Slack account for team {team_id} after lifecycle event")
    else:
        logger.error(f"Failed to remove Slack account for team {team_id}")


@router.post("")
async def slack_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Slack Events API endpoint: URL verification handshake plus @mention and
    DM events, verified against the app signing secret, acked immediately and
    processed in the background."""
    raw_body = await request.body()

    # Verify before parsing — unsigned garbage gets a clean 403, not a 500.
    if not verify_slack_signature(dict(request.headers), raw_body):
        raise HTTPException(status_code=403, detail="Invalid signature")

    payload = await request.json()

    if payload.get("type") == "url_verification":
        return {"challenge": payload.get("challenge")}

    if payload.get("type") != "event_callback":
        return {"status": "ignored"}

    account_repo = ChannelAccountRepository(db)

    # Lifecycle events carry no message, so parse_inbound drops them — resolve
    # the workspace off the envelope instead, before the message loop.
    if (payload.get("event") or {}).get("type") in LIFECYCLE_EVENT_TYPES:
        _handle_lifecycle_event(payload, account_repo)
        return {"status": "ok"}

    adapter = get_adapter(ChannelType.SLACK.value)

    for inbound in adapter.parse_inbound(payload):
        account = account_repo.get_by_external_id(ChannelType.SLACK.value, inbound.external_account_id)
        if account is None or not account.is_active:
            logger.info(f"No active Slack account for team {inbound.external_account_id}")
            continue
        # event_id is globally unique; Slack redelivers with X-Slack-Retry-Num
        if is_duplicate_message(ChannelType.SLACK.value,
                                f"{account.id}:{inbound.external_message_id}"):
            logger.info(f"Skipping duplicate Slack event {inbound.external_message_id}")
            continue
        background_tasks.add_task(process_channel_message, account.id, inbound)

    return {"status": "ok"}

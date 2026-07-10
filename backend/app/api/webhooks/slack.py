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
    payload = await request.json()

    # URL verification happens while configuring the app; it precedes signing
    # in Slack's setup flow but is still signed — verify first regardless.
    if not verify_slack_signature(dict(request.headers), raw_body):
        raise HTTPException(status_code=403, detail="Invalid signature")

    if payload.get("type") == "url_verification":
        return {"challenge": payload.get("challenge")}

    if payload.get("type") != "event_callback":
        return {"status": "ignored"}

    adapter = get_adapter(ChannelType.SLACK.value)
    account_repo = ChannelAccountRepository(db)

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

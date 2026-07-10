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

from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.webhooks.common import is_duplicate_message
from app.channels import get_adapter
from app.core.logger import get_logger
from app.database import get_db
from app.models.channels import ChannelType
from app.repositories.channels import ChannelAccountRepository
from app.services.channel_chat import process_channel_message

router = APIRouter()
logger = get_logger(__name__)


@router.post("/{account_id}")
async def line_webhook(
    account_id: UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """LINE Messaging API webhook, verified via X-Line-Signature."""
    account = ChannelAccountRepository(db).get_by_id(account_id)
    if account is None or account.channel_type != ChannelType.LINE.value:
        raise HTTPException(status_code=404, detail="Unknown account")

    adapter = get_adapter(ChannelType.LINE.value)
    raw_body = await request.body()
    if not await adapter.verify_webhook(dict(request.headers), raw_body, account):
        raise HTTPException(status_code=403, detail="Invalid signature")

    payload = await request.json()
    for inbound in adapter.parse_inbound(payload):
        if is_duplicate_message(ChannelType.LINE.value,
                                f"{account.id}:{inbound.external_message_id}"):
            continue
        background_tasks.add_task(process_channel_message, account.id, inbound)

    return {"status": "ok"}

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

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.api.webhooks.common import is_duplicate_message
from app.channels import get_adapter
from app.channels.email import verify_webhook_token
from app.core.logger import get_logger
from app.database import get_db
from app.models.channels import ChannelType
from app.repositories.channels import ChannelAccountRepository
from app.services.channel_chat import process_channel_message

router = APIRouter()
logger = get_logger(__name__)


@router.post("/{account_id}")
async def email_webhook(
    account_id: UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    token: str = Query(""),
    db: Session = Depends(get_db),
):
    """Inbound-parse webhook (point SendGrid/Brevo/your forwarder here with
    the account's ?token=). Accepts JSON or multipart/urlencoded form."""
    account = ChannelAccountRepository(db).get_by_id(account_id)
    if account is None or account.channel_type != ChannelType.EMAIL.value:
        raise HTTPException(status_code=404, detail="Unknown account")
    if not verify_webhook_token(account, token):
        raise HTTPException(status_code=403, detail="Invalid token")

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        payload = await request.json()
    else:
        form = await request.form()
        payload = {key: str(value) for key, value in form.items()}

    adapter = get_adapter(ChannelType.EMAIL.value)
    for inbound in adapter.parse_inbound(payload):
        # A forward-all inbox can echo our own outbound reply back — never
        # answer mail from the connected address itself.
        if inbound.external_user_id == account.external_account_id:
            logger.info(f"Ignoring self-addressed email on {account.external_account_id}")
            continue
        if is_duplicate_message(ChannelType.EMAIL.value,
                                f"{account.id}:{inbound.external_message_id}"):
            continue
        background_tasks.add_task(process_channel_message, account.id, inbound)

    return {"status": "ok"}

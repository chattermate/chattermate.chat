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

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.api.webhooks.common import is_duplicate_message
from app.channels import get_adapter
from app.channels.sms_twilio import credentials, verify_twilio_signature
from app.core.config import settings
from app.core.logger import get_logger
from app.database import get_db
from app.models.channels import ChannelType
from app.repositories.channels import ChannelAccountRepository
from app.services.channel_chat import process_channel_message

router = APIRouter()
logger = get_logger(__name__)

# Twilio expects TwiML back; an empty <Response/> means "no auto-reply"
EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'


def _public_url(account_id: UUID) -> str:
    return f"{settings.BACKEND_URL.rstrip('/')}{settings.API_V1_STR}/webhooks/twilio/{account_id}"


@router.post("/{account_id}")
async def twilio_webhook(
    account_id: UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Inbound SMS from Twilio, verified via X-Twilio-Signature over the
    public URL + form params."""
    account = ChannelAccountRepository(db).get_by_id(account_id)
    if account is None or account.channel_type != ChannelType.SMS.value:
        raise HTTPException(status_code=404, detail="Unknown account")

    form = await request.form()
    # multi_items preserves repeated keys — the signature covers all of them
    param_pairs = [(key, str(value)) for key, value in form.multi_items()]
    params = dict(param_pairs)
    signature = request.headers.get("x-twilio-signature", "")
    auth_token = credentials(account).get("auth_token", "")
    if not verify_twilio_signature(auth_token, _public_url(account_id), param_pairs, signature):
        raise HTTPException(status_code=403, detail="Invalid signature")

    adapter = get_adapter(ChannelType.SMS.value)
    for inbound in adapter.parse_inbound(params):
        if is_duplicate_message(ChannelType.SMS.value,
                                f"{account.id}:{inbound.external_message_id}"):
            continue
        background_tasks.add_task(process_channel_message, account.id, inbound)

    return Response(content=EMPTY_TWIML, media_type="text/xml")

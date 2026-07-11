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

import json as jsonlib
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.api.webhooks.common import is_duplicate_message
from app.channels.sms import get_provider, SmsWebhookRequest
from app.channels.sms.adapter import account_provider_name
from app.core.config import settings
from app.core.logger import get_logger
from app.database import get_db
from app.models.channels import ChannelType
from app.repositories.channels import ChannelAccountRepository
from app.services.channel_chat import process_channel_message

router = APIRouter()
logger = get_logger(__name__)

# Twilio expects TwiML back; empty means "no auto-reply"
EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'


def _public_url(provider: str, account_id: UUID) -> str:
    return f"{settings.BACKEND_URL.rstrip('/')}{settings.API_V1_STR}/webhooks/sms/{provider}/{account_id}"


async def _build_request(request: Request, provider: str, account_id: UUID) -> SmsWebhookRequest:
    raw_body = await request.body()
    content_type = request.headers.get("content-type", "")
    json_body = None
    param_pairs = []
    params = {}
    if "application/json" in content_type or (raw_body[:1] in (b"{", b"[")):
        try:
            json_body = jsonlib.loads(raw_body or b"{}")
        except ValueError:
            json_body = None
    if json_body is None:
        form = await request.form()
        param_pairs = [(k, str(v)) for k, v in form.multi_items()]
        params = dict(param_pairs)
    return SmsWebhookRequest(
        headers={k.lower(): v for k, v in request.headers.items()},
        params=params, param_pairs=param_pairs, json_body=json_body,
        raw_body=raw_body, url=_public_url(provider, account_id),
    )


@router.post("/{provider}/{account_id}")
async def sms_webhook(
    provider: str,
    account_id: UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Inbound SMS for any provider. The provider in the path selects the
    parser/verifier; it must match the account's configured provider."""
    account = ChannelAccountRepository(db).get_by_id(account_id)
    if account is None or account.channel_type != ChannelType.SMS.value:
        raise HTTPException(status_code=404, detail="Unknown account")
    if account_provider_name(account) != provider:
        raise HTTPException(status_code=404, detail="Provider mismatch")

    sms_provider = get_provider(provider)
    if sms_provider is None:
        raise HTTPException(status_code=404, detail="Unknown SMS provider")

    sms_req = await _build_request(request, provider, account_id)
    if not await sms_provider.verify_webhook(sms_req, account):
        raise HTTPException(status_code=403, detail="Invalid signature")

    # Control callbacks (e.g. SNS subscription confirmation) are handled here
    if await sms_provider.handle_control(sms_req, account):
        return {"status": "ok"}

    for inbound in sms_provider.parse_inbound(sms_req, account):
        if is_duplicate_message(ChannelType.SMS.value, f"{account.id}:{inbound.external_message_id}"):
            continue
        background_tasks.add_task(process_channel_message, account.id, inbound)

    # Twilio wants TwiML; others accept any 200
    if provider == "twilio":
        return Response(content=EMPTY_TWIML, media_type="text/xml")
    return {"status": "ok"}

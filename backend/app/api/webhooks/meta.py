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

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, Response
from sqlalchemy.orm import Session

from app.api.webhooks.common import is_duplicate_message
from app.channels import get_adapter
from app.channels.meta_base import verify_meta_signature, verify_challenge
from app.core.logger import get_logger
from app.database import get_db
from app.models.channels import ChannelType
from app.repositories.channels import ChannelAccountRepository
from app.services.channel_chat import process_channel_message

router = APIRouter()
logger = get_logger(__name__)

# One Meta app subscribes WhatsApp + Messenger + Instagram to this single
# callback; the payload's top-level `object` says which product it is.
_OBJECT_TO_CHANNEL = {
    "whatsapp_business_account": ChannelType.WHATSAPP.value,
    "page": ChannelType.MESSENGER.value,
    "instagram": ChannelType.INSTAGRAM.value,
}


@router.get("")
async def meta_webhook_verify(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
):
    """Webhook verification handshake (App Dashboard → Webhooks → Verify)."""
    challenge = verify_challenge(hub_mode, hub_verify_token, hub_challenge)
    if challenge is None:
        raise HTTPException(status_code=403, detail="Verification failed")
    # Meta expects the raw challenge echoed as text/plain
    return Response(content=challenge, media_type="text/plain")


@router.post("")
async def meta_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Receive a Meta webhook for any of WhatsApp / Messenger / Instagram.

    Verifies the app-level signature, routes on the `object` field, resolves
    the connected account per message, acks immediately, and processes in the
    background.
    """
    raw_body = await request.body()
    if not verify_meta_signature(raw_body, request.headers.get("x-hub-signature-256", "")):
        # Logged so a rejected delivery is distinguishable from one that never
        # arrived; the body is untrusted and unlogged.
        logger.warning(f"Meta webhook rejected: bad signature ({len(raw_body)} bytes)")
        raise HTTPException(status_code=403, detail="Invalid signature")

    payload = await request.json()
    # TODO(debug): remove once Instagram delivery is confirmed in production.
    # Ids only — the body carries customer message text.
    logger.info(f"Meta webhook: object={payload.get('object')} "
                f"entries={[e.get('id') for e in payload.get('entry', []) if isinstance(e, dict)]}")
    channel_type = _OBJECT_TO_CHANNEL.get(payload.get("object"))
    if channel_type is None:
        # Unknown product subscription — ack so Meta doesn't retry forever
        return {"status": "ignored"}

    adapter = get_adapter(channel_type)
    account_repo = ChannelAccountRepository(db)

    for inbound in adapter.parse_inbound(payload):
        account = account_repo.get_by_external_id(channel_type, inbound.external_account_id)
        if account is None or not account.is_active:
            logger.info(f"No active {channel_type} account for {inbound.external_account_id}")
            continue
        if is_duplicate_message(channel_type,
                                f"{account.id}:{inbound.external_message_id}"):
            logger.info(f"Skipping duplicate {channel_type} message {inbound.external_message_id}")
            continue
        background_tasks.add_task(process_channel_message, account.id, inbound)

    return {"status": "ok"}

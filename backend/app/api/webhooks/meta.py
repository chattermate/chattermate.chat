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

import hmac
from typing import Callable, Optional
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, Response
from sqlalchemy.orm import Session

from app.api.webhooks.common import is_duplicate_message
from app.channels import get_adapter
from app.channels.meta_base import signed_by_any, verify_meta_signature, verify_challenge
from app.services.meta_own_app import is_own_app, own_app_secret, same_app_accounts
from app.core.logger import get_logger
from app.database import get_db
from app.models.channels import ChannelAccount, ChannelType
from app.repositories.channels import ChannelAccountRepository
from app.services.channel_chat import process_channel_message
from app.services.channel_status import process_status_event

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
    channel_type = _OBJECT_TO_CHANNEL.get(payload.get("object"))
    if channel_type is None:
        # Unknown product subscription — ack so Meta doesn't retry forever
        return {"status": "ignored"}

    account_repo = ChannelAccountRepository(db)
    _queue_events(background_tasks, channel_type, payload,
                  lambda external_id: account_repo.get_by_external_id(channel_type, external_id))
    return {"status": "ok"}


@router.get("/{account_id}")
async def own_app_webhook_verify(
    account_id: UUID,
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    db: Session = Depends(get_db),
):
    """Verification handshake for an account connected from the customer's
    own Meta app: its verify token is the account's webhook secret."""
    account = _own_app_account(db, account_id)
    if (account is None or hub_mode != "subscribe" or not hub_verify_token
            or not hmac.compare_digest(hub_verify_token.encode(), account.webhook_secret.encode())):
        raise HTTPException(status_code=403, detail="Verification failed")
    return Response(content=hub_challenge or "", media_type="text/plain")


@router.post("/{account_id}")
async def own_app_webhook(
    account_id: UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """A webhook for an account connected from the customer's own Meta app.

    Checked with that app's secret only, and only taken for this
    organization's accounts from the same app: the secret is one the customer
    chose, so it must never vouch for anyone else's.
    """
    raw_body = await request.body()
    account = _own_app_account(db, account_id)
    secret = _readable_secret(account)
    if secret is None:
        # Disconnected, never ours, or its secret can't be read: ack, so Meta
        # doesn't disable the customer's webhook over retries — nothing is acted
        # on. Logged: to the customer the messages just vanish.
        logger.info(f"Meta webhook for account {account_id} ignored: no connected own-app account "
                    f"({len(raw_body)} bytes)")
        return {"status": "ignored"}
    if not signed_by_any(raw_body, request.headers.get("x-hub-signature-256", ""), (secret,)):
        logger.warning(f"Meta webhook for account {account_id} rejected: bad signature ({len(raw_body)} bytes)")
        raise HTTPException(status_code=403, detail="Invalid signature")

    payload = await request.json()
    if _OBJECT_TO_CHANNEL.get(payload.get("object")) != account.channel_type:
        return {"status": "ignored"}
    _queue_events(background_tasks, account.channel_type, payload, same_app_accounts(db, account))
    return {"status": "ok"}


def _own_app_account(db: Session, account_id: UUID) -> Optional[ChannelAccount]:
    account = ChannelAccountRepository(db).get_by_id(account_id)
    return account if account is not None and account.is_active and is_own_app(account) else None


def _readable_secret(account: Optional[ChannelAccount]) -> Optional[str]:
    if account is None:
        return None
    try:
        return own_app_secret(account)
    except Exception:
        logger.exception(f"Could not read the app secret of Meta account {account.id}")
        return None


def _queue_events(background_tasks: BackgroundTasks, channel_type: str, payload: dict,
                  resolve: Callable[[str], Optional[ChannelAccount]]) -> None:
    """Hand each message and receipt in a webhook to its account's processor;
    `resolve` names the account an external id belongs to, if any."""
    adapter = get_adapter(channel_type)
    # Meta batches many events per number; resolve each account once
    accounts = {}

    def account_for(external_id: str) -> Optional[ChannelAccount]:
        if external_id not in accounts:
            accounts[external_id] = resolve(external_id)
        return accounts[external_id]

    for inbound in adapter.parse_inbound(payload):
        account = account_for(inbound.external_account_id)
        if account is None or not account.is_active:
            logger.info(f"No active {channel_type} account for {inbound.external_account_id}")
            continue
        if is_duplicate_message(channel_type,
                                f"{account.id}:{inbound.external_message_id}"):
            logger.info(f"Skipping duplicate {channel_type} message {inbound.external_message_id}")
            continue
        background_tasks.add_task(process_channel_message, account.id, inbound)

    for event in adapter.parse_status_events(payload):
        account = account_for(event.external_account_id)
        if account is None or not account.is_active:
            continue
        # Meta redelivers receipts; one per message and state is enough.
        if is_duplicate_message(channel_type, f"{account.id}:{event.external_message_id}:"
                                              f"{event.status.value}"):
            continue
        background_tasks.add_task(process_status_event, account.id, event)

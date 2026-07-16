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

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.channels.accounts import get_org_account_or_404, to_account_out
from app.channels import get_adapter
from app.channels.meta_base import graph_delete, graph_get, graph_post_json, subscribe_app
from app.core.auth import get_current_organization, require_permissions
from app.database import get_db
from app.models.channels import ChannelType
from app.models.organization import Organization
from app.models.schemas.channel import (
    ChannelAccountOut,
    WhatsAppConnectRequest,
    MessengerConnectRequest,
    InstagramConnectRequest,
    TemplateCreateRequest,
    TemplateOut,
    TemplateSendRequest,
)
from app.models.user import User
from app.repositories.channels import ChannelAccountRepository, ChannelConversationRepository
from app.core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

# Template fields worth reading back from Graph; components carries the body
# text and any {{n}} variables the UI has to prompt for.
TEMPLATE_FIELDS = "name,status,category,language,components"
TEMPLATE_PAGE_LIMIT = 100
# Backstop against paging forever on a malformed cursor. Well above Meta's own
# per-WABA template ceiling, so a real account never reaches it.
TEMPLATE_MAX_PAGES = 10


def _graph_detail(data: dict, fallback: str) -> str:
    """Meta's own error text where it has one, so the UI can show the real
    reason (e.g. a duplicate template name) rather than a generic failure."""
    return data.get("error", {}).get("message") or fallback


def _whatsapp_account_or_404(db: Session, account_id: UUID, organization: Organization):
    account = get_org_account_or_404(db, account_id, organization)
    if account.channel_type != ChannelType.WHATSAPP.value:
        raise HTTPException(status_code=404, detail="Channel account not found")
    return account


async def _fetch_all_templates(waba_id: str, access_token: str) -> list[TemplateOut]:
    """Every template on the WABA, following Graph's cursor.

    A template that exists but isn't listed is an invisible failure — the agent
    picking one to reopen a closed window would never see it — so this pages
    rather than showing the first hundred and stopping.
    """
    templates: list[TemplateOut] = []
    params = {"fields": TEMPLATE_FIELDS, "limit": TEMPLATE_PAGE_LIMIT}
    for _ in range(TEMPLATE_MAX_PAGES):
        ok, data = await graph_get(f"{waba_id}/message_templates", access_token, params=params)
        if not ok:
            raise HTTPException(status_code=502,
                                detail=_graph_detail(data, "Could not list templates"))
        page = data.get("data")
        if not isinstance(page, list):
            raise HTTPException(status_code=502,
                                detail="Unexpected template response from Meta")
        templates.extend(TemplateOut(**template) for template in page)

        after = (data.get("paging") or {}).get("cursors", {}).get("after")
        if not after or len(page) < TEMPLATE_PAGE_LIMIT:
            return templates
        params = {**params, "after": after}

    logger.warning(f"Stopped paging templates for WABA {waba_id} at {TEMPLATE_MAX_PAGES} pages")
    return templates


def _waba_credentials(db: Session, account) -> tuple[str, str]:
    """(waba_id, access_token) for a WhatsApp account.

    Templates live on the WhatsApp Business Account, not the phone number, and
    the WABA id is optional in the credential blob — accounts connected without
    it can send and receive but cannot manage templates.
    """
    credentials = ChannelAccountRepository(db).get_credentials(account)
    waba_id = credentials.get("waba_id")
    if not waba_id:
        raise HTTPException(
            status_code=400,
            detail="Reconnect this number with its WhatsApp Business Account ID to manage templates",
        )
    return waba_id, credentials["access_token"]


def _upsert_account(db: Session, organization: Organization, channel_type: str,
                    external_account_id: str, credentials: dict, display_name: str):
    """Create the account or refresh credentials on reconnect (same org only)."""
    repo = ChannelAccountRepository(db)
    existing = repo.get_by_external_id(channel_type, external_account_id)
    if existing is not None:
        if existing.organization_id != organization.id:
            raise HTTPException(status_code=409,
                                detail="This account is already connected to another organization")
        repo.update_credentials(existing, credentials)
        return repo.set_active(existing, True)
    return repo.create_account(
        organization_id=organization.id,
        channel_type=channel_type,
        external_account_id=external_account_id,
        credentials=credentials,
        display_name=display_name,
    )


@router.post("/whatsapp", response_model=ChannelAccountOut)
async def connect_whatsapp(
    request: WhatsAppConnectRequest,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Connect a WhatsApp Cloud API number with manual credentials
    (phone_number_id + permanent token from the customer's own Meta app)."""
    ok, data = await graph_get(request.phone_number_id, request.access_token,
                               params={"fields": "display_phone_number,verified_name"})
    if not ok:
        raise HTTPException(status_code=400,
                            detail=f"Could not verify WhatsApp credentials: {data.get('error', {}).get('message', 'invalid token or phone_number_id')}")

    display = request.display_name or \
        f"{data.get('verified_name', 'WhatsApp')} ({data.get('display_phone_number', request.phone_number_id)})"
    account = _upsert_account(
        db, organization, ChannelType.WHATSAPP.value,
        external_account_id=request.phone_number_id,
        credentials={"access_token": request.access_token, "waba_id": request.waba_id},
        display_name=display,
    )
    # Route WABA events to our webhook (best-effort; needs the WABA id)
    if request.waba_id:
        if not await subscribe_app(request.waba_id, request.access_token):
            logger.warning(f"WABA subscribe failed for {request.waba_id}; webhook may need manual subscription")
    return to_account_out(db, account)


@router.post("/messenger", response_model=ChannelAccountOut)
async def connect_messenger(
    request: MessengerConnectRequest,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Connect a Facebook Page for Messenger with a page access token."""
    ok, data = await graph_get("me", request.page_access_token, params={"fields": "id,name"})
    if not ok or str(data.get("id")) != request.page_id:
        raise HTTPException(status_code=400,
                            detail="Could not verify page token (token invalid or not for this page)")

    account = _upsert_account(
        db, organization, ChannelType.MESSENGER.value,
        external_account_id=request.page_id,
        credentials={"access_token": request.page_access_token},
        display_name=request.display_name or data.get("name", request.page_id),
    )
    if not await subscribe_app(request.page_id, request.page_access_token,
                               subscribed_fields="messages,messaging_postbacks"):
        logger.warning(f"Page subscribe failed for {request.page_id}; webhook may need manual subscription")
    return to_account_out(db, account)


@router.post("/instagram", response_model=ChannelAccountOut)
async def connect_instagram(
    request: InstagramConnectRequest,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Connect an Instagram professional account (via its linked page token)."""
    ok, data = await graph_get(request.ig_id, request.page_access_token,
                               params={"fields": "id,username"})
    if not ok:
        raise HTTPException(status_code=400,
                            detail=f"Could not verify Instagram credentials: {data.get('error', {}).get('message', 'invalid token or account id')}")
    # Webhook routing matches entry.id against this value, so reject anything
    # that isn't the actual IG business-account id (e.g. a pasted Page id —
    # the page token can read that node too, so ok=True alone isn't enough).
    if str(data.get("id")) != request.ig_id:
        raise HTTPException(status_code=400,
                            detail="The ID entered is not an Instagram professional account ID")

    account = _upsert_account(
        db, organization, ChannelType.INSTAGRAM.value,
        external_account_id=request.ig_id,
        credentials={"access_token": request.page_access_token},
        display_name=request.display_name or f"@{data.get('username', request.ig_id)}",
    )
    return to_account_out(db, account)


@router.delete("/{account_id}")
async def disconnect_meta_account(
    account_id: UUID,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Disconnect a WhatsApp/Messenger/Instagram account."""
    account = get_org_account_or_404(db, account_id, organization)
    if account.channel_type not in (ChannelType.WHATSAPP.value,
                                    ChannelType.MESSENGER.value,
                                    ChannelType.INSTAGRAM.value):
        raise HTTPException(status_code=404, detail="Channel account not found")
    ChannelAccountRepository(db).delete(account)
    return {"status": "disconnected"}


@router.post("/whatsapp/{account_id}/send-template")
async def send_whatsapp_template(
    account_id: UUID,
    request: TemplateSendRequest,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Send an approved template message to reopen an expired 24h window."""
    account = _whatsapp_account_or_404(db, account_id, organization)

    conversation = ChannelConversationRepository(db).get_by_session(request.session_id)
    if conversation is None or conversation.channel_account_id != account.id:
        raise HTTPException(status_code=404, detail="Conversation not found for this account")

    adapter = get_adapter(ChannelType.WHATSAPP.value)
    result = await adapter.send_template(
        account, conversation,
        template_name=request.template_name,
        language=request.language,
        components=request.components,
    )
    if not result.ok:
        raise HTTPException(status_code=502, detail=result.error or "Template send failed")
    return {"status": "sent", "external_message_id": result.external_message_id}


@router.get("/whatsapp/{account_id}/templates", response_model=list[TemplateOut])
async def list_whatsapp_templates(
    account_id: UUID,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """List the message templates on this number's WhatsApp Business Account."""
    account = _whatsapp_account_or_404(db, account_id, organization)
    waba_id, access_token = _waba_credentials(db, account)
    return await _fetch_all_templates(waba_id, access_token)


@router.post("/whatsapp/{account_id}/templates", response_model=TemplateOut)
async def create_whatsapp_template(
    account_id: UUID,
    request: TemplateCreateRequest,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Submit a new template to Meta. It cannot be sent until Meta approves it."""
    account = _whatsapp_account_or_404(db, account_id, organization)
    waba_id, access_token = _waba_credentials(db, account)

    ok, data = await graph_post_json(f"{waba_id}/message_templates", access_token, {
        "name": request.name,
        "category": request.category,
        "language": request.language,
        "components": request.components,
    })
    if not ok:
        raise HTTPException(status_code=502,
                            detail=_graph_detail(data, "Could not create template"))
    # Graph echoes back id/status/category only; the rest is what we submitted.
    return TemplateOut(
        id=data.get("id"),
        name=request.name,
        status=data.get("status"),
        category=data.get("category") or request.category,
        language=request.language,
        components=request.components,
    )


@router.delete("/whatsapp/{account_id}/templates")
async def delete_whatsapp_template(
    account_id: UUID,
    name: str,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Delete a template by name. Meta removes every language variant of it."""
    account = _whatsapp_account_or_404(db, account_id, organization)
    waba_id, access_token = _waba_credentials(db, account)

    ok, data = await graph_delete(f"{waba_id}/message_templates", access_token, {"name": name})
    # Graph reports a refused delete in the body, not the status code; treating
    # that as success would drop the row from the UI while it lives on the WABA.
    if not ok or data.get("success") is False:
        raise HTTPException(status_code=502,
                            detail=_graph_detail(data, "Could not delete template"))
    return {"status": "deleted"}

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

"""Sending on an already-connected WhatsApp number: templates and outbound
conversations.

Separate from meta.py, which onboards accounts. These routes are inbox work
done by support agents on a live number, not org-admin onboarding, and they are
the only ones that care about WhatsApp Business Accounts and templates. They
mount under the same /meta prefix, so the URLs are unchanged.
"""

from urllib.parse import urlencode
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.channels.accounts import get_org_account_or_404
from app.channels import get_adapter
from app.channels.meta_base import fetch_message_templates, graph_detail, graph_get
from app.core.auth import (
    INBOX_PERMISSIONS,
    get_current_organization,
    require_any_permission,
    require_permissions,
)
from app.database import get_db
from app.models.channels import ChannelType
from app.models.organization import Organization
from app.models.schemas.channel import (
    OutboundConversationOut,
    OutboundConversationRequest,
    TemplateLibraryOut,
    TemplateOut,
    TemplateSendRequest,
)
from app.models.user import User
from app.repositories.channels import ChannelAccountRepository, ChannelConversationRepository
from app.services.whatsapp_outbound import OutboundError, start_outbound_conversation

router = APIRouter()

# Meta's own template authoring UI, which is where we send people to write one.
TEMPLATE_LIBRARY_URL = "https://business.facebook.com/latest/whatsapp_manager/template_library"

# Template sending is inbox work — reopening a window, starting a conversation
# — done by support agents, not org admins. INBOX_PERMISSIONS is shared with
# the People page so the two surfaces can't disagree about who works the inbox.
require_inbox_agent = require_any_permission(*INBOX_PERMISSIONS)


def _whatsapp_account_or_404(db: Session, account_id: UUID, organization: Organization):
    account = get_org_account_or_404(db, account_id, organization)
    if account.channel_type != ChannelType.WHATSAPP.value:
        raise HTTPException(status_code=404, detail="Channel account not found")
    return account


async def _fetch_all_templates(waba_id: str, access_token: str) -> list[TemplateOut]:
    """Every template on the WABA (transport lives in meta_base; this wrapper
    owns the HTTP error surface)."""
    ok, data = await fetch_message_templates(waba_id, access_token)
    if not ok:
        raise HTTPException(status_code=502,
                            detail=graph_detail(data, "Could not list templates"))
    return [TemplateOut(**template) for template in data]


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


@router.post("/whatsapp/{account_id}/conversations", response_model=OutboundConversationOut)
async def start_whatsapp_conversation(
    account_id: UUID,
    request: OutboundConversationRequest,
    current_user: User = Depends(require_inbox_agent),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Start a WhatsApp conversation with a phone number via an approved
    Utility/Authentication template. The thin route: policy lives in the
    service so the Phase-2 scheduler can call the same function."""
    account = _whatsapp_account_or_404(db, account_id, organization)
    try:
        session_id = await start_outbound_conversation(
            db, account,
            to=request.to,
            template_name=request.template_name,
            language=request.language,
            components=request.components,
            customer_id=request.customer_id,
            customer_name=request.customer_name,
        )
    except OutboundError as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    return OutboundConversationOut(session_id=session_id)


@router.post("/whatsapp/{account_id}/send-template")
async def send_whatsapp_template(
    account_id: UUID,
    request: TemplateSendRequest,
    current_user: User = Depends(require_inbox_agent),
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
    # Inbox-agent, not org-admin: this is what the send-template picker and the
    # New-conversation modal read. Gating it tighter than the send it feeds made
    # the loosening of those endpoints a no-op — the agent could send a template
    # but never see one to pick.
    current_user: User = Depends(require_inbox_agent),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """List the message templates on this number's WhatsApp Business Account."""
    account = _whatsapp_account_or_404(db, account_id, organization)
    waba_id, access_token = _waba_credentials(db, account)
    return await _fetch_all_templates(waba_id, access_token)


@router.get("/whatsapp/{account_id}/template-library", response_model=TemplateLibraryOut)
async def get_whatsapp_template_library(
    account_id: UUID,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Where to go to write a template: Meta's own Template Library, opened on
    this number's WhatsApp Business Account.

    Templates are not authored here. Meta's library holds ~150 pre-written,
    pre-localised utility templates plus its authentication ones, all shaped to
    pass its own review — a form of ours could only ever be a worse version of
    that, and every rule it encodes (categories, variable numbering, which
    buttons may be mixed) is Meta's to change without telling us.

    The link is built per account rather than hardcoded: business_id scopes the
    page to the right portfolio. It is best-effort — a business we cannot read
    gives a link that lands less precisely, not a dead button.
    """
    account = _whatsapp_account_or_404(db, account_id, organization)
    waba_id, access_token = _waba_credentials(db, account)

    params = {"asset_id": waba_id}
    ok, data = await graph_get(waba_id, access_token, params={"fields": "owner_business_info"})
    if ok:
        business_id = (data.get("owner_business_info") or {}).get("id")
        if business_id:
            params["business_id"] = business_id

    return TemplateLibraryOut(url=f"{TEMPLATE_LIBRARY_URL}?{urlencode(params)}")

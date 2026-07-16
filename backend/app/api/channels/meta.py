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

import secrets
from typing import Optional
from urllib.parse import urlencode
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.channels.accounts import get_org_account_or_404, to_account_out
from app.channels import get_adapter
from app.channels.meta_base import (
    exchange_signup_code,
    graph_delete,
    graph_get,
    register_phone_number,
    subscribe_app,
)
from app.core.auth import get_current_organization, require_permissions
from app.core.config import settings
from app.database import get_db
from app.models.channels import ChannelType
from app.models.organization import Organization
from app.models.schemas.channel import (
    ChannelAccountOut,
    EmbeddedSignupConfigOut,
    EmbeddedSignupRequest,
    WhatsAppConnectRequest,
    MessengerConnectRequest,
    InstagramConnectRequest,
    TemplateLibraryOut,
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
# Meta's own template authoring UI, which is where we send people to write one.
TEMPLATE_LIBRARY_URL = "https://business.facebook.com/latest/whatsapp_manager/template_library"


def _whatsapp_display_name(profile: dict, phone_number_id: str) -> str:
    """How a connected number is labelled in the UI, from its Graph profile."""
    return (f"{profile.get('verified_name', 'WhatsApp')} "
            f"({profile.get('display_phone_number', phone_number_id)})")


async def _verify_signup_assets(waba_id: str, phone_number_id: str, access_token: str) -> dict:
    """Prove the exchanged token really owns the number being claimed, and
    return that number's profile.

    The code only proves the caller completed *a* signup — waba_id and
    phone_number_id arrive in the request body and are entirely caller
    controlled. Without this, an org could pair a genuine code from a throwaway
    WABA with someone else's phone number id: webhook routing resolves accounts
    by phone number id alone, with no org scoping, so their inbound messages
    would land in the attacker's inbox. Listing the WABA's numbers with the
    token checks both ids at once.
    """
    ok, data = await graph_get(f"{waba_id}/phone_numbers", access_token,
                               params={"fields": "id,display_phone_number,verified_name"})
    if not ok:
        raise HTTPException(
            status_code=400,
            detail=_graph_detail(data, "Could not read that WhatsApp Business Account"))

    numbers = data.get("data")
    if not isinstance(numbers, list):
        raise HTTPException(status_code=400, detail="Unexpected response from Meta")

    for number in numbers:
        if str(number.get("id")) == phone_number_id:
            return number
    raise HTTPException(status_code=400,
                        detail="That number is not on this WhatsApp Business Account")


def _generate_verification_pin() -> str:
    """A fresh two-step-verification PIN for a number we register.

    The customer never types it — it exists only so the number can be
    registered — so it is random rather than chosen, and kept for re-registers.
    """
    return f"{secrets.randbelow(1_000_000):06d}"


def _embedded_signup_available() -> bool:
    """Whether this deployment can offer Embedded Signup at all.

    It onboards a customer's number under *our* approved Meta app, so without a
    config id it structurally cannot work — a self-hoster has no such app and
    gets the manual credentials form instead. That is the whole gate: like every
    other integration, Embedded Signup is not restricted by plan.
    """
    return bool(settings.META_CONFIG_ID)


def check_embedded_signup_access() -> None:
    if not _embedded_signup_available():
        raise HTTPException(
            status_code=403,
            detail="WhatsApp Embedded Signup is not configured on this deployment. "
                   "Connect your number with its credentials instead.",
        )


def _graph_detail(data: dict, fallback: str) -> str:
    """Meta's own error text where it has one, so the UI can show the real
    reason (e.g. a template that cannot be deleted) rather than a generic
    failure.

    error_user_msg first: `message` is often a generic OAuth string that says
    nothing actionable — Graph will pair a `message` of "Application does not
    have permission for this action" with an error_user_msg that names the
    actual asset and rule. Only one of those is a clue.
    """
    error = data.get("error", {})
    if not isinstance(error, dict):
        return fallback
    return error.get("error_user_msg") or error.get("message") or fallback


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
        # Merge rather than replace: a reconnect that omits an optional field
        # must not silently drop it. Someone reconnecting without re-entering
        # their WABA id would otherwise lose template management, and the
        # signup PIN cannot be read back from Meta at all.
        merged = {**repo.get_credentials(existing),
                  **{k: v for k, v in credentials.items() if v is not None}}
        repo.update_credentials(existing, merged)
        return repo.set_active(existing, True)
    return repo.create_account(
        organization_id=organization.id,
        channel_type=channel_type,
        external_account_id=external_account_id,
        credentials=credentials,
        display_name=display_name,
    )


@router.get("/embedded-signup-config", response_model=EmbeddedSignupConfigOut)
async def get_embedded_signup_config(
    current_user: User = Depends(require_permissions("manage_organization")),
):
    """What the connect UI needs to decide between Embedded Signup and the
    manual credentials form. The app id is returned here rather than baked into
    the frontend build, so a self-hoster can point at their own app."""
    enabled = _embedded_signup_available()
    return EmbeddedSignupConfigOut(
        enabled=enabled,
        config_id=settings.META_CONFIG_ID if enabled else None,
        app_id=settings.META_APP_ID if enabled else None,
        graph_version=settings.META_GRAPH_VERSION,
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

    display = request.display_name or _whatsapp_display_name(data, request.phone_number_id)
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


@router.post("/whatsapp/embedded-signup", response_model=ChannelAccountOut)
async def connect_whatsapp_embedded_signup(
    request: EmbeddedSignupRequest,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Finish an Embedded Signup flow: trade the code for the customer's
    business token and connect the number it created.

    Only the way the credentials are obtained differs from connect_whatsapp —
    everything after that is the same upsert and webhook subscribe.
    """
    check_embedded_signup_access()

    ok, data = await exchange_signup_code(request.code)
    access_token = data.get("access_token") if ok else None
    if not access_token:
        # The code is short-lived (~10 minutes) and single-use, so a stale or
        # replayed one lands here rather than on a Graph error later.
        raise HTTPException(
            status_code=400,
            detail=_graph_detail(data, "Could not complete signup — please try connecting again"),
        )

    profile = await _verify_signup_assets(
        request.waba_id, request.phone_number_id, access_token)

    # A number from Embedded Signup is attached to the WABA but cannot send
    # until it is registered for Cloud API use.
    pin = _generate_verification_pin()
    registered, register_data = await register_phone_number(
        request.phone_number_id, access_token, pin)
    if not registered:
        logger.warning(
            f"Phone {request.phone_number_id} not registered after signup: "
            f"{_graph_detail(register_data, 'unknown error')}")

    credentials = {"access_token": access_token, "waba_id": request.waba_id}
    # Only keep the PIN we actually set on the number. Storing one from a failed
    # register would overwrite a working PIN with a value Meta never accepted —
    # and Meta cannot read it back, so the real one would be unrecoverable.
    if registered:
        credentials["verification_pin"] = pin

    account = _upsert_account(
        db, organization, ChannelType.WHATSAPP.value,
        external_account_id=request.phone_number_id,
        credentials=credentials,
        display_name=request.display_name or _whatsapp_display_name(
            profile, request.phone_number_id),
    )
    if not await subscribe_app(request.waba_id, access_token):
        logger.warning(f"WABA subscribe failed for {request.waba_id} after Embedded Signup")
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

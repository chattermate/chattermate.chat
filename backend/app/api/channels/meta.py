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

import json
import secrets
import time
from urllib.parse import urlencode
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.channels.accounts import get_org_account_or_404, to_account_out
from app.channels import get_adapter
from app.channels.meta_base import (
    debug_token,
    exchange_for_long_lived_token,
    exchange_signup_code,
    fetch_message_templates,
    graph_get,
    graph_list_all,
    register_phone_number,
    subscribe_app,
)
from app.core.security import decrypt_api_key, encrypt_api_key
from app.core.auth import (
    INBOX_PERMISSIONS,
    get_current_organization,
    get_current_user,
    require_any_permission,
    require_permissions,
)
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
    MessengerSignupConnectRequest,
    MessengerSignupPagesOut,
    MessengerSignupRequest,
    MessengerPageOut,
    InstagramConnectRequest,
    OutboundConversationOut,
    OutboundConversationRequest,
    TemplateLibraryOut,
    TemplateOut,
    TemplateSendRequest,
)
from app.models.user import User
from app.repositories.channels import ChannelAccountRepository, ChannelConversationRepository
from app.services.whatsapp_outbound import OutboundError, start_outbound_conversation
from app.core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

# Meta's own template authoring UI, which is where we send people to write one.
TEMPLATE_LIBRARY_URL = "https://business.facebook.com/latest/whatsapp_manager/template_library"


def _whatsapp_display_name(profile: dict, phone_number_id: str) -> str:
    """How a connected number is labelled in the UI, from its Graph profile."""
    return (f"{profile.get('verified_name', 'WhatsApp')} "
            f"({profile.get('display_phone_number', phone_number_id)})")


async def _page_name(page_id: str, access_token: str) -> str:
    """The Page's name for the UI label, falling back to its id.

    Reading it needs pages_read_engagement, which messaging does not require —
    so a token without it still connects and simply shows the id.
    """
    ok, data = await graph_get(page_id, access_token, params={"fields": "name"})
    if not ok or not data.get("name"):
        logger.info(f"No name for page {page_id} (pages_read_engagement not granted); "
                    f"labelling with the id")
        return page_id
    return data["name"]


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


# Channels that can be onboarded through a Meta login popup, each with the Meta
# configuration that drives it. Messenger and Instagram DM both ride on a Page's
# token, so one Facebook Login for Business configuration serves both.
SIGNUP_CHANNELS = (
    ChannelType.WHATSAPP.value,
    ChannelType.MESSENGER.value,
    ChannelType.INSTAGRAM.value,
)

# Webhook fields a Page must subscribe our app to for Messenger to work.
MESSENGER_SUBSCRIBED_FIELDS = "messages,messaging_postbacks"


def _signup_config_id(channel: str) -> str:
    """The Meta configuration id that onboards this channel, read at call time so
    a settings override (tests, reloads) is always seen."""
    return {
        ChannelType.WHATSAPP.value: settings.META_CONFIG_ID,
        ChannelType.MESSENGER.value: settings.META_MESSENGER_CONFIG_ID,
        ChannelType.INSTAGRAM.value: settings.META_MESSENGER_CONFIG_ID,
    }.get(channel, "")


def _signup_available(channel: str) -> bool:
    """Whether this deployment can offer the login flow for this channel.

    Onboarding happens under *our* approved Meta app, so without a config id it
    structurally cannot work — a self-hoster has no such app and gets the manual
    credentials form instead. That is the whole gate: like every other
    integration, signup is not restricted by plan.
    """
    return bool(_signup_config_id(channel))


def check_signup_access(channel: str) -> None:
    if not _signup_available(channel):
        raise HTTPException(
            status_code=403,
            detail="Signup is not configured on this deployment for this channel. "
                   "Connect with credentials instead.",
        )


# The signup code is single-use and lives ~10 minutes; the sealed page list it
# produces should not outlive it, so a stale one fails cleanly with a retry.
SIGNUP_TOKEN_TTL_SECONDS = 600
# 500 Pages; an agency ceiling, not a limit a real customer reaches.
PAGE_LIST_MAX_PAGES = 5


def _seal_signup_pages(organization_id, pages: list[dict]) -> str:
    """Carry a signup's Page tokens through the picker without the browser ever
    holding them in the clear.

    The tokens go back to the client as ciphertext only we can open, so step 2
    needs no server-side session — which matters because the two requests are
    not guaranteed to hit the same worker. Binding the org and an expiry inside
    means a leaked blob cannot be replayed by another tenant, or after the
    signup's own code would already have died.
    """
    payload = {
        "org": str(organization_id),
        "exp": int(time.time()) + SIGNUP_TOKEN_TTL_SECONDS,
        "pages": pages,
    }
    return encrypt_api_key(json.dumps(payload))


def _open_signup_pages(signup_token: str, organization: Organization) -> list[dict]:
    """The sealed page list, or 400 if it is forged, expired or another org's.

    One generic message across every reject path, so it is not an oracle for
    which check tripped.
    """
    invalid = HTTPException(status_code=400,
                            detail="That signup has expired — please connect again")
    try:
        # decrypt raises ValueError on a bad token; json.loads raises
        # JSONDecodeError, a ValueError subclass — one except covers both.
        payload = json.loads(decrypt_api_key(signup_token))
    except ValueError:
        raise invalid
    if not isinstance(payload, dict) or payload.get("org") != str(organization.id):
        raise invalid
    if float(payload.get("exp", 0)) <= time.time():
        raise invalid
    pages = payload.get("pages")
    if not isinstance(pages, list):
        raise invalid
    return pages


async def _list_manageable_pages(user_token: str, fields: str) -> list[dict]:
    """The Pages this signup granted us, each with its own Page access token."""
    ok, data = await graph_list_all(
        "me/accounts", user_token, {"fields": fields, "limit": 100},
        max_pages=PAGE_LIST_MAX_PAGES)
    if not ok:
        raise HTTPException(
            status_code=400,
            detail=_graph_detail(data, "Could not list your Facebook Pages"))
    return data


async def _signup_user_token(request: MessengerSignupRequest) -> str:
    """Trade a Login-for-Business code for a long-lived user token.

    Shared by the Messenger and Instagram flows — everything up to listing the
    customer's Pages is identical. Page tokens inherit the user token's lifetime,
    so it is extended first (best-effort; a failure only risks earlier expiry).
    """
    ok, data = await exchange_signup_code(request.code, redirect_uri=request.redirect_uri)
    user_token = data.get("access_token") if ok else None
    if not user_token:
        # The code is short-lived (~10 minutes) and single-use, so a stale or
        # replayed one lands here rather than on a Graph error later.
        raise HTTPException(status_code=400, detail=_graph_detail(
            data, "Could not complete signup — please try connecting again"))

    ok, extended = await exchange_for_long_lived_token(user_token)
    if ok and extended.get("access_token"):
        return extended["access_token"]
    logger.warning("Could not extend the signup token; page tokens may expire early")
    return user_token


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


# Template sending is inbox work — reopening a window, starting a conversation
# — done by support agents, not org admins. INBOX_PERMISSIONS is shared with
# the People page so the two surfaces can't disagree about who works the inbox.
require_inbox_agent = require_any_permission(*INBOX_PERMISSIONS)


async def _fetch_all_templates(waba_id: str, access_token: str) -> list[TemplateOut]:
    """Every template on the WABA (transport lives in meta_base; this wrapper
    owns the HTTP error surface)."""
    ok, data = await fetch_message_templates(waba_id, access_token)
    if not ok:
        raise HTTPException(status_code=502,
                            detail=_graph_detail(data, "Could not list templates"))
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
    channel: str = ChannelType.WHATSAPP.value,
    current_user: User = Depends(require_permissions("manage_organization")),
):
    """What the connect UI needs to decide between a Meta login flow and the
    manual credentials form, for the given channel. The app id is returned here
    rather than baked into the frontend build, so a self-hoster can point at
    their own app. A disabled channel returns no ids, so one channel's config
    never leaks on another's request."""
    if channel not in SIGNUP_CHANNELS:
        raise HTTPException(status_code=404, detail="No signup flow for this channel")
    enabled = _signup_available(channel)
    return EmbeddedSignupConfigOut(
        enabled=enabled,
        config_id=_signup_config_id(channel) if enabled else None,
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
    check_signup_access(ChannelType.WHATSAPP.value)

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
    # Inspect the token rather than reading the Page node: `me?fields=id,name`
    # needs pages_read_engagement, which a messaging token has no reason to
    # carry — it would reject a token that sends perfectly well.
    ok, info = await debug_token(request.page_access_token)
    if not ok or not info.get("is_valid"):
        raise HTTPException(status_code=400, detail=_graph_detail(
            info, "That token is not valid — generate a fresh Page access token"))
    if info.get("type") != "PAGE":
        raise HTTPException(status_code=400, detail=(
            f"That is a {str(info.get('type', 'user')).lower()} access token, not a Page "
            f"access token. In the Meta app dashboard go to Messenger → Settings and "
            f"click Generate on the row for your Page."))
    if str(info.get("profile_id")) != request.page_id:
        raise HTTPException(status_code=400, detail=(
            f"That token is for Page {info.get('profile_id')}, not the Page ID you "
            f"entered. Webhooks are routed by Page ID, so the two must match."))

    display_name = request.display_name or await _page_name(
        request.page_id, request.page_access_token)
    account = _upsert_account(
        db, organization, ChannelType.MESSENGER.value,
        external_account_id=request.page_id,
        credentials={"access_token": request.page_access_token},
        display_name=display_name,
    )
    if not await subscribe_app(request.page_id, request.page_access_token,
                               subscribed_fields=MESSENGER_SUBSCRIBED_FIELDS):
        logger.warning(f"Page subscribe failed for {request.page_id}; webhook may need manual subscription")
    return to_account_out(db, account)


@router.post("/messenger/signup/pages", response_model=MessengerSignupPagesOut)
async def list_messenger_signup_pages(
    request: MessengerSignupRequest,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
):
    """Step 1 of Facebook Login for Business: trade the code for the customer's
    Pages so they can pick which to connect.

    The Page tokens are sealed into signup_token and never reach the browser;
    only the ids and names come back for the picker.
    """
    check_signup_access(ChannelType.MESSENGER.value)
    user_token = await _signup_user_token(request)

    pages = await _list_manageable_pages(user_token, "id,name,access_token")
    if not pages:
        raise HTTPException(status_code=400, detail=(
            "No Facebook Pages were shared with ChatterMate. Run the connect "
            "again and tick the Page you want to use."))

    return MessengerSignupPagesOut(
        signup_token=_seal_signup_pages(organization.id, pages),
        pages=[MessengerPageOut(id=p["id"], name=p.get("name") or p["id"]) for p in pages],
    )


@router.post("/messenger/signup/connect", response_model=ChannelAccountOut)
async def connect_messenger_signup(
    request: MessengerSignupConnectRequest,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Step 2: connect the Page the customer picked in step 1.

    page_id is a selector into the list we fetched ourselves, never a caller
    claim: the token stored is the one /me/accounts returned for that Page, so a
    caller cannot connect a Page they do not administer. This is the Messenger
    equivalent of _verify_signup_assets, and matters for the same reason —
    webhooks resolve accounts by external id with no org scoping.
    """
    check_signup_access(ChannelType.MESSENGER.value)
    pages = _open_signup_pages(request.signup_token, organization)

    page = next((p for p in pages if p.get("id") == request.page_id), None)
    if page is None or not page.get("access_token"):
        raise HTTPException(status_code=400, detail="That Page was not part of this signup")

    account = _upsert_account(
        db, organization, ChannelType.MESSENGER.value,
        external_account_id=page["id"],
        credentials={"access_token": page["access_token"]},
        display_name=request.display_name or page.get("name") or page["id"],
    )
    if not await subscribe_app(page["id"], page["access_token"],
                               subscribed_fields=MESSENGER_SUBSCRIBED_FIELDS):
        logger.warning(f"Page subscribe failed for {page['id']} after signup")
    return to_account_out(db, account)


# A Page carries its linked Instagram professional account inline, so one
# /me/accounts call lists both the Page tokens and the IG ids to connect.
INSTAGRAM_PAGE_FIELDS = "id,name,access_token,instagram_business_account{id,username}"


@router.post("/instagram/signup/pages", response_model=MessengerSignupPagesOut)
async def list_instagram_signup_pages(
    request: MessengerSignupRequest,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
):
    """Step 1 for Instagram: same Login-for-Business popup as Messenger, but the
    picker offers the Instagram account linked to each Page, not the Page."""
    check_signup_access(ChannelType.INSTAGRAM.value)
    user_token = await _signup_user_token(request)

    pages = await _list_manageable_pages(user_token, INSTAGRAM_PAGE_FIELDS)
    # Only Pages with a linked professional account can receive Instagram DMs.
    ig_pages = [p for p in pages if p.get("instagram_business_account")]
    if not ig_pages:
        raise HTTPException(status_code=400, detail=(
            "None of your Facebook Pages has an Instagram professional account "
            "linked. Link one in the Page's settings, then connect again."))

    return MessengerSignupPagesOut(
        signup_token=_seal_signup_pages(organization.id, ig_pages),
        pages=[MessengerPageOut(
            id=p["id"],
            name="@" + (p["instagram_business_account"].get("username") or p["id"]),
        ) for p in ig_pages],
    )


@router.post("/instagram/signup/connect", response_model=ChannelAccountOut)
async def connect_instagram_signup(
    request: MessengerSignupConnectRequest,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Step 2 for Instagram: connect the account the customer picked.

    page_id selects a Page out of the list we fetched; the account stored is its
    linked Instagram business account, keyed by that account's own id (webhooks
    route Instagram events by it), with the Page token that sends its DMs.
    """
    check_signup_access(ChannelType.INSTAGRAM.value)
    pages = _open_signup_pages(request.signup_token, organization)

    page = next((p for p in pages if p.get("id") == request.page_id), None)
    if page is None or not page.get("access_token"):
        raise HTTPException(status_code=400, detail="That account was not part of this signup")

    ig = page.get("instagram_business_account") or {}
    ig_id = ig.get("id")
    if not ig_id:
        raise HTTPException(status_code=400, detail="That Page has no linked Instagram account")

    account = _upsert_account(
        db, organization, ChannelType.INSTAGRAM.value,
        external_account_id=str(ig_id),
        credentials={"access_token": page["access_token"]},
        display_name=request.display_name or ("@" + (ig.get("username") or str(ig_id))),
    )
    # Instagram DMs are delivered through the linked Page's app subscription.
    if not await subscribe_app(page["id"], page["access_token"],
                               subscribed_fields=MESSENGER_SUBSCRIBED_FIELDS):
        logger.warning(f"Page subscribe failed for {page['id']} after Instagram signup")
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
